
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

function getErrorStatus(error) {
  if (error?.status) return Number(error.status);
  if (error?.code) return Number(error.code);

  const message = error?.message || "";

  try {
    const parsed = JSON.parse(message);
    return Number(parsed?.error?.code);
  } catch {
    const match = message.match(/\b(404|429|500|502|503|504)\b/);
    return match ? Number(match[0]) : null;
  }
}

async function generateAIContent(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = result.text?.trim();

      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      console.log(`Successfully used: ${model}`);

      return text;
    } catch (error) {
      const status = getErrorStatus(error);

      console.error(
        `${model} failed (status: ${status || "unknown"}):`,
        error.message
      );

      if (![404, 429, 500, 502, 503, 504].includes(status)) {
        throw error;
      }

      console.log("Switching to the next Gemini model...");
    }
  }

  throw new Error("All Gemini models failed");
}

// Generate a technical interview quiz.
export async function generateQuiz() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry || "general"
    } professional${
    user.skills?.length
      ? ` with expertise in ${user.skills.join(", ")}`
      : ""
  }.

    Each question must have exactly 4 multiple-choice options.

    Return ONLY valid JSON in this format:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }

    Requirements:
    - Generate exactly 10 questions.
    - Every question must have exactly 4 options.
    - Only one option must be correct.
    - correctAnswer must exactly match one of the options.
    - Include a clear explanation for every answer.
    - Do not include markdown or additional text.
  `;

  try {
    const text = await generateAIContent(prompt);

    const cleanedText = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const quiz = JSON.parse(cleanedText);

    if (
      !Array.isArray(quiz.questions) ||
      quiz.questions.length !== 10
    ) {
      throw new Error("Invalid quiz response: expected 10 questions");
    }

    for (const question of quiz.questions) {
      if (
        typeof question.question !== "string" ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.options.every(
          (option) => typeof option === "string"
        ) ||
        typeof question.correctAnswer !== "string" ||
        !question.options.includes(question.correctAnswer) ||
        typeof question.explanation !== "string" ||
        !question.explanation.trim()
      ) {
        throw new Error("Invalid question format received from Gemini");
      }
    }

    return quiz.questions;
  } catch (error) {
    console.error("QUIZ GENERATION ERROR:", error);

    throw new Error(
      "Failed to generate quiz questions. Please try again."
    );
  }
}

// Save quiz results immediately.
export async function saveQuizResult(questions, answers) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    !Array.isArray(questions) ||
    !Array.isArray(answers) ||
    questions.length !== answers.length ||
    questions.length === 0
  ) {
    throw new Error("Invalid quiz results");
  }

  const questionResults = questions.map((q, index) => {
    if (
      typeof q.question !== "string" ||
      typeof q.correctAnswer !== "string" ||
      typeof q.explanation !== "string"
    ) {
      throw new Error("Invalid question data");
    }

    return {
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[index] ?? null,
      isCorrect: q.correctAnswer === answers[index],
      explanation: q.explanation,
    };
  });

  const correctAnswers = questionResults.filter(
    (question) => question.isCorrect
  ).length;

  const calculatedScore = Math.round(
    (correctAnswers / questionResults.length) * 100
  );

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: calculatedScore,
        questions: questionResults,
        category: "Technical",
        improvementTip: null,
      },
    });

    return assessment;
  } catch (error) {
    console.error("ERROR SAVING QUIZ RESULT:", error);
    throw new Error("Failed to save quiz result");
  }
}

// Generate an improvement tip separately, after the result is saved.
export async function generateImprovementTip(assessmentId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!assessmentId || typeof assessmentId !== "string") {
    throw new Error("Invalid assessment ID");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      industry: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const assessment = await db.assessment.findFirst({
    where: {
      id: assessmentId,
      userId: user.id,
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (assessment.improvementTip) {
    return assessment.improvementTip;
  }

  const questions = assessment.questions;

  if (!Array.isArray(questions)) {
    return null;
  }

  const wrongAnswers = questions.filter(
    (question) => !question.isCorrect
  );

  if (wrongAnswers.length === 0) {
    return null;
  }

  const wrongQuestionsText = wrongAnswers
    .map(
      (q) => `
        Question: "${q.question}"
        Correct Answer: "${q.answer}"
        User Answer: "${q.userAnswer ?? "Not answered"}"
      `
    )
    .join("\n");

  const improvementPrompt = `
    The user completed a ${
      user.industry || "general"
    } technical interview quiz.

    These are the questions they answered incorrectly:

    ${wrongQuestionsText}

    Based on these answers, provide a concise and specific
    improvement tip.

    Focus on the knowledge gaps revealed by the answers.
    Keep the response under 2 sentences.
    Be encouraging.
    Focus on what to learn and practice.
    Do not explicitly mention the mistakes.
  `;

  try {
    const improvementTip = await generateAIContent(improvementPrompt);

    await db.assessment.update({
      where: {
        id: assessment.id,
      },
      data: {
        improvementTip: improvementTip.trim(),
      },
    });

    return improvementTip.trim();
  } catch (error) {
    console.error("ERROR GENERATING IMPROVEMENT TIP:", error);
    return null;
  }
}

// Fetch previous assessments.
export async function getAssessments() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  try {
    return await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("ERROR FETCHING ASSESSMENTS:", error);
    throw new Error("Failed to fetch assessments");
  }
}

