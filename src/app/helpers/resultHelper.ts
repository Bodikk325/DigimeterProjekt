import { Question } from "../models/Question";

export class ResultHelper
{
    public static getPointsForSelectedAnswer(questionId: string, questions: Question[]): { points: number, selectedAnswerTexts: string[] } {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.selectedAnswer) return { points: 0, selectedAnswerTexts: [] };
      
        let totalPoints = 0;
        const selectedAnswerTexts: string[] = [];
      
        if (Array.isArray(question.selectedAnswer)) {
          question.selectedAnswer.forEach(answerId => {
            const answerOption = question.answers.find(a => a.id === answerId);
            if (answerOption) {
              totalPoints += answerOption.points;
              selectedAnswerTexts.push(answerOption.answer);
            }
          });
        } else {
          const selectedAnswerOption = question.answers.find(a => a.id === question.selectedAnswer);
          if (selectedAnswerOption) {
            totalPoints = selectedAnswerOption.points;
            selectedAnswerTexts.push(selectedAnswerOption.answer);
          }
        }
      
        // Ügyeljünk arra, hogy a pontszám ne legyen nagyobb, mint a maxpoint
        totalPoints = Math.min(totalPoints, question.maxpoint);
      
        return { points: totalPoints, selectedAnswerTexts };
      }
}