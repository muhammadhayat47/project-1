export default function Card({ children, className = "", padded = true }) {
  return (
    <div
      className={`rounded-xl2 border border-ink-100 bg-white shadow-card ${
        padded ? "p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
