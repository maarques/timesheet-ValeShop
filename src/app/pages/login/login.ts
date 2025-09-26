import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  credentials = {
    email: '',
    password: '',
    rememberMe: false
  };
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, preencha o e-mail e a senha.';
      return;
    }

    this.errorMessage = null;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        setTimeout(() => {
          if (response.userResponseDTO.userType?.toLowerCase() === 'administrador') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/demandas']);
          }
        }, 0);
      },
      error: (err) => {
        this.errorMessage = 'Email ou senha inválidos. Por favor, tente novamente.';
      }
    });
  }
}

