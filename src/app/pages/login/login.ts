import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
    password: ''
  };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = null;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        console.log('Login bem-sucedido!');
      },
      error: (err) => {
        this.errorMessage = 'Email ou senha inválidos. Por favor, tente novamente.';
        console.error('Erro no login', err);
      }
    });
  }
}

