import { GoogleGenAI, Type } from "@google/genai";
import { Domain, InterviewQuestion, InterviewFeedback, InterviewerPersona } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please check that you have created a `.env` file with your GEMINI_API_KEY.");
    }
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

export const generateNextQuestion = async (
  domain: Domain,
  previousQuestions: InterviewQuestion[],
  userPerformance: number,
  resumeOrJD?: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  persona: InterviewerPersona = 'Friendly'
): Promise<{ text: string; isCodeSnippet: boolean; options?: string[]; hint?: string }> => {
    const personaPrompts = {
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
    - For MNCs like Google/Amazon/Microsoft/Meta/Apple: Focus on high-level Data Structures, Algorithms, System Design, and their specific leadership principles (e.g., Amazon's Leadership Principles).
    - For Service-based companies like TCS/Infosys/Wipro/Accenture: Focus on core technical fundamentals, aptitude, and situational behavioral questions.
    - For Product companies like Zoho: Focus on deep problem-solving, logical thinking, and hands-on coding ability.` : ''}
    
    ${resumeOrJD ? `The candidate has provided the following Resume/Job Description for context: "${resumeOrJD}". 
    ${domain === 'Personalized' ? 'This is a strictly PERSONALIZED interview. Every question MUST be directly derived from the provided Resume or Job Description. Focus on specific skills, projects, or requirements mentioned in the text.' : `Tailor your questions to this context while staying within the ${domain} domain.`}` : ''}
    
    Based on the previous questions and responses: ${JSON.stringify(previousQuestions)}
    The score of the IMMEDIATELY PRECEDING question (0-100): ${userPerformance}
    
    Generate a NEW, UNIQUE, and COMMONLY ASKED interview question that has NOT been asked before in this session. 
    
    - IF THIS IS THE FIRST QUESTION (previousQuestions is empty):
      - ALWAYS start with a common ice-breaker like "Tell me about yourself", "Walk me through your background", or "What brings you to this interview today?".
    
    - If the domain is a technical field (Frontend, Backend, Mobile, DevOps, AI/ML, etc.):
      - Focus on standard, high-frequency interview questions.
      - Prioritize code-based problem-solving questions.
      - Examples: "Write a function to...", "Debug this code snippet...", "Predict the output of...".
    
    - If the domain is a Quiz-style round (Aptitude & Reasoning, or any domain ending with '(Quiz)'):
      - Provide a multiple-choice question (Quiz style).
      - If it's a coding quiz (C, Java, Python, C++ Programming (Quiz)):
        - Focus on "Error Detection" (find the bug in the snippet) or "Output Guessing" (predict what the code prints).
        - ALWAYS set isCodeSnippet to true and include the code block in the question text.
      - If it's 'Aptitude & Reasoning':
        - Include "Diagrammatic Reasoning" questions by describing a visual pattern or sequence in detail (e.g., "A sequence of shapes: Square, Triangle, Circle... what comes next?").
      - Include 4 distinct options (A, B, C, D).
      - Ensure the code is formatted correctly with proper indentation.

    - Granular Difficulty Scaling (Relative to the base difficulty '${difficulty}'):
      - If the last score was 81-100: Increase complexity significantly. Ask a "Hard" level question regardless of the base difficulty.
      - If the last score was 61-80: Increase complexity slightly. If base is 'Easy', move to 'Medium'. If 'Medium', move to 'Hard'.
      - If the last score was 41-60: Maintain the current complexity level.
      - If the last score was 21-40: Decrease complexity slightly. If base is 'Hard', move to 'Medium'. If 'Medium', move to 'Easy'.
      - If the last score was 0-20: Decrease complexity significantly. Ask a "Very Easy" foundational question.
    
    Return a JSON object with:
    - text: (The question text)
    - isCodeSnippet: (boolean, true if the question contains a code block)
    - options: (Array of 4 strings, ONLY if domain is 'Aptitude & Reasoning')
    - hint: (A short, helpful hint for the candidate if they get stuck. Max 15 words. Mandatory for all questions.)
  `;

  const result = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          isCodeSnippet: { type: Type.BOOLEAN },
          hint: { type: Type.STRING, description: "A short hint for the candidate" },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 multiple choice options, only for Quiz-style rounds (Aptitude, C/Java/Python/C++ Quizzes)"
          },
        },
        required: ["text", "isCodeSnippet"],
      },
    },
  });

  try {
    return JSON.parse(result.text || '{"text": "Could you tell me more about your experience?", "isCodeSnippet": false, "hint": "Think about your background."}');
  } catch (e) {
    return { text: "Could you tell me more about your experience?", isCodeSnippet: false, hint: "Think about your background." };
  }
};

