import { forwardRef } from "react";

const VARIANTS = {
  primary: "bg-signal-600 text-white hover:bg-signal-700 shadow-card",
  secondary: "bg-white text-ink-800 border border-ink-100 hover:border-ink-200 hover:bg-ink-50",
  ghost: "text-ink-600 hover:bg-ink-100",
  danger: "bg-white text-risk-high border border-risk-high/30 hover:bg-red-50",
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
