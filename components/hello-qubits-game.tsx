"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/lib/hello-qubits-engine";

export function HelloQubitsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = createGame(canvas, { onExit: () => router.push("/") });
    return () => game.destroy();
  }, [router]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[960px] rounded-xl shadow-2xl"
      style={{ aspectRatio: "960 / 640" }}
      aria-label="Hello Quantum game board"
    />
  );
}
