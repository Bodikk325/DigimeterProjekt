import { Component, afterNextRender } from '@angular/core';

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

  /**
   *
   */
  constructor() {
    afterNextRender(() => {
      if(localStorage.getItem("currentUser") != null)
        {
          this.showLogOut = true;
        }
    })
  }

}
