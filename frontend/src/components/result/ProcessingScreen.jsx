import { useEffect, useState } from "react";
import Icon from "../common/Icon";

const STEPS = [
  "Collecting your section scores",
  "Evaluating your skills",
  "Running the readiness model",
  "Preparing your report",
];

function ProcessingScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, 1600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="processing card card--slide-up">
      <div className="processing-icon">
        <Icon name="sparkles" size={36} />
      </div>

      <div>
        <h2 className="processing-title">Compiling your results</h2>
        <p className="processing-sub">
          Every answer is being scored and combined into your final interview
          report.
        </p>
      </div>

      <div className="processing-steps">
        {STEPS.map((label, index) => {
          const statusClass =
            index < step ? "is-done" : index === step ? "is-active" : "";

          return (
            <div key={label} className={`processing-step ${statusClass}`}>
              <span className="step-check">
                {index < step ? <Icon name="check" size={12} strokeWidth={3} /> : null}
              </span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessingScreen;