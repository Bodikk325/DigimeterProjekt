import { Component, afterNextRender } from '@angular/core';
import { QuizResultsService } from '../services/quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { Result } from '../models/Result';
import { Question } from '../models/Question';
import { MyFirm } from '../models/MyFirm';
import { FirmsService } from '../services/firms.service';
import { DataForPieCharts } from '../models/DataForPieCharts';
import { Subscription } from 'rxjs';
import { AiChatMessages } from '../models/AiChatMessages';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  getFirmDataSubscription!: Subscription;
  getFinalResultSubscription!: Subscription;

  myFirm: MyFirm;

  dataForPieChart1: DataForPieCharts[];
  dataForPieChart2: DataForPieCharts[];

  allResults: Result[];
  isLoaded: boolean;
  achievedPercentageForAI : number;
  avaragePercentageForAI : number;
  selectedValue: string;
  maxPoint: number;
  currentResult: Result;
  sortedAnswers!: Question[];
  tabname: string;
  isMessageLoading: boolean;
  isChatVisible: boolean;

  messages: AiChatMessages[];


  constructor(private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService) {
    this.messages = [
      {
        text: "Kérdése van az eredményekkel kapcsolatban? Nyugodtan tegye azt fel, segítek!", user: false
      }
    ]

    this.achievedPercentageForAI = 0;
    this.avaragePercentageForAI = 0;

    this.isMessageLoading = false;
    this.isChatVisible = false;

    this.tabname = ""

    this.currentResult = {
      compared_list: {
        id: '',
        max_point: 0,
        average_points: 0,
        Budapest: 0,
        'Dél-Alföld': 0,
        'Dél-Dunántúl': 0,
        'Egyéb (közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatás)': 0,
        Feldolgozóipar: 0,
        'Informatikai eszközt használó munkavállalók': null,
        'Információ, kommunikáció': 0,
        Ingatlanügyek: 0,
        'Kereskedelem, gépjárműjavítás': 0,
        'Közép-Dunántúl': 0,
        'Mezőgazdaság, bányászat': 0,
        'Nyugat-Dunántúl': 0,
        'Pest megye': 0,
        'Pénzügyi, biztosítási tevékenység': 0,
        'Szakmai, tudományos, műszaki tevékenység, könyvelés': 0,
        'Szálláshely szolgálatatás, vendéglátás': 0,
        'Szállítás/raktározás': 0,
        'Villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátás': 0,
        Építőipar: 0,
        'Észak-Alföld': 0,
        'Észak-Magyarország': 0,
        '5-9 fő': 0,
        '10-19 fő': 0,
        '20-49 fő': 0,
        '50-249 fő': 0,
        'Adminisztratív és szolgáltatást támogató tevékenység': 0
      },
      finalScore: 0,
      id: '',
      resultType: '',
      time: "",
      results: []
    }

    this.dataForPieChart1 = [
      { category: 'az ön cége digitális jelenlétének fejlettsége', value: 0 },
      { category: 'fejlődési lehetőség', value: 0 },
    ];

    this.dataForPieChart2 = [
      { category: 'konkurens cégek digitális jelenlétének fejlettsége', value: 0 },
      { category: 'fejlődési lehetőség', value: 0 },
    ];

    this.allResults = []

    this.selectedValue = "Összes";

    this.myFirm = {
      UserName: '',
      Region: '',
      Field: '',
      Workers: '',
      Sector: '',
      Capital: '',
      Revenue: ''
    };

    this.maxPoint = 0;

    this.isLoaded = false;

    this.getFirmDataSubscription = this.firmService.getFirmData().subscribe((res: any) => {
      this.myFirm.Region = res['region']
      this.myFirm.Workers = res['employees']
      this.myFirm.Field = res['field']
    })

    this.getResults("");

  }

  //#region for get the results from the server 

  getResults(topic: string) {
    this.isLoaded = true;
    this.getFinalResultSubscription = this.quizService.getFinalResult(this.route.snapshot.paramMap.get('id') ?? "0", topic).subscribe(
      {
        next: (result: Result) => {
          this.currentResult = result;
          if (Array.isArray(this.currentResult.results)) {
            this.optimizeResults();
          }
        }
      }
    )
  }

  optimizeResults() {

    this.changeShowPoint();

    var maxpoint = 0;
    var avarage = 0;

    const firstItem = this.currentResult?.compared_list?.[0];
    if (firstItem && typeof firstItem === 'object' && 'max_point' in firstItem) {
      maxpoint = firstItem["max_point"]
      avarage = firstItem["average_points"]
    }

    this.maxPoint = maxpoint;

    this.isLoaded = false;

    this.achievedPercentageForAI = parseInt(((this.currentResult.finalScore / maxpoint) * 100).toFixed(0)) ;
    this.avaragePercentageForAI =  parseInt(((avarage / maxpoint) * 100).toFixed(0));

    this.dataForPieChart1 = [
      { category: 'az ön cége digitális jelenlétének fejlettsége', value: this.currentResult.finalScore },
      { category: 'fejlődési lehetőség', value: maxpoint - this.currentResult.finalScore },
    ];

    this.dataForPieChart2 = [
      { category: 'konkurens cégek digitális jelenlétének fejlettsége', value: avarage },
      { category: 'fejlődési lehetőség', value: maxpoint - avarage },
    ];
  }

  //#endregion


  //#region change the showed point based on the selected combobox item on the top

  changeShowPoint() {
    this.currentResult.results.forEach(result => {
      if (this.selectedValue == "Összes") {
        result.shownPoint = result.regionData.average_points;
      }
      else if (this.selectedValue == "Szakma") {
        result.shownPoint = result.regionData[this.myFirm.Field] as number;
      }
      else if (this.selectedValue == "Munkásszám") {
        result.shownPoint = result.regionData[this.myFirm.Workers] as number;
      }
      else if (this.selectedValue == "Regió") {
        result.shownPoint = result.regionData[this.myFirm.Region] as number;
      }
    });
  }


  //#region navigation functions

  changeTab(tabName: string): void {
    this.tabname = tabName;
    this.getResults(tabName)
    this.selectedValue = "Összes"
  }

  onSelect(newValue: string) {
    this.selectedValue = newValue;
    this.changeShowPoint()
  }

  //#endregion

}
