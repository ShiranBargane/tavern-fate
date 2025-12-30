import { useState, useCallback, useEffect, useRef } from 'react';
import { Coin, type CoinFaceType } from './components/Coin';
import { Hand } from './components/Hand';
import { CRTEffect } from './components/CRTEffect';
import { TableDecor } from './components/TableDecor';
import { CoinSide } from './types';
import { playBlip, playCoinFlip, playCoinLand, playWin, playLose, unlockAudioContext, playWind, playOrganStart } from './sounds';

// Silent MP3 Data URI (1 frame of silence) - used to unlock iOS Audio
const SILENT_AUDIO = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

const HEADS_VARIANTS: CoinFaceType[] = ['king', 'sun', 'jester', 'harvest'];
const TAILS_VARIANTS: CoinFaceType[] = ['skull', 'ghost', 'serpent'];
const RARE_HEADS: CoinFaceType = 'dragon';
const RARE_TAILS: CoinFaceType = 'demon';

const PHRASES: Record<CoinFaceType, string[]> = {
  king: [
    "THE KING COMMANDS", "ROYAL DECREE", "HEAVY IS THE CROWN", "RULE THE DAY", 
    "GOLDEN SCEPTER", "BY ORDER OF FATE", "THE THRONE AWAITS", "CONQUER ALL",
    "DIVINE RIGHT", "LAW OF THE LAND", "GLORY BECKONS", "RISE ABOVE"
  ],
  sun: [
    "PRAISE THE LIGHT", "DAWN BREAKS", "SHINING TRUTH", "BURN BRIGHT", 
    "NO SHADOWS HERE", "SOLAR FLARE", "GLORIOUS DAY", "BLINDING LUCK",
    "THE MORNING STAR", "CLEAR SKIES", "WARM EMBRACE", "ETERNAL DAY"
  ],
  jester: [
    "FOOL'S ERRAND", "LAUGH AT FATE", "CHAOS REIGNS", "A MERRY JEST", 
    "TRICKSTER'S DELIGHT", "WHY SO SERIOUS?", "ROLL THE DICE", "WILD ABANDON",
    "TWIST OF FATE", "MOCK THE GODS", "UNEXPECTED TURN", "DANCE ON FIRE"
  ],
  harvest: [
    "REAP REWARDS", "BOUNTIFUL YIELD", "SOW THE SEEDS", "GOLDEN FIELDS",
    "FRUIT OF LABOR", "NATURE GIVES", "FEAST TONIGHT", "SEASON OF PLENTY",
    "GROWTH ASSURED", "ROOTS RUN DEEP", "GATHER YOUR STRENGTH", "PROSPERITY"
  ],
  dragon: [
    "ANCIENT GREED", "HOARD YOUR LUCK", "FIRE AND BLOOD", "THE WYRM WAKES", 
    "LEGENDARY FIND", "SCALES OF GOLD", "DRAGON'S GAZE", "MYTHIC FORTUNE",
    "POWER UNLEASHED", "TREASURE AWAITS", "SLEEPING GIANT", "FLAME OF OLD"
  ],
  skull: [
    "MEMENTO MORI", "DEATH SMILES", "BONES RATTLE", "END OF THE LINE", 
    "GRAVE NEWS", "SILENT TOMB", "DUST TO DUST", "THE FINAL REST",
    "NO ESCAPE", "GRIM REALITY", "FATE IS SEALED", "ALL MUST FADE"
  ],
  ghost: [
    "PAST HAUNTS", "UNFINISHED BUSINESS", "COLD BREATH", "WHISPERS FADE",
    "SPIRIT WALK", "BEYOND THE VEIL", "HOLLOW ECHO", "SPECTRAL SIGHT",
    "LOST SOULS", "INVISIBLE HAND", "CHILL IN AIR", "MEMORY REMAINS"
  ],
  serpent: [
    "VENOM STRIKES", "TRUST NO ONE", "SILENT APPROACH", "COILED FATE",
    "FORKED TONGUE", "HIDDEN DANGER", "SLITHER IN DARK", "COLD BLOOD",
    "POISONED CHALICE", "SHED YOUR SKIN", "WAIT AND STRIKE", "EYES OPEN"
  ],
  demon: [
    "HELL TO PAY", "WICKED GAME", "SOUL FOR SALE", "INFERNAL LUCK", 
    "DOOMED PATH", "CURSED COIN", "THE BEAST RISES", "DARK PACT",
    "ETERNAL FLAME", "SINNER'S CHOICE", "ABYSS GAZES", "BLOOD OATH"
  ]
};

