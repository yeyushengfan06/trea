import { Character, BattleLog, CharacterClass } from '../types';

interface Buff {
  type: 'ATK' | 'DEF';
  value: number;
  duration: number;
  source: string;
}

interface BattleState {
  character: Character;
  currentHp: number;
  buffs: Buff[];
  debuffs: Buff[];
  actionGauge: number; // For ATB system (0 to 10000)
}

const ACTION_THRESHOLD = 1000;
const SKILLS: Record<CharacterClass, { name: string; description: string }> = {
  Warrior: { name: 'Fortify', description: 'Increases DEF by 5 for 3 turns' },
  Mage: { name: 'Weaken', description: 'Reduces enemy ATK by 5 for 3 turns' },
  Rogue: { name: 'Focus', description: 'Increases ATK by 5 for 3 turns' },
};

const getEffectiveStats = (state: BattleState) => {
  let { attack, defense, speed } = state.character.stats;

  // Apply Buffs
  state.buffs.forEach(buff => {
    if (buff.type === 'ATK') attack += buff.value;
    if (buff.type === 'DEF') defense += buff.value;
  });

  // Apply Debuffs
  state.debuffs.forEach(buff => {
    if (buff.type === 'ATK') attack -= buff.value;
    if (buff.type === 'DEF') defense -= buff.value;
  });

  return { attack, defense, speed };
};

