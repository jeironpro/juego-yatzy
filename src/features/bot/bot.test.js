import { describe, it, expect, vi } from 'vitest';
import {
    CATEGORY_CHANCE,
    CATEGORY_FOUR_OF_A_KIND,
    CATEGORY_FULL_HOUSE,
    CATEGORY_THREE_OF_A_KIND,
    CATEGORY_LARGE_STRAIGHT,
    CATEGORY_ONES,
    CATEGORY_SMALL_STRAIGHT,
    CATEGORY_SIXES,
    CATEGORY_YATZY,
    YATZY_SCORE,
    LARGE_STRAIGHT_SCORE,
    SMALL_STRAIGHT_SCORE,
    FULL_HOUSE_SCORE,
} from '@/features/game/constants.js';
import { scoreCategory } from '@/features/game/scoring.js';
import { chooseCategory, chooseDiceToKeep } from './bot.js';

describe('chooseCategory', () => {
    it('elige la categoría con mejor puntuación inmediata', () => {
        const categories = [CATEGORY_ONES, CATEGORY_SIXES, CATEGORY_CHANCE];
        expect(chooseCategory([6, 6, 6, 6, 6], categories, 0, 'medium')).toBe(CATEGORY_SIXES);
    });

    it('elige yatzy cuando está disponible', () => {
        expect(chooseCategory([5, 5, 5, 5, 5], [CATEGORY_YATZY, CATEGORY_ONES], 0, 'medium')).toBe(
            CATEGORY_YATZY,
        );
    });

    it('prioriza escalera grande sobre pequeña con cinco consecutivos', () => {
        const categories = [CATEGORY_SMALL_STRAIGHT, CATEGORY_LARGE_STRAIGHT];
        expect(chooseCategory([1, 2, 3, 4, 5], categories, 0, 'medium')).toBe(
            CATEGORY_LARGE_STRAIGHT,
        );
    });

    it('valora más las categorías superiores mientras el bonus es alcanzable', () => {
        // 4 + 4 + 4 + 4 = 16; 6 + 6 + 6 + 6 = 24 en sixes; ones da 0
        const categories = [CATEGORY_ONES, CATEGORY_SIXES, CATEGORY_CHANCE];
        expect(chooseCategory([1, 6, 6, 6, 6], categories, 20, 'medium')).toBe(CATEGORY_SIXES);
    });

    it('el nivel fácil a veces elige una categoría al azar', () => {
        const random = vi.fn().mockReturnValue(0);
        const available = [CATEGORY_ONES, CATEGORY_CHANCE];
        expect(chooseCategory([1, 1, 1, 1, 1], available, 0, 'easy', random)).toBe(CATEGORY_ONES);
        // con la segunda llamada del aleatorio elige categoría aleatoria (índice 0 de nuevo)
        expect(available).toContain(chooseCategory([1, 1, 1, 1, 1], available, 0, 'easy', random));
    });

    it('no elige categorías que no estén disponibles', () => {
        const categories = [CATEGORY_CHANCE];
        expect(chooseCategory([1, 2, 3, 4, 5], categories, 0, 'medium')).toBe(CATEGORY_CHANCE);
    });
});

describe('chooseDiceToKeep — voraz', () => {
    it('conserva los dados de la cara que persigue en la sección superior', () => {
        const dice = [6, 3, 6, 4, 6];
        const keep = chooseDiceToKeep(dice, [CATEGORY_SIXES, CATEGORY_CHANCE], 0, 'medium');
        expect(keep).toEqual([0, 2, 4]);
    });

    it('conserva la cara mayoritaria para yatzy', () => {
        const dice = [4, 4, 4, 2, 1];
        const keep = chooseDiceToKeep(dice, [CATEGORY_YATZY, CATEGORY_CHANCE], 0, 'medium');
        expect(keep).toEqual([0, 1, 2]);
    });

    it('conserva las dos caras más frecuentes para full house', () => {
        const dice = [3, 3, 3, 5, 5];
        const keep = chooseDiceToKeep(dice, [CATEGORY_FULL_HOUSE, CATEGORY_CHANCE], 0, 'medium');
        expect(keep).toEqual([0, 1, 2, 3, 4]);
    });

    it('conserva los valores altos para oportunidad', () => {
        const dice = [1, 2, 6, 5, 3];
        const keep = chooseDiceToKeep(dice, [CATEGORY_CHANCE], 0, 'medium');
        expect(keep).toEqual([2, 3]);
    });
});

