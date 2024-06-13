export interface Question {
    id: string;
    question: string;
    answers: {
      id: string,
      answer: string;
      points: number;
      selected?: boolean;
      contains_Textbox: boolean;
      textBoxAnswer? : string;
    }[];
    selectedAnswer?: string | string[];
    textBoxAnswer? : string;
    maxpoint: number;
    isThereMoreThanOneAnswer: boolean;
    category: string;
    based_on: string[];
    condition: string[];
  }