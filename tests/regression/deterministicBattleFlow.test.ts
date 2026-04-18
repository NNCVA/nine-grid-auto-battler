import { describe, expect, it } from 'vitest';
import { createBenchmarkScenario } from '../../utils/performance/benchmarkScenario';
import { simulateDeterministicBattleFlow } from '../../hooks/gameLogic/battleProgression';
import { GameState } from '../../types';

const createBattleState = (): GameState => {
  const scenario = createBenchmarkScenario();

  return {
    phase: 'BATTLE',
    turn: scenario.initialTurn,
    units: scenario.units,
    activeUnitId: null,
    logs: scenario.logs,
    playerSpeed: scenario.playerSpeed,
    enemySpeed: scenario.enemySpeed,
    currentLevel: 1,
    maxLevel: 1,
  };
};

describe('deterministic battle flow regression', () => {
  it('replays the same multi-step battle outcome for the same scenario and randomness', () => {
    const scenario = createBenchmarkScenario();
    const initialState = createBattleState();

    const firstRun = simulateDeterministicBattleFlow({
      gameState: initialState,
      initialTurnQueue: scenario.turnOrder,
      lang: 'en',
      randomValues: [0.99, 0.5],
      maxSteps: 20,
    });

    const secondRun = simulateDeterministicBattleFlow({
      gameState: initialState,
      initialTurnQueue: scenario.turnOrder,
      lang: 'en',
      randomValues: [0.99, 0.5],
      maxSteps: 20,
    });

    expect(firstRun).toEqual(secondRun);
    expect(firstRun.phase).toBe('VICTORY');
    expect(firstRun.turn).toBeGreaterThan(initialState.turn);
    expect(firstRun.logs.length).toBeGreaterThan(initialState.logs.length);
    expect(firstRun.units.filter((unit) => unit.side === 'ENEMY' && !unit.isDead)).toHaveLength(0);
  });
});