describe('chooseDiceToKeep — valor esperado (difícil)', () => {
    it('conserva el yatzy completo para no romperlo', () => {
        const dice = [6, 6, 6, 6, 6];
        const keep = chooseDiceToKeep(
            dice,
            [CATEGORY_YATZY, CATEGORY_SIXES, CATEGORY_CHANCE],
            0,
            'hard',
        );
        expect(keep).toEqual([0, 1, 2, 3, 4]);
    });

    it('conserva la escalera grande completa cuando ya está formada', () => {
        const dice = [1, 2, 3, 4, 5];
        const keep = chooseDiceToKeep(
            dice,
            [CATEGORY_LARGE_STRAIGHT, CATEGORY_SMALL_STRAIGHT, CATEGORY_CHANCE],
            0,
            'hard',
        );
        expect(keep).toHaveLength(5);
    });

    it('conserva los tres iguales altos para mantener el trío', () => {
        const dice = [6, 6, 6, 1, 2];
        const keep = chooseDiceToKeep(dice, [CATEGORY_THREE_OF_A_KIND, CATEGORY_CHANCE], 0, 'hard');
        expect(keep).toEqual([0, 1, 2]);
    });

    it('persigue la escalera grande conservando los cuatro consecutivos', () => {
        const dice = [1, 2, 3, 4, 6];
        const keep = chooseDiceToKeep(
            dice,
            [CATEGORY_LARGE_STRAIGHT, CATEGORY_SMALL_STRAIGHT, CATEGORY_CHANCE],
            0,
            'hard',
            1,
        );
        expect(keep).toEqual([0, 1, 2, 3]);
    });

    it('equilibra combinaciones y oportunidad con dos tiradas por delante', () => {
        // conservar los dos seises maximiza el valor esperado: opción de trío alto,
        // póker y oportunidad, frente a fijar el trío de treses
        const dice = [3, 3, 3, 6, 6];
        const keep = chooseDiceToKeep(
            dice,
            [CATEGORY_FOUR_OF_A_KIND, CATEGORY_THREE_OF_A_KIND, CATEGORY_CHANCE],
            0,
            'hard',
            1,
        );
        expect(keep).toEqual([3, 4]);
    });

    it('no rompe un full house ya conseguido', () => {
        const dice = [3, 3, 3, 5, 5];
        const keep = chooseDiceToKeep(dice, [CATEGORY_FULL_HOUSE, CATEGORY_CHANCE], 0, 'hard', 1);
        expect(keep).toEqual([0, 1, 2, 3, 4]);
    });
});

describe('estrategia del bot en partidas simuladas', () => {
    it('elige full house con la tirada exacta', () => {
        const dice = [2, 2, 5, 5, 5];
        const category = chooseCategory(
            dice,
            [CATEGORY_FULL_HOUSE, CATEGORY_CHANCE, CATEGORY_ONES],
            0,
            'hard',
        );
        expect(category).toBe(CATEGORY_FULL_HOUSE);
        expect(scoreFor(dice, category)).toBe(FULL_HOUSE_SCORE);
    });

    it('elige la escalera pequeña con cuatro consecutivos', () => {
        const dice = [1, 2, 3, 4, 6];
        const category = chooseCategory(
            dice,
            [CATEGORY_SMALL_STRAIGHT, CATEGORY_CHANCE],
            0,
            'hard',
        );
        expect(category).toBe(CATEGORY_SMALL_STRAIGHT);
        expect(scoreFor(dice, category)).toBe(SMALL_STRAIGHT_SCORE);
    });

    it('prefiere la escalera grande de 40 sobre la pequeña de 30', () => {
        const dice = [2, 3, 4, 5, 6];
        const category = chooseCategory(
            dice,
            [CATEGORY_SMALL_STRAIGHT, CATEGORY_LARGE_STRAIGHT, CATEGORY_CHANCE],
            0,
            'hard',
        );
        expect(category).toBe(CATEGORY_LARGE_STRAIGHT);
        expect(scoreFor(dice, category)).toBe(LARGE_STRAIGHT_SCORE);
    });

    it('anota 50 puntos con un yatzy', () => {
        const dice = [6, 6, 6, 6, 6];
        const category = chooseCategory(dice, [CATEGORY_YATZY, CATEGORY_CHANCE], 0, 'hard');
        expect(category).toBe(CATEGORY_YATZY);
        expect(scoreFor(dice, category)).toBe(YATZY_SCORE);
    });

    it('descarta antes la categoría más difícil cuando todo puntúa cero', () => {
        // 1,1,2,2,3 no forma ninguna combinación disponible
        const dice = [1, 1, 2, 2, 3];
        const category = chooseCategory(
            dice,
            [
                CATEGORY_SMALL_STRAIGHT,
                CATEGORY_FULL_HOUSE,
                CATEGORY_THREE_OF_A_KIND,
                CATEGORY_YATZY,
            ],
            0,
            'hard',
        );
        expect(category).toBe(CATEGORY_YATZY);
    });
});

describe('rendimiento de la búsqueda de valor esperado', () => {
    it('decide en el nivel difícil con anticipación en pocos milisegundos', () => {
        const dice = [3, 3, 3, 5, 2];
        const categories = [
            CATEGORY_YATZY,
            CATEGORY_FOUR_OF_A_KIND,
            CATEGORY_THREE_OF_A_KIND,
            CATEGORY_LARGE_STRAIGHT,
            CATEGORY_SMALL_STRAIGHT,
            CATEGORY_CHANCE,
        ];
        const start = performance.now();
        for (let i = 0; i < 10; i += 1) {
            chooseDiceToKeep(dice, categories, 0, 'hard', 1);
        }
        const elapsed = performance.now() - start;
        // margen amplio para entornos lentos de CI; en desarrollo ronda los 20ms
        expect(elapsed / 10).toBeLessThan(250);
    });
});

// Puntuación esperada de la categoría elegida, para verificar coherencia con el motor
function scoreFor(dice, category) {
    return scoreCategory(dice, category);
}
