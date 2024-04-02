import { Component, afterNextRender } from '@angular/core';
import { Question, QuizService } from '../quiz.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent {

  questions : any[] = []
  points : number[] = []
  question : any;
  isloaded = false;
  sum : number = 0;

  constructor(quizService : QuizService, private route: ActivatedRoute) {
    this.questions = quizService.getQuizResults();
    this.question = this.questions.find(q=>q.id == this.route.snapshot.paramMap.get('id'));
    console.log(this.question)
    this.questions.forEach(element => {
      this.points.push(this.getPointsForSelectedAnswer(element.id))
    });
    this.sum = this.points.reduce((acc, cur) => acc + cur, 0);
    this.isloaded = true

  }

  getPointsForSelectedAnswer(questionId: number): number {
    const question = this.questions.find(q => q.id === questionId);
    if (!question || !question.selectedAnswer) return 0; // Ha nincs ilyen kérdés vagy nincs választott válasz, térjünk vissza 0-val
  
    const selectedAnswerOption = question.answers.find((a : any) => a.answer === question.selectedAnswer);
    return selectedAnswerOption ? selectedAnswerOption.points : 0;
  }
}
