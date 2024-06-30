import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpUrl } from '../variables';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {

  url: string;

  constructor(private http: HttpClient) {
    this.url = httpUrl;
  }

  getCsrfToken(): Observable<any> {
    return this.http.get(this.url + "csrf.php", { withCredentials: true });
  }
}
