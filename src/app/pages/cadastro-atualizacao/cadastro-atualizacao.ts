import { Component } from '@angular/core';
import { ContainerModule } from '../../components/container/container.module';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro-atualizacao',
  imports: [
    ContainerModule,
    RouterLink
  ],
  templateUrl: './cadastro-atualizacao.html',
  styleUrls: ['./cadastro-atualizacao.scss']
})
export class CadastroAtualizacao {

}
