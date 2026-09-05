import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_SIXES, PLAYER_2 } from '@/features/game/constants.js';
import { createGame, rollDiceInGame, toggleHold } from '@/features/game/game.js';
import GameScreen from './GameScreen.jsx';

// Partida en el turno del jugador 1 con todos los dados en seis
const game = rollDiceInGame(createGame(), () => 0.99);

const baseProps = {
    game,
    onRoll: () => {},
    onToggleHold: () => {},
    onScore: () => {},
    onRestart: () => {},
    onMenu: () => {},
    player1Name: 'TÚ',
    player2Name: 'BOT',
    badge: 'Difícil',
    botMode: true,
};

describe('GameScreen', () => {
    it('muestra el marcador, el tablero y la barra de lanzamiento', () => {
        render(<GameScreen {...baseProps} />);
        expect(screen.getByLabelText('Marcador de la partida')).toBeInTheDocument();
        expect(screen.getByLabelText('Tablero de puntuaciones')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'GIRA' })).toBeInTheDocument();
        expect(screen.getByText('TÚ')).toBeInTheDocument();
        expect(screen.getByText('BOT')).toBeInTheDocument();
    });

    it('indica que puede relanzar todos los dados tras la primera tirada', () => {
        render(<GameScreen {...baseProps} />);
        expect(screen.getByText('Pulsa GIRA para relanzar todos los dados')).toBeInTheDocument();
    });

    it('anota la categoría al pulsar la celda prospectiva', async () => {
        const user = userEvent.setup();
        const onScore = vi.fn();
        render(<GameScreen {...baseProps} onScore={onScore} />);
        // la celda de sixes del jugador 1 es la tercera de las prospectivas de 30
        await user.click(screen.getAllByRole('button', { name: 'Anotar 30' })[2]);
        expect(onScore).toHaveBeenCalledWith(CATEGORY_SIXES);
    });

    it('marca y desmarca un dado para conservarlo', async () => {
        const user = userEvent.setup();
        const onToggleHold = vi.fn();
        render(<GameScreen {...baseProps} onToggleHold={onToggleHold} />);
        await user.click(screen.getAllByRole('button', { name: 'Dado 6' })[0]);
        expect(onToggleHold).toHaveBeenCalledWith(0);
    });

    it('deshabilita GIRA cuando se agotan las tiradas', () => {
        let exhausted = rollDiceInGame(game, () => 0.99);
        exhausted = toggleHold(exhausted, 0);
        exhausted = rollDiceInGame(exhausted, () => 0.99);
        exhausted = toggleHold(exhausted, 0);
        exhausted = rollDiceInGame(exhausted, () => 0.99);
        render(<GameScreen {...baseProps} game={exhausted} />);
        expect(screen.getByText('Elige una categoría para anotar')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'GIRA' })).toBeDisabled();
    });

    it('permite relanzar con GIRA aunque no haya estrellas marcadas', () => {
        render(<GameScreen {...baseProps} />);
        expect(screen.getByRole('button', { name: 'GIRA' })).toBeEnabled();
    });

    it('muestra el mensaje del bot cuando está pensando', () => {
        const botTurn = { ...game, turn: PLAYER_2 };
        render(<GameScreen {...baseProps} game={botTurn} />);
        expect(screen.getByText('El bot está pensando…')).toBeInTheDocument();
    });
});
