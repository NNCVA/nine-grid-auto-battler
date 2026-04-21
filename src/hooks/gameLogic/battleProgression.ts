import { TRANSLATIONS } from '../../config/localization';
import {
  calculateDamage,
  calculateHeal,
  findHealTarget,
  findTarget,
  getTeamSpeed,
  getTurnOrder,
  simulateBattle,
} from '../../services/gameEngine';
import { BattleLogEntry, DamageResult, GameState, Unit } from '../../types';
import { getTranslation, Language } from '../../utils/i18n';

type Translate = (key: keyof typeof TRANSLATIONS.en) => string;

interface StartBattleResult {
  alertMessage?: string;
  nextGameState?: GameState;
  nextTurnQueue?: string[];
}

export const buildBattleStart = (
  gameState: GameState,
  lang: Language,
  t: Translate,
): StartBattleResult => {
  if (gameState.phase !== 'MATCHUP') {
    return {};
  }

  const playerCount = gameState.units.filter((unit) => unit.side === 'PLAYER').length;
  const enemyCount = gameState.units.filter((unit) => unit.side === 'ENEMY').length;

  if (playerCount === 0) {
    return { alertMessage: t('placeUnit') };
  }

  if (playerCount > enemyCount) {
    return { alertMessage: t('tooManyUnits') };
  }

  const playerSpeed = getTeamSpeed(gameState.units, 'PLAYER');
  const enemySpeed = getTeamSpeed(gameState.units, 'ENEMY');
  const firstSide =
    playerSpeed >= enemySpeed
      ? lang === 'en'
        ? 'Player'
        : '我方'
      : lang === 'en'
        ? 'Enemy'
        : '敌方';

  return {
    nextGameState: {
      ...gameState,
      phase: 'BATTLE',
      turn: 1,
      playerSpeed,
      enemySpeed,
      logs: [
        ...gameState.logs,
        {
          id: 'speed',
          turn: 0,
          message: t('speedMsg')
            .replace('{p}', playerSpeed.toString())
            .replace('{e}', enemySpeed.toString()),
          type: 'INFO',
        },
        {
          id: 'first',
          turn: 0,
          message: t('firstMsg').replace('{side}', firstSide),
          type: 'INFO',
        },
        { id: 'start', turn: 1, message: t('startMsg'), type: 'INFO' },
      ],
    },
    nextTurnQueue: getTurnOrder(gameState.units, playerSpeed, enemySpeed),
  };
};

export const buildSkippedBattleState = (gameState: GameState, t: Translate): GameState => {
  const result = simulateBattle(
    gameState.units,
    gameState.turn,
    gameState.playerSpeed,
    gameState.enemySpeed,
    gameState.logs,
  );
  const nextMaxLevel =
    result.phase === 'VICTORY'
      ? Math.max(gameState.maxLevel, gameState.currentLevel + 1)
      : gameState.maxLevel;

  return {
    ...gameState,
    phase: result.phase,
    units: result.units,
    turn: result.finalTurn,
    logs: [
      ...result.logs.slice(0, 50),
      {
        id: 'end',
        turn: result.finalTurn,
        message: result.phase === 'VICTORY' ? t('levelCleared') : t('defeat'),
        type: 'INFO',
      },
    ],
    maxLevel: nextMaxLevel,
    activeUnitId: null,
  };
};

export const buildBattleCompletionState = (
  gameState: GameState,
  playerAlive: boolean,
  enemyAlive: boolean,
  t: Translate,
): GameState => ({
  ...gameState,
  phase: !playerAlive ? 'DEFEAT' : 'VICTORY',
  maxLevel:
    !enemyAlive && playerAlive
      ? Math.max(gameState.maxLevel, gameState.currentLevel + 1)
      : gameState.maxLevel,
  logs: [
    ...gameState.logs,
    {
      id: Date.now().toString(),
      turn: gameState.turn,
      message: !playerAlive ? t('defeat') : t('levelCleared'),
      type: 'INFO',
    },
  ],
});

interface NextTurnSelection {
  attackerId: string | null;
  nextTurn: number;
  nextTurnQueue: string[];
}

export const getNextTurnSelection = (
  gameState: GameState,
  turnQueue: string[],
): NextTurnSelection => {
  let nextTurn = gameState.turn;
  let nextTurnQueue = [...turnQueue];

  if (nextTurnQueue.length === 0) {
    nextTurn += 1;
    nextTurnQueue = getTurnOrder(gameState.units, gameState.playerSpeed, gameState.enemySpeed);
  }

  if (nextTurnQueue.length === 0) {
    return { attackerId: null, nextTurn, nextTurnQueue: [] };
  }

  return {
    attackerId: nextTurnQueue.shift() ?? null,
    nextTurn,
    nextTurnQueue,
  };
};

interface ResolvedBattleAction {
  isSupport: boolean;
  nextUnits: Unit[];
  result: DamageResult;
  targetId: string;
  turnLog: BattleLogEntry | null;
}

interface DeterministicBattleFlowParams {
  gameState: GameState;
  initialTurnQueue: string[];
  lang: Language;
  maxSteps: number;
  randomValues: number[];
}

interface DeterministicBattleLogEntry {
  message: string;
  turn: number;
  type: BattleLogEntry['type'];
}

export interface DeterministicBattleFlowResult {
  logs: DeterministicBattleLogEntry[];
  phase: GameState['phase'];
  steps: number;
  turn: number;
  units: Unit[];
}

const withDeterministicRandom = <T>(values: number[], callback: () => T) => {
  const originalRandom = Math.random;
  let index = 0;

  Math.random = () => {
    const nextValue = values[index % values.length] ?? 0;
    index += 1;
    return nextValue;
  };

  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
};

