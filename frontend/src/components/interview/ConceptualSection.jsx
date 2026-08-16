import ErrorMessage from "../common/ErrorMessage";
import VoiceControls from "../voice/VoiceControls";

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
  const question =
    conceptualQuestions[
      conceptualIndex
    ];


  if (!question) {

    return (

      <div className="app">

        <div className="question-card">

          <h2>
            No conceptual question available.
          </h2>

          <ErrorMessage
            error={error}
          />

        </div>

      </div>

    );

  }


  const total =
    conceptualQuestions.length;


  const progress =
    total > 0
      ? (
          (conceptualIndex + 1)
          /
          total
        ) * 100
      : 0;


  // =====================================================
  // VOICE TRANSCRIPT
  // =====================================================

  const handleVoiceTranscript = (
    transcript
  ) => {

    setAnswer(transcript);

  };


  // =====================================================
  // NEXT QUESTION + SPEAK NEXT QUESTION
  // =====================================================

  const handleNextQuestion = () => {

    // Stop any current speech.
    window.speechSynthesis.cancel();

    const nextIndex =
      conceptualIndex + 1;

    const nextQuestion =
      conceptualQuestions[
        nextIndex
      ];


    // Speak the next question.
    //
    // This function is called directly from
    // the user's button click, so the browser
    // treats speech as a user-initiated action.

    if (nextQuestion) {

      const speech =
        new SpeechSynthesisUtterance(
          nextQuestion.question
        );

      speech.lang = "en-US";
      speech.rate = 0.95;
      speech.pitch = 1;

      window.speechSynthesis.speak(
        speech
      );

    }


    // Move to the next question.
    handleConceptualNext();

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
              CONCEPTUAL INTERVIEW
            </span>

            <h1>

              Question{" "}
              {conceptualIndex + 1}

              <span>
                {" "} / {total}
              </span>

            </h1>

          </div>


          <div className="difficulty">
            {question.difficulty}
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

          Topic: {question.topic}

        </div>


        {/* =================================================
            QUESTION
            ================================================= */}

        <div className="question-box">

          <h2>
            {question.question}
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
              conceptualSubmitted ||
              loading
            }
          />

        </div>


        {/* =================================================
            VOICE INTERVIEW
            ================================================= */}

        {!conceptualSubmitted && (

          <VoiceControls
            question={
              question.question
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

        {!conceptualSubmitted && (

          <button
            className="submit-button"
            onClick={
              handleConceptualSubmit
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

        {conceptualSubmitted &&
          conceptualEvaluation && (

            <div className="evaluation-box">

              <div className="evaluation-header">

                <span>
                  ANSWER EVALUATION
                </span>

                <strong>
                  {
                    conceptualEvaluation.score
                  }
                  /10
                </strong>

              </div>


              <div className="correct-status">

                {
                  conceptualEvaluation.status
                }

              </div>


              <p>
                {
                  conceptualEvaluation.feedback
                }
              </p>


              <button
                className="next-button"
                onClick={
                  handleNextQuestion
                }
              >

                {conceptualIndex ===
                total - 1
                  ? "Start Resume Interview"
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

export default ConceptualSection;