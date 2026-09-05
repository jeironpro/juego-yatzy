// Constantes del juego Yatzy: jugadores, dados, categorías y reglas de bonus

export const PLAYER_1 = 'player1';
export const PLAYER_2 = 'player2';

export const DICE_COUNT = 5;
export const DIE_FACES = [1, 2, 3, 4, 5, 6];
export const MAX_ROLLS = 3;

// Reglas del bonus superior: +35 si la suma de los dados del 1 al 6 llega a 63
export const BONUS_THRESHOLD = 63;
export const BONUS_SCORE = 35;

// Puntuaciones fijas de las categorías inferiores
export const FULL_HOUSE_SCORE = 25;
export const SMALL_STRAIGHT_SCORE = 30;
export const LARGE_STRAIGHT_SCORE = 40;
export const YATZY_SCORE = 50;

// Categorías superiores: suma de los dados que muestran la cara indicada
export const CATEGORY_ONES = 'ones';
export const CATEGORY_TWOS = 'twos';
export const CATEGORY_THREES = 'threes';
export const CATEGORY_FOURS = 'fours';
export const CATEGORY_FIVES = 'fives';
export const CATEGORY_SIXES = 'sixes';

// Categorías inferiores
export const CATEGORY_THREE_OF_A_KIND = 'threeOfAKind';
export const CATEGORY_FOUR_OF_A_KIND = 'fourOfAKind';
export const CATEGORY_FULL_HOUSE = 'fullHouse';
export const CATEGORY_SMALL_STRAIGHT = 'smallStraight';
export const CATEGORY_LARGE_STRAIGHT = 'largeStraight';
export const CATEGORY_YATZY = 'yatzy';
export const CATEGORY_CHANCE = 'chance';

export const UPPER_CATEGORIES = [
    CATEGORY_ONES,
    CATEGORY_TWOS,
    CATEGORY_THREES,
    CATEGORY_FOURS,
    CATEGORY_FIVES,
    CATEGORY_SIXES,
];

export const LOWER_CATEGORIES = [
    CATEGORY_THREE_OF_A_KIND,
    CATEGORY_FOUR_OF_A_KIND,
    CATEGORY_FULL_HOUSE,
    CATEGORY_SMALL_STRAIGHT,
    CATEGORY_LARGE_STRAIGHT,
    CATEGORY_YATZY,
    CATEGORY_CHANCE,
];

export const ALL_CATEGORIES = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES];

// Secuencias válidas para las escaleras
export const SMALL_STRAIGHT_SEQUENCES = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
];

export const LARGE_STRAIGHT_SEQUENCES = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
];
