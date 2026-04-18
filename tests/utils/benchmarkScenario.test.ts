import { describe, expect, it } from 'vitest';
import {
  createBenchmarkScenario,
  runDeterministicBattleTurn,
} from '../../utils/performance/benchmarkScenario';

describe('benchmarkScenario', () => {
  it('builds a stable battle setup for benchmark runs', () => {
    const firstScenario = createBenchmarkScenario();
    const secondScenario = createBenchmarkScenario();

    expect(firstScenario).toEqual(secondScenario);
    expect(firstScenario.units).toHaveLength(4);
    expect(firstScenario.playerSpeed).toBeGreaterThan(0);
    expect(firstScenario.enemySpeed).toBeGreaterThan(0);
    expect(firstScenario.turnOrder).toHaveLength(4);
  });

  it('runs a repeatable deterministic battle turn without UI state', () => {
    const firstTurn = runDeterministicBattleTurn();
    const secondTurn = runDeterministicBattleTurn();

    expect(firstTurn).toEqual(secondTurn);
    expect(firstTurn.attackerId).toBe('PLAYER_FRONT');
    expect(firstTurn.targetId).toBe('ENEMY_FRONT');
    expect(firstTurn.result.damage).toBeGreaterThan(0);
    expect(firstTurn.nextUnits.find((unit) => unit.id === firstTurn.targetId)?.stats.hp).toBeLessThan(
      1350,
    );
  });
});
