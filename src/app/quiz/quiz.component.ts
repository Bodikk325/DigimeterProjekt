import { Component } from '@angular/core';
import { Question, QuizResultsService } from '../quizResults.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {

  questions: Question[] = []
  currentQuestionIndex: number = 0;

  constructor(private router: Router, private dataService: DataService, private quizResultsService: QuizResultsService) {
    dataService.getQuestions().subscribe((res: Question[]) => {
      this.questions = res.slice(0, 2)
    })
  }

  nextQuestion() {
    if (this.currentQuestionIndex == this.questions.length - 1) {
      this.quizResultsService.saveQuizResults(this.questions);
    }
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (currentQuestion.selectedAnswer) { // Csak akkor lépünk tovább, ha van válasz
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    } else {
      alert('Kérlek, válaszolj a kérdésre mielőtt továbblépnél.');
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