export const resolveBattleAction = (
  gameState: GameState,
  attackerId: string,
  lang: Language,
  t: Translate,
): ResolvedBattleAction | null => {
  const attacker = gameState.units.find((unit) => unit.id === attackerId);

  if (!attacker || attacker.isDead) {
    return null;
  }

  const isSupport = attacker.role === 'SUPPORT';
  const target = isSupport
    ? findHealTarget(attacker, gameState.units)
    : findTarget(attacker, gameState.units);

  if (!target) {
    return {
      isSupport,
      nextUnits: gameState.units,
      result: { damage: 0, isCrit: false, isKill: false },
      targetId: '',
      turnLog: null,
    };
  }

  const isSkill = attacker.stats.energy >= attacker.stats.maxEnergy;
  const result = isSupport
    ? calculateHeal(attacker, isSkill)
    : calculateDamage(attacker, target, isSkill);
  const actionName = lang === 'en' ? 'Attack' : '攻击';
  const turnLogMessage = isSupport
    ? isSkill
      ? t('skillHealMsg')
          .replace('{a}', attacker.name)
          .replace('{s}', attacker.skillName.toUpperCase())
          .replace('{t}', target.name)
          .replace('{v}', result.damage.toString())
      : t('healedMsg')
          .replace('{a}', attacker.name)
          .replace('{t}', target.name)
          .replace('{v}', result.damage.toString())
    : t('attackMsg')
        .replace('{a}', attacker.name)
        .replace('{s}', isSkill ? attacker.skillName.toUpperCase() : actionName)
        .replace('{t}', target.name)
        .replace('{v}', result.damage.toString());

  const nextUnits = gameState.units.map((unit) => {
    const nextStats = { ...unit.stats };
    let nextIsDead = unit.isDead;

    if (unit.id === attacker.id) {
      nextStats.energy = isSkill ? 0 : Math.min(nextStats.maxEnergy, nextStats.energy + 25);
    }

    if (unit.id === target.id) {
      if (isSupport) {
        nextStats.hp = Math.min(nextStats.maxHp, nextStats.hp + result.damage);
      } else {
        const nextHp = Math.max(0, nextStats.hp - result.damage);
        nextStats.hp = nextHp;
        nextIsDead = nextHp === 0;
        nextStats.energy = Math.min(nextStats.maxEnergy, nextStats.energy + 10);
      }
    }

    return {
      ...unit,
      isDead: nextIsDead,
      stats: nextStats,
    };
  });

  return {
    isSupport,
    nextUnits,
    result,
    targetId: target.id,
    turnLog: {
      id: Date.now().toString(),
      turn: gameState.turn,
      message: turnLogMessage,
      type: isSkill ? 'SKILL' : 'ATTACK',
    },
  };
};

export const simulateDeterministicBattleFlow = ({
  gameState,
  initialTurnQueue,
  lang,
  maxSteps,
  randomValues,
}: DeterministicBattleFlowParams): DeterministicBattleFlowResult => {
  const t = (key: keyof typeof TRANSLATIONS.en) => getTranslation(lang, key);

  return withDeterministicRandom(randomValues, () => {
    let currentState = structuredClone(gameState) as GameState;
    let currentTurnQueue = [...initialTurnQueue];
    let steps = 0;

    while (steps < maxSteps) {
      let playerAlive = false;
      let enemyAlive = false;
      for (const unit of currentState.units) {
        if (!unit.isDead) {
          if (unit.side === 'PLAYER') playerAlive = true;
          else enemyAlive = true;
        }
        if (playerAlive && enemyAlive) break;
      }

      if (!playerAlive || !enemyAlive) {
        const completedState = buildBattleCompletionState(
          currentState,
          playerAlive,
          enemyAlive,
          t,
        );

        return {
          logs: completedState.logs.map(({ message, turn, type }) => ({
            message,
            turn,
            type,
          })),
          phase: completedState.phase,
          steps,
          turn: completedState.turn,
          units: completedState.units,
        };
      }

      const selection = getNextTurnSelection(currentState, currentTurnQueue);

      if (selection.attackerId === null) {
        break;
      }

      currentTurnQueue = selection.nextTurnQueue;

      if (selection.nextTurn !== currentState.turn) {
        currentState = {
          ...currentState,
          turn: selection.nextTurn,
        };
      }

      const resolvedAction = resolveBattleAction(
        currentState,
        selection.attackerId,
        lang,
        t,
      );

      steps += 1;

      if (!resolvedAction || !resolvedAction.turnLog || !resolvedAction.targetId) {
        continue;
      }

      currentState = {
        ...currentState,
        activeUnitId: null,
        logs: [resolvedAction.turnLog, ...currentState.logs].slice(0, 50),
        units: resolvedAction.nextUnits,
      };
    }

    let playerAlive = false;
    let enemyAlive = false;
    for (const unit of currentState.units) {
      if (!unit.isDead) {
        if (unit.side === 'PLAYER') playerAlive = true;
        else enemyAlive = true;
      }
      if (playerAlive && enemyAlive) break;
    }

    if (!playerAlive || !enemyAlive) {
      const completedState = buildBattleCompletionState(
        currentState,
        playerAlive,
        enemyAlive,
        t,
      );

      return {
        logs: completedState.logs.map(({ message, turn, type }) => ({
          message,
          turn,
          type,
        })),
        phase: completedState.phase,
        steps,
        turn: completedState.turn,
        units: completedState.units,
      };
    }

    return {
      logs: currentState.logs.map(({ message, turn, type }) => ({
        message,
        turn,
        type,
      })),
      phase: currentState.phase,
      steps,
      turn: currentState.turn,
      units: currentState.units,
    };
  });
};
