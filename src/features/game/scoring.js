import {
    ALL_CATEGORIES,
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
    LARGE_STRAIGHT_SEQUENCES,
    LOWER_CATEGORIES,
    SMALL_STRAIGHT_SCORE,
    SMALL_STRAIGHT_SEQUENCES,
    UPPER_CATEGORIES,
    YATZY_SCORE,
    BONUS_SCORE,
    BONUS_THRESHOLD,
} from './constants.js';
import { countByFace, uniqueSortedFaces } from './dice.js';

// Suma de todos los dados
export function sumDice(dice) {
    return dice.reduce((total, value) => total + value, 0);
}

// Suma de los dados que muestran una cara concreta (categorías superiores)
export function sumByFace(dice, face) {
    return dice.filter((value) => value === face).reduce((total, value) => total + value, 0);
}

// Verifica si al menos una cara aparece el número de veces indicado
function hasCountAtLeast(dice, required) {
    return Object.values(countByFace(dice)).some((count) => count >= required);
}

// Verifica si la tirada es un full house (trío + pareja, sin incluir el yatzy)
function isFullHouse(dice) {
    const counts = Object.values(countByFace(dice))
        .filter((count) => count > 0)
        .sort();
    return counts.length === 2 && counts[0] === 2 && counts[1] === 3;
}

// Verifica si la tirada contiene alguna de las secuencias indicadas
function containsSequence(dice, sequences) {
    const unique = uniqueSortedFaces(dice);
    return sequences.some((sequence) => sequence.every((face) => unique.includes(face)));
}

// Calcula el valor de una tirada en una categoría concreta
export function scoreCategory(dice, category) {
    switch (category) {
        case CATEGORY_ONES:
            return sumByFace(dice, 1);
        case CATEGORY_TWOS:
            return sumByFace(dice, 2);
        case CATEGORY_THREES:
            return sumByFace(dice, 3);
        case CATEGORY_FOURS:
            return sumByFace(dice, 4);
        case CATEGORY_FIVES:
            return sumByFace(dice, 5);
        case CATEGORY_SIXES:
            return sumByFace(dice, 6);
        case CATEGORY_THREE_OF_A_KIND:
            return hasCountAtLeast(dice, 3) ? sumDice(dice) : 0;
        case CATEGORY_FOUR_OF_A_KIND:
            return hasCountAtLeast(dice, 4) ? sumDice(dice) : 0;
        case CATEGORY_FULL_HOUSE:
            return isFullHouse(dice) ? FULL_HOUSE_SCORE : 0;
        case CATEGORY_SMALL_STRAIGHT:
            return containsSequence(dice, SMALL_STRAIGHT_SEQUENCES) ? SMALL_STRAIGHT_SCORE : 0;
        case CATEGORY_LARGE_STRAIGHT:
            return containsSequence(dice, LARGE_STRAIGHT_SEQUENCES) ? LARGE_STRAIGHT_SCORE : 0;
        case CATEGORY_YATZY:
            return hasCountAtLeast(dice, 5) ? YATZY_SCORE : 0;
        case CATEGORY_CHANCE:
            return sumDice(dice);
        default:
            return 0;
    }
}

// Calcula el valor de la tirada en todas las categorías
export function computeCategoryScores(dice) {
    return Object.fromEntries(
        ALL_CATEGORIES.map((category) => [category, scoreCategory(dice, category)]),
    );
}

// Suma de la sección superior (dados del 1 al 6)
export function computeUpperSum(scores) {
    return UPPER_CATEGORIES.reduce((total, category) => total + scores[category], 0);
}

// Bonus superior: +35 si la suma de la sección superior alcanza el umbral
export function computeBonus(upperSum) {
    return upperSum >= BONUS_THRESHOLD ? BONUS_SCORE : 0;
}

// Suma de la sección inferior
export function computeLowerSum(scores) {
    return LOWER_CATEGORIES.reduce((total, category) => total + scores[category], 0);
}

// Puntuación total de un jugador: superior + bonus + inferior
export function computeTotalScore(scores) {
    const upperSum = computeUpperSum(scores);
    return upperSum + computeBonus(upperSum) + computeLowerSum(scores);
}
