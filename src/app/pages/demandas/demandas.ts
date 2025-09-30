import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ContainerModule } from '../../components/container/container.module';
import { PainelService } from '../../services/painel.service';
import { AuthService } from '../../services/auth.service';
import { Observable, of, Subscription } from 'rxjs';
import { ConfirmationModal } from './confirmation-modal/confirmation-modal';
import { take, filter } from 'rxjs/operators';

@Component({
  selector: 'app-demandas',
  standalone: true,
  imports: [
    CommonModule,
    ContainerModule,
    RouterLink,
    DatePipe,
    ConfirmationModal,
  ],
  templateUrl: './demandas.html',
  styleUrl: './demandas.scss',
})
export class Demandas implements OnInit, OnDestroy {
  demandas: any[] = [];
  isLoading = true;
  isModalOpen = false;
  demandaParaExcluir: number | null = null;
  isAdmin = false;
  private authSubscription: Subscription | undefined;

  constructor(
    private painelService: PainelService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.user$.pipe(
      filter(user => user !== null), // Aguarda até que o usuário esteja carregado
      take(1) // Pega apenas a primeira emissão de usuário válido
    ).subscribe(user => {
      this.isAdmin = user?.userType?.toLowerCase() === 'administrador';
      this.loadDemandas();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadDemandas(): void {
    this.isLoading = true;

    const demandas$: Observable<any> = this.isAdmin 
      ? this.painelService.getAllDemandRecord() 
      : this.painelService.getUserAllDemandRecord();

    demandas$.subscribe({
      next: (data) => {
        this.demandas = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Apenas mostra o erro se não for um erro de "token inválido" ao deslogar
        if (err.status !== 401 && err.error?.message !== 'Token inválido') {
          this.toastr.error(
            'Erro ao carregar as demandas. Tente novamente mais tarde.',
            'Erro'
          );
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  solicitarExclusao(demandaId: number): void {
    this.demandaParaExcluir = demandaId;
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
    this.demandaParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (this.demandaParaExcluir === null) {
      return;
    }

    this.painelService.deleteDemand(this.demandaParaExcluir).subscribe({
      next: () => {
        this.toastr.success('Demanda excluída com sucesso!', 'Sucesso');
        this.demandas = this.demandas.filter(
          (d) => d.id !== this.demandaParaExcluir
        );
        this.fecharModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Erro ao excluir a demanda.', 'Erro');
        this.fecharModal();
      },
    });
  }

  verMais(demandaId: number): void {
    this.router.navigate(['/ver-mais', demandaId]);
  }
}
