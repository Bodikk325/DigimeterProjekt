import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { FirmsService, Point } from '../firms.service';
import { DataService } from '../data.service';
import { MyFirm } from '../myFirm';
import { AuthService } from '../auth.service';
import { CountResultService } from '../count-result.service';
import { Result, ResultQuestion } from '../result';

declare var ApexCharts: any;

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  myFirm!: MyFirm;


  allResults: Result[] = []
  points: number[] = []
  currentResult!: Result
  newResult : Result = {
    id: 0,
    totalPoints: 0,
    results: []
  }
  newResultQuestion : ResultQuestion[] = []
  isloaded = false;
  categoryMaxPoint = 0;
  firmAvaragePointByCategory = 0;
  sum: number = 0;
  selectedValue: string = "Összes";
  firmPoints: Point[] = [];
  comparisonPoints!: Point[];
  sortedAnswers!: Question[];
  sortedPoints: Point[] = [];
  finalResult : number = 0;
  ids: string[] = [];
  tabname = "";

  ngOnInit()
  {
    this.myFirm = this.firmService.getMyFirmData();
    this.loadQuestions("", "");
  }


  constructor(private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService, private dataService: DataService, private authService: AuthService, private countResultService: CountResultService) {
    

  }

  changeShowPoint(szures: string) {
    this.firmPoints.forEach(element => {
      if (this.ids.indexOf(element.questionId) !== -1) {

        element.ShownPoint = element.AvaragePoint;
        if (szures == "Regió") {
          element.ShownPoint = this.countResultService.FindWhichPointToShow(element, this.myFirm.Region);
        }
        if (szures == "Munkásszám") {
          element.ShownPoint = this.countResultService.FindWhichPointToShow(element, this.myFirm.Workers);
        }
        if (szures == "Szakma") {
          element.ShownPoint = this.countResultService.FindWhichPointToShow(element, this.myFirm.Field);
        }
        if (element.ShownPoint) {
          element.ShownPoint = Math.round(element.ShownPoint as number)
        }

        this.sortedPoints.push(element)
      }
    });
  }


  loadQuestions(text: string, szures: string) {
    this.isloaded = false;
    this.sortedPoints = []
    this.firmService.getPoints().subscribe((res: Point[]) => {

      this.firmPoints = res;
      this.allResults = this.quizService.getQuizResults();
      this.currentResult = this.allResults.find(q => q.id == parseInt(this.route.snapshot.paramMap.get('id') ?? "0")) as Result;

      this.finalResult = this.currentResult.totalPoints;

      if (text != "") {
        this.currentResult.results = this.currentResult.results.filter(x=> x.category == text)
        this.finalResult = this.currentResult.results.reduce((sum, question) => sum + question.points, 0);
      }

      const categoryResult = this.getTotalPointsByFirm(text);

      this.firmAvaragePointByCategory = categoryResult.otherpoint
      this.categoryMaxPoint = categoryResult.maxpoint
      
      console.log(this.finalResult)

      this.ids = this.currentResult.results.map((element) => element.questionId);

      this.changeShowPoint(szures);

      this.isloaded = true

    })
  }

  changeTab(tabName: string): void {
    this.tabname = tabName;
    this.selectedValue = "Összes"
    this.loadQuestions(tabName, this.tabname);
  }

  onSelect(newValue: string) {
    this.selectedValue = newValue;
    console.log(newValue)
    this.loadQuestions(this.tabname, newValue);
  }

  
  getTotalPointsByFirm(topicFilter: string): any {
    
    var filteredPoints = this.firmPoints;

    if (topicFilter == "") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("DIGIMÉTER_INDEX")
      );
    }

    if (topicFilter == "Digitális pénzügy") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("DIGITÁLIS_PÉNZÜGYEK")
      );
    }

    if (topicFilter == "Informatikai biztonság") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("INFORMATIKAI_BIZTONSÁG")
      );
    }

    if (topicFilter == "Vállalatvezetés") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("VÁLLALKOZÁSVEZETÉS")
      );
    }

    if (topicFilter == "Értékesítés és marketing") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("ÉRTÉKESÍTÉS_ÉS_MARKETING")
      );
    }

    if (topicFilter == "Digitális mindennapok") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("DIGITÁLIS_MINDENNAPOK")
      );
    }
    if (topicFilter == "Digitális Jelenlét") {
      filteredPoints = this.firmPoints.filter(question =>
        question.questionId.includes("DIGITÁLIS_JELENLÉT")
      );
    }
    const totalFirmPoints = filteredPoints[0].AvaragePoint;
    const maximumpoint = filteredPoints[0].Maxpoint;

    return {otherpoint: totalFirmPoints, maxpoint: maximumpoint };
  }
  
  

  /*
  RenderPieChart(tabname: string) {
    var result = this.getTotalPointsByTopic(this.question.results, tabname);

    var first1 = result.userPoint;
    var second1 = result.maxpoint - result.userPoint;

    var first2 = result.otherpoint;
    var second2 = result.maxpoint - result.otherpoint;



    var chartOptions = {
      series: [first1, second1], // Ide kerülnek az adatok
      colors: ['#3357FF', '#080729'],
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: ['A te eredményed', 'Fejlődési lehetőség'], // Adatcímkék
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    var chartOptions2 = {
      series: [first2, second2], // Ide kerülnek az adatok
      chart: {
        width: 380,
        type: 'pie',
      },
      colors: ['#3357FF', '#080729'],
      labels: ['Más cégek', 'Fejlődési lehetőség'], // Adatcímkék
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    const chart = new ApexCharts(document.querySelector("#piechart"), chartOptions);

    const chart2 = new ApexCharts(document.querySelector("#piechart2"), chartOptions2);

    chart.render();
    chart2.render();
  }

  calculateMaxPoint(): number {
    var maxPoint = 0

    this.question.results.forEach((element: any) => {
      maxPoint = maxPoint + element.maxpoint
    });

    return maxPoint;
  }


  RenderCharts() {
    var number = 0;
    this.question.results.forEach((element: any) => {
      var second = 0
      if (this.sortedPoints[number].ShownPoint != null) {
        if (this.isNumber(this.sortedPoints[number].ShownPoint)) {
          second = (((this.sortedPoints[number].ShownPoint) as number) / element.maxpoint) * 100;
        }
      }

      var first = (element.points / element.maxpoint) * 100;

      const options = {
        chart: {
          type: 'bar',
          toolbar: {
            show: false,
            autoSelected: 'zoom'
          }
        },
        series: [{
          name: 'pontszám',
          data: [first, second],
        }],
        yaxis: {
          labels: {
            formatter: function (value: any) {
              return (value).toFixed(0) + '%'; // Százalékban kifejezett érték
            }
          },
          min: 0, // Minimum érték
          max: 100, // Maximum érték
          tickAmount: 5 // Hány osztás legyen az Y-tengelyen
        },
        xaxis: {
          categories: ['Az ön vállalkozása', 'A többi cég a piacon'],
        },
        dataLabels: {
          enabled: true,
          formatter: function (val: any) {
            return (val).toFixed(0) + '%'; // Százalékban formázott értékek, két tizedesjeggyel
          },
          style: {
            colors: ['#fff'] // Adatcímkék színe
          }
        },
        plotOptions: {
          bar: {
            distributed: true, // Ez teszi lehetővé, hogy külön színe legyen minden oszlopnak
            columnWidth: '50%'
          }
        },
        colors: ['#3357FF', '#080729'], // Egyedi színek minden oszlophoz
        legend: {
          show: false // Itt tiltjuk le a jelmagyarázat megjelenését
        },
      };

      const chart = new ApexCharts(document.querySelector("#chart" + number), options);
      chart.render();
      number += 1;
    });
  }
  */


  
}
