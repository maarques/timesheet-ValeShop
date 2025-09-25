import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AuthLayout, FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };

  errorMessage: string | null = null;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.submitted = true; 
    this.errorMessage = null;

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, preencha o e-mail e a senha corretamente.';
      return; 
    }

    this.authService.login(this.credentials).subscribe({
      next: () => {
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = 'Email ou senha incorretos.';
        } else {
          this.errorMessage = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
        }
      }
    });
  }
}

