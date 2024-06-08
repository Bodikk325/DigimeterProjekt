import { Component, afterNextRender } from '@angular/core';
import { QuizResultsService } from '../quizResults.service';
import { MyFirm } from '../myFirm';
import { FirmsService } from '../firms.service';
import { Router } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { NotificationService } from '../notification.service';
import { MainPageResult } from '../models/MainPageResult';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private resultForUserSubscription!: Subscription;
  private saveFirmSubscription!: Subscription;
  private getFirmDataSubscription!: Subscription;

  myFirm!: MyFirm;

  results!: MainPageResult[];

  isMainPageLoaded!: boolean;

  messages!: string[];

  isLoading!: boolean;

  constructor(private notiService: NotificationService, private quizResultService: QuizResultsService, private firmService: FirmsService, private router: Router) {

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

    this.isLoading = false;
    this.isMainPageLoaded = false;

    afterNextRender(() => {
      this.resultForUserSubscription = this.quizResultService.getResultsForUser().subscribe(
        (result) => {
          this.results = result;
          this.isMainPageLoaded = true;
        }
      );
    })
  }

  saveToFirm() {

    this.isLoading = true;

    this.saveFirmSubscription = this.firmService.saveMyFirmData(this.myFirm).subscribe(
      (_) => {
        this.notiService.show("Cégadatok sikeresen mentve!", NotificationType.positivie)
        this.isLoading = false;
      }
    )

  }

  ngOnInit() {

    this.getFirmDataSubscription = this.firmService.getFirmData().subscribe(
      (result: any) => {
        this.myFirm.Capital = result.capital
        this.myFirm.Revenue = result.revenue
        this.myFirm.Region = result.region
        this.myFirm.Workers = result.employees
        this.myFirm.Sector = result.sector
        this.myFirm.Field = result.field
      }
    );

  }

  checkFirmDataAndThenGoToQuiz() {
    if (this.myFirm == null || this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "" || this.myFirm.Capital == "" || this.myFirm.Revenue == "" || this.myFirm.Sector == "") {
      this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error)
    }
    else {
      this.router.navigate(['../quiz', ""])
    }
  }

  ngOnDestroy() {
    if (this.resultForUserSubscription != null) {
      this.resultForUserSubscription.unsubscribe();
    }
    if (this.saveFirmSubscription != null) {
      this.saveFirmSubscription.unsubscribe();
    }
    if (this.getFirmDataSubscription != null) {
      this.getFirmDataSubscription.unsubscribe();
    }
  }

}
