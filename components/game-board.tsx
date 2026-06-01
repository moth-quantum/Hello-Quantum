"use client";

import { type QuantumState, type GateType, type QubitTarget } from "@/lib/quantum-logic";
import { QubitCircle } from "./qubit-circle";

interface GameBoardProps {
  state: QuantumState;
  selectedGate: GateType | null;
  onApplyGate: (gate: GateType, target?: QubitTarget) => void;
}

export function GameBoard({ state, selectedGate, onApplyGate }: GameBoardProps) {
  const handleQubitClick = (target: QubitTarget) => {
    if (selectedGate && selectedGate !== 'CZ') {
      onApplyGate(selectedGate, target);
    }
  };

  const handleCZClick = () => {
    if (selectedGate === 'CZ') {
      onApplyGate('CZ');
    }
  };

  return (
    <div className="relative w-[280px] h-[320px]">
      {/* Connection lines SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 280 320"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Lines from CZ gate to top tiles */}
        <path d="M 140 50 L 140 80" className="connection-line" />
        <path d="M 140 80 L 90 110" className="connection-line" />
        <path d="M 140 80 L 190 110" className="connection-line" />
        
        {/* Lines connecting the diamond */}
        <path d="M 90 170 L 140 220" className="connection-line" />
        <path d="M 190 170 L 140 220" className="connection-line" />
      </svg>

      {/* CZ Gate at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <button
          onClick={handleCZClick}
          disabled={selectedGate !== 'CZ'}
          className={`
            bg-white/90 rounded-lg px-4 py-2 shadow-lg transition-all
            ${selectedGate === 'CZ' ? 'cursor-pointer hover:scale-105 ring-2 ring-white' : 'cursor-default'}
          `}
        >
          <span className="text-[#2D3A8C] font-bold text-lg">CZ</span>
          <div className="text-[#2D3A8C]/70 text-[10px] uppercase tracking-wider">Gate</div>
        </button>
      </div>

      {/* Main diamond grid */}
      <div className="absolute top-[90px] left-1/2 -translate-x-1/2">
        {/* Top row - left and right qubits */}
        <div className="flex gap-20 mb-4">
          {/* Left qubit tile */}
          <button
            onClick={() => handleQubitClick('left')}
            disabled={!selectedGate || selectedGate === 'CZ'}
            className={`
              quantum-tile w-20 h-20 flex flex-col items-center justify-center gap-2
              ${selectedGate && selectedGate !== 'CZ' ? 'cursor-pointer hover:bg-white/30' : 'cursor-default'}
            `}
          >
            <QubitCircle state={state.leftTop} />
            <QubitCircle state={state.leftBottom} />
          </button>

          {/* Right qubit tile */}
          <button
            onClick={() => handleQubitClick('right')}
            disabled={!selectedGate || selectedGate === 'CZ'}
            className={`
              quantum-tile w-20 h-20 flex flex-col items-center justify-center gap-2
              ${selectedGate && selectedGate !== 'CZ' ? 'cursor-pointer hover:bg-white/30' : 'cursor-default'}
            `}
          >
            <QubitCircle state={state.rightTop} />
            <QubitCircle state={state.rightBottom} />
          </button>
        </div>

        {/* Correlation row - rotated tiles */}
        <div className="flex justify-center gap-4">
          {/* Top correlation */}
          <div className="quantum-tile-correlation w-16 h-16 rotate-45 flex items-center justify-center">
            <div className="-rotate-45 flex gap-2">
              <QubitCircle state={state.topCorrelation} size="sm" />
              <QubitCircle state={state.bottomCorrelation} size="sm" />
            </div>
          </div>
        </div>

        {/* Diagonal correlations */}
        <div className="flex justify-center gap-20 mt-4">
          <div className="quantum-tile-correlation w-14 h-14 rotate-45 flex items-center justify-center">
            <div className="-rotate-45">
              <QubitCircle state={state.leftCorrelation} size="sm" />
            </div>
          </div>
          <div className="quantum-tile-correlation w-14 h-14 rotate-45 flex items-center justify-center">
            <div className="-rotate-45">
              <QubitCircle state={state.rightCorrelation} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
