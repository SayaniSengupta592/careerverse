
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized. Please sign in.");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      id: true,
      industry: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

// Save Resume
export async function saveResume(content) {
  const user = await getAuthenticatedUser();

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Resume content cannot be empty.");
  }

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content: content.trim(),
      },
      create: {
        userId: user.id,
        content: content.trim(),
      },
    });

    revalidatePath("/resume");

    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume.");
  }
}

// Get Resume
export async function getResume() {
  const user = await getAuthenticatedUser();

  try {
    return await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw new Error("Failed to fetch resume.");
  }
}

// Improve Resume Description with AI
export async function improveWithAI({ current, type }) {
  const user = await getAuthenticatedUser();

  if (typeof current !== "string" || !current.trim()) {
    throw new Error("Please provide a description to improve.");
  }

  const allowedTypes = ["experience", "education", "project"];

  if (!allowedTypes.includes(type?.toLowerCase())) {
    throw new Error("Invalid resume entry type.");
  }

  try {
    const ai = getGeminiClient();

    const prompt = `
You are an expert professional resume writer.

Improve the following ${type.toLowerCase()} description for a
${user.industry || "professional"}.

Original description:
"""
${current.trim()}
"""

Requirements:
1. Use strong action verbs.
2. Highlight achievements rather than only responsibilities.
3. Include measurable results only when supported by the original content.
4. Highlight relevant technical and professional skills.
5. Use appropriate industry-specific keywords.
6. Keep the description concise and professional.
7. Do not invent qualifications, achievements, or statistics.
8. Return only the improved description as a single paragraph.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const improvedContent = response.text?.trim();

    if (!improvedContent) {
      throw new Error("Gemini returned an empty response.");
    }

    return improvedContent;
  } catch (error) {
    console.error("Error improving resume description:", error);

    throw new Error(
      error.message || "Failed to improve resume description."
    );
  }
}
