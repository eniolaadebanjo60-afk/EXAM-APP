export const MOCK_QUESTIONS = [
  {
    id: "q1",
    subject: "Physics",
    topic: "Newton's Laws",
    stem: "A body moves with constant velocity. What is the net force acting on it?",
    options: [
      { key: "A", text: "Zero" },
      { key: "B", text: "Equal to its weight" },
      { key: "C", text: "Equal to its mass times velocity" },
      { key: "D", text: "Increasing steadily" },
    ],
    correct: "A",
    explanation:
      "Constant velocity means zero acceleration. By Newton's second law (F = ma), zero acceleration means zero net force. The weight acts, but the normal force cancels it — the net is zero.",
  },
  {
    id: "q2",
    subject: "Physics",
    topic: "Newton's Laws",
    stem: "A 2 kg object accelerates at 3 m/s². What net force acts on it?",
    options: [
      { key: "A", text: "1.5 N" },
      { key: "B", text: "5 N" },
      { key: "C", text: "6 N" },
      { key: "D", text: "9 N" },
    ],
    correct: "C",
    explanation:
      "Newton's second law: F = m × a. Here m = 2 kg and a = 3 m/s², so F = 2 × 3 = 6 N.",
  },
  {
    id: "q3",
    subject: "Chemistry",
    topic: "Atomic Structure",
    stem: "Which subatomic particle determines an element's identity?",
    options: [
      { key: "A", text: "Electron" },
      { key: "B", text: "Neutron" },
      { key: "C", text: "Proton" },
      { key: "D", text: "Photon" },
    ],
    correct: "C",
    explanation:
      "The number of protons (the atomic number) defines the element. Change the protons and you have a different element.",
  },
];