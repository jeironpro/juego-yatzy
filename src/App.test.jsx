import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App.jsx';

describe('App', () => {
  it('muestra la pantalla de inicio al cargar', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Yatzy' })).toBeInTheDocument();
    expect(screen.getByText('Elige cómo quieres jugar')).toBeInTheDocument();
  });

  it('inicia una partida contra el bot al elegir modo y pulsar jugar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /jugar vs bot/i }));
    await user.click(screen.getByRole('button', { name: 'Jugar' }));
    expect(screen.getByLabelText('Marcador de la partida')).toBeInTheDocument();
    expect(screen.getByText('TÚ')).toBeInTheDocument();
    expect(screen.getByText('BOT')).toBeInTheDocument();
  });
});
