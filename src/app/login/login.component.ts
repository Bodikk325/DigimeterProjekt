import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authSubscription!: Subscription;

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  loginShown = true;
  authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });

    this.authSubscription = this.authService.loginFormState.subscribe(show => {
      this.loginShown = show;
    });
  }

  toggleForm(): void {
    this.loginShown = !this.loginShown;
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }
}
