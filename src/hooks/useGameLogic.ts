import { useCallback, useEffect, useRef, useState } from 'react';
import { TRANSLATIONS } from '../config/localization';
import { GameState, Unit } from '../types';
import { Language, getTranslation } from '../utils/i18n';
import {
  buildBattleCompletionState,
  buildBattleStart,
  buildSkippedBattleState,
  getNextTurnSelection,
  resolveBattleAction,
} from './gameLogic/battleProgression';
import {
  addUnitFromBenchToFormation,
  enterFormationPhase,
  exitFormationPhase,
  moveFormationUnit,
  removeFormationUnit,
} from './gameLogic/formationActions';
import {
  buildInitializedGameState,
  createEmptyGameState,
} from './gameLogic/initialization';
import {
  loadGameState,
  persistExitGameState,
  saveGameState,
} from './gameLogic/persistenceActions';

interface UseGameLogicProps {
  lang: Language;
  onExitGame: () => void;
}

export const useGameLogic = ({ lang, onExitGame }: UseGameLogicProps) => {
  const t = (key: keyof typeof TRANSLATIONS.en) => getTranslation(lang, key);

  const [gameState, setGameState] = useState<GameState>(createEmptyGameState);
  const [battleSpeed, setBattleSpeed] = useState<number>(1);
  const [damageMap, setDamageMap] = useState<Record<string, number>>({});
  const [healMap, setHealMap] = useState<Record<string, number>>({});
  const [turnQueue, setTurnQueue] = useState<string[]>([]);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const battleIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const turnQueueRef = useRef<string[]>(turnQueue);

  const saveGame = () => {
    if (saveGameState(gameState)) {
      alert(t('saved'));
      return true;
    }

    alert(t('saveFailed'));
    return false;
  };

  const loadGame = () => {
    const loadedState = loadGameState();

    if (loadedState) {
      setGameState(loadedState);
      return true;
    }

    alert(t('loadFailed'));
    return false;
  };

  const initializeGame = (level = 1, currentMaxLevel = 1) => {
    setGameState(
      buildInitializedGameState({
        currentMaxLevel,
        currentUnits: gameState.units,
        lang,
        level,
        levelMessageTemplate: t('levelMsg'),
      }),
    );
    setDamageMap({});
    setHealMap({});
    setTurnQueue([]);
    setIsProcessingTurn(false);
    turnQueueRef.current = [];
  };

  const handleNextOrReset = () => {
    if (gameState.phase === 'VICTORY') {
      initializeGame(gameState.currentLevel + 1, gameState.maxLevel);
      return;
    }

    initializeGame(gameState.currentLevel, gameState.maxLevel);
  };

  const toggleSpeed = () => {
    setBattleSpeed((previous) => (previous === 1 ? 2 : previous === 2 ? 4 : 1));
  };

  const handleSkip = () => {
    if (gameState.phase !== 'BATTLE') {
      return;
    }

    if (battleIntervalRef.current) {
      clearTimeout(battleIntervalRef.current);
    }

    setIsProcessingTurn(false);
    setGameState(buildSkippedBattleState(gameState, t));
  };

  const enterFormation = () => {
    setGameState((previous) => enterFormationPhase(previous));
  };

  const exitFormation = () => {
    setGameState((previous) => exitFormationPhase(previous));
  };

  const handleUnitDrop = (unitData: Unit, row: number, col: number) => {
    setGameState((previous) => moveFormationUnit(previous, unitData, row, col));
  };

  const addUnitFromBench = (templateKey: string) => {
    const result = addUnitFromBenchToFormation({
      gameState,
      lang,
      templateKey,
    });

    if (result.alertMessage) {
      alert(result.alertMessage);
    }

    setGameState(result.nextGameState);
  };

  const removeUnit = (id: string) => {
    setGameState((previous) => removeFormationUnit(previous, id));
  };

  const startBattle = () => {
    const result = buildBattleStart(gameState, lang, t);

    if (result.alertMessage) {
      alert(result.alertMessage);
      return;
    }

    if (result.nextGameState) {
      setGameState(result.nextGameState);
    }

    if (result.nextTurnQueue) {
      setTurnQueue(result.nextTurnQueue);
    }
  };

  const processNextTurn = useCallback(() => {
    const currentGameState = gameStateRef.current;
    const currentTurnQueue = turnQueueRef.current;

    if (currentGameState.phase !== 'BATTLE' || isProcessingTurn) {
      return;
    }

    let playerAlive = false;
    let enemyAlive = false;
    for (const unit of currentGameState.units) {
      if (!unit.isDead) {
        if (unit.side === 'PLAYER') playerAlive = true;
        else if (unit.side === 'ENEMY') enemyAlive = true;
      }
      if (playerAlive && enemyAlive) break;
    }

    if (!playerAlive || !enemyAlive) {
      setGameState((previous) =>
        buildBattleCompletionState(previous, playerAlive, enemyAlive, t),
      );
      return;
    }

    const selection = getNextTurnSelection(currentGameState, currentTurnQueue);

    if (selection.attackerId === null) {
      return;
    }

    if (selection.nextTurn !== currentGameState.turn) {
      setGameState((previous) => ({ ...previous, turn: selection.nextTurn }));
    }

    setTurnQueue(selection.nextTurnQueue);
    turnQueueRef.current = selection.nextTurnQueue;

    const attacker = currentGameState.units.find((unit) => unit.id === selection.attackerId);

    if (!attacker || attacker.isDead) {
      setIsProcessingTurn(false);
      return;
    }

    setIsProcessingTurn(true);
    setGameState((previous) => ({ ...previous, activeUnitId: selection.attackerId }));

    const actionDelay = 400 / battleSpeed;
    const visualDuration = 800 / battleSpeed;
    const attackerIdRef = selection.attackerId;

    battleIntervalRef.current = setTimeout(() => {
      const resolvedAction = resolveBattleAction(gameStateRef.current, attackerIdRef, lang, t);

      if (!resolvedAction || !resolvedAction.turnLog || !resolvedAction.targetId) {
        setIsProcessingTurn(false);
        setGameState((previous) => ({ ...previous, activeUnitId: null }));
        return;
      }

      setGameState((previous) => ({
        ...previous,
        units: resolvedAction.nextUnits,
        logs: [resolvedAction.turnLog!, ...previous.logs].slice(0, 50),
      }));

      if (resolvedAction.isSupport) {
        setHealMap({ [resolvedAction.targetId]: resolvedAction.result.damage });
        setTimeout(() => setHealMap({}), visualDuration);
      } else {
        setDamageMap({ [resolvedAction.targetId]: resolvedAction.result.damage });
        setTimeout(() => setDamageMap({}), visualDuration);
      }

      setTimeout(() => {
        setGameState((previous) => ({ ...previous, activeUnitId: null }));
        setIsProcessingTurn(false);
      }, visualDuration);
    }, actionDelay);
  }, [
    battleSpeed,
    isProcessingTurn,
    lang,
    t,
  ]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (gameState.phase === 'BATTLE' && !isProcessingTurn) {
      const loopDelay = 200 / battleSpeed;
      const timer = setTimeout(processNextTurn, loopDelay);
      battleIntervalRef.current = timer;
      return () => clearTimeout(timer);
    }
  }, [battleSpeed, gameState.phase, isProcessingTurn, processNextTurn]);

  useEffect(() => {
    return () => {
      if (battleIntervalRef.current) {
        clearTimeout(battleIntervalRef.current);
      }
    };
  }, []);

  const stopBattle = () => {
    if (battleIntervalRef.current) {
      clearTimeout(battleIntervalRef.current);
    }

    setIsProcessingTurn(false);
  };

  const handleExit = () => {
    stopBattle();
    persistExitGameState(gameState);
    onExitGame();
  };

  return {
    gameState,
    battleSpeed,
    damageMap,
    healMap,
    actions: {
      initializeGame,
      loadGame,
      saveGame,
      handleNextOrReset,
      toggleSpeed,
      handleSkip,
      handleUnitDrop,
      addUnitFromBench,
      removeUnit,
      startBattle,
      enterFormation,
      exitFormation,
      handleExit,
    },
  };
};
