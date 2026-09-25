import Icon from "../common/Icon";

function Brand({ tagline = null }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Icon name="cpu" size={18} strokeWidth={2.2} />
      </span>
      <span className="brand-name">
        AI<span>Interview</span>
      </span>
      {tagline && <span style={{ marginLeft: "10px", paddingLeft: "12px", borderLeft: "1px solid var(--color-border)", fontSize: "13px", color: "var(--color-text-muted)" }}>{tagline}</span>}
    </div>
  );
}

export default Brand;