import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core'
import { httpUrl } from '../variables';
import { AuthServiceHelper } from '../helpers/authServiceHelper';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  url : string;

  constructor(private http: HttpClient) {
    this.url = httpUrl;
  }

  getMessages()
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    return this.http.post(this.url + "get_conversations.php", body, {withCredentials : true});
  }

  sendMessage(category : string, message : string, question : string, type : string, userPoint : number, firmsPoint : number)
  {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    body = body.set('category', category);
    body = body.set('message', message);
    body = body.set('question', question);
    body = body.set('type', type);
    body = body.set('firmsPoint', firmsPoint);
    body = body.set('userPoint', userPoint);
    return this.http.post(this.url + "chat.php", body, {withCredentials : true});
  }

}
