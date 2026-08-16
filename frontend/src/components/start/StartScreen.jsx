import CandidateForm from "./CandidateForm";
import ErrorMessage from "../common/ErrorMessage";

function StartScreen({
  resumeFile,
  resumeInputRef,
  handleResumeFileChange,
  setResumeFile,
  clearError,
  setError,
  error,
  handleStart,
  loading,

  // Candidate information
  candidateName,
  candidateEmail,
  setCandidateName,
  setCandidateEmail,
}) {
  return (
    <div className="app">

      <div className="interview-card">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="header">

          <h1>
            AI Interview Assistant
          </h1>

          <p>
            Personalized technical interview
          </p>

        </div>


        {/* =================================================
            INTERVIEW ROLE
            ================================================= */}

        <div className="role-card">

          <span className="label">
            INTERVIEW ROLE
          </span>

          <h2>
            Machine Learning Engineer
          </h2>

          <p>
            An adaptive interview based on your
            technical knowledge, resume, and coding skills.
          </p>

        </div>


        {/* =================================================
            INTERVIEW STRUCTURE
            ================================================= */}

        <div className="section-title">
          Interview Structure
        </div>


        <div className="sections">

          {/* Conceptual */}

          <div className="section">

            <div className="number">
              01
            </div>

            <div>

              <h3>
                Conceptual
              </h3>

              <p>
                Technical concepts and fundamentals
              </p>

            </div>

            <span className="status">
              Ready
            </span>

          </div>


          {/* Resume */}

          <div className="section">

            <div className="number">
              02
            </div>

            <div>

              <h3>
                Resume
              </h3>

              <p>
                Questions based on your projects and skills
              </p>

            </div>

            <span className="status">
              Adaptive
            </span>

          </div>


          {/* Coding */}

          <div className="section">

            <div className="number">
              03
            </div>

            <div>

              <h3>
                Coding
              </h3>

              <p>
                Programming and problem-solving questions
              </p>

            </div>

            <span className="status">
              Ready
            </span>

          </div>

        </div>


        {/* =================================================
            INTERVIEW DETAILS
            ================================================= */}

        <div className="details">

          <div>

            <span>
              Resume Questions
            </span>

            <strong>
              7–10
            </strong>

          </div>


          <div>

            <span>
              Follow-ups
            </span>

            <strong>
              Adaptive
            </strong>

          </div>


          <div>

            <span>
              Difficulty
            </span>

            <strong>
              Medium
            </strong>

          </div>

        </div>


        {/* =================================================
            CANDIDATE INFORMATION
            ================================================= */}

        <CandidateForm
          name={candidateName}
          email={candidateEmail}
          setName={setCandidateName}
          setEmail={setCandidateEmail}
          disabled={loading}
        />


        {/* =================================================
            RESUME UPLOAD
            ================================================= */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "24px",
            borderTop: "1px solid #e7eaf3",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >

            <div>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  color: "#5b67d8",
                  marginBottom: "5px",
                }}
              >
                RESUME
              </span>

              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  color: "#172033",
                  fontWeight: 700,
                }}
              >
                Upload your resume
              </h3>

            </div>


            <span
              style={{
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#f0f2ff",
                color: "#5965d6",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Required
            </span>

          </div>


          <p
            style={{
              margin: "0 0 14px",
              color: "#7a8399",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Upload your resume to generate personalized questions
            based on your projects, skills, and experience.
          </p>


          {/* Hidden file input */}

          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleResumeFileChange}
            style={{
              display: "none",
            }}
          />


          {/* Upload area */}

          <div
            role="button"
            tabIndex={0}

            onClick={() =>
              resumeInputRef.current?.click()
            }

            onKeyDown={(event) => {

              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                resumeInputRef.current?.click();
              }

            }}

            onDragOver={(event) => {

              event.preventDefault();

              event.currentTarget.style.borderColor =
                "#5b67d8";

              event.currentTarget.style.background =
                "#f8f9ff";

            }}

            onDragLeave={(event) => {

              event.currentTarget.style.borderColor =
                "#dfe3f0";

              event.currentTarget.style.background =
                "#fbfcff";

            }}

            onDrop={(event) => {

              event.preventDefault();

              event.currentTarget.style.borderColor =
                "#dfe3f0";

              event.currentTarget.style.background =
                "#fbfcff";

              const file =
                event.dataTransfer.files?.[0];

              if (!file) {
                return;
              }

              const extension =
                file.name
                  .split(".")
                  .pop()
                  .toLowerCase();

              if (
                extension !== "pdf" &&
                extension !== "docx"
              ) {

                setError(
                  "Please upload a PDF or DOCX resume."
                );

                return;
              }

              clearError();

              setResumeFile(file);

            }}

            style={{
              border: "1.5px dashed #dfe3f0",
              borderRadius: "14px",
              background: "#fbfcff",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              textAlign: "center",
            }}
          >

            {!resumeFile ? (

              <>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    margin: "0 auto 11px",
                    borderRadius: "12px",
                    background: "#eef0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#5965d6",
                    fontSize: "22px",
                    fontWeight: 700,
                  }}
                >
                  ↑
                </div>


                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#27314a",
                  }}
                >
                  Click to upload or drag and drop
                </div>


                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "13px",
                    color: "#8a92a6",
                  }}
                >
                  PDF or DOCX • Maximum resume file
                </div>

              </>

            ) : (

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                }}
              >

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    flexShrink: 0,
                    borderRadius: "11px",
                    background: "#eef0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#5965d6",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  {resumeFile.name
                    .toLowerCase()
                    .endsWith(".pdf")
                    ? "PDF"
                    : "DOC"}
                </div>


                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >

                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#27314a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {resumeFile.name}
                  </div>


                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "#7f879a",
                    }}
                  >
                    Resume selected successfully
                  </div>

                </div>


                <button
                  type="button"

                  onClick={(event) => {

                    event.stopPropagation();

                    setResumeFile(null);

                    clearError();

                    if (resumeInputRef.current) {
                      resumeInputRef.current.value = "";
                    }

                  }}

                  style={{
                    border: "none",
                    background: "#f1f2f7",
                    color: "#737b8e",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: 1,
                  }}

                  aria-label="Remove resume"
                >
                  ×
                </button>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            ERROR
            ================================================= */}

        <ErrorMessage
          error={error}
        />


        {/* =================================================
            START INTERVIEW BUTTON
            ================================================= */}

        <button
          className="start-button"

          onClick={handleStart}

          disabled={
            loading ||
            !candidateName?.trim() ||
            !candidateEmail?.trim() ||
            !resumeFile
          }

          style={{
            marginTop: "20px",

            opacity:
              !candidateName?.trim() ||
              !candidateEmail?.trim() ||
              !resumeFile
                ? 0.55
                : 1,

            cursor:
              loading ||
              !candidateName?.trim() ||
              !candidateEmail?.trim() ||
              !resumeFile
                ? "not-allowed"
                : "pointer",
          }}
        >

          {loading
            ? "Preparing Interview..."
            : "Start Interview"}

          {!loading && (
            <span>
              →
            </span>
          )}

        </button>


        {/* =================================================
            NOTE
            ================================================= */}

        <p className="note">
          Your resume is analyzed before the interview begins.
        </p>


      </div>

    </div>
  );
}

export default StartScreen;