import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  private csrfToken: string = '';

  url = "https://kzacoaching.com/"

  constructor(private http: HttpClient) { }

  getCsrfToken(): Observable<any> {
    return this.http.get(this.url + "csrf.php", { withCredentials: true });
  }
}
