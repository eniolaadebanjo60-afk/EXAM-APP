import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/explain", async (req, res) => {
  const { question, options, correct, chosen } = req.body;

  if (!question || !options || !correct || !chosen) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY not set" });
  }

  const pickedText = options.find((o) => o.key === chosen)?.text ?? chosen;
  const correctText = options.find((o) => o.key === correct)?.text ?? correct;

  const prompt = `A student answered a multiple-choice question incorrectly.

Question: ${question}

Options:
${options.map((o) => `${o.key}. ${o.text}`).join("\n")}

Correct answer: ${correct}. ${correctText}
Student picked: ${chosen}. ${pickedText}

Explain in 2-3 sentences why "${pickedText}" is wrong and why "${correctText}" is right. Be direct, educational, and specific. Do not repeat the question.`;

  try {
    console.log("Calling Groq...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Groq API Error:", errorData);
      return res.status(response.status).json({ error: "Groq failed" });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.log("Unexpected Groq structure:", JSON.stringify(data, null, 2));
      return res.json({ explanation: "Groq returned an empty response." });
    }

    console.log("Groq replied successfully!");
    res.json({ explanation: text });

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});