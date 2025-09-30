import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContainerModule } from '../../components/container/container.module';
import { ActivatedRoute, Router } from '@angular/router';
import { PainelService } from '../../services/painel.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ver-mais',
  standalone: true,
  imports: [CommonModule, FormsModule, ContainerModule, DatePipe],
  templateUrl: './ver-mais.html',
  styleUrl: './ver-mais.scss',
})
export class VerMais implements OnInit {
  demanda: any = null;
  isLoading = true;
  isAdmin = false;

  abrirProblema = false;
  abrirObs = false;
  abrirComentario = false;

  novoProblema = '';
  novaObs = '';
  novoComentario = '';

  itemEmEdicao: { tipo: 'problem' | 'observation' | 'comment'; index: number } | null = null;
  valorEmEdicao = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private painelService: PainelService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authService.isAdmin$.subscribe((isAdmin) => (this.isAdmin = isAdmin));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemanda(Number(id));
    } else {
      this.toastr.error('ID da demanda não encontrado.', 'Erro');
      this.router.navigate(['/demandas']);
    }
  }

  loadDemanda(id: number): void {
    this.isLoading = true;
    this.painelService.getDemandById(id).subscribe({
      next: (data) => {
        this.demanda = data;
        // Garante que os arrays existam, mesmo que nulos na resposta da API
        this.demanda.problems = this.demanda.problems || [];
        this.demanda.observations = this.demanda.observations || [];
        this.demanda.comments = this.demanda.comments || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar os detalhes da demanda.', 'Erro');
        this.isLoading = false;
        this.router.navigate(['/demandas']);
        this.cdr.detectChanges();
      },
    });
  }

  private traduzirTipo(tipo: 'problem' | 'observation' | 'comment'): string {
    const mapaDeTraducao = {
      problem: 'Problema',
      observation: 'Observação',
      comment: 'Comentário',
    };
    return mapaDeTraducao[tipo] || this.capitalize(tipo);
  }

  adicionarItem(
    tipo: 'problem' | 'observation' | 'comment',
    valor: string
  ): void {
    if (!valor.trim() || !this.demanda) return;

    const data = { [tipo + 's']: [valor] };

    this.painelService
      .registerProblemObservationOrComment(this.demanda.id, data)
      .subscribe({
        next: (updatedDemanda) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.success(
            `${tipoTraduzido} adicionado com sucesso!`,
            'Sucesso'
          );
          this.demanda = {
            ...updatedDemanda,
            problems: updatedDemanda.problems || [],
            observations: updatedDemanda.observations || [],
            comments: updatedDemanda.comments || [],
          };
          this.resetarFormulario(tipo);
          this.cdr.detectChanges();
        },
        error: (err) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.error(`Erro ao adicionar ${tipoTraduzido.toLowerCase()}.`, 'Erro');
        },
      });
  }

  iniciarEdicao(tipo: 'problem' | 'observation' | 'comment', index: number): void {
    this.abrirProblema = false;
    this.abrirObs = false;
    this.abrirComentario = false;

    this.itemEmEdicao = { tipo, index };

    switch (tipo) {
      case 'problem':
        this.valorEmEdicao = this.demanda.problems[index];
        break;
      case 'observation':
        this.valorEmEdicao = this.demanda.observations[index];
        break;
      case 'comment':
        this.valorEmEdicao = this.demanda.comments[index];
        break;
    }
  }

  iniciarEdicaoProblema(index: number): void {
    this.iniciarEdicao('problem', index);
  }

  iniciarEdicaoObservacao(index: number): void {
    this.iniciarEdicao('observation', index);
  }

  iniciarEdicaoComentario(index: number): void {
    this.iniciarEdicao('comment', index);
  }

  cancelarEdicao(): void {
    this.itemEmEdicao = null;
    this.valorEmEdicao = '';
  }

  atualizarItem(): void {
    if (!this.itemEmEdicao || !this.valorEmEdicao.trim()) {
      this.cancelarEdicao();
      return;
    }

    const { tipo, index } = this.itemEmEdicao;
    const data = { [tipo]: this.valorEmEdicao };

    this.painelService
      .updateProblemObservationOrComment(this.demanda.id, index, data)
      .subscribe({
        next: () => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.success(`${tipoTraduzido} atualizado com sucesso!`, 'Sucesso');

          this.demanda[tipo + 's'][index] = this.valorEmEdicao;

          this.cancelarEdicao();
          this.cdr.detectChanges();
        },
        error: (err) => {
          const tipoTraduzido = this.traduzirTipo(tipo);
          this.toastr.error(`Erro ao atualizar ${tipoTraduzido.toLowerCase()}.`, 'Erro');
          this.cancelarEdicao();
        },
      });
  }

  excluirItem(tipo: 'problem' | 'observation' | 'comment', index: number): void {
    if (this.demanda === null) return;

    let deleteObservable;
    switch (tipo) {
      case 'problem':
        deleteObservable = this.painelService.deleteProblem(
          this.demanda.id,
          index
        );
        break;
      case 'observation':
        deleteObservable = this.painelService.deleteObservation(
          this.demanda.id,
          index
        );
        break;
      case 'comment':
        deleteObservable = this.painelService.deleteComment(
          this.demanda.id,
          index
        );
        break;
    }

    deleteObservable.subscribe({
      next: () => {
        const tipoTraduzido = this.traduzirTipo(tipo);
        this.toastr.success(
          `${tipoTraduzido} excluído com sucesso!`,
          'Sucesso'
        );
        this.loadDemanda(this.demanda.id); // Recarrega para obter o estado mais recente
      },
      error: (err) => {
        const tipoTraduzido = this.traduzirTipo(tipo);
        this.toastr.error(`Erro ao excluir ${tipoTraduzido.toLowerCase()}.`, 'Erro');
      },
    });
  }

  resetarFormulario(tipo: 'problem' | 'observation' | 'comment'): void {
    if (tipo === 'problem') {
      this.novoProblema = '';
      this.abrirProblema = false;
    }
    if (tipo === 'observation') {
      this.novaObs = '';
      this.abrirObs = false;
    }
    if (tipo === 'comment') {
      this.novoComentario = '';
      this.abrirComentario = false;
    }
  }

  capitalize(s: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  editarDemanda(): void {
    if (this.demanda && this.demanda.id) {
      console.log('Navegando para editar demanda com ID:', this.demanda.id);
      this.router.navigate(['/editar-demanda', this.demanda.id]);
    }
  }

  voltar(): void {
    this.router.navigate(['/demandas']);
  }
}

