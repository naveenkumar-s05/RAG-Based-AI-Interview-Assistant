import ErrorMessage from "../common/ErrorMessage";

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
    const question =
      codingQuestions[
        codingIndex
      ];


    if (!question) {

      return (

        <div className="app">

          <div className="question-card">

            <h2>
              No coding question available.
            </h2>

            <ErrorMessage error={error} />

          </div>

        </div>

      );

    }


    const total =
      codingQuestions.length;


    const progress =
      total > 0
        ? (
            (codingIndex + 1)
            /
            total
          ) * 100
        : 0;


    return (

      <div className="app">

        <div className="coding-card">

          <div className="question-header">

            <div>

              <span className="question-label">
                CODING INTERVIEW
              </span>

              <h1>

                Question{" "}
                {codingIndex + 1}

                <span>
                  {" "} / {total}
                </span>

              </h1>

            </div>


            <div className="difficulty">

              {question.difficulty}

            </div>

          </div>


          <div className="progress-container">

            <div
              className="progress-bar"
              style={{
                width: `${progress}%`
              }}
            />

          </div>


          <div className="topic">
            Topic: {question.topic}
          </div>


          <div className="coding-problem">

            <h2>
              Problem
            </h2>

            <p>
              {question.question}
            </p>


            <div className="problem-details">

              <div>

                <strong>
                  Constraints
                </strong>

                <pre>
                  {question.constraints}
                </pre>

              </div>


              <div>

                <strong>
                  Sample Input
                </strong>

                <pre>
                  {question.sample_input}
                </pre>

              </div>


              <div>

                <strong>
                  Sample Output
                </strong>

                <pre>
                  {question.sample_output}
                </pre>

              </div>

            </div>

          </div>


          <div className="code-section">

            <label>
              Your Code
            </label>


            <textarea
              className="code-editor"
              value={code}
              onChange={event =>
                setCode(
                  event.target.value
                )
              }
              placeholder={
`# Write your solution here

def solution():
    pass`
              }
              disabled={
                codingSubmitted ||
                loading
              }
            />

          </div>


          <ErrorMessage error={error} />


          {!codingSubmitted && (

            <button
              className="submit-button"
              onClick={
                handleCodingSubmit
              }
              disabled={loading}
            >

              {loading
                ? "Evaluating..."
                : "Submit Code"
              }

              {!loading && (
                <span>→</span>
              )}

            </button>

          )}


          {codingSubmitted &&
            codingEvaluation && (

              <div className="evaluation-box">

                <div className="evaluation-header">

                  <span>
                    CODE EVALUATION
                  </span>

                  <strong>
                    {codingEvaluation.score}/10
                  </strong>

                </div>


                <div className="correct-status">

                  {codingEvaluation.status}

                </div>


                <p>
                  {codingEvaluation.feedback}
                </p>


                <button
                  className="next-button"
                  onClick={
                    handleCodingNext
                  }
                  disabled={loading}
                >

                  {codingIndex === total - 1
                    ? "Finish Interview"
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

export default CodingSection;
