function Button({
  children,
  variant = "primary",
  size,
  full = false,
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  ...rest
}) {
  const classes = [
    "btn",
    variant ? `btn--${variant}` : "",
    size ? `btn--${size}` : "",
    full ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="spinner btn-spinner" />}
      {children}
    </button>
  );
}

export default Button;