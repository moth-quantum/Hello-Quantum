export type QubitValue = "filled" | "empty" | "superposition";

export interface QubitState {
  value: QubitValue;
}

export type GateType = "X" | "H" | "Z" | "CZ";

/**
 * Apply a quantum gate to a specific qubit position
 */
export function applyGate(
  state: QubitState[][],
  gate: GateType,
  row: number,
  col: number
): QubitState[][] {
  const newState = state.map((r) => r.map((q) => ({ ...q })));

  switch (gate) {
    case "X":
      // X gate flips the qubit: filled <-> empty
      newState[row][col].value = flipValue(newState[row][col].value);
      break;

    case "H":
      // H gate creates/collapses superposition
      const current = newState[row][col].value;
      if (current === "superposition") {
        // Collapse to filled or empty (simplified)
        newState[row][col].value = "filled";
      } else {
        newState[row][col].value = "superposition";
      }
      break;

    case "Z":
      // Z gate affects phase (in our simplified version, swaps certain states)
      // For visualization, we'll make it swap filled/empty differently than X
      const zCurrent = newState[row][col].value;
      if (zCurrent === "superposition") {
        newState[row][col].value = "empty";
      } else if (zCurrent === "filled") {
        newState[row][col].value = "superposition";
      } else {
        newState[row][col].value = "filled";
      }
      break;

    case "CZ":
      // CZ is a two-qubit gate - for now, apply to adjacent qubits
      // This would need more complex handling in a full implementation
      break;
  }

  return newState;
}

function flipValue(value: QubitValue): QubitValue {
  if (value === "filled") return "empty";
  if (value === "empty") return "filled";
  return value; // superposition stays
}

/**
 * Check if current state matches the target state
 */
export function checkWinCondition(
  current: QubitState[][],
  target: QubitState[][]
): boolean {
  for (let i = 0; i < current.length; i++) {
    for (let j = 0; j < current[i].length; j++) {
      if (current[i][j].value !== target[i][j].value) {
        return false;
      }
    }
  }
  return true;
}
