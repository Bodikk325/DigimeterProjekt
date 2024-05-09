import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  getCurrentUser() : string
  {
    return localStorage.getItem("currentUser") || ""
  }

  onLoginSubmit(loginForm: FormGroup): void {
    const { username, password } = loginForm.value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', username)
      this.router.navigate(['/home']);
    } else {
      alert('Helytelen felhasználónév vagy jelszó.');
    }
  }

  onRegisterSubmit(registerForm: FormGroup): void {
    const { username, password, confirmPassword } = registerForm.value;
    if (password !== confirmPassword) {
      alert('A jelszavak nem egyeznek.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: any) => u.username === username)) {
      alert('A felhasználónév már foglalt.');
      return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Sikeres regisztráció!');
  }

}
