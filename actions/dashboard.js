
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new GoogleGenAI({ apiKey });
};

// Wait before retrying Gemini requests
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Primary and fallback models
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
];

// Generate content with automatic model fallback
const generateWithRetry = async (ai, prompt) => {
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Trying Gemini model: ${model}`);

        const result = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        console.log(`Successfully generated content using ${model}`);

        return result;
      } catch (error) {
        const status = Number(
          error.status || error.code || error.error?.code
        );

        const message = String(error.message || "");

        const isTemporary =
          [429, 500, 503].includes(status) ||
          /UNAVAILABLE|high demand|overloaded/i.test(message);

        if (!isTemporary) {
          console.error("Gemini API error:", error);
          throw error;
        }

        console.error(`${model} temporarily unavailable:`, message);

        // Switch to the next model immediately on 503
        if (
          status === 503 ||
          /UNAVAILABLE|high demand|overloaded/i.test(message)
        ) {
          break;
        }

        // Retry rate limits and server errors once
        if (attempt === 0) {
          await sleep(2000);
        }
      }
    }

    console.log(`Moving to the next Gemini model...`);
  }

  throw new Error(
    "All Gemini models are temporarily unavailable. Please try again later."
  );
};

export const generateAIInsights = async (industry) => {
  const ai = getAIClient();

  const prompt = `
Analyze the current state of the ${industry} industry.

Return ONLY valid JSON in the following format:

{
  "salaryRanges": [
    {
      "role": "string",
      "min": 0,
      "max": 0,
      "median": 0,
      "location": "string"
    }
  ],
  "growthRate": 0,
  "demandLevel": "High",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

Requirements:
1. Include at least 5 common roles in salaryRanges.
2. Include at least 5 topSkills.
3. Include at least 5 keyTrends.
4. Include at least 5 recommendedSkills.
5. Growth rate should be a percentage.
6. Return only JSON without markdown or explanations.
7. Do not invent unsupported statistics.
`;

  const result = await generateWithRetry(ai, prompt);

  const text = result.text || "";

  const cleanedText = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Invalid Gemini JSON response:", text);
    throw new Error("Gemini returned an invalid JSON response.");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
