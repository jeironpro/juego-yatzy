import { describe, it, expect, vi } from 'vitest';
import { DICE_COUNT, DIE_FACES } from './constants.js';
import {
  countByFace,
  getRerollIndices,
  rerollDice,
  rollDie,
  rollDice,
  uniqueSortedFaces,
} from './dice.js';

describe('rollDie', () => {
  it('lanza valores entre 1 y 6', () => {
    expect(DIE_FACES).toContain(rollDie(() => 0));
    expect(DIE_FACES).toContain(rollDie(() => 0.99));
  });
});

describe('rollDice', () => {
  it('lanza la cantidad de dados indicada', () => {
    const dice = rollDice(DICE_COUNT, () => 0.5);
    expect(dice).toHaveLength(DICE_COUNT);
  });

  it('usa el generador aleatorio inyectado', () => {
    const random = vi.fn().mockReturnValue(0);
    expect(rollDice(3, random)).toEqual([1, 1, 1]);
  });
});

describe('rerollDice', () => {
  it('conserva los dados retenidos y relanza el resto', () => {
    const random = vi.fn().mockReturnValue(0.99);
    expect(rerollDice([1, 2, 3, 4, 5], [true, false, false, false, true], random)).toEqual([
      1, 6, 6, 6, 5,
    ]);
  });
});

describe('getRerollIndices', () => {
  it('devuelve los índices de los dados no retenidos', () => {
    expect(getRerollIndices([true, false, true, false, false])).toEqual([1, 3, 4]);
    expect(getRerollIndices([true, true, true, true, true])).toEqual([]);
  });
});

describe('countByFace', () => {
  it('cuenta la aparición de cada cara', () => {
    expect(countByFace([1, 1, 3, 3, 6])).toEqual({ 1: 2, 2: 0, 3: 2, 4: 0, 5: 0, 6: 1 });
  });
});

describe('uniqueSortedFaces', () => {
  it('devuelve las caras presentes ordenadas sin repetir', () => {
    expect(uniqueSortedFaces([6, 3, 1, 3, 4])).toEqual([1, 3, 4, 6]);
  });
});
