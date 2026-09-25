import ErrorMessage from "../common/ErrorMessage";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";
import VoiceControls from "../voice/VoiceControls";

function statusTone(status = "") {
  if (status === "Correct") return "success";
  if (status === "Partially Correct") return "warning";
  return "danger";
}

function ConceptualSection({
  conceptualQuestions,
  conceptualIndex,
  answer,
  setAnswer,
  conceptualEvaluation,
  conceptualSubmitted,
  loading,
  error,
  handleConceptualSubmit,
  handleConceptualNext,
}) {
  const question = conceptualQuestions[conceptualIndex];

  if (!question) {
    return (
      <div className="container">
        <div className="panel panel-pad card">
          <h2>No conceptual question available.</h2>
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  const total = conceptualQuestions.length;
  const progress = total > 0 ? ((conceptualIndex + 1) / total) * 100 : 0;
  const isLast = conceptualIndex === total - 1;

  const handleVoiceTranscript = (transcript) => setAnswer(transcript);

  return (
    <div className="container container--lg">
      <div className="panel panel-pad">
        {/* HEADER */}
        <div className="q-header">
          <div>
            <span className="q-label">
              <Icon name="message" size={13} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
              Conceptual Interview
            </span>
            <h1 className="q-title">
              Question {conceptualIndex + 1}
              <span> / {total}</span>
            </h1>
          </div>
          <Badge tone="navy">{question.difficulty}</Badge>
        </div>

        {/* PROGRESS */}
        <ProgressBar
          value={progress}
          labels={{
            left: "Conceptual round",
            right: `${conceptualIndex + 1} of ${total} answered`,
          }}
        />

        {/* TOPIC + QUESTION */}
        <div className="q-topic-row">
          <div className="topic-chip">
            <Icon name="layers" size={14} />
            {question.topic}
          </div>
        </div>

        <div className="question-box">
          <h2>{question.question}</h2>
        </div>

        {/* ANSWER */}
        <div className="answer-area">
          <label className="form-label" htmlFor={`conceptual-answer-${conceptualIndex}`}>
            Your Answer
          </label>
          <textarea
            id={`conceptual-answer-${conceptualIndex}`}
            className="answer-textarea"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here…"
            disabled={conceptualSubmitted || loading}
          />
        </div>

        {/* VOICE */}
        {!conceptualSubmitted && (
          <VoiceControls
            question={question.question}
            onTranscript={handleVoiceTranscript}
            disabled={loading}
          />
        )}

        {/* ERROR */}
        {error && (
          <div style={{ marginTop: "var(--space-5)" }}>
            <ErrorMessage error={error} />
          </div>
        )}

        {/* SUBMIT */}
        {!conceptualSubmitted && (
          <div className="section-actions">
            <Button
              variant="primary"
              full
              size="lg"
              onClick={handleConceptualSubmit}
              disabled={loading || !answer.trim()}
              loading={loading}
            >
              {!loading && <>Submit Answer</>}
              {!loading && <Icon name="arrowRight" size={18} />}
            </Button>
          </div>
        )}

        {/* EVALUATION */}
        {conceptualSubmitted && conceptualEvaluation && (
          <div className="evaluation-card">
            <div className="eval-head">
              <span className="eval-head-label">Answer Evaluation</span>
              <span className="eval-score">{conceptualEvaluation.score}/10</span>
            </div>

            <div className="eval-status-row">
              <Badge tone={statusTone(conceptualEvaluation.status)}>
                {conceptualEvaluation.status === "Correct" && <Icon name="check" size={12} strokeWidth={3} />}
                {conceptualEvaluation.status === "Partially Correct" && <Icon name="alert" size={12} />}
                {conceptualEvaluation.status === "Incorrect" && <Icon name="x" size={12} strokeWidth={3} />}
                {conceptualEvaluation.status}
              </Badge>
            </div>

            <p className="eval-feedback">{conceptualEvaluation.feedback}</p>

            <div className="section-actions">
              <Button variant="primary" full size="lg" onClick={handleConceptualNext}>
                {isLast ? "Start Resume Interview" : "Next Question"}
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConceptualSection;