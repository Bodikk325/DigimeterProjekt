import { ChangeDetectorRef, Component, Injectable } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

export enum NotificationType {
  positivie,
  error,
  information
}

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translate(-50%, 20px)' }),  // Figyelembe vesszük a középre igazítást és a feljövő mozgást
        animate('300ms ease-out', style({ opacity: 0.9, transform: 'translate(-50%, 0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translate(-50%, 20px)' }))
      ])
    ])
  ]
})
export class NotificationComponent {
  message = '';
  show = false;
  type! : NotificationType;

  public ErrorState = NotificationType.error;
  public InformationState = NotificationType.information;
  public SuccessState = NotificationType.positivie;

  onDestroy!: () => void;

  display(message: string, type : NotificationType) {
    this.type = type;
    this.message = message;
    this.show = true;
    setTimeout(() => this.close(), 3000);
  }

  close() {
    this.show = false;
  }
}
