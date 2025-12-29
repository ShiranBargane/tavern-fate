import React from 'react';

export const CRTEffect: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden h-full w-full">
      {/* Scanlines - very subtle */}
      <div 
        className="absolute inset-0 bg-repeat-y opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 50%, #000 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      
      {/* Vignette - adds mood without noise */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.9)_100%)]" />
      
      {/* Soft overlay for texture */}
      <div className="absolute inset-0 bg-amber-900 mix-blend-overlay opacity-[0.05]" />
    </div>
  );
};