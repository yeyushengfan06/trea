import React from 'react';
import { Character } from '../types';
import PixelAvatar from './PixelAvatar';

interface CharacterCardProps {
  character: Character;
  currentHp?: number; // For live battle updates
  isWinner?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, currentHp, isWinner }) => {
  const hp = currentHp !== undefined ? currentHp : character.stats.hp;
  const hpPercent = Math.max(0, Math.min(100, (hp / character.stats.maxHp) * 100));

  return (
    <div className={`
      relative bg-gray-800 border-4 rounded-lg p-4 w-64 flex flex-col items-center gap-4 transition-all duration-300
      ${isWinner ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105' : 'border-gray-600'}
    `}>
      {/* Avatar Container */}
      <div className="relative group">
        <div className={`
          absolute -inset-1 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200
        `} style={{ backgroundColor: character.color }}></div>
        <div className="relative border-2 border-gray-700 bg-gray-900 rounded-lg overflow-hidden">
          <PixelAvatar hash={character.hash} color={character.color} size={120} />
        </div>
      </div>

      {/* Name & Class */}
      <div className="text-center">
        <h3 className="text-xl font-bold truncate max-w-[200px]" style={{ color: character.color }}>
          {character.name}
        </h3>
        <span className="text-xs uppercase tracking-widest text-gray-400 bg-gray-900 px-2 py-1 rounded">
          {character.className}
        </span>
      </div>

      {/* HP Bar */}
      <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden border border-gray-600">
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${hpPercent}%`,
            backgroundColor: hpPercent > 50 ? '#22c55e' : hpPercent > 20 ? '#eab308' : '#ef4444'
          }}
        />
      </div>
      <div className="text-xs text-gray-400">
        HP: {Math.max(0, hp)} / {character.stats.maxHp}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 w-full text-center text-sm bg-gray-900 p-2 rounded border border-gray-700">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs">ATK</span>
          <span className="font-bold text-red-400">{character.stats.attack}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs">DEF</span>
          <span className="font-bold text-blue-400">{character.stats.defense}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs">SPD</span>
          <span className="font-bold text-green-400">{character.stats.speed}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
