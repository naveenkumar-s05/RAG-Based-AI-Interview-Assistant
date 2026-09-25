import { useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import ErrorMessage from "../common/ErrorMessage";
import Stepper from "../common/Stepper";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegistrationScreen({
  name,
  email,
  setName,
  setEmail,
  onBack,
  onNext,
}) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};

    if (!name.trim()) {
      next.name = "Please enter your full name.";
    }

    if (!email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      onNext(name.trim(), email.trim());
    }
  };

  return (
    <div className="card card--padded card--slide-up">
      <Stepper steps={["Register", "Resume", "Intro", "Interview"]} current={0} />

      <div className="screen-header" style={{ marginBottom: "var(--space-6)" }}>
        <span className="screen-label">Step 1 of 4</span>
        <h2 className="screen-title">Candidate Registration</h2>
        <p className="screen-subtitle">
          Enter your details so we can attach your interview results to your
          profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="candidate-name">
            Full Name
          </label>
          <input
            id="candidate-name"
            className={`form-input${errors.name ? " input-error" : ""}`}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder="e.g. Sarah Ahmed"
            autoComplete="name"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="candidate-email">
            Email Address
          </label>
          <input
            id="candidate-email"
            className={`form-input${errors.email ? " input-error" : ""}`}
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            placeholder="e.g. sarah@example.com"
            autoComplete="email"
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
          <p className="field-hint">We only use your email to attach your result — no spam.</p>
        </div>

        <ErrorMessage error={errors.form} />

        <div className="form-footer" style={{ marginTop: "var(--space-6)" }}>
          <Button variant="ghost" onClick={onBack}>
            <Icon name="chevronRight" size={16} style={{ transform: "rotate(180deg)" }} />
            Back
          </Button>
          <Button type="submit" variant="primary">
            Continue
            <Icon name="arrowRight" size={17} />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationScreen;