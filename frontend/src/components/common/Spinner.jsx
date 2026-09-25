function Spinner({ variant = "light", size = "md", className = "" }) {
  const classes = [
    "spinner",
    variant === "dark" ? "spinner--dark" : "",
    size === "lg" ? "spinner--lg" : size === "md" ? "spinner--md" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} aria-hidden="true" />;
}

export default Spinner;