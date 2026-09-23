// Hello Quantum — canvas port of the Godot "Hello Qubits" game (main.gd).
// Two-qubit state displayed as Pauli expectation values in the original diamond layout.
// Gates: x, z, h (single-qubit Clifford) and cz (two-qubit Clifford).
// State is tracked as a 4-element complex statevector; Pauli expectations are derived analytically.

import { PUZZLES, type Puzzle } from "./puzzles";

type Complex = [number, number]; // [real, imag]
type Vec = { x: number; y: number };

const R2 = Math.SQRT1_2;

// -- Visual constants (identical to the Godot port) --------------------------
const W = 960;
const H = 640;
const CELL = 82; // grid unit -> pixel
const BX = 318; // screen x for grid x=0
const BY = 295; // screen y anchor for grid y=3.5
const DR = 52; // diamond cell half-diagonal
const CR = 30; // circle radius inside each diamond cell
const PX = 640; // right panel x

const BTN_S = 72; // button square side
const BTN_Y = 578; // centre-y for Z and X buttons
const BTN_Y_H = 602; // centre-y for H buttons (staggered lower)
const CZ_BTN_Y = 68; // centre-y for CZ button (above diamond)

const ANIM_DUR = 0.28;

// Grid positions from the original hello_quantum.py box dictionary.
const BOXES: Record<string, Vec> = {
  ZI: { x: -1, y: 2 },
  XI: { x: -2, y: 3 },
  IZ: { x: 1, y: 2 },
  IX: { x: 2, y: 3 },
  ZZ: { x: 0, y: 3 },
  ZX: { x: 1, y: 4 },
  XZ: { x: -1, y: 4 },
  XX: { x: 0, y: 5 },
};

const EDGES: [string, string][] = [
  ["ZI", "IZ"],
  ["ZI", "ZZ"],
  ["IZ", "ZZ"],
  ["ZI", "XI"],
  ["IZ", "IX"],
  ["XI", "XZ"],
  ["IX", "ZX"],
  ["ZZ", "XZ"],
  ["ZZ", "ZX"],
  ["XZ", "XX"],
  ["ZX", "XX"],
];

// Colors (from the Godot palette).
const C_BG = "rgb(77,77,158)";
const C_CELL = "rgba(102,102,191,0.80)";
const C_CELL_BG = "rgba(71,71,148,0.50)";
const C_EDGE = "rgba(179,179,255,0.35)";
const CW = 6; // cable width when enabled (CZ animation)
const C_CABLE = "rgb(236,238,248)"; // static wiring color (dimmed behind translucent cells)
const CWID = 7; // static cable width
const C_LBL = "rgb(217,224,255)";
const C_WIN = "rgb(89,255,140)";
const C_BTN_ON = "rgb(242,242,255)";
const C_BTN_HOV = "rgb(255,255,255)";
const C_BTN_OFF = "rgb(140,140,184)";
const C_BTN_TXT = "rgb(38,38,89)";
const C_PANEL = "rgb(56,56,128)";

const GATE_SLOT_0: Record<string, number> = { z: -3, h: -2, x: -1 };
const GATE_SLOT_1: Record<string, number> = { z: 3, h: 2, x: 1 };

const FIXED_BTN_SPECS = [
  { gate: "z", qkey: "0" },
  { gate: "h", qkey: "0" },
  { gate: "x", qkey: "0" },
  { gate: "x", qkey: "1" },
  { gate: "h", qkey: "1" },
  { gate: "z", qkey: "1" },
  { gate: "cz", qkey: "both" },
];

const H_SWAPS: Record<string, [string, string][]> = {
  "0": [
    ["ZI", "XI"],
    ["ZZ", "XZ"],
    ["ZX", "XX"],
  ],
  "1": [
    ["IZ", "IX"],
    ["ZZ", "ZX"],
    ["XZ", "XX"],
  ],
};
const X_FLIPS: Record<string, string[]> = {
  "0": ["ZI", "ZZ", "ZX"],
  "1": ["IZ", "ZZ", "XZ"],
};
const Z_FLIPS: Record<string, string[]> = {
  "0": ["XI", "XZ", "XX"],
  "1": ["IX", "ZX", "XX"],
};
const CZ_SWAP_PAIRS: [string, string][] = [
  ["XI", "XZ"],
  ["IX", "ZX"],
];

