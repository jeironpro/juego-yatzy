import { ALL_CATEGORIES, DICE_COUNT, MAX_ROLLS, PLAYER_1, PLAYER_2 } from './constants.js';
import { rollDice, rerollDice } from './dice.js';
import { scoreCategory, computeTotalScore } from './scoring.js';

// Crea las puntuaciones vacías de un jugador: todas las categorías sin rellenar
function createEmptyScores() {
  return Object.fromEntries(ALL_CATEGORIES.map((category) => [category, null]));
}

// Crea una partida nueva: turno del jugador 1, sin dados lanzados aún
export function createGame() {
  return {
    turn: PLAYER_1,
    rollNumber: 0,
    dice: [],
    held: Array(DICE_COUNT).fill(false),
    scores: {
      [PLAYER_1]: createEmptyScores(),
      [PLAYER_2]: createEmptyScores(),
    },
  };
}

// Verifica si el jugador indicado ya rellenó todas sus categorías
export function hasFilledAllCategories(game, player) {
  return ALL_CATEGORIES.every((category) => game.scores[player][category] !== null);
}

// La partida termina cuando ambos jugadores rellenaron sus 13 categorías
export function isGameOver(game) {
  return hasFilledAllCategories(game, PLAYER_1) && hasFilledAllCategories(game, PLAYER_2);
}

// Devuelve el ganador, o null si hay empate; requiere partida terminada
export function getWinner(game) {
  const total1 = computeTotalScore(game.scores[PLAYER_1]);
  const total2 = computeTotalScore(game.scores[PLAYER_2]);
  if (total1 === total2) return null;
  return total1 > total2 ? PLAYER_1 : PLAYER_2;
}

// Puntuación total acumulada de un jugador
export function getPlayerTotal(game, player) {
  return computeTotalScore(game.scores[player]);
}

// Categorías que aún puede rellenar el jugador indicado
export function getAvailableCategories(game, player) {
  return ALL_CATEGORIES.filter((category) => game.scores[player][category] === null);
}

// Indica si el jugador en turno puede volver a lanzar los dados
export function canRoll(game) {
  return !isGameOver(game) && game.rollNumber < MAX_ROLLS;
}

// Lanza los dados del turno: primera tirada completa, siguientes conservando los retenidos
export function rollDiceInGame(game, random = Math.random) {
  if (game.rollNumber >= MAX_ROLLS) return game;
  const firstRoll = game.rollNumber === 0;
  const held = firstRoll ? Array(DICE_COUNT).fill(false) : game.held;
  const dice = firstRoll ? rollDice(DICE_COUNT, random) : rerollDice(game.dice, held, random);
  return {
    ...game,
    dice,
    held,
    rollNumber: game.rollNumber + 1,
  };
}

// Marca o desmarca un dado como retenido (solo durante la fase de lanzamiento)
export function toggleHold(game, index) {
  if (game.dice.length === 0 || game.rollNumber >= MAX_ROLLS) return game;
  if (index < 0 || index >= DICE_COUNT) return game;
  const held = [...game.held];
  held[index] = !held[index];
  return { ...game, held };
}

// Anota la tirada actual en la categoría elegida y pasa el turno
export function selectCategory(game, category, player = game.turn) {
  if (game.dice.length === 0 || game.scores[player][category] !== null) return game;

  const scores = {
    ...game.scores,
    [player]: {
      ...game.scores[player],
      [category]: scoreCategory(game.dice, category),
    },
  };

  // Al terminar el turno se resetea la tirada y se alterna el jugador
  const nextTurn = player === PLAYER_1 ? PLAYER_2 : PLAYER_1;
  return {
    ...game,
    scores,
    turn: nextTurn,
    rollNumber: 0,
    dice: [],
    held: Array(DICE_COUNT).fill(false),
  };
}
