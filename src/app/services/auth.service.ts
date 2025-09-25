import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, map, Observable } from 'rxjs';
import { PainelService } from './painel.service';

// Classe auxiliar para ambiente não-browser (SSR)
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

  constructor(
    private painelService: PainelService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.storage = isPlatformBrowser(this.platformId) ? localStorage : new MockStorage();
    this.loadUserFromStorage();

    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
    this.isAdmin$ = this.user$.pipe(
      // Verificação case-insensitive para robustez
      map(user => !!user && user.userType?.toLowerCase() === 'administrador')
    );
  }

  private loadUserFromStorage(): void {
    const user = this.storage.getItem('user_data');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(credentials: { email: string, password: string }) {
    return this.painelService.login(credentials).pipe(
      tap((response: any) => {
        this.storage.setItem('token', response.token);
        this.storage.setItem('user_data', JSON.stringify(response.userResponseDTO));
        this.userSubject.next(response.userResponseDTO);

        if (response.userResponseDTO.userType?.toLowerCase() === 'administrador') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/demandas']);
        }
      })
    );
  }

  logout() {
    this.storage.removeItem('token');
    this.storage.removeItem('user_data');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.storage.getItem('token');
  }
}

