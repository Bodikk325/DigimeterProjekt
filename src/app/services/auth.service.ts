import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationType } from '../notification/notification.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/User';
import { NotificationService } from './notification.service';
import { httpUrl } from '../variables';
import { Result } from '../models/Result';
import { ResultQuestion } from '../models/ResultQuestion';
import { Question } from '../models/Question';

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

    if(loginForm.invalid)
      {
        this.notificationService.show("Nem helyes formátúm!", NotificationType.error);
        return;
      }

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
      (error) => {
        if(error.error.message == "NotConfirmed")
          {
            this.notificationService.show("Ez az email cím még nincs aktiválva, nézd meg a levelesládád!", NotificationType.error)
          }
          else
          {
            this.notificationService.show("Helytelen felhasználónév vagy jelszó!", NotificationType.error)
          }
        this.isButtonLoading(false);
        this.isErrorSubject.next(true);
      }
    );
  }

  confirmEmailAddress(token : string)
  {
    let body = new HttpParams();
    body = body.set('token', token);
    this.http.post(this.url + 'confirmEmail.php', body, { withCredentials: true }).subscribe(
      {
        next : () => {
          this.confirmAddressSubject.next("Success");
        },
        error : (error) => {
          this.confirmAddressSubject.next("Failure");
        }
      }
    )
  }

  

  saveContQuiz(cont_quiz : Question[]) : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('id', localStorage.getItem('currentUser') ?? "");
    body = body.set('cont_result', JSON.stringify(cont_quiz));
    return this.http.post(this.url + "saveContResult.php", body, {withCredentials : true})
  }

  getContQuiz() : Observable<any>
  {
    let body = new HttpParams();
    body = body.set('id', localStorage.getItem('currentUser') ?? "");
    return this.http.post(this.url + "getContQuiz.php", body, {withCredentials : true})
  }


  onRegisterSubmit(registerForm: FormGroup): void {

    if(registerForm.invalid)
      {
        this.notificationService.show("Nem helyes formátúm!", NotificationType.error);
        return;
      }

    this.isErrorSubject.next(false);

    const { username, password, confirmPassword, acceptedTerms } = registerForm.value;

    if (acceptedTerms !== true) {
      this.notificationService.show("Kerünk, hogy fogadd el az adatvédelmi nyilatkozatot!", NotificationType.error)
      return;
    }

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
