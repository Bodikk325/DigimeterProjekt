import { Injectable } from "@angular/core";

export interface Question {
  id: number;
  question: string;
  answers: {
    answer: string; 
    points: number;
    selected?: boolean; // Ez az új mező azonosítja, hogy a válasz ki van-e jelölve (csak checkbox esetén)
  }[];
  selectedAnswer?: string | string[]; // Több választás támogatása
  maxpoint: number;
  isThereMoreThanOneAnswer: boolean;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private questions: Question[] = [
    {
      id: 1,
      question: "Melyik az első bolygó a Naptól számítva?",
      answers: [
        { answer: "Merkúr", points: 5 },
        { answer: "Vénusz", points: 0 },
        { answer: "Föld", points: 0 }
      ],
      category: "Csillagászat",
      maxpoint : 5,
      isThereMoreThanOneAnswer : false
    },
    {
      id: 2,
      question: "Mi Franciaország fővárosa?",
      answers: [
        { answer: "Berlin", points: 0 },
        { answer: "Párizs", points: 3 },
        { answer: "Bukarest", points: 0 }
      ],
      category: "Földrajz",
      maxpoint : 3,
      isThereMoreThanOneAnswer : false
    },
    {
      id: 3,
      question: "Ki a károly?",
      answers: [
        { answer: "Orbán Viktor", points: 1 },
        { answer: "Radics Attila", points: 3 },
        { answer: "Lakatos Brendon", points: 5 },
        { answer: "Magyar Péter", points: 0 },
        { answer: "L.L Junior", points: 2 }
      ],
      category: "Kultúra",
      maxpoint : 8,
      isThereMoreThanOneAnswer : true
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