type Btn = { gate: string; qkey: string; center: Vec };
type SwapAnim = { from: Vec; to: Vec; color: string };
type FlipAnim = { pos: Vec; start: string; end: string };

type ExitFn = () => void;

// -- Complex + statevector helpers ------------------------------------------
function cadd(a: Complex, b: Complex): Complex {
  return [a[0] + b[0], a[1] + b[1]];
}
function csub(a: Complex, b: Complex): Complex {
  return [a[0] - b[0], a[1] - b[1]];
}
function cscale(a: Complex, s: number): Complex {
  return [a[0] * s, a[1] * s];
}
function mag2(a: Complex): number {
  return a[0] * a[0] + a[1] * a[1];
}
// Re(conj(a) * b)
function reDot(a: Complex, b: Complex): number {
  return a[0] * b[0] + a[1] * b[1];
}

// Statevector index bits: index = q0*2 + q1, q0 = MSB (qubit 0), q1 = LSB (qubit 1).
// 0=|00>, 1=|01>, 2=|10>, 3=|11>.
function pairs(q: string): [number, number][] {
  return q === "0"
    ? [
        [0, 2],
        [1, 3],
      ]
    : [
        [0, 1],
        [2, 3],
      ];
}

function grayscale(v: number): string {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${c},${c},${c})`;
}

export function createGame(canvas: HTMLCanvasElement, opts: { onExit: ExitFn }) {
  const ctx = canvas.getContext("2d")!;
  const puzzles = PUZZLES;

  // Fit the internal 960x640 resolution to the element size / DPR.
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  // -- Game state -----------------------------------------------------------
  let sv: Complex[] = [
    [1, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ];
  let rho: Record<string, number> = {};
  let pidx = 0;
  let uses: Record<string, Record<string, number>> = {};
  let moves = 0;
  let visible: string[] = [];
  let phase: "play" | "success" = "play";

  let btns: Btn[] = [];
  let hov = -1;

  // Animation state
  let animPairs: SwapAnim[] = [];
  let animPaulis: string[] = [];
  let animT = 1;
  let pendingPress: Btn | null = null;

  let flipCells: FlipAnim[] = [];
  let flipPaulis: string[] = [];
  let flipT = 1;
  let pendingFlip: Btn | null = null;

  let czSwaps: SwapAnim[] = [];
  let czCells: FlipAnim[] = [];
  let czPaulis: string[] = [];
  let czT = 1;
  let pendingCz: Btn | null = null;

  // -- Quantum logic --------------------------------------------------------
  function gateX(q: string) {
    for (const [a, b] of pairs(q)) {
      const t = sv[a];
      sv[a] = sv[b];
      sv[b] = t;
    }
  }
  function gateH(q: string) {
    for (const [a, b] of pairs(q)) {
      const sa = sv[a];
      const sb = sv[b];
      sv[a] = cscale(cadd(sa, sb), R2);
      sv[b] = cscale(csub(sa, sb), R2);
    }
  }
  function gateZ(q: string) {
    for (const [, b] of pairs(q)) {
      sv[b] = [-sv[b][0], -sv[b][1]];
    }
  }
  function gateCZ() {
    sv[3] = [-sv[3][0], -sv[3][1]]; // diag(1,1,1,-1)
  }
  function applyGate(gate: string, q: string) {
    if (gate === "x" || gate === "NOT") gateX(q);
    else if (gate === "z") gateZ(q);
    else if (gate === "h") gateH(q);
    else if (gate === "cz") gateCZ();
  }

  function rhoFromSv() {
    const a = sv;
    rho = {};
    rho["ZI"] = mag2(a[0]) + mag2(a[1]) - mag2(a[2]) - mag2(a[3]);
    rho["IZ"] = mag2(a[0]) - mag2(a[1]) + mag2(a[2]) - mag2(a[3]);
    rho["ZZ"] = mag2(a[0]) - mag2(a[1]) - mag2(a[2]) + mag2(a[3]);
    rho["XI"] = 2.0 * (reDot(a[0], a[2]) + reDot(a[1], a[3]));
    rho["IX"] = 2.0 * (reDot(a[0], a[1]) + reDot(a[2], a[3]));
    rho["XX"] = 2.0 * (reDot(a[0], a[3]) + reDot(a[1], a[2]));
    rho["ZX"] = 2.0 * (reDot(a[0], a[1]) - reDot(a[2], a[3]));
    rho["XZ"] = 2.0 * (reDot(a[0], a[2]) - reDot(a[1], a[3]));
  }

  function satisfied(): boolean {
    const goal = puzzles[pidx].goal;
    if (Object.keys(goal).length === 0) return false;
    for (const p in goal) {
      if (Math.abs((rho[p] ?? 0) - goal[p]) > 0.1) return false;
    }
    return true;
  }

  // -- Load / buttons -------------------------------------------------------
  function load(idx: number) {
    pidx = idx;
    sv = [
      [1, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    const puz: Puzzle = puzzles[idx];
    for (const [g, q] of puz.init) applyGate(g, q);
    rhoFromSv();
    uses = {};
    for (const qk in puz.gates) {
      uses[qk] = {};
      for (const g in puz.gates[qk]) {
        const lim = puz.gates[qk][g];
        uses[qk][g] = lim === 0 ? -1 : lim;
      }
    }
    moves = 0;
    visible = puz.visible === "all" ? Object.keys(BOXES) : puz.visible;
    phase = "play";
    buildBtns();
  }

  function buildBtns() {
    btns = [];
    for (const spec of FIXED_BTN_SPECS) {
      const qk = spec.qkey;
      const g = spec.gate;
      let center: Vec;
      if (qk === "both") {
        center = { x: BX, y: CZ_BTN_Y };
      } else {
        const slots = qk === "0" ? GATE_SLOT_0 : GATE_SLOT_1;
        const btnY = g === "h" ? BTN_Y_H : BTN_Y;
        center = { x: BX + slots[g] * CELL, y: btnY };
      }
      btns.push({ gate: g, qkey: qk, center });
    }
  }

  function btnRect(b: Btn) {
    return { x: b.center.x - BTN_S / 2, y: b.center.y - BTN_S / 2, w: BTN_S, h: BTN_S };
  }
  function btnEnabled(b: Btn): boolean {
    return (uses[b.qkey]?.[b.gate] ?? 0) !== 0;
  }
  function rectHas(r: { x: number; y: number; w: number; h: number }, p: Vec) {
    return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  }

  // -- Coordinate mapping ---------------------------------------------------
  function sp(gv: Vec): Vec {
    return { x: BX + gv.x * CELL, y: BY + (3.5 - gv.y) * CELL };
  }
  function spKey(key: string): Vec {
    return sp(BOXES[key]);
  }

  function ease(t: number) {
    return t * t * (3 - 2 * t);
  }
  function lerp(a: Vec, b: Vec, t: number): Vec {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  // -- Press / animations ---------------------------------------------------
  function press(b: Btn) {
    if (animT < 1 || flipT < 1 || czT < 1) return;
    const qk = b.qkey;
    const g = b.gate;
    const qArg = qk === "both" ? "0" : qk;
    if (g === "h") {
      startHAnim(qArg);
      pendingPress = b;
      return;
    }
    if (g === "x") {
      startFlipAnim(X_FLIPS[qArg] ?? []);
      pendingFlip = b;
      return;
    }
    if (g === "z") {
      startFlipAnim(Z_FLIPS[qArg] ?? []);
      pendingFlip = b;
      return;
    }
    if (g === "cz") {
      startCzAnim();
      pendingCz = b;
      return;
    }
    finishPress(b);
  }

  function finishPress(b: Btn) {
    const qk = b.qkey;
    const g = b.gate;
    const qArg = qk === "both" ? "0" : qk;
    applyGate(g, qArg);
    const rem = uses[qk]?.[g] ?? -1;
    if (rem > 0) uses[qk][g] = rem - 1;
    rhoFromSv();
    moves += 1;
    if (satisfied()) phase = "success";
  }

  function startHAnim(q: string) {
    animPairs = [];
    animPaulis = [];
    for (const [a, b] of H_SWAPS[q] ?? []) {
      if (!visible.includes(a) || !visible.includes(b)) continue;
      const pa = spKey(a);
      const pb = spKey(b);
      const probA = (1 - (rho[a] ?? 0)) / 2;
      const probB = (1 - (rho[b] ?? 0)) / 2;
      animPairs.push({ from: pa, to: pb, color: grayscale(probA) });
      animPairs.push({ from: pb, to: pa, color: grayscale(probB) });
      animPaulis.push(a, b);
    }
    animT = 0;
  }

  function startFlipAnim(paulis: string[]) {
    flipCells = [];
    flipPaulis = [];
    for (const pauli of paulis) {
      if (!visible.includes(pauli)) continue;
      const prob = (1 - (rho[pauli] ?? 0)) / 2;
      flipCells.push({ pos: spKey(pauli), start: grayscale(prob), end: grayscale(1 - prob) });
      flipPaulis.push(pauli);
    }
    flipT = 0;
  }

  function startCzAnim() {
    czSwaps = [];
    czCells = [];
    czPaulis = [];
    for (const [a, b] of CZ_SWAP_PAIRS) {
      if (!visible.includes(a) || !visible.includes(b)) continue;
      const probA = (1 - (rho[a] ?? 0)) / 2;
      const probB = (1 - (rho[b] ?? 0)) / 2;
      czSwaps.push({ from: spKey(a), to: spKey(b), color: grayscale(probA) });
      czSwaps.push({ from: spKey(b), to: spKey(a), color: grayscale(probB) });
      czPaulis.push(a, b);
    }
    if (visible.includes("XX")) {
      const xxAfter = 2.0 * (reDot(sv[0], sv[3]) - reDot(sv[1], sv[2]));
      const spProb = (1 - (rho["XX"] ?? 0)) / 2;
      const epProb = (1 - xxAfter) / 2;
      czCells.push({ pos: spKey("XX"), start: grayscale(spProb), end: grayscale(epProb) });
      czPaulis.push("XX");
    }
    czT = 0;
  }

  // -- Drawing helpers ------------------------------------------------------
  function fillRect(x: number, y: number, w: number, h: number, col: string) {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  }
  function strokeRect(x: number, y: number, w: number, h: number, col: string, lw: number) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.strokeRect(x, y, w, h);
  }
  function line(a: Vec, b: Vec, col: string, lw: number) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // Thick "cable" connector with rounded caps and corners.
  function cable(pts: Vec[], col: string, lw: number) {
    if (pts.length < 2) return;
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.lineJoin = "miter";
  }
  function diamondPath(c: Vec, r: number) {
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - r);
    ctx.lineTo(c.x + r, c.y);
    ctx.lineTo(c.x, c.y + r);
    ctx.lineTo(c.x - r, c.y);
    ctx.closePath();
  }
  function drawDiamond(c: Vec, r: number, fill: string, outline: string, ow: number) {
    diamondPath(c, r);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = ow;
    ctx.stroke();
  }
  function circle(c: Vec, r: number, fill: string) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function ring(c: Vec, r: number, col: string, lw: number) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  function text(
    s: string,
    x: number,
    y: number,
    size: number,
    col: string,
    align: CanvasTextAlign = "left",
    weight = "400",
  ) {
    ctx.fillStyle = col;
    ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(s, x, y);
  }

  // -- Draw sections --------------------------------------------------------
  // Static white wiring: each gate button's cable traces the chain of cells it
  // acts on. Drawn BEFORE the board so cables run behind the translucent
  // diamonds (dimmed inside the lattice, bright on the button stubs) — matching
  // the reference sketch. Mirror-symmetric about x = BX.
  // Static white wiring. Crossing-free and mirror-symmetric about x = BX:
  // vertical drops into entry cells, outside elbows for the offset Z buttons,
  // and CZ arms that hug the outer lattice edge (tangent to the diamonds via
  // their outer vertices) so no cable cuts through the interior.
  function drawConnectors() {
    const bottom = (k: string) => ({ x: spKey(k).x, y: spKey(k).y + DR });
    const leftV = (k: string) => ({ x: spKey(k).x - DR, y: spKey(k).y });
    const rightV = (k: string) => ({ x: spKey(k).x + DR, y: spKey(k).y });
    const btnTop = (g: string, q: string) => {
      const c = btnCenterOf(g, q);
      return { x: c.x, y: c.y - BTN_S / 2 };
    };

    const topV = (k: string) => ({ x: spKey(k).x, y: spKey(k).y - DR });

    // X: straight up into the Z-basis entry cell (bottom vertex).
    cable([btnTop("x", "0"), bottom("ZI")], C_CABLE, CWID);
    cable([btnTop("x", "1"), bottom("IZ")], C_CABLE, CWID);
    // H: straight up into the X-basis entry cell (bottom vertex).
    cable([btnTop("h", "0"), bottom("XI")], C_CABLE, CWID);
    cable([btnTop("h", "1"), bottom("IX")], C_CABLE, CWID);
    // Z: up the outside, square elbow into the entry cell's outer side vertex.
    {
      const b = btnTop("z", "0");
      const v = leftV("XI");
      cable([b, { x: b.x, y: v.y }, v], C_CABLE, CWID);
    }
    {
      const b = btnTop("z", "1");
      const v = rightV("IX");
      cable([b, { x: b.x, y: v.y }, v], C_CABLE, CWID);
    }

    // CZ fan-out: a short center stem down from the button, then one diagonal arm
    // hugging each upper lattice edge (top vertices XX -> XZ -> XI on the left,
    // XX -> ZX -> IX on the right). Mirror-symmetric, and no cable crosses the
    // interior.
    const czB = { x: BX, y: CZ_BTN_Y + BTN_S / 2 };
    const apex = topV("XX");
    cable([czB, { x: BX, y: apex.y }, apex, topV("XZ"), topV("XI")], C_CABLE, CWID);
    cable([czB, { x: BX, y: apex.y }, apex, topV("ZX"), topV("IX")], C_CABLE, CWID);
  }

  function btnCenterOf(gate: string, qkey: string): Vec {
    const b = btns.find((x) => x.gate === gate && x.qkey === qkey);
    return b ? b.center : { x: BX, y: BTN_Y };
  }

  function drawBoard() {
    const goal = puzzles[pidx].goal;

    for (const pauli in BOXES) {
      drawDiamond(sp(BOXES[pauli]), DR, C_CELL_BG, "rgba(140,140,217,0.5)", 1.0);
    }

    for (const [a, b] of EDGES) line(spKey(a), spKey(b), C_EDGE, 1.2);

    // Value diamonds (fill + outline) first, so the bright wiring drawn next
    // sits on top of the translucent cells instead of being painted over.
    for (const pauli of visible) {
      const pos = spKey(pauli);
      const isGoal = Object.prototype.hasOwnProperty.call(goal, pauli);
      const oc = isGoal ? C_WIN : "rgba(191,191,255,0.9)";
      const ow = isGoal ? 3.0 : 1.8;
      drawDiamond(pos, DR, C_CELL, oc, ow);
    }

    // Bright wiring on top of the diamonds. Every endpoint is a cell vertex, so
    // the cables stop at the diamond edges and never cover the circles.
    drawConnectors();

    // Circles + labels on top of the wiring.
    for (const pauli of visible) {
      const pos = spKey(pauli);
      const rv = rho[pauli] ?? 0;
      const prob = (1 - rv) / 2;
      const animating = animPaulis.includes(pauli) || flipPaulis.includes(pauli) || czPaulis.includes(pauli);

      if (!animating) {
        circle(pos, CR, grayscale(prob));
        ring(pos, CR, "rgba(255,255,255,0.7)", 1.5);
      }

      const lc = prob > 0.55 ? "rgb(26,26,26)" : "rgb(242,242,242)";
      text(pauli, pos.x - 14, pos.y + 6, 13, lc);
    }

    // H swap traveling circles
    if (animT < 1) {
      const et = ease(animT);
      for (const ap of animPairs) {
        const p = lerp(ap.from, ap.to, et);
        circle(p, CR, ap.color);
        ring(p, CR, "rgba(255,255,255,0.7)", 1.5);
      }
    }

    // X / Z coin-flip circles
    if (flipT < 1) {
      const fy = Math.abs(Math.cos(flipT * Math.PI));
      for (const fc of flipCells) {
        const col = flipT < 0.5 ? fc.start : fc.end;
        ctx.save();
        ctx.translate(fc.pos.x, fc.pos.y);
        ctx.scale(1, fy);
        circle({ x: 0, y: 0 }, CR, col);
        ring({ x: 0, y: 0 }, CR, "rgba(255,255,255,0.7)", 1.5);
        ctx.restore();
      }
    }

    // CZ animation — green routing lines, traveling circles, XX flip
    if (czT < 1) {
      const green = "rgba(77,255,115,0.9)";
      const bx = BX;
      const btnBottom = CZ_BTN_Y + BTN_S / 2;
      const xxTop = { x: spKey("XX").x, y: spKey("XX").y - DR };
      cable([{ x: bx, y: btnBottom }, { x: bx, y: xxTop.y }], green, CW);
      for (const arm of [
        ["XZ", "XI", -1],
        ["ZX", "IX", 1],
      ] as [string, string, number][]) {
        const midTop = { x: spKey(arm[0]).x, y: spKey(arm[0]).y - DR };
        const endTop = { x: spKey(arm[1]).x, y: spKey(arm[1]).y - DR };
        const sign = arm[2];
        const cp = spKey(arm[1]);
        const notchA = { x: endTop.x + sign * DR, y: endTop.y };
        const notchB = { x: notchA.x, y: notchA.y + DR };
        cable([xxTop, midTop, endTop, notchA, notchB, cp], green, CW);
      }
      const et = ease(czT);
      for (const sw of czSwaps) {
        const p = lerp(sw.from, sw.to, et);
        circle(p, CR, sw.color);
        ring(p, CR, "rgba(255,255,255,0.7)", 1.5);
      }
      if (czCells.length > 0) {
        const fy = Math.abs(Math.cos(czT * Math.PI));
        for (const fc of czCells) {
          const col = czT < 0.5 ? fc.start : fc.end;
          ctx.save();
          ctx.translate(fc.pos.x, fc.pos.y);
          ctx.scale(1, fy);
          circle({ x: 0, y: 0 }, CR, col);
          ring({ x: 0, y: 0 }, CR, "rgba(255,255,255,0.7)", 1.5);
          ctx.restore();
        }
      }
    }
  }

  function drawTarget() {
    const goal = puzzles[pidx].goal;
    if (Object.keys(goal).length === 0) return;
    const MBX = 85;
    const MBY = 215;
    const MS = 20;
    const MDR = 13;
    const MCR = 8;
    text("Target", MBX - 40, MBY - MDR - 55, 14, C_LBL);
    for (const pauli in BOXES) {
      const gv = BOXES[pauli];
      const pos = { x: MBX + gv.x * MS, y: MBY + (3.5 - gv.y) * MS };
      drawDiamond(pos, MDR, C_CELL_BG, "rgba(140,140,217,0.3)", 0.6);
      if (Object.prototype.hasOwnProperty.call(goal, pauli)) {
        const prob = (1 - goal[pauli]) / 2;
        drawDiamond(pos, MDR, C_CELL, C_WIN, 1.2);
        circle(pos, MCR, grayscale(prob));
        ring(pos, MCR, "rgba(255,255,255,0.5)", 1.0);
      }
    }
  }

  function drawBoardButtons() {
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const r = btnRect(b);
      const en = btnEnabled(b);
      const hovered = en && i === hov;

      const bg = hovered ? C_BTN_HOV : en ? C_BTN_ON : C_BTN_OFF;
      fillRect(r.x, r.y, r.w, r.h, bg);
      strokeRect(r.x, r.y, r.w, r.h, en ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)", 1.5);

      const tc = en ? C_BTN_TXT : "rgb(89,89,128)";
      text(b.gate.toUpperCase(), r.x + BTN_S / 2, r.y + BTN_S / 2 + 4, 26, tc, "center", "700");
      text("GATE", r.x + BTN_S / 2, r.y + BTN_S / 2 + 22, 13, tc, "center");

      const rem = uses[b.qkey]?.[b.gate] ?? -1;
      if (rem > 0) text(`(${rem})`, r.x + 8, r.y + 16, 11, tc);
    }
  }

  function drawPanel() {
    fillRect(PX, 0, W - PX, H, C_PANEL);
    const puz = puzzles[pidx];
    text(`Puzzle ${pidx + 1} / ${puzzles.length}`, PX + 16, 32, 15, C_LBL);
    text(puz.title, PX + 16, 62, 24, "rgb(255,255,255)", "left", "600");

    let dy = 96;
    for (const l of puz.desc.split("\n")) {
      text(l, PX + 16, dy, 15, C_LBL);
      dy += 22;
    }

    let goalStr = "";
    for (const p in puz.goal) goalStr += `${p}=${puz.goal[p]}  `;
    if (goalStr === "") goalStr = "(explore)";
    text("Goal: " + goalStr, PX + 16, dy + 6, 15, C_WIN);

    text(`Moves: ${moves}`, PX + 16, H - 20, 15, C_LBL);
  }

  function drawSuccess() {
    fillRect(0, H / 2 - 65, W, 130, "rgba(0,0,0,0.78)");
    text("Puzzle solved!", W / 2, H / 2 - 8, 44, C_WIN, "center", "700");
    text("Click to continue", W / 2, H / 2 + 44, 22, C_LBL, "center");
  }

  function draw() {
    fillRect(0, 0, W, H, C_BG);
    drawBoard();
    drawTarget();
    drawBoardButtons();
    drawPanel();
    if (phase === "success") drawSuccess();
  }

  // -- Loop -----------------------------------------------------------------
  let last = performance.now();
  let raf = 0;
  function loop(now: number) {
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (animT < 1) {
      animT = Math.min(animT + delta / ANIM_DUR, 1);
      if (animT >= 1) {
        animPairs = [];
        animPaulis = [];
        if (pendingPress) {
          finishPress(pendingPress);
          pendingPress = null;
        }
      }
    }
    if (flipT < 1) {
      flipT = Math.min(flipT + delta / ANIM_DUR, 1);
      if (flipT >= 1) {
        flipCells = [];
        flipPaulis = [];
        if (pendingFlip) {
          finishPress(pendingFlip);
          pendingFlip = null;
        }
      }
    }
    if (czT < 1) {
      czT = Math.min(czT + delta / ANIM_DUR, 1);
      if (czT >= 1) {
        czSwaps = [];
        czCells = [];
        czPaulis = [];
        if (pendingCz) {
          finishPress(pendingCz);
          pendingCz = null;
        }
      }
    }

    draw();
    raf = requestAnimationFrame(loop);
  }

  // -- Input ----------------------------------------------------------------
  function toInternal(ev: MouseEvent): Vec {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) * W) / rect.width,
      y: ((ev.clientY - rect.top) * H) / rect.height,
    };
  }

  function onMove(ev: MouseEvent) {
    if (phase !== "play") return;
    const p = toInternal(ev);
    const old = hov;
    hov = -1;
    for (let i = 0; i < btns.length; i++) {
      if (rectHas(btnRect(btns[i]), p) && btnEnabled(btns[i])) {
        hov = i;
        break;
      }
    }
    canvas.style.cursor = hov >= 0 ? "pointer" : "default";
    void old;
  }

  function onDown(ev: MouseEvent) {
    if (ev.button !== 0) return;
    if (phase === "success") {
      const nxt = pidx + 1;
      if (nxt < puzzles.length) load(nxt);
      else opts.onExit();
      return;
    }
    const p = toInternal(ev);
    for (const b of btns) {
      if (rectHas(btnRect(b), p) && btnEnabled(b)) {
        press(b);
        return;
      }
    }
  }

  function onResize() {
    resize();
  }

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("resize", onResize);

  load(0);
  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onResize);
    },
  };
}
