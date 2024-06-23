import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent {

  state : string = "Loading"

  confirmEmailStateSubscribe : Subscription;

  constructor(private route : ActivatedRoute, private authService : AuthService) {

    this.confirmEmailStateSubscribe = this.authService.confirmAddressState.subscribe(state => 
      this.state = state
    )
  }

  ngOnInit()
  {
    this.authService.confirmEmailAddress(this.route.snapshot.paramMap.get('token') ?? "0")
  }
}
