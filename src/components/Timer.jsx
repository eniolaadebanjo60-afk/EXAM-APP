import { useEffect } from "react";

export default function Timer({ seconds, onTick, onEnd }) {
  useEffect(() => {
    if (seconds <= 0) {
      onEnd();
      return;
    }
    const id = setTimeout(() => onTick(seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, onTick, onEnd]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const low = seconds <= 30;

  return (
    <span className={`timer${low ? " timer--low" : ""}`} role="timer">
      <svg className="timer__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9.5 2.5h5" />
      </svg>
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}