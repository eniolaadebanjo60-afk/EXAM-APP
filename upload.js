import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function upload() {
  const rawData = fs.readFileSync("extracted_questions.json", "utf-8");
  const questions = JSON.parse(rawData);

  const sanitizedQuestions = questions.map((q) => ({
    course: q.course || "",
    company: q.company || "",
    level: q.level || "",
    subject: q.subject || "General",
    topic: q.topic || "General",
    type: q.type || "mcq",
    stem: q.stem || "",
    options: q.options || [],
    correct: q.correct || "",
    explanation: q.explanation || "",
    official_solution: q.official_solution || ""
  }));

  console.log(`Uploading ${sanitizedQuestions.length} questions to Supabase...`);

  const { data, error } = await supabase
    .from("questions")
    .insert(sanitizedQuestions)
    .select();

  if (error) {
    console.error("Upload failed:", error.message);
  } else {
    console.log(`Success! Uploaded ${data.length} questions.`);
  }
}

upload();