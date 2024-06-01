import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  private csrfToken: string = '';

  constructor(private http: HttpClient) { }

  getCsrfToken(): Observable<any> {
    return this.http.get('http://localhost/csrf.php', { withCredentials: true });
  }
}
