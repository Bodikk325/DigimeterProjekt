import { Component, HostListener, afterNextRender } from '@angular/core';
import { ChatService } from './chat.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { NotificationService } from './notification.service';
import { CsrfService } from './csrf.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DigimeterProjekt';
  csrfSubscribe! : Subscription;
  /**
   *
   */
  constructor(private csrfService : CsrfService) {
    afterNextRender(() => {
      this.csrfSubscribe = this.csrfService.getCsrfToken().subscribe();
    })
  }

  ngOnDestroy()
  {
    if(this.csrfSubscribe != null)
    {
      this.csrfSubscribe.unsubscribe();
    }
  }

  
}
