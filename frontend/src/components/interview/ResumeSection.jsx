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

function ResumeSection({
  resumeQuestion,
  resumeQuestionCount,
  answer,
  setAnswer,
  resumeEvaluation,
  resumeSubmitted,
  loading,
  error,
  handleResumeSubmit,
  handleResumeNext,
}) {
  if (!resumeQuestion) {
    return (
      <div className="container">
        <div className="panel panel-pad card">
          <h2>Resume question unavailable.</h2>
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  const isFollowUp = resumeQuestion.type === "follow_up";
  const progress = Math.min((resumeQuestionCount / 10) * 100, 100);
  const handleVoiceTranscript = (transcript) => setAnswer(transcript);

  return (
    <div className="container container--lg">
      <div className="panel panel-pad">
        {/* HEADER */}
        <div className="q-header">
          <div>
            <span className="q-label">
              <Icon name="file" size={13} style={{ display: "inline", verticalAlign: "-2px" }} />{" "}
              {isFollowUp ? "Resume Follow-up" : "Resume Interview"}
            </span>
            <h1 className="q-title">
              Question {resumeQuestionCount}
              <span> / 10</span>
            </h1>
          </div>
          <Badge tone={isFollowUp ? "warning" : "navy"}>
            {resumeQuestion.difficulty}
          </Badge>
        </div>

        {/* PROGRESS */}
        <ProgressBar
          value={progress}
          labels={{
            left: "Resume round",
            right: `${resumeQuestionCount} of 10 answered`,
          }}
        />

        {/* TOPIC + QUESTION */}
        <div className="q-topic-row">
          <div className="topic-chip">
            <Icon name={isFollowUp ? "zap" : "briefcase"} size={14} />
            {resumeQuestion.topic}
          </div>
          {isFollowUp && <Badge tone="warning">Follow-up</Badge>}
        </div>

        <div className="question-box">
          <h2>{resumeQuestion.question}</h2>
        </div>

        {/* ANSWER */}
        <div className="answer-area">
          <label className="form-label" htmlFor={`resume-answer-${resumeQuestionCount}`}>
            Your Answer
          </label>
          <textarea
            id={`resume-answer-${resumeQuestionCount}`}
            className="answer-textarea"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Type your answer here…"
            disabled={resumeSubmitted || loading}
          />
        </div>

        {/* VOICE */}
        {!resumeSubmitted && (
          <VoiceControls
            question={resumeQuestion.question}
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
        {!resumeSubmitted && (
          <div className="section-actions">
            <Button
              variant="primary"
              full
              size="lg"
              onClick={handleResumeSubmit}
              disabled={loading || !answer.trim()}
              loading={loading}
            >
              {!loading && <>Submit Answer</>}
              {!loading && <Icon name="arrowRight" size={18} />}
            </Button>
          </div>
        )}

        {/* EVALUATION */}
        {resumeSubmitted && resumeEvaluation && (
          <div className="evaluation-card">
            <div className="eval-head">
              <span className="eval-head-label">Answer Evaluation</span>
              <span className="eval-score">{resumeEvaluation.score}/10</span>
            </div>

            <div className="eval-status-row">
              <Badge tone={statusTone(resumeEvaluation.status)}>
                {resumeEvaluation.status === "Correct" && <Icon name="check" size={12} strokeWidth={3} />}
                {resumeEvaluation.status === "Partially Correct" && <Icon name="alert" size={12} />}
                {resumeEvaluation.status === "Incorrect" && <Icon name="x" size={12} strokeWidth={3} />}
                {resumeEvaluation.status}
              </Badge>
            </div>

            <p className="eval-feedback">{resumeEvaluation.feedback}</p>

            <div className="section-actions">
              <Button
                variant="primary"
                full
                size="lg"
                onClick={handleResumeNext}
                loading={loading}
              >
                {!loading && <>Next Question</>}
                {!loading && <Icon name="arrowRight" size={18} />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeSection;