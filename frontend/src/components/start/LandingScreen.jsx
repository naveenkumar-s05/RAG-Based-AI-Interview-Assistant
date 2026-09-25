import Button from "../common/Button";
import Icon from "../common/Icon";

const FEATURES = [
  {
    icon: "message",
    title: "Adaptive Questions",
    text: "Questions are generated in real time from your resume using a RAG pipeline against your own projects and skills.",
  },
  {
    icon: "mic",
    title: "Voice Answers",
    text: "Speak your answers instead of typing. Automatic speech-to-text transcripts your response for evaluation.",
  },
  {
    icon: "chart",
    title: "ML-Powered Scoring",
    text: "Every answer is scored by an AI interviewer, then distilled into a job-readiness prediction by an XGBoost model.",
  },
];

const STEPS = [
  { title: "Register", text: "Tell us who you are in under a minute." },
  { title: "Upload resume", text: "PDF or DOCX — we analyze it instantly." },
  { title: "Interview", text: "Conceptual, resume, and coding rounds." },
  { title: "Get results", text: "Scores, skills, and readiness verdict." },
];

function LandingScreen({ onStart }) {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <span className="hero-badge">
            <Icon name="sparkles" size={14} />
            Adaptive AI Technical Interviews
          </span>

          <h1>
            Ace your next interview with an <em>AI interviewer</em> trained on your resume
          </h1>

          <p>
            Ten conceptual questions, personalized resume-based questions, and live coding —
            evaluated by AI with instant feedback and a data-driven readiness score.
          </p>

          <div className="hero-cta">
            <Button variant="primary" size="lg" onClick={onStart}>
              Start Your Interview
              <Icon name="arrowRight" size={18} />
            </Button>
          </div>

          <p className="hero-note">
            Role: Machine Learning Engineer &middot; ~45 minutes &middot; No account required
          </p>
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <div className="feature-icon">
              <Icon name={feature.icon} size={22} />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="landing-how">
        <div className="screen-header">
          <span className="screen-label">How it works</span>
          <h2 className="screen-title" style={{ fontSize: "var(--font-size-3xl)" }}>
            From start to score
          </h2>
        </div>

        <div className="how-steps">
          {STEPS.map((step, index) => (
            <div className="how-step" key={step.title}>
              <div className="how-step-num">{index + 1}</div>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingScreen;