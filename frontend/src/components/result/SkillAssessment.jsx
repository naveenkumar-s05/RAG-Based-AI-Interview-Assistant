function SkillAssessment({ finalResult }) {
  return (
    <div
      className="evaluation-box"
      style={{ marginTop: "24px" }}
    >

      <div
        className="evaluation-header"
        style={{ marginBottom: "22px" }}
      >
        <span>
          SKILL ASSESSMENT
        </span>
      </div>

      {[
        {
          name: "Technical Knowledge",
          score: finalResult.conceptual
        },
        {
          name: "Problem Solving",
          score: finalResult.coding
        },
        {
          name: "Logical Thinking",
          score:
            finalResult.conceptual !== null &&
            finalResult.coding !== null
        ? Math.round(
            (
              (
                finalResult.conceptual +
                finalResult.coding
              ) / 2
            ) * 10
          ) / 10
        : null
        },
        {
          name: "Programming / Coding",
          score: finalResult.coding
        },
        {
          name: "Communication",
          score: finalResult.resume
        }
      ].map((skill) => {

        const score =
          skill.score !== null &&
          !Number.isNaN(Number(skill.score))
            ? Number(skill.score)
            : null;

        const percentage =
          score !== null
            ? Math.max(
          0,
          Math.min(100, score * 10)
        )
            : 0;

        return (
          <div
            key={skill.name}
            style={{ marginBottom: "20px" }}
          >

            <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px"
        }}
            >

        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#172033"
          }}
        >
          {skill.name}
        </span>

        <strong
          style={{
            fontSize: "14px",
            color: "#5965d8"
          }}
        >
          {score !== null
            ? `${score}/10`
            : "N/A"}
        </strong>

            </div>

            <div
        style={{
          width: "100%",
          height: "8px",
          background: "#e9ebf5",
          borderRadius: "999px",
          overflow: "hidden"
        }}
            >

        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#5965d8",
            borderRadius: "999px",
            transition: "width 0.5s ease"
          }}
        />

            </div>

          </div>
        );
      })}

    </div>



  );
}

export default SkillAssessment;
