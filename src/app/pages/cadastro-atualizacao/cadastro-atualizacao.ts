import { Component } from '@angular/core';
import { ContainerModule } from '../../components/container/container.module';
import { Topbar } from '../../components/topbar/topbar';

@Component({
  selector: 'app-cadastro-atualizacao',
  imports: [ContainerModule, Topbar],
  templateUrl: './cadastro-atualizacao.html',
  styleUrls: ['./cadastro-atualizacao.scss']
})
export class CadastroAtualizacao {

}
