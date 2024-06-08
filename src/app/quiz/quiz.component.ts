import { Component, HostListener, afterNextRender } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { DataService } from '../data.service';
import { ChatService } from '../chat.service';
import { NotificationService } from '../notification.service';
import { NotificationType } from '../notification/notification.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Result } from '../result';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'] // Javított a styleUrl->styleUrls
})
export class QuizComponent {
  isMessageLoading = false;
  isChatVisible = false;
  messages: any[] = [];
  questionCount = 0;
  answered_questions = 0;
  inputText: string = '';
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  BQuestionNoAnswer = false;
  isQuizDone = false;
  private _currentQuestionIndex: number = 0;

  constructor(
    private dataService: DataService,
    private quizResultsService: QuizResultsService,
    private chatService: ChatService,
    private notiService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    afterNextRender(() => {
      localStorage.removeItem("A7answer")
    })
    this.messages.push({
      text: "Kérdésed van esetleg a válaszadással kapcsolatban? Ne habozz kérdezni, segítek ahol tudok!", user: false
    });
  }

  removeDuplicateAnswers(questions: Question[]): Question[] {
    return questions.map(question => {
      const uniqueAnswers = question.answers.filter((answer, index, self) =>
        index === self.findIndex(a => a.id === answer.id)
      );

      return {
        ...question,
        answers: uniqueAnswers
      };
    });
  }

  ngOnInit(): void {
    this.dataService.getQuestions(this.route.snapshot.paramMap.get('topic') ?? "").subscribe((res: Question[]) => {
      this.questions = this.removeDuplicateAnswers(res);
      this.filteredQuestions = this.removeDuplicateAnswers(res);
      console.log(this.filteredQuestions)
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

  }
  
  B14Change()
  {
    if(this.BQuestionNoAnswer)
      {
        this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = "Egyik sem"
      }
    else 
    {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined
    }
  }

  onRadioChange(currentQuestion : Question) {
    currentQuestion.textBoxAnswer = undefined;
  }

  onTextBoxChange(currentQuestion : Question)
  {
    console.log("textChange")
    currentQuestion.selectedAnswer = undefined
  }


  checkingTheConditions() {

    if(this.BQuestionNoAnswer && this.filteredQuestions[this.currentQuestionIndex].id == "B15")
      {
        this.questions = this.questions.filter(x=> x.id != "B16")
      }


    this.filteredQuestions = this.questions.filter(question => {
      if (question.based_on.length === 0) {
        return true;
      }

      const conditionsMet = question.based_on.every(basedOnId => {
        if(basedOnId == "A7")
          {
            if(localStorage.getItem("A7answer") == "0")
              {
                return false;
              }
          }
        const basedOnQuestion = this.questions.find(x => x.id === basedOnId);
        if (basedOnQuestion) {
          const selectedAnswers = Array.isArray(basedOnQuestion.selectedAnswer) ? basedOnQuestion.selectedAnswer : [basedOnQuestion.selectedAnswer];

          if (!selectedAnswers || selectedAnswers.length === 0 || selectedAnswers[0] == undefined) {
            // If selectedAnswer is null or empty, don't remove the question
            return true;
          }
          return selectedAnswers.some(answer => question.condition.includes(answer as string));
        }
        return true;
      });

      if (conditionsMet) {
        return true;
      } else {
        this.notiService.show("Pár kérdés eltávolításra került a válaszaid alapján!", NotificationType.information)
        return false;
      }
    });
  }


  checkTheNumberFormatForQuestions() : boolean
  {
    if(this.filteredQuestions[this.currentQuestionIndex].id == "A7")
      {
        
        if(isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer)))
          {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
        localStorage.setItem("A7answer", this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer ?? "0")
      }

    if(this.filteredQuestions[this.currentQuestionIndex].id == "D2")
      {
        if(isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer)))
          {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
      }

      if(this.filteredQuestions[this.currentQuestionIndex].id == "A8")
        {
          if(isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer)))
            {
              this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
              return false;
            }
        }
        
    if(this.filteredQuestions[this.currentQuestionIndex].id == "D10")
      {
        if(isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer)))
          {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
        else 
        {
          if(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) > 100 || Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) < 0)
            {
              this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
              return false;
            }
        }
      }
    if(this.filteredQuestions[this.currentQuestionIndex].id == "G4")
      {
        if(isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer)))
          {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
        else 
        {
          if(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) > 100 || Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) < 0)
            {
              this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
              return false;
            }
        }
      }
      return true;
  }

  nextQuestion(): void {

    if(!this.checkTheNumberFormatForQuestions())
      {
        return;
      }

    this.quizResultsService.saveQuizResults(this.filteredQuestions);

    this.checkingTheConditions();

    this.BQuestionNoAnswer = false;

    this.currentQuestionIndex++

    if (this.currentQuestionIndex == this.filteredQuestions.length) {
      this.isQuizDone = true;
      this.quizResultsService.saveQuizResultsAtTheEnd(this.filteredQuestions, this.route.snapshot.paramMap.get('topic') ?? "");
    }

    // Ellenőrizd, hogy a második kérdésnél vagyunk-e (index 1)
    /* if (this.currentQuestionIndex === 2) { // Második kérdés utáni index
        this.allowNavigation = true;
        this.router.navigateByUrl(""); // Navigáció a második kérdés után
    } else {
        this.allowNavigation = false;
    } */
  }

  canMoveToTheNextQuestion(): boolean {
    return !!this.filteredQuestions[this.currentQuestionIndex]?.selectedAnswer || !!this.filteredQuestions[this.currentQuestionIndex]?.textBoxAnswer;
  }

  allowNavigation = false;

  textInput: string | null = null;

  onTextChange(value: string): void {
    this.textInput = value === '' ? null : value;
    this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = this.textInput ?? undefined;
    
  }

  updateSelectedAnswers(question: Question, answer: { id: string, points: number, selected?: boolean }): void {
    if (!question.selectedAnswer) {
      question.selectedAnswer = [];
    }

    if (answer.selected && !(question.selectedAnswer as string[]).includes(answer.id)) {
      (question.selectedAnswer as string[]).push(answer.id);
    } else if (!answer.selected) {
      question.selectedAnswer = (question.selectedAnswer as string[]).filter(a => a !== answer.id);
      // Remove selectedAnswer property if the array is empty
      if ((question.selectedAnswer as string[]).length === 0) {
        delete question.selectedAnswer;
      }
    }
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

}
