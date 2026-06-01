"use client";

import Link from "next/link";

export default function TitleScreen() {
  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative game board preview - matching Hello Quantum layout */}
      <div className="relative w-64 h-48 mb-10">
        <svg viewBox="0 0 260 180" className="w-full h-full">
          {/* Line from CZ gate down to center */}
          <line x1="130" y1="10" x2="130" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          
          {/* Lines going down to single qubit gates */}
          <line x1="65" y1="125" x2="65" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <line x1="195" y1="125" x2="195" y2="165" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          
          {/* Left diamond tile - for qubit 0 */}
          <g transform="translate(65, 90)">
            <rect 
              x="-45" y="-45" 
              width="90" height="90" 
              rx="8" 
              fill="rgba(132,177,236,0.5)" 
              transform="rotate(45)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            {/* 4 circles inside - ZI top, XI left, correlations right/bottom */}
            {/* ZI - top */}
            <circle cx="0" cy="-25" r="12" fill="#0a0a1a" stroke="white" strokeWidth="2" />
            {/* XI - left */}
            <circle cx="-25" cy="0" r="12" fill="transparent" stroke="white" strokeWidth="2" />
            {/* ZZ - right (correlation) */}
            <circle cx="25" cy="0" r="12" fill="transparent" stroke="white" strokeWidth="2" />
            {/* XZ - bottom (correlation) */}
            <circle cx="0" cy="25" r="12" fill="#0a0a1a" stroke="white" strokeWidth="2" />
          </g>
          
          {/* Right diamond tile - for qubit 1 */}
          <g transform="translate(195, 90)">
            <rect 
              x="-45" y="-45" 
              width="90" height="90" 
              rx="8" 
              fill="rgba(132,177,236,0.5)" 
              transform="rotate(45)"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
            {/* 4 circles inside - IZ top, IX right, correlations left/bottom */}
            {/* IZ - top */}
            <circle cx="0" cy="-25" r="12" fill="transparent" stroke="white" strokeWidth="2" />
            {/* ZX - left (correlation) */}
            <circle cx="-25" cy="0" r="12" fill="#0a0a1a" stroke="white" strokeWidth="2" />
            {/* IX - right */}
            <circle cx="25" cy="0" r="12" fill="white" stroke="white" strokeWidth="2" />
            {/* XX - bottom (correlation) */}
            <circle cx="0" cy="25" r="12" fill="transparent" stroke="white" strokeWidth="2" />
          </g>
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight text-center mb-3 text-balance">
        Hello Quantum
      </h1>

      {/* Subtitle */}
      <p className="text-white/60 text-lg sm:text-xl text-center max-w-sm mb-12">
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
