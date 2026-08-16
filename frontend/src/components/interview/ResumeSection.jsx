import ErrorMessage from "../common/ErrorMessage";
import VoiceControls from "../voice/VoiceControls";

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

  // =====================================================
  // RESUME QUESTION CHECK
  // =====================================================

  if (!resumeQuestion) {

    return (

      <div className="app">

        <div className="question-card">

          <h2>
            Resume question unavailable.
          </h2>

          <ErrorMessage
            error={error}
          />

        </div>

      </div>

    );

  }


  // =====================================================
  // FOLLOW-UP QUESTION
  // =====================================================

  const isFollowUp =
    resumeQuestion.type ===
    "follow_up";


  // =====================================================
  // PROGRESS
  // =====================================================

  const progress =
    Math.min(
      (
        resumeQuestionCount
        /
        10
      ) * 100,
      100
    );


  // =====================================================
  // VOICE TRANSCRIPT
  // =====================================================

  const handleVoiceTranscript = (
    transcript
  ) => {

    setAnswer(transcript);

  };


  return (

    <div className="app">

      <div className="question-card">


        {/* =================================================
            QUESTION HEADER
            ================================================= */}

        <div className="question-header">

          <div>

            <span className="question-label">

              {isFollowUp
                ? "RESUME FOLLOW-UP"
                : "RESUME INTERVIEW"
              }

            </span>


            <h1>

              Question{" "}
              {resumeQuestionCount}

              <span>
                {" "} / 10
              </span>

            </h1>

          </div>


          <div className="difficulty">

            {resumeQuestion.difficulty}

          </div>

        </div>


        {/* =================================================
            PROGRESS
            ================================================= */}

        <div className="progress-container">

          <div
            className="progress-bar"
            style={{
              width: `${progress}%`
            }}
          />

        </div>


        {/* =================================================
            TOPIC
            ================================================= */}

        <div className="topic">

          {isFollowUp
            ? `Follow-up: ${resumeQuestion.topic}`
            : `Topic: ${resumeQuestion.topic}`
          }

        </div>


        {/* =================================================
            QUESTION
            ================================================= */}

        <div className="question-box">

          <h2>
            {resumeQuestion.question}
          </h2>

        </div>


        {/* =================================================
            TEXT ANSWER
            ================================================= */}

        <div className="answer-section">

          <label>
            Your Answer
          </label>


          <textarea
            value={answer}
            onChange={(event) =>
              setAnswer(
                event.target.value
              )
            }
            placeholder="Type your answer here..."
            disabled={
              resumeSubmitted ||
              loading
            }
          />

        </div>


        {/* =================================================
            VOICE INTERVIEW
            ================================================= */}

        {!resumeSubmitted && (

          <VoiceControls
            question={
              resumeQuestion.question
            }

            onTranscript={
              handleVoiceTranscript
            }

            disabled={
              loading
            }
          />

        )}


        {/* =================================================
            ERROR
            ================================================= */}

        <ErrorMessage
          error={error}
        />


        {/* =================================================
            SUBMIT
            ================================================= */}

        {!resumeSubmitted && (

          <button
            className="submit-button"
            onClick={
              handleResumeSubmit
            }
            disabled={
              loading ||
              !answer.trim()
            }
          >

            {loading
              ? "Evaluating..."
              : "Submit Answer"
            }

            {!loading && (
              <span>
                →
              </span>
            )}

          </button>

        )}


        {/* =================================================
            EVALUATION
            ================================================= */}

        {resumeSubmitted &&
          resumeEvaluation && (

            <div className="evaluation-box">

              <div className="evaluation-header">

                <span>
                  ANSWER EVALUATION
                </span>

                <strong>
                  {
                    resumeEvaluation.score
                  }
                  /10
                </strong>

              </div>


              <div className="correct-status">

                {
                  resumeEvaluation.status
                }

              </div>


              <p>
                {
                  resumeEvaluation.feedback
                }
              </p>


              <button
                className="next-button"
                onClick={
                  handleResumeNext
                }
                disabled={
                  loading
                }
              >

                {loading
                  ? "Loading..."
                  : "Next Question"
                }

                <span>
                  →
                </span>

              </button>

            </div>

          )}

      </div>

    </div>

  );
}

export default ResumeSection;