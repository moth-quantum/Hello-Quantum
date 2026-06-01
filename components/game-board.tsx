"use client";

import { type QubitState, type GateType } from "@/lib/quantum-logic";
import { QubitCircle } from "./qubit-circle";

interface GameBoardProps {
  qubitState: QubitState[][];
  onQubitClick: (row: number, col: number) => void;
  selectedGate: GateType | null;
}

export function GameBoard({ qubitState, onQubitClick, selectedGate }: GameBoardProps) {
  return (
    <div className="relative">
      {/* Connection lines SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 280 280"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Vertical lines from tiles to bottom */}
        <path d="M 70 200 L 70 260" className="connection-line" />
        <path d="M 140 200 L 140 260" className="connection-line" />
        <path d="M 210 200 L 210 260" className="connection-line" />
        
        {/* Lines connecting to CZ gate at top */}
        <path d="M 140 20 L 140 60" className="connection-line" />
      </svg>

      {/* CZ Gate at top */}
      <div className="flex justify-center mb-6">
        <div className="bg-white/90 rounded-lg px-4 py-2 shadow-lg">
          <span className="text-[#2D3A8C] font-bold text-lg">CZ</span>
          <div className="text-[#2D3A8C]/70 text-[10px] uppercase tracking-wider">Gate</div>
        </div>
      </div>

      {/* Main game grid - diamond layout */}
      <div className="flex flex-col items-center gap-2">
        {/* Top row - 2 qubits */}
        <div className="flex gap-4">
          {qubitState[0].map((qubit, col) => (
            <button
              key={`0-${col}`}
              onClick={() => onQubitClick(0, col)}
              disabled={!selectedGate}
              className={`quantum-tile w-20 h-20 ${
                selectedGate ? "cursor-pointer hover:bg-white/30" : "cursor-default"
              }`}
            >
              <QubitCircle value={qubit.value} />
            </button>
          ))}
        </div>

        {/* Bottom row - 2 qubits (rotated 45deg arrangement) */}
        <div className="flex gap-4 mt-2">
          {qubitState[1].map((qubit, col) => (
            <button
              key={`1-${col}`}
              onClick={() => onQubitClick(1, col)}
              disabled={!selectedGate}
              className={`quantum-tile w-20 h-20 rotate-45 ${
                selectedGate ? "cursor-pointer hover:bg-white/30" : "cursor-default"
              }`}
            >
              <div className="-rotate-45">
                <QubitCircle value={qubit.value} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
