import { createUnit } from '../../constants';
import { TRANSLATIONS } from '../../constants/localization';
import { getUnitTemplate } from '../../services/contentService';
import { GameState, Unit } from '../../types';
import { Language } from '../../utils/i18n';

export const enterFormationPhase = (gameState: GameState): GameState =>
  gameState.phase === 'MATCHUP' ? { ...gameState, phase: 'FORMATION' } : gameState;

export const exitFormationPhase = (gameState: GameState): GameState =>
  gameState.phase === 'FORMATION' ? { ...gameState, phase: 'MATCHUP' } : gameState;

export const moveFormationUnit = (
  gameState: GameState,
  unitData: Unit,
  row: number,
  col: number,
): GameState => {
  if (gameState.phase !== 'FORMATION') {
    return gameState;
  }

  return {
    ...gameState,
    units: gameState.units.map((unit) => {
      if (unit.id === unitData.id) {
        return { ...unit, row, col };
      }

      if (unit.side === 'PLAYER' && unit.row === row && unit.col === col) {
        return { ...unit, row: unitData.row, col: unitData.col };
      }

      return unit;
    }),
  };
};

interface AddUnitFromBenchParams {
  gameState: GameState;
  lang: Language;
  templateKey: string;
}

export const addUnitFromBenchToFormation = ({
  gameState,
  lang,
  templateKey,
}: AddUnitFromBenchParams): { alertMessage?: string; nextGameState: GameState } => {
  if (gameState.phase !== 'FORMATION') {
    return { nextGameState: gameState };
  }

  const currentEnemyCount = gameState.units.filter((unit) => unit.side === 'ENEMY').length;
  const currentPlayerCount = gameState.units.filter((unit) => unit.side === 'PLAYER').length;

  if (currentPlayerCount >= currentEnemyCount) {
    return {
      alertMessage: `${TRANSLATIONS[lang].deployLimit} (${currentEnemyCount})`,
      nextGameState: gameState,
    };
  }

  const template = getUnitTemplate(templateKey);
  const localized =
    TRANSLATIONS[lang].unitInfo[templateKey as keyof typeof TRANSLATIONS.en.unitInfo];
  const mergedTemplate = {
    ...template,
    name: localized.name,
    skillName: localized.skill,
    description: localized.desc,
  };

  const nextUnits = [...gameState.units];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      if (!nextUnits.find((unit) => unit.side === 'PLAYER' && unit.row === row && unit.col === col)) {
        nextUnits.push(createUnit(mergedTemplate, 'PLAYER', row, col));
        return { nextGameState: { ...gameState, units: nextUnits } };
      }
    }
  }

  return { nextGameState: gameState };
};

export const removeFormationUnit = (gameState: GameState, id: string): GameState => {
  if (gameState.phase !== 'FORMATION') {
    return gameState;
  }

  return {
    ...gameState,
    units: gameState.units.filter((unit) => unit.id !== id),
  };
};
