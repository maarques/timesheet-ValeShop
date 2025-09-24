import { Component } from '@angular/core';
import { PainelModule } from '../../components/painel/painel.module';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-dashboard',
  imports: [PainelModule, Topbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {

}
