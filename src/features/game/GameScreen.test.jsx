import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_SIXES, PLAYER_2 } from '@/features/game/constants.js';
import { createGame, rollDiceInGame } from '@/features/game/game.js';
import GameScreen from './GameScreen.jsx';

// Partida en el turno del jugador 1 con todos los dados en seis
const game = rollDiceInGame(createGame(), () => 0.99);

const baseProps = {
  game,
  onRoll: () => {},
  onToggleDie: () => {},
  onScore: () => {},
  onRestart: () => {},
  onMenu: () => {},
  player1Name: 'TÚ',
  player2Name: 'BOT',
  badge: 'Difícil',
  botMode: true,
};

describe('GameScreen', () => {
  it('muestra el marcador, el tablero y la fila de dados', () => {
    render(<GameScreen {...baseProps} />);
    expect(screen.getByLabelText('Marcador de la partida')).toBeInTheDocument();
    expect(screen.getByLabelText('Tablero de puntuaciones')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GIRA y 3 dados (1, 2 , 3)' })).toBeInTheDocument();
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
  });

  it('indica la tirada actual', () => {
    render(<GameScreen {...baseProps} />);
    expect(screen.getByText('Tirada 1 de 3')).toBeInTheDocument();
  });

  it('anota la categoría al pulsar la celda prospectiva', async () => {
    const user = userEvent.setup();
    const onScore = vi.fn();
    render(<GameScreen {...baseProps} onScore={onScore} />);
    await user.click(screen.getAllByText('30')[0]);
    expect(onScore).toHaveBeenCalledWith(CATEGORY_SIXES);
  });

  it('deshabilita el lanzamiento cuando se agotan las tiradas', () => {
    let exhausted = rollDiceInGame(game, () => 0.99);
    exhausted = rollDiceInGame(exhausted, () => 0.99);
    render(<GameScreen {...baseProps} game={exhausted} />);
    expect(screen.getByText('Elige una categoría para anotar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GIRA y 3 dados (1, 2 , 3)' })).toBeDisabled();
  });

  it('muestra el mensaje del bot cuando está pensando', () => {
    const botTurn = { ...game, turn: PLAYER_2 };
    render(<GameScreen {...baseProps} game={botTurn} />);
    expect(screen.getByText('El bot está pensando…')).toBeInTheDocument();
  });
});
