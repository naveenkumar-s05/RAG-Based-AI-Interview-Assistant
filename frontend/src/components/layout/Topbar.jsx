import Brand from "./Brand";

function Topbar({ role = null }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        {role && (
          <span className="topbar-role">
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-success)",
                boxShadow: "0 0 0 4px var(--color-success-bg)",
              }}
            />
            {role}
          </span>
        )}
      </div>
    </header>
  );
}

export default Topbar;