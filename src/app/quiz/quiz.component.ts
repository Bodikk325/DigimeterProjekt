import { Component, HostListener } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { DataService } from '../data.service';
import { ChatService } from '../chat.service';
import { NotificationService } from '../notification.service';
import { NotificationType } from '../notification/notification.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'] // Javított a styleUrl->styleUrls
})
export class QuizComponent {

  

  isMessageLoading = false;
  isChatVisible = false;

  messages: any[] = [];
  inputText: string = '';
  questions: Question[] = [];
  private _currentQuestionIndex: number = 0;

  constructor(
    private dataService: DataService,
    private quizResultsService: QuizResultsService,
    private chatService: ChatService,
    private notiService: NotificationService,
    private route: ActivatedRoute,
    private router : Router
  ) {
    this.messages.push({
      text: "Kérdésed van esetleg a válaszadással kapcsolatban? Ne habozz kérdezni, segítek ahol tudok!", user: false
    });
  }

  ngOnInit(): void {

    this.dataService.getQuestions(this.route.snapshot.paramMap.get('topic') ?? "").subscribe((res: Question[]) => {
      this.questions = res
    });
  }

  get currentQuestionIndex(): number {
    return this._currentQuestionIndex;
  }

  set currentQuestionIndex(value: number) {
    this._currentQuestionIndex = value;
    this.onVariableChange(value);
  }

  onVariableChange(value: number) {
    if (!this.shouldShowQuestion()) {
      this.currentQuestionIndex++;
    }
  }


  shouldShowQuestion() {
    var boolean = true;
    var results = [];
    const currentQuestion = this.questions[this.currentQuestionIndex];
  
    if (currentQuestion.based_on != null) {
      // Iterate over each question that the current question is based on
      for (let index = 0; index < currentQuestion.based_on.length; index++) {
        // Get the result for the based_on question
        var cucc = this.quizResultsService.getContinuedResults().results.filter(x => x.questionId == currentQuestion.based_on[index]);
        results.push(cucc[0]);
      }
  
      // Iterate over each condition that must be satisfied
      for (let index = 0; index < currentQuestion.condition.length; index++) {
        const condition = currentQuestion.condition[index];
        if (condition === ">0") {
          if (parseInt(results[index].selectedAnswer[0]) == 0) {
            boolean = false;
            break;
          }
        } else {
          // Check if the selected answer contains the condition
          if (!results[index].selectedAnswer.includes(condition)) {
            boolean = false;
            break;
          }
        }
      }
    }
    return boolean;
  }


  toggleChat(event: MouseEvent): void {
    event.stopPropagation();
    this.isChatVisible = !this.isChatVisible;
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isChatVisible) return;
    const container = document.querySelector('.chat-container');
    if (event.target instanceof Node && !container!.contains(event.target)) {
      this.isChatVisible = false;
    }
  }

  sendMessage(): void {
    if (this.inputText.trim()) {
      this.messages.push({ text: this.inputText, user: true });
      this.isMessageLoading = true;
      this.chatService.sendMessageQuestion(this.inputText, this.questions[this.currentQuestionIndex].category, this.questions[this.currentQuestionIndex].question).subscribe(response => {
        this.messages.push({ text: response.choices[0].message.content, user: false });
        this.isMessageLoading = false;
      });
      this.inputText = '';
    }
  }

  nextQuestion(): void {
    // Ellenőrzés a textboxra és szám formátumú válaszra
    if (this.questions[this.currentQuestionIndex].answers.filter(x => x.contains_Textbox).length != 0) {
        if (!isNaN(Number(this.questions[this.currentQuestionIndex].selectedAnswer))) {
            localStorage.setItem("A7", this.questions[this.currentQuestionIndex].selectedAnswer as string);
        } else {
            this.notiService.show("Please provide a numeric answer!", NotificationType.error);
            return;
        }
    }

    // Mentés a quiz végén
    if (this.currentQuestionIndex === this.questions.length - 1) {
        this.quizResultsService.saveQuizResultsAtTheEnd(this.questions);
    }

    // Mentés a kérdések állapotának
    this.quizResultsService.saveQuizResults(this.questions);

    const currentQuestion = this.questions[this.currentQuestionIndex];

    // Lépj a következő kérdésre, ha van válasz
    if (currentQuestion.selectedAnswer) {
        this.currentQuestionIndex++;
    } else {
        this.notiService.show("Please answer the question!", NotificationType.error);
        return;
    }

    // Ellenőrizd, hogy a második kérdésnél vagyunk-e (index 1)
    if (this.currentQuestionIndex === 2) { // Második kérdés utáni index
        this.allowNavigation = true;
        this.router.navigateByUrl(""); // Navigáció a második kérdés után
    } else {
        this.allowNavigation = false;
    }
}

  canMoveToNextQuestion(): boolean {
    return !!this.questions[this.currentQuestionIndex]?.selectedAnswer;
  }

  updateSelectedAnswers(question: Question, answer: { answer: string, points: number, selected?: boolean }): void {
    if (!question.selectedAnswer) {
      question.selectedAnswer = [];
    }

    if (answer.selected && !(question.selectedAnswer as string[]).includes(answer.answer)) {
      (question.selectedAnswer as string[]).push(answer.answer);
    } else if (!answer.selected) {
      question.selectedAnswer = (question.selectedAnswer as string[]).filter(a => a !== answer.answer);
    }
  }


  allowNavigation = false;

  canDeactivate(): Observable<boolean> | boolean {
    if (this.allowNavigation) {
      return true;
    }
    const confirmDeactivate = window.confirm('Are you sure you want to leave this page?');
    return of(confirmDeactivate);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (!this.allowNavigation) {
      const confirmationMessage = 'Are you sure you want to reload this page?';
      $event.returnValue = confirmationMessage; // A legtöbb böngésző figyelmen kívül hagyja ezt.
      return confirmationMessage;
    }
    else 
    {
      return ""
    }
  }

  // Ezt a metódust hívd meg amikor a gombot megnyomod
  enableNavigation() {
    this.allowNavigation = true;
  }

}