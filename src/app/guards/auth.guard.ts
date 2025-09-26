import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn$) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as Array<string>;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return authService.user$.pipe(
    take(1), 
    map(user => {
      if (user && allowedRoles.includes(user.userType)) {
        return true;
      } else {
        authService.logout(); 
        return false;
      }
    })
  );
};
