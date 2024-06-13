import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Question } from './models/Question';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http : HttpClient) { }

  getQuestions(topic : string): Observable<Question[]> {
    // Az elérési út a fájlhoz az assets mappán belül
    return this.http.get<any[]>("http://localhost/readQuestions.php?topic=" + topic).pipe(
      map(data => this.transformQuestions(data))
    );
  }

  transformQuestions(data: any[]): Question[] {
    const questionMap = new Map<string, Question>();
    const rawString = [];
    data.forEach(item => {
      if (!questionMap.has(item.id)) {
        questionMap.set(item.id, {
          id: item.id,
          question: item.kerdes,
          answers: [],
          maxpoint: item.max_point,
          category: item.Temakorok,
          isThereMoreThanOneAnswer : item["Többválasztós-e"],
          condition : item["condition"],
          based_on : item["based_On"]
        });
      }

      const question = questionMap.get(item.id);
      question!.answers.push({
        answer: item.answer,
        points: item.pontok,
        selected: false,
        contains_Textbox : item.contains_Textbox,
        id : item["answer_id"]
      });

      // Frissítsük a max pontszámot, ha szükséges
      if (item.random_point > question!.maxpoint) {
        question!.maxpoint = item.random_point;
      }
    });

    return Array.from(questionMap.values());
  }
}
