"use client";

import { type GateType } from "@/lib/quantum-logic";

interface GateToolbarProps {
  gates: { type: GateType; count: number }[];
  usedGates: number[];
  selectedGateIndex: number | null;
  onGateSelect: (gate: GateType, index: number) => void;
}

export function GateToolbar({
  gates,
  usedGates,
  selectedGateIndex,
  onGateSelect,
}: GateToolbarProps) {
  return (
    <div className="flex justify-center gap-3">
      {gates.map((gate, index) => {
        const isUsed = usedGates.includes(index);
        const isSelected = selectedGateIndex === index;

        return (
          <button
            key={index}
            onClick={() => onGateSelect(gate.type, index)}
            disabled={isUsed}
            className={`
              w-14 h-16 rounded-lg flex flex-col items-center justify-center
              transition-all duration-200 ease-out
              ${isUsed 
                ? "bg-[#7B8ED8]/50 text-white/50 cursor-not-allowed" 
                : "bg-white text-[#2D3A8C] shadow-lg hover:scale-105 hover:shadow-xl active:scale-95"
              }
              ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#4052B5] scale-105" : ""}
            `}
          >
            <span className="font-bold text-xl">{gate.type}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-70">Gate</span>
          </button>
        );
      })}
    </div>
  );
}
