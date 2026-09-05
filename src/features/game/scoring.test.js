import { describe, it, expect } from 'vitest';
import {
    CATEGORY_CHANCE,
    CATEGORY_FOUR_OF_A_KIND,
    CATEGORY_FOURS,
    CATEGORY_FIVES,
    CATEGORY_FULL_HOUSE,
    CATEGORY_LARGE_STRAIGHT,
    CATEGORY_ONES,
    CATEGORY_SIXES,
    CATEGORY_SMALL_STRAIGHT,
    CATEGORY_THREE_OF_A_KIND,
    CATEGORY_THREES,
    CATEGORY_TWOS,
    CATEGORY_YATZY,
    FULL_HOUSE_SCORE,
    LARGE_STRAIGHT_SCORE,
    SMALL_STRAIGHT_SCORE,
    YATZY_SCORE,
    BONUS_SCORE,
    BONUS_THRESHOLD,
    UPPER_CATEGORIES,
    LOWER_CATEGORIES,
} from './constants.js';
import {
    computeBonus,
    computeCategoryScores,
    computeLowerSum,
    computeTotalScore,
    computeUpperSum,
    scoreCategory,
    sumByFace,
    sumDice,
} from './scoring.js';

describe('sumDice', () => {
    it('suma todos los valores de la tirada', () => {
        expect(sumDice([1, 2, 3, 4, 5])).toBe(15);
        expect(sumDice([6, 6, 6, 6, 6])).toBe(30);
    });
});

describe('sumByFace', () => {
    it('suma solo los dados que muestran la cara indicada', () => {
        expect(sumByFace([1, 1, 3, 1, 6], 1)).toBe(3);
        expect(sumByFace([2, 3, 4, 5, 6], 1)).toBe(0);
    });
});

describe('scoreCategory — sección superior', () => {
    const dice = [3, 3, 4, 5, 3];
    it('anota la suma de cada cara del 1 al 6', () => {
        expect(scoreCategory(dice, CATEGORY_ONES)).toBe(0);
        expect(scoreCategory(dice, CATEGORY_TWOS)).toBe(0);
        expect(scoreCategory(dice, CATEGORY_THREES)).toBe(9);
        expect(scoreCategory(dice, CATEGORY_FOURS)).toBe(4);
        expect(scoreCategory(dice, CATEGORY_SIXES)).toBe(0);
    });
});

describe('scoreCategory — sección inferior', () => {
    it('trío: suma todo si hay al menos tres iguales, si no 0', () => {
        expect(scoreCategory([3, 3, 3, 5, 2], CATEGORY_THREE_OF_A_KIND)).toBe(16);
        expect(scoreCategory([1, 2, 3, 4, 5], CATEGORY_THREE_OF_A_KIND)).toBe(0);
    });

    it('póker: suma todo si hay al menos cuatro iguales, si no 0', () => {
        expect(scoreCategory([4, 4, 4, 4, 1], CATEGORY_FOUR_OF_A_KIND)).toBe(17);
        expect(scoreCategory([4, 4, 4, 1, 2], CATEGORY_FOUR_OF_A_KIND)).toBe(0);
    });

    it('full house: puntuación fija solo con trío + pareja', () => {
        expect(scoreCategory([2, 2, 5, 5, 5], CATEGORY_FULL_HOUSE)).toBe(FULL_HOUSE_SCORE);
        expect(scoreCategory([2, 2, 5, 5, 1], CATEGORY_FULL_HOUSE)).toBe(0);
        expect(scoreCategory([5, 5, 5, 5, 5], CATEGORY_FULL_HOUSE)).toBe(0);
    });

    it('escalera pequeña: puntuación fija con cuatro consecutivos', () => {
        expect(scoreCategory([1, 2, 3, 4, 6], CATEGORY_SMALL_STRAIGHT)).toBe(SMALL_STRAIGHT_SCORE);
        expect(scoreCategory([3, 4, 5, 6, 1], CATEGORY_SMALL_STRAIGHT)).toBe(SMALL_STRAIGHT_SCORE);
        expect(scoreCategory([1, 2, 3, 5, 6], CATEGORY_SMALL_STRAIGHT)).toBe(0);
    });

    it('escalera grande: puntuación fija con cinco consecutivos', () => {
        expect(scoreCategory([1, 2, 3, 4, 5], CATEGORY_LARGE_STRAIGHT)).toBe(LARGE_STRAIGHT_SCORE);
        expect(scoreCategory([2, 3, 4, 5, 6], CATEGORY_LARGE_STRAIGHT)).toBe(LARGE_STRAIGHT_SCORE);
        expect(scoreCategory([1, 2, 3, 4, 6], CATEGORY_LARGE_STRAIGHT)).toBe(0);
    });

    it('yatzy: puntuación fija solo con cinco iguales', () => {
        expect(scoreCategory([6, 6, 6, 6, 6], CATEGORY_YATZY)).toBe(YATZY_SCORE);
        expect(scoreCategory([6, 6, 6, 6, 5], CATEGORY_YATZY)).toBe(0);
    });

    it('oportunidad: suma siempre todos los dados', () => {
        expect(scoreCategory([1, 2, 3, 4, 6], CATEGORY_CHANCE)).toBe(16);
    });
});

