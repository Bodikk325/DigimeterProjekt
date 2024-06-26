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
import { AuthServiceHelper } from "../helpers/authServiceHelper";
import { ResultHelper } from "../helpers/resultHelper";

@Injectable({
  providedIn: 'root'
})
export class QuizResultsService {

  url : string
  quizResults: Result[];
  currentResult!: Result;
  regionData : RegionData;

  constructor(private notificationService : NotificationService, private router : Router, private http : HttpClient) {

    this.quizResults = [];

    this.url = httpUrl;
    this.regionData = {
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
   }

  public getQuizResults(): Result[] {
    return [];
  }

  public getContinuedResults(): Result {
    var result = JSON.parse(localStorage.getItem('contQuizResult') || '') as Result;
    return result;
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
        const { points, selectedAnswerTexts } = ResultHelper.getPointsForSelectedAnswer(q.id, questions);
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
      {
        next : (_) => {
          this.router.navigateByUrl("result/" + this.currentResult.id);
        },
        error : (_) => {
          this.notificationService.show("Valami hiba történt az adatbázisban, nem sikerült a mentés.. Újratöltés...", NotificationType.error)
          this.router.navigateByUrl("home");
        }
      }
    )
  }

  getResultsForUser() : Observable<MainPageResult[]>
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());

    return this.http.post<MainPageResult[]>(this.url + "getResultsForUser.php", body, {withCredentials : true});
  }

  getResultForUser(resultId : string) : Observable<Result>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);

    return this.http.post<Result>(this.url + "getResultForUser.php", body, {withCredentials : true});
  }

  getFinalResult(resultId : string, category : string) : Observable<Result>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);
    body = body.set('category', category);
    body = body.set('jwt', AuthServiceHelper.getJwtToken());

    return this.http.post<Result>(this.url + "getFinalResult.php", body, {withCredentials : true});
  }

  saveToDatabase(quizResult : string, resultType : string, id : string) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    body = body.set('result', quizResult);
    body = body.set('resultId', id);
    body = body.set('date', new Date().toDateString());
    body = body.set('resultType', resultType);

    return this.http.post(this.url + "saveResult.php", body, {withCredentials : true});
  }

  removeResults(resultId : string) : Observable<MainPageResult[]>
  {
    let body = new HttpParams();
    body = body.set('resultId', resultId);
    body = body.set('jwt', AuthServiceHelper.getJwtToken());

    return this.http.post<MainPageResult[]>(this.url + "removeResult.php", body, {withCredentials : true});
  }
}
