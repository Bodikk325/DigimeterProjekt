import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from './user';
import { Result } from './result';
import { NotificationService } from './notification.service';
import { NotificationType } from './notification/notification.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private notificationService : NotificationService) { }

  currentUser! : User;
  users! : User[];
  newUser : User = {
    username: '',
    password: '',
    results: []
  }

  private loginFormSubject = new BehaviorSubject<boolean>(true);
  loginFormState = this.loginFormSubject.asObservable();

  showLoginForm(show: boolean): void {
    this.loginFormSubject.next(show);
  }

  getCurrentUser() : User
  {
    const currentUser = localStorage.getItem("currentUser")
    return currentUser ? JSON.parse(currentUser) as User : this.newUser;
  }

  onLoginSubmit(loginForm: FormGroup): void {
    const { username, password } = loginForm.value;
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = this.users.find((u: any) => u.username === username && u.password === password) as User;
    if (this.currentUser) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
      this.router.navigate(['/home']);
    } else {
      this.notificationService.show("Helytelen felhasználónév vagy jelszó!", NotificationType.error)
    }
  }

  addResultToUser(result : Result)
  {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = this.users.find((u) => u.username === this.getCurrentUser().username) as User;
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
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = this.users.find((u) => u.username === this.getCurrentUser().username) as User;
    return this.currentUser.results
  }

  onRegisterSubmit(registerForm: FormGroup): void {
    const { username, password, confirmPassword } = registerForm.value;
    this.newUser.password = registerForm.value["password"]
    this.newUser.username = registerForm.value["username"]
    this.newUser.results = []
    if (password == "" || username == "") {
      this.notificationService.show("Kérünk tölts ki minden adatot!", NotificationType.error)
      return;
    }
    if (password !== confirmPassword) {
      this.notificationService.show("Nem egyeznek a jelszavak!", NotificationType.error)
      return;
    }
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    if (this.users.some((u: any) => u.username === username)) {
      this.notificationService.show("A felhasználónév már foglalt.", NotificationType.error)
      return;
    }
    this.users.push(this.newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    this.notificationService.show("Sikeres regisztráció!", NotificationType.positivie)
    this.showLoginForm(true);
  }
}
