import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PLAYER_1, PLAYER_2 } from '@/features/game/constants.js';
import Scoreboard from './Scoreboard.jsx';

const baseProps = {
  player1Name: 'TÚ',
  player2Name: 'BOT',
  player1Score: 10,
  player2Score: 24,
  turn: PLAYER_1,
};

describe('Scoreboard', () => {
  it('muestra los nombres y las puntuaciones con el separador vs', () => {
    render(<Scoreboard {...baseProps} />);
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
  });

  it('resalta al jugador en turno', () => {
    render(<Scoreboard {...baseProps} turn={PLAYER_2} />);
    expect(screen.getByText('BOT').className).toContain('scoreboard__name--active');
    expect(screen.getByText('24').className).toContain('scoreboard__count--active');
  });

  it('muestra el badge de dificultad cuando se entrega', () => {
    render(<Scoreboard {...baseProps} badge="Difícil" />);
    expect(screen.getByText('Difícil')).toBeInTheDocument();
  });
});
