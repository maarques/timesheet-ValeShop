import { Component } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-register',
  imports: [AuthLayout, Topbar],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

}
