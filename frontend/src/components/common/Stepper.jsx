import Icon from "./Icon";

function Stepper({ steps, current }) {
  return (
    <div className="stepper" aria-label="Interview progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const stateClass = done ? "step--done" : active ? "step--active" : "";

        return (
          <div key={step} className={`step ${stateClass}`}>
            <span className="step-dot">
              {done ? <Icon name="check" size={14} strokeWidth={3} /> : index + 1}
            </span>
            <span className="step-label">{step}</span>
            {index < steps.length - 1 && <span className="step-line" />}
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;