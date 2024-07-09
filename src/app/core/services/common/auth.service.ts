import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { environment } from '../../../../environments/environment';
import { IAuthResponse, User } from '../../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  private userSubject = new BehaviorSubject<User | null>(null);

  private jwtSubject = new BehaviorSubject<string | null>(null);
  jwt$ = this.jwtSubject.asObservable();
  user$ = this.userSubject.asObservable();

  isLoggedIn$ = this.user$.pipe(map(user => !!user));

  constructor() {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<void> {
    return this.http.post<IAuthResponse>(`${environment.apiLogin}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        tap(() => this.redirectToDashboard()),
        map(() => undefined)
      );
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigateByUrl('/auth/login');
  }

  private handleAuthResponse(response: IAuthResponse): void {
    this.tokenService.handleToken(response.access_token);
    localStorage.setItem('user_data', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private checkAuthStatus(): void {
    if (!this.tokenService.isAuthenticated()) {
      this.clearAuthData();
    } else {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      this.userSubject.next(JSON.parse(userData));
    } else {
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    this.tokenService.revokeToken();
    localStorage.removeItem('user_data');
    this.userSubject.next(null);
  }

  private redirectToDashboard(): void {
    this.router.navigateByUrl('/admin/dashboard');
  }

  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated() && !!this.userSubject.value;
  }
}