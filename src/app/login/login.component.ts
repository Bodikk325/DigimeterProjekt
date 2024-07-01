import { Component, ViewChild, afterNextRender } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ReCaptcha2Component } from 'ngx-captcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @ViewChild('loginCaptchaElem') loginCaptchaElem!: ReCaptcha2Component;
  @ViewChild('registerCaptchaElem') registerCaptchaElem!: ReCaptcha2Component;

  private authSubscription!: Subscription;
  private loadingSubscription!: Subscription;
  private errorSubscription!: Subscription;
  private wrongUsernameOrPasswordSubscription!: Subscription;

  messages = [
    "Hé, itt vagyok, itt lent!",
    "Kezdjük azzal, hogy létrehozunk neked egy fiókot!",
    "Ez azért fontos, hogy el tudjuk neked menteni az előző válaszaid. Így egyrészt nem kell újrakezdened a kérdőívet, ha nem lenne időd egyszerre megválaszolni az összes kérdést.",
    "Másrészt, ha készen vagy, bármikor visszajöhetsz, megnézheted a válaszaid és beszélgethetsz velem a digitalizációs tennivalókról ezek kapcsán. ",
    "Amennyiben van már fiókod, úgy csak szimplán jelentkezz be!"
  ]

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading: boolean;
  loginShown: boolean;
  authService: AuthService;
  siteKey : string;
  siteKey2 : string;

  constructor(authService: AuthService) {

    this.authService = authService;

    this.siteKey = "6LeP8gUqAAAAAL4MUGg5s66rYQIBM-mipuTyDXOo"
    this.siteKey2 = "6Lfu9QUqAAAAAIc5Iu3iw_R5qrES6AABQPlYcP75"

    this.isLoading = false;
    this.loginShown = true;

    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      recaptcha: new FormControl('', [Validators.required])
    });

    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      acceptedTerms: new FormControl(false, [Validators.required]),
      recaptcha: new FormControl('', [Validators.required])
    });

    this.manageSubscriptions();
  }

  private manageSubscriptions() {

    this.wrongUsernameOrPasswordSubscription = this.authService.wrongPasswordOrUsernameState.subscribe(isWrong => {
      
      if(isWrong)
        {
          this.loginForm.controls["password"].setValue("");
        }
    })

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

  ngAfterViewInit() {
    this.refreshCaptchas();
  }

  toggleForm(): void {
    this.loginForm.reset();
    this.registerForm.reset();
    this.loginShown = !this.loginShown;

    setTimeout(() => {
      this.refreshCaptchas();
    }, 0);
  }

  refreshCaptchas() {
    if (this.loginShown) {
      this.registerCaptchaElem?.resetCaptcha();
    } else {
      this.loginCaptchaElem?.resetCaptcha();
    }
  }

  ngOnDestroy() {
    if (this.authSubscription != null) {
      this.authSubscription.unsubscribe();
    }
    if (this.loadingSubscription != null) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.errorSubscription != null) {
      this.errorSubscription.unsubscribe();
    }
    if (this.wrongUsernameOrPasswordSubscription != null) {
      this.wrongUsernameOrPasswordSubscription.unsubscribe();
    }
  }
}
