import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpUrl } from '../variables';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  url = httpUrl;

  constructor(private http: HttpClient) { }

  getCsrfToken(): Observable<any> {
    return this.http.get(this.url + "csrf.php", { withCredentials: true });
  }
}
