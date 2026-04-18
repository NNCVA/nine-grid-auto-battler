import React, { useMemo } from 'react';
import { Unit, GameState } from '../types';
import BattleUnit from './BattleUnit';
import { GRID_ROWS, GRID_COLS } from '../constants';
import { recordRender } from '../utils/performance/renderCounters';

interface GameGridProps {
  units: Unit[];
  side: 'PLAYER' | 'ENEMY';
  activeUnitId: string | null;
  damageMap: Record<string, number>;
  healMap: Record<string, number>;
  phase: GameState['phase'];
  onUnitDrop?: (unitData: Unit, row: number, col: number) => void;
  onUnitRemove?: (unitId: string) => void;
}

const GameGridComponent: React.FC<GameGridProps> = ({ 
  units, 
  side, 
  activeUnitId, 
  damageMap, 
  healMap,
  phase,
  onUnitDrop,
  onUnitRemove
}) => {
  recordRender(`GameGrid:${side}`);
  const isPlayer = side === 'PLAYER';

  const unitMap = useMemo(() => {
    const map: Record<string, Unit> = {};
    for (const u of units) {
      if (u.side === side) {
        map[`${u.row}-${u.col}`] = u;
      }
    }
    return map;
  }, [units, side]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (!onUnitDrop) return;
    const unitData = e.dataTransfer.getData('unit');
    if (unitData) {
        onUnitDrop(JSON.parse(unitData), row, col);
    }
  };

  const handleDragStart = (e: React.DragEvent, unit: Unit) => {
      e.dataTransfer.setData('unit', JSON.stringify(unit));
  };

  return (
    <div className="relative p-1 sm:p-2 bg-gray-900/50 rounded-xl border border-gray-700 shadow-inner w-full h-full flex flex-col justify-center">
      <div 
        className="grid gap-1 sm:gap-2 w-full h-full" 
        style={{ 
            gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` 
        }}
      >
        {Array.from({ length: GRID_ROWS }).map((_, rowIndex) => (
          Array.from({ length: GRID_COLS }).map((_, colIndex) => {
            const unit = unitMap[`${rowIndex}-${colIndex}`];
            
            // Allow interaction only in FORMATION phase for player
            const canInteract = phase === 'FORMATION' && isPlayer;

            return (
              <div 
                key={`${side}-${rowIndex}-${colIndex}`}
                className={`
                    relative rounded-lg border border-dashed border-gray-700/50 bg-black/20
                    flex items-center justify-center transition-colors overflow-hidden
                    ${canInteract ? 'hover:bg-white/10' : ''}
                `}
                onDragOver={canInteract ? handleDragOver : undefined}
                onDrop={canInteract ? (e) => handleDrop(e, rowIndex, colIndex) : undefined}
                onClick={() => {
                   if (canInteract && unit) {
                       onUnitRemove && onUnitRemove(unit.id);
                   }
                }}
              >
                {unit ? (
                  <BattleUnit 
                    unit={unit} 
                    isActive={activeUnitId === unit.id}
                    isTakingDamage={damageMap[unit.id] || null}
                    isHealed={healMap[unit.id] || null}
                    draggable={canInteract}
                    onDragStart={handleDragStart}
                  />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800/50" />
                )}
              </div>
            );
          })
        ))}
      </div>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest pointer-events-none whitespace-nowrap z-10">
          {isPlayer ? 'Ally' : 'Enemy'}
      </div>
    </div>
  );
};

const GameGrid = React.memo(GameGridComponent);

export default GameGrid;
