import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { QuizResultsService } from '../quizResults.service';
import { FirmsService } from '../firms.service';
import { Router, NavigationEnd } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { NotificationService } from '../notification.service';
import { MainPageResult } from '../models/MainPageResult';
import { Subscription } from 'rxjs';
import { MyFirm } from '../models/MyFirm';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  private resultForUserSubscription!: Subscription;
  private saveFirmSubscription!: Subscription;
  private getFirmDataSubscription!: Subscription;
  private removeResultSubscription!: Subscription;

  myFirm!: MyFirm;

  results!: MainPageResult[];

  selectedResult! : MainPageResult;

  isMainPageLoaded: boolean = false;

  isResultsLoading : boolean = false;

  showDialog : boolean = false;

  messages: string[] = [];

  isLoading: boolean = false;

  constructor(private notiService: NotificationService, private quizResultService: QuizResultsService, private firmService: FirmsService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {

    this.messages = [
      "Ez itt a főoldal!",
      "Itt tudsz majd új kérdőívet kitölteni vagy akár megnézni az előző kitöltéseidnek az eredményét!",
      "Fontos, hogy mielőtt új kérdőívet töltenél ki azelőtt meg kell adnod a céged adatai!"
    ]

    this.myFirm = {
      UserName: "",
      Capital: "",
      Field: "",
      Region: "",
      Revenue: "",
      Sector: "",
      Workers: ""
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        isPlatformBrowser(this.platformId)
    {
      this.initializeComponent();
    }
      }
    });
  }

  ngOnInit() {
    isPlatformBrowser(this.platformId)
    {
      this.initializeComponent();
    }
  }

  initializeComponent() {
    this.isMainPageLoaded = false;

    this.getFirmDataSubscription = this.firmService.getFirmData().subscribe(
      (result: any) => {
        this.myFirm.Capital = result.capital;
        this.myFirm.Revenue = result.revenue;
        this.myFirm.Region = result.region;
        this.myFirm.Workers = result.employees;
        this.myFirm.Sector = result.sector;
        this.myFirm.Field = result.field;
        this.checkMainPageLoaded();
      }
    );

    this.resultForUserSubscription = this.quizResultService.getResultsForUser().subscribe(
      (result) => {
        this.results = result;
        this.checkMainPageLoaded();
      }
    );
  }

  checkMainPageLoaded() {
    if (this.myFirm && this.results) {
      this.isMainPageLoaded = true;
    }
  }

  selectedOptionForDelete(option : string, result : MainPageResult)
  {
    if(option == "Back")
      {
        this.showDialog = false;
      }
      else 
      {
        this.showDialog = false;
        this.removeResult(result);
      }
  }

  removeResultDialogShow(result : MainPageResult)
  {
    this.selectedResult = result;
    this.showDialog = true;
  }

  removeResult(result : MainPageResult)
  {
    this.isResultsLoading = true;
    this.removeResultSubscription = this.quizResultService.removeResults(result.resultId).subscribe(
      (res) => {
        this.results = res;
        this.isResultsLoading = false;
      }
    )
  }

  saveToFirm() {
    this.isLoading = true;

    this.saveFirmSubscription = this.firmService.saveMyFirmData(this.myFirm).subscribe(
      (result) => {
        this.notiService.show("Cégadatok sikeresen mentve!", NotificationType.positivie);
        this.isLoading = false;
      },
      (error) => {
        this.notiService.show("Valami hiba történt, kérlek próbáld meg később!", NotificationType.error);
        this.isLoading = false;
      }
    )
  }

  goToThemeBasedQuiz(category: string) {
    if (!this.myFirm.Field || !this.myFirm.Region || !this.myFirm.Workers || !this.myFirm.Capital || !this.myFirm.Revenue || !this.myFirm.Sector) {
      this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error);
    } else {
      this.router.navigate(['quiz', category]);
    }
  }

  checkFirmDataAndThenGoToQuiz() {
    if (!this.myFirm.Field || !this.myFirm.Region || !this.myFirm.Workers || !this.myFirm.Capital || !this.myFirm.Revenue || !this.myFirm.Sector) {
      this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error);
    } else {
      this.router.navigate(['quiz' , ""]);
    }
  }

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
  }
}
