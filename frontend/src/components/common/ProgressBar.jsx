function ProgressBar({ value = 0, labels = null, className = "" }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={className || undefined}>
      {labels && (
        <div className="progress-labels">
          <span>{labels.left}</span>
          {labels.right && <strong>{labels.right}</strong>}
        </div>
      )}
      <div className="progress-track" role="progressbar" aria-valuenow={clamped} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;