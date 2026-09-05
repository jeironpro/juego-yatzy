import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CATEGORY_CHANCE, CATEGORY_SIXES, PLAYER_1, PLAYER_2 } from '@/features/game/constants.js';
import { createGame, rollDiceInGame, selectCategory } from '@/features/game/game.js';
import Scorecard from './Scorecard.jsx';

// Partida con dados lanzados (todos seis) y sin categorías rellenadas
function gameWithDice() {
  return rollDiceInGame(createGame(), () => 0.99);
}

describe('Scorecard', () => {
  it('muestra las etiquetas de las secciones superior e inferior', () => {
    render(<Scorecard game={createGame()} interactable={false} onSelectCategory={() => {}} />);
    expect(screen.getByText('BONUS')).toBeInTheDocument();
    expect(screen.getByText('+35')).toBeInTheDocument();
    expect(screen.getByText('3x')).toBeInTheDocument();
    expect(screen.getByText('4x')).toBeInTheDocument();
    expect(screen.getByText('SMALL')).toBeInTheDocument();
    expect(screen.getByText('LARGE')).toBeInTheDocument();
    expect(screen.getByText('YATZY')).toBeInTheDocument();
  });

  it('muestra los círculos de bonus con el progreso 0/63', () => {
    render(<Scorecard game={createGame()} interactable={false} onSelectCategory={() => {}} />);
    expect(screen.getAllByText('0/63')).toHaveLength(2);
  });

  it('muestra el valor que se obtendría en las celdas del jugador en turno', () => {
    const game = gameWithDice();
    render(<Scorecard game={game} interactable={false} onSelectCategory={() => {}} />);
    // todos los dados valen 6: 30 en sixes, trío, póker y oportunidad del jugador 1
    expect(screen.getAllByText('30')).toHaveLength(4);
  });

  it('anota la categoría al pulsar la celda seleccionable', async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();
    const game = gameWithDice();
    render(<Scorecard game={game} interactable onSelectCategory={onSelectCategory} />);
    await user.click(screen.getAllByText('30')[0]);
    expect(onSelectCategory).toHaveBeenCalledWith(CATEGORY_SIXES);
  });

  it('muestra los valores ya anotados y deja de ofrecer la categoría', () => {
    let game = gameWithDice();
    game = selectCategory(game, CATEGORY_SIXES);
    render(<Scorecard game={game} interactable={false} onSelectCategory={() => {}} />);
    // sixes del jugador 1 anotado con 30
    expect(screen.getByText('30')).toBeInTheDocument();
    // la misma celda ya no es seleccionable: no hay botón con anotar
    expect(screen.queryByRole('button', { name: 'Anotar 30' })).not.toBeInTheDocument();
  });

  it('actualiza el círculo de bonus con la suma superior acumulada', () => {
    let game = gameWithDice();
    game = selectCategory(game, CATEGORY_SIXES);
    render(<Scorecard game={game} interactable={false} onSelectCategory={() => {}} />);
    expect(screen.getByText('30/63')).toBeInTheDocument();
    expect(screen.getByText(`0/63`)).toBeInTheDocument();
  });

  it('solo el jugador en turno tiene celdas seleccionables', () => {
    const game = gameWithDice();
    render(<Scorecard game={game} interactable onSelectCategory={() => {}} />);
    // 4 categorías prospectivas de 30 en el turno del jugador 1
    expect(screen.getAllByRole('button', { name: 'Anotar 30' })).toHaveLength(4);
    // el jugador 2 (fuera de turno) no muestra ningún 30 prospectivo
    expect(screen.getAllByText('30')).toHaveLength(4);
  });
});
