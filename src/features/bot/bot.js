import {
  BONUS_SCORE,
  BONUS_THRESHOLD,
  CATEGORY_CHANCE,
  CATEGORY_FOUR_OF_A_KIND,
  CATEGORY_FULL_HOUSE,
  CATEGORY_LARGE_STRAIGHT,
  CATEGORY_SMALL_STRAIGHT,
  CATEGORY_THREE_OF_A_KIND,
  CATEGORY_YATZY,
  DIE_FACES,
  LARGE_STRAIGHT_SEQUENCES,
  SMALL_STRAIGHT_SEQUENCES,
  UPPER_CATEGORIES,
} from '@/features/game/constants.js';
import { countByFace, uniqueSortedFaces } from '@/features/game/dice.js';
import { computeCategoryScores, scoreCategory } from '@/features/game/scoring.js';
import { DEFAULT_DIFFICULTY } from './difficulty.js';

// Cara que persigue cada categoría superior (ones -> 1, sixes -> 6)
const FACE_FOR_CATEGORY = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};

// Fracción de puntos extra que vale cada punto de la sección superior mientras
// el bonus de 63 sigue siendo alcanzable (35 puntos de bonus / 63 de umbral)
const UPPER_BONUS_RATE = BONUS_SCORE / BONUS_THRESHOLD;

// Probabilidades de jugada aleatoria en el nivel fácil
const EASY_RANDOM_CATEGORY_CHANCE = 0.25;
const EASY_RANDOM_KEEP_CHANCE = 0.3;

// Ajusta el valor de una categoría superior: cada punto vale un poco más
// mientras la suma acumulada aún pueda alcanzar el umbral del bonus
function adjustedScore(score, category, upperSum) {
  if (score <= 0 || !UPPER_CATEGORIES.includes(category) || upperSum >= BONUS_THRESHOLD) {
    return score;
  }
  return score * (1 + UPPER_BONUS_RATE);
}

// Elige la categoría que más conviene anotar con la tirada actual
export function chooseCategory(
  dice,
  availableCategories,
  upperSum,
  difficulty = DEFAULT_DIFFICULTY,
  random = Math.random,
) {
  // Nivel fácil: a veces anota una categoría al azar
  if (difficulty === 'facil' && random() < EASY_RANDOM_CATEGORY_CHANCE) {
    return availableCategories[Math.floor(random() * availableCategories.length)];
  }

  const scored = availableCategories.map((category) => ({
    category,
    score: adjustedScore(scoreCategory(dice, category), category, upperSum),
  }));
  const bestScore = Math.max(...scored.map((entry) => entry.score));
  const bestCategories = scored.filter((entry) => entry.score === bestScore);
  return bestCategories[Math.floor(random() * bestCategories.length)].category;
}

// Caras más frecuentes de la tirada, ordenadas de mayor a menor presencia
function majorityFaces(dice, count) {
  return Object.entries(countByFace(dice))
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([face]) => Number(face));
}

// Secuencia de escalera con más coincidencias con la tirada actual
function bestMatchingSequence(dice, sequences) {
  const unique = uniqueSortedFaces(dice);
  let best = sequences[0];
  let bestMatches = -1;
  for (const sequence of sequences) {
    const matches = sequence.filter((face) => unique.includes(face)).length;
    if (matches > bestMatches) {
      bestMatches = matches;
      best = sequence;
    }
  }
  return best;
}

// Bonificación de apoyo: cuánto se acerca la tirada actual a completar una
// categoría de combinación (tríos, escaleras, full house) aunque aún no puntúe
function supportBonus(dice, category) {
  const counts = countByFace(dice);
  const presentFaces = Object.values(counts).filter((count) => count > 0);
  const maxCount = Math.max(...Object.values(counts));
  switch (category) {
    case CATEGORY_YATZY:
    case CATEGORY_FOUR_OF_A_KIND:
    case CATEGORY_THREE_OF_A_KIND:
      return maxCount >= 3 ? maxCount * 10 : 0;
    case CATEGORY_FULL_HOUSE:
      return presentFaces.length <= 2 ? 15 : 0;
    case CATEGORY_SMALL_STRAIGHT:
      return bestMatchingSequence(dice, SMALL_STRAIGHT_SEQUENCES).length * 10;
    case CATEGORY_LARGE_STRAIGHT:
      return bestMatchingSequence(dice, LARGE_STRAIGHT_SEQUENCES).length * 10;
    default:
      return 0;
  }
}

// Objetivo voraz: categoría con mejor puntuación ajustada más apoyo de la tirada.
// Si la tirada ya completa la categoría (puntúa), no se suma apoyo para no
// perseguir otra combinación rompiendo una ya conseguida
function greedyTarget(dice, availableCategories, upperSum) {
  let best = availableCategories[0];
  let bestValue = -Infinity;
  for (const category of availableCategories) {
    const score = scoreCategory(dice, category);
    const value =
      adjustedScore(score, category, upperSum) + (score > 0 ? 0 : supportBonus(dice, category));
    if (value > bestValue) {
      bestValue = value;
      best = category;
    }
  }
  return best;
}

