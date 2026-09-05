import { describe, it, expect, vi } from 'vitest';
import {
  ALL_CATEGORIES,
  CATEGORY_ONES,
  CATEGORY_SIXES,
  CATEGORY_YATZY,
  DICE_COUNT,
  MAX_ROLLS,
  PLAYER_1,
  PLAYER_2,
} from './constants.js';
import {
  canRoll,
  createGame,
  getAvailableCategories,
  getPlayerTotal,
  getWinner,
  hasFilledAllCategories,
  holdIndices,
  isGameOver,
  rollDiceInGame,
  selectCategory,
  toggleHold,
} from './game.js';
import { YATZY_SCORE } from './constants.js';

describe('createGame', () => {
  it('crea una partida vacía con el turno del jugador 1', () => {
    const game = createGame();
    expect(game.turn).toBe(PLAYER_1);
    expect(game.rollNumber).toBe(0);
    expect(game.dice).toEqual([]);
    expect(game.held).toEqual([false, false, false, false, false]);
    expect(getAvailableCategories(game, PLAYER_1)).toHaveLength(ALL_CATEGORIES.length);
    expect(isGameOver(game)).toBe(false);
  });
});

describe('rollDiceInGame', () => {
  it('lanza los cinco dados en la primera tirada', () => {
    const game = rollDiceInGame(createGame(), () => 0.5);
    expect(game.dice).toHaveLength(DICE_COUNT);
    expect(game.rollNumber).toBe(1);
  });

  it('conserva los dados marcados y los mantiene marcados entre tiradas', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleHold(game, 0);
    const keptValue = game.dice[0];
    game = rollDiceInGame(game, () => 0.99);
    expect(game.dice[0]).toBe(keptValue);
    expect(game.dice[1]).toBe(6);
    expect(game.rollNumber).toBe(2);
    expect(game.held).toEqual([true, false, false, false, false]);
  });

  it('las marcas se limpian al anotar una categoría', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleHold(game, 0);
    game = rollDiceInGame(game, () => 0.99);
    game = selectCategory(game, CATEGORY_SIXES);
    expect(game.held).toEqual([false, false, false, false, false]);
  });

  it('relanza los cinco dados si no hay marcas', () => {
    const game = rollDiceInGame(createGame(), () => 0.5);
    const after = rollDiceInGame(game, () => 0.99);
    expect(after.dice).toEqual([6, 6, 6, 6, 6]);
    expect(after.rollNumber).toBe(2);
  });

  it('no permite lanzar más allá de las tres tiradas del turno', () => {
    let game = createGame();
    for (let i = 0; i < MAX_ROLLS; i += 1) {
      game = rollDiceInGame(game, () => 0.5);
      if (i < MAX_ROLLS - 1) {
        game = toggleHold(game, 0);
      }
    }
    const after = rollDiceInGame(game, () => 0.5);
    expect(after).toBe(game);
    expect(after.rollNumber).toBe(MAX_ROLLS);
    expect(canRoll(game)).toBe(false);
  });
});

describe('toggleHold', () => {
  it('alterna la marca de conservación de un dado', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleHold(game, 2);
    expect(game.held[2]).toBe(true);
    game = toggleHold(game, 2);
    expect(game.held[2]).toBe(false);
  });

  it('ignora índices fuera de rango o sin dados lanzados', () => {
    const empty = createGame();
    expect(toggleHold(empty, 0)).toBe(empty);
    const game = rollDiceInGame(createGame(), () => 0.5);
    expect(toggleHold(game, 99).held).toEqual(game.held);
  });
});

describe('holdIndices', () => {
  it('marca solo los índices indicados y limpia las marcas previas', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleHold(game, 0);
    game = holdIndices(game, [2, 4]);
    expect(game.held).toEqual([false, false, true, false, true]);
  });

  it('ignora índices fuera de rango y no marca sin dados lanzados', () => {
    const empty = createGame();
    expect(holdIndices(empty, [0])).toBe(empty);
    const game = rollDiceInGame(createGame(), () => 0.5);
    expect(holdIndices(game, [99]).held).toEqual([false, false, false, false, false]);
  });
});

describe('selectCategory', () => {
  it('anota la categoría, resetea la tirada y pasa el turno', () => {
    const random = vi.fn().mockReturnValue(0.99);
    let game = rollDiceInGame(createGame(), random);
    const dice = game.dice;
    game = selectCategory(game, CATEGORY_SIXES);
    expect(game.scores[PLAYER_1][CATEGORY_SIXES]).toBe(
      dice.filter((value) => value === 6).length * 6,
    );
    expect(game.turn).toBe(PLAYER_2);
    expect(game.dice).toEqual([]);
    expect(game.rollNumber).toBe(0);
  });

  it('no permite anotar dos veces la misma categoría', () => {
    let game = rollDiceInGame(createGame(), () => 0.99);
    game = selectCategory(game, CATEGORY_SIXES);
    const before = game;
    game = selectCategory(game, CATEGORY_SIXES);
    expect(game).toBe(before);
  });

  it('no permite anotar sin dados lanzados', () => {
    const game = createGame();
    expect(selectCategory(game, CATEGORY_ONES)).toBe(game);
  });
});

describe('flujo completo de la partida', () => {
  it('alterna turnos hasta completar las 13 categorías de cada jugador', () => {
    let game = createGame();
    let round = 0;
    while (!isGameOver(game) && round < 100) {
      game = rollDiceInGame(game, () => 0.5);
      game = selectCategory(game, ALL_CATEGORIES[round % ALL_CATEGORIES.length]);
      round += 1;
    }
    expect(isGameOver(game)).toBe(true);
    expect(hasFilledAllCategories(game, PLAYER_1)).toBe(true);
    expect(hasFilledAllCategories(game, PLAYER_2)).toBe(true);
  });

  it('determina el ganador por puntuación total y permite el empate', () => {
    let game = createGame();
    let round = 0;
    while (!isGameOver(game)) {
      game = rollDiceInGame(game, () => 0.5);
      game = selectCategory(game, ALL_CATEGORIES[round % ALL_CATEGORIES.length]);
      round += 1;
    }
    // misma secuencia de dados para ambos: empate perfecto
    expect(getWinner(game)).toBeNull();
    expect(getPlayerTotal(game, PLAYER_1)).toBe(getPlayerTotal(game, PLAYER_2));
  });
});

describe('yatzy máximo', () => {
  it('suma 50 en yatzy y resetea correctamente el turno', () => {
    const random = vi.fn().mockReturnValue(0);
    let game = rollDiceInGame(createGame(), random);
    game = selectCategory(game, CATEGORY_YATZY);
    expect(game.scores[PLAYER_1][CATEGORY_YATZY]).toBe(YATZY_SCORE);
    expect(game.turn).toBe(PLAYER_2);
  });
});
