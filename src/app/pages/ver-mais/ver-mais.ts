import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerModule } from '../../components/container/container.module';

@Component({
  selector: 'app-ver-mais',
  imports: [CommonModule, FormsModule, ContainerModule],
  templateUrl: './ver-mais.html',
  styleUrl: './ver-mais.scss'
})
export class VerMais {
  abrirProblema = false;
  abrirObs = false;

  novoProblema = '';
  novaObs = '';

  problemas: { descricao: string; data: string }[] = [];
  observacoes: { descricao: string; data: string }[] = [];

  adicionarProblema() {
    if (this.novoProblema.trim()) {
      this.problemas.push({
        descricao: this.novoProblema,
        data: new Date().toLocaleDateString()
      });
      this.novoProblema = '';
      this.abrirProblema = false;
    }
  }

  adicionarObs() {
    if (this.novaObs.trim()) {
      this.observacoes.push({
        descricao: this.novaObs,
        data: new Date().toLocaleDateString()
      });
      this.novaObs = '';
      this.abrirObs = false;
    }
  }
}
