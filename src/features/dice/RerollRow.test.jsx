import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RerollRow from './RerollRow.jsx';

const baseProps = {
  dice: [1, 2, 3, 4, 5],
  marks: [false, false, false, false, false],
  onToggleMark: () => {},
  disabled: false,
};

describe('RerollRow', () => {
  it('muestra una estrella por cada dado con su valor', () => {
    render(<RerollRow {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Dado 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dado 5' })).toBeInTheDocument();
  });

  it('marca los dados seleccionados para relanzar', () => {
    render(<RerollRow {...baseProps} marks={[true, false, false, false, false]} />);
    expect(screen.getByRole('button', { name: 'Dado 1, marcado para relanzar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('llama a onToggleMark con el índice al pulsar una estrella', async () => {
    const user = userEvent.setup();
    const onToggleMark = vi.fn();
    render(<RerollRow {...baseProps} onToggleMark={onToggleMark} />);
    await user.click(screen.getByRole('button', { name: 'Dado 3' }));
    expect(onToggleMark).toHaveBeenCalledWith(2);
  });

  it('deshabilita las estrellas cuando corresponde', () => {
    render(<RerollRow {...baseProps} disabled />);
    expect(screen.getByRole('button', { name: 'Dado 1' })).toBeDisabled();
  });
});
