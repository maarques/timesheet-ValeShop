import { Component } from '@angular/core';
import { ContainerModule } from '../../components/container/container.module';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-demandas',
  imports: [ContainerModule, Topbar],
  templateUrl: './demandas.html',
  styleUrl: './demandas.scss'
})
export class Demandas {
  containerStyle_barraPesquisa = {'max-height': '5px'};
}
