import { Component, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  menuOpen = false;
  showLogOut = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logOut()
  {
    localStorage.removeItem("currentUser");
    this.router.navigateByUrl("login")
  }

  /**
   *
   */
  constructor(private router : Router) {
    afterNextRender(() => {
      if(localStorage.getItem("currentUser") != null)
        {
          this.showLogOut = true;
        }
    })
  }

}
