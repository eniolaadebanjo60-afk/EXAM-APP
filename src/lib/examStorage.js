const KEY = "exam-in-progress";

export function saveExamState(index, history, timeLeft) {
  localStorage.setItem(KEY, JSON.stringify({ index, history, timeLeft }));
}

export function loadExamState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearExamState() {
  localStorage.removeItem(KEY);
}