import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      // Csak kliensoldalon futtassuk ezt a kódot
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn) {
        this.router.navigate(['home'])
        return true;
      } else {
        this.router.navigate(['']);
        return false;
      }
    } else {
      // SSR esetén alapértelmezett elágazás
      // Itt dönthetsz úgy, hogy mindenkit átengedsz, vagy esetlegesen szerveroldali logikát alkalmazol
      return true; // vagy false, attól függően, hogy milyen viselkedést szeretnél
    }
  }
}