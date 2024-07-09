import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthInterceptorHttpService } from './core/interceptors/api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions(),  withHashLocation()),
    provideHttpClient(),
    provideAnimationsAsync(),
  ]
};
