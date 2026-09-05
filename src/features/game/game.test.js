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
  isGameOver,
  rollDiceInGame,
  selectCategory,
  toggleReroll,
} from './game.js';
import { YATZY_SCORE } from './constants.js';

describe('createGame', () => {
  it('crea una partida vacía con el turno del jugador 1', () => {
    const game = createGame();
    expect(game.turn).toBe(PLAYER_1);
    expect(game.rollNumber).toBe(0);
    expect(game.dice).toEqual([]);
    expect(game.reroll).toEqual([false, false, false, false, false]);
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

  it('relanza solo los dados marcados en tiradas siguientes', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleReroll(game, 0);
    const keptValue = game.dice[1];
    game = rollDiceInGame(game, () => 0.99);
    expect(game.dice[0]).toBe(6);
    expect(game.dice[1]).toBe(keptValue);
    expect(game.rollNumber).toBe(2);
    expect(game.reroll).toEqual([false, false, false, false, false]);
  });

  it('no relanza nada si no hay dados marcados', () => {
    const game = rollDiceInGame(createGame(), () => 0.5);
    const after = rollDiceInGame(game, () => 0.99);
    expect(after).toBe(game);
  });

  it('no permite lanzar más allá de las tres tiradas del turno', () => {
    let game = createGame();
    for (let i = 0; i < MAX_ROLLS; i += 1) {
      game = rollDiceInGame(game, () => 0.5);
      if (i < MAX_ROLLS - 1) {
        game = toggleReroll(game, 0);
      }
    }
    const after = rollDiceInGame(game, () => 0.5);
    expect(after).toBe(game);
    expect(after.rollNumber).toBe(MAX_ROLLS);
    expect(canRoll(game)).toBe(false);
  });
});

describe('toggleReroll', () => {
  it('alterna la marca de relanzamiento de un dado', () => {
    let game = rollDiceInGame(createGame(), () => 0.5);
    game = toggleReroll(game, 2);
    expect(game.reroll[2]).toBe(true);
    game = toggleReroll(game, 2);
    expect(game.reroll[2]).toBe(false);
  });

  it('ignora índices fuera de rango o sin dados lanzados', () => {
    const empty = createGame();
    expect(toggleReroll(empty, 0)).toBe(empty);
    const game = rollDiceInGame(createGame(), () => 0.5);
    expect(toggleReroll(game, 99).reroll).toEqual(game.reroll);
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
