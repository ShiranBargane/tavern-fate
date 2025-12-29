import React from 'react';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const RetroFrame: React.FC<FrameProps> = ({ children, className = '', title }) => {
  return (
    <div className={`relative border-4 border-double border-parchment-dim bg-void-dark p-1 shadow-lg ${className}`}>
      {/* Corner decorations */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-parchment" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-parchment" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-parchment" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-parchment" />
      
      {title && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-void-dark px-2 text-parchment font-retro text-lg tracking-widest border border-parchment-dim">
          {title}
        </div>
      )}
      
      <div className="border border-parchment-dim/30 h-full w-full p-4 relative">
        {children}
      </div>
    </div>
  );
};

export const RetroButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ onClick, disabled, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group px-6 py-2 w-full font-retro text-2xl uppercase tracking-widest
        transition-all duration-100 active:translate-y-1
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blood/20 cursor-pointer'}
      `}
    >
      {/* Button Background with Dither pattern simulated via CSS */}
      <div className="absolute inset-0 border-2 border-parchment bg-stone-900 opacity-90 group-hover:border-gold-bright transition-colors" />
      
      {/* Inner Bevel */}
      <div className="absolute inset-1 border border-stone-600 group-hover:border-stone-500" />
      
      <span className={`relative z-10 ${disabled ? 'text-stone-500' : 'text-parchment group-hover:text-gold-bright drop-shadow-md'}`}>
        {children}
      </span>
    </button>
  );
};