import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, delay, mergeMap, of, retryWhen, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) { }

  sendMessageQuestion(message: string, tema: string, question: string): Observable<any> {
    var prompt = ""
    if (tema == "Bevezető") {
      prompt = `
      Te egy chatbot vagy a Digiméter oldalán. Kérdőív van a képernyőn, jelenleg egy kérdés látható, ezzel a kérdéssel kapcsolatban kérdezhet a user.
      A kérdés ami jelenleg a képernyőn van, amivel kapcsolatban kérdezhet a felhasználó : ` + question + `
      Adj rövid, formális választ a user általl  feltett kérdésre:` + message + ` 
      Jelenleg a bevezető fázisban vagyunk, a lényeg az, hogy kideritsük a vállalkozás adatait, ez a cél, eszerint válaszolj.
      Ha azt állapítod meg, hogy a kérdés nem a témára vonatkozott, akkor közöld, hogy nem tudsz választ adni a kérdésre. 
      Ne adj tanácsot olyan ügyekben, amik nem a témához kapcsolódnak. 
      Ne adj párkapcsolati tanácsot. 
      `
    }
    else {
      prompt = `
      Te egy chatbot vagy a Digiméter oldalán.
      A kérdés ami jelenleg a képernyőn van, amivel kapcsolatban kérdezhet a felhasználó : ` + question + `
      Adj rövid, formális választ a feltett kérdésre:` + message + ` 
      Nyújts segítséget a felhasználónak. 
      A téma: ` + tema + `. 
      Csak a témával kapcsolatos kérdésekre válaszolj. 
      Ha azt állapítod meg, hogy a kérdés nem a témára vonatkozott, akkor közöld, hogy nem tudsz választ adni a kérdésre. 
      Ne adj tanácsot olyan ügyekben, amik nem a témához kapcsolódnak. 
      Ne adj párkapcsolati tanácsot. `
    }

    const data = {
      model: "gpt-3.5-turbo",  // Specify the model here
      messages: [{
        role: "user", content: prompt
      }]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer sk-proj-oPkBsvKLCBol2oY0pF6sT3BlbkFJX76z7gLXQuJKZoL3tTKa`
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

  sendMessageResult(userPoint : number, otherPoint : number, maxPoint : number, message : string, tema : string): Observable<any> {
    if(tema == "") tema = "Általános digitalizációja a vállalkozásodnak"
    var prompt = ""
    prompt = `
      Te egy chatbot vagy a Digiméter oldalán. Kérdőív van a képernyőn, a kérdőívet már kitöltöttük, tehát a végeredmény ablakot látja jelenleg a user, ebben kell segíts neki és lebontsd az eredményeit.
      A user pontszáma  : ` + userPoint + `
      A versenytársai pontszáma  : ` + otherPoint + `
      A maximálisan elérhető pontszám az alábbi volt  : ` + maxPoint + `
      Adj rövid, formális választ a feltett kérdésre:` + message + ` 
      Nyújts segítséget a felhasználónak. 
      A téma: ` + tema + `. 
      Ne félj kritikusnak lenni a pontszámmal kapcsolatban, de legyél tisztelettudó!
      Csak a témával kapcsolatos kérdésekre válaszolj. 
      Ha azt állapítod meg, hogy a kérdés nem a témára vonatkozott, akkor közöld, hogy nem tudsz választ adni a kérdésre. 
      Ne adj tanácsot olyan ügyekben, amik nem a témához kapcsolódnak. 
      Ne adj párkapcsolati tanácsot. `


    const data = {
      model: "gpt-3.5-turbo",  // Specify the model here
      messages: [{
        role: "user", content: prompt
      }]
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer `
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
