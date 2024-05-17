import { Injectable } from "@angular/core";
import { Result } from "./result";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";

export interface Question {
  id: string;
  question: string;
  answers: {
    id: string,
    answer: string;
    points: number;
    selected?: boolean;
    nextQuestionId?: string;
    contains_Textbox: boolean // Következő kérdés azonosítója, ha ez a válasz kiválasztásra kerül
  }[];
  selectedAnswer?: string | string[];
  maxpoint: number;
  isThereMoreThanOneAnswer: boolean;
  isA7related: boolean,
  category: string;
  based_on: string[];
  condition: string[];
  defaultNextQuestionId?: string; // Ez az alapértelmezett következő kérdés azonosítója, ha nincs külön meghatározva a válaszban
}

@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {

  constructor(private authService: AuthService, private router : Router) { }

  quizResults!: Result[];
  currentResult!: Result;

  public getQuizResults(): Result[] {
    var results = JSON.parse(localStorage.getItem('quizResults') || '[]') as Result[];
    const userResults = this.authService.getUserResults();

    var finalList: Result[] = []
    results.forEach(element => {
      if (userResults.indexOf(element.id) !== -1) {
        finalList.push(element)
      }
    });
    return finalList;
  }

  public getContinuedResults(): Result {
    var result = JSON.parse(localStorage.getItem('contQuizResult') || '') as Result;
    return result;
  }

  public saveQuizResults(questions: Question[]) {
    const stamp = new Date().getTime();
  
    this.currentResult = {
      id: stamp, // Timestamp, mint egyedi azonosító
      totalPoints: questions.reduce((total, q) => total + this.getPointsForSelectedAnswer(q.id, questions).points, 0), // Összpontszám számítás
      results: questions.map(q => {
        const { points, selectedAnswerTexts } = this.getPointsForSelectedAnswer(q.id, questions);
        return {
          questionId: q.id,
          questionText: q.question,
          maxpoint: q.maxpoint,
          // Győződjünk meg róla, hogy selectedAnswer mindig string tömb
          selectedAnswer: Array.isArray(q.selectedAnswer) ? q.selectedAnswer : (q.selectedAnswer ? [q.selectedAnswer] : []),
          points,
          category: q.category,
          selectedAnswerTexts // Új mező hozzáadása
        };
      })
    };
  
    localStorage.setItem('contQuizResult', JSON.stringify(this.currentResult));
  }

  public saveQuizResultsAtTheEnd(questions: Question[]) {
    var stamp = new Date().getTime();

    this.currentResult = {
      id: stamp, // Timestamp, mint egyedi azonosító
      totalPoints: this.calculateTotalPoints(questions), // Összpontszám számítás
      results: questions.map(q => {
        const { points, selectedAnswerTexts } = this.getPointsForSelectedAnswer(q.id, questions);
        return {
          questionId: q.id,
          questionText: q.question,
          maxpoint: q.maxpoint,
          // Győződjünk meg róla, hogy selectedAnswer mindig string tömb
          selectedAnswer: Array.isArray(q.selectedAnswer) ? q.selectedAnswer : (q.selectedAnswer ? [q.selectedAnswer] : []),
          points,
          category: q.category,
          selectedAnswerTexts // Új mező hozzáadása
        };
      })
    };

    // Meglévő eredmények lekérése és frissítése
    var existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]') as Result[];
    if (existingResults != null) {
      existingResults.push(this.currentResult);
    }
    else {
      existingResults = []
    }
    this.authService.addResultToUser(this.currentResult)
    localStorage.setItem('quizResults', JSON.stringify(existingResults));

    this.router.navigateByUrl("result/" + stamp)
  }



  private getPointsForSelectedAnswer(questionId: string, questions: Question[]): { points: number, selectedAnswerTexts: string[] } {
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
  
  private calculateTotalPoints(questions: Question[]): number {
    return questions.reduce((total, question) => total + this.getPointsForSelectedAnswer(question.id, questions).points, 0);
  }

}
