import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/User';
import { NotificationService } from './notification.service';
import { httpUrl } from '../variables';
import { Question } from '../models/Question';
import { AuthServiceHelper } from '../helpers/authServiceHelper';
import { log } from 'console';


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

  private confirmAddressSubject = new BehaviorSubject<string>("Loading");
  confirmAddressState = this.confirmAddressSubject.asObservable();

  private loadingButtonSubject = new BehaviorSubject<boolean>(false);
  loadingButtonState = this.loadingButtonSubject.asObservable();

  private isErrorSubject = new BehaviorSubject<boolean>(false);
  isErrorState = this.isErrorSubject.asObservable();

  private wrongPasswordOrUsernameSubject = new BehaviorSubject<boolean>(false);
  wrongPasswordOrUsernameState = this.wrongPasswordOrUsernameSubject.asObservable();

  constructor(private notificationService: NotificationService, private http: HttpClient, private router: Router) {
    this.newUser = {
      username: '',
      password: '',
      results: []
    }
  }

  //#region functions for the ui

  showLoginForm(show: boolean): void {
    this.loginFormSubject.next(show);
  }

  isButtonLoading(loading: boolean) {
    this.loadingButtonSubject.next(loading);
  }

  //#endregion



  confirmEmailAddress(token: string) {
    let body = new HttpParams();
    body = body.set('token', token);
    this.http.post(this.url + 'confirmEmail.php', body, { withCredentials: true }).subscribe(
      {
        next: () => {
          this.confirmAddressSubject.next("Success");
        },
        error: (_) => {
          this.confirmAddressSubject.next("Failure");
        }
      }
    )
  }

  saveContQuiz(cont_quiz: Question[]): Observable<any> {
    let body = new HttpParams();
    body = body.set('jwt', AuthServiceHelper.getJwtToken());
    body = body.set('cont_result', JSON.stringify(cont_quiz));
    return this.http.post(this.url + "saveContResult.php", body, { withCredentials: true })
  }

  getContQuiz(): Observable<Question[]> {
    let body = new HttpParams();
    body = body.set('id', AuthServiceHelper.getJwtToken());
    return this.http.post<Question[]>(this.url + "getContQuiz.php", body, { withCredentials: true })
  }

  onLoginSubmit(loginForm: FormGroup) {

    this.isErrorSubject.next(false);

    const { username, password, recaptcha } = loginForm.value;

    if (username == "" || password == "") {
      this.notificationService.show("Kérünk, hogy érvényes adatokat adjon meg!", NotificationType.error);
      return;
    }

    if(loginForm.get('recaptcha')?.invalid)
      {
        this.notificationService.show("Kérjük igazolja, hogy nem robot!", NotificationType.error);
        return;
      }

    if (loginForm.invalid) {
      this.notificationService.show("Nem helyes formátum! Kérünk email címet adjon meg a megfelelő helyre!", NotificationType.error);
      return;
    }

    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);

    this.isButtonLoading(true);

    this.http.post(this.url + 'login.php', body, { withCredentials: true }).subscribe(
      {
        next: (result) => {
          localStorage.setItem('currentUser', result as string)
          this.isButtonLoading(false);
          this.router.navigateByUrl("home")
        },
        error: (error) => {
          if (error.error.message == "NotConfirmed") {
            this.notificationService.show("Ez az email cím még nincs aktiválva, tekintse meg az email címét!", NotificationType.error)
          }
          else if (error.status == 401) {
            this.notificationService.show("Helytelen felhasználónév vagy jelszó!", NotificationType.error)
            this.wrongPasswordOrUsernameSubject.next(true);
          }
          else {
            this.isErrorSubject.next(true);
          }
          this.isButtonLoading(false);
        }
      }
    );
  }

  logOut() {
    localStorage.removeItem("currentUser")
    this.router.navigateByUrl("login");
  }

  onRegisterSubmit(registerForm: FormGroup) {
    this.isErrorSubject.next(false);

    const { username, password, confirmPassword, acceptedTerms, recaptcha } = registerForm.value;

    if (password == "" || username == "") {
      this.notificationService.show("Kérünk töltsön ki minden adatot!", NotificationType.error)
      return;
    }

    if (password !== confirmPassword) {
      this.notificationService.show("Nem egyeznek a jelszavak!", NotificationType.error)
      return;
    }

    if(registerForm.get('recaptcha')?.invalid)
      {
        this.notificationService.show("Kérünk igazolja, hogy nem robot!", NotificationType.error);
        return;
      }

    if (registerForm.invalid) {
      this.notificationService.show("Nem helyes formátum!", NotificationType.error);
      return;
    }

    if (acceptedTerms !== true) {
      this.notificationService.show("Kérjük, hogy fogadja el az adatvédelmi nyilatkozatot!", NotificationType.error)
      return;
    }

    this.isButtonLoading(true);

    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);

    this.http.post(this.url + 'register.php', body, { withCredentials: true }).subscribe(
      {
        next: (_) => {
          this.notificationService.show("Sikeres regisztráció!", NotificationType.positivie)
          this.showLoginForm(true);
          this.isButtonLoading(false);
        },
        error: (error) => {
          if (error.status == 409) {
            this.notificationService.show("A felhasználónév már foglalt.", NotificationType.error)
            this.isButtonLoading(false);
            this.isErrorSubject.next(true);
          }
          else if (error.status == 410)
            {
              this.notificationService.show("A jelszóban nem szerepelhetnek különleges karakterek, mint például a $, > és hasonlóak!", NotificationType.error)
              this.isButtonLoading(false);
              this.isErrorSubject.next(true);
            }
          else {
            this.notificationService.show("Valami hiba történt, kérünk próbálja újra később!", NotificationType.error)
            this.isButtonLoading(false);
            this.isErrorSubject.next(true);
          }
        }
      }
    );
  }
}
