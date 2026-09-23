export default function Card({ children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-xl2 border border-white/10 bg-ink-900/60 shadow-glow backdrop-blur-xl ${
        padded ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
