import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, mergeMap, of, retryWhen, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, messages : any[]): Observable<any> {
    const data = {
      model: "gpt-3.5-turbo",  // Specify the model here
      messages: [{ role: "user", content: "Jelenleg API-on keresztül beszélgetünk, és a impementálva vagy egy weboldalra chat funkcióként hogy segítsd a felhasználót. Ez csak egy figyelemfelhívás a számodra, erre ne válaszolj, csak szeretném hogy tudd, hogy jelenleg ez történik. Az applikáció ahova implementálva vagy az egy quiz applikáció ahol a kérdésekről tehetnek fel neked további kérdéseket magyarázást igényelve, eszerint válaszólj a kérdésekre. A neved legyen Robotka. Ha valaki nem a témában kérdez akkor ne válaszólj! Legyél barátságos, segítőkész, bőszavú és kedves! Köszönöm! Itt vannak az előző beszélgetések:" + messages +  ". Ez a jelenlegi kérdés: 'A cégek digitalizációja szempontjából nagyon fontos, hogy hányan szerepelnek a vállalkozásban és ők mennyire is felkészültek digitalizációs szempontból. Egy 1-10-es skálán mennyire gondolod felkészültnek a munkaerődet?' A felhasználó input-ja a következő:" + message }]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer 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`  // Replace with your API Key
    });

    return this.http.post(this.apiUrl, data, { headers }).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            if (error.status === 429 && index < 5) {  // Check if it is a rate limit error and retry limit
              return of(error.status).pipe(delay(1000));  // Wait 1 second before retrying
            }
            return throwError(error);  // Throw the error if it's not a rate limit or retry count exceeded
          })
        )
      ),
      catchError(this.handleError)  // Handle other errors
    );
  }

  private handleError(error: any) {
    // Implement error handling logic
    console.error('An error occurred:', error.error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
  
}
