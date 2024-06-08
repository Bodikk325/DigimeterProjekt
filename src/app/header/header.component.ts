import { ChangeDetectorRef, Component, afterNextRender } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  menuOpen! : boolean;
  showLogOut! : boolean;
  authService! : AuthService;
  private cdRef!: ChangeDetectorRef;

  constructor(authService : AuthService, cdRef: ChangeDetectorRef) {
    this.authService = authService;
    this.menuOpen = false;
    this.showLogOut = false;
    this.cdRef = cdRef;

    afterNextRender(() => this.initializeAfterNextRenderVariables())
  }


  initializeAfterNextRenderVariables()
  {
    this.showLogOut = this.authService.checkIfUserIsLoggedIn()
    this.cdRef.detectChanges()
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
