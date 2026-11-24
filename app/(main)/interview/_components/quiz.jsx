
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  generateQuiz,
  saveQuizResult,
  generateImprovementTip,
} from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData?.length) {
      setAnswers(new Array(quizData.length).fill(null));
      setCurrentQuestion(0);
      setShowExplanation(false);
    }
  }, [quizData]);

  // Generate the improvement tip without blocking the result screen.
  useEffect(() => {
    const assessmentId = resultData?.id;

    if (!assessmentId || resultData?.improvementTip) {
      return;
    }

    let active = true;

    generateImprovementTip(assessmentId)
      .then((tip) => {
        if (active && tip) {
          setResultData((previous) => {
            if (!previous || previous.id !== assessmentId) {
              return previous;
            }

            return {
              ...previous,
              improvementTip: tip,
            };
          });
        }
      })
      .catch((error) => {
        console.error("IMPROVEMENT TIP ERROR:", error);
      });

    return () => {
      active = false;
    };
  }, [resultData?.id, resultData?.improvementTip, setResultData]);

  const handleAnswer = (answer) => {
    setAnswers((previousAnswers) => {
      const newAnswers = [...previousAnswers];
      newAnswers[currentQuestion] = answer;
      return newAnswers;
    });
  };

  const calculateScore = () => {
    if (!quizData?.length) return 0;

    const correct = answers.reduce((total, answer, index) => {
      return answer === quizData[index].correctAnswer
        ? total + 1
        : total;
    }, 0);

    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    if (answers.some((answer) => !answer)) {
      toast.error("Please answer all questions before finishing.");
      return;
    }

    try {
      await saveQuizResultFn(quizData, answers);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const handleNext = () => {
    if (!answers[currentQuestion]) {
      toast.error("Please select an answer first.");
      return;
    }

    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setResultData(null);
    generateQuizFn();
  };

  if (generatingQuiz) {
    return (
      <div className="mt-6 w-full">
        <BarLoader width="100%" color="gray" />
        <p className="text-center text-sm text-muted-foreground mt-3">
          Generating your personalized quiz...
        </p>
      </div>
    );
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult
          result={resultData}
          onStartNew={startNewQuiz}
        />
      </div>
    );
  }

  if (!quizData?.length) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>
            Ready to test your knowledge?
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your
            industry and skills. Take your time and choose
            the best answer for each question.
          </p>
        </CardContent>

        <CardFooter>
          <Button
            onClick={generateQuizFn}
            className="w-full"
            disabled={generatingQuiz}
          >
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  if (!question) return null;

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-lg font-medium">
          {question.question}
        </p>

        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion] || ""}
          className="space-y-2"
          disabled={savingResult}
        >
          {question.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2"
            >
              <RadioGroupItem
                value={option}
                id={`option-${index}`}
              />
              <Label htmlFor={`option-${index}`}>
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-3">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion] || savingResult}
          >
            Show Explanation
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult
            ? "Saving Results..."
            : currentQuestion < quizData.length - 1
              ? "Next Question"
              : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
