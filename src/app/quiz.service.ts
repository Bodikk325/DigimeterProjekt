import { Injectable } from "@angular/core";

export interface Question {
  id: number;
  question: string;
  answers: { answer: string; points: number }[];
  selectedAnswer?: string; // A felhasználó által választott válasz
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private questions: Question[] = [
    {
      id : 1,
      question: "Melyik az első bolygó a Naptól számítva?",
      answers: [
        { answer: "Merkúr", points: 5,  },
        { answer: "Vénusz", points: 3 },
        { answer: "Föld", points: 0 }
      ]
    },
    {
      id : 2,
      question: "Mi Franciaország fővárosa?",
      answers: [
        { answer: "Berlin", points: 5 },
        { answer: "Párizs", points: 3 },
        { answer: "Bukarest", points: 0 }
      ]
    },
    {
      id : 3,
      question: "Ki a károly?",
      answers: [
        { answer: "Orbán Viktor", points: 1 },
        { answer: "Radics Attila", points: 3 },
        { answer: "Lakatos Brendon", points: 5 },
        { answer: "Magyar Péter", points: 0 },
        { answer: "L.L Junior", points: 2 }
      ]
    }
  ];

  constructor() { }

  getQuestions(): Question[] {
    return this.questions;
  }

  getQuizResults(): any[] {
    return JSON.parse(localStorage.getItem('quizResults') || '[]');
  }

}
