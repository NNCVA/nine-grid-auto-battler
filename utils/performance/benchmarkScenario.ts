import { createUnit, MAX_ENERGY } from '../../constants';
import {
  calculateDamage,
  findTarget,
  getTeamSpeed,
  getTurnOrder,
} from '../../services/gameEngine';
import { BattleLogEntry, DamageResult, Unit } from '../../types';

export interface BenchmarkScenario {
  initialTurn: number;
  logs: BattleLogEntry[];
  playerSpeed: number;
  enemySpeed: number;
  randomValues: number[];
  turnOrder: string[];
  units: Unit[];
}

export interface DeterministicBattleTurn {
  attackerId: string;
  initialTurn: number;
  nextQueue: string[];
  nextUnits: Unit[];
  result: DamageResult;
  targetId: string;
}

const cloneValue = <T>(value: T): T => structuredClone(value) as T;

const withDeterministicRandom = <T>(values: number[], callback: () => T) => {
  const originalRandom = Math.random;
  let index = 0;

  Math.random = () => {
    const nextValue = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return nextValue;
  };

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
};

const makeBenchmarkUnit = (
  id: string,
  side: 'PLAYER' | 'ENEMY',
  row: number,
  col: number,
  template: Partial<Unit>,
) =>
  createUnit(
    {
      id,
      stats: {
        hp: 1000,
        maxHp: 1000,
        atk: 100,
        def: 20,
        speed: 50,
        critRate: 0,
        energy: 0,
        maxEnergy: MAX_ENERGY,
        ...template.stats,
      },
      ...template,
    },
    side,
    row,
    col,
  );

export const createBenchmarkScenario = (): BenchmarkScenario => {
  const units = [
    makeBenchmarkUnit('PLAYER_FRONT', 'PLAYER', 1, 2, {
      name: 'Player Front',
      role: 'WARRIOR',
      icon: 'Sword',
      description: 'Stable frontline benchmark attacker',
      skillName: 'Stable Slash',
      stats: {
        hp: 1200,
        maxHp: 1200,
        atk: 180,
        def: 40,
        speed: 130,
      },
    }),
    makeBenchmarkUnit('PLAYER_BACK', 'PLAYER', 0, 1, {
      name: 'Player Back',
      role: 'MAGE',
      icon: 'Sparkles',
      description: 'Stable backline benchmark attacker',
      skillName: 'Arc Burst',
      stats: {
        hp: 900,
        maxHp: 900,
        atk: 210,
        def: 18,
        speed: 90,
      },
    }),
    makeBenchmarkUnit('ENEMY_FRONT', 'ENEMY', 1, 0, {
      name: 'Enemy Front',
      role: 'TANK',
      icon: 'Shield',
      description: 'Stable frontline benchmark defender',
      skillName: 'Brace',
      stats: {
        hp: 1350,
        maxHp: 1350,
        atk: 120,
        def: 55,
        speed: 80,
      },
    }),
    makeBenchmarkUnit('ENEMY_BACK', 'ENEMY', 0, 2, {
      name: 'Enemy Back',
      role: 'MAGE',
      icon: 'Flame',
      description: 'Stable backline benchmark defender',
      skillName: 'Spark Shot',
      stats: {
        hp: 880,
        maxHp: 880,
        atk: 170,
        def: 22,
        speed: 70,
      },
    }),
  ];

  const playerSpeed = getTeamSpeed(units, 'PLAYER');
  const enemySpeed = getTeamSpeed(units, 'ENEMY');

  return {
    initialTurn: 1,
    logs: [{ id: 'benchmark-start', turn: 0, message: 'Benchmark battle start', type: 'INFO' }],
    playerSpeed,
    enemySpeed,
    randomValues: [0.99, 0.5],
    turnOrder: getTurnOrder(units, playerSpeed, enemySpeed),
    units,
  };
};

export const runDeterministicBattleTurn = (): DeterministicBattleTurn => {
  const scenario = createBenchmarkScenario();
  const nextQueue = [...scenario.turnOrder];
  const attackerId = nextQueue.shift();

  if (!attackerId) {
    throw new Error('Benchmark scenario did not produce a turn queue.');
  }

  const attacker = scenario.units.find((unit) => unit.id === attackerId);

  if (!attacker) {
    throw new Error(`Benchmark attacker "${attackerId}" was not found.`);
  }

  const target = findTarget(attacker, scenario.units);

  if (!target) {
    throw new Error('Benchmark scenario did not produce a target.');
  }

  const result = withDeterministicRandom(scenario.randomValues, () =>
    calculateDamage(attacker, target, false),
  );

  const nextUnits = cloneValue(scenario.units).map((unit) => {
    if (unit.id === attacker.id) {
      return {
        ...unit,
        stats: {
          ...unit.stats,
          energy: Math.min(MAX_ENERGY, unit.stats.energy + 25),
        },
      };
    }

    if (unit.id === target.id) {
      const nextHp = Math.max(0, unit.stats.hp - result.damage);

      return {
        ...unit,
        isDead: nextHp === 0,
        stats: {
          ...unit.stats,
          energy: Math.min(MAX_ENERGY, unit.stats.energy + 10),
          hp: nextHp,
        },
      };
    }

    return unit;
  });

  return {
    attackerId,
    initialTurn: scenario.initialTurn,
    nextQueue,
    nextUnits,
    result,
    targetId: target.id,
  };
};