describe('computeCategoryScores', () => {
    it('calcula el valor en todas las categorías', () => {
        const scores = computeCategoryScores([5, 5, 5, 5, 5]);
        expect(scores[CATEGORY_FIVES]).toBe(25);
        expect(scores[CATEGORY_YATZY]).toBe(YATZY_SCORE);
        expect(scores[CATEGORY_FULL_HOUSE]).toBe(0);
    });
});

describe('bonus y totales', () => {
    function filledScores(upperValues, lowerValues) {
        return {
            ...Object.fromEntries(
                UPPER_CATEGORIES.map((category, index) => [category, upperValues[index]]),
            ),
            ...Object.fromEntries(
                LOWER_CATEGORIES.map((category, index) => [category, lowerValues[index]]),
            ),
        };
    }

    it('suma la sección superior', () => {
        const scores = filledScores([3, 6, 9, 12, 15, 18], [0, 0, 0, 0, 0, 0, 0]);
        expect(computeUpperSum(scores)).toBe(BONUS_THRESHOLD);
    });

    it('otorga bonus solo al alcanzar el umbral de 63', () => {
        expect(computeBonus(62)).toBe(0);
        expect(computeBonus(BONUS_THRESHOLD)).toBe(BONUS_SCORE);
        expect(computeBonus(70)).toBe(BONUS_SCORE);
    });

    it('suma la sección inferior', () => {
        const scores = filledScores([0, 0, 0, 0, 0, 0], [10, 0, FULL_HOUSE_SCORE, 0, 0, 0, 0]);
        expect(computeLowerSum(scores)).toBe(10 + FULL_HOUSE_SCORE);
    });

    it('calcula el total: superior + bonus + inferior', () => {
        const scores = filledScores(
            [3, 6, 9, 12, 15, 18],
            [10, 20, FULL_HOUSE_SCORE, SMALL_STRAIGHT_SCORE, LARGE_STRAIGHT_SCORE, 0, 11],
        );
        expect(computeTotalScore(scores)).toBe(
            BONUS_THRESHOLD +
                BONUS_SCORE +
                10 +
                20 +
                FULL_HOUSE_SCORE +
                SMALL_STRAIGHT_SCORE +
                LARGE_STRAIGHT_SCORE +
                11,
        );
    });

    it('no otorga bonus si la suma superior no llega a 63', () => {
        const scores = filledScores([1, 2, 3, 4, 5, 6], [0, 0, 0, 0, 0, 0, 0]);
        expect(computeUpperSum(scores)).toBe(21);
        expect(computeTotalScore(scores)).toBe(21);
    });
});
