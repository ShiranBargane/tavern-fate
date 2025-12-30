const CandleSVG = () => (
  <svg viewBox="0 0 20 40" className="w-full h-full drop-shadow-2xl shape-rendering-crisp">
    <defs>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Wax Body */}
    <rect x="6" y="15" width="8" height="25" fill="#d6d3d1" /> {/* Main Body */}
    <rect x="14" y="15" width="1" height="25" fill="#a8a29e" /> {/* Shadow Right */}
    <rect x="6" y="15" width="2" height="25" fill="#f5f5f4" /> {/* Highlight Left */}
    
    {/* Melted Drips */}
    <rect x="5" y="16" width="1" height="6" fill="#d6d3d1" />
    <rect x="4" y="18" width="1" height="3" fill="#d6d3d1" />
    <rect x="14" y="20" width="1" height="8" fill="#d6d3d1" />
    
    {/* Wick */}
    <rect x="9" y="12" width="2" height="3" fill="#1c1917" />
    
    {/* Flame Outer */}
    <path 
      d="M10 2 C 7 8, 7 12, 10 14 C 13 12, 13 8, 10 2" 
      fill="#ea580c" 
      className="animate-flame-outer" 
      style={{ transformOrigin: '10px 14px' }}
    />
    {/* Flame Inner */}
    <path 
      d="M10 5 C 8.5 9, 8.5 11, 10 12 C 11.5 11, 11.5 9, 10 5" 
      fill="#fde047" 
      className="animate-flame-inner" 
      style={{ transformOrigin: '10px 12px' }}
    />
  </svg>
);

const CardsSVG = () => (
  <svg viewBox="0 0 40 30" className="w-full h-full drop-shadow-xl opacity-80">
    {/* Card 1 (Bottom) */}
    <g transform="rotate(-15, 20, 15)">
       <rect x="5" y="5" width="14" height="20" fill="#fefce8" stroke="#1c1917" strokeWidth="0.5" />
       <rect x="6" y="6" width="12" height="18" fill="#b91c1c" />
       <rect x="7" y="7" width="10" height="16" fill="url(#cardPattern)" />
       <path d="M5 5 L19 25" stroke="#000" strokeWidth="0.1" opacity="0.2" />
    </g>
    
    {/* Card 2 (Top) */}
    <g transform="rotate(10, 25, 15) translate(10, -2)">
       <rect x="5" y="5" width="14" height="20" fill="#fefce8" stroke="#1c1917" strokeWidth="0.5" />
       <rect x="6" y="6" width="12" height="18" fill="#1e3a8a" />
    </g>
  </svg>
);

export const TableDecor = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Heavy Vignette for edges */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(5,5,5,0.8)_90%,rgba(0,0,0,1)_100%)] z-20" />

      {/* 2. Bottom Left: Candle - Moved down */}
      <div className="absolute bottom-[-10px] left-[-10px] md:bottom-8 md:left-8 w-24 h-48 z-10 opacity-90 transform scale-90 md:scale-100 origin-bottom-left">
          <CandleSVG />
          {/* Light Glow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse-slow pointer-events-none mix-blend-screen" />
      </div>

      {/* 3. Bottom Right: Scraps - Moved here to replace the mug */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 opacity-40 scale-90 md:scale-100 rotate-12">
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-stone-500 rotate-45"></div>
          <div className="absolute bottom-4 left-6 w-3 h-3 bg-stone-600 rotate-12"></div>
          <div className="absolute bottom-6 left-2 w-1 h-1 bg-stone-400"></div>
      </div>

      {/* 4. Top Right: Abandoned Cards */}
      <div className="absolute top-[-5px] right-[-10px] md:-top-4 md:-right-8 w-40 h-32 z-10 transform rotate-12 scale-90 md:scale-100 origin-top-right">
          <CardsSVG />
      </div>

      {/* 5. Wood Grain Textures (Overlay lines) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* Scratches */}
          <div className="absolute top-1/4 left-0 w-full h-[1px] bg-black transform -rotate-1"></div>
          <div className="absolute top-3/4 left-0 w-full h-[1px] bg-black transform rotate-1"></div>
          
          {/* Vertical seams of table planks */}
          <div className="absolute top-0 left-1/4 w-[2px] h-full bg-black/50 blur-[1px]"></div>
          <div className="absolute top-0 right-1/4 w-[2px] h-full bg-black/50 blur-[1px]"></div>
      </div>

      {/* 6. Dirty Table Frame Border */}
      <div className="absolute inset-0 border-[20px] md:border-[40px] border-transparent" 
           style={{ 
             boxShadow: 'inset 0 0 100px 20px rgba(10, 5, 0, 0.9)'
           }}>
      </div>
    </div>
  );
};
