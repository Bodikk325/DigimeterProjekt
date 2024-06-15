import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { NotificationService } from "./notification.service";
import { NotificationType } from "../notification/notification.component";
import { Observable } from "rxjs";
import { Question } from "../models/Question";
import { Result } from "../models/Result";
import { RegionData } from "../models/RegionData";
import { MainPageResult } from "../models/MainPageResult";
import { httpUrl } from "../variables";



@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {

  url = httpUrl;

  constructor(private notificationService : NotificationService, private router : Router, private http : HttpClient) { }

  quizResults!: Result[];
  currentResult!: Result;
  regionData : RegionData = {
    id: "",
    max_point: 0,
    average_points: 0,
    Budapest: 0,
    "Dél-Alföld": 0,
    "Dél-Dunántúl": 0,
    "Egyéb (közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatás)": 0,
    Feldolgozóipar: 0,
    "Informatikai eszközt használó munkavállalók": null,
    "Információ, kommunikáció": 0,
    Ingatlanügyek: 0,
    "Kereskedelem, gépjárműjavítás": 0,
    "Közép-Dunántúl": 0,
    "Mezőgazdaság, bányászat": 0,
    "Nyugat-Dunántúl": 0,
    "Pest megye": 0,
    "Pénzügyi, biztosítási tevékenység": 0,
    "Szakmai, tudományos, műszaki tevékenység, könyvelés": 0,
    "Szálláshely szolgálatatás, vendéglátás": 0,
    "Szállítás/raktározás": 0,
    "Villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátás": 0,
    Építőipar: 0,
    "Észak-Alföld": 0,
    "Észak-Magyarország": 0,
    "5-9 fő": 0,
    "10-19 fő": 0,
    "20-49 fő": 0,
    "50-249 fő": 0,
    "Adminisztratív és szolgáltatást támogató tevékenység": 0
  }

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
      finalScore : 0,
      compared_list : this.regionData,
      time : new Date().toDateString(),
      id: "stamp", // Timestamp, mint egyedi azonosító
      results: questions.map(q => {
        const { points, selectedAnswerTexts } = this.getPointsForSelectedAnswer(q.id, questions);
        return {
          shownPoint : 0,
          regionData : this.regionData,
          questionId: q.id,
          questionText: q.question,
          textBoxAnswer : q.textBoxAnswer,
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

  generateGUID(): string {
    const s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  }

  public saveQuizResultsAtTheEnd(questions: Question[], resultType : string) {
    var stamp = new Date().toDateString();
    
    this.currentResult = {
      id : this.generateGUID(),
      resultType : resultType,
      compared_list : this.regionData,
      finalScore : 0,
      time: stamp, // Timestamp, mint egyedi azonosító
      results: questions.map(q => {
        const { points, selectedAnswerTexts } = this.getPointsForSelectedAnswer(q.id, questions);
        return {
          questionId: q.id,
          regionData : this.regionData,
          shownPoint : 0,
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

    this.saveToDatabase(JSON.stringify(this.currentResult), resultType, this.currentResult.id).subscribe(
      (result) => 
        {
          this.router.navigateByUrl("result/" + this.currentResult.id);
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

    return this.http.post(this.url + "getResultsForUser.php", body, {withCredentials : true});
  }

  getResultForUser(resultId : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);

    return this.http.post(this.url + "getResultForUser.php", body, {withCredentials : true});
  }

  getFinalResult(resultId : string, category : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);
    body = body.set('category', category);

    return this.http.post(this.url + "getFinalResult.php", body, {withCredentials : true});
  }

  saveToDatabase(quizResult : string, resultType : string, id : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('id', localStorage.getItem("currentUser") ?? "");
    body = body.set('result', quizResult);
    body = body.set('resultId', id);
    body = body.set('date', new Date().toDateString());
    body = body.set('resultType', resultType);

    return this.http.post(this.url + "saveResult.php", body, {withCredentials : true});
  }

  calculateDigimeterIndex(currentResult : Result, page : string)
  {
    let body = new HttpParams();
    body = body.set('currentResult', JSON.stringify(currentResult));
    body = body.set('page', page);

    return this.http.post(this.url + "calculateDigimiterIndex.php", body, {withCredentials : true});
  }

  removeResults(resultId : string) : Observable<MainPageResult[]>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);
    body = body.set('userId', localStorage.getItem("currentUser") ?? "");

    return this.http.post<MainPageResult[]>(this.url + "removeResult.php", body, {withCredentials : true});
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
