"use client";

import { type GateType } from "@/lib/quantum-logic";

interface GateToolbarProps {
  gates: GateType[];
  selectedGate: GateType | null;
  onGateSelect: (gate: GateType) => void;
}

export function GateToolbar({
  gates,
  selectedGate,
  onGateSelect,
}: GateToolbarProps) {
  return (
    <div className="flex justify-center gap-3">
      {gates.map((gate, index) => {
        const isSelected = selectedGate === gate;

        return (
          <button
            key={index}
            onClick={() => onGateSelect(gate)}
            className={`
              w-14 h-16 rounded-lg flex flex-col items-center justify-center
              transition-all duration-200 ease-out
              bg-white text-[#2D3A8C] shadow-lg hover:scale-105 hover:shadow-xl active:scale-95
              ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#4052B5] scale-105" : ""}
            `}
          >
            <span className="font-bold text-xl">{gate}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-70">Gate</span>
          </button>
        );
      })}
    </div>
  );
}
