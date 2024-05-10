import { Component, afterNextRender } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { MyFirm } from '../myFirm';
import { DataService } from '../data.service';
import { FirmsService } from '../firms.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Result } from '../result';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  myFirm!: MyFirm;

  saveToFirm() {
    this.firmService.saveFirmToList(this.myFirm)
  }

  ngOnInit() {
    this.results = this.quizResultService.getQuizResults();
    this.myFirm = this.firmService.getMyFirmData();
  }

  results: Result[] = []

  constructor(private quizResultService: QuizResultsService, private dataService: DataService, private firmService: FirmsService, private authService: AuthService, private router : Router) {
  }

  checkFirmData()
  {
    if(this.myFirm == null || this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "")
      {
        alert("Kérlek tölts ki minden mezőt!")
      }
      else
      {
        this.router.navigate(['../quiz'])
      }
  }
}
