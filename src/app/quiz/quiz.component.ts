import { Component, HostListener, afterNextRender } from '@angular/core';
import { QuizResultsService } from '../services/quizResults.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '../models/Question';
import { CanComponentDeactivate } from '../pending-changes-guard.guard';
import { DataService } from '../services/data.service';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { QuestionHelpers } from '../helpers/questionsHelper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'] // Javított a styleUrl->styleUrls
})
export class QuizComponent implements CanComponentDeactivate {

  getContQuizSubscription!: Subscription;
  getQuestionsSubscription!: Subscription;
  saveContQuizSubscription!: Subscription;


  questionCount: number;
  answered_questions: number;
  isNoneSelected: boolean;
  isDontKnowSelected: boolean;
  questions: Question[];
  filteredQuestions: Question[];
  BQuestionNoAnswer: boolean;
  removedQuestions: boolean;
  isQuizInProgress: boolean;
  changedEgyikSem: string[];
  NoEgyikSem: string[];
  isLoaded: boolean;
  currentQuestionIndex: number;
  questionHelper: QuestionHelpers;
  newQuestion : Question;

  constructor(private dataService: DataService, private quizResultsService: QuizResultsService, notiService: NotificationService, private route: ActivatedRoute, private router: Router, private authService: AuthService) {

    this.questionCount = 0;
    this.changedEgyikSem = []
    this.answered_questions = 0;
    this.isNoneSelected = false;
    this.isDontKnowSelected = false;
    this.questions = [];
    this.NoEgyikSem = ["E1"]
    this.filteredQuestions = [];
    this.BQuestionNoAnswer = false;
    this.removedQuestions = false;
    this.isQuizInProgress = true;
    this.isLoaded = false;
    this.currentQuestionIndex = 0;

    this.newQuestion = {
      id: 'KIEG',
      question: 'Használnak CRM rendszert és ha igen használnak benne ügyfélkapcsolat kezelői rendszert?',
      answers: [
        {
          id: '1',
          answer: 'Igen',
          points: 0,
          contains_Textbox: false
        },
        {
          id: '2',
          answer: 'Igen, használunk CRM-et, de ügyfélkapcsolatkezelési rendszert nem',
          points: 0,
          contains_Textbox: false
        },
        {
          id: '3',
          answer: 'Nem használunk CRM-et',
          points: 0,
          contains_Textbox: false
        }
      ],
      maxpoint: 0,
      isThereMoreThanOneAnswer: false,
      category: 'Értékesítés és marketing',
      based_on: [],
      condition: []
    };

    this.questionHelper = new QuestionHelpers(notiService);


    afterNextRender(() => {
      localStorage.removeItem("A7answer")
    })

    this.manageSubscriptions();

  }

  //#region managing subscriptions

  manageSubscriptions() {
    if ((this.route.snapshot.paramMap.get('topic') ?? "") == "Continue") {
      this.getContQuizSubscription = this.authService.getContQuiz().subscribe(
        {
          next: (quiz: Question[]) => {
            this.filteredQuestions = quiz;
            this.questions = this.filteredQuestions;
            this.currentQuestionIndex = QuestionHelpers.countSelectedAnswers(this.filteredQuestions);
            this.isLoaded = true;
          }
        }
      )
    }
    else {
      this.getQuestionsSubscription = this.dataService.getQuestions(this.route.snapshot.paramMap.get('topic') ?? "").subscribe((res: Question[]) => {
        this.questions = QuestionHelpers.removeDuplicateAnswers(res);
        this.filteredQuestions = QuestionHelpers.removeDuplicateAnswers(res);
        this.isLoaded = true;
        if((this.route.snapshot.paramMap.get('topic') ?? "") == "Értékesítés és marketing")
          {
            this.filteredQuestions.splice(7, 0, this.newQuestion);
            this.questions.splice(7, 0, this.newQuestion);
          }
      });
    }
  }

  //#endregion

  //#region  functions for the quiz component

