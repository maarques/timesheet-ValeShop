import { Component } from '@angular/core';
import { ContainerModule } from '../../components/container/container.module';

@Component({
  selector: 'app-demandas',
  imports: [ContainerModule],
  templateUrl: './demandas.html',
  styleUrl: './demandas.scss'
})
export class Demandas {
  containerStyle_barraPesquisa = {'max-height': '5px'};
}
