import { forwardRef } from "react";

const VARIANTS = {
  primary: "bg-gradient-to-r from-glow-500 to-glow-600 text-ink-950 hover:brightness-110 shadow-glow font-semibold",
  secondary: "bg-white/10 text-white border border-white/15 hover:bg-white/15",
  ghost: "text-ink-300 hover:bg-white/10",
  danger: "bg-white/10 text-red-300 border border-red-400/30 hover:bg-red-500/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = forwardRef(function Button(
  { variant = "primary", size = "md", className = "", children, disabled, loading, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

export default Button;
