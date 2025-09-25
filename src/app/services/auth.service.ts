import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { PainelService } from './painel.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private painelService: PainelService, private router: Router) {
    const user = localStorage.getItem('user_data');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(credentials: { email: string, password: string }) {
    return this.painelService.login(credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.userResponseDTO));
        this.userSubject.next(response.userResponseDTO);

        if (response.userResponseDTO.userType === 'Administrador') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/demandas']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
