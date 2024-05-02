import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;

  loginShown = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    const { username, password } = this.loginForm.value;

    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/home']);
    } else {
      alert('Helytelen felhasználónév vagy jelszó.');
    }
  }
}
