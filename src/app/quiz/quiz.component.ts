import { Component, HostListener, afterNextRender } from '@angular/core';
import { QuizResultsService } from '../services/quizResults.service';
import { ChatService } from '../services/chat.service';
import { NotificationType } from '../notification/notification.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '../models/Question';
import { CanComponentDeactivate } from '../pending-changes-guard.guard';
import { DataService } from '../services/data.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'] // Javított a styleUrl->styleUrls
})
export class QuizComponent implements CanComponentDeactivate {

  questionCount = 0;
  answered_questions = 0;

  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  BQuestionNoAnswer = false;
  removedQuestions = false;
  isQuizInProgress = true;
  isLoaded = false;
  currentQuestionIndex: number = 0;

  constructor(
    private dataService: DataService,
    private quizResultsService: QuizResultsService,
    private notiService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    afterNextRender(() => {
      localStorage.removeItem("A7answer")
    })
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
    if ((this.route.snapshot.paramMap.get('topic') ?? "") == "Continue") {
      this.authService.getContQuiz().subscribe(
        {
          next: (quiz) => {
            console.log(JSON.parse(quiz["cont_result"]))
            this.filteredQuestions = JSON.parse(quiz["cont_result"]);
            this.questions = this.filteredQuestions;
            this.currentQuestionIndex = this.countSelectedAnswers();
            this.isLoaded = true;
          }
        }
      )
    }
    else {
      this.dataService.getQuestions(this.route.snapshot.paramMap.get('topic') ?? "").subscribe((res: Question[]) => {
        this.questions = this.removeDuplicateAnswers(res);
        this.filteredQuestions = this.removeDuplicateAnswers(res);
        this.isLoaded = true;
      });
    }
  }

  countSelectedAnswers(): number {
    return this.filteredQuestions.filter(question => (question.selectedAnswer !== null && question.selectedAnswer !== undefined) ||  (question.textBoxAnswer !== null && question.textBoxAnswer !== undefined)).length;
  }

  B14Change() {
    if (this.BQuestionNoAnswer) {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = "Egyik sem"
    }
    else {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined
    }
  }

  onRadioChange(currentQuestion: Question) {
    currentQuestion.textBoxAnswer = undefined;
  }

  onTextBoxChange(currentQuestion: Question) {
    currentQuestion.selectedAnswer = undefined
  }

  goBack() {
    this.allowNavigate()
    this.router.navigate([""]);
  }

  checkingTheConditions() {

    if (this.BQuestionNoAnswer && this.filteredQuestions[this.currentQuestionIndex].id == "B15") {
      this.removedQuestions = true;
      this.questions = this.questions.filter(x => x.id != "B16")
    }

    if (this.currentQuestionIndex == 0 && this.route.snapshot.paramMap.get('topic') != "Continue") {
      this.questions[0] = this.filteredQuestions[0];
    }


    this.filteredQuestions = this.questions.filter(question => {
      if (question.based_on.length === 0) {
        return true;
      }

      const conditionsMet = question.based_on.every(basedOnId => {
        if (basedOnId == "A7") {
          if (localStorage.getItem("A7answer") == "0") {
            this.removedQuestions = true;
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
        this.removedQuestions = true;
        return false;
      }
    });
  }


  checkTheNumberFormatForQuestions(): boolean {
    if (this.filteredQuestions[this.currentQuestionIndex].id == "A7") {

      if (isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer))) {
        this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
        return false;
      }
      localStorage.setItem("A7answer", this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer ?? "0")
    }

    if (this.filteredQuestions[this.currentQuestionIndex].id == "D2") {
      if (isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer))) {
        this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
        return false;
      }
    }

    if (this.filteredQuestions[this.currentQuestionIndex].id == "A8") {
      if (isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer))) {
        this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
        return false;
      }
    }

    if (this.filteredQuestions[this.currentQuestionIndex].id == "D10") {
      if (isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer))) {
        this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
        return false;
      }
      else {
        if (Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) > 100 || Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) < 0) {
          this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
          return false;
        }
      }
    }
    if (this.filteredQuestions[this.currentQuestionIndex].id == "G4") {
      if (isNaN(Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer))) {
        this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
        return false;
      }
      else {
        if (Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) > 100 || Number(this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer) < 0) {
          this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
          return false;
        }
      }
    }
    return true;
  }

  nextQuestion(): void {

    if (!this.checkTheNumberFormatForQuestions()) {
      return;
    }

    if(this.route.snapshot.paramMap.get('topic') == "Teljes" || this.route.snapshot.paramMap.get('topic') == "Continue")
      {   
        this.authService.saveContQuiz(this.filteredQuestions).subscribe({
          next: () => {
            console.log("Sikeres mentés")
          },
        error: (error) => {
        }
      })
    }

    this.checkingTheConditions();

    this.BQuestionNoAnswer = false;

    this.currentQuestionIndex++

    if (this.currentQuestionIndex == this.filteredQuestions.length) {
      this.isQuizInProgress = false;
      this.quizResultsService.saveQuizResultsAtTheEnd(this.filteredQuestions, this.route.snapshot.paramMap.get('topic') ?? "");
    }
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

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.isQuizInProgress) {
      $event.returnValue = true;
    }
  }

  canDeactivate(): boolean {
    if (this.isQuizInProgress) {
      return confirm('Biztosan el akarja hagyni az oldalt?');
    }
    return true;
  }

  // Ez a metódus átállítja az állapotot és navigál máshova
  allowNavigate() {
    this.isQuizInProgress = false;

    this.router.navigate(['/']);

  }




}
