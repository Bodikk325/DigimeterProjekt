import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  menuOpen! : boolean;
  showLogOut! : boolean;
  authService! : AuthService;

  constructor(authService : AuthService) {
    this.authService = authService;
    this.menuOpen = false;
    this.showLogOut = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
