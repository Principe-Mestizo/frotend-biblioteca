import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/common/auth.service';
import { TokenService } from '../services/common/token.service';

export const isLoggedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  const isAuthenticated = inject(TokenService).isAuthenticated();
  if (isAuthenticated)
    return true;

  authService.logout();
  inject(Router).navigateByUrl('/auth/login')

  return false;
};


export const isntLoggedGuard: CanActivateFn = (route, state) => {

  const isAuthenticated = inject(TokenService).isAuthenticated();
  if (!isAuthenticated)
    return true;
  inject(Router).navigateByUrl('/admin/dashboard')

  return false;
};

