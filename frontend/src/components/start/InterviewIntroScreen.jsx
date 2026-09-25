import Button from "../common/Button";
import Icon from "../common/Icon";
import Badge from "../common/Badge";
import ErrorMessage from "../common/ErrorMessage";
import Stepper from "../common/Stepper";

const INTERVIEW_FLOW = [
  {
    num: "01",
    title: "Conceptual Interview",
    text: "Ten questions on fundamentals — Python, DSA, DBMS, OOP, ML and Deep Learning.",
    badge: "10 questions",
  },
  {
    num: "02",
    title: "Resume Interview",
    text: "Adaptive questions generated from your uploaded resume using RAG retrieval.",
    badge: "Adaptive",
  },
  {
    num: "03",
    title: "Coding Interview",
    text: "Three programming problems with samples and constraints to solve in code.",
    badge: "3 problems",
  },
  {
    num: "04",
    title: "Results",
    text: "Per-section scores, a skill breakdown, and an AI job-readiness verdict.",
    badge: "Instant",
  },
];

function InterviewIntroScreen({
  role,
  onStart,
  onBack,
  loading,
  error,
}) {
  return (
    <div className="card card--padded card--slide-up">
      <Stepper steps={["Register", "Resume", "Intro", "Interview"]} current={2} />

      <div className="screen-header" style={{ marginBottom: "var(--space-6)" }}>
        <span className="screen-label">Step 3 of 4</span>
        <h2 className="screen-title">Ready When You Are</h2>
        <p className="screen-subtitle">
          Here's exactly what your interview will look like. Each round builds
          on the previous one.
        </p>
      </div>

      <div className="role-card">
        <div className="role-card-inner">
          <span className="screen-label-role">Interview Role</span>
          <h3>{role}</h3>
          <p>
            An adaptive technical interview that combines standardized
            questions with a deep dive into your own experience.
          </p>
        </div>
      </div>

      <div className="structure-list">
        {INTERVIEW_FLOW.map((item) => (
          <div className="structure-item" key={item.num}>
            <div className="struct-num">{item.num}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
            <div className="struct-badge">
              <Badge tone="indigo">{item.badge}</Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <span>Duration</span>
          <strong>~45 min</strong>
        </div>
        <div className="stat-item">
          <span>Difficulty</span>
          <strong>Medium</strong>
        </div>
        <div className="stat-item">
          <span>Questions</span>
          <strong>10 + 10 + 3</strong>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="form-footer" style={{ flexWrap: "nowrap" }}>
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          loading={loading}
          full
        >
          {!loading && <>Start Interview</>}
          {!loading && <Icon name="arrowRight" size={18} />}
        </Button>
      </div>

      <p className="field-hint" style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
        {loading
          ? "Analyzing your resume and preparing the first question…"
          : "Your resume is analyzed before the interview begins."}
      </p>
    </div>
  );
}

export default InterviewIntroScreen;