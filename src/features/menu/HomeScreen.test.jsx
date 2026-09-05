import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomeScreen from './HomeScreen.jsx';

describe('HomeScreen', () => {
  it('muestra el título y los modos de juego', () => {
    render(<HomeScreen onStart={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Yatzy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /jugar vs bot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2 jugadores/i })).toBeInTheDocument();
  });

  it('deshabilita jugar hasta elegir un modo', () => {
    render(<HomeScreen onStart={() => {}} />);
    expect(screen.getByRole('button', { name: 'Jugar' })).toBeDisabled();
  });

  it('muestra la dificultad al elegir el modo bot', async () => {
    const user = userEvent.setup();
    render(<HomeScreen onStart={() => {}} />);
    await user.click(screen.getByRole('button', { name: /jugar vs bot/i }));
    expect(screen.getByRole('group', { name: 'Dificultad del bot' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fácil' })).toBeInTheDocument();
  });

  it('inicia con el modo y la dificultad seleccionados', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<HomeScreen onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: /jugar vs bot/i }));
    await user.click(screen.getByRole('button', { name: 'Medio' }));
    await user.click(screen.getByRole('button', { name: 'Jugar' }));
    expect(onStart).toHaveBeenCalledWith('bot', 'medio');
  });

  it('inicia en modo local sin dificultad', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<HomeScreen onStart={onStart} />);
    await user.click(screen.getByRole('button', { name: /2 jugadores/i }));
    await user.click(screen.getByRole('button', { name: 'Jugar' }));
    expect(onStart).toHaveBeenCalledWith('local', 'dificil');
  });
});
