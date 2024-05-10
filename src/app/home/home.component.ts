import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { MyFirm } from '../myFirm';
import { FirmsService } from '../firms.service';
import { Router } from '@angular/router';
import { Result } from '../result';
import { NotificationComponent, NotificationType } from '../notification/notification.component';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  myFirm!: MyFirm;

  saveToFirm() {
    this.firmService.saveFirmToList(this.myFirm)
    this.notiService.show("Cégadatok sikeresen mentve!", NotificationType.positivie)
  }

  ngOnInit() {
    this.results = this.quizResultService.getQuizResults();
    this.myFirm = this.firmService.getMyFirmData();
  }

  results: Result[] = []

  constructor(private notiService : NotificationService,private quizResultService: QuizResultsService, private firmService: FirmsService, private router : Router) {
  }

  checkFirmData()
  {
    if(this.myFirm == null || this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "")
      {
        this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error)
      }
      else
      {
        this.router.navigate(['../quiz'])
      }
  }


}
