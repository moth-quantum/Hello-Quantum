"use client";

import { type QuantumState, type CircleState } from "@/lib/quantum-logic";
import { QubitCircle } from "./qubit-circle";

interface TargetDisplayProps {
  targetState: QuantumState;
}

export function TargetDisplay({ targetState }: TargetDisplayProps) {
  const circles: CircleState[] = [
    targetState.leftTop,
    targetState.rightTop,
    targetState.leftBottom,
    targetState.rightBottom,
  ];

  return (
    <div className="text-white/70">
      <p className="text-sm mb-2 italic">Target</p>
      <div className="flex gap-2">
        {circles.map((state, index) => (
          <QubitCircle key={index} state={state} size="sm" />
        ))}
      </div>
    </div>
  );
}