// Índices que conviene conservar según el objetivo inmediato (heurística voraz)
function greedyKeepIndices(dice, availableCategories, upperSum) {
  const target = greedyTarget(dice, availableCategories, upperSum);
  let keepFaces = [];

  if (UPPER_CATEGORIES.includes(target)) {
    keepFaces = [FACE_FOR_CATEGORY[target]];
  } else {
    switch (target) {
      case CATEGORY_THREE_OF_A_KIND:
      case CATEGORY_FOUR_OF_A_KIND:
      case CATEGORY_YATZY:
        // se persigue la cara mayoritaria para acumular tríos/póker/yatzy
        keepFaces = majorityFaces(dice, 1);
        break;
      case CATEGORY_FULL_HOUSE:
        // se conservan las dos caras más frecuentes (trío + pareja)
        keepFaces = majorityFaces(dice, 2);
        break;
      case CATEGORY_SMALL_STRAIGHT:
        keepFaces = bestMatchingSequence(dice, SMALL_STRAIGHT_SEQUENCES);
        break;
      case CATEGORY_LARGE_STRAIGHT:
        keepFaces = bestMatchingSequence(dice, LARGE_STRAIGHT_SEQUENCES);
        break;
      case CATEGORY_CHANCE:
      default:
        // en oportunidad se conservan los valores altos
        keepFaces = [5, 6];
        break;
    }
  }

  return dice
    .map((value, index) => (keepFaces.includes(value) ? index : null))
    .filter((index) => index !== null);
}

// Genera todas las combinaciones posibles al relanzar count dados
function* generateRerolls(count) {
  if (count === 0) {
    yield [];
    return;
  }
  for (const face of DIE_FACES) {
    for (const rest of generateRerolls(count - 1)) {
      yield [face, ...rest];
    }
  }
}

// Mejor puntuación ajustada de una tirada entre las categorías disponibles;
// las puntuaciones se cachean por combinación de dados
function bestAdjustedScore(dice, availableCategories, upperSum, scoresCache) {
  const key = [...dice].sort((a, b) => a - b).join(',');
  if (!scoresCache.has(key)) {
    scoresCache.set(key, computeCategoryScores(dice));
  }
  const scores = scoresCache.get(key);
  return Math.max(
    ...availableCategories.map((category) => adjustedScore(scores[category], category, upperSum)),
  );
}

// Valor esperado de conservar un subconjunto de dados: media del mejor ajustado
// sobre todas las tiradas posibles de los dados restantes
function expectedValueOfKeep(dice, keptIndices, availableCategories, upperSum, scoresCache) {
  const keptDice = keptIndices.map((index) => dice[index]);
  const rerollCount = dice.length - keptDice.length;
  let total = 0;
  let outcomes = 0;
  for (const rerolled of generateRerolls(rerollCount)) {
    total += bestAdjustedScore(
      [...keptDice, ...rerolled],
      availableCategories,
      upperSum,
      scoresCache,
    );
    outcomes += 1;
  }
  return total / outcomes;
}

// Todos los subconjuntos de índices posibles (2^n combinaciones)
function allKeepSubsets(length) {
  const subsets = [];
  for (let mask = 0; mask < 2 ** length; mask += 1) {
    const indices = [];
    for (let index = 0; index < length; index += 1) {
      if (mask & (1 << index)) indices.push(index);
    }
    subsets.push(indices);
  }
  return subsets;
}

// Elige el subconjunto de dados a conservar maximizando el valor esperado;
// ante empate prefiere conservar más dados
function expectedValueKeepIndices(dice, availableCategories, upperSum) {
  const scoresCache = new Map();
  let best = [];
  let bestExpectedValue = -Infinity;
  for (const subset of allKeepSubsets(dice.length)) {
    const expectedValue = expectedValueOfKeep(
      dice,
      subset,
      availableCategories,
      upperSum,
      scoresCache,
    );
    if (
      expectedValue > bestExpectedValue ||
      (expectedValue === bestExpectedValue && subset.length > best.length)
    ) {
      bestExpectedValue = expectedValue;
      best = subset;
    }
  }
  return best;
}

// Decide qué dados conservar antes del siguiente lanzamiento según la dificultad
export function chooseDiceToKeep(
  dice,
  availableCategories,
  upperSum,
  difficulty = DEFAULT_DIFFICULTY,
  random = Math.random,
) {
  // Nivel difícil: búsqueda de valor esperado sobre todos los subconjuntos
  if (difficulty === 'dificil') {
    return expectedValueKeepIndices(dice, availableCategories, upperSum);
  }

  const greedy = greedyKeepIndices(dice, availableCategories, upperSum);

  // Nivel fácil: a veces conserva un único dado al azar
  if (difficulty === 'facil' && random() < EASY_RANDOM_KEEP_CHANCE) {
    return [Math.floor(random() * dice.length)];
  }

  return greedy;
}
