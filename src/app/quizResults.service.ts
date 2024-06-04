import { Injectable } from "@angular/core";
import { Result } from "./result";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { NotificationService } from "./notification.service";
import { NotificationType } from "./notification/notification.component";
import { Observable } from "rxjs";

export interface Question {
  id: string;
  question: string;
  answers: {
    id: string,
    answer: string;
    points: number;
    selected?: boolean;
    contains_Textbox: boolean;
    textBoxAnswer? : string;
  }[];
  selectedAnswer?: string | string[];
  textBoxAnswer? : string;
  maxpoint: number;
  isThereMoreThanOneAnswer: boolean;
  category: string;
  based_on: string[];
  condition: string[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {

  constructor(private notificationService : NotificationService, private router : Router, private http : HttpClient) { }

  quizResults!: Result[];
  currentResult!: Result;

  public getQuizResults(): Result[] {
    return [];
  }

  public getContinuedResults(): Result {
    var result = JSON.parse(localStorage.getItem('contQuizResult') || '') as Result;
    return result;
  }

  public saveQuizResults(questions: Question[]) {
    this.currentResult = {
      resultType : "",
      time : new Date().getTime(),
      id: "stamp", // Timestamp, mint egyedi azonosító
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

  public saveQuizResultsAtTheEnd(questions: Question[], resultType : string) {
    var stamp = new Date().getTime();
    
    this.currentResult = {
      id : "0",
      resultType : "",
      time: stamp, // Timestamp, mint egyedi azonosító
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

    this.saveToDatabase(JSON.stringify(this.currentResult), resultType).subscribe(
      (result) => 
        {
          this.router.navigateByUrl("result/" + stamp);
        },
      (error) => {
        this.notificationService.show("Valami hiba történt az adatbázisban, nem sikerült a mentés.. Újratöltés...", NotificationType.error)
      }
    )
  }

  getResultsForUser() : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('userId', localStorage.getItem("currentUser") ?? "");

    return this.http.post("http://localhost/getResultsForUser.php", body, {withCredentials : true});
  }

  getResultForUser(resultId : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);

    return this.http.post("http://localhost/getResultForUser.php", body, {withCredentials : true});
  }

  saveToDatabase(quizResult : string, resultType : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('id', localStorage.getItem("currentUser") ?? "");
    body = body.set('result', quizResult);
    body = body.set('date', new Date().getTime());
    body = body.set('resultType', resultType);

    return this.http.post("http://localhost/saveResult.php", body, {withCredentials : true});
  }

  calculateDigimeterIndex(currentResult : Result, page : string)
  {
    let body = new HttpParams();
    body = body.set('currentResult', JSON.stringify(currentResult));
    body = body.set('page', page);

    console.log(page)

    return this.http.post("http://localhost/calculateDigimiterIndex.php", body, {withCredentials : true});
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

}
