import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from './user';
import { Result } from './result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  currentUser! : User;
  users! : User[];
  newUser : User = {
    username: '',
    password: '',
    results: []
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
      alert('Helytelen felhasználónév vagy jelszó.');
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
    if (password !== confirmPassword) {
      alert('A jelszavak nem egyeznek.');
      return;
    }
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    if (this.users.some((u: any) => u.username === username)) {
      alert('A felhasználónév már foglalt.');
      return;
    }
    this.users.push(this.newUser);
    localStorage.setItem('users', JSON.stringify(this.users));
    alert('Sikeres regisztráció!');
  }

}
