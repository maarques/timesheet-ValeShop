import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AuthLayout,
    RouterLink
  ],
  templateUrl: './resendVerification.html',
  styleUrls: ['./resendVerification.scss']
})
export class ResendVerification {
  email: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Por favor, preencha o e-mail.';
      return;
    }

    this.errorMessage = null;
    this.authService.resendVerifyEmail(this.email).subscribe({
      next: (response) => {
        console.log(response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = 'Erro ao reenviar o e-mail de verificação. Por favor, tente novamente.';
      }
    });
  }
}
