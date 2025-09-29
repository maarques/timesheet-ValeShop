import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  credentials = {
    email: '',
    password: '',
    confirmPassword: ''
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password || !this.credentials.confirmPassword) {
      this.toastr.error('Por favor, preencha todos os campos.', 'Erro de Validação');
      return;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.toastr.error('As senhas não coincidem.', 'Erro de Validação');
      return;
    }

    const registerData = {
      email: this.credentials.email,
      password: this.credentials.password
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.toastr.success('Conta criada com sucesso! Verifique seu e-mail para ativar.', 'Sucesso!');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        const message = err.error?.message || 'Erro ao registrar. O e-mail já pode estar em uso.';
        this.toastr.error(message, 'Erro no Registo');
      }
    });
  }
}