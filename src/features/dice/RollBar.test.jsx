import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RollBar from './RollBar.jsx';

const baseProps = {
  rollNumber: 1,
  maxRolls: 3,
  onRoll: () => {},
  disabled: false,
};

describe('RollBar', () => {
  it('muestra el texto GIRA y los tres círculos numerados', () => {
    const { container } = render(<RollBar {...baseProps} />);
    expect(screen.getByRole('button', { name: 'GIRA' })).toBeInTheDocument();
    expect(container.textContent).toContain('1');
    expect(container.textContent).toContain('2');
    expect(container.textContent).toContain('3');
  });

  it('resalta el lanzamiento actual del turno', () => {
    const { container } = render(<RollBar {...baseProps} rollNumber={2} />);
    const circles = container.querySelectorAll('.roll-bar__circle');
    expect(circles[1].className).toContain('roll-bar__circle--active');
  });

  it('llama a onRoll al pulsar la barra', async () => {
    const user = userEvent.setup();
    const onRoll = vi.fn();
    render(<RollBar {...baseProps} onRoll={onRoll} />);
    await user.click(screen.getByRole('button', { name: 'GIRA' }));
    expect(onRoll).toHaveBeenCalledTimes(1);
  });

  it('se deshabilita cuando no se puede lanzar', () => {
    render(<RollBar {...baseProps} disabled />);
    expect(screen.getByRole('button', { name: 'GIRA' })).toBeDisabled();
  });
});
