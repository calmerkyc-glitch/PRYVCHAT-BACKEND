export default function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold transition duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none";

  const variants = {
    primary: "bg-indigo-950 text-white hover:bg-indigo-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
