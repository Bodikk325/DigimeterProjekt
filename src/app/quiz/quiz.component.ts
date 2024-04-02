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
        selectedAnswer: q.selectedAnswer,
        points: this.getPointsForSelectedAnswer(q.id)
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

  getPointsForSelectedAnswer(questionId: number): number {
    const question = this.questions.find(q => q.id === questionId);
    if (!question || !question.selectedAnswer) return 0; // Ha nincs ilyen kérdés vagy nincs választott válasz, térjünk vissza 0-val
  
    const selectedAnswerOption = question.answers.find(a => a.answer === question.selectedAnswer);
    return selectedAnswerOption ? selectedAnswerOption.points : 0;
  }

}
