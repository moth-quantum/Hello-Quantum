"use client";

import Link from "next/link";

export default function TitleScreen() {
  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative diamond grid - mimicking the game board */}
      <div className="relative w-40 h-40 mb-10">
        <svg viewBox="0 0 160 160" className="w-full h-full">
          {/* Connection lines */}
          <line x1="80" y1="20" x2="80" y2="55" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="80" y1="105" x2="80" y2="140" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="20" y1="80" x2="55" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="105" y1="80" x2="140" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          
          {/* Top tile */}
          <g transform="translate(80, 20)">
            <rect x="-18" y="-18" width="36" height="36" rx="4" fill="rgba(132,177,236,0.6)" transform="rotate(45)" />
            <circle cx="0" cy="0" r="10" fill="transparent" stroke="white" strokeWidth="2" />
          </g>
          
          {/* Left tile */}
          <g transform="translate(20, 80)">
            <rect x="-18" y="-18" width="36" height="36" rx="4" fill="rgba(132,177,236,0.6)" transform="rotate(45)" />
            <circle cx="0" cy="0" r="10" fill="#0a0a1a" stroke="white" strokeWidth="2" />
          </g>
          
          {/* Center tile */}
          <g transform="translate(80, 80)">
            <rect x="-22" y="-22" width="44" height="44" rx="5" fill="rgba(33,114,200,0.6)" transform="rotate(45)" />
            <circle cx="0" cy="0" r="12" fill="#0a0a1a" stroke="white" strokeWidth="2" />
          </g>
          
          {/* Right tile */}
          <g transform="translate(140, 80)">
            <rect x="-18" y="-18" width="36" height="36" rx="4" fill="rgba(132,177,236,0.6)" transform="rotate(45)" />
            <circle cx="0" cy="0" r="10" fill="transparent" stroke="white" strokeWidth="2" />
          </g>
          
          {/* Bottom tile */}
          <g transform="translate(80, 140)">
            <rect x="-18" y="-18" width="36" height="36" rx="4" fill="rgba(132,177,236,0.6)" transform="rotate(45)" />
            <circle cx="0" cy="0" r="10" fill="white" stroke="white" strokeWidth="2" />
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
