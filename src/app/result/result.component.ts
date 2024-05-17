import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { FirmsService, Point } from '../firms.service';
import { DataService } from '../data.service';
import { MyFirm } from '../myFirm';
import { AuthService } from '../auth.service';
import { CountResultService } from '../count-result.service';
import { Result, ResultQuestion } from '../result';
import { ChartService } from '../chart.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  myFirm!: MyFirm;

  isMessageLoading = false;

  isChatVisible = false;

  toggleChat(event: MouseEvent) {
    event.stopPropagation(); // Megállítjuk az esemény terjedését
    this.isChatVisible = !this.isChatVisible;
  }

  onDocumentClick(event: MouseEvent) {
    if (!this.isChatVisible) return;
    const container = document.querySelector('.chat-container');
    if (event.target instanceof Node && !container!.contains(event.target)) {
      this.isChatVisible = false;
    }
  }

  messages: any[] = [];
  inputText: string = '';

  sendMessage(): void {
    if (this.inputText.trim()) {
      this.messages.push({ text: this.inputText, user: true });
      this.isMessageLoading = true;

      this.chatService.sendMessageResult(this.finalResult, this.firmAvaragePointByCategory, this.categoryMaxPoint, this.inputText, this.tabname).subscribe(response => {
        this.messages.push({ text: response.choices[0].message.content, user: false });
        this.isMessageLoading = false;
      });

      this.inputText = '';
    }
  }


  allResults: Result[] = []
  points: number[] = []
  currentResult!: Result
  newResult: Result = {
    id: 0,
    totalPoints: 0,
    results: []
  }
  newResultQuestion: ResultQuestion[] = []
  isloaded = false;
  categoryMaxPoint = 0;
  firmAvaragePointByCategory = 0;
  sum: number = 0;
  selectedValue: string = "Összes";
  firmPoints: Point[] = [];
  comparisonPoints!: Point[];
  sortedAnswers!: Question[];
  sortedPoints: Point[] = [];
  finalResult: number = 0;
  ids: string[] = [];
  tabname = "";

  constructor(private chatService: ChatService, private chartService: ChartService, private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService, private dataService: DataService, private authService: AuthService, private countResultService: CountResultService) {
    this.messages.push(
      {
        text: "Kérdésed van az eredményekkel kapcsolatban? Nyugodtan tedd azt fel, segítek!", user: false
      }
    )
  }

  ngOnInit() {
    this.myFirm = this.firmService.getMyFirmData();
    this.loadQuestions("", "");
  }


  changeShowPoint(szures: string) {
    var fullPoints = 0;
    for (let index = 0; index < this.firmPoints.length; index++) {
      this.firmPoints[index].ShownPoint = this.firmPoints[index].AvaragePoint;

      if (szures == "Regió") {
        this.firmPoints[index].ShownPoint = this.countResultService.FindWhichPointToShow(this.firmPoints[index], this.myFirm.Region);
      }
      if (szures == "Munkásszám") {
        this.firmPoints[index].ShownPoint = this.countResultService.FindWhichPointToShow(this.firmPoints[index], this.myFirm.Workers);
      }
      if (szures == "Szakma") {
        this.firmPoints[index].ShownPoint = this.countResultService.FindWhichPointToShow(this.firmPoints[index], this.myFirm.Field);
      }


     
      fullPoints += this.firmPoints[index].ShownPoint;

      this.sortedPoints.push(this.firmPoints[index])

    }
    if (this.tabname != "") {
      this.firmAvaragePointByCategory = fullPoints
    }
  }

  calculateFinalResult(page: string) {
    this.finalResult = this.calculateDigimeterIndex();
    if (page != "") {
      this.currentResult.results = this.currentResult.results.filter(x => x.category == page)
      this.finalResult = this.currentResult.results.reduce((sum, question) => sum + question.points, 0);
    }
  }

  getCurrentResult() {
    this.allResults = this.quizService.getQuizResults();
    this.currentResult = this.allResults.find(q => q.id == parseInt(this.route.snapshot.paramMap.get('id') ?? "0")) as Result;
    this.currentResult.results = this.currentResult.results.filter(x => x.questionId != "B14" && x.questionId != "B15" && x.questionId != "B16")
  }


  loadQuestions(page: string, comboBoxSelected: string) {
    this.isloaded = false;
    this.sortedPoints = []
    this.firmService.getPoints().subscribe((res: Point[]) => {


      this.firmPoints = res.filter(x => x.Maxpoint != null);

      this.getCurrentResult();

      this.currentResult.results = this.currentResult.results.filter(x => x.maxpoint != null)

      this.calculateFinalResult(page)

      const categoryResult = this.getTotalPointsByFirm(page);

      this.firmAvaragePointByCategory = categoryResult.otherpoint
      this.categoryMaxPoint = categoryResult.maxpoint

      this.currentResult.results = this.currentResult.results.filter(item1 =>
        this.firmPoints.some(item2 => item1.questionId === item2.questionId)
      );

      this.firmPoints = this.firmPoints.filter(item2 =>
        this.currentResult.results.some(item1 => item2.questionId === item1.questionId)
      );

      this.currentResult.results = this.currentResult.results.sort((a, b) => a.questionId.localeCompare(b.questionId));
      this.firmPoints = this.firmPoints.sort((a, b) => a.questionId.localeCompare(b.questionId));

      this.changeShowPoint(comboBoxSelected);

      this.isloaded = true

      this.renderCharts();
    })
  }

  renderCharts() {
    setTimeout(() => {
      this.chartService.RenderCharts(this.currentResult.results, this.sortedPoints)
      this.chartService.RenderPieChart(this.finalResult, this.categoryMaxPoint, this.firmAvaragePointByCategory);
    }, 500);
  }

  changeTab(tabName: string): void {
    this.tabname = tabName;
    this.selectedValue = "Összes"
    this.loadQuestions(tabName, this.tabname);
  }

  onSelect(newValue: string) {
    this.selectedValue = newValue;
    this.loadQuestions(this.tabname, newValue);
  }

  calculateDigimeterIndex() : number {
    console.log(this.currentResult.results)
    var osszeg1 = this.currentResult.results.filter(x => x.category == "Digitális pénzügy").reduce((sum, score) => sum += score.points , 0) * 0.16
    var osszeg2 = this.currentResult.results.filter(x => x.category == "Informatikai biztonság").reduce((sum, score) => sum += score.points , 0) * 0.11
    var osszeg3 = this.currentResult.results.filter(x => x.category == "Vállalatvezetés").reduce((sum, score) => sum += score.points , 0) * 0.16
    var osszeg4 = this.currentResult.results.filter(x => x.category == "Értékesítés és marketing").reduce((sum, score) => sum += score.points , 0) * 0.19
    var osszeg5 = this.currentResult.results.filter(x => x.category == "Digitális Jelenlét").reduce((sum, score) => sum += score.points , 0) * 0.19
    var osszeg6 = this.currentResult.results.filter(x => x.category == "Digitális mindennapok").reduce((sum, score) => sum += score.points , 0) * 0.19

    return osszeg1 + osszeg2 + osszeg3 + osszeg4 + osszeg5 + osszeg6;
  }


  getTotalPointsByFirm(topicFilter: string): any {

    var list = ["DIGIMÉTER_INDEX", "DIGITÁLIS_PÉNZÜGYEK", "INFORMATIKAI_BIZTONSÁG", "VÁLLALKOZÁSVEZETÉS", "ÉRTÉKESÍTÉS_ÉS_MARKETING",
      "ÉRTÉKESÍTÉS_ÉS_MARKETING", "DIGITÁLIS_MINDENNAPOK", "DIGITÁLIS_JELENLÉT"
    ]

    var digimeterIndex = 0;

    list.forEach(tema => {
      if (tema == "DIGITÁLIS_PÉNZÜGYEK") {
        digimeterIndex += this.firmPoints.filter(question => question.questionId.includes("DIGIMÉTER_INDEX"))[0].AvaragePoint * 0.16
      }
      else if (tema == "INFORMATIKAI_BIZTONSÁG") {
        digimeterIndex += this.firmPoints.filter(question => question.questionId.includes("INFORMATIKAI_BIZTONSÁG"))[0].AvaragePoint * 0.11
      }
      else if (tema == "VÁLLALKOZÁSVEZETÉS") {
        digimeterIndex += this.firmPoints.filter(question => question.questionId.includes("INFORMATIKAI_BIZTONSÁG"))[0].AvaragePoint * 0.16
      }
      else {
        digimeterIndex += this.firmPoints.filter(question => question.questionId.includes(tema))[0].AvaragePoint * 0.19
      }
    });



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
    var maximumpoint = filteredPoints[0].Maxpoint;

    if (topicFilter == ""
    ) {
      digimeterIndex = Math.floor(digimeterIndex)
      return { otherpoint: digimeterIndex, maxpoint: maximumpoint };
    }
    else {
      return { otherpoint: totalFirmPoints, maxpoint: maximumpoint };
    }

  }

}
