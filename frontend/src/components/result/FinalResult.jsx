import SkillAssessment from "./SkillAssessment";

function FinalResult({ finalResult }) {
  return (

      <div className="app">

        <div className="question-card">

          <div className="header">

            <span className="question-label">
              INTERVIEW COMPLETED
            </span>

            <h1>
              Interview Result
            </h1>

            <p>
              Your personalized technical interview
              has been completed.
            </p>

          </div>


          <div
            className="role-card"
            style={{
              textAlign: "center"
            }}
          >

            <span className="label">
              OVERALL SCORE
            </span>


            <h2
              style={{
                fontSize: "48px",
                marginTop: "10px"
              }}
            >

              {finalResult.overall}/10

            </h2>

          </div>


          <div className="details">

            <div>

              <span>
                Conceptual
              </span>

              <strong>

                {finalResult.conceptual !== null
                  ? `${finalResult.conceptual}/10`
                  : "N/A"
                }

              </strong>

            </div>


            <div>

              <span>
                Resume
              </span>

              <strong>

                {finalResult.resume !== null
                  ? `${finalResult.resume}/10`
                  : "N/A"
                }

              </strong>

            </div>


            <div>

              <span>
                Coding
              </span>

              <strong>

                {finalResult.coding !== null
                  ? `${finalResult.coding}/10`
                  : "N/A"
                }

              </strong>

            </div>

          </div>


          <SkillAssessment finalResult={finalResult} />

          <div className="evaluation-box">

            <div className="evaluation-header">

              <span>
                INTERVIEW SUMMARY
              </span>

            </div>


            <p>

              Conceptual questions answered:
              {" "}
              {finalResult.conceptualCount}

              <br />

              Resume questions answered:
              {" "}
              {finalResult.resumeCount}

              <br />

              Coding questions answered:
              {" "}
              {finalResult.codingCount}

            </p>

          </div>


          <button
            className="start-button"
            onClick={() =>
              window.location.reload()
            }
          >

            Start New Interview

            <span>
              →
            </span>

          </button>

        </div>

      </div>

    );
}

export default FinalResult;
