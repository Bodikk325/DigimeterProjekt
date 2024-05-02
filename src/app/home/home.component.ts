import { Component } from '@angular/core';
import { QuizService } from '../quiz.service';
import { MyFirm } from '../myFirm';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  asd = "id"

  myFirm: MyFirm = {
    Region: '',
    Field: '',
    Workers: ''
  };

  saveToFirm() {
    localStorage.setItem('myFirm', JSON.stringify(this.myFirm));
    alert('Data Saved!');
  }

  result : any[] = []
  /**
   *
   */
  constructor(private quizService : QuizService) {
    this.result = quizService.getQuizResults();
    console.log(this.result)
  }

}
