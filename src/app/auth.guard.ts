import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any,
    private loadingService: LoadingService
  ) {}

  private async isUserLoggedIn(): Promise<boolean> {
      const loggedIn = localStorage.getItem('currentUser');
      return loggedIn !== "" && loggedIn !== null;
    
  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    this.loadingService.setLoading(true);
    const isLoggedIn = await this.isUserLoggedIn();
    this.loadingService.setLoading(false);

    if (state.url === '/login' && isLoggedIn) {
      this.router.navigate(['/home']);
      return false;
    } else if (state.url !== '/login' && !isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}
