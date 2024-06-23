import { Component, afterNextRender } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
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
    "Ez azért fontos, hogy el tudjuk neked menteni az előző válaszaid. Így egyrészt nem kell újrakezdened a kérdőívet, ha nem lenne időd egyszerre megválaszolni az összes kérdést.",
    "Másrészt, ha készen vagy, bármikor visszajöhetsz, megnézheted a válaszaid és beszélgethetsz velem a digitalizációs tennivalókról ezek kapcsán. ",
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

  private manageForms() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      acceptedTerms: new FormControl(false, [Validators.required])
    });
  }

  private manageSubscriptions() {
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
