'use client';

import { CircleState } from '@/lib/quantum-logic';

interface QubitCircleProps {
  state: CircleState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QubitCircle({ state, size = 'md', className = '' }: QubitCircleProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-[1.5px]',
    md: 'w-7 h-7 border-2',
    lg: 'w-8 h-8 border-2',
  };

  const stateClasses = {
    black: 'bg-[#1a1a2e]',
    white: 'bg-white',
    outline: 'bg-transparent',
  };

  return (
    <div
      className={`
        rounded-full border-white transition-all duration-300 ease-out
        ${sizeClasses[size]}
        ${stateClasses[state]}
        ${className}
      `}
    />
  );
}
