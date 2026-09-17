export default function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-[var(--gold)]">Formation Free</p>
      <h1 className={`font-serif tracking-tight ${compact ? "text-2xl" : "text-4xl sm:text-5xl md:text-6xl"}`}>Fresque TMS</h1>
    </div>
  );
}
