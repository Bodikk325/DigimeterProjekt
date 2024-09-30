import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationType } from '../notification/notification.component';
import { NotificationService } from '../services/notification.service';

export const jwtErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      if (error.error.error === "JwtHiba") {
        notificationService.show("Hiba történt a JWT token kezelésével! Kijelentkezés...", NotificationType.error);
        localStorage.removeItem("currentUser");
        setTimeout(() => {
          location.href = "login";
        }, 3000);
        return throwError(() => error);
      } else if (error.error.error === "CSRFHiba") {
        notificationService.show("CSRF token ellenőrzés hiba. Lehet, hogy lejárt a munkamenet? Kijelentkezés...", NotificationType.error);
        localStorage.removeItem("currentUser");

        // Frissítjük a CSRF tokent, ha a válaszban benne van
        if (error.error.csrf_token) {
          document.cookie = `csrf_token=${error.error.csrf_token}; path=/; samesite=strict; secure=false; httponly=true`;
        }
        
        setTimeout(() => {
          location.href = "login";
        }, 3000);
        return throwError(() => error);
      } 
      else if (error.error.error === "LejartSession") {
        notificationService.show("Lejárt a munkamenet! Kijelentkezés..", NotificationType.error);
        localStorage.removeItem("currentUser");

        // Frissítjük a CSRF tokent, ha a válaszban benne van
        if (error.error.csrf_token) {
          document.cookie = `csrf_token=${error.error.csrf_token}; path=/; samesite=strict; secure=false; httponly=true`;
        }
        
        setTimeout(() => {
          location.href = "login";
        }, 3000);
        return throwError(() => error);
      } 
      else if (error.error.error === "LejártJwt") {
        notificationService.show("Lejárt az érvényes token! Kijelentkezés...", NotificationType.error);
        localStorage.removeItem("currentUser");
        setTimeout(() => {
          location.href = "login";
        }, 3000);
        return throwError(() => error);
      } else {
        notificationService.show("Valami hiba történt.. Kérjük probálkozzon később, vagy jelezzen felénk!", NotificationType.error);
      }
      return throwError(() => error);
    })
  );
};