const GAME_PHRASES = [
  "FATE TURNS...", "DESTINY CALLS", "HOLD FAST", "A BOLD STRIKE", 
  "THE DIE IS CAST", "FORTUNE SMILES?", "DARKNESS WATCHES", "LIGHT REVEALS",
  "AGAIN!", "THE BALANCE SHIFTS", "WITNESS!", "NO RETREAT",
  "STEEL YOURSELF", "THE COIN KNOWS", "CHANCE OR FATE?", "DO NOT BLINK"
];

const WIN_QUOTES = [
  "I am the master of my fate,\nI am the captain of my soul.",
  "Success is counted sweetest\nBy those who ne'er succeed.",
  "To strive, to seek, to find,\nand not to yield.",
  "Fortune favors the bold.",
  "The stars incline us, they do not bind us.",
];

const LOSE_QUOTES = [
  "Look on my works, ye Mighty,\nand despair!",
  "The best laid schemes o' mice an' men\nGang aft a-gley.",
  "All hope abandon,\nye who enter here.",
  "This is the way the world ends,\nNot with a bang but a whimper.",
  "Dust thou art, and unto dust\nshalt thou return.",
];

const EXIT_PHRASES = [
  "[ RETURN TO SHADOWS ]",
  "[ FADE INTO DARKNESS ]",
  "[ FORSAKE YOUR FATE ]",
  "[ SEVER THE CONNECTION ]",
  "[ FLEE - YOU WILL RETURN ]",
  "[ DISSOLVE INTO VOID ]"
];

const GameMode = {
  FREE_PLAY: 'FREE_PLAY',
  SETUP: 'SETUP',
  GAME_ACTIVE: 'GAME_ACTIVE',
  GAME_RESULT: 'GAME_RESULT',
} as const;

type GameMode = typeof GameMode[keyof typeof GameMode];

interface GameState {
  targetFlips: number;
  chosenSide: CoinSide;
  currentFlips: number;
  gameHeads: number;
  gameTails: number;
}

