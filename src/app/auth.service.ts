import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from './user';
import { Result } from './result';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification/notification.component';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { CsrfService } from './csrf.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { error, log } from 'console';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost/';

  constructor(private router: Router, private notificationService : NotificationService, private csrfService : CsrfService, private http : HttpClient) { }

  currentUser! : User;
  users! : User[];
  newUser : User = {
    username: '',
    password: '',
    results: []
  }

  private loginFormSubject = new BehaviorSubject<boolean>(true);
  loginFormState = this.loginFormSubject.asObservable();

  private loadingButtonSubject = new BehaviorSubject<boolean>(false);
  loadingButtonState = this.loadingButtonSubject.asObservable();

  private isErrorSubject = new BehaviorSubject<boolean>(false);
  isErrorState = this.isErrorSubject.asObservable();

  showLoginForm(show: boolean): void {
    this.loginFormSubject.next(show);
  }

  isButtonLoading(loading : boolean)
  {
    this.loadingButtonSubject.next(loading);
  }

  getCurrentUser() : string
  {
    const currentUser = localStorage.getItem("currentUser")
    return currentUser ?? "";
  }

  
  addResultToUser(result : Result)
  {
    this.currentUser.results.push(result.id);
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
    this.update(this.currentUser);
    localStorage.setItem('users', JSON.stringify(this.users))
  }
  

  
  private update(newItem: User) {
    let indexToUpdate = this.users.findIndex(item => item.username === newItem.username);
    this.users[indexToUpdate] = newItem;

    this.users = Object.assign([], this.users);
  }
  

  
  getUserResults() : number[]
  {
    return this.currentUser.results
  }
  
  onLoginSubmit(loginForm: FormGroup): void {

    this.isErrorSubject.next(false);

    const { username, password } = loginForm.value;

    if(username == "" || password == "")
      {
        this.notificationService.show("Kérünk, hogy érvényes adatokat adj meg!", NotificationType.error);
        return;
      }

    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);

    this.isButtonLoading(true);

    this.http.post('http://localhost/login.php', body, {withCredentials: true}).subscribe(
      (result : any) => {
        localStorage.setItem('currentUser', result)
        this.isButtonLoading(false);
        this.router.navigate(['/home']);
      },
      (_) => {
        this.notificationService.show("Helytelen felhasználónév vagy jelszó!", NotificationType.error)
        this.isButtonLoading(false);
        this.isErrorSubject.next(true);
      }
    );
  }

  onRegisterSubmit(registerForm: FormGroup): void {

    this.isErrorSubject.next(false);

    const { username, password, confirmPassword } = registerForm.value;

    if (password == "" || username == "") {
      this.notificationService.show("Kérünk tölts ki minden adatot!", NotificationType.error)
      return;
    }

    if (password !== confirmPassword) {
      this.notificationService.show("Nem egyeznek a jelszavak!", NotificationType.error)
      return;
    }

    this.isButtonLoading(true);

    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);
    this.http.post('http://localhost/register.php', body, {withCredentials: true}).subscribe(
      (result) => {
        this.notificationService.show("Sikeres regisztráció!", NotificationType.positivie)
        this.showLoginForm(true);
        this.isButtonLoading(false);
      },
      (error) => {
        if(error.status == 409)
          {
            this.notificationService.show("A felhasználónév már foglalt.", NotificationType.error)
            this.isButtonLoading(false);
            this.isErrorSubject.next(true);
          } 
          else {
            this.notificationService.show("Valami hiba történt, kérünk próbáld újra később!", NotificationType.error)
            this.isButtonLoading(false);
            this.isErrorSubject.next(true);
          }
        }
    );
  }
}
