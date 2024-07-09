import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/common/auth.service";
import { map } from "rxjs";
import { TokenService } from "../services/common/token.service";

export type ValidRole = 'personal' | 'estudiante';

export const roleGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  return authService.user$.pipe(
    map((user) => {
      if (user && (user.tipo_usuario === 'personal' || user.tipo_usuario === 'estudiante')) {
        return true;
      }
      
      tokenService.revokeToken();
      localStorage.removeItem('user_data');
      authService['userSubject'].next(null);
      
      return router.createUrlTree(['/auth/login']);
    })
  );
};