export const evaluateResponse = async (
  question: string,
  response: string,
  domain: Domain,
  persona: InterviewerPersona = 'Friendly',
  speakingMetrics?: {
    wpm: number;
    fillerCount: number;
    fillersUsed: Record<string, number>;
    durationSeconds: number;
  }
): Promise<{ score: number; feedback: string; correctAnswer?: string; pronunciationFeedback: string; conceptExplanation?: string; keyDifferences?: string }> => {
  const personaPrompts = {
    'Friendly': 'Provide feedback in an encouraging and constructive way. Even if they are wrong, be kind and offer helpful tips.',
    'Stern': 'Provide feedback in a direct, blunt, and strictly professional manner. Do not sugarcoat anything. If they are wrong, state it clearly and move on.',
    'Technical Expert': 'Provide feedback with extreme technical detail. Focus on the nuances of their answer and point out even minor technical inaccuracies or missed optimizations.'
  };

  const metricsPrompt = speakingMetrics ? `
    We have recorded the physical speech metrics for this response:
    - Speaking Pace: ${speakingMetrics.wpm} Words Per Minute (WPM)
    - Total Speaking Duration: ${speakingMetrics.durationSeconds} seconds
    - Total Filler Words Count: ${speakingMetrics.fillerCount}
    - Details of Filler Words used: ${JSON.stringify(speakingMetrics.fillersUsed)}

    In corporate speech standards:
    - Ideal pace: 110-150 WPM. Less than 90 WPM is slow; greater than 150 WPM indicates rushing.
    - Filler words count greater than 3 in a short response denotes hesitation.
    
    Please incorporate these actual verified spoken metrics into the 'pronunciationFeedback' section, advising specifically on how to adjust their pacing or reduce filler words based on these exact measurements.
  ` : '';

  const prompt = `
    ${personaPrompts[persona]}
    Question: ${question}
    User Response: ${response}
    Domain: ${domain}
    
    Evaluate the response based on correctness, relevance, and communication.
    
    - Communication Evaluation:
      ${metricsPrompt}
      - Analyze the transcript for clarity, filler words (um, uh, like), and "perceived" pronunciation issues.
      - If the transcript contains phonetic-like errors or "garbled" text, it might indicate mispronunciation.
      - Provide specific feedback on how to improve articulation and clarity.
    
    - If the domain is a Quiz-style round (Aptitude & Reasoning, or any domain ending with '(Quiz)'):
      - The user response is one of the provided options.
      - Compare the user's selected option with the correct answer.
      - If correct, score 100. If wrong, score 0 and provide the correct option with a brief explanation.
    
    - For other domains:
      - Evaluate based on depth, accuracy, and professional communication.
      - If the user's answer is wrong or incomplete, provide the correct/ideal answer.
    
    - Conceptual Breakdown (Mandatory):
      - Provide a detailed "Concept Explanation" that explains the underlying principle of the question. 
      - This is for learning purposes, especially for freshers.
      - Explain "Why" the answer is what it is.

    - Side-by-Side Comparison (Mandatory):
      - Provide "Key Differences" between the user's response and the ideal answer.
      - Highlight what was missing, what was incorrect, or what was particularly well-said.
      - Use bullet points.
    
    Return a JSON object with:
    - score: (0-100)
    - feedback: (Short constructive feedback on content)
    - correctAnswer: (The ideal answer, especially if the user was wrong. If the user was perfect, this can be empty)
    - pronunciationFeedback: (Feedback on clarity, articulation, and filler words. Use the verbal analytics if provided.)
    - conceptExplanation: (Detailed explanation of the concept behind the question. Max 100 words.)
    - keyDifferences: (A summary of the differences between the user response and the ideal answer.)
  `;

  const result = await getAI().models.generateContent({
    model: "gemini-3-flash-preview",
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
          conceptExplanation: { type: Type.STRING, description: "Detailed explanation of the concept" },
          keyDifferences: { type: Type.STRING, description: "Comparison between user and ideal response" },
        },
        required: ["score", "feedback", "pronunciationFeedback", "conceptExplanation", "keyDifferences"],
      },
    },
  });

  try {
    return JSON.parse(result.text || '{"score": 50, "feedback": "Good effort.", "pronunciationFeedback": "Try to speak more clearly."}');
  } catch (e) {
    return { score: 50, feedback: "Good effort.", pronunciationFeedback: "Try to speak more clearly." };
  }
};

export const generateFinalFeedback = async (
  domain: Domain,
  questions: InterviewQuestion[]
): Promise<InterviewFeedback> => {
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
    model: "gemini-3-flash-preview",
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

  try {
    return JSON.parse(result.text || "{}");
  } catch (e) {
    return {
      overallScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      confidenceScore: 0,
      summary: "Evaluation failed.",
      suggestions: []
    };
  }
};

export const generateRoadmap = async (
  interviews: any[]
): Promise<{ title: string; steps: { title: string; description: string; resources: string[] }[] }> => {
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
    model: "gemini-3-flash-preview",
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

  try {
    return JSON.parse(result.text || "{}");
  } catch (e) {
    return {
      title: "Your Career Roadmap",
      steps: []
    };
  }
};
