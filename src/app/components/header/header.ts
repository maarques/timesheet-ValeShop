import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$;
  }

  logout() {
    this.authService.logout();
  }
}

