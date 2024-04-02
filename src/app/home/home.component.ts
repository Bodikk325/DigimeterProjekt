import { Component } from '@angular/core';
import { QuizService } from '../quiz.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  asd = "id"

  result : any[] = []
  /**
   *
   */
  constructor(private quizService : QuizService) {
    this.result = quizService.getQuizResults();
    console.log(this.result)
  }

}
