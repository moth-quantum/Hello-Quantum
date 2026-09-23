import { HelloQubitsGame } from "@/components/hello-qubits-game";

export default function PlayPage() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center p-4"
      style={{ background: "rgb(77,77,158)" }}
    >
      <HelloQubitsGame />
    </main>
  );
}
