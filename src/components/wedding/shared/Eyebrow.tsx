export default function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-center text-[11px] tracking-[0.28em] text-[var(--w-accent)] uppercase">
      {children}
    </p>
  );
}
