
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { coverLetterSchema } from "@/app/lib/schema";

// Get authenticated CareerVerse user
async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized. Please sign in.");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    throw new Error("User profile not found. Please complete onboarding.");
  }

  return user;
}

// Initialize Gemini
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

// Generate and save cover letter
export async function generateCoverLetter(data) {
  const user = await getAuthenticatedUser();

  // Server-side validation
  const validation = coverLetterSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message || "Invalid job details."
    );
  }

  const { companyName, jobTitle, jobDescription } = validation.data;

  try {
    const ai = getGeminiClient();

    const experience = Array.isArray(user.experience)
      ? user.experience.join(", ")
      : user.experience || "Not provided";

    const skills = Array.isArray(user.skills)
      ? user.skills.join(", ")
      : user.skills || "Not provided";

    const prompt = `
You are a professional career writing assistant.

Create a tailored cover letter using the candidate's actual profile.

CANDIDATE PROFILE:
Name: ${user.name || "Candidate"}
Industry: ${user.industry || "Not provided"}
Experience: ${experience}
Skills: ${skills}
Professional Background: ${user.bio || "Not provided"}

JOB DETAILS:
Company: ${companyName}
Position: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

REQUIREMENTS:
1. Use a professional and enthusiastic tone.
2. Connect the candidate's actual skills to the job requirements.
3. Highlight relevant experience and background.
4. Use proper business letter formatting.
5. Keep the letter under 400 words.
6. Never invent achievements, qualifications, or experience.
7. Return the letter in clean Markdown.
8. Return only the cover letter.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const content = response.text?.trim();

    if (!content) {
      throw new Error("Gemini returned an empty cover letter.");
    }

    // Save generated cover letter in Neon
    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription,
        companyName,
        jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    return coverLetter;
  } catch (error) {
    console.error("Cover letter generation error:", error);

    throw new Error(
      error.message || "Failed to generate cover letter."
    );
  }
}

// Get all cover letters for logged-in user
export async function getCoverLetters() {
  const user = await getAuthenticatedUser();

  return db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Get a specific cover letter
export async function getCoverLetter(id) {
  if (!id) {
    throw new Error("Cover letter ID is required.");
  }

  const user = await getAuthenticatedUser();

  return db.coverLetter.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
}

// Delete a cover letter belonging to logged-in user
export async function deleteCoverLetter(id) {
  if (!id) {
    throw new Error("Cover letter ID is required.");
  }

  const user = await getAuthenticatedUser();

  const result = await db.coverLetter.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  if (result.count === 0) {
    throw new Error("Cover letter not found or access denied.");
  }

  return { success: true };
}
