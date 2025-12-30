import React, { useMemo } from 'react';

export type CoinFaceType = 'king' | 'sun' | 'jester' | 'dragon' | 'harvest' | 'skull' | 'ghost' | 'demon' | 'serpent';

interface CoinProps {
  rotation: number;
  isFlipping: boolean;
  onClick: () => void;
  headsType: CoinFaceType;
  tailsType: CoinFaceType;
}

const SIZE = 16;

// --- COLOR PALETTES ---
const COLORS = {
  // Gold Side
  goldBody: '#F59E0B',    // Amber 500
  goldFeature: '#78350F', // Amber 900
  goldHighlight: '#FEF3C7', // Amber 100
  goldEdge1: '#D97706',
  goldEdge2: '#92400E',
  goldBg: '#FEF3C7',     

  // Silver Side
  silverBody: '#cbd5e1',  // Slate 300
  silverFeature: '#475569', // Slate 600
  silverHighlight: '#ffffff',
  silverEdge1: '#64748b',
  silverEdge2: '#1e293b', // Slate 800
  silverBg: '#FEF3C7'     
};

// --- SHAPE MASK ---
const CIRCLE_MASK = [
  "0000001111000000",
  "0000111111110000",
  "0001111111111000",
  "0011111111111100",
  "0111111111111110",
  "0111111111111110",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "1111111111111111",
  "0111111111111110",
  "0111111111111110",
  "0011111111111100",
  "0001111111111000",
  "0000111111110000",
  "0000001111000000",
];

