import { useState, useCallback, useEffect } from 'react';
import { Coin, type CoinFaceType } from './components/Coin';
import { CRTEffect } from './components/CRTEffect';
import { CoinSide } from './types';
import { playBlip, playSelect, playCoinFlip, playCoinLand, playWin, playLose } from './sounds';

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

const woodPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`;

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

  const playerWins = 
    (gameState.chosenSide === CoinSide.HEADS && gameState.gameHeads > gameState.gameTails) ||
    (gameState.chosenSide === CoinSide.TAILS && gameState.gameTails > gameState.gameHeads);

  const isDraw = gameState.gameHeads === gameState.gameTails;

  useEffect(() => {
    if (mode === GameMode.GAME_RESULT) {
      if (isDraw) {
        playLose();
      } else if (playerWins) {
        playWin();
      } else {
        playLose();
      }
    }
  }, [mode, playerWins, isDraw]);

  const handleFlip = useCallback(() => {
    if (isFlipping) return;
    if (mode === GameMode.GAME_RESULT) return;
    if (mode === GameMode.SETUP) return; 

    if (mode === GameMode.GAME_ACTIVE && gameState.currentFlips >= gameState.targetFlips) {
      return;
    }

    setIsFlipping(true);
    playCoinFlip(); 

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
          const newState = {
            ...prev,
            currentFlips: prev.currentFlips + 1,
            gameHeads: prev.gameHeads + (isHeads ? 1 : 0),
            gameTails: prev.gameTails + (!isHeads ? 1 : 0),
          };

          if (newState.currentFlips >= prev.targetFlips) {
            setTimeout(() => setMode(GameMode.GAME_RESULT), 1000);
          }
          
          return newState;
        });
      }

    }, 1500);

  }, [isFlipping, rotation, headsFace, tailsFace, mode, gameState]);

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
    playSelect();
    setGameState({
      targetFlips: gameState.targetFlips,
      chosenSide: gameState.chosenSide,
      currentFlips: 0,
      gameHeads: 0,
      gameTails: 0,
    });
    setMode(GameMode.GAME_ACTIVE);
    setLastResult(null);
    setRotation(0); 
  };

  const resetToMenu = () => {
    playBlip();
    setMode(GameMode.FREE_PLAY);
    setLastResult(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-void-dark text-parchment font-retro overflow-hidden flex flex-col items-center justify-center select-none">
      <CRTEffect />
      
      <div 
        className="relative w-full h-screen flex flex-col items-center justify-center perspective-[800px] overflow-hidden bg-wood-dark"
        style={{
          boxShadow: 'inset 0 0 150px #000',
        }}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#4a0404] to-[#21140e]"
          style={{ backgroundImage: woodPattern, backgroundSize: '200px' }}
        />
        
        <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-full pointer-events-none z-0"
            style={{
                background: 'linear-gradient(to bottom, rgba(255, 230, 180, 0.2) 0%, transparent 90%)',
                clipPath: 'polygon(45% 0%, 55% 0%, 90% 100%, 10% 100%)',
                mixBlendMode: 'screen',
                filter: 'blur(4px)',
            }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none mix-blend-screen" 
          style={{
             background: 'radial-gradient(circle, rgba(255,220,150,0.3) 0%, rgba(255,180,100,0.05) 50%, transparent 70%)',
             filter: 'blur(30px)',
          }}
        />
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />


        {(mode === GameMode.FREE_PLAY || mode === GameMode.GAME_ACTIVE) && (
          <>
            <div 
              className="relative preserve-3d transition-transform duration-700 z-10"
              style={{ 
                transform: 'rotateX(30deg) translateY(-40px)', 
              }}
            >
              <Coin 
                rotation={rotation} 
                isFlipping={isFlipping} 
                onClick={handleFlip} 
                headsType={headsFace}
                tailsType={tailsFace}
              />
            </div>

            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-20">
              
              <div className="flex justify-between w-full max-w-xl mx-auto pt-2 md:pt-8 px-0 md:px-2 items-start transition-all duration-300">
                 {mode === GameMode.FREE_PLAY ? (
                    <>
                      <div className="transform -rotate-2">
                         <div className="bg-black/90 border border-stone-700 p-3 md:p-5 rounded-sm text-center min-w-[110px] md:min-w-[130px] shadow-2xl backdrop-blur-sm">
                           <div className="text-stone-500 text-xs md:text-sm tracking-widest uppercase mb-1 font-bold">Total</div>
                           <div className="text-4xl md:text-5xl text-stone-300 font-bold drop-shadow-md font-retro">{stats.heads + stats.tails}</div>
                         </div>
                      </div>

                      <div className="flex gap-2 transform rotate-1">
                          <div className="bg-[#2a0a0a] border border-[#5c4033] p-3 md:p-5 rounded-sm text-center min-w-[100px] md:min-w-[120px] shadow-2xl backdrop-blur-sm">
                            <div className="text-amber-500 text-xs md:text-sm tracking-widest uppercase mb-1 font-bold">Heads</div>
                            <div className="text-4xl md:text-5xl text-white font-bold drop-shadow-md font-retro">{stats.heads}</div>
                          </div>
                          
                          <div className="bg-slate-900 border border-slate-700 p-3 md:p-5 rounded-sm text-center min-w-[100px] md:min-w-[120px] shadow-2xl backdrop-blur-sm">
                            <div className="text-slate-400 text-xs md:text-sm tracking-widest uppercase mb-1 font-bold">Tails</div>
                            <div className="text-4xl md:text-5xl text-white font-bold drop-shadow-md font-retro">{stats.tails}</div>
                          </div>
                      </div>
                    </>
                 ) : (
                    <div className="w-full flex justify-center">
                      <div className="flex flex-col items-center gap-2 md:gap-3 bg-black/60 p-4 md:p-6 rounded-lg backdrop-blur-md border border-stone-600">
                        <div className="text-parchment text-xl md:text-2xl tracking-[0.2em] font-bold drop-shadow-md">
                          FLIP {gameState.currentFlips} / {gameState.targetFlips}
                        </div>
                        <div className="flex gap-6 md:gap-8">
                            <div className={`text-2xl md:text-4xl font-bold transition-all duration-300 ${gameState.chosenSide === CoinSide.HEADS ? 'text-gold-bright scale-110' : 'text-slate-500'}`}>
                              HEADS: {gameState.gameHeads}
                            </div>
                            <div className={`text-2xl md:text-4xl font-bold transition-all duration-300 ${gameState.chosenSide === CoinSide.TAILS ? 'text-slate-300 scale-110' : 'text-slate-700'}`}>
                              TAILS: {gameState.gameTails}
                            </div>
                        </div>
                      </div>
                    </div>
                 )}
              </div>

              <div className="text-center pb-4 md:pb-16 w-full max-w-4xl mx-auto pointer-events-auto">
                
                   <div className={`transition-all duration-300 transform ${isFlipping ? 'opacity-0 translate-y-8 blur-sm' : 'opacity-100 translate-y-0 blur-0'}`}>
                     {(lastResult || mode === GameMode.GAME_ACTIVE) && (
                       <div className="inline-flex flex-col items-center gap-2 md:gap-6 pt-12 md:pt-24">
                          {lastResult && (
                              <div className={`text-5xl md:text-9xl tracking-widest font-bold drop-shadow-[6px_6px_0_rgba(0,0,0,0.8)] ${lastResult === CoinSide.HEADS ? 'text-gold-bright' : 'text-slate-300'}`}>
                                 {lastResult}
                              </div>
                          )}
                          
                          {message && (
                            <div className="relative group mt-2 md:mt-4">
                                <div className={`absolute inset-0 border-2 transform rotate-1 shadow-2xl rounded-sm transition-colors duration-500 ${
                                    (lastResult === CoinSide.HEADS || (!lastResult && mode === GameMode.GAME_ACTIVE && gameState.chosenSide === CoinSide.HEADS)) 
                                    ? 'bg-[#2a0a0a] border-[#5c4033]' 
                                    : (lastResult === CoinSide.TAILS ? 'bg-slate-900 border-slate-700' : 'bg-[#1a0a05] border-stone-800')
                                }`}></div>
                                
                                <div className={`absolute inset-1 border transition-colors duration-500 ${
                                    lastResult === CoinSide.HEADS
                                    ? 'bg-[#1a0505] border-[#3e2723]'
                                    : (lastResult === CoinSide.TAILS ? 'bg-slate-950 border-slate-800' : 'bg-[#0c0502] border-stone-900')
                                }`}></div>
                                
                                <div className="absolute top-2 left-2 w-1 h-1 bg-gold-dim rounded-full shadow-sm"></div>
                                <div className="absolute top-2 right-2 w-1 h-1 bg-gold-dim rounded-full shadow-sm"></div>
                                <div className="absolute bottom-2 left-2 w-1 h-1 bg-gold-dim rounded-full shadow-sm"></div>
                                <div className="absolute bottom-2 right-2 w-1 h-1 bg-gold-dim rounded-full shadow-sm"></div>

                                <div className="relative bg-transparent py-2 px-6 md:py-4 md:px-10 min-w-[240px] md:min-w-[300px]">
                                  <div className={`text-lg md:text-2xl tracking-[0.2em] font-bold uppercase drop-shadow-md ${lastResult === CoinSide.HEADS ? 'text-amber-100' : 'text-slate-200'}`}>
                                      {message}
                                  </div>
                                </div>
                            </div>
                          )}
                       </div>
                     )}
                     
                     {!lastResult && mode === GameMode.FREE_PLAY && (
                       <div className="flex flex-col gap-4 md:gap-6 pt-12 md:pt-24">
                         <div className="inline-block px-4 py-2 md:px-6 md:py-3 bg-black/60 backdrop-blur-md border border-parchment-dim/30 rounded-lg cursor-pointer hover:border-parchment transition-colors" onClick={handleFlip}>
                           <p className="text-parchment text-lg md:text-xl tracking-widest animate-pulse">
                             [ CLICK THE COIN TO DECIDE ]
                           </p>
                         </div>
                         <button 
                            onClick={() => {
                                playBlip();
                                setMode(GameMode.SETUP);
                            }}
                            className="text-stone-500 text-xs md:text-sm tracking-widest hover:text-gold-bright transition-colors uppercase"
                         >
                            - Or Play the Game of Fate -
                         </button>
                       </div>
                     )}
                   </div>
                
                {mode === GameMode.FREE_PLAY && lastResult && !isFlipping && (
                    <div className="mt-4 md:mt-8">
                         <button 
                            onClick={() => {
                                playBlip();
                                setMode(GameMode.SETUP);
                            }}
                            className="text-stone-500 text-[10px] md:text-xs tracking-widest hover:text-gold-bright transition-colors uppercase"
                         >
                            - Try your luck in the Game of Fate -
                         </button>
                    </div>
                )}
              </div>
            </div>
          </>
        )}

        {mode === GameMode.SETUP && (
          <div className="z-30 flex flex-col items-center gap-6 md:gap-8 bg-black/80 p-6 md:p-12 border-4 border-double border-parchment-dim max-w-md w-[90%] md:w-full backdrop-blur-md max-h-screen overflow-y-auto">
             <h2 className="text-xl md:text-3xl text-parchment tracking-[0.2em] border-b border-parchment-dim pb-4">GAME OF FATE</h2>
             
             <div className="flex flex-col gap-2 md:gap-4 w-full">
               <label className="text-stone-400 text-xs md:text-sm tracking-widest uppercase">Choose your Alliance</label>
               <div className="flex gap-4">
                  <button 
                    onClick={() => {
                        playBlip();
                        setGameState(p => ({...p, chosenSide: CoinSide.HEADS}));
                    }}
                    className={`flex-1 py-2 md:py-4 border-2 transition-all ${gameState.chosenSide === CoinSide.HEADS ? 'border-gold-bright bg-yellow-900/20 text-gold-bright' : 'border-stone-700 text-stone-600'}`}
                  >
                    HEADS
                  </button>
                  <button 
                    onClick={() => {
                        playBlip();
                        setGameState(p => ({...p, chosenSide: CoinSide.TAILS}));
                    }}
                    className={`flex-1 py-2 md:py-4 border-2 transition-all ${gameState.chosenSide === CoinSide.TAILS ? 'border-slate-300 bg-slate-900/40 text-slate-300' : 'border-stone-700 text-stone-600'}`}
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
                  className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-gold-bright"
                />
             </div>

             <div className="flex flex-col gap-3 w-full mt-2 md:mt-4">
                <button 
                  onClick={startGame}
                  className="w-full py-2 md:py-3 bg-parchment text-black font-bold text-lg md:text-xl tracking-widest hover:bg-gold-bright transition-colors"
                >
                  BEGIN
                </button>
                <button 
                  onClick={resetToMenu}
                  className="text-stone-500 text-xs md:text-sm tracking-widest hover:text-white mt-2 uppercase"
                >
                  [ FLEE - YOU WILL RETURN ]
                </button>
             </div>
          </div>
        )}

        {mode === GameMode.GAME_RESULT && (
           <div className="z-30 flex flex-col items-center text-center p-4 md:p-8 max-w-2xl w-full">
              <div className={`text-4xl md:text-6xl mb-4 md:mb-6 font-bold tracking-widest ${playerWins ? 'text-gold-bright animate-pulse' : 'text-blood'}`}>
                 {isDraw ? "STALEMATE" : (playerWins ? "VICTORY" : "DEFEAT")}
              </div>

              <div className="bg-black/60 border border-stone-700 p-4 md:p-8 rounded-lg backdrop-blur-md w-full mb-6 md:mb-8">
                 <p className="text-lg md:text-2xl text-parchment italic font-serif leading-relaxed whitespace-pre-line">
                   "{isDraw 
                      ? "Balance is the law of nature." 
                      : (playerWins 
                          ? WIN_QUOTES[Math.floor(Math.random() * WIN_QUOTES.length)] 
                          : LOSE_QUOTES[Math.floor(Math.random() * LOSE_QUOTES.length)]
                        )
                    }"
                 </p>
              </div>

              <div className="flex gap-8 md:gap-12 text-xl md:text-2xl mb-8 md:mb-12 font-bold tracking-widest">
                 <div className="flex flex-col">
                   <span className="text-[10px] md:text-xs text-stone-500 uppercase mb-2">HEADS</span>
                   <span className="text-gold-bright">{gameState.gameHeads}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] md:text-xs text-stone-500 uppercase mb-2">TAILS</span>
                   <span className="text-slate-300">{gameState.gameTails}</span>
                 </div>
              </div>

              <div className="flex flex-col gap-3 md:gap-4 w-full max-w-xs">
                <button 
                  onClick={startGame}
                  className="px-6 py-2 md:px-8 md:py-3 border border-parchment text-parchment hover:bg-parchment hover:text-black transition-all uppercase tracking-widest text-sm md:text-base"
                >
                   Tempt Fate Again
                </button>
                <button 
                  onClick={resetToMenu}
                  className="text-stone-600 text-xs md:text-sm hover:text-stone-400 transition-colors uppercase tracking-[0.2em]"
                >
                  [ FLEE - YOU WILL RETURN ]
                </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
