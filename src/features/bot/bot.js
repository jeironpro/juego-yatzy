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

// Tiradas de anticipación según dificultad: fácil es voraz, medio valora solo
// la siguiente tirada (sin relanzamientos extra) y difícil además planifica el
// relanzamiento posterior cuando quedan tiradas disponibles
const LOOKAHEAD_DEPTH = {
  facil: 0,
  medio: 0,
  dificil: 2,
};

// Prioridad al descartar categorías que puntúan cero: se quema antes la más
// difícil de conseguir (yatzy, escaleras) y se reservan las superiores
const ZERO_PRIORITY = [
  CATEGORY_YATZY,
  CATEGORY_LARGE_STRAIGHT,
  CATEGORY_FULL_HOUSE,
  CATEGORY_SMALL_STRAIGHT,
  CATEGORY_FOUR_OF_A_KIND,
  CATEGORY_THREE_OF_A_KIND,
  CATEGORY_CHANCE,
  ...UPPER_CATEGORIES,
];

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

  // Con todo a cero se quema la categoría más difícil de conseguir para
  // reservar las fáciles y las superiores (que ayudan al bonus)
  if (bestScore === 0 && bestCategories.length > 1) {
    return bestCategories.sort(
      (a, b) => ZERO_PRIORITY.indexOf(a.category) - ZERO_PRIORITY.indexOf(b.category),
    )[0].category;
  }

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

// Clave canónica de una tirada (ordenada) para cachear resultados por valor
function diceKey(dice) {
  return [...dice].sort((a, b) => a - b).join(',');
}

// Genera todas las combinaciones con repetición de count caras posibles,
// en lugar de las 6^count secuencias ordenadas (mucho más rápido y suficiente
// porque el valor de una tirada no depende del orden de sus dados)
function* generateOutcomeCombinations(count) {
  function* combine(start, remaining, prefix) {
    if (remaining === 0) {
      yield [...prefix];
      return;
    }
    for (let face = start; face < DIE_FACES.length; face += 1) {
      prefix.push(DIE_FACES[face]);
      yield* combine(face, remaining - 1, prefix);
      prefix.pop();
    }
  }
  yield* combine(0, count, []);
}

// Puntuación ajustada más alta de una tirada entre las categorías disponibles;
// las puntuaciones se cachean por combinación de dados
function bestAdjustedScore(dice, availableCategories, upperSum, scoresCache) {
  const key = diceKey(dice);
  if (!scoresCache.has(key)) {
    scoresCache.set(key, computeCategoryScores(dice));
  }
  const scores = scoresCache.get(key);
  return Math.max(
    ...availableCategories.map((category) => adjustedScore(scores[category], category, upperSum)),
  );
}

// Clave de una decisión de conservación: multiconjunto de dados conservados,
// cuántos se relanzan y tiradas futuras. El valor esperado solo depende de los
// dados que se quedan, no de cuáles se descartan, así que se memoiza
function keepKey(keptDice, rerollCount, futureRolls) {
  return `${diceKey(keptDice)}|${rerollCount}|${futureRolls}`;
}

// Valor de una tirada con futureRolls relanzamientos por delante: si quedan
// tiradas, el bot puede anotar ya o conservar una parte y relanzar; si no,
// debe anotar. Se memoiza por tirada y profundidad para acotar el coste
function bestOutcomeValue(
  dice,
  futureRolls,
  availableCategories,
  upperSum,
  scoresCache,
  valueCache,
  keepCache,
) {
  if (futureRolls <= 0) {
    return bestAdjustedScore(dice, availableCategories, upperSum, scoresCache);
  }
  const key = `${diceKey(dice)}|${futureRolls}`;
  if (valueCache.has(key)) {
    return valueCache.get(key);
  }
  let best = bestAdjustedScore(dice, availableCategories, upperSum, scoresCache);
  for (const kept of allKeepSubsets(dice.length)) {
    const keptDice = kept.map((index) => dice[index]);
    const rerollCount = dice.length - kept.length;
    const value = expectedValueOfKeep(
      keptDice,
      rerollCount,
      futureRolls - 1,
      availableCategories,
      upperSum,
      scoresCache,
      valueCache,
      keepCache,
    );
    if (value > best) best = value;
  }
  valueCache.set(key, best);
  return best;
}

// Valor esperado de conservar unos dados concretos: media del valor de la
// mejor continuación sobre todas las combinaciones posibles de dados relanzados
function expectedValueOfKeep(
  keptDice,
  rerollCount,
  futureRolls,
  availableCategories,
  upperSum,
  scoresCache,
  valueCache,
  keepCache,
) {
  const key = keepKey(keptDice, rerollCount, futureRolls);
  if (keepCache.has(key)) {
    return keepCache.get(key);
  }
  let total = 0;
  let outcomes = 0;
  for (const rerolled of generateOutcomeCombinations(rerollCount)) {
    total += bestOutcomeValue(
      [...keptDice, ...rerolled],
      futureRolls,
      availableCategories,
      upperSum,
      scoresCache,
      valueCache,
      keepCache,
    );
    outcomes += 1;
  }
  const value = total / outcomes;
  keepCache.set(key, value);
  return value;
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

// Elige el subconjunto de dados a conservar maximizando el valor esperado con
// la profundidad de búsqueda indicada; ante empate prefiere conservar más dados
function expectedValueKeepIndices(
  dice,
  availableCategories,
  upperSum,
  futureRolls,
  scoresCache,
  valueCache,
  keepCache,
) {
  let best = [];
  let bestExpectedValue = -Infinity;
  for (const subset of allKeepSubsets(dice.length)) {
    const keptDice = subset.map((index) => dice[index]);
    const rerollCount = dice.length - subset.length;
    const expectedValue = expectedValueOfKeep(
      keptDice,
      rerollCount,
      futureRolls,
      availableCategories,
      upperSum,
      scoresCache,
      valueCache,
      keepCache,
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
  rollsLeft = 0,
  random = Math.random,
) {
  const depth = LOOKAHEAD_DEPTH[difficulty] ?? 1;

  // Nivel fácil: heurística voraz con alguna decisión aleatoria
  if (difficulty === 'facil') {
    const greedy = greedyKeepIndices(dice, availableCategories, upperSum);
    if (random() < EASY_RANDOM_KEEP_CHANCE) {
      return [Math.floor(random() * dice.length)];
    }
    return greedy;
  }

  // Niveles con búsqueda: se mira hacia delante tanto como la dificultad y las
  // tiradas restantes permitan
  const futureRolls = Math.min(depth, rollsLeft);
  const scoresCache = new Map();
  const valueCache = new Map();
  const keepCache = new Map();
  return expectedValueKeepIndices(
    dice,
    availableCategories,
    upperSum,
    futureRolls,
    scoresCache,
    valueCache,
    keepCache,
  );
}
