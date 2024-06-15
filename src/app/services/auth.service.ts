import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/User';
import { NotificationService } from './notification.service';
import { httpUrl } from '../variables';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = httpUrl;

  currentUser!: User;
  users!: User[];
  newUser!: User;

  private loginFormSubject = new BehaviorSubject<boolean>(true);
  loginFormState = this.loginFormSubject.asObservable();

  private loadingButtonSubject = new BehaviorSubject<boolean>(false);
  loadingButtonState = this.loadingButtonSubject.asObservable();

  private isErrorSubject = new BehaviorSubject<boolean>(false);
  isErrorState = this.isErrorSubject.asObservable();

  constructor(private notificationService: NotificationService, private http: HttpClient, private router: Router) {
    this.newUser = {
      username: '',
      password: '',
      results: []
    }
  }

  logOut() {
    localStorage.removeItem("currentUser")
    this.router.navigateByUrl("login");
  }

  checkIfUserIsLoggedIn(): boolean {
    return localStorage.getItem("currentUser") != null;
  }

  showLoginForm(show: boolean): void {
    this.loginFormSubject.next(show);
  }

  isButtonLoading(loading: boolean) {
    this.loadingButtonSubject.next(loading);
  }

  onLoginSubmit(loginForm: FormGroup): void {

    this.isErrorSubject.next(false);

    const { username, password } = loginForm.value;

    if (username == "" || password == "") {
      this.notificationService.show("Kérünk, hogy érvényes adatokat adj meg!", NotificationType.error);
      return;
    }

    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);

    this.isButtonLoading(true);

    this.http.post(this.url + 'login.php', body, { withCredentials: true }).subscribe(
      (result: any) => {
        localStorage.setItem('currentUser', result)
        this.isButtonLoading(false);
        this.router.navigateByUrl("home")
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
    this.http.post(this.url + 'register.php', body, { withCredentials: true }).subscribe(
      (result) => {
        this.notificationService.show("Sikeres regisztráció!", NotificationType.positivie)
        this.showLoginForm(true);
        this.isButtonLoading(false);
      },
      (error) => {
        if (error.status == 409) {
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