import { Component, afterNextRender } from '@angular/core';
import { Question, QuizService } from '../quiz.service';
import { ActivatedRoute } from '@angular/router';
import { FirmsService, Point } from '../firms.service';
import { DataService } from '../data.service';
import { MyFirm } from '../myFirm';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  myFirm: MyFirm = {
    Region: '',
    Field: '',
    Workers: ''
  };

  questions : any[] = []
  points : number[] = []
  question : any;
  isloaded = false;
  sum : number = 0;
  quizService! : QuizService;
  selectedValue: string = "Összes";
  firmPoints : Point[] = [];
  comparisonPoints! : Point[];
  sortedAnswers!: Question[];
  sortedPoints: Point[] = [];
  ids : number[] = [];
  tabname = "";

  

  readFromFirm() {
    const data = localStorage.getItem('myFirm');
    if (data) {
      this.myFirm = JSON.parse(data);
    } else {
      alert('No data found.');
    }
  }


  constructor(quizService : QuizService, private route: ActivatedRoute, private firmService : FirmsService,private dataService: DataService) {
    afterNextRender(() => {
      this.quizService = quizService;
      this.readFromFirm();
      this.loadQuestions("", "");
    })
  }

  
  findBudapestProperty(point: Point, text : string): number {
    // Végigmegyünk a point objektum kulcsain
    for (const key of Object.keys(point)) {
      // Ellenőrizzük, hogy a kulcs tartalmazza-e a "Budapest" szót
      if (key.includes(text)) {
        return point[key as keyof Point];  // Visszatérünk a kulccsal, ha megtaláltuk
      }
    }
    return 0;  // Visszatérünk null-lal, ha nem találtuk meg
  }

  loadQuestions(text : string, szures : string)
  {
    this.sortedPoints = []
    this.firmPoints = this.firmService.getFirmPoints();
    this.questions = this.quizService.getQuizResults();
    this.question = this.questions.find(q=>q.id == this.route.snapshot.paramMap.get('id'));
    if(text != "")
      {
        this.question = this.filterQuestionsByCategory(text);
      }
      this.ids = this.question.results.map((element:any) => element.questionId);

    this.firmPoints.forEach(element => {
      if( this.ids.indexOf(element.questionId) !== -1)
        {
          element.ShownPoint = element.Osszpont;
          if(szures == "Regió")
            {
              
              element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Region);
            }
          if(szures == "Munkásszám")
            {
              element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Workers);
            }
          if(szures == "Szakma")
            {
              element.ShownPoint = this.findBudapestProperty(element, this.myFirm.Field);
            }
          
          this.sortedPoints.push(element)
        }
    });

    this.questions.forEach(element => {
      this.points.push(this.getPointsForSelectedAnswer(element.id))
    });


    this.sum = this.points.reduce((acc, cur) => acc + cur, 0);
    this.isloaded = true
  }

  getPointsForSelectedAnswer(questionId: number): number {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) return 0;

    if (question.isThereMoreThanOneAnswer && Array.isArray(question.selectedAnswer)) {
      const selectedAnswers = question.selectedAnswer as string[];
      const points = selectedAnswers.reduce((acc, answer) => {
        const answerOption = question.answers.find((a : any) => a.answer === answer);
        return acc + (answerOption ? answerOption.points : 0);
      }, 0);
      return Math.min(points, question.maxpoint);
    } else if (question.selectedAnswer) {
      const selectedAnswerOption = question.answers.find((a:any) => a.answer === question.selectedAnswer);
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
      results: this.question.results.filter((item : any) => item.category === category)
    };
  
    // Calculate the total points for the filtered results
    filteredData.totalPoints = filteredData.results.reduce((sum: any, current: { points: any; }) => sum + current.points, 0);
  
    return filteredData;
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

  
}
