// Circle state: 'black' (certain 0), 'white' (certain 1), or 'outline' (random/superposition)
export type CircleState = 'black' | 'white' | 'outline';

// The 8-circle grid representing 2 qubits and their correlations
// Based on the Hello Quantum visualization from the blog post
export interface QuantumState {
  // Left qubit circles (top and bottom)
  leftTop: CircleState;
  leftBottom: CircleState;
  // Right qubit circles (top and bottom)  
  rightTop: CircleState;
  rightBottom: CircleState;
  // Correlation circles (between qubits)
  topCorrelation: CircleState;      // Agreement between top circles
  bottomCorrelation: CircleState;   // Agreement between bottom circles
  leftCorrelation: CircleState;     // Left-top to right-bottom diagonal
  rightCorrelation: CircleState;    // Right-top to left-bottom diagonal
}

export type GateType = 'X' | 'Z' | 'H' | 'CZ';
export type QubitTarget = 'left' | 'right';

// Initial state: both qubits in |0⟩ state
export const INITIAL_STATE: QuantumState = {
  leftTop: 'outline',
  leftBottom: 'black',
  rightTop: 'outline',
  rightBottom: 'black',
  topCorrelation: 'outline',
  bottomCorrelation: 'black',
  leftCorrelation: 'outline',
  rightCorrelation: 'outline',
};

// Flip a circle state (black <-> white, outline stays outline)
function flipCircle(state: CircleState): CircleState {
  if (state === 'black') return 'white';
  if (state === 'white') return 'black';
  return 'outline';
}

// Apply X gate - flips the bottom circle and affects correlations
export function applyX(state: QuantumState, target: QubitTarget): QuantumState {
  const newState = { ...state };
  
  if (target === 'left') {
    newState.leftBottom = flipCircle(state.leftBottom);
    newState.bottomCorrelation = flipCircle(state.bottomCorrelation);
    newState.leftCorrelation = flipCircle(state.leftCorrelation);
  } else {
    newState.rightBottom = flipCircle(state.rightBottom);
    newState.bottomCorrelation = flipCircle(state.bottomCorrelation);
    newState.rightCorrelation = flipCircle(state.rightCorrelation);
  }
  
  return newState;
}

// Apply Z gate - flips the top circle and affects correlations
export function applyZ(state: QuantumState, target: QubitTarget): QuantumState {
  const newState = { ...state };
  
  if (target === 'left') {
    newState.leftTop = flipCircle(state.leftTop);
    newState.topCorrelation = flipCircle(state.topCorrelation);
    newState.rightCorrelation = flipCircle(state.rightCorrelation);
  } else {
    newState.rightTop = flipCircle(state.rightTop);
    newState.topCorrelation = flipCircle(state.topCorrelation);
    newState.leftCorrelation = flipCircle(state.leftCorrelation);
  }
  
  return newState;
}

// Apply H gate - swaps top and bottom circles and their correlations
export function applyH(state: QuantumState, target: QubitTarget): QuantumState {
  const newState = { ...state };
  
  if (target === 'left') {
    // Swap left qubit's top and bottom
    newState.leftTop = state.leftBottom;
    newState.leftBottom = state.leftTop;
    // Swap corresponding correlations
    newState.topCorrelation = state.leftCorrelation;
    newState.leftCorrelation = state.topCorrelation;
    newState.rightCorrelation = state.bottomCorrelation;
    newState.bottomCorrelation = state.rightCorrelation;
  } else {
    // Swap right qubit's top and bottom
    newState.rightTop = state.rightBottom;
    newState.rightBottom = state.rightTop;
    // Swap corresponding correlations
    newState.topCorrelation = state.rightCorrelation;
    newState.rightCorrelation = state.topCorrelation;
    newState.leftCorrelation = state.bottomCorrelation;
    newState.bottomCorrelation = state.leftCorrelation;
  }
  
  return newState;
}

// Apply CZ gate - controlled-Z between two qubits
// Swaps: leftTop <-> leftCorrelation, rightTop <-> rightCorrelation
export function applyCZ(state: QuantumState): QuantumState {
  return {
    ...state,
    leftTop: state.leftCorrelation,
    leftCorrelation: state.leftTop,
    rightTop: state.rightCorrelation,
    rightCorrelation: state.rightTop,
  };
}

// Apply any gate
export function applyGate(
  state: QuantumState, 
  gate: GateType, 
  target?: QubitTarget
): QuantumState {
  switch (gate) {
    case 'X':
      return target ? applyX(state, target) : state;
    case 'Z':
      return target ? applyZ(state, target) : state;
    case 'H':
      return target ? applyH(state, target) : state;
    case 'CZ':
      return applyCZ(state);
    default:
      return state;
  }
}

// Check if two states are equal
export function statesEqual(a: QuantumState, b: QuantumState): boolean {
  return (
    a.leftTop === b.leftTop &&
    a.leftBottom === b.leftBottom &&
    a.rightTop === b.rightTop &&
    a.rightBottom === b.rightBottom &&
    a.topCorrelation === b.topCorrelation &&
    a.bottomCorrelation === b.bottomCorrelation &&
    a.leftCorrelation === b.leftCorrelation &&
    a.rightCorrelation === b.rightCorrelation
  );
}

// Sample puzzles
export interface Puzzle {
  id: number;
  initial: QuantumState;
  target: QuantumState;
  gates: { type: GateType; target?: QubitTarget }[];
}

export const PUZZLES: Puzzle[] = [
  // Level 1: Simple X gate
  {
    id: 1,
    initial: INITIAL_STATE,
    target: {
      ...INITIAL_STATE,
      leftBottom: 'white',
      bottomCorrelation: 'white',
      leftCorrelation: 'white',
    },
    gates: [
      { type: 'X', target: 'left' },
      { type: 'H', target: 'left' },
      { type: 'Z', target: 'right' },
    ],
  },
  // Level 2: H gate to create superposition then X
  {
    id: 2,
    initial: INITIAL_STATE,
    target: {
      leftTop: 'black',
      leftBottom: 'outline',
      rightTop: 'outline',
      rightBottom: 'black',
      topCorrelation: 'outline',
      bottomCorrelation: 'outline',
      leftCorrelation: 'black',
      rightCorrelation: 'outline',
    },
    gates: [
      { type: 'H', target: 'left' },
      { type: 'X', target: 'left' },
      { type: 'Z', target: 'left' },
      { type: 'H', target: 'right' },
    ],
  },
];
