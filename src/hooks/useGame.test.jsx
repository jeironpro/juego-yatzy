import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CATEGORY_SIXES, PLAYER_1, PLAYER_2 } from '@/features/game/constants.js';
import { useGame } from './useGame.js';

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lanza, marca y anota durante el turno del jugador', () => {
    const { result } = renderHook(() => useGame({}));
    act(() => result.current.roll(() => 0.99));
    expect(result.current.game.dice).toEqual([6, 6, 6, 6, 6]);
    expect(result.current.game.rollNumber).toBe(1);

    act(() => result.current.toggleHoldMark(0));
    expect(result.current.game.held[0]).toBe(true);

    act(() => result.current.score(CATEGORY_SIXES));
    expect(result.current.game.scores[PLAYER_1][CATEGORY_SIXES]).toBe(30);
    expect(result.current.game.turn).toBe(PLAYER_2);
  });

  it('el bot completa su turno de forma automática', () => {
    const { result } = renderHook(() => useGame({ botDifficulty: 'medio' }));
    // el jugador 1 lanza y anota para pasar el turno al bot
    act(() => result.current.roll(() => 0.99));
    act(() => result.current.score(CATEGORY_SIXES));
    expect(result.current.game.turn).toBe(PLAYER_2);

    // avanza el tiempo paso a paso: cada acción del bot reprograma la siguiente
    for (let step = 0; step < 4; step += 1) {
      act(() => {
        vi.advanceTimersByTime(1100);
      });
    }
    expect(result.current.game.turn).toBe(PLAYER_1);
    const botScored = Object.values(result.current.game.scores[PLAYER_2]).some(
      (value) => value !== null,
    );
    expect(botScored).toBe(true);
  });

  it('reinicia la partida', () => {
    const { result } = renderHook(() => useGame({}));
    act(() => result.current.roll(() => 0.99));
    act(() => result.current.score(CATEGORY_SIXES));
    act(() => result.current.restart());
    expect(result.current.game.turn).toBe(PLAYER_1);
    expect(result.current.game.rollNumber).toBe(0);
    expect(result.current.game.dice).toEqual([]);
  });
});