export default function App() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [rotation, setRotation] = useState(0); 
  const [lastResult, setLastResult] = useState<CoinSide | null>(null);
  const [message, setMessage] = useState<string>("");
  const [stats, setStats] = useState({ heads: 0, tails: 0 });

  // Hand State
  const [isHandFlicking, setIsHandFlicking] = useState(false);
  const [isHandEntering, setIsHandEntering] = useState(false); // Blocks input during enter animation

  const [mode, setMode] = useState<GameMode>(GameMode.FREE_PLAY);
  const [gameState, setGameState] = useState<GameState>({
    targetFlips: 3,
    chosenSide: CoinSide.HEADS,
    currentFlips: 0,
    gameHeads: 0,
    gameTails: 0,
  });

  const [headsFace, setHeadsFace] = useState<CoinFaceType>('king');
  const [tailsFace, setTailsFace] = useState<CoinFaceType>('skull');
  
  const [exitPhrase, setExitPhrase] = useState(EXIT_PHRASES[0]);

  const silentAudioRef = useRef<HTMLAudioElement>(null);

  const playerWins = 
    (gameState.chosenSide === CoinSide.HEADS && gameState.gameHeads > gameState.gameTails) ||
    (gameState.chosenSide === CoinSide.TAILS && gameState.gameTails > gameState.gameHeads);

  const isDraw = gameState.gameHeads === gameState.gameTails;

  // Hand is visible in Active AND Result (to maintain presence)
  const isHandVisible = mode === GameMode.GAME_ACTIVE || mode === GameMode.GAME_RESULT;
  
  // Scene should render in all modes except SETUP (where we might want a clean menu, or maybe overlay setup too? keeping setup as separate for now)
  const showScene = mode !== GameMode.SETUP;

  const isGameEnding = mode === GameMode.GAME_ACTIVE && gameState.currentFlips >= gameState.targetFlips;
  
  const isHandCrumbling = false;

  useEffect(() => {
    const handleInteraction = () => {
        unlockAudioContext();
        if (silentAudioRef.current) {
            silentAudioRef.current.muted = false; 
            silentAudioRef.current.play().catch(e => console.log("Silent audio play failed", e));
        }
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (mode === GameMode.GAME_RESULT) {
      // Pick random exit phrase
      setExitPhrase(EXIT_PHRASES[Math.floor(Math.random() * EXIT_PHRASES.length)]);
      
      if (isDraw) {
        playLose();
      } else if (playerWins) {
        playWin();
      } else {
        playLose();
      }
    }
  }, [mode, playerWins, isDraw]);

  const triggerFlipLogic = useCallback(() => {
    const isHeads = Math.random() > 0.5;
    const newResult = isHeads ? CoinSide.HEADS : CoinSide.TAILS;

    const isRare = Math.random() < 0.05;
    let selectedFace: CoinFaceType;
    let nextHeads = headsFace;
    let nextTails = tailsFace;

    if (isHeads) {
      selectedFace = isRare ? RARE_HEADS : HEADS_VARIANTS[Math.floor(Math.random() * HEADS_VARIANTS.length)];
      nextHeads = selectedFace;
    } else {
      selectedFace = isRare ? RARE_TAILS : TAILS_VARIANTS[Math.floor(Math.random() * TAILS_VARIANTS.length)];
      nextTails = selectedFace;
    }
    
    setHeadsFace(nextHeads);
    setTailsFace(nextTails);

    let randomMsg = "";
    if (mode === GameMode.FREE_PLAY) {
        const phrases = PHRASES[selectedFace];
        randomMsg = phrases[Math.floor(Math.random() * phrases.length)];
    } else {
        randomMsg = GAME_PHRASES[Math.floor(Math.random() * GAME_PHRASES.length)];
    }

    const minSpins = 5;
    const degreesPerSpin = 360;
    const baseRotation = minSpins * degreesPerSpin;
    
    let targetRotation = rotation + baseRotation;
    const currentMod = targetRotation % 360;
    const targetMod = isHeads ? 0 : 180;
    
    let adjustment = targetMod - currentMod;
    if (adjustment <= 0) adjustment += 360;
    
    targetRotation += adjustment;
    setRotation(targetRotation);

    setTimeout(() => {
      setIsFlipping(false);
      setLastResult(newResult);
      setMessage(randomMsg);
      playCoinLand(isHeads); 
      
      setStats(prev => ({
        heads: prev.heads + (isHeads ? 1 : 0),
        tails: prev.tails + (!isHeads ? 1 : 0)
      }));

      if (mode === GameMode.GAME_ACTIVE) {
        setGameState(prev => {
          if (prev.currentFlips >= prev.targetFlips) return prev;

          const newState = {
            ...prev,
            currentFlips: prev.currentFlips + 1,
            gameHeads: prev.gameHeads + (isHeads ? 1 : 0),
            gameTails: prev.gameTails + (!isHeads ? 1 : 0),
          };

          if (newState.currentFlips >= prev.targetFlips) {
            // Reduced delay from 1500 to 600ms
            setTimeout(() => setMode(GameMode.GAME_RESULT), 600);
          }
          
          return newState;
        });
      }

    }, 1500);
  }, [mode, rotation, headsFace, tailsFace, gameState]);

  const handleFlip = useCallback(() => {
    // Guards
    if (isFlipping) return;
    if (isHandFlicking) return; 
    if (mode === GameMode.SETUP) return; 

    unlockAudioContext();
    if (silentAudioRef.current) silentAudioRef.current.play().catch(() => {});

    if (isHandEntering) {
        playBlip(); 
        return;     
    }

    if (mode === GameMode.GAME_RESULT) {
        return;
    }

    if (mode === GameMode.GAME_ACTIVE && gameState.currentFlips >= gameState.targetFlips) {
       return;
    }

    // Execution
    if (mode === GameMode.FREE_PLAY) {
        setIsFlipping(true);
        playCoinFlip();
        triggerFlipLogic();
    } else {
        // Immediately lock input
        setIsHandFlicking(true);
        
        setTimeout(() => {
            setIsFlipping(true);
            playCoinFlip(); 
            triggerFlipLogic();
            setIsHandFlicking(false); 
        }, 100); 
    }

  }, [isFlipping, isHandFlicking, mode, gameState, triggerFlipLogic, isHandEntering]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (mode === GameMode.FREE_PLAY || mode === GameMode.GAME_ACTIVE) {
           e.preventDefault(); 
           handleFlip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, mode]);

  const startGame = () => {
    const isRestarting = mode === GameMode.GAME_RESULT;

    // Only play organ when starting from SETUP (Free Play -> Active)
    if (!isRestarting) {
        playOrganStart();
    } else {
        // When restarting from Result screen, use a lighter sound
        playBlip();
    }

    setGameState({
      targetFlips: gameState.targetFlips,
      chosenSide: gameState.chosenSide,
      currentFlips: 0,
      gameHeads: 0,
      gameTails: 0,
    });
    setMode(GameMode.GAME_ACTIVE);
    setLastResult(null);
    // REMOVED: setRotation(0);  -- Keeps the coin where it landed to avoid spin-back
    
    // Only lock input if we are doing the entrance animation (coming from Setup)
    if (!isRestarting) {
        setIsHandEntering(true);
        setTimeout(() => {
            setIsHandEntering(false);
        }, 1100); 
    } else {
        setIsHandEntering(false);
    }
  };

  const resetToMenu = () => {
    if (mode === GameMode.GAME_ACTIVE && gameState.currentFlips >= gameState.targetFlips) {
        return;
    }

    if (mode === GameMode.GAME_ACTIVE) {
        playWind(); 
    } else {
        playBlip();
    }
    setMode(GameMode.FREE_PLAY);
    setLastResult(null);
    setIsHandEntering(false);
  };

  return (
    <div className="relative h-[100dvh] w-full bg-void-dark text-parchment font-retro overflow-hidden flex flex-col items-center justify-center select-none">
      <style>{`
        @keyframes resultEnter {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-result-enter {
          animation: resultEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <CRTEffect />
      <audio 
          ref={silentAudioRef} 
          src={SILENT_AUDIO} 
          muted 
          autoPlay={false} 
          loop={false} 
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} 
      />

      <div 
        className="relative w-full h-full flex flex-col items-center justify-center perspective-[800px] overflow-hidden bg-[#0c0a0a]"
        style={{
          boxShadow: 'inset 0 0 150px #000',
        }}
      >
        <div className="absolute inset-0 bg-[#0f0505]" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-90" />
        
        {/* Decorative Table Elements */}
        <TableDecor />

        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-full pointer-events-none z-0"
            style={{
                background: 'linear-gradient(to bottom, rgba(255, 230, 180, 0.05) 0%, transparent 90%)',
                clipPath: 'polygon(45% 0%, 55% 0%, 90% 100%, 10% 100%)',
                mixBlendMode: 'screen',
                filter: 'blur(4px)',
            }}
        />

        {showScene && (
          <>
             {/* === COIN & HAND === */}
            <div 
              className="relative preserve-3d transition-transform duration-700 z-10"
              style={{ 
                transform: 'rotateX(30deg) translateY(20px)', 
              }}
            >
              <Coin 
                rotation={rotation} 
                isFlipping={isFlipping} 
                onClick={handleFlip} 
                headsType={headsFace}
                tailsType={tailsFace}
              />
              <Hand isVisible={isHandVisible} isFlicking={isHandFlicking} isCrumbling={isHandCrumbling} />
            </div>

            {/* === UI OVERLAY === */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-20">
              
              <div className="flex justify-between w-full mx-auto pt-2 md:pt-4 px-0 items-start transition-all duration-300">
                 
                 {/* FREE PLAY HEADER (Rotated Cards) */}
                 {mode === GameMode.FREE_PLAY && (
                    <div className="w-full max-w-xl mx-auto flex justify-between">
                      <div className="transform -rotate-2">
                         <div className="bg-black/90 border border-stone-700 p-2 md:p-5 rounded-none text-center min-w-[80px] md:min-w-[130px] shadow-2xl backdrop-blur-sm">
                           <div className="text-stone-500 text-[10px] md:text-sm tracking-widest uppercase mb-1 font-bold">Total</div>
                           <div className="text-3xl md:text-5xl text-stone-300 font-bold drop-shadow-md font-retro">{stats.heads + stats.tails}</div>
                         </div>
                      </div>

                      <div className="flex gap-2 transform rotate-1">
                          <div className="bg-[#2a0a0a] border border-[#5c4033] p-2 md:p-5 rounded-none text-center min-w-[70px] md:min-w-[120px] shadow-2xl backdrop-blur-sm">
                            <div className="text-amber-500 text-[10px] md:text-sm tracking-widest uppercase mb-1 font-bold">Heads</div>
                            <div className="text-3xl md:text-5xl text-white font-bold drop-shadow-md font-retro">{stats.heads}</div>
                          </div>
                          
                          <div className="bg-slate-900 border border-slate-700 p-2 md:p-5 rounded-none text-center min-w-[70px] md:min-w-[120px] shadow-2xl backdrop-blur-sm">
                            <div className="text-slate-400 text-[10px] md:text-sm tracking-widest uppercase mb-1 font-bold">Tails</div>
                            <div className="text-3xl md:text-5xl text-white font-bold drop-shadow-md font-retro">{stats.tails}</div>
                          </div>
                      </div>
                    </div>
                 )}

                 {/* GAME ACTIVE HUD - PS1 FIGHTING STYLE */}
                 {mode === GameMode.GAME_ACTIVE && (
                    <div className="w-full flex justify-between items-start px-2 relative pointer-events-auto">
                        
                        {/* LEFT: HEADS SCORE */}
                        <div className={`
                            border-2 p-2 md:p-4 bg-[#1a0505] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            transition-all duration-300
                            ${gameState.chosenSide === CoinSide.HEADS ? 'border-gold-bright scale-105' : 'border-[#5c4033] opacity-80'}
                        `}>
                             <div className="text-[10px] md:text-xs text-amber-500 tracking-widest uppercase mb-1 font-bold">Heads</div>
                             <div className="text-3xl md:text-5xl text-gold-bright font-bold font-retro leading-none">
                                {gameState.gameHeads}
                             </div>
                        </div>

                        {/* CENTER: ROUND INFO */}
                        <div className="flex flex-col items-center mt-2">
                             <div className="bg-black border border-stone-600 px-4 py-1 text-parchment text-lg md:text-2xl font-bold tracking-[0.2em] shadow-lg">
                                 ROUND {gameState.currentFlips}/{gameState.targetFlips}
                             </div>
                             {!isGameEnding && (
                                <button 
                                    onClick={resetToMenu}
                                    className="mt-2 text-[10px] text-red-800 hover:text-red-500 uppercase tracking-widest bg-black/50 px-2"
                                >
                                    [ Yield ]
                                </button>
                             )}
                        </div>

                        {/* RIGHT: TAILS SCORE */}
                        <div className={`
                            border-2 p-2 md:p-4 bg-[#0f172a] shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)]
                            transition-all duration-300
                            ${gameState.chosenSide === CoinSide.TAILS ? 'border-slate-300 scale-105' : 'border-slate-700 opacity-80'}
                        `}>
                             <div className="text-[10px] md:text-xs text-slate-400 tracking-widest uppercase mb-1 font-bold text-right">Tails</div>
                             <div className="text-3xl md:text-5xl text-slate-200 font-bold font-retro leading-none text-right">
                                {gameState.gameTails}
                             </div>
                        </div>

                    </div>
                 )}
              </div>

              {/* BOTTOM: Compacted significantly */}
              <div className="text-center pb-8 md:pb-16 w-full max-w-4xl mx-auto pointer-events-auto">
                   
                   <div className={`transition-all duration-300 transform ${isFlipping ? 'opacity-0 translate-y-8 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
                     {(lastResult || mode === GameMode.GAME_ACTIVE) && (
                       <div className="inline-flex flex-col items-center gap-1 md:gap-6 mt-[-60px] md:mt-[-20px]">
                          {/* Only show big letter in Free Play or if specifically desired. In Active, HUD handles score. 
                              Let's keep big letter for impact but maybe smaller in Active? 
                              Actually, keeping it consistent is fine.
                           */}
                          {lastResult && mode !== GameMode.GAME_RESULT && (
                              <div className={`text-5xl md:text-9xl tracking-widest font-bold drop-shadow-[6px_6px_0_rgba(0,0,0,0.8)] ${lastResult === CoinSide.HEADS ? 'text-gold-bright' : 'text-slate-300'}`}>
                                 {lastResult}
                              </div>
                          )}
                          
                          {message && mode !== GameMode.GAME_RESULT && (
                            <div className="relative group mt-0 md:mt-4">
                                <div className={`absolute inset-0 border-2 transform rotate-1 shadow-2xl rounded-none transition-colors duration-500 ${
                                    (lastResult === CoinSide.HEADS || (!lastResult && mode === GameMode.GAME_ACTIVE && gameState.chosenSide === CoinSide.HEADS)) 
                                    ? 'bg-[#2a0a0a] border-[#5c4033]' 
                                    : (lastResult === CoinSide.TAILS ? 'bg-slate-900 border-slate-700' : 'bg-[#1a0a05] border-stone-800')
                                }`}></div>
                                
                                <div className={`absolute inset-1 border transition-colors duration-500 ${
                                    lastResult === CoinSide.HEADS
                                    ? 'bg-[#1a0505] border-[#3e2723]'
                                    : (lastResult === CoinSide.TAILS ? 'bg-slate-950 border-slate-800' : 'bg-[#0c0502] border-stone-900')
                                }`}></div>
                                
                                <div className="absolute top-2 left-2 w-1 h-1 bg-gold-dim rounded-none shadow-sm"></div>
                                <div className="absolute top-2 right-2 w-1 h-1 bg-gold-dim rounded-none shadow-sm"></div>
                                <div className="absolute bottom-2 left-2 w-1 h-1 bg-gold-dim rounded-none shadow-sm"></div>
                                <div className="absolute bottom-2 right-2 w-1 h-1 bg-gold-dim rounded-none shadow-sm"></div>

                                <div className="relative bg-transparent py-2 px-4 md:py-4 md:px-10 min-w-[200px] md:min-w-[300px]">
                                  <div className={`text-base md:text-2xl tracking-[0.2em] font-bold uppercase drop-shadow-md ${lastResult === CoinSide.HEADS ? 'text-amber-100' : 'text-slate-200'}`}>
                                      {message}
                                  </div>
                                </div>
                            </div>
                          )}
                       </div>
                     )}
                     
                     {!lastResult && mode === GameMode.FREE_PLAY && (
                       <div className="flex flex-col gap-3 md:gap-6 mt-[-60px] md:mt-[-20px]">
                         <div className="inline-block px-4 py-2 md:px-6 md:py-3 bg-black/60 backdrop-blur-md border border-parchment-dim/30 rounded-none cursor-pointer hover:border-parchment transition-colors" onClick={handleFlip}>
                           <p className="text-parchment text-lg md:text-xl tracking-widest animate-pulse">
                             [ CLICK THE COIN TO DECIDE ]
                           </p>
                         </div>
                         <button 
                            onClick={() => {
                                playBlip();
                                setMode(GameMode.SETUP);
                            }}
                            className="text-stone-500 text-xs md:text-sm tracking-widest hover:text-gold-bright transition-colors uppercase p-2"
                         >
                            - Or Play the Game of Fate -
                         </button>
                       </div>
                     )}
                   </div>
                   
                
                {mode === GameMode.FREE_PLAY && lastResult && !isFlipping && (
                    <div className="mt-2 md:mt-8">
                         <button 
                            onClick={() => {
                                playBlip();
                                setMode(GameMode.SETUP);
                            }}
                            className="text-stone-500 text-[10px] md:text-xs tracking-widest hover:text-gold-bright transition-colors uppercase p-2"
                         >
                            - Try your luck in the Game of Fate -
                         </button>
                    </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* SETUP SCREEN */}
        {mode === GameMode.SETUP && (
          <div className="z-30 flex flex-col items-center gap-4 md:gap-8 bg-black/90 p-6 md:p-12 border-4 border-double border-parchment-dim max-w-md w-[90%] md:w-full backdrop-blur-sm max-h-[90dvh] overflow-y-auto">
             <h2 className="text-xl md:text-3xl text-parchment tracking-[0.2em] border-b-2 border-parchment-dim pb-2 md:pb-4">GAME OF FATE</h2>
             
             <div className="flex flex-col gap-2 md:gap-4 w-full">
               <label className="text-stone-400 text-xs md:text-sm tracking-widest uppercase">Choose your Alliance</label>
               <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        playBlip();
                        setGameState(p => ({...p, chosenSide: CoinSide.HEADS}));
                    }}
                    className={`flex-1 py-3 md:py-4 border-2 transition-all rounded-none ${gameState.chosenSide === CoinSide.HEADS ? 'border-gold-bright bg-yellow-900/20 text-gold-bright' : 'border-stone-700 text-stone-600'}`}
                  >
                    HEADS
                  </button>
                  <button 
                    onClick={() => {
                        playBlip();
                        setGameState(p => ({...p, chosenSide: CoinSide.TAILS}));
                    }}
                    className={`flex-1 py-3 md:py-4 border-2 transition-all rounded-none ${gameState.chosenSide === CoinSide.TAILS ? 'border-slate-300 bg-slate-900/40 text-slate-300' : 'border-stone-700 text-stone-600'}`}
                  >
                    TAILS
                  </button>
               </div>
             </div>

             <div className="flex flex-col gap-2 md:gap-4 w-full">
                <label className="text-stone-400 text-xs md:text-sm tracking-widest uppercase">Fate's Duration ({gameState.targetFlips} Flips)</label>
                <input 
                  type="range" 
                  min="3" 
                  max="28" 
                  value={gameState.targetFlips}
                  onChange={(e) => {
                      playBlip();
                      setGameState(p => ({...p, targetFlips: parseInt(e.target.value)}));
                  }}
                  className="w-full h-4 bg-stone-800 rounded-none appearance-none cursor-pointer accent-gold-bright"
                />
             </div>

             <div className="flex flex-col gap-2 w-full mt-2 md:mt-4">
                <button 
                  onClick={startGame}
                  className="w-full py-3 md:py-3 bg-parchment text-black font-bold text-lg md:text-xl tracking-widest hover:bg-gold-bright transition-colors rounded-none border-2 border-transparent hover:border-white"
                >
                  BEGIN
                </button>
                <button 
                  onClick={resetToMenu}
                  className="text-stone-500 text-xs md:text-sm tracking-widest hover:text-white mt-2 uppercase py-2"
                >
                  [ FLEE - YOU WILL RETURN ]
                </button>
             </div>
          </div>
        )}

        {/* RESULT OVERLAY (Scene is visible underneath) */}
        {mode === GameMode.GAME_RESULT && (
           <div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center p-4 bg-black/50 pointer-events-none animate-result-enter">
              
              <div className="mb-8 transform scale-125 md:scale-150">
                <div className={`text-6xl md:text-9xl font-bold tracking-widest drop-shadow-[0_10px_10px_rgba(0,0,0,1)] ${
                    playerWins 
                        ? 'text-gold-bright animate-pulse' 
                        : (isDraw ? 'text-stone-400' : 'text-blood animate-pulse')
                }`}>
                   {isDraw ? "STALEMATE" : (playerWins ? "VICTORY" : "DEFEAT")}
                </div>
              </div>

              <div className="bg-black/80 border-2 border-stone-500 p-6 md:p-8 max-w-2xl w-full backdrop-blur-sm shadow-2xl pointer-events-auto">
                 <p className="text-lg md:text-2xl text-parchment italic font-serif leading-relaxed whitespace-pre-line mb-8">
                   "{isDraw 
                      ? "Balance is the law of nature." 
                      : (playerWins 
                          ? WIN_QUOTES[Math.floor(Math.random() * WIN_QUOTES.length)] 
                          : LOSE_QUOTES[Math.floor(Math.random() * LOSE_QUOTES.length)]
                        )
                    }"
                 </p>

                 <div className="flex justify-center gap-12 mb-8 border-t border-b border-stone-800 py-4">
                     <div className="flex flex-col">
                        <span className="text-xs text-stone-500 uppercase mb-1">HEADS</span>
                        <span className="text-4xl text-gold-bright font-retro">{gameState.gameHeads}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs text-stone-500 uppercase mb-1">TAILS</span>
                        <span className="text-4xl text-slate-300 font-retro">{gameState.gameTails}</span>
                     </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <button 
                    onClick={startGame}
                    className="w-full py-4 border-2 border-parchment text-parchment hover:bg-parchment hover:text-black transition-all uppercase tracking-[0.2em] text-xl font-bold rounded-none"
                    >
                    TEMPT FATE AGAIN
                    </button>
                    <button 
                    onClick={resetToMenu}
                    className="text-stone-500 hover:text-stone-300 text-sm tracking-widest uppercase p-2"
                    >
                    {exitPhrase}
                    </button>
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
