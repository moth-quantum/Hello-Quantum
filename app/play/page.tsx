"use client";

import { useState, useCallback } from "react";
import { GameBoard } from "@/components/game-board";
import { GateToolbar } from "@/components/gate-toolbar";
import { TargetDisplay } from "@/components/target-display";
import { 
  type QuantumState, 
  type GateType, 
  type QubitTarget,
  INITIAL_STATE,
  PUZZLES,
  applyGate,
  statesEqual,
} from "@/lib/quantum-logic";

export default function PlayPage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = PUZZLES[puzzleIndex];
  
  const [state, setState] = useState<QuantumState>(puzzle.initial);
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [hasWon, setHasWon] = useState(false);

  const availableGates: GateType[] = ['X', 'Z', 'H', 'CZ'];

  const handleGateSelect = useCallback((gate: GateType) => {
    setSelectedGate(prev => prev === gate ? null : gate);
  }, []);

  const handleApplyGate = useCallback((gate: GateType, target?: QubitTarget) => {
    if (hasWon) return;

    const newState = applyGate(state, gate, target);
    setState(newState);
    setSelectedGate(null);

    if (statesEqual(newState, puzzle.target)) {
      setHasWon(true);
    }
  }, [state, puzzle.target, hasWon]);

  const handleReset = useCallback(() => {
    setState(puzzle.initial);
    setSelectedGate(null);
    setHasWon(false);
  }, [puzzle.initial]);

  const handleNextPuzzle = useCallback(() => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length;
    setPuzzleIndex(nextIndex);
    setState(PUZZLES[nextIndex].initial);
    setSelectedGate(null);
    setHasWon(false);
  }, [puzzleIndex]);

  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-between py-8 px-4">
      <div className="w-full max-w-sm">
        <TargetDisplay targetState={puzzle.target} />
        <p className="text-white/50 text-xs mt-2">Puzzle {puzzleIndex + 1} of {PUZZLES.length}</p>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <GameBoard
          state={state}
          selectedGate={selectedGate}
          onApplyGate={handleApplyGate}
        />
      </div>

      <div className="w-full max-w-md">
        <GateToolbar
          gates={availableGates}
          selectedGate={selectedGate}
          onGateSelect={handleGateSelect}
        />
      </div>

      {hasWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-[#2D3A8C] mb-4">Puzzle Solved!</h2>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 text-[#2D3A8C] rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleNextPuzzle}
                className="px-6 py-2 bg-[#4052B5] text-white rounded-lg font-medium hover:bg-[#2D3A8C] transition-colors"
              >
                Next Puzzle
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleReset}
        className="mt-4 text-white/70 hover:text-white text-sm underline underline-offset-4"
      >
        Reset Puzzle
      </button>
    </main>
  );
}
