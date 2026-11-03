import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const apiKey = process.env.GROQ_API_KEY;

async function generateBatch(batchNumber) {
  console.log(`Generating batch ${batchNumber} (5 questions)...`);

  const prompt = `Generate exactly 5 multiple-choice questions for Nigerian university students. Mix the subjects (e.g., General Physics, Calculus, Use of English, Biology, Chemistry, Economics).
  
  Return ONLY a valid JSON array. Do not wrap it in markdown. Do not add any text before or after.
  Each object must have this exact structure:
  {
    "subject": "Physics",
    "topic": "Kinematics",
    "stem": "The question text here",
    "options": [
      {"key": "A", "text": "Option 1"},
      {"key": "B", "text": "Option 2"},
      {"key": "C", "text": "Option 3"},
      {"key": "D", "text": "Option 4"}
    ],
    "correct": "A",
    "explanation": "Why A is correct and why the others are wrong."
  }`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error(`Failed on batch ${batchNumber}:`, err.message);
    return [];
  }
}

async function run() {
  let allQuestions = [];
  
  for (let i = 1; i <= 4; i++) {
    const batch = await generateBatch(i);
    allQuestions = [...allQuestions, ...batch];
  }

  fs.writeFileSync("questions.json", JSON.stringify(allQuestions, null, 2));
  console.log(`Done! Generated ${allQuestions.length} questions in questions.json`);
}

run();