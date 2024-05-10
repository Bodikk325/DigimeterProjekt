import { Injectable } from "@angular/core";
import { Result } from "./result";
import { AuthService } from "./auth.service";

export interface Question {
  id: string;
  question: string;
  answers: {
    answer: string;
    points: number;
    selected?: boolean; // Ez az új mező azonosítja, hogy a válasz ki van-e jelölve (csak checkbox esetén)
  }[];
  selectedAnswer?: string | string[]; // Több választás támogatása
  maxpoint: number;
  isThereMoreThanOneAnswer: boolean;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {

  constructor(private authService : AuthService) { }

  quizResults!: Result[];
  currentResult!: Result;

  public getQuizResults(): Result[] {
    var results = JSON.parse(localStorage.getItem('quizResults') || '[]') as Result[];

    const userResults = this.authService.getUserResults();
    

    var finalList: Result[] = [] 
    results.forEach(element => {
      if(userResults.indexOf(element.id) !== -1)
        {
          finalList.push(element)
        }
    });

    
    return finalList;
  }

  public saveQuizResults(questions: Question[]) {
    var stamp = new Date().getTime();
    
    this.currentResult = {
      id: stamp, // Timestamp, mint egyedi azonosító
      totalPoints: this.calculateTotalPoints(questions), // Összpontszám számítás
      results: questions.map(q => ({
        questionId: q.id,
        questionText: q.question,
        maxpoint: q.maxpoint,
        // Győződjünk meg róla, hogy selectedAnswer mindig string tömb
        selectedAnswer: Array.isArray(q.selectedAnswer) ? q.selectedAnswer : (q.selectedAnswer ? [q.selectedAnswer] : []),
        points: this.getPointsForSelectedAnswer(q.id, questions),
        category: q.category
      }))
    };

    // Meglévő eredmények lekérése és frissítése
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]') as Result[];
    existingResults.push(this.currentResult);
    this.authService.addResultToUser(this.currentResult)
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
    window.location.href = "result/" + stamp;
  }

  private getPointsForSelectedAnswer(questionId: string, questions: Question[]): number {
    const question = questions.find(q => q.id === questionId);
    if (!question || !question.selectedAnswer) return 0;

    if (Array.isArray(question.selectedAnswer)) {
      const totalPoints = question.selectedAnswer.reduce((acc, answer) => {
        const answerOption = question.answers.find(a => a.answer === answer);
        return acc + (answerOption ? answerOption.points : 0);
      }, 0);
      return Math.min(totalPoints, question.maxpoint);
    } else {
      const selectedAnswerOption = question.answers.find(a => a.answer === question.selectedAnswer);
      return selectedAnswerOption ? selectedAnswerOption.points : 0;
    }
  }

  private calculateTotalPoints(questions: Question[]): number {
    return questions.reduce((total, question) => total + this.getPointsForSelectedAnswer(question.id, questions), 0);
  }

}
