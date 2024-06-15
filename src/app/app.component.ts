import { Component, HostListener, afterNextRender } from '@angular/core';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { CsrfService } from './services/csrf.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DigimeterProjekt';
  csrfSubscribe! : Subscription;

  loading = false;
  /**
   *
   */
  constructor(private csrfService : CsrfService, private router : Router, private loadingService : LoadingService) {
    
    afterNextRender(() => {
      this.csrfSubscribe = this.csrfService.getCsrfToken().subscribe();
    })
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.setLoading(true);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loadingService.setLoading(false);
      }
    });
  }

  

  ngOnDestroy()
  {
    if(this.csrfSubscribe != null)
    {
      this.csrfSubscribe.unsubscribe();
    }
  }

  
}
