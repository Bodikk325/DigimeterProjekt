import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '../data.service';
import { filter } from 'rxjs';
import { ChatService } from '../chat.service';
import { NotificationService } from '../notification.service';
import { NotificationType } from '../notification/notification.component';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {

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
      this.chatService.sendMessageQuestion(this.inputText, this.questions[this.currentQuestionIndex].category, this.questions[this.currentQuestionIndex].question).subscribe(response => {
        this.messages.push({ text: response.choices[0].message.content, user: false });
        this.isMessageLoading = false;
      });
      this.inputText = '';
    }
  }

  questions: Question[] = []
  currentQuestionIndex: number = 0;

  constructor(dataService: DataService, private quizResultsService: QuizResultsService, private chatService : ChatService, private notiService : NotificationService) {
    dataService.getQuestions().subscribe((res: Question[]) => {
      this.questions = res.slice(0, 10)
    })

    this.messages.push(
      {
        text : "Kérdésed van esetleg a válaszadással kapcsolatban? Ne habozz kérdezni, segítek ahol tudok!", user : false
      }
    )
  }

  nextQuestion() {
    const currentQuestion = this.questions[this.currentQuestionIndex];
  
    if (currentQuestion.selectedAnswer) {
      const selectedAnswer = currentQuestion.answers.find(answer => answer.answer === currentQuestion.selectedAnswer);
      if (selectedAnswer && selectedAnswer.nextQuestionId) {
        // Keresd meg a következő kérdést az azonosító alapján
        const nextQuestionIndex = this.questions.findIndex(q => q.id === selectedAnswer.nextQuestionId);
        if (nextQuestionIndex !== -1) {
          this.currentQuestionIndex = nextQuestionIndex;
        }
      } else if (currentQuestion.defaultNextQuestionId) {
        // Ha nincs specifikus válaszhoz kötött útvonal, de van alapértelmezett következő kérdés
        const defaultNextQuestionIndex = this.questions.findIndex(q => q.id === currentQuestion.defaultNextQuestionId);
        if (defaultNextQuestionIndex !== -1) {
          this.currentQuestionIndex = defaultNextQuestionIndex;
        }
      } else {
        // Ha nincs következő kérdés azonosító, lépj a sorban a következőre
        this.currentQuestionIndex++;
      }
    } else {
      this.notiService.show("Kérlek válaszolj a kérdésre!", NotificationType.error)
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
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
}
