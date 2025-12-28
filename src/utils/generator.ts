import { generateHash, hexToInt } from './hash';
import { Character, CharacterClass, CharacterStats } from '../types';

const CLASSES: CharacterClass[] = ['Warrior', 'Mage', 'Rogue'];

// Increased Base Stats to prolong battles and allow mechanics to shine
const BASE_STATS: Record<CharacterClass, CharacterStats> = {
  Warrior: { hp: 150, maxHp: 150, attack: 15, defense: 8, speed: 8 },  // Tanky, slower
  Mage: { hp: 100, maxHp: 100, attack: 22, defense: 3, speed: 10 },    // Glass cannon
  Rogue: { hp: 120, maxHp: 120, attack: 18, defense: 5, speed: 15 },   // Fast, balanced
};

export const generateCharacter = (name: string): Character => {
  const hash = generateHash(name);
  
  // Use different segments of the hash for different attributes
  const classSegment = hexToInt(hash.substring(0, 2));
  const hpSegment = hexToInt(hash.substring(2, 4));
  const atkSegment = hexToInt(hash.substring(4, 6));
  const defSegment = hexToInt(hash.substring(6, 8));
  const spdSegment = hexToInt(hash.substring(8, 10));
  const colorSegment = hash.substring(10, 16);

  // Determine Class
  const classIndex = classSegment % 3;
  const className = CLASSES[classIndex];
  const base = BASE_STATS[className];

  // Calculate Stats with variance
  // We use the segment (0-255) to add a bonus to the base stats
  const stats: CharacterStats = {
    hp: base.hp + Math.floor(hpSegment / 4), // +0 to ~63 HP (Increased variance slightly)
    maxHp: base.hp + Math.floor(hpSegment / 4),
    attack: base.attack + Math.floor(atkSegment / 12), // +0 to ~21 ATK (Higher ATK potential)
    defense: base.defense + Math.floor(defSegment / 18), // +0 to ~14 DEF
    speed: base.speed + Math.floor(spdSegment / 20), // +0 to ~12 SPD
  };

  // Ensure unique ID
  const id = hash.substring(0, 8);

  return {
    id,
    name,
    className,
    stats,
    color: `#${colorSegment}`,
    hash,
  };
};
