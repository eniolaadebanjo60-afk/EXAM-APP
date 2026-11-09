import fs from "fs";
import dotenv from "dotenv";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config();

const args = process.argv.slice(2);
const pdfPath = args[0];
const course = args[1] || "ican";
const company = args[2] || null;
const level = args[3] || null;
const exactSubject = args[4] || null;

if (!pdfPath || !exactSubject) {
  console.log("Usage: node extract.js <path-to-pdf> <course> <company> <level> <exactSubject>");
  console.log("Example: node extract.js ./cipm.pdf cipm null foundation \"Principles of Management\"");
  process.exit(1);
}

async function extractQuestions() {
  console.log(`Reading ${pdfPath} for subject: "${exactSubject}"...`);
  
  const dataBuffer = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data: dataBuffer, useSystemFonts: true });
  const pdfDoc = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    let pageText = "";
    let lastY = null;
    for (const item of content.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) pageText += "\n"; 
      else if (lastY !== null) pageText += " "; 
      pageText += item.str;
      lastY = item.transform[5];
    }
    fullText += pageText + "\n\n";
  }

  const chunkSize = 2500; 
  const chunks = [];
  for (let i = 0; i < fullText.length; i += chunkSize) {
    chunks.push(fullText.substring(i, i + chunkSize));
  }

  let allExtractedQuestions = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);
    
    const prompt = `You are an expert examiner. Extract the exam questions from the text below.
    
    Ignore table of contents, forewords, and examiner reports. Focus ONLY on the actual questions.
    
    The correct answer is the option that is highlighted, bolded, or marked in the text. If there are no highlights, use your best judgment to solve the question.
    
    CRITICAL RULE: For every question you extract, the "subject" field MUST BE EXACTLY: "${exactSubject}". Do not change it. Do not guess it.
    
    Return a valid JSON array. Extract a MAXIMUM of 5 questions per response. Do not use markdown. Write the entire JSON array as one single continuous line with no line breaks.
    
    Use this format:
    {"course": "${course}",${company ? `"company": "${company}",` : ""}${level ? `"level": "${level}",` : ""}"subject": "${exactSubject}","topic": "General","type": "mcq","stem": "The question text","options": [{"key": "A", "text": "..."}, {"key": "B", "text": "..."}, {"key": "C", "text": "..."}, {"key": "D", "text": "..."}],"correct": "A","explanation": "Why A is correct."}
    
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
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.log(`GROQ ERROR on chunk ${i + 1}:`, JSON.stringify(result));
        await new Promise((resolve) => setTimeout(resolve, 45000));
        continue;
      }

      let content = result.choices?.[0]?.message?.content || "[]";
      content = content.replace(/\n/g, "").replace(/\r/g, "").trim();
      content = content.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const firstBracket = content.indexOf("[");
      const lastBracket = content.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1) {
        content = content.substring(firstBracket, lastBracket + 1);
      }
      
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allExtractedQuestions = [...allExtractedQuestions, ...parsed];
          console.log(`Found ${parsed.length} questions.`);
        }
      } catch (parseError) {
        console.log(`PARSE ERROR on chunk ${i + 1}. AI returned:`, content.substring(0, 150));
      }
      
    } catch (err) {
      console.error(`NETWORK ERROR on chunk ${i + 1}:`, err.message);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 45000));
  }

  fs.writeFileSync(`extracted_${course}_${level}.json`, JSON.stringify(allExtractedQuestions, null, 2));
  console.log(`\nDone! Extracted ${allExtractedQuestions.length} questions to extracted_${course}_${level}.json`);
}

extractQuestions();