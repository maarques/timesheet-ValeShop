import { Component } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { Topbar } from '../..//components/topbar/topbar';

@Component({
  selector: 'app-login',
  imports: [AuthLayout, Topbar],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
