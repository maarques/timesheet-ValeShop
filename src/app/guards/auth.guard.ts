import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    filter((user) => user !== null), 
    take(1),
    switchMap((user) => {
      if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return [false];
      }

      const allowedRoles = route.data['roles'] as Array<string>;
      if (!allowedRoles || allowedRoles.length === 0) {
        return [true];
      }

      if (user && allowedRoles.includes(user.userType)) {
        return [true];
      } else {
        authService.logout();
        return [false];
      }
    })
  );
};
