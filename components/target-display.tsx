"use client";

import { type QubitState } from "@/lib/quantum-logic";
import { QubitCircle } from "./qubit-circle";

interface TargetDisplayProps {
  targetState: QubitState[][];
}

export function TargetDisplay({ targetState }: TargetDisplayProps) {
  return (
    <div className="text-white/70">
      <p className="text-sm mb-2 italic">Target</p>
      <div className="flex gap-2">
        {targetState.flat().map((qubit, index) => (
          <QubitCircle key={index} value={qubit.value} size="sm" />
        ))}
      </div>
    </div>
  );
}
