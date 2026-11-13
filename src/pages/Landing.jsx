import { useNavigate } from "react-router-dom";
import "../styles/Landing.css";

const EXAM_CHIPS = [
  { name: "ICAN", color: "#0d9488" },
  { name: "CIPM", color: "#d97706" },
  { name: "Graduate Trainee", color: "#4f46e5" },
];

const FEATURES = [
  {
    id: "grading",
    title: "AI Grading",
    text: "Type your essay answer and get instant feedback based on official ICAN marking guides.",
    icon: (
      <>
        <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
      </>
    ),
  },
  {
    id: "replay",
    title: "Smart Replay",
    text: "See exactly which questions you second-guessed yourself on, and learn to trust your gut.",
    icon: (
      <>
        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
  },
  {
    id: "topics",
    title: "Topic Filtering",
    text: "Jump straight into Financial Accounting, Business Law, or Quantitative Aptitude.",
    icon: <path d="M4 6h16M7 12h10M10 18h4" />,
  },
];

const SAMPLE_OPTIONS = [
  { key: "A", text: "Plant and machinery", state: "wrong" },
  { key: "B", text: "Trade receivables", state: "correct" },
  { key: "C", text: "Goodwill", state: "" },
  { key: "D", text: "Share capital", state: "" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing__nav">
        <div className="landing__brand">
          <span className="landing__mark">S</span>
          <h2>Satoru Exam Prep</h2>
        </div>
        <button className="landing__signin" onClick={() => navigate("/auth")}>
          Sign In
        </button>
      </nav>

      <main className="landing__hero">
        <div className="landing__copy">
          <h1>
            Master Your Professional Exams <span className="landing__glow">with AI.</span>
          </h1>
          <p>
            Practice real past questions for ICAN, CIPM, and Graduate Trainee tests.
            Our AI grades your theory answers instantly and explains exactly why you got it wrong.
          </p>

          <div className="landing__actions">
            <button className="landing__btn-primary" onClick={() => navigate("/home")}>
              Try the Demo (No Login Required)
            </button>
            <button className="landing__btn-secondary" onClick={() => navigate("/auth")}>
              Create Free Account
            </button>
          </div>

          <ul className="landing__chips">
            {EXAM_CHIPS.map((chip) => (
              <li key={chip.name}>
                <span style={{ background: chip.color }} />
                {chip.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="landing__preview" aria-hidden="true">
          <div className="landing__preview-bar">
            <span>Financial Accounting</span>
            <span>3 / 20</span>
          </div>
          <div className="landing__preview-progress">
            <span />
          </div>
          <p className="landing__preview-stem">Which of these is a current asset?</p>
          <ul className="landing__preview-options">
            {SAMPLE_OPTIONS.map((opt) => (
              <li key={opt.key} className={opt.state ? `is-${opt.state}` : ""}>
                <b>{opt.key}</b>
                {opt.text}
              </li>
            ))}
          </ul>
          <div className="landing__preview-note">
            <strong>Not quite.</strong> Trade receivables are expected to be collected within one
            year, so they are a current asset.
          </div>
        </div>
      </main>

      <section className="landing__features">
        {FEATURES.map((feature) => (
          <div className="landing__feature-card" key={feature.id}>
            <span className="landing__feature-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {feature.icon}
              </svg>
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}