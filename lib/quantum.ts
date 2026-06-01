// Circle state: 'black' (0), 'white' (1), or 'outline' (superposition/random)
export type CircleState = 'black' | 'white' | 'outline';

// The grid has 8 circles for 2 qubits:
// - 2 circles per qubit (top and bottom)
// - 4 correlation circles between them
export interface QuantumState {
  // Left qubit circles (top, bottom)
  leftTop: CircleState;
  leftBottom: CircleState;
  // Right qubit circles (top, bottom)
  rightTop: CircleState;
  rightBottom: CircleState;
  // Correlation circles
  topCorrelation: CircleState;      // Agreement between top circles
  bottomCorrelation: CircleState;   // Agreement between bottom circles
  leftCorrelation: CircleState;     // Left-top to right-bottom
  rightCorrelation: CircleState;    // Right-top to left-bottom
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

// Swap two circle states
function swap<T>(a: T, b: T): [T, T] {
  return [b, a];
}

// Apply X gate - flips the bottom circle and its correlations
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

// Apply Z gate - flips the top circle and its correlations
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
    [newState.leftTop, newState.leftBottom] = swap(state.leftTop, state.leftBottom);
    [newState.topCorrelation, newState.leftCorrelation] = swap(state.topCorrelation, state.leftCorrelation);
    [newState.rightCorrelation, newState.bottomCorrelation] = swap(state.rightCorrelation, state.bottomCorrelation);
  } else {
    [newState.rightTop, newState.rightBottom] = swap(state.rightTop, state.rightBottom);
    [newState.topCorrelation, newState.rightCorrelation] = swap(state.topCorrelation, state.rightCorrelation);
    [newState.leftCorrelation, newState.bottomCorrelation] = swap(state.leftCorrelation, state.bottomCorrelation);
  }
  
  return newState;
}

// Apply CZ gate - controlled-Z between two qubits
// This swaps pairs of circles as described in the blog
export function applyCZ(state: QuantumState): QuantumState {
  const newState = { ...state };
  
  // CZ swaps: leftTop <-> leftCorrelation, rightTop <-> rightCorrelation
  [newState.leftTop, newState.leftCorrelation] = swap(state.leftTop, state.leftCorrelation);
  [newState.rightTop, newState.rightCorrelation] = swap(state.rightTop, state.rightCorrelation);
  
  return newState;
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
