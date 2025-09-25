import { Component } from '@angular/core';
import { PainelModule } from '../../components/painel/painel.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [PainelModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
