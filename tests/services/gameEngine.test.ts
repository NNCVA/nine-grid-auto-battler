import { afterEach, describe, expect, it, vi } from 'vitest';
import { createUnit } from '../../constants';
import { calculateDamage, calculateHeal, findTarget, getTurnOrder } from '../../services/gameEngine';
import { Unit } from '../../types';

const makeUnit = (
  partial: Partial<Unit>,
  side: 'PLAYER' | 'ENEMY' = 'PLAYER',
  row = 0,
  col = 0,
) =>
  createUnit(
    {
      name: partial.name ?? 'Test Unit',
      role: partial.role ?? 'WARRIOR',
      stats: {
        hp: 100,
        maxHp: 100,
        atk: 50,
        def: 10,
        speed: 50,
        critRate: 0,
        energy: 0,
        maxEnergy: 100,
        ...partial.stats,
      },
      ...partial,
    },
    side,
    row,
    col,
  );

describe('gameEngine', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps minimum damage at 1 even on the lowest variance roll', () => {
    const attacker = makeUnit({
      stats: { atk: 1, critRate: 0 },
    });
    const defender = makeUnit(
      {
        stats: { hp: 50, def: 999 },
      },
      'ENEMY',
    );

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0);

    expect(calculateDamage(attacker, defender, false).damage).toBe(1);
  });

  it('increases heal output when a support skill crits', () => {
    const healer = makeUnit({
      role: 'SUPPORT',
      stats: { atk: 100, critRate: 1 },
    });

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5);

    expect(calculateHeal(healer, true)).toMatchObject({
      damage: 360,
      isCrit: true,
      isKill: false,
    });
  });

  it('prioritizes the front-most enemy in the same row', () => {
    const attacker = makeUnit({}, 'PLAYER', 1, 2);
    const sameRowFront = makeUnit({ name: 'Front' }, 'ENEMY', 1, 0);
    const sameRowBack = makeUnit({ name: 'Back' }, 'ENEMY', 1, 2);
    const offRowEnemy = makeUnit({ name: 'Off Row' }, 'ENEMY', 0, 0);

    const target = findTarget(attacker, [attacker, sameRowBack, sameRowFront, offRowEnemy]);

    expect(target?.name).toBe('Front');
  });

  it('orders units by team priority and frontline position', () => {
    const playerFront = makeUnit({ name: 'Player Front', stats: { speed: 20 } }, 'PLAYER', 0, 2);
    const playerBack = makeUnit({ name: 'Player Back', stats: { speed: 10 } }, 'PLAYER', 1, 0);
    const enemyFront = makeUnit({ name: 'Enemy Front', stats: { speed: 15 } }, 'ENEMY', 0, 0);
    const enemyBack = makeUnit({ name: 'Enemy Back', stats: { speed: 5 } }, 'ENEMY', 2, 2);

    const queue = getTurnOrder(
      [playerBack, enemyBack, playerFront, enemyFront],
      30,
      20,
    );

    expect(queue).toEqual([
      playerFront.id,
      enemyFront.id,
      playerBack.id,
      enemyBack.id,
    ]);
  });
});
