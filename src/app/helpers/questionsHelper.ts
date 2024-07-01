import { Question } from "../models/Question";
import { NotificationType } from "../notification/notification.component";
import { NotificationService } from "../services/notification.service";

export class QuestionHelpers {   

    constructor(private notiService : NotificationService) {
      
    }

    public static removeDuplicateAnswers(questions: Question[]): Question[] {
        return questions.map(question => {
          const uniqueAnswers = question.answers.filter((answer, index, self) =>
            index === self.findIndex(a => a.id === answer.id)
          );
          return {
            ...question,
            answers: uniqueAnswers
          };
        });
      }

      public static countSelectedAnswers(filteredQuestions : Question[]): number {
        return filteredQuestions.filter(question => (question.selectedAnswer !== null && question.selectedAnswer !== undefined) || (question.textBoxAnswer !== null && question.textBoxAnswer !== undefined)).length;
      }

      public checkTheNumberFormatForQuestions(filteredQuestions : Question[], currentQuestionIndex : number): boolean {
        if (filteredQuestions[currentQuestionIndex].id == "A7") {
    
          if (isNaN(Number(filteredQuestions[currentQuestionIndex].textBoxAnswer))) {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
          localStorage.setItem("A7answer", filteredQuestions[currentQuestionIndex].textBoxAnswer ?? "0")
        }
    
        if (filteredQuestions[currentQuestionIndex].id == "D2") {
          if (isNaN(Number(filteredQuestions[currentQuestionIndex].textBoxAnswer))) {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
        }
    
        if (filteredQuestions[currentQuestionIndex].id == "A8") {
          if (isNaN(Number(filteredQuestions[currentQuestionIndex].textBoxAnswer))) {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
        }
    
        if (filteredQuestions[currentQuestionIndex].id == "D10") {
          if (isNaN(Number(filteredQuestions[currentQuestionIndex].textBoxAnswer))) {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
          else {
            if (Number(filteredQuestions[currentQuestionIndex].textBoxAnswer) > 100 || Number(filteredQuestions[currentQuestionIndex].textBoxAnswer) < 0) {
              this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
              return false;
            }
          }
        }
        if (filteredQuestions[currentQuestionIndex].id == "G4") {
          if (isNaN(Number(filteredQuestions[currentQuestionIndex].textBoxAnswer))) {
            this.notiService.show("Kérlek szám formátumú választ adj meg!", NotificationType.error)
            return false;
          }
          else {
            if (Number(filteredQuestions[currentQuestionIndex].textBoxAnswer) > 100 || Number(filteredQuestions[currentQuestionIndex].textBoxAnswer) < 0) {
              this.notiService.show("Kérlek egy százalékos értéket adj meg! (0-100)", NotificationType.error)
              return false;
            }
          }
        }
        return true;
      }

      public handleTheA7A8UseCase(filteredQuestions : Question[], currentQuestionIndex : number) : boolean
      {
        if (filteredQuestions[currentQuestionIndex].id == "A8") {
            if (Number(localStorage.getItem("A7answer")) < Number(filteredQuestions[currentQuestionIndex].textBoxAnswer)) {
              this.notiService.show("Az előző kérdésnél " + localStorage.getItem("A7answer") + " munkavállalót adtál meg, ennél nagyobbat nem ésszerű ennél a kérdésnél adnod!", NotificationType.error)
              return false;
            }
      
            var a7answer = 0
            if(Number(localStorage.getItem("A7answer")) == 0)
              {
                a7answer = Infinity;
              }
            else 
            {
              a7answer = Number(localStorage.getItem("A7answer"));
            }
            var percentage = Number(filteredQuestions[currentQuestionIndex].textBoxAnswer) / a7answer
            
            filteredQuestions[currentQuestionIndex].answers[0].selected = true;
            filteredQuestions[currentQuestionIndex].answers[0].answer = filteredQuestions[currentQuestionIndex].textBoxAnswer as string;
            filteredQuestions[currentQuestionIndex].selectedAnswer = "A8_20"
            
            if (percentage < 0.20) {
              
              filteredQuestions[currentQuestionIndex].answers[0].points = 1;
            }
            if (percentage < 0.40 && percentage < 0.21) {
              filteredQuestions[currentQuestionIndex].answers[0].selected = true;
              filteredQuestions[currentQuestionIndex].answers[0].points = 2;
            }
            if (percentage < 0.60 && percentage < 0.41) {
              filteredQuestions[currentQuestionIndex].answers[0].selected = true;
              filteredQuestions[currentQuestionIndex].answers[0].points = 3;
            }
            if (percentage < 0.80 && percentage < 0.61) {
              filteredQuestions[currentQuestionIndex].answers[0].selected = true;
              filteredQuestions[currentQuestionIndex].answers[0].points = 4;
            }
            if (percentage > 0.81) {
              filteredQuestions[currentQuestionIndex].answers[0].selected = true;
              filteredQuestions[currentQuestionIndex].answers[0].points = 6;
            }
          }

          return true;

      }

}