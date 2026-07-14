import { Domain, InterviewQuestion, InterviewFeedback, InterviewerPersona } from "../types";

export const generateNextQuestion = async (
  domain: Domain,
  previousQuestions: InterviewQuestion[],
  userPerformance: number,
  resumeOrJD?: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  persona: InterviewerPersona = 'Friendly'
): Promise<{ text: string; isCodeSnippet: boolean; options?: string[]; hint?: string }> => {
  const response = await fetch('/api/generate-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, previousQuestions, userPerformance, resumeOrJD, difficulty, persona })
  });
  if (!response.ok) throw new Error('Failed to generate question');
  return response.json();
};

export const evaluateResponse = async (
  question: string,
  responseStr: string,
  domain: Domain,
  persona: InterviewerPersona = 'Friendly',
  speakingMetrics?: {
    wpm: number;
    fillerCount: number;
    fillersUsed: Record<string, number>;
    durationSeconds: number;
  }
): Promise<{ score: number; feedback: string; correctAnswer?: string; pronunciationFeedback: string; conceptExplanation?: string; keyDifferences?: string }> => {
  const response = await fetch('/api/evaluate-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, responseStr, domain, persona, speakingMetrics })
  });
  if (!response.ok) throw new Error('Failed to evaluate response');
  return response.json();
};

export const generateFinalFeedback = async (
  domain: Domain,
  questions: InterviewQuestion[]
): Promise<InterviewFeedback> => {
  const response = await fetch('/api/generate-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain, questions })
  });
  if (!response.ok) throw new Error('Failed to generate feedback');
  return response.json();
};

export const generateRoadmap = async (
  interviews: any[]
): Promise<{ title: string; steps: { title: string; description: string; resources: string[] }[] }> => {
  const response = await fetch('/api/generate-roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interviews })
  });
  if (!response.ok) throw new Error('Failed to generate roadmap');
  return response.json();
};

