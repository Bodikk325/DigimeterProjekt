import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Question } from './quizResults.service';
import { Point } from './firms.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private answers: Question[] = [];
  private points: Point[] = [];

  constructor(private http : HttpClient) { }

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

    const sortedAnswers = this.answers.sort((a, b) => a.id.localeCompare(b.id));
    const sortedPoints = filteredPoints.sort((a, b) => a.questionId.localeCompare(b.questionId));

    return { sortedAnswers, sortedPoints };
  }

  getQuestions(): Observable<Question[]> {
    // Az elérési út a fájlhoz az assets mappán belül
    return this.http.get<any[]>('assets/questions.json').pipe(
      map(data => this.transformQuestions(data))
    );
  }


  transformQuestions(data: any[]): Question[] {
    const questionMap = new Map<string, Question>();

    data.forEach(item => {
      if (!questionMap.has(item.id)) {
        questionMap.set(item.id, {
          id: item.id,
          question: item.kerdes,
          answers: [],
          maxpoint: item.max_point,
          category: item.Temakorok,
          isThereMoreThanOneAnswer : item["Többválasztós-e"],
          defaultNextQuestionId : item["defaultNextQuestionId"],
          isA7related : item["is_A7_related"]
        });
      }

      const question = questionMap.get(item.id);
      question!.answers.push({
        answer: item.answer,
        points: item.pontok,
        selected: false,
        nextQuestionId : item.nextQuestionId,
        contains_Textbox : item.contains_Textbox
      });

      // Frissítsük a max pontszámot, ha szükséges
      if (item.random_point > question!.maxpoint) {
        question!.maxpoint = item.random_point;
      }
    });

    return Array.from(questionMap.values());
  }

}
