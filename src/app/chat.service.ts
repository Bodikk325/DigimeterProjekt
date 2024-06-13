import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) {
    
  }

  url = "https://kzacoaching.com/"

  sendMessage(category : string, message : string, question : string, type : string, userPoint : number, maxPoint : number)
  {
    let body = new HttpParams();
    body = body.set('category', category);
    body = body.set('message', message);
    body = body.set('question', question);
    body = body.set('type', type);
    body = body.set('userPoint', userPoint);
    body = body.set('maxPoint', maxPoint);
    return this.http.post(this.url + "chat.php", body, {withCredentials : true});
  }

}
