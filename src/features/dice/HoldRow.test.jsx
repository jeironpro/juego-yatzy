import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HoldRow from './HoldRow.jsx';

const baseProps = {
    dice: [1, 2, 3, 4, 5],
    held: [false, false, false, false, false],
    onToggleHold: () => {},
    disabled: false,
};

describe('HoldRow', () => {
    it('muestra una estrella por cada dado con su valor', () => {
        render(<HoldRow {...baseProps} />);
        expect(screen.getByRole('button', { name: 'Dado 1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Dado 5' })).toBeInTheDocument();
    });

    it('marca los dados seleccionados para conservar', () => {
        render(<HoldRow {...baseProps} held={[true, false, false, false, false]} />);
        expect(
            screen.getByRole('button', { name: 'Dado 1, marcado para conservar' }),
        ).toHaveAttribute('aria-pressed', 'true');
    });

    it('llama a onToggleHold con el índice al pulsar una estrella', async () => {
        const user = userEvent.setup();
        const onToggleHold = vi.fn();
        render(<HoldRow {...baseProps} onToggleHold={onToggleHold} />);
        await user.click(screen.getByRole('button', { name: 'Dado 3' }));
        expect(onToggleHold).toHaveBeenCalledWith(2);
    });

    it('deshabilita las estrellas cuando corresponde', () => {
        render(<HoldRow {...baseProps} disabled />);
        expect(screen.getByRole('button', { name: 'Dado 1' })).toBeDisabled();
    });
});
