import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiceRow from './DiceRow.jsx';

const baseProps = {
  dice: [1, 2, 3, 4, 5],
  held: [false, false, false, false, false],
  onToggleDie: () => {},
  onRoll: () => {},
  rollDisabled: false,
  holdDisabled: false,
};

describe('DiceRow', () => {
  it('muestra el botón de lanzar con el texto indicado', () => {
    render(<DiceRow {...baseProps} />);
    expect(screen.getByRole('button', { name: 'GIRA y 3 dados (1, 2 , 3)' })).toBeInTheDocument();
  });

  it('muestra un dado por cada valor de la tirada', () => {
    render(<DiceRow {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Dado 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dado 5' })).toBeInTheDocument();
  });

  it('marca los dados retenidos', () => {
    render(<DiceRow {...baseProps} held={[true, false, false, false, false]} />);
    expect(screen.getByRole('button', { name: 'Dado 1, retenido' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('llama a onToggleDie con el índice al pulsar un dado', async () => {
    const user = userEvent.setup();
    const onToggleDie = vi.fn();
    render(<DiceRow {...baseProps} onToggleDie={onToggleDie} />);
    await user.click(screen.getByRole('button', { name: 'Dado 3' }));
    expect(onToggleDie).toHaveBeenCalledWith(2);
  });

  it('llama a onRoll al pulsar el botón de lanzar', async () => {
    const user = userEvent.setup();
    const onRoll = vi.fn();
    render(<DiceRow {...baseProps} onRoll={onRoll} />);
    await user.click(screen.getByRole('button', { name: 'GIRA y 3 dados (1, 2 , 3)' }));
    expect(onRoll).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el lanzamiento cuando corresponde', () => {
    render(<DiceRow {...baseProps} rollDisabled />);
    expect(screen.getByRole('button', { name: 'GIRA y 3 dados (1, 2 , 3)' })).toBeDisabled();
  });
});
