import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  let aiInstance: GoogleGenAI | null = null;
  const getAI = (): GoogleGenAI => {
    if (!aiInstance) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error("GEMINI_API_KEY is not defined");
      aiInstance = new GoogleGenAI({ apiKey: key });
    }
    return aiInstance;
  };

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-question", async (req, res) => {
    try {
      const { domain, previousQuestions, userPerformance, resumeOrJD, difficulty, persona } = req.body;
      const personaPrompts: Record<string, string> = {
        'Friendly': 'You are a warm, encouraging, and supportive interviewer. You want the candidate to succeed. Use a conversational and kind tone.',
        'Stern': 'You are a no-nonsense, strict, and highly formal interviewer. You are difficult to impress and maintain a professional, cold distance. Your questions are direct and sharp.',
        'Technical Expert': 'You are a deep-dive technical specialist. You care only about technical precision, edge cases, and architectural depth. You skip small talk and go straight for the hardest technical details.'
      };

      const prompt = `
      ${personaPrompts[persona]}
      You are an expert interviewer for ${domain}. 
      The selected difficulty level is ${difficulty}. 
      - If difficulty is 'Easy': Focus on basic concepts, definitions, and simple problem-solving.
      - If difficulty is 'Medium': Focus on practical application, intermediate concepts, and standard interview problems.
      - If difficulty is 'Hard': Focus on advanced architecture, complex algorithms, edge cases, and deep technical reasoning.
      
      ${domain === 'Core Fundamentals (Fresher)' ? `This is an interview for a FRESHER. 
      - Focus on core computer science fundamentals: OOPs (Inheritance, Polymorphism, etc.), DBMS (SQL, Normalization), OS (Processes, Threads, Deadlocks), and Networking (OSI Model, TCP/UDP).
      - Keep questions foundational but probing.` : ''}

      ${['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Zoho'].includes(domain) ? `This is a real-world interview simulation for ${domain}. 
      - For MNCs like Google/Amazon/Microsoft/Meta/Apple: Focus on high-level Data Structures, Algorithms, System Design, and their specific leadership principles.
      - For Service-based companies like TCS/Infosys/Wipro/Accenture: Focus on core technical fundamentals, aptitude, and situational behavioral questions.
      - For Product companies like Zoho: Focus on deep problem-solving, logical thinking, and hands-on coding ability.` : ''}
      
      ${resumeOrJD ? `The candidate has provided the following Resume/Job Description for context: "${resumeOrJD}". 
      ${domain === 'Personalized' ? 'This is a strictly PERSONALIZED interview. Every question MUST be directly derived from the provided Resume or Job Description.' : `Tailor your questions to this context while staying within the ${domain} domain.`}` : ''}
      
      Based on the previous questions and responses: ${JSON.stringify(previousQuestions)}
      The score of the IMMEDIATELY PRECEDING question (0-100): ${userPerformance}
      
      Generate a NEW, UNIQUE, and COMMONLY ASKED interview question that has NOT been asked before in this session. 
      
      - IF THIS IS THE FIRST QUESTION (previousQuestions is empty):
        - ALWAYS start with a common ice-breaker like "Tell me about yourself", "Walk me through your background".
      
      - If the domain is a technical field (Frontend, Backend, Mobile, DevOps, AI/ML, etc.):
        - Focus on standard, high-frequency interview questions.
        - Prioritize code-based problem-solving questions.
      
      - If the domain is a Quiz-style round (Aptitude & Reasoning, or any domain ending with '(Quiz)'):
        - Provide a multiple-choice question (Quiz style).
        - If it's a coding quiz (C, Java, Python, C++ Programming (Quiz)):
          - Focus on "Error Detection" or "Output Guessing".
          - ALWAYS set isCodeSnippet to true and include the code block in the question text.
        - Include 4 distinct options (A, B, C, D).
        - Ensure the code is formatted correctly.

      - Granular Difficulty Scaling (Relative to the base difficulty '${difficulty}'):
        - If the last score was 81-100: Increase complexity significantly. Ask a "Hard" level question.
        - If the last score was 61-80: Increase complexity slightly.
        - If the last score was 41-60: Maintain the current complexity level.
        - If the last score was 21-40: Decrease complexity slightly.
        - If the last score was 0-20: Decrease complexity significantly. Ask a "Very Easy" question.
      
      Return a JSON object with:
      - text: (The question text)
      - isCodeSnippet: (boolean)
      - options: (Array of 4 strings, ONLY if domain is 'Aptitude & Reasoning' or Quiz)
      - hint: (A short, helpful hint for the candidate. Max 15 words. Mandatory.)
      `;

      const result = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              isCodeSnippet: { type: Type.BOOLEAN },
              hint: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
            },
            required: ["text", "isCodeSnippet"],
          },
        },
      });

      res.json(JSON.parse(result.text || '{"text": "Could you tell me more about your experience?", "isCodeSnippet": false, "hint": "Think about your background."}'));
    } catch (e) {
      console.error(e);
      res.json({ text: "Could you tell me more about your experience?", isCodeSnippet: false, hint: "Think about your background." });
    }
  });

  app.post("/api/evaluate-response", async (req, res) => {
    try {
      const { question, responseStr, domain, persona, speakingMetrics } = req.body;
      const personaPrompts: Record<string, string> = {
        'Friendly': 'Provide feedback in an encouraging and constructive way. Even if they are wrong, be kind and offer helpful tips.',
        'Stern': 'Provide feedback in a direct, blunt, and strictly professional manner. Do not sugarcoat anything. If they are wrong, state it clearly and move on.',
        'Technical Expert': 'Provide feedback with extreme technical detail. Focus on the nuances of their answer and point out even minor technical inaccuracies or missed optimizations.'
      };

      const metricsPrompt = speakingMetrics ? `
      We have recorded the physical speech metrics for this response:
      - Speaking Pace: ${speakingMetrics.wpm} Words Per Minute (WPM)
      - Total Speaking Duration: ${speakingMetrics.durationSeconds} seconds
      - Total Filler Words Count: ${speakingMetrics.fillerCount}
      
      In corporate speech standards:
      - Ideal pace: 110-150 WPM. Less than 90 WPM is slow; greater than 150 WPM indicates rushing.
      - Filler words count greater than 3 in a short response denotes hesitation.
      
      Please incorporate these actual verified spoken metrics into the 'pronunciationFeedback' section, advising specifically on how to adjust their pacing or reduce filler words based on these exact measurements.
      ` : '';

      const prompt = `
      ${personaPrompts[persona]}
      Question: ${question}
      User Response: ${responseStr}
      Domain: ${domain}
      
      Evaluate the response based on correctness, relevance, and communication.
      
      - Communication Evaluation:
        ${metricsPrompt}
        - Analyze the transcript for clarity, filler words, and "perceived" pronunciation issues.
        - Provide specific feedback on how to improve articulation and clarity.
      
      - If the domain is a Quiz-style round:
        - The user response is one of the provided options.
        - Compare the user's selected option with the correct answer.
        - If correct, score 100. If wrong, score 0 and provide the correct option with a brief explanation.
      
      - For other domains:
        - Evaluate based on depth, accuracy, and professional communication.
        - If the user's answer is wrong or incomplete, provide the correct/ideal answer.
      
      - Conceptual Breakdown (Mandatory):
        - Provide a detailed "Concept Explanation" that explains the underlying principle of the question. 
        - Explain "Why" the answer is what it is.

      - Side-by-Side Comparison (Mandatory):
        - Provide "Key Differences" between the user's response and the ideal answer.
        - Highlight what was missing, what was incorrect, or what was particularly well-said.
        - Use bullet points.
      
      Return a JSON object with:
      - score: (0-100)
      - feedback: (Short constructive feedback on content)
      - correctAnswer: (The ideal answer, especially if the user was wrong. If the user was perfect, this can be empty)
      - pronunciationFeedback: (Feedback on clarity, articulation, and filler words.)
      - conceptExplanation: (Detailed explanation of the concept behind the question. Max 100 words.)
      - keyDifferences: (A summary of the differences between the user response and the ideal answer.)
      `;

      const result = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              pronunciationFeedback: { type: Type.STRING },
              conceptExplanation: { type: Type.STRING },
              keyDifferences: { type: Type.STRING },
            },
            required: ["score", "feedback", "pronunciationFeedback", "conceptExplanation", "keyDifferences"],
          },
        },
      });

      res.json(JSON.parse(result.text || '{"score": 50, "feedback": "Good effort.", "pronunciationFeedback": "Try to speak more clearly."}'));
    } catch (e) {
      console.error(e);
      res.json({ score: 50, feedback: "Good effort.", pronunciationFeedback: "Try to speak more clearly." });
    }
  });

  app.post("/api/generate-feedback", async (req, res) => {
    try {
      const { domain, questions } = req.body;
      const prompt = `
      Domain: ${domain}
      Interview History: ${JSON.stringify(questions)}
      
      Provide a comprehensive final evaluation.
      Return a JSON object with:
      - overallScore: (0-100)
      - communicationScore: (0-100)
      - technicalScore: (0-100)
      - confidenceScore: (0-100)
      - summary: (A brief summary of performance)
      - suggestions: (Array of 3-5 specific improvement tips)
      `;

      const result = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              communicationScore: { type: Type.NUMBER },
              technicalScore: { type: Type.NUMBER },
              confidenceScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ["overallScore", "communicationScore", "technicalScore", "confidenceScore", "summary", "suggestions"],
          },
        },
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (e) {
      console.error(e);
      res.json({ overallScore: 0, communicationScore: 0, technicalScore: 0, confidenceScore: 0, summary: "Evaluation failed.", suggestions: [] });
    }
  });

  app.post("/api/generate-roadmap", async (req, res) => {
    try {
      const { interviews } = req.body;
      const prompt = `
      Based on the user's interview history: ${JSON.stringify(interviews)}
      
      Generate a personalized learning roadmap to help them reach their career goals.
      Focus on their weakest areas while reinforcing their strengths.
      
      Return a JSON object with:
      - title: (A catchy title for the roadmap)
      - steps: (Array of 5-7 steps)
        - title: (Step title)
        - description: (Brief explanation of why this step is important)
        - resources: (Array of 2-3 recommended topics or resources to study)
      `;

      const result = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    resources: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["title", "description", "resources"]
                }
              },
            },
            required: ["title", "steps"],
          },
        },
      });

      res.json(JSON.parse(result.text || "{}"));
    } catch (e) {
      console.error(e);
      res.json({ title: "Your Career Roadmap", steps: [] });
    }
  });

  app.get("/api/export-zip", async (req, res) => {
    try {
      const archiver = (await import("archiver")).default;
      res.attachment("project.zip");
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        if (!res.headersSent) res.status(500).send({ error: err.message });
      });

      archive.pipe(res);

      archive.glob("**/*", {
        cwd: process.cwd(),
        ignore: ["node_modules/**", "dist/**", ".git/**"],
        dot: true
      });

      await archive.finalize();
    } catch (err) {
      if (!res.headersSent) res.status(500).send({ error: "Failed to export zip" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
