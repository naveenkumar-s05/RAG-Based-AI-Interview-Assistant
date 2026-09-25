function toNumber(value) {
  const number = Number(value);
  return value !== null && value !== undefined && !Number.isNaN(number)
    ? number
    : null;
}

function SkillAssessment({ finalResult }) {
  const skills = [
    { name: "Technical Knowledge", score: toNumber(finalResult.technicalKnowledge), icon: null },
    { name: "Problem Solving", score: toNumber(finalResult.problemSolving), icon: null },
    { name: "Logical Thinking", score: toNumber(finalResult.logicalThinking), icon: null },
    { name: "Programming / Coding", score: toNumber(finalResult.programming), icon: null },
    { name: "Communication", score: toNumber(finalResult.communication), icon: null },
  ];

  const presentSkills = skills.filter((skill) => skill.score !== null);

  if (presentSkills.length === 0) {
    return null;
  }

  return (
    <div className="result-section">
      <h3 className="result-section-title">Skill Assessment</h3>

      <div className="skill-grid">
        {presentSkills.map((skill) => {
          const percentage = Math.max(
            0,
            Math.min(100, skill.score * 10)
          );

          return (
            <div className="skill-item" key={skill.name}>
              <div className="skill-head">
                <span>{skill.name}</span>
                <strong>{skill.score}/10</strong>
              </div>
              <div className="skill-track">
                <div
                  className="skill-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillAssessment;