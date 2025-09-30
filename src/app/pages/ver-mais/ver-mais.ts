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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private painelService: PainelService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

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

  adicionarItem(
    tipo: 'problem' | 'observation' | 'comment',
    valor: string
  ): void {
    if (!valor.trim() || !this.demanda) return;

    // A API espera um objeto com a chave correspondente ('problem', 'observation' ou 'comment')
    const data = { [tipo]: [valor] };
    console.log(data);

    this.painelService
      .registerProblemObservationOrComment(this.demanda.id, data)
      .subscribe({
        next: (updatedDemanda) => {
          this.toastr.success(
            `${this.capitalize(tipo)} adicionado com sucesso!`,
            'Sucesso'
          );
          // Atualiza os dados locais com a resposta da API sem recarregar tudo
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
          this.toastr.error(`Erro ao adicionar ${tipo}.`, 'Erro');
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
        this.toastr.success(
          `${this.capitalize(tipo)} excluído com sucesso!`,
          'Sucesso'
        );
        this.loadDemanda(this.demanda.id); // Recarrega para obter o estado mais recente
      },
      error: (err) => {
        this.toastr.error(`Erro ao excluir ${tipo}.`, 'Erro');
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

  voltar(): void {
    this.router.navigate(['/demandas']);
  }
}

