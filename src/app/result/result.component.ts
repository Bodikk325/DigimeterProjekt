import { Component, afterNextRender } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { ActivatedRoute } from '@angular/router';
import { FirmsService, Point } from '../firms.service';
import { DataService } from '../data.service';
import { MyFirm } from '../myFirm';
import { AuthService } from '../auth.service';
import { CountResultService } from '../count-result.service';
import { Result, ResultQuestion } from '../result';
import { ChatService } from '../chat.service';
import { max } from 'rxjs';

export interface RegionData {
  id: string;
  max_point: number;
  average_points: number;
  Budapest: number;
  "Dél-Alföld": number;
  "Dél-Dunántúl": number;
  "Egyéb (közigazgatás, oktatás, egészségügy, szociális ellátás, művészet, egyéb szolgáltatás)": number;
  Feldolgozóipar: number;
  "Informatikai eszközt használó munkavállalók": number | null;
  "Információ, kommunikáció": number;
  Ingatlanügyek: number;
  "Kereskedelem, gépjárműjavítás": number;
  "Közép-Dunántúl": number;
  "Mezőgazdaság, bányászat": number;
  "Nyugat-Dunántúl": number;
  "Pest megye": number;
  "Pénzügyi, biztosítási tevékenység": number;
  "Szakmai, tudományos, műszaki tevékenység, könyvelés": number;
  "Szálláshely szolgálatatás, vendéglátás": number;
  "Szállítás/raktározás": number;
  "Villamosenergia-, gáz-, gőzellátás, légkondicionálás, vízellátás": number;
  Építőipar: number;
  "Észak-Alföld": number;
  "Észak-Magyarország": number;
  "5-9 fő": number;
  "10-19 fő": number;
  "20-49 fő": number;
  "50-249 fő": number;
  "Adminisztratív és szolgáltatást támogató tevékenység": number;
  [key: string]: number | string | null; // Index signature
}


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
  
  
  newResultQuestion: ResultQuestion[] = []
  categoryMaxPoint = 0;
  firmAvaragePointByCategory = 0;
  sum: number = 0;
  selectedValue: string = "Összes";
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
  isLoaded = false;


  constructor(private chatService: ChatService, private quizService: QuizResultsService, private route: ActivatedRoute, private firmService: FirmsService, private dataService: DataService, private authService: AuthService, private countResultService: CountResultService) {
    this.messages.push(
      {
        text: "Kérdésed van az eredményekkel kapcsolatban? Nyugodtan tedd azt fel, segítek!", user: false
      }
    )

    this.firmService.getFirmData().subscribe((res: any) => {

      this.myFirm.Region = res['region']
      this.myFirm.Workers = res['employees']
      this.myFirm.Field = res['field']
    })

  }

  ngOnInit()
  {
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
    this.isLoaded = false;
    this.quizService.getFinalResult(this.route.snapshot.paramMap.get('id') ?? "0", topic).subscribe(
      (result : Result) => {
        this.currentResult = result;
        console.log(this.currentResult)
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
          
          this.dataForPieChart1 = [
            { category: 'az ön cége', value: this.currentResult.finalScore },
            { category: 'fejlődési lehetőség', value: maxpoint - this.currentResult.finalScore  },
          ];
        
          this.dataForPieChart2 = [
            { category: 'konkurens cégek', value: avarage },
            { category: 'fejlődési lehetőség', value: maxpoint - avarage },
          ]; 

          this.isLoaded = true;

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
