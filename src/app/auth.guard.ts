import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  private isUserLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const loggedIn = localStorage.getItem('currentUser');
      return loggedIn !== "" && loggedIn !== null;
    }
    return false;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.isUserLoggedIn();

    if (state.url === '/login' && isLoggedIn) {
      // If user is logged in and trying to access the login page, redirect to home
      this.router.navigate(['/home']);
      return false;
    } else if (state.url !== '/login' && !isLoggedIn) {
      // If user is not logged in and trying to access a protected route, redirect to login
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}