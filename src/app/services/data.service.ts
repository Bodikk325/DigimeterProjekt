import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Question } from '../models/Question';
import { httpUrl } from '../variables';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  url: string;

  constructor(private http: HttpClient) {
    this.url = httpUrl
  }

  getQuestions(topic: string): Observable<Question[]> {
    return this.http.get<any[]>(this.url + "readQuestions.php?topic=" + topic, { withCredentials: true }).pipe(
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
          isThereMoreThanOneAnswer: item["Többválasztós-e"],
          condition: item["condition"],
          based_on: item["based_On"]
        });
      }

      const question = questionMap.get(item.id);
      question!.answers.push({
        answer: item.answer,
        points: item.pontok,
        selected: false,
        contains_Textbox: item.contains_Textbox,
        id: item["answer_id"]
      });

      if (item.random_point > question!.maxpoint) {
        question!.maxpoint = item.random_point;
      }
    });

    questionMap.forEach((question) => {
      question.answers.sort((a, b) => a.id.localeCompare(b.id));

    });

    return Array.from(questionMap.values());
  }
}
