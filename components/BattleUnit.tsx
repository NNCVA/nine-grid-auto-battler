
import React from 'react';
import { Unit } from '../types';
import { Shield, Sword, Flame, Crosshair, Heart, Skull } from 'lucide-react';
import { MAX_ENERGY } from '../constants';
import { recordRender } from '../utils/performance/renderCounters';

interface BattleUnitProps {
  unit: Unit;
  isActive: boolean;
  isTakingDamage: number | null; // null if not taking damage, number is damage amount
  isHealed: number | null;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, unit: Unit) => void;
}

const RoleIcon = ({ role, className }: { role: string; className?: string }) => {
  switch (role) {
    case 'TANK': return <Shield className={className} />;
    case 'WARRIOR': return <Sword className={className} />;
    case 'MAGE': return <Flame className={className} />;
    case 'ASSASSIN': return <Crosshair className={className} />;
    case 'SUPPORT': return <Heart className={className} />;
    default: return <Sword className={className} />;
  }
};

const BattleUnitComponent: React.FC<BattleUnitProps> = ({ 
  unit, 
  isActive, 
  isTakingDamage, 
  isHealed,
  onClick, 
  draggable, 
  onDragStart 
}) => {
  recordRender('BattleUnit');
  if (unit.isDead) {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30 grayscale">
         <Skull size={24} className="text-gray-500 sm:w-8 sm:h-8" />
      </div>
    );
  }

  const hpPercent = (unit.stats.hp / unit.stats.maxHp) * 100;
  const energyPercent = (unit.stats.energy / unit.stats.maxEnergy) * 100;
  const isFullEnergy = unit.stats.energy >= MAX_ENERGY;

  return (
    <div 
      className={`
        relative w-full h-full p-1 sm:p-2 rounded-lg transition-all duration-300
        flex flex-col items-center justify-center sm:justify-between
        ${unit.side === 'PLAYER' ? 'bg-game-panel border border-game-player/30' : 'bg-game-panel border border-game-enemy/30'}
        ${isActive ? 'ring-1 sm:ring-2 ring-yellow-400 scale-105 z-10 shadow-lg shadow-yellow-400/20' : ''}
        ${isTakingDamage ? 'animate-shake bg-red-900/50' : ''}
        ${draggable ? 'cursor-grab active:cursor-grabbing hover:bg-white/5' : ''}
      `}
      onClick={onClick}
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, unit)}
    >
        <div className="flex flex-col items-center w-full z-10">
            <RoleIcon role={unit.role} className={`w-4 h-4 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 ${unit.side === 'PLAYER' ? 'text-game-player' : 'text-game-enemy'}`} />
            <span className="text-[8px] sm:text-[10px] font-bold text-white truncate w-full text-center leading-tight">{unit.name}</span>
        </div>

        <div className="w-full space-y-0.5 sm:space-y-1 mt-1 z-10">
            <div className="w-full h-1 sm:h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${unit.side === 'PLAYER' ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
            <div className="w-full h-0.5 sm:h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${isFullEnergy ? 'bg-yellow-400 animate-pulse' : 'bg-blue-500'}`}
                    style={{ width: `${energyPercent}%` }}
                />
            </div>
        </div>

        {isTakingDamage !== null && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-red-500 font-black text-sm sm:text-xl animate-pop z-50 text-shadow">
                -{isTakingDamage}
            </div>
        )}
        {isHealed !== null && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-green-400 font-black text-sm sm:text-xl animate-pop z-50 text-shadow">
                +{isHealed}
            </div>
        )}

        {isActive && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400 text-xs sm:text-base">
                ▼
            </div>
        )}
    </div>
  );
};

const BattleUnit = React.memo(BattleUnitComponent);

export default BattleUnit;
