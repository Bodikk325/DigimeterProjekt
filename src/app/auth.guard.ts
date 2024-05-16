import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {}

  private isUserLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const loggedIn = localStorage.getItem('isLoggedIn');
      return loggedIn === 'true';
    }
    return false;
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (state.url === '/') {
      if (this.isUserLoggedIn()) {
        this.router.navigate(['/home']);
        return false;
      } else {
        return true;
      }
    } else {
      if (this.isUserLoggedIn()) {
        return true;
      } else {
        this.router.navigate(['/']);
        return false;
      }
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.isUserLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}