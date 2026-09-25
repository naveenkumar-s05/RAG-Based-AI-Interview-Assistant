function Badge({ children, tone = "indigo", className = "", ...rest }) {
  return (
    <span
      className={`badge badge--${tone}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;