import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_SIXES, PLAYER_2 } from '@/features/game/constants.js';
import { createGame, rollDiceInGame, toggleReroll } from '@/features/game/game.js';
import GameScreen from './GameScreen.jsx';

// Partida en el turno del jugador 1 con todos los dados en seis
const game = rollDiceInGame(createGame(), () => 0.99);

const baseProps = {
  game,
  onRoll: () => {},
  onToggleReroll: () => {},
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

  it('indica cómo marcar las estrellas tras la primera tirada', () => {
    render(<GameScreen {...baseProps} />);
    expect(screen.getByText('Marca las estrellas para relanzar')).toBeInTheDocument();
  });

  it('anota la categoría al pulsar la celda prospectiva', async () => {
    const user = userEvent.setup();
    const onScore = vi.fn();
    render(<GameScreen {...baseProps} onScore={onScore} />);
    // la celda de sixes del jugador 1 es la tercera de las prospectivas de 30
    await user.click(screen.getAllByRole('button', { name: 'Anotar 30' })[2]);
    expect(onScore).toHaveBeenCalledWith(CATEGORY_SIXES);
  });

  it('marca y desmarca un dado para relanzarlo', async () => {
    const user = userEvent.setup();
    const onToggleReroll = vi.fn();
    render(<GameScreen {...baseProps} onToggleReroll={onToggleReroll} />);
    await user.click(screen.getAllByRole('button', { name: 'Dado 6' })[0]);
    expect(onToggleReroll).toHaveBeenCalledWith(0);
  });

  it('deshabilita GIRA cuando se agotan las tiradas', () => {
    let exhausted = rollDiceInGame(game, () => 0.99);
    exhausted = toggleReroll(exhausted, 0);
    exhausted = rollDiceInGame(exhausted, () => 0.99);
    exhausted = toggleReroll(exhausted, 0);
    exhausted = rollDiceInGame(exhausted, () => 0.99);
    render(<GameScreen {...baseProps} game={exhausted} />);
    expect(screen.getByText('Elige una categoría para anotar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GIRA' })).toBeDisabled();
  });

  it('deshabilita GIRA si no hay estrellas marcadas tras la primera tirada', () => {
    render(<GameScreen {...baseProps} />);
    expect(screen.getByRole('button', { name: 'GIRA' })).toBeDisabled();
  });

  it('muestra el mensaje del bot cuando está pensando', () => {
    const botTurn = { ...game, turn: PLAYER_2 };
    render(<GameScreen {...baseProps} game={botTurn} />);
    expect(screen.getByText('El bot está pensando…')).toBeInTheDocument();
  });
});