// --- FACE DESIGNS ---
const FACES: Record<CoinFaceType, string[]> = {
  // --- HEADS (GOLD) ---
  king: [
    "0000000000000000",
    "0000002020000000",
    "0000202020200000",
    "0000222222200000",
    "0000000000000000",
    "0000200000020000",
    "0000200000020000",
    "0000000000000000",
    "0000002002000000",
    "0000022222200000",
    "0000002222000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  sun: [
    "0000000220000000",
    "0000200000020000",
    "0000000000000000",
    "0020000000000200",
    "0000002002000000",
    "0000002002000000",
    "0200000000000020",
    "0200000220000020",
    "0000002222000000",
    "0020020000200200",
    "0000000000000000",
    "0000200000020000",
    "0000000220000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  jester: [
    "0000000000000000",
    "0000002020000000",
    "0000020002000000",
    "0000022222000000",
    "0000000000000000",
    "0000020002000000",
    "0000000000000000",
    "0000000200000000",
    "0002000000020000",
    "0002200000220000",
    "0000222222200000",
    "0000022222000000",
    "0000000000000000",
    "0000000000000000",
  ],
  dragon: [
    "0000000000000000",
    "0000002002000000",
    "0000020000200000",
    "0000222222220000",
    "0002002200002000",
    "0020002200000200",
    "0020002200000200",
    "0020002200000200",
    "0020002200000200",
    "0002002200002000",
    "0000222222220000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],
  harvest: [
    "0000000000000000",
    "0002000000002000",
    "0002000220002000",
    "0002200220022000",
    "0002200220022000",
    "0000220220220000",
    "0000222222220000",
    "0000022222200000",
    "0000002222000000",
    "0000000220000000",
    "0000000220000000",
    "0000000220000000",
    "0000000220000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ],

  // --- TAILS (SILVER) ---
  
  skull: [
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000022222200000",
    "0000020202200000",
    "0000022222200000",
    "0000002022000000",
    "0000022222220000",
    "0000220002200000",
    "0000220002200000",
    "0000222222222000",
    "0000222222222000",
    "0000002222200000",
    "0000000000000000",
    "0000000000000000",
  ],
  ghost: [
    "0000000000000000",
    "0000001111000000",
    "0000111111110000",
    "0001111111111000",
    "0001101100111000",
    "0001111111111000",
    "0001111111111000", 
    "0001111111111000",
    "0001111111111000",
    "0001111111111000",
    "0001111111111000",
    "0001111111111000",
    "0001110111011100",
    "0001000100010000", 
    "0000000000000000",
    "0000000000000000",
  ],
  serpent: [
    "0000000000000000",
    "0000022222000000",
    "0000220202000000",
    "0002022222200000",
    "0020220000000000",
    "0000220000000000",
    "0000022222000000",
    "0000000002200000",
    "0000000022000000",
    "0000000220000000",
    "0000022200000000",
    "0000220000000000",
    "0000222222200000",
    "0000222222200000",
    "0000000000000000",
    "0000000000000000",
  ],
  demon: [
    "0000000000000000",
    "0002000000002000",
    "0002200000022000",
    "0000220000220000",
    "0000022222200000",
    "0000020000200000",
    "0000020000200000",
    "0000022222200000",
    "0000002222000000", 
    "0000002222000000",
    "0000020000200000",
    "0000020220200000",
    "0000002002000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
  ]
};

const createCoinLayer = (
  colorBody: string, 
  colorFeature: string, 
  grid: string[],
  isEdge: boolean = false,
  bgColor: string | null = null
) => {
  const pixels = [];

   if (!isEdge && bgColor) {
     pixels.push(
        <circle key="bg-circle" cx={SIZE/2} cy={SIZE/2} r={SIZE/2 - 0.5} fill={bgColor} />
     );
  }
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (CIRCLE_MASK[y][x] === '1') {
        const char = grid?.[y]?.[x] ?? '0';
        let fill = colorBody;
        
        if (char === '2') fill = colorFeature;
        if (char === '1') fill = colorFeature;
        
        if (isEdge && char === '0') fill = colorBody; 

        if (isEdge) {
            const isRidge = (x + y) % 2 === 0;
            fill = isRidge ? colorBody : colorFeature;
        }

        if (!isEdge && char === '0') {
           fill = colorBody;
        }
        
        pixels.push(
          <rect 
            key={`${x}-${y}`} 
            x={x} 
            y={y} 
            width="1.05"
            height="1.05" 
            fill={fill} 
          />
        );
      }
    }
  }

  return ( <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${SIZE} ${SIZE}`} shapeRendering="crispEdges">
      {pixels}
    </svg>
  );
   
};


export const Coin: React.FC<CoinProps> = ({ rotation, isFlipping, onClick, headsType, tailsType }) => {
  const LAYERS = 16; 
  
  const headsSVG = useMemo(() => createCoinLayer(COLORS.goldBody, COLORS.goldFeature, FACES[headsType], false, COLORS.goldBg), [headsType]);
  const tailsSVG = useMemo(() => createCoinLayer(COLORS.silverBody, COLORS.silverFeature, FACES[tailsType], false, COLORS.silverBg), [tailsType]);
  
  const edgeGoldSVG = useMemo(() => createCoinLayer(COLORS.goldEdge1, COLORS.goldEdge2, [], true), []);
  const edgeSilverSVG = useMemo(() => createCoinLayer(COLORS.silverEdge1, COLORS.silverEdge2, [], true), []);

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      
      {/* Shadow - Updated to Black for Slate Board */}
      <div className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-40 h-16 bg-black/70 rounded-[50%] blur-lg filter
        transition-all duration-300
        ${isFlipping ? 'scale-50 opacity-20 blur-2xl' : 'animate-shadow-idle'} 
      `} />

      {/* Idle Animation Wrapper */}
      <div className={`relative preserve-3d ${!isFlipping ? 'animate-idle-float' : ''}`}>
        
        {/* Bounce Container */}
        <div className={`
          relative w-64 h-64 preserve-3d
          ${isFlipping ? 'animate-jump' : 'hover:scale-105 transition-transform duration-200'}
        `}>
          
          {/* Rotation Container */}
          <div 
            className="w-full h-full preserve-3d"
            style={{ 
              transform: `rotateX(${rotation}deg) rotateY(15deg)`, 
              transition: isFlipping ? 'transform 1.5s ease-in-out' : 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {Array.from({ length: LAYERS }).map((_, i) => {
              const z = i - (LAYERS / 2);
              let Content = edgeGoldSVG; 
              let extraTransform = '';

              if (i === 0) {
                 Content = tailsSVG;
                 extraTransform = 'rotateY(180deg) rotateZ(180deg)';
              } 
              else if (i === LAYERS - 1) {
                 Content = headsSVG;
              }
              else {
                Content = i > LAYERS / 2 ? edgeGoldSVG : edgeSilverSVG;
              }

              return (
                <div
                  key={i}
                  className="absolute inset-0 backface-hidden rounded-full overflow-hidden"
                  style={{
                    transform: `translateZ(${z}px) ${extraTransform}`,
                    scale: '1.02' 
                  }}
                >
                  {Content}
                  {i > 0 && i < LAYERS - 1 && (
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                  )}
                </div>
              );
            })}
            
          </div>
        </div>
      </div>
    </div>
  );
};
