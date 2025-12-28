import { useState, useEffect, useRef } from 'react';
import { generateCharacter } from './utils/generator';
import { simulateBattle } from './utils/battle';
import { Character, BattleLog } from './types';
import CharacterCard from './components/CharacterCard';

function App() {
  const [name1, setName1] = useState('Trae');
  const [name2, setName2] = useState('Bug');
  
  const [char1, setChar1] = useState<Character | null>(null);
  const [char2, setChar2] = useState<Character | null>(null);
  
  const [visibleLogs, setVisibleLogs] = useState<BattleLog[]>([]);
  const [isFighting, setIsFighting] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  
  const [currentHp1, setCurrentHp1] = useState(0);
  const [currentHp2, setCurrentHp2] = useState(0);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Update characters when names change
  useEffect(() => {
    if (name1) {
      const c1 = generateCharacter(name1);
      setChar1(c1);
      if (!isFighting) setCurrentHp1(c1.stats.hp);
    }
  }, [name1, isFighting]);

  useEffect(() => {
    if (name2) {
      const c2 = generateCharacter(name2);
      setChar2(c2);
      if (!isFighting) setCurrentHp2(c2.stats.hp);
    }
  }, [name2, isFighting]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLogs]);

  const handleFight = () => {
    if (!char1 || !char2) return;
    
    // Reset state
    setIsFighting(true);
    setVisibleLogs([]);
    setWinnerId(null);
    setCurrentHp1(char1.stats.hp);
    setCurrentHp2(char2.stats.hp);

    // Run simulation
    const { logs, winnerId: wId } = simulateBattle(char1, char2);
    // setBattleLogs(logs); // Removed unused state

    // Replay logs
    let index = 0;
    const interval = setInterval(() => {
      if (index >= logs.length) {
        clearInterval(interval);
        setIsFighting(false);
        setWinnerId(wId);
        return;
      }

      const log = logs[index];
      setVisibleLogs(prev => [...prev, log]);

      // Update HP
      if (log.damage > 0) {
        if (log.defender === char1.id) {
          setCurrentHp1(prev => Math.max(0, prev - log.damage));
        } else {
          setCurrentHp2(prev => Math.max(0, prev - log.damage));
        }
      }

      index++;
    }, 800); // 800ms per turn
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono p-4 flex flex-col items-center">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
          HASH WARRIORS
        </h1>
        <p className="text-gray-400 mt-2">Enter any text to summon a warrior</p>
      </header>

      {/* Arena */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl">
        
        {/* Player 1 Side */}
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            disabled={isFighting}
            className="bg-gray-900 border-2 border-purple-500 rounded px-4 py-2 text-center w-64 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
            placeholder="Enter Name 1"
          />
          {char1 && (
            <CharacterCard 
              character={char1} 
              currentHp={currentHp1}
              isWinner={winnerId === char1.id}
            />
          )}
        </div>

        {/* VS / Fight Button */}
        <div className="flex flex-col items-center justify-center gap-4 z-10">
          <div className="text-6xl font-black text-gray-800 select-none absolute md:static opacity-20 md:opacity-100 pointer-events-none">
            VS
          </div>
          <button
            onClick={handleFight}
            disabled={isFighting || !name1 || !name2}
            className={`
              relative overflow-hidden group bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-lg text-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)]
              disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95
            `}
          >
            <span className="relative z-10">{isFighting ? 'FIGHTING...' : 'FIGHT!'}</span>
          </button>
        </div>

        {/* Player 2 Side */}
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            disabled={isFighting}
            className="bg-gray-900 border-2 border-blue-500 rounded px-4 py-2 text-center w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            placeholder="Enter Name 2"
          />
          {char2 && (
            <CharacterCard 
              character={char2} 
              currentHp={currentHp2}
              isWinner={winnerId === char2.id}
            />
          )}
        </div>
      </div>

      {/* Battle Log */}
      <div className="mt-8 w-full max-w-2xl bg-gray-900 rounded-lg border border-gray-700 p-4 h-64 overflow-y-auto shadow-inner">
        {visibleLogs.length === 0 ? (
          <div className="text-center text-gray-600 h-full flex items-center justify-center italic">
            Waiting for battle to start...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`text-sm p-2 rounded ${
                  log.isCrit ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-700' :
                  log.isDodge ? 'bg-blue-900/30 text-blue-200' :
                  log.attacker === 'SYSTEM' ? 'bg-green-900/30 text-green-200 font-bold text-center border-t border-green-700' :
                  'bg-gray-800/50'
                }`}
              >
                <span className="opacity-50 mr-2">[{log.turn}]</span>
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
