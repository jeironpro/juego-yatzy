import { DICE_COUNT, DIE_FACES } from './constants.js';

// Lanza un dado individual entre 1 y 6
export function rollDie(random = Math.random) {
  return DIE_FACES[Math.floor(random() * DIE_FACES.length)];
}

// Lanza los dados de la partida; acepta un generador aleatorio inyectable para tests
export function rollDice(count = DICE_COUNT, random = Math.random) {
  return Array.from({ length: count }, () => rollDie(random));
}

// Devuelve los índices de los dados no retenidos
export function getRerollIndices(held) {
  return held.map((isHeld, index) => (isHeld ? null : index)).filter((index) => index !== null);
}

// Relanza solo los dados no retenidos y conserva los que el jugador mantuvo
export function rerollDice(dice, held, random = Math.random) {
  return dice.map((value, index) => (held[index] ? value : rollDie(random)));
}

// Cuenta cuántas veces aparece cada cara en una tirada
export function countByFace(dice) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach((value) => {
    counts[value] += 1;
  });
  return counts;
}

// Caras presentes en la tirada, ordenadas de menor a mayor
export function uniqueSortedFaces(dice) {
  return [...new Set(dice)].sort((a, b) => a - b);
}
