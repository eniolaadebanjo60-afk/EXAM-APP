import fs from "fs";
import dotenv from "dotenv";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

async function extractQuestions(pdfPath) {
  console.log("Reading PDF...");
  
  const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ 
    data: dataBuffer,
    useSystemFonts: true 
  });
  const pdfDoc = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    
    let pageText = "";
    let lastY = null;
    
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += "\n"; 
      } else if (lastY !== null) {
        pageText += " "; 
      }
      pageText += item.str;
      lastY = item.transform[5];
    }
    
    fullText += pageText + "\n\n";
  }
  
  console.log(`Total text length: ${fullText.length} characters.`);

  fs.writeFileSync("debug_text.txt", fullText);
  console.log("Saved cleaned text to debug_text.txt");

  const chunkSize = 5000; 
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }

  let allExtractedQuestions = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
    
    const prompt = `You are an expert ICAN examiner. I am providing you with a chunk of text from an ICAN Pathfinder PDF.
    
    Extract any exam questions you find in this text. Format them as a JSON array.
    Do not wrap the JSON in markdown.
    
    If you find a Multiple Choice Question (A, B, C, D), use this format:
    {
      "course": "ican",
      "subject": "Financial Reporting",
      "topic": "IFRS",
      "type": "mcq",
      "stem": "The question text",
      "options": [{"key": "A", "text": "..."}, {"key": "B", "text": "..."}, {"key": "C", "text": "..."}, {"key": "D", "text": "..."}],
      "correct": "A",
      "explanation": "Why A is correct."
    }
    
    If you find a Theory/Essay Question, use this format:
    {
      "course": "ican",
      "subject": "Financial Reporting",
      "topic": "IFRS",
      "type": "theory",
      "stem": "The question text",
      "options": [],
      "correct": "N/A",
      "official_solution": "The official solution/marking guide provided in the text.",
      "explanation": "N/A"
    }
    
    Only return valid JSON. If there are no questions in this chunk, return [].
    
    TEXT CHUNK:
    ${chunks[i]}`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
        }),
      });

      const result = await response.json();
      let content = result.choices?.[0]?.message?.content || "[]";
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          allExtractedQuestions = [...allExtractedQuestions, ...parsed];
          console.log(`Found ${parsed.length} questions in this chunk.`);
        }
      } catch (parseError) {
        console.log(`Could not parse JSON for chunk ${i + 1}. Skipping.`);
      }
      
    } catch (err) {
      console.error(`Error on chunk ${i + 1}:`, err.message);
    }
  }

  fs.writeFileSync("extracted_questions.json", JSON.stringify(allExtractedQuestions, null, 2));
  console.log(`Done! Extracted ${allExtractedQuestions.length} questions to extracted_questions.json`);
}

extractQuestions("./PATHFINDER_MAY_2026_SKILLS.pdf");