import { Component, afterNextRender } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { MyFirm } from '../myFirm';
import { FirmsService } from '../firms.service';
import { Router } from '@angular/router';
import { Result } from '../result';
import { NotificationComponent, NotificationType } from '../notification/notification.component';
import { NotificationService } from '../notification.service';
import { NumberCardModule } from '@swimlane/ngx-charts';


export interface MainPageResult
{
  average_points : number,
  date : number,
  finalScore : number,
  max_point : number,
  resultId : string,
  resultType : string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  myFirm: MyFirm = {
    UserName: '',
    Region: '',
    Field: '',
    Workers: '',
    Sector: '',
    Capital: '',
    Revenue: ''
  };

  results : MainPageResult[] = []

  messages = [
    "Ez itt a főoldal!",
    "Itt tudsz majd új kérdőívet kitölteni vagy akár megnézni az előző kitöltéseidnek az eredményét!",
    "Fontos, hogy mielőtt új kérdőívet töltenél ki azelőtt meg kell adnod a céged adatai!"
  ]

  isLoading = false;

  constructor(private notiService : NotificationService,private quizResultService: QuizResultsService, private firmService: FirmsService, private router : Router) {

    afterNextRender(() => {
      this.quizResultService.getResultsForUser().subscribe(
        (result) => {
          this.results = result;
          console.log(this.results)
        }
      );
    })

  }

  saveToFirm() {

    this.isLoading = true;

    this.firmService.saveMyFirmData(this.myFirm).subscribe(
      (result) => {
        this.notiService.show("Cégadatok sikeresen mentve!", NotificationType.positivie)
        this.isLoading = false;
      }
    )
  }
 
  

  ngOnInit() {
    

    this.firmService.getFirmData().subscribe(
      (result : any) => {
        this.myFirm.Capital = result.capital
        this.myFirm.Revenue = result.revenue
        this.myFirm.Region = result.region
        this.myFirm.Workers = result.employees
        this.myFirm.Sector = result.sector
        this.myFirm.Field = result.field
      }
    );
    
  }


  

  checkFirmData()
  {
    if(this.myFirm == null || this.myFirm.Field == "" || this.myFirm.Region == "" || this.myFirm.Workers == "" || this.myFirm.Capital == "" || this.myFirm.Revenue == "" || this.myFirm.Sector == "")
      {
        this.notiService.show("Nincsenek kitöltve a cégadatok! Kérünk töltsd ki azokat először!", NotificationType.error)
      }
      else
      {
        this.router.navigate(['../quiz', ""])
      }
  }

}
