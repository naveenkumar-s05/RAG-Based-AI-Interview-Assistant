import ErrorMessage from "../common/ErrorMessage";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";

function statusTone(status = "") {
  if (status === "Correct") return "success";
  if (status === "Partially Correct") return "warning";
  return "danger";
}

function CodingSection({
  codingQuestions,
  codingIndex,
  code,
  setCode,
  codingEvaluation,
  codingSubmitted,
  loading,
  error,
  handleCodingSubmit,
  handleCodingNext,
}) {
  const question = codingQuestions[codingIndex];

  if (!question) {
    return (
      <div className="container">
        <div className="panel panel-pad card">
          <h2>No coding question available.</h2>
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  const total = codingQuestions.length;
  const progress = total > 0 ? ((codingIndex + 1) / total) * 100 : 0;
  const isLast = codingIndex === total - 1;

  return (
    <div className="container container--xl">
      <div className="panel panel-pad">
        {/* HEADER */}
        <div className="q-header">
          <div>
            <span className="q-label">
              <Icon name="code" size={13} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
              Coding Interview
            </span>
            <h1 className="q-title">
              Problem {codingIndex + 1}
              <span> / {total}</span>
            </h1>
          </div>
          <Badge tone="navy">{question.difficulty}</Badge>
        </div>

        {/* PROGRESS */}
        <ProgressBar
          value={progress}
          labels={{
            left: "Coding round",
            right: `${codingIndex + 1} of ${total} answered`,
          }}
        />

        <div className="q-topic-row">
          <div className="topic-chip">
            <Icon name="cpu" size={14} />
            {question.topic}
          </div>
        </div>

        {/* TWO PANE */}
        <div className="coding-layout">
          {/* LEFT — PROBLEM */}
          <div className="problem-panel" style={{ background: "var(--color-surface-muted)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
            <h2 style={{ fontSize: "var(--font-size-lg)", color: "var(--color-navy-900)" }}>
              Problem
            </h2>

            <p className="problem-text">{question.question}</p>

            <div className="problem-details">
              <div className="problem-block">
                <div className="problem-block-head">
                  <Icon name="alert" size={13} />
                  Constraints
                </div>
                <pre>{question.constraints}</pre>
              </div>

              <div className="problem-block">
                <div className="problem-block-head">
                  <Icon name="py" size={13} />
                  Sample Input
                </div>
                <pre>{question.sample_input}</pre>
              </div>

              <div className="problem-block">
                <div className="problem-block-head">
                  <Icon name="check" size={13} />
                  Sample Output
                </div>
                <pre>{question.sample_output}</pre>
              </div>
            </div>
          </div>

          {/* RIGHT — EDITOR */}
          <div className="editor-panel">
            <div className="editor-meta">
              <span>Your Code</span>
              <span className="editor-lang">python</span>
            </div>

            <textarea
              className="code-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={`# Write your solution here

def solution():
    pass`}
              disabled={codingSubmitted || loading}
              spellCheck="false"
            />

            {!codingSubmitted && (
              <div className="code-actions">
                <Button
                  variant="primary"
                  full
                  size="lg"
                  onClick={handleCodingSubmit}
                  disabled={loading || !code.trim()}
                  loading={loading}
                >
                  {!loading && <>Submit Code</>}
                  {!loading && <Icon name="arrowRight" size={18} />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ marginTop: "var(--space-5)" }}>
            <ErrorMessage error={error} />
          </div>
        )}

        {/* EVALUATION */}
        {codingSubmitted && codingEvaluation && (
          <div className="evaluation-card">
            <div className="eval-head">
              <span className="eval-head-label">Code Evaluation</span>
              <span className="eval-score">{codingEvaluation.score}/10</span>
            </div>

            <div className="eval-status-row">
              <Badge tone={statusTone(codingEvaluation.status)}>
                {codingEvaluation.status === "Correct" && <Icon name="check" size={12} strokeWidth={3} />}
                {codingEvaluation.status === "Partially Correct" && <Icon name="alert" size={12} />}
                {codingEvaluation.status === "Incorrect" && <Icon name="x" size={12} strokeWidth={3} />}
                {codingEvaluation.status}
              </Badge>
            </div>

            <p className="eval-feedback">{codingEvaluation.feedback}</p>

            <div className="section-actions">
              <Button variant="primary" full size="lg" onClick={handleCodingNext}>
                {isLast ? "Finish Interview" : "Next Problem"}
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodingSection;