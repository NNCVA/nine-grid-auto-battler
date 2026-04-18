import { createUnit } from '../../constants';
import { TRANSLATIONS } from '../../constants/localization';
import { getUnitTemplate, getUnitTemplateKeys } from '../../services/contentService';
import { GameState, Unit } from '../../types';
import { Language } from '../../utils/i18n';

export const createEmptyGameState = (): GameState => ({
  phase: 'MATCHUP',
  turn: 0,
  units: [],
  activeUnitId: null,
  logs: [],
  playerSpeed: 0,
  enemySpeed: 0,
  currentLevel: 1,
  maxLevel: 1,
});

interface BuildInitializedGameStateParams {
  currentMaxLevel: number;
  currentUnits: Unit[];
  lang: Language;
  level: number;
  levelMessageTemplate: string;
}

export const buildInitializedGameState = ({
  currentMaxLevel,
  currentUnits,
  lang,
  level,
  levelMessageTemplate,
}: BuildInitializedGameStateParams): GameState => {
  const statMultiplier = 1 + (level - 1) * 0.1;

  const createLocalizedUnit = (key: string, side: 'PLAYER' | 'ENEMY', row: number, col: number) => {
    const template = getUnitTemplate(key);
    const localized =
      TRANSLATIONS[lang].unitInfo[key as keyof typeof TRANSLATIONS.en.unitInfo];
    const mergedTemplate = {
      ...template,
      name: localized.name,
      skillName: localized.skill,
      description: localized.desc,
    };

    return createUnit(mergedTemplate, side, row, col);
  };

  const initialPlayerUnits =
    level > 1 && currentUnits.some((unit) => unit.side === 'PLAYER')
      ? currentUnits
          .filter((unit) => unit.side === 'PLAYER')
          .map((unit) => ({
            ...unit,
            isDead: false,
            stats: { ...unit.stats, hp: unit.stats.maxHp, energy: 0 },
          }))
      : [
          createLocalizedUnit('KNIGHT', 'PLAYER', 1, 1),
          createLocalizedUnit('MAGE', 'PLAYER', 0, 0),
          createLocalizedUnit('BERSERKER', 'PLAYER', 2, 0),
        ];

  const enemyKeys = getUnitTemplateKeys();
  const initialEnemyUnits: Unit[] = [];
  const enemyCount = Math.floor(Math.random() * 3) + 3;

  for (let index = 0; index < enemyCount; index += 1) {
    const key = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
    const template = getUnitTemplate(key);
    const isFrontliner = template.role === 'TANK' || template.role === 'WARRIOR';
    const colPriority = isFrontliner ? [0, 1, 2] : [2, 1, 0];
    const rowOptions = [0, 1, 2].sort(() => Math.random() - 0.5);

    let finalRow = -1;
    let finalCol = -1;

    for (const col of colPriority) {
      for (const row of rowOptions) {
        const isOccupied = initialEnemyUnits.some(
          (unit) => unit.row === row && unit.col === col,
        );

        if (!isOccupied) {
          finalRow = row;
          finalCol = col;
          break;
        }
      }

      if (finalRow !== -1) {
        break;
      }
    }

    if (finalRow !== -1 && finalCol !== -1) {
      const unit = createLocalizedUnit(key, 'ENEMY', finalRow, finalCol);
      unit.stats.hp = Math.floor(unit.stats.hp * statMultiplier);
      unit.stats.maxHp = Math.floor(unit.stats.maxHp * statMultiplier);
      unit.stats.atk = Math.floor(unit.stats.atk * statMultiplier);
      unit.stats.def = Math.floor(unit.stats.def * statMultiplier);
      initialEnemyUnits.push(unit);
    }
  }

  const levelMessage = levelMessageTemplate
    .replace('{l}', level.toString())
    .replace('{p}', (statMultiplier * 100).toFixed(0));

  return {
    phase: 'MATCHUP',
    turn: 1,
    units: [...initialPlayerUnits, ...initialEnemyUnits],
    activeUnitId: null,
    logs: [{ id: 'init', turn: 0, message: levelMessage, type: 'INFO' }],
    playerSpeed: 0,
    enemySpeed: 0,
    currentLevel: level,
    maxLevel: Math.max(level, currentMaxLevel),
  };
};
