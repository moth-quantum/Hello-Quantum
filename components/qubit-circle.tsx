"use client";

import { type QubitValue } from "@/lib/quantum-logic";

interface QubitCircleProps {
  value: QubitValue;
  size?: "sm" | "md" | "lg";
}

export function QubitCircle({ value, size = "md" }: QubitCircleProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const baseClasses = `${sizeClasses[size]} rounded-full border-2 border-white transition-all duration-300`;

  if (value === "filled") {
    return <div className={`${baseClasses} bg-gray-900`} />;
  }

  if (value === "empty") {
    return <div className={`${baseClasses} bg-transparent`} />;
  }

  // Superposition - half filled effect
  return (
    <div className={`${baseClasses} overflow-hidden relative`}>
      <div className="absolute inset-0 bg-gray-900" style={{ clipPath: "inset(0 50% 0 0)" }} />
    </div>
  );
}
