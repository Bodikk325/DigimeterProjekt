import { Component, afterNextRender } from '@angular/core';
import { QuizResultsService } from '../services/quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { Result } from '../models/Result';
import { ResultQuestion } from '../models/ResultQuestion';
import { RegionData } from '../models/RegionData';
import { Question } from '../models/Question';
import { MyFirm } from '../models/MyFirm';
import { Point } from '../models/Point';
import { FirmsService } from '../services/firms.service';




@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  myFirm: MyFirm = {
    UserName: '',
    Region: '',
    Field: '',
    Workers: '',
    Sector: '',
    Capital: '',
    Revenue: ''
  };

  dataForPieChart1 = [
    { category: 'az ön cége', value: 0 },
    { category: 'fejlődési lehetőség', value: 0 },
  ];

  dataForPieChart2 = [
    { category: 'konkurens cégek', value: 0 },
    { category: 'fejlődési lehetőség', value: 0 },
  ];


  allResults: Result[] = []
  points: number[] = []

  isLoaded = false;

  newResultQuestion: ResultQuestion[] = []
  categoryMaxPoint = 0;
  firmAvaragePointByCategory = 0;
  sum: number = 0;
  selectedValue: string = "Összes";
  maxPoint = 0;
  firmPoints: Point[] = [];
  comparisonPoints!: Point[];
  regionData: RegionData = {
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
  }
  newResult: Result = {
    id: "0",
    results: [],
    time: "",
    resultType: "",
    finalScore: 0,
    compared_list: this.regionData
  }

  currentResult: Result = {
    compared_list: this.regionData,
    finalScore: 0,
    id: '',
    resultType: '',
    time: "",
    results: []
  }

  sortedAnswers!: Question[];
  sortedPoints: Point[] = [];
  finalResult: number = 0;
  ids: string[] = [];
  tabname = "";


  constructor(private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService) {
    this.messages.push(
      {
        text: "Kérdésed van az eredményekkel kapcsolatban? Nyugodtan tedd azt fel, segítek!", user: false
      }
    )

    afterNextRender(() => {
      this.firmService.getFirmData().subscribe((res: any) => {
        this.myFirm.Region = res['region']
        this.myFirm.Workers = res['employees']
        this.myFirm.Field = res['field']
      })
    })

  }

  ngOnInit() {
    this.subscribe("");
  }

  getMaxPoint(): number | string {
    const firstItem = this.currentResult?.compared_list?.[0];
    if (firstItem && typeof firstItem === 'object' && 'max_point' in firstItem) {
      return firstItem["maxpoint"];
    } else {
      return "default value";
    }
  }

  subscribe(topic: string) {
    this.isLoaded = true;
    this.quizService.getFinalResult(this.route.snapshot.paramMap.get('id') ?? "0", topic).subscribe(
      (result: Result) => {
        this.currentResult = result;
        // Ellenőrizd, hogy az eredmény tartalmazza a results tömböt
        if (Array.isArray(this.currentResult.results)) {
          ;
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

          this.dataForPieChart1 = [
            { category: 'az ön cége', value: this.currentResult.finalScore },
            { category: 'fejlődési lehetőség', value: maxpoint - this.currentResult.finalScore },
          ];

          this.dataForPieChart2 = [
            { category: 'konkurens cégek', value: avarage },
            { category: 'fejlődési lehetőség', value: maxpoint - avarage },
          ];

          

        } else {
          console.error("Invalid results format", this.currentResult.results);
        }
      },
      (error) => {
        console.error("Error fetching results", error);
      }
    );
  }



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


  changeTab(tabName: string): void {
    this.tabname = tabName;
    this.subscribe(tabName)

    this.selectedValue = "Összes"

  }

  onSelect(newValue: string) {
    this.selectedValue = newValue;
    this.changeShowPoint()
  }



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


}
