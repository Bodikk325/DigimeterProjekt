import { Component, ViewChild, afterNextRender } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { FirmsService, Point } from '../firms.service';
import { DataService } from '../data.service';
import { MyFirm } from '../myFirm';
import { AuthService } from '../auth.service';

declare var ApexCharts: any;

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  myFirm!: MyFirm;

  questions: any[] = []
  points: number[] = []
  question: any;
  isloaded = false;
  sum: number = 0;
  quizService!: QuizResultsService;
  selectedValue: string = "Összes";
  firmPoints: Point[] = [];
  comparisonPoints!: Point[];
  sortedAnswers!: Question[];
  sortedPoints: Point[] = [];
  ids: string[] = [];
  tabname = "";

  ngOnInit()
  {
    this.myFirm = this.firmService.getMyFirmData();
  }




  constructor(quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService, private dataService: DataService, private authService: AuthService) {
    afterNextRender(() => {
      this.quizService = quizService;
      this.myFirm = this.firmService.getMyFirmData();
      this.loadQuestions("", "");

      setTimeout(() => {
        this.RenderCharts();
        this.RenderPieChart("");
      }, 1000);

    })

  }

  isNumber(value: any): value is number {
    return typeof value === 'number';
  }

  getTotalPointsByTopic(questions: any[], topicFilter: string): any {
    // Szűrjük a kérdéseket a kérdés szövege alapján, ami tartalmazza a témakört
    const filteredQuestions = questions.filter(question =>
      question.category.includes(topicFilter)
    );

    // Összegzünk minden releváns kérdés pontját
    const totalPoints = filteredQuestions.reduce((sum, question) => sum + question.points, 0);



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

    return { userPoint: totalPoints, otherpoint: totalFirmPoints, maxpoint: maximumpoint };
  }

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


  findBudapestProperty(point: Point, text: string): number | string | undefined {

    // Végigmegyünk a point objektum kulcsain
    for (const key of Object.keys(point)) {

      // Ellenőrizzük, hogy a kulcs tartalmazza-e a "Budapest" szót
      if (key.includes(text)) {
        return point[key as keyof Point];  // Visszatérünk a kulccsal, ha megtaláltuk
      }
    }
    return 0;  // Visszatérünk null-lal, ha nem találtuk meg
  }

  loadQuestions(text: string, szures: string) {
    this.sortedPoints = []
    this.firmService.getPoints().subscribe((res: Point[]) => {
      this.firmPoints = res;
      this.questions = this.quizService.getQuizResults();
      this.question = this.questions.find(q => q.id == this.route.snapshot.paramMap.get('id'));
      if (text != "") {
        this.question = this.filterQuestionsByCategory(text);
      }
      this.ids = this.question.results.map((element: any) => element.questionId);

      this.firmPoints.forEach(element => {
        if (this.ids.indexOf(element.questionId) !== -1) {
          element.ShownPoint = element.AvaragePoint;
          if (szures == "Regió") {
            element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Region);
          }
          if (szures == "Munkásszám") {
            element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Workers);
          }
          if (szures == "Szakma") {
            element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Field);
          }

          if (element.ShownPoint) {
            element.ShownPoint = Math.round(element.ShownPoint as number)
          }

          this.sortedPoints.push(element)
        }
      });

      this.questions.forEach(element => {
        this.points.push(this.getPointsForSelectedAnswer(element.id))
      });

      this.sum = this.points.reduce((acc, cur) => acc + cur, 0);
      this.isloaded = true
    })

  }

  getPointsForSelectedAnswer(questionId: number): number {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return 0;

    if (question.isThereMoreThanOneAnswer && Array.isArray(question.selectedAnswer)) {
      const selectedAnswers = question.selectedAnswer as string[];
      const points = selectedAnswers.reduce((acc, answer) => {
        const answerOption = question.answers.find((a: any) => a.answer === answer);
        return acc + (answerOption ? answerOption.points : 0);
      }, 0);
      return Math.min(points, question.maxpoint);
    } else if (question.selectedAnswer) {
      const selectedAnswerOption = question.answers.find((a: any) => a.answer === question.selectedAnswer);
      return selectedAnswerOption ? selectedAnswerOption.points : 0;
    }
    return 0;
  }

  selectAnswer(questionId: number, answer: string, multiSelect: boolean): void {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return;

    if (multiSelect && question.isThereMoreThanOneAnswer) {
      question.selectedAnswer = question.selectedAnswer || [];
      if ((question.selectedAnswer as string[]).includes(answer)) {
        question.selectedAnswer = (question.selectedAnswer as string[]).filter(a => a !== answer);
      } else {
        (question.selectedAnswer as string[]).push(answer);
      }
    } else {
      question.selectedAnswer = answer;
    }
  }

  filterQuestionsByCategory(category: string) {
    // Creating a new filtered object
    const filteredData = {
      id: this.question.id, // keep the original id
      totalPoints: 0, // we will calculate this based on filtered results
      results: this.question.results.filter((item: any) => item.category === category)
    };

    // Calculate the total points for the filtered results
    filteredData.totalPoints = filteredData.results.reduce((sum: any, current: { points: any; }) => sum + current.points, 0);

    return filteredData;
  }

  changeTab(tabName: string): void {
    this.tabname = tabName;
    this.selectedValue = "Összes"
    this.loadQuestions(tabName, this.tabname);
    setTimeout(() => {
      this.RenderCharts();
      this.RenderPieChart(tabName);
    }, 300);
  }

  onSelect(newValue: string) {
    this.selectedValue = newValue;
    this.loadQuestions(this.tabname, newValue);
    /*
    setTimeout(() => {
      this.RenderCharts();
    }, 300);
    */
  }
}
