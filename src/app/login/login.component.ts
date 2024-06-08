import { Component, afterNextRender } from '@angular/core';
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
  private loadingSubscription!: Subscription;
  private errorSubscription!: Subscription;

  messages = [
    "Hé, itt vagyok, itt lent!",
    "Kezdjük azzal, hogy létrehozunk neked egy fiókot!",
    "Ez azért fontos, hogy le tudjuk neked menteni az előző kitöltéseidnek eredményeit.",
    "Ezeket később vissza tudod majd keresni és össze tudod hasonlítani majd egy előző eredménnyel.",
    "Amennyiben van már fiókod, úgy csak szimplán jelentkezz be!"
  ]

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoading = false;
  loginShown = true;
  authService: AuthService;

  constructor(authService: AuthService) {

    this.authService = authService;

    this.manageForms();

    this.manageSubscriptions();

  }

  private manageForms()
  {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });
  }

  private manageSubscriptions()
  {
    this.authSubscription = this.authService.loginFormState.subscribe(show => {
      this.loginShown = show;
    });

    this.loadingSubscription = this.authService.loadingButtonState.subscribe(isLoading => {
      this.isLoading = isLoading;
    });

    this.errorSubscription = this.authService.isErrorState.subscribe(isError => {
      if (isError) {
        this.loginForm.reset();
        this.registerForm.reset();
      }
    });
  }

  toggleForm(): void {
    this.loginShown = !this.loginShown;
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
}
