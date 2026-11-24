
"use client";

import { useMemo } from "react";
import { Brain, Target, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StatsCards({ assessments = [] }) {
  const stats = useMemo(() => {
    if (!assessments.length) {
      return {
        averageScore: "0.0",
        totalQuestions: 0,
        latestScore: "0.0",
      };
    }

    const totalScore = assessments.reduce(
      (sum, assessment) =>
        sum + (Number(assessment.quizScore) || 0),
      0
    );

    const totalQuestions = assessments.reduce(
      (sum, assessment) =>
        sum + (assessment.questions?.length || 0),
      0
    );

    const latestAssessment = assessments[0];

    return {
      averageScore: (totalScore / assessments.length).toFixed(1),
      totalQuestions,
      latestScore: (
        Number(latestAssessment?.quizScore) || 0
      ).toFixed(1),
    };
  }, [assessments]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Score
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalQuestions}
          </div>
          <p className="text-xs text-muted-foreground">
            Total questions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Latest Score
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            {stats.latestScore}%
          </div>
          <p className="text-xs text-muted-foreground">
            Most recent quiz
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
