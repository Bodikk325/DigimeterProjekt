import { Component } from '@angular/core';
import { Question, QuizService } from '../quiz.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {

  questions : Question[] = []
  currentQuestionIndex: number = 0;

  /**
   *
   */
  constructor(private quizService : QuizService, private router : Router) {
    this.questions = quizService.getQuestions();
  }

  nextQuestion() {
    if(this.currentQuestionIndex == 2)
    {
      localStorage.setItem('quizAnswers', JSON.stringify(this.questions));
      var stamp = new Date().getTime()
      this.saveQuizResults(stamp);
      this.router.navigate(["result", stamp])
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

  saveQuizResults(stamp : number): void {
    const quizResults = {
      id: stamp, // Timestamp, mint egyedi azonosító
      totalPoints: this.calculateTotalPoints(), // Összpontszám számítás
      results: this.questions.map(q => ({
        questionId: q.id,
        questionText : q.question,
        maxpoint : q.maxpoint,
        selectedAnswer: q.selectedAnswer,
        points: this.getPointsForSelectedAnswer(q.id),
        category : q.category
      }))
    };
  
    // Meglévő eredmények lekérése és frissítése
    const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    existingResults.push(quizResults);
    localStorage.setItem('quizResults', JSON.stringify(existingResults));
  }
  
  calculateTotalPoints(): number {
    return this.questions.reduce((total, question) => total + this.getPointsForSelectedAnswer(question.id), 0);
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

  getPointsForSelectedAnswer(questionId: number): number {
    const question = this.questions.find(q => q.id === questionId);
    if (!question || !question.selectedAnswer) return 0;

    if (Array.isArray(question.selectedAnswer)) {
      const totalPoints = question.selectedAnswer.reduce((acc, answer) => {
        const answerOption = question.answers.find(a => a.answer === answer);
        return acc + (answerOption ? answerOption.points : 0);
      }, 0);
      return Math.min(totalPoints, question.maxpoint);
    } else {
      const selectedAnswerOption = question.answers.find(a => a.answer === question.selectedAnswer);
      return selectedAnswerOption ? selectedAnswerOption.points : 0;
    }
  }

}
