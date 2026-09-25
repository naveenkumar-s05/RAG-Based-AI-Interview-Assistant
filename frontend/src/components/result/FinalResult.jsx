import Button from "../common/Button";
import Icon from "../common/Icon";
import Badge from "../common/Badge";
import SkillAssessment from "./SkillAssessment";

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }
  return `${Number(value)}/10`;
}

function verdictFor(score) {
  const number = Number(score);
  if (Number.isNaN(number)) return "Not assessed";
  if (number >= 8) return "Excellent performance";
  if (number >= 6) return "Strong performance";
  if (number >= 4) return "Developing skills";
  return "Needs improvement";
}

function FinalResult({ finalResult }) {
  const sectionCards = [
    { key: "conceptual", label: "Conceptual", score: finalResult.conceptual, count: finalResult.conceptualCount, icon: "message" },
    { key: "resume", label: "Resume", score: finalResult.resume, count: finalResult.resumeCount, icon: "briefcase" },
    { key: "coding", label: "Coding", score: finalResult.coding, count: finalResult.codingCount, icon: "code" },
  ];

  return (
    <div className="container container--lg">
      {/* HERO */}
      <div className="result-hero">
        <div className="result-hero-inner">
          <span className="screen-label-role">Interview Completed</span>
          <h1>Your Interview Results</h1>

          <div className="score-ring">
            <strong>{formatScore(finalResult.overall)}</strong>
            <span>overall score</span>
          </div>

          <span className="result-verdict">
            <Icon name="sparkles" size={15} />
            {verdictFor(finalResult.overall)}
          </span>
        </div>
      </div>

      {/* SECTION SCORES */}
      <div className="result-grid-3">
        {sectionCards.map((card) => (
          <div className="result-score-card" key={card.key}>
            <span>
              <Icon name={card.icon} size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: "4px" }} />
              {card.label}
            </span>
            <strong>{formatScore(card.score)}</strong>
            <small>{card.count ?? 0} questions answered</small>
          </div>
        ))}
      </div>

      {/* SKILL ASSESSMENT */}
      <div className="card card--padded result-section" style={{ marginTop: "var(--space-6)" }}>
        <SkillAssessment finalResult={finalResult} />

        {/* AI JOB READINESS */}
        <div className="job-readiness-card" style={{ marginTop: "var(--space-6)" }}>
          <div className="job-readiness-inner">
            <div className="jr-badge">
              <Icon name="gauge" size={34} strokeWidth={1.8} />
            </div>
            <div className="jr-meta">
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#b9c3ea",
                }}
              >
                AI Job Readiness
              </span>

              {finalResult.jobReadiness ? (
                <>
                  <strong>{finalResult.jobReadiness}</strong>
                  {finalResult.jobReadinessConfidence !== null && (
                    <span className="jr-confidence">
                      <Icon name="target" size={14} />
                      {finalResult.jobReadinessConfidence}% confidence
                    </span>
                  )}
                </>
              ) : (
                <strong style={{ fontSize: "var(--font-size-md)", color: "#93a1cf" }}>
                  Prediction not available
                </strong>
              )}
            </div>
          </div>
        </div>

        {/* INTERVIEW SUMMARY */}
        <div className="summary-card" style={{ marginTop: "var(--space-6)" }}>
          <div className="summary-head">Interview Summary</div>
          <div className="summary-row">
            <span>
              <Icon name="message" size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: "6px" }} />
              Conceptual questions answered
            </span>
            <strong>{finalResult.conceptualCount ?? 0}</strong>
          </div>
          <div className="summary-row">
            <span>
              <Icon name="file" size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: "6px" }} />
              Resume questions answered
            </span>
            <strong>{finalResult.resumeCount ?? 0}</strong>
          </div>
          <div className="summary-row">
            <span>
              <Icon name="code" size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: "6px" }} />
              Coding questions answered
            </span>
            <strong>{finalResult.codingCount ?? 0}</strong>
          </div>
        </div>

        <div className="result-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <Icon name="refresh" size={17} />
            Start New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FinalResult;