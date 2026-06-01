"use client";

import Link from "next/link";

export default function TitleScreen() {
  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative diamond grid - mimicking the game board */}
      <div className="relative w-48 h-48 mb-12 animate-float">
        {/* Center correlation tile */}
        <div 
          className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'rgba(33, 114, 200, 0.7)', borderRadius: '8px', transform: 'translate(-50%, -50%) rotate(45deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="qubit-circle black" />
          </div>
        </div>
        
        {/* Top qubit tile */}
        <div 
          className="absolute left-1/2 top-0 w-14 h-14 -translate-x-1/2"
          style={{ background: 'rgba(132, 177, 236, 0.7)', borderRadius: '8px', transform: 'translateX(-50%) rotate(45deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="qubit-circle outline" />
          </div>
        </div>
        
        {/* Bottom qubit tile */}
        <div 
          className="absolute left-1/2 bottom-0 w-14 h-14 -translate-x-1/2"
          style={{ background: 'rgba(132, 177, 236, 0.7)', borderRadius: '8px', transform: 'translateX(-50%) rotate(45deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="qubit-circle white" />
          </div>
        </div>
        
        {/* Left qubit tile */}
        <div 
          className="absolute left-0 top-1/2 w-14 h-14 -translate-y-1/2"
          style={{ background: 'rgba(132, 177, 236, 0.7)', borderRadius: '8px', transform: 'translateY(-50%) rotate(45deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="qubit-circle black" />
          </div>
        </div>
        
        {/* Right qubit tile */}
        <div 
          className="absolute right-0 top-1/2 w-14 h-14 -translate-y-1/2"
          style={{ background: 'rgba(132, 177, 236, 0.7)', borderRadius: '8px', transform: 'translateY(-50%) rotate(45deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center" style={{ transform: 'rotate(-45deg)' }}>
            <div className="qubit-circle outline" />
          </div>
        </div>
        
        {/* Connection lines (SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 192 192">
          <line x1="96" y1="32" x2="96" y2="72" className="connection-line" />
          <line x1="96" y1="120" x2="96" y2="160" className="connection-line" />
          <line x1="32" y1="96" x2="72" y2="96" className="connection-line" />
          <line x1="120" y1="96" x2="160" y2="96" className="connection-line" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight text-center mb-3 text-balance">
        Hello Quantum
      </h1>

      {/* Subtitle */}
      <p className="text-white/60 text-lg sm:text-xl text-center max-w-sm mb-14">
        A puzzle game about quantum computation
      </p>

      {/* Play Button */}
      <Link
        href="/play"
        className="bg-white text-[#01488A] font-bold text-xl px-14 py-4 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-150"
      >
        Play
      </Link>

      {/* Learn More link */}
      <button className="mt-8 text-white/50 hover:text-white/80 text-sm transition-colors">
        Learn More
      </button>
    </main>
  );
}
