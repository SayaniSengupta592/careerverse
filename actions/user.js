
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check whether industry insights already exist
    const existingInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    // Generate AI insights outside the transaction
    let insights = null;

    if (!existingInsight) {
      insights = await generateAIInsights(data.industry);
    }

    // Update industry insights and user profile
    const updatedUser = await db.$transaction(
      async (tx) => {
        if (!existingInsight) {
          await tx.industryInsight.upsert({
            where: {
              industry: data.industry,
            },
            update: {},
            create: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }

        return await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: Number(data.experience),
            bio: data.bio,
            skills: data.skills,
          },
        });
      },
      {
        timeout: 10000,
      }
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating user and industry:", error);

    throw new Error(
      error.message || "Failed to update profile"
    );
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isOnboarded: Boolean(user.industry),
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);

    throw new Error(
      error.message || "Failed to check onboarding status"
    );
  }
}
