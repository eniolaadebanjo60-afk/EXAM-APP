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
    <span className={`timer${low ? " timer--low" : ""}`}>
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}