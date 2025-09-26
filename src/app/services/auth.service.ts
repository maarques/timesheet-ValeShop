import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, map, Observable } from 'rxjs';
import { PainelService } from './painel.service';

// Classe auxiliar para o ambiente de servidor (SSR)
class MockStorage implements Storage {
  [name: string]: any;
  length: number = 0;
  clear(): void {}
  getItem(key: string): string | null { return null; }
  key(index: number): string | null { return null; }
  removeItem(key: string): void {}
  setItem(key: string, value: string): void {}
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();
  isAdmin$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>;

  private storage: Storage;
  private rememberMe = false;

  constructor(
    private painelService: PainelService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAdmin$ = this.user$.pipe(
      map(user => {
        return !!user && user.userType?.toLowerCase() === 'administrador';
      })
    );
    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
    this.storage = isPlatformBrowser(this.platformId)
      ? localStorage
      : new MockStorage();

    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const remember = this.storage.getItem('rememberMe') === 'true';
    const user = this.storage.getItem('user_data');

    if (user && remember) {
      this.userSubject.next(JSON.parse(user));
      this.rememberMe = true;
    } else {
      this.clearStorage();
    }
  }

  login(credentials: { email: string, password: string, rememberMe: boolean }) {
    return this.painelService.login(credentials).pipe(
      tap((response: any) => {
        this.rememberMe = credentials.rememberMe;

        this.storage.setItem('token', response.token);
        this.storage.setItem('user_data', JSON.stringify(response.userResponseDTO));
        this.storage.setItem('rememberMe', JSON.stringify(this.rememberMe));

        this.userSubject.next(response.userResponseDTO);

      })
    );
  }

  logout() {
    this.clearStorage();
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.storage.getItem('token');
  }

  getCurrentUser(): any | null {
    return this.userSubject.getValue();
  }

  private clearStorage(): void {
    this.storage.removeItem('token');
    this.storage.removeItem('user_data');
    this.storage.removeItem('rememberMe');
  }
}

