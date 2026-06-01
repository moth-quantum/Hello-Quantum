"use client";

import { useState, useCallback } from "react";
import { GameBoard } from "@/components/game-board";
import { GateToolbar } from "@/components/gate-toolbar";
import { TargetDisplay } from "@/components/target-display";
import { type QubitState, type GateType, applyGate, checkWinCondition } from "@/lib/quantum-logic";

const INITIAL_STATE: QubitState[][] = [
  [{ value: "empty" }, { value: "empty" }],
  [{ value: "filled" }, { value: "empty" }],
];

const TARGET_STATE: QubitState[][] = [
  [{ value: "filled" }, { value: "filled" }],
  [{ value: "empty" }, { value: "filled" }],
];

const AVAILABLE_GATES: { type: GateType; count: number }[] = [
  { type: "Z", count: 1 },
  { type: "H", count: 1 },
  { type: "X", count: 2 },
  { type: "H", count: 1 },
  { type: "Z", count: 1 },
];

export default function PlayPage() {
  const [qubitState, setQubitState] = useState<QubitState[][]>(INITIAL_STATE);
  const [selectedGate, setSelectedGate] = useState<{ type: GateType; index: number } | null>(null);
  const [usedGates, setUsedGates] = useState<number[]>([]);
  const [hasWon, setHasWon] = useState(false);

  const handleGateSelect = useCallback((gate: GateType, index: number) => {
    if (usedGates.includes(index)) return;
    if (selectedGate?.index === index) {
      setSelectedGate(null);
    } else {
      setSelectedGate({ type: gate, index });
    }
  }, [usedGates, selectedGate]);

  const handleQubitClick = useCallback((row: number, col: number) => {
    if (!selectedGate || hasWon) return;

    const newState = applyGate(qubitState, selectedGate.type, row, col);
    setQubitState(newState);
    setUsedGates([...usedGates, selectedGate.index]);
    setSelectedGate(null);

    if (checkWinCondition(newState, TARGET_STATE)) {
      setHasWon(true);
    }
  }, [selectedGate, qubitState, usedGates, hasWon]);

  const handleReset = useCallback(() => {
    setQubitState(INITIAL_STATE);
    setUsedGates([]);
    setSelectedGate(null);
    setHasWon(false);
  }, []);

  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-between py-8 px-4">
      <div className="w-full max-w-sm">
        <TargetDisplay targetState={TARGET_STATE} />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <GameBoard
          qubitState={qubitState}
          onQubitClick={handleQubitClick}
          selectedGate={selectedGate?.type ?? null}
        />
      </div>

      <div className="w-full max-w-md">
        <GateToolbar
          gates={AVAILABLE_GATES}
          usedGates={usedGates}
          selectedGateIndex={selectedGate?.index ?? null}
          onGateSelect={handleGateSelect}
        />
      </div>

      {hasWon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-[#2D3A8C] mb-4">Puzzle Solved!</h2>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-[#4052B5] text-white rounded-lg font-medium hover:bg-[#2D3A8C] transition-colors"
            >
              Play Again
            </button>
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
