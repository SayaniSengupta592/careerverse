
"use client";

import { Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  const questions = result.questions || [];

  return (
    <Card className="mx-auto border-0 shadow-none">
      <div className="flex items-center gap-2 text-3xl gradient-title px-6 pt-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </div>

      <CardContent className="space-y-6 pt-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">
            {result.quizScore.toFixed(1)}%
          </h3>
          <Progress
            value={result.quizScore}
            className="w-full"
          />
        </div>

        {result.improvementTip && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">Improvement Tip:</p>
            <p className="text-muted-foreground">
              {result.improvementTip}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-medium">Question Review</h3>

          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{q.question}</p>

                  {q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Your answer: {q.userAnswer}</p>

                  {!q.isCorrect && (
                    <p>Correct answer: {q.answer}</p>
                  )}
                </div>

                {q.explanation && (
                  <div className="text-sm bg-muted p-2 rounded">
                    <p className="font-medium">Explanation:</p>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No question details are available.
            </p>
          )}
        </div>
      </CardContent>

      {!hideStartNew && (
        <CardFooter>
          <Button
            onClick={onStartNew}
            className="w-full"
            disabled={!onStartNew}
          >
            Start New Quiz
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