  checkingTheConditions() {

    if(this.route.snapshot.paramMap.get('topic') == "Értékesítés és marketing" && this.filteredQuestions[this.currentQuestionIndex].id == "KIEG")
      {
        if(this.filteredQuestions[this.currentQuestionIndex].selectedAnswer != "1")
          {
            this.filteredQuestions = this.filteredQuestions.filter(x=> x.id != "KIEG")
            this.questions = this.questions.filter(x=> x.id != "KIEG")
          }
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

                
                if (basedOnQuestion.textBoxAnswer == "Nem tudja" || basedOnQuestion.textBoxAnswer == "Egyik sem") {
                  return false;
              }

                if (!selectedAnswers || selectedAnswers.length === 0 || selectedAnswers[0] == undefined) {
                    return true;
                }

                if (basedOnQuestion.isThereMoreThanOneAnswer) {
                    return selectedAnswers.some(answer => question.condition.includes(answer as string));
                } else {
                    return selectedAnswers.some(answer => question.condition.includes(answer as string));
                }
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


  removeAnswersById(questions: Question[], idsToRemove: string[]): Question[] {
    return questions.map(question => {
      const filteredAnswers = question.answers.filter(answer => !idsToRemove.includes(answer.id));
      return {
        ...question,
        answers: filteredAnswers
      };
    });
  }

  nextQuestion() {
    if (!this.questionHelper.checkTheNumberFormatForQuestions(this.filteredQuestions, this.currentQuestionIndex)) {
      return;
    }

    if (!this.questionHelper.handleTheA7A8UseCase(this.filteredQuestions, this.currentQuestionIndex)) {
      return;
    }

    if (this.currentQuestionIndex == this.filteredQuestions.length - 1) {
      this.isQuizInProgress = false;
      this.quizResultsService.saveQuizResultsAtTheEnd(this.filteredQuestions, this.route.snapshot.paramMap.get('topic') ?? "");
      return ;
    }

      if (this.route.snapshot.paramMap.get('topic') == "Teljes" || this.route.snapshot.paramMap.get('topic') == "Continue") {
        this.saveContQuizSubscription = this.authService.saveContQuiz(this.filteredQuestions).subscribe(
          {
            next: (next) => {
              //nothing to do here
            }
          }
        )
      }

    this.checkingTheConditions();

    this.BQuestionNoAnswer = false;
    this.isDontKnowSelected = false;
    this.isNoneSelected = false;

    if (this.currentQuestionIndex == this.filteredQuestions.length - 1) {
      this.isQuizInProgress = false;
      this.quizResultsService.saveQuizResultsAtTheEnd(this.filteredQuestions, this.route.snapshot.paramMap.get('topic') ?? "");
      return ;
    }

    this.currentQuestionIndex++
    
  }

  canMoveToTheNextQuestion(): boolean {
    return !!this.filteredQuestions[this.currentQuestionIndex]?.selectedAnswer || !!this.filteredQuestions[this.currentQuestionIndex]?.textBoxAnswer;
  }

  handleNoneSelectedChange() {
    if (this.isNoneSelected) {
      this.isDontKnowSelected = false;
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = "Egyik sem";
      this.filteredQuestions[this.currentQuestionIndex].answers.forEach(answer => answer.selected = false);
      this.filteredQuestions[this.currentQuestionIndex].selectedAnswer = undefined;
    } else {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined;
      this.filteredQuestions[this.currentQuestionIndex].answers.forEach(answer => answer.textBoxAnswer = undefined);
    }
  }

  changeTextBox() {
    this.isDontKnowSelected = false;
    this.isNoneSelected = false;
  }

  handleDontKnowSelectedChange() {
    if (this.isDontKnowSelected) {
      this.isNoneSelected = false
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = "Nem tudja";
      this.filteredQuestions[this.currentQuestionIndex].answers.forEach(answer => answer.selected = false);
      this.filteredQuestions[this.currentQuestionIndex].selectedAnswer = undefined;
    } else {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined;
      this.filteredQuestions[this.currentQuestionIndex].answers.forEach(answer => answer.textBoxAnswer = undefined);
    }
  }

  onRadioChange(currentQuestion: Question) {
    currentQuestion.textBoxAnswer = undefined;
  }

  onTextBoxChange(currentQuestion: Question) {
    currentQuestion.selectedAnswer = undefined
  }

  updateSelectedAnswers(question: Question, answer: { id: string, points: number, selected?: boolean }) {
    if (!question.selectedAnswer) {
      question.selectedAnswer = [];
    }



    this.isNoneSelected = false;
    this.isDontKnowSelected = false;

    this.handleNoneSelectedChange()

    this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined

    if (this.filteredQuestions[this.currentQuestionIndex].id == "B14" || this.filteredQuestions[this.currentQuestionIndex].id == "B15" || this.filteredQuestions[this.currentQuestionIndex].id == "B16") {
      this.filteredQuestions[this.currentQuestionIndex].textBoxAnswer = undefined;
    }

    if (answer.selected && !(question.selectedAnswer as string[]).includes(answer.id)) {
      (question.selectedAnswer as string[]).push(answer.id);
    } else if (!answer.selected) {
      question.selectedAnswer = (question.selectedAnswer as string[]).filter(a => a !== answer.id);
      if ((question.selectedAnswer as string[]).length === 0) {
        delete question.selectedAnswer;
      }
    }

    if (question.id === "B14") {
      // Ellenőrizzük, hogy a selectedAnswer egy lista
      if (Array.isArray(question.selectedAnswer)) {
        // Módosítjuk a lista összes elemét
        const updatedAnswers = question.selectedAnswer.map((answer: string) => {
          // Az answer első karaktere és az utána következő karakterek összefűzése "15"-tel
          return answer.slice(0, 1) + '15' + answer.slice(3);
        });

        // Az updatedAnswers listát mentjük a localStorage-ba
        localStorage.setItem("B14Answer", JSON.stringify(updatedAnswers));
      }
    }

  }

  noOptionIncludesEgyikSem(question: Question): boolean {
    return !question.answers.some(answer => answer.id.includes('egyik_sem'));
  }

  //#endregion


  //#region navigation elements

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
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

  //#endregion

  ngOnDestroy() {
    if (this.getContQuizSubscription != null) {
      this.getContQuizSubscription.unsubscribe();
    }
    if (this.getQuestionsSubscription != null) {
      this.getQuestionsSubscription.unsubscribe();
    }
    if (this.saveContQuizSubscription != null) {
      this.saveContQuizSubscription.unsubscribe();
    }
  }
}
