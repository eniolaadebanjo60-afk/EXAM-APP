import fs from "fs";
import dotenv from "dotenv";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

const args = process.argv.slice(2);
const pdfPath = args[0];
const course = args[1] || "ican";
const company = args[2] || null;
const level = args[3] || null;

if (!pdfPath) {
  console.log("Usage: node extract.js <path-to-pdf> <course> <company> <level>");
  process.exit(1);
}

async function extractQuestions() {
  console.log(`Reading ${pdfPath} for course: ${course}, company: ${company || 'N/A'}, level: ${level || 'N/A'}...`);
  
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

  const chunkSize = 4000; 
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }

  let allExtractedQuestions = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
    
    const prompt = `You are an expert examiner. Extract the exam questions from the text below.
    
    Ignore table of contents, forewords, and examiner reports. Focus ONLY on the actual questions.
    
    The correct answer is the option that is highlighted, bolded, or marked in the text. If you cannot find a highlight, use your best judgment to solve the question.
    
    Return a valid JSON array. Do not use markdown. Only return the JSON array.
    
    If it is a theory question, use this format:
    {"course": "${course}",${company ? `"company": "${company}",` : ""}${level ? `"level": "${level}",` : ""}"subject": "General","topic": "General","type": "theory","stem": "The question text","options": [],"correct": "N/A","official_solution": "The suggested solution text.","explanation": "N/A"}
    
    If it is a multiple choice question, use this format:
    {"course": "${course}",${company ? `"company": "${company}",` : ""}${level ? `"level": "${level}",` : ""}"subject": "General","topic": "General","type": "mcq","stem": "The question text","options": [{"key": "A", "text": "..."}, {"key": "B", "text": "..."}, {"key": "C", "text": "..."}, {"key": "D", "text": "..."}],"correct": "A","explanation": "Why A is correct."}
    
    If there are no questions in this chunk, return [].
    
    TEXT:
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
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.log(`GROQ ERROR on chunk ${i + 1}:`, JSON.stringify(result));
        await new Promise((resolve) => setTimeout(resolve, 30000));
        continue;
      }

      let content = result.choices?.[0]?.message?.content || "{}";
      
      try {
        const parsed = JSON.parse(content);
        
        let questionsArray = [];
        if (Array.isArray(parsed)) {
          questionsArray = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          questionsArray = parsed.questions;
        } else {
           const keys = Object.keys(parsed);
           if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
             questionsArray = parsed[keys[0]];
           }
        }

        if (questionsArray.length > 0) {
          allExtractedQuestions = [...allExtractedQuestions, ...questionsArray];
          console.log(`Found ${questionsArray.length} questions.`);
        }
      } catch (parseError) {
        console.log(`PARSE ERROR on chunk ${i + 1}.`);
        console.log("Raw output:", content.substring(0, 200));
      }
      
    } catch (err) {
      console.error(`NETWORK ERROR on chunk ${i + 1}:`, err.message);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }

  fs.writeFileSync("extracted_questions.json", JSON.stringify(allExtractedQuestions, null, 2));
  console.log(`\nDone! Extracted ${allExtractedQuestions.length} questions to extracted_questions.json`);
}

extractQuestions();