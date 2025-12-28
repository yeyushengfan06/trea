export type CharacterClass = 'Warrior' | 'Mage' | 'Rogue';

export interface CharacterStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface Character {
  id: string;
  name: string;
  className: CharacterClass;
  stats: CharacterStats;
  color: string;
  hash: string;
}

export interface BattleLog {
  turn: number;
  message: string;
  attacker: string;
  defender: string;
  damage: number;
  isCrit: boolean;
  isDodge: boolean;
  isSkill?: boolean;
  skillName?: string;
}
