import Link from "next/link";

export default function TitlePage() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6 text-center"
      style={{ background: "rgb(77,77,158)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl">Hello Quantum</h1>
        <p className="max-w-md text-lg text-[rgb(217,224,255)]">
          A two-qubit quantum computing puzzle game. Transform the state with quantum gates until it
          matches the target.
        </p>
      </div>

      <Link
        href="/play"
        className="rounded-full bg-white px-10 py-3 text-lg font-semibold text-[rgb(38,38,89)] shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(89,255,140)]"
      >
        Play
      </Link>

      <p className="text-sm text-[rgb(179,179,255)]">
        Based on Hello Qiskit · Quantum engine by MicroMoth
      </p>
    </main>
  );
}
