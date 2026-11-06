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

  console.log(`Uploading ${questions.length} questions to Supabase...`);

  const { data, error } = await supabase
    .from("questions")
    .insert(questions)
    .select();

  if (error) {
    console.error("Upload failed:", error.message);
  } else {
    console.log(`Success! Uploaded ${data.length} questions.`);
  }
}

upload();