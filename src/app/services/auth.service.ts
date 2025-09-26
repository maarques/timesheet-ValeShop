import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { PainelService } from './painel.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private userSubject = new BehaviorSubject<any>(null);
  private rememberMe = false;

  user$ = this.userSubject.asObservable();
  isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user));
  isAdmin$: Observable<boolean> = this.user$.pipe(
    map(user => user?.userType?.toLowerCase() === 'administrador')
  );

  private storage: Storage | MockStorage;

  constructor(
    private painelService: PainelService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = localStorage; 
    } else {
      this.storage = new MockStorage();
    }
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const rememberMe = this.storage.getItem('rememberMe') === 'true';
    if (!rememberMe) {
      this.clearStorage();
      return;
    }

    const user = this.storage.getItem('user');
    const token = this.storage.getItem('token');

    if (user && token) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  getCurrentUser(): any {
    return this.userSubject.getValue();
  }

  login(credentials: { email: string, password: string, rememberMe: boolean }): Observable<any> {
    this.rememberMe = credentials.rememberMe;

    return this.painelService.login(credentials).pipe(
      tap((response: any) => {
        const user = response.userResponseDTO;
        const token = response.token;

        this.storage.setItem('user', JSON.stringify(user));
        this.storage.setItem('token', token);
        this.storage.setItem('rememberMe', this.rememberMe.toString());

        this.userSubject.next(user);
      }),
      catchError(err => {
        this.clearStorage();
        throw err;
      })
    );
  }

  register(credentials: { email: string, password: string }): Observable<any> {
    const registerData = {
      ...credentials,
      userType: 'Normal' 
    };
    return this.painelService.registerUser(registerData);
  }
  
  logout(): void {
    this.clearStorage();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  private clearStorage(): void {
    this.storage.removeItem('user');
    this.storage.removeItem('token');
    this.storage.removeItem('rememberMe');
  }

   isLoggedIn(): boolean {
    return !!this.storage.getItem('token');
  }

}

// Classe auxiliar para ambientes não-browser (SSR)
class MockStorage implements Storage {
  [name: string]: any;
  length = 0;
  clear(): void {}
  getItem(key: string): string | null { return null; }
  key(index: number): string | null { return null; }
  removeItem(key: string): void {}
  setItem(key: string, value: string): void {}
}

