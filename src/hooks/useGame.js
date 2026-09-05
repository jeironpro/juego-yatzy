import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_ROLLS, PLAYER_2 } from '@/features/game/constants.js';
import {
  createGame,
  getAvailableCategories,
  isGameOver,
  rollDiceInGame,
  selectCategory,
  toggleHold,
} from '@/features/game/game.js';
import { computeUpperSum } from '@/features/game/scoring.js';
import { chooseCategory, chooseDiceToKeep } from '@/features/bot/bot.js';

// Pausa entre acciones del bot para que se aprecie su turno
const BOT_STEP_DELAY_MS = 1100;

// Ejecuta el siguiente paso del turno del bot: lanzar, retener y relanzar, o anotar
function botStep(game, difficulty) {
  const availableCategories = getAvailableCategories(game, PLAYER_2);
  const upperSum = computeUpperSum(game.scores[PLAYER_2]);

  if (game.dice.length === 0) {
    // inicio del turno: primer lanzamiento
    return rollDiceInGame(game);
  }

  if (game.rollNumber < MAX_ROLLS) {
    // decide qué dados conservar y relanza el resto
    const keep = chooseDiceToKeep(game.dice, availableCategories, upperSum, difficulty);
    let next = game;
    keep.forEach((index) => {
      next = toggleHold(next, index);
    });
    return rollDiceInGame(next);
  }

  // se agotaron los tres lanzamientos: anota la mejor categoría
  const category = chooseCategory(game.dice, availableCategories, upperSum, difficulty);
  return selectCategory(game, category, PLAYER_2);
}

// Estado de la partida: lanzamiento, retención, anotación y reinicio.
// Si se pasa botDifficulty, el bot (jugador 2) responde automáticamente a cada turno
export function useGame({ botDifficulty = null } = {}) {
  const [game, setGame] = useState(() => createGame());
  const botTimerRef = useRef(null);

  useEffect(() => {
    if (botDifficulty === null || game.turn !== PLAYER_2 || isGameOver(game)) return;
    if (botTimerRef.current !== null) return;
    // se programa el siguiente paso del bot; al cambiar el estado se cancela y reprograma
    botTimerRef.current = setTimeout(() => {
      botTimerRef.current = null;
      setGame((current) => botStep(current, botDifficulty));
    }, BOT_STEP_DELAY_MS);
    return () => {
      if (botTimerRef.current !== null) {
        clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }
    };
  }, [game, botDifficulty]);

  const roll = useCallback((random = Math.random) => {
    setGame((current) => rollDiceInGame(current, random));
  }, []);

  const toggleDie = useCallback((index) => {
    setGame((current) => toggleHold(current, index));
  }, []);

  const score = useCallback((category) => {
    setGame((current) => selectCategory(current, category));
  }, []);

  const restart = useCallback(() => {
    setGame(createGame());
  }, []);

  return { game, roll, toggleDie, score, restart };
}
