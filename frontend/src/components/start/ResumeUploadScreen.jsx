import { useRef, useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import Badge from "../common/Badge";
import ErrorMessage from "../common/ErrorMessage";
import Stepper from "../common/Stepper";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function ResumeUploadScreen({
  resumeFile,
  resumeInputRef,
  handleResumeFileChange,
  onRemoveFile,
  onBack,
  onNext,
  loading,
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const internalRef = useRef(null);
  const inputRef = resumeInputRef || internalRef;

  const openPicker = () => inputRef.current?.click();

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleResumeFileChange({ target: { files: [file] } });
    }
  };

  return (
    <div className="card card--padded card--slide-up">
      <Stepper steps={["Register", "Resume", "Intro", "Interview"]} current={1} />

      <div className="screen-header" style={{ marginBottom: "var(--space-6)" }}>
        <span className="screen-label">Step 2 of 4</span>
        <h2 className="screen-title">Upload Your Resume</h2>
        <p className="screen-subtitle">
          We read your projects, skills, and experience to build a personalized
          interview just for you.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleResumeFileChange}
        style={{ display: "none" }}
        tabIndex={-1}
      />

      {!resumeFile ? (
        <div
          className={`upload-zone${isDragging ? " upload-zone--dragover" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Upload resume file"
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <Icon name="upload" size={26} />
          </div>
          <div className="upload-title">
            Click to upload or drag &amp; drop
          </div>
          <p className="upload-hint">
            Your resume is analyzed locally by the interview engine before the interview begins.
          </p>
          <div className="upload-formats">
            <Badge tone="ghost">
              <Icon name="file" size={13} /> PDF
            </Badge>
            <Badge tone="ghost">
              <Icon name="file" size={13} /> DOCX
            </Badge>
          </div>
        </div>
      ) : (
        <div className="upload-file">
          <div className="upload-file-icon">
            {resumeFile.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}
          </div>
          <div className="upload-file-meta">
            <div className="upload-file-name">{resumeFile.name}</div>
            <div className="upload-file-size">
              {formatBytes(resumeFile.size)} &middot; Selected — ready to analyze
            </div>
          </div>
          <button
            type="button"
            className="upload-file-remove"
            onClick={onRemoveFile}
            aria-label="Remove resume"
          >
            <Icon name="trash" size={17} />
          </button>
        </div>
      )}

      <p className="field-hint" style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
        Only PDF and DOCX files are supported.
      </p>

      {error && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <ErrorMessage error={error} />
        </div>
      )}

      <div className="form-footer" style={{ marginTop: "var(--space-6)" }}>
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          <Icon name="chevronRight" size={16} style={{ transform: "rotate(180deg)" }} />
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!resumeFile || loading}
          loading={loading && Boolean(resumeFile)}
        >
          Continue
          <Icon name="arrowRight" size={17} />
        </Button>
      </div>
    </div>
  );
}

export default ResumeUploadScreen;