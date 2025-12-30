import React, { useMemo } from 'react';

interface HandProps {
  isFlicking: boolean;
  isVisible: boolean;
  isCrumbling?: boolean;
}

const SIZE = 32;

const C = {
  bone: '#e2e8f0',      // Slate 200 (Bone Light)
  boneShadow: '#64748b',// Slate 500 (Bone Shadow)
  dark: '#0f172a',      // Slate 900 (Deep Recess/Outline)
  black: '#000000',     // Pure Black Outline
};

// 32x32 Grid - Retro Hand (Reverted to smoother style with adjustments)
const HAND_GRID = [
  // Arm/Wrist (Top Left)
  "00334114300000000000000000000000",
  "00341143000000000000000000000000",
  "00341143000000000000000000000000",
  "00334114300000000000000000000000",
  "00034114300000000000000000000000",
  "00034114300000000000000000000000",
  "00003411430000000000000000000000",
  "00003411430000000000000000000000",
  
  // Hand Base / Metacarpals
  "00000341143000000000000000000000", 
  "00000342114300000000000000000000",
  "00000034211430000000000000000000", 
  "00000034211430000000000000000000",
  "00000003421143000000000000000000", // Knuckle

  // -- Finger Starts Here --
  // Proximal Phalanx (Longest) - Smoother style
  "00000000342113000000000000000000", 
  "00000000341113000000000000000000", 
  "00000000034111300000000000000000",
  "00000000034111300000000000000000",
  
  // Joint 1 (Gap Fix) - 1 Black (4) and 1 White (1) in the space
  "00000000003413000000000000000000", 

  // Middle Phalanx - Adopted the "step down" shape from the new version, but kept old styling
  "00000000003411300000000000000000", // Base
  "00000000000341130000000000000000", // Shaft (Indented immediately like new ver)
  "00000000000341130000000000000000", // Shaft

  // Joint 2 (Darker/Separation)
  "00000000000033300000000000000000", 

  // Distal Phalanx (Tip)
  "00000000000003411300000000000000",
  "00000000000003411300000000000000",
  "00000000000000341300000000000000",
  "00000000000000033000000000000000", // Point

  // Empty space
  "00000000000000000000000000000000",
  "00000000000000000000000000000000",
  "00000000000000000000000000000000",
  "00000000000000000000000000000000",
  "00000000000000000000000000000000"
];

const createPixelHand = () => {
  const pixels = [];
  
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const char = HAND_GRID[y]?.[x];
      let fill = null;
      
      if (char === '1') fill = C.bone;
      if (char === '2') fill = C.boneShadow;
      if (char === '3') fill = C.dark;
      if (char === '4') fill = C.black;
      
      if (fill) {
        pixels.push(
          <rect 
            key={`${x}-${y}`} 
            x={x} 
            y={y} 
            width="1.05" // slight overlap to prevent gaps
            height="1.05" 
            fill={fill} 
          />
        );
      }
    }
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`0 0 ${SIZE} ${SIZE}`} 
      shapeRendering="crispEdges"
      className="w-full h-full drop-shadow-xl"
    >
      {pixels}
    </svg>
  );
};

export const Hand: React.FC<HandProps> = ({ isFlicking, isVisible, isCrumbling }) => {
  const handSVG = useMemo(() => createPixelHand(), []);

  return (
    <div 
      className={`
        absolute top-[-40px] left-[-80px] w-64 h-64 z-40 pointer-events-none
        transition-all duration-700 ease-out
        ${isVisible ? 'translate-y-0 opacity-100 animate-hand-enter-top' : '-translate-y-64 opacity-0'}
        ${isCrumbling ? 'animate-pixel-crumble' : ''}
      `}
    >
      <div className={`
        w-full h-full transform transition-transform duration-100
        ${isFlicking ? 'animate-hand-poke' : 'animate-hand-idle'}
      `}>
        {handSVG}
      </div>
    </div>
  );
};