export const simulateBattle = (char1: Character, char2: Character): { logs: BattleLog[], winnerId: string } => {
  // Initialize Battle States with Action Gauge
  let p1: BattleState = { character: char1, currentHp: char1.stats.hp, buffs: [], debuffs: [], actionGauge: 0 };
  let p2: BattleState = { character: char2, currentHp: char2.stats.hp, buffs: [], debuffs: [], actionGauge: 0 };
  
  const logs: BattleLog[] = [];
  let turnCounter = 0;

  // Max logs to prevent infinite loops (safety break)
  while (p1.currentHp > 0 && p2.currentHp > 0 && logs.length < 200) {
    
    // ATB Logic: Advance time until one character reaches the threshold
    // We calculate how many ticks are needed for the fastest person to reach 1000
    // But for simplicity in JS, we can just iterate "ticks" or better: calculate exact float step
    
    const p1Stats = getEffectiveStats(p1);
    const p2Stats = getEffectiveStats(p2);
    
    // Ensure speed is at least 1 to avoid infinite loop
    const p1Speed = Math.max(1, p1Stats.speed);
    const p2Speed = Math.max(1, p2Stats.speed);

    // Calculate how much "Time" is needed for each to fill gauge
    // Time = (Threshold - Current) / Speed
    const p1TimeToAct = (ACTION_THRESHOLD - p1.actionGauge) / p1Speed;
    const p2TimeToAct = (ACTION_THRESHOLD - p2.actionGauge) / p2Speed;
    
    // Advance by the shorter time
    const timeStep = Math.min(p1TimeToAct, p2TimeToAct);
    
    // Update Gauges
    p1.actionGauge += timeStep * p1Speed;
    p2.actionGauge += timeStep * p2Speed;

    // Determine who acts. 
    // Small float errors might happen, so use a tiny epsilon or >= comparison
    let activePlayer: BattleState | null = null;
    let passivePlayer: BattleState | null = null;

    // Handle Speed Ties (Coin flip or P1 advantage)
    // If both ready at same time
    if (p1.actionGauge >= ACTION_THRESHOLD && p2.actionGauge >= ACTION_THRESHOLD) {
      if (Math.random() < 0.5) {
        activePlayer = p1;
        passivePlayer = p2;
      } else {
        activePlayer = p2;
        passivePlayer = p1;
      }
    } else if (p1.actionGauge >= ACTION_THRESHOLD) {
      activePlayer = p1;
      passivePlayer = p2;
    } else if (p2.actionGauge >= ACTION_THRESHOLD) {
      activePlayer = p2;
      passivePlayer = p1;
    }

    if (activePlayer && passivePlayer) {
      turnCounter++;
      
      // Reset Gauge (subtract threshold to keep overflow "momentum" if desired, or reset to 0)
      // Standard ATB usually subtracts threshold
      activePlayer.actionGauge -= ACTION_THRESHOLD;
      
      // --- Turn Start Processing ---
      
      // Tick Buffs/Debuffs for the ACTIVE player only (their turn passed)
      activePlayer.buffs = activePlayer.buffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
      activePlayer.debuffs = activePlayer.debuffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);

      const activeStats = getEffectiveStats(activePlayer);
      const passiveStats = getEffectiveStats(passivePlayer);

      // --- Action Logic ---

      // Skill Roll (20% Chance)
      const skillChance = 0.20;
      const usesSkill = Math.random() < skillChance;
      
      if (usesSkill) {
        const skill = SKILLS[activePlayer.character.className];
        let logMessage = '';

        if (activePlayer.character.className === 'Warrior') {
          // Fortify: Self DEF + 5
          activePlayer.buffs.push({ type: 'DEF', value: 5, duration: 3, source: skill.name });
          logMessage = `${activePlayer.character.name} used ${skill.name}! Defense UP!`;
        } else if (activePlayer.character.className === 'Mage') {
          // Weaken: Enemy ATK - 5
          passivePlayer.debuffs.push({ type: 'ATK', value: 5, duration: 3, source: skill.name });
          logMessage = `${activePlayer.character.name} cast ${skill.name}! ${passivePlayer.character.name}'s Attack weakened!`;
        } else if (activePlayer.character.className === 'Rogue') {
          // Focus: Self ATK + 5
          activePlayer.buffs.push({ type: 'ATK', value: 5, duration: 3, source: skill.name });
          logMessage = `${activePlayer.character.name} used ${skill.name}! Attack UP!`;
        }

        logs.push({
          turn: turnCounter,
          message: logMessage,
          attacker: activePlayer.character.id,
          defender: passivePlayer.character.id,
          damage: 0,
          isCrit: false,
          isDodge: false,
          isSkill: true,
          skillName: skill.name
        });

      } else {
        // Normal Attack
        
        // Damage Formula Update:
        // Prevent 0 damage stalemate. Ensure at least 20% of ATK goes through as damage.
        // Base Damage = max(ATK * 0.2, ATK - DEF)
        const baseAtk = Math.max(0, activeStats.attack); // Prevent negative ATK
        const baseDef = Math.max(0, passiveStats.defense);
        
        let rawDamage = Math.max(Math.ceil(baseAtk * 0.2), baseAtk - baseDef);
        
        // Crit Check (Fixed 5%)
        const critChance = 0.05; 
        let isCrit = Math.random() < critChance;
        if (isCrit) {
          rawDamage = Math.floor(rawDamage * 1.5);
        }

        // Dodge Chance
        // Cap dodge at 50% to prevent unhittable targets
        const dodgeChance = Math.min(0.50, passiveStats.speed / 200); 
        let isDodge = Math.random() < dodgeChance;
        
        let finalDamage = isDodge ? 0 : rawDamage;

        // Apply Damage
        passivePlayer.currentHp -= finalDamage;

        logs.push({
          turn: turnCounter,
          message: isDodge 
            ? `${passivePlayer.character.name} dodged ${activePlayer.character.name}'s attack!`
            : `${activePlayer.character.name} hit ${passivePlayer.character.name} for ${finalDamage} damage!${isCrit ? ' (CRITICAL!)' : ''}`,
          attacker: activePlayer.character.id,
          defender: passivePlayer.character.id,
          damage: finalDamage,
          isCrit,
          isDodge
        });
      }
    }
  }

  const winnerId = p1.currentHp > 0 ? p1.character.id : p2.character.id;
  
  // Add result log
  logs.push({
    turn: turnCounter + 1,
    message: `${p1.currentHp > 0 ? p1.character.name : p2.character.name} WINS!`,
    attacker: 'SYSTEM',
    defender: 'SYSTEM',
    damage: 0,
    isCrit: false,
    isDodge: false
  });

  return { logs, winnerId };
};
