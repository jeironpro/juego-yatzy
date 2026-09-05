import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_ROLLS, PLAYER_2 } from '@/features/game/constants.js';
import { chooseCategory, chooseDiceToKeep } from '@/features/bot/bot.js';
import {
    createGame,
    getAvailableCategories,
    holdIndices,
    isGameOver,
    rollDiceInGame,
    selectCategory,
    toggleHold,
} from '@/features/game/game.js';
import { computeUpperSum } from '@/features/game/scoring.js';

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
        // tiradas que quedan después del relanzamiento que se va a decidir
        const rollsLeft = MAX_ROLLS - game.rollNumber - 1;
        const keep = chooseDiceToKeep(
            game.dice,
            availableCategories,
            upperSum,
            difficulty,
            rollsLeft,
        );
        if (keep.length === game.dice.length) {
            // conserva todos los dados: no hay nada que relanzar, anota directamente
            const category = chooseCategory(game.dice, availableCategories, upperSum, difficulty);
            return selectCategory(game, category, PLAYER_2);
        }
        // fija las marcas de conservación de forma absoluta (sin acumular con
        // marcas de tiradas anteriores) y relanza los dados no conservados
        const next = holdIndices(game, keep);
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

    const toggleHoldMark = useCallback((index) => {
        setGame((current) => toggleHold(current, index));
    }, []);

    const score = useCallback((category) => {
        setGame((current) => selectCategory(current, category));
    }, []);

    const restart = useCallback(() => {
        setGame(createGame());
    }, []);

    return { game, roll, toggleHoldMark, score, restart };
}
