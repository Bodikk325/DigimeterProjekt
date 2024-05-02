import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Question } from './quiz.service';
import { Point } from './firms.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private answers: Question[] = [];
  private points: Point[] = [];

  constructor() { }

  // A két lista beállítása
  setAnswers(answers: Question[]): void {
    this.answers = answers;
  }

  setPoints(points: Point[]): void {
    this.points = points;
  }

  // Szűrés és rendezés
  getFilteredAndSortedData(): { sortedAnswers: Question[], sortedPoints: Point[] } {

    

    const filteredPoints = this.points.filter(point =>
      this.answers.some(answer =>
        {
          console.log(answer.id)
          answer.id === point.questionId
        } 
      )
    );

    console.log(filteredPoints)

    const sortedAnswers = this.answers.sort((a, b) => a.id - b.id);
    const sortedPoints = filteredPoints.sort((a, b) => a.questionId - b.questionId);

    return { sortedAnswers, sortedPoints };
  }
}
