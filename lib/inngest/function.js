
import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    triggers: {
      cron: "0 0 * * 0",
    },
  },
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
Analyze the current state of the ${industry} industry.

Return ONLY valid JSON in this format:
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

Include at least 5 roles, skills, and trends.
Growth rate should be a percentage.
Do not invent unsupported statistics.
`;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: p,
          });
        },
        prompt
      );

      const text = res.text || "";
      const cleanedText = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const insights = JSON.parse(cleanedText);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
          },
        });
      });
    }
  }
);
