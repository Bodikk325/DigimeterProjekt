import { Component, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { QuizResultsService } from '../services/quizResults.service';
import { Router } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { MainPageResult } from '../models/MainPageResult';
import { Subscription } from 'rxjs';
import { MyFirm } from '../models/MyFirm';
import { NotificationService } from '../services/notification.service';
import { FirmsService } from '../services/firms.service';
import { AuthService } from '../services/auth.service';
import { Question } from '../models/Question';
import { Result } from '../models/Result';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnDestroy {

  private resultForUserSubscription!: Subscription;
  private saveFirmSubscription!: Subscription;
  private getFirmDataSubscription!: Subscription;
  private removeResultSubscription!: Subscription;
  private getUserContQuizSubscription!: Subscription;

  authService: AuthService;
  myFirm: MyFirm;
  results: MainPageResult[];
  selectedResult: MainPageResult;
  contQuizQuestions: Question[];

  isResultRemoveLoading: boolean;

  isContQuizLoaded: boolean;
  isFirmDataLoaded: boolean;
  isResultsLoaded : boolean;

  isFirmSavingLoading : boolean;
  showDialog: boolean;
  messages: string[];

  constructor(authService: AuthService, private notiService: NotificationService, private quizResultService: QuizResultsService, private firmService: FirmsService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {

    this.messages = [
      "Ez itt a főoldal!",
      "Itt tudsz majd új kérdőívet kitölteni vagy akár megnézni az előző kitöltéseidnek az eredményét!",
      "Fontos, hogy mielőtt új kérdőívet töltenél ki azelőtt meg kell adnod a céged adatait!",
      "Ehhez gördíts le a lap aljára ezen a képernyőn!"
    ]

    this.results = []
    this.selectedResult = {
        average_points: 0,
        date: 0,
        finalScore: 0,
        max_point: 0,
        resultId: '',
        resultType: ''
    }
    this.contQuizQuestions = []
    this.isResultRemoveLoading = false;


    this.isContQuizLoaded = false;
    this.isFirmDataLoaded = false;
    this.isResultsLoaded = false;

    this.isFirmSavingLoading = false;
    this.showDialog = false;

    this.myFirm = {
      UserName: "",
      Capital: "",
      Field: "",
      Region: "",
      Revenue: "",
      Sector: "",
      Workers: ""
    }

    this.authService = authService;

    this.manageSubscriptions();

  }

  //#region for managing subscriptions

  manageSubscriptions() {

    this.getUserContQuizSubscription = this.authService.getContQuiz().subscribe(
      {
        next: (result) => {
          this.isContQuizLoaded = true;
          if (result == null) {
            this.contQuizQuestions = []
          }
          else {
            this.contQuizQuestions = result
          }
        },
        error: (_) => {
            this.isContQuizLoaded = true;
            this.contQuizQuestions = []
        }
      }
    )

    this.getFirmDataSubscription = this.firmService.getFirmData().subscribe(
      {
        next: (result : any) => {
          this.isFirmDataLoaded = true;
          this.myFirm.Capital = result.capital;
          this.myFirm.Revenue = result.revenue;
          this.myFirm.Region = result.region;
          this.myFirm.Workers = result.employees;
          this.myFirm.Sector = result.sector;
          this.myFirm.Field = result.field;
        },
        error : (_) => {
          this.isFirmDataLoaded = true;
          this.myFirm = {
            UserName: "",
            Capital: "",
            Field: "",
            Region: "",
            Revenue: "",
            Sector: "",
            Workers: ""
          }
        }
      }
    );

    this.resultForUserSubscription = this.quizResultService.getResultsForUser().subscribe(
      {
        next : (results : MainPageResult[]) => {
          this.isResultsLoaded = true;
          this.results = results
        },
        error : (_) => {
          this.isResultsLoaded = true;
          this.results = [];
        }
      }
    );
  }

  //#endregion

  //#region methods for the removeResult and the saveFirm data functions


  removeResult(result: MainPageResult) {
    this.isResultRemoveLoading = true;
    this.removeResultSubscription = this.quizResultService.removeResults(result.resultId).subscribe(
      {
        next: (result) => {
          this.results = result;
          this.isResultRemoveLoading = false;
        },
        error: (_) => {

        }
      }
    )
  }

  saveToFirm() {
    this.isFirmSavingLoading = true;

    this.saveFirmSubscription = this.firmService.saveMyFirmData(this.myFirm).subscribe(
      {
        next: (_) => {
          this.notiService.show("Cégadatok sikeresen mentve!", NotificationType.positivie);
          this.isFirmSavingLoading = false;
        },
        error: (_) => {
          this.notiService.show("Valami hiba történt, kérlek próbáld meg később!", NotificationType.error);
          this.isFirmSavingLoading = false;
        }
      }
    )
  }

  //#endregion

  //#region for the validation of the firm data

  goToThemeBasedQuiz(category: string) {
    if (this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "" || this.myFirm.Capital == "" || this.myFirm.Revenue == "" || this.myFirm.Sector == "") {
      this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error);
    } else {
      this.router.navigate(['quiz', category]);
    }
  }

  checkFirmDataAndThenGoToQuiz() {
    if (this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "" || this.myFirm.Capital == "" || this.myFirm.Revenue == "" || this.myFirm.Sector == "") {
      this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error);
    } else {
      this.router.navigate(['quiz', ""]);
    }
  }

  //#endregion

  //#region for the result delete dialog


  selectedOptionForDelete(option: string, result: MainPageResult) {
    if (option == "Back") {
      this.showDialog = false;
    }
    else {
      this.showDialog = false;
      this.removeResult(result);
    }
  }

  removeResultDialogShow(result: MainPageResult) {
    this.selectedResult = result;
    this.showDialog = true;
  }

  //#endregion


  //#region for the ngOnDestroy

  ngOnDestroy() {
    if (this.resultForUserSubscription) {
      this.resultForUserSubscription.unsubscribe();
    }
    if (this.saveFirmSubscription) {
      this.saveFirmSubscription.unsubscribe();
    }
    if (this.getFirmDataSubscription) {
      this.getFirmDataSubscription.unsubscribe();
    }
    if (this.removeResultSubscription) {
      this.removeResultSubscription.unsubscribe();
    }
    if (this.getUserContQuizSubscription) {
      this.getUserContQuizSubscription.unsubscribe();
    }
  }

  //#endregion
}
