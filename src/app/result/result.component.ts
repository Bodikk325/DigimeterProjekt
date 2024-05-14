import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { ActivatedRoute} from '@angular/router';
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
      
      this.chatService.sendMessageResult(this.finalResult, this.firmAvaragePointByCategory, this.categoryMaxPoint,this.inputText, this.tabname).subscribe(response => {
        this.messages.push({ text: response.choices[0].message.content, user: false });
        this.isMessageLoading = false;
      });
      
      this.inputText = '';
    }
  }


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

  constructor(private chatService : ChatService,private chartService : ChartService,private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService, private dataService: DataService, private authService: AuthService, private countResultService: CountResultService) {
    this.messages.push(
      {
        text : "Kérdésed van az eredményekkel kapcsolatban? Nyugodtan tedd azt fel, segítek!", user : false
      }
    )
  }

  ngOnInit()
  {
    this.myFirm = this.firmService.getMyFirmData();
    this.loadQuestions("", "");
  }


  changeShowPoint(szures: string) {
    var fullPoints = 0;
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

        
        fullPoints += element.ShownPoint;

        this.sortedPoints.push(element)
      }
    });

    this.firmAvaragePointByCategory = fullPoints
  }

  filterQuestionsByNull(inputResult : Result) : Result
  {
    const filteredQuestions = inputResult.results.filter(q => q.maxpoint !== null);
    return {
      ...inputResult, // Az eredeti objektum más attribútumait megtartjuk
      results: filteredQuestions // Csak a szűrt kérdéseket tartalmazó tömböt állítjuk be
    };
  }


  loadQuestions(text: string, szures: string) {
    this.isloaded = false;
    this.sortedPoints = []
    this.firmService.getPoints().subscribe((res: Point[]) => {

      this.firmPoints = res;
      this.allResults = this.quizService.getQuizResults();
      this.currentResult = this.allResults.find(q => q.id == parseInt(this.route.snapshot.paramMap.get('id') ?? "0")) as Result;
      
      this.currentResult = this.filterQuestionsByNull(this.currentResult);


      this.finalResult = this.currentResult.totalPoints;

      if (text != "") {
        this.currentResult.results = this.currentResult.results.filter(x=> x.category == text)
        this.finalResult = this.currentResult.results.reduce((sum, question) => sum + question.points, 0);
      }

      const categoryResult = this.getTotalPointsByFirm(text);

      this.firmAvaragePointByCategory = categoryResult.otherpoint
      this.categoryMaxPoint = categoryResult.Maxpoint

      this.ids = this.currentResult.results.map((element) => element.questionId);

      this.changeShowPoint(szures);

      this.isloaded = true

      this.renderCharts();
    })
  }

  renderCharts()
  {
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
  
}
