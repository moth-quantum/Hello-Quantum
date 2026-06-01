import Link from "next/link";

export default function TitleScreen() {
  return (
    <main className="quantum-bg min-h-screen flex flex-col items-center justify-center px-6">
      {/* Decorative circles - mimicking the qubit display */}
      <div className="flex gap-3 mb-12">
        <div className="qubit-circle black" />
        <div className="qubit-circle outline" />
        <div className="qubit-circle black" />
        <div className="qubit-circle outline" />
      </div>

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight text-center mb-4">
        Hello Quantum
      </h1>

      {/* Subtitle */}
      <p className="text-white/70 text-lg sm:text-xl text-center max-w-md mb-16">
        A puzzle game about quantum computation
      </p>

      {/* Play Button */}
      <Link
        href="/play"
        className="gate-button w-auto px-12 py-4 text-xl"
      >
        Play
      </Link>

      {/* Footer */}
      <p className="absolute bottom-8 text-white/40 text-sm">
        Tap to begin
      </p>
    </main>
  );
}
