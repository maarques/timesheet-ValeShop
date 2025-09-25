import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { PainelService } from './painel.service';

class MockStorage implements Storage {
  length = 0;
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
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  private storage: Storage;

  constructor(
    private painelService: PainelService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = localStorage; 
    } else {
      this.storage = new MockStorage();
    }

    this.loadUserFromStorage();
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
        // Armazena o token e os dados do usuário (seguro para SSR)
        this.storage.setItem('token', response.token);
        this.storage.setItem('user_data', JSON.stringify(response.userResponseDTO));
        this.userSubject.next(response.userResponseDTO);

        // Redireciona com base no tipo de usuário
        if (response.userResponseDTO.userType === 'Administrador') {
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

