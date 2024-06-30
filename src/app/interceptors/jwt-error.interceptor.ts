import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationType } from '../notification/notification.component';
import { NotificationService } from '../services/notification.service';

export const jwtErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      if (error.error == "JwtHiba") {
        notificationService.show("Hiba történt a JWT token kezelésével! Kijelentkezés...", NotificationType.error)
        localStorage.removeItem("currentUser")
        setTimeout(() => {
          location.href = "login"
        }, 3000);
      }
      if (error.error == "CSRFHiba") {
        notificationService.show("CSRF token ellenőrzés hiba. Lehet, hogy lejárt a munkameneted? Kijelentkezés...", NotificationType.error)
        localStorage.removeItem("currentUser")
        setTimeout(() => {
          location.href = "login"
        }, 3000);
      }
      if (error.error == "LejártJwt") {
        notificationService.show("Lejárt az érvényes tokened! Kijelentkezés...", NotificationType.error)
        localStorage.removeItem("currentUser")
        setTimeout(() => {
          location.href = "login"
        }, 3000);
      }
      if (error.error == "LejartSession") {
        notificationService.show("Lejárt a munkamenet, kijelentkezés...", NotificationType.error)
        localStorage.removeItem("currentUser")
        setTimeout(() => {
          location.href = "login"
        }, 3000);
      }
      else 
      {
        notificationService.show("Valami hiba történt.. Kérünk, hogy probálkozz később, vagy jelezd felénk!", NotificationType.error)
      }
      return throwError(() => error)
    })
  );
};
