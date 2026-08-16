function CandidateForm({
  name,
  email,
  setName,
  setEmail,
  disabled = false,
}) {
  return (
    <div
      style={{
        marginBottom: "24px",
        paddingBottom: "24px",
        borderBottom: "1px solid #e7eaf3",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.2px",
              color: "#5b67d8",
              marginBottom: "5px",
            }}
          >
            CANDIDATE
          </span>

          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              color: "#172033",
              fontWeight: 700,
            }}
          >
            Your Information
          </h3>
        </div>

        <span
          style={{
            padding: "7px 11px",
            borderRadius: "999px",
            background: "#f0f2ff",
            color: "#5965d6",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Required
        </span>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <label
          htmlFor="candidate-name"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#4b556b",
          }}
        >
          Full Name
        </label>

        <input
          id="candidate-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter your full name"
          disabled={disabled}
          autoComplete="name"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 14px",
            border: "1px solid #dfe3f0",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
            color: "#27314a",
            background: disabled ? "#f5f6fa" : "#fff",
          }}
        />
      </div>

      <div>
        <label
          htmlFor="candidate-email"
          style={{
            display: "block",
            marginBottom: "7px",
            fontSize: "13px",
            fontWeight: 600,
            color: "#4b556b",
          }}
        >
          Email Address
        </label>

        <input
          id="candidate-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          disabled={disabled}
          autoComplete="email"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "13px 14px",
            border: "1px solid #dfe3f0",
            borderRadius: "10px",
            outline: "none",
            fontSize: "14px",
            color: "#27314a",
            background: disabled ? "#f5f6fa" : "#fff",
          }}
        />
      </div>
    </div>
  );
}

export default CandidateForm;