import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ContainerModule } from '../../components/container/container.module';
import { PainelService } from '../../services/painel.service';
import { ToastrService } from 'ngx-toastr';
import { Chart, registerables } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { ReplacePipe } from '../../util/replace.pipe'; // Importação do Pipe

// Definindo a interface para os dados da demanda com a nova estrutura
interface Demanda {
  id: number;
  title: string;
  priority: number;
  status: string;
  date: string;
  description: string;
  owner: string; // Propriedade 'user' foi trocada por 'owner'
  gitLink: string;
  problems: string[] | null;
  observations: string[] | null;
  comments: string[] | null;
}

// Definindo a interface para os usuários
interface User {
  id: number;
  email: string;
  userType: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ContainerModule, FormsModule, DatePipe, ReplacePipe], // Adicionado o Pipe aos imports
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  // Referências aos elementos canvas para os gráficos
  @ViewChild('demandasPorFuncionarioChart') private demandasPorFuncionarioChartRef!: ElementRef;
  @ViewChild('atrasoDeDemandasChart') private atrasoDeDemandasChartRef!: ElementRef;

  // Propriedades de dados
  demandas: Demanda[] = [];
  usuarios: User[] = [];
  demandasFiltradas: Demanda[] = [];
  demandasPaginadas: Demanda[] = [];

  // Estatísticas do dashboard
  totalDemandasAtivas = 0;
  demandasConcluidas = 0;
  demandasAtrasadas = 0;
  funcionarioComMaisDemandas = { nome: 'N/A', quantidade: 0 };
  resumoTexto = '';

  // Gráficos
  demandasPorFuncionarioChart: Chart | undefined;
  atrasoDeDemandasChart: Chart | undefined;

  // Filtros
  filtros = {
    funcionarioId: 'todos',
    prioridade: 'todas',
    dataInicio: '',
    dataFim: ''
  };

  // Controle de paginação
  paginaAtual = 1;
  itensPorPagina = 5;

  constructor(
    private painelService: PainelService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  ngAfterViewInit(): void {
    // Os gráficos são inicializados aqui, após a view ser carregada
    // e os elementos canvas estarem disponíveis.
  }

  ngOnDestroy(): void {
    // Destruir os gráficos para evitar memory leaks
    this.demandasPorFuncionarioChart?.destroy();
    this.atrasoDeDemandasChart?.destroy();
  }

  carregarDados(): void {
    // Carrega usuários e demandas em paralelo
    Promise.all([
      this.painelService.getAllUsers().toPromise(),
      this.painelService.getAllDemandRecord().toPromise()
    ]).then(([usuarios, demandas]) => {
      this.usuarios = usuarios || [];
      this.demandas = demandas || [];
      this.aplicarFiltros(); // Aplica filtros iniciais (ou seja, mostra tudo)
      this.cdr.detectChanges(); // Força a detecção de mudanças
    }).catch(err => {
      this.toastr.error('Erro ao carregar os dados do dashboard.', 'Erro');
      console.error(err);
    });
  }

  aplicarFiltros(): void {
    let demandasResultantes = [...this.demandas];

    // Filtro por funcionário
    if (this.filtros.funcionarioId !== 'todos') {
      const selectedUser = this.usuarios.find(u => u.id === Number(this.filtros.funcionarioId));
      if (selectedUser) {
        const ownerName = selectedUser.email.split('@')[0];
        demandasResultantes = demandasResultantes.filter(d => d.owner === ownerName);
      }
    }

    // Filtro por prioridade
    if (this.filtros.prioridade !== 'todas') {
      demandasResultantes = demandasResultantes.filter(d => d.priority === Number(this.filtros.prioridade));
    }

    // Filtro por período (data)
    if (this.filtros.dataInicio || this.filtros.dataFim) {
      const dataInicio = this.filtros.dataInicio ? new Date(this.filtros.dataInicio) : null;
      const dataFim = this.filtros.dataFim ? new Date(this.filtros.dataFim) : null;

      if(dataInicio) dataInicio.setHours(0, 0, 0, 0);
      if(dataFim) dataFim.setHours(23, 59, 59, 999); // Final do dia

      demandasResultantes = demandasResultantes.filter(d => {
        const dataDemanda = new Date(d.date);
        
        const afterStart = dataInicio ? dataDemanda >= dataInicio : true;
        const beforeEnd = dataFim ? dataDemanda <= dataFim : true;
        
        return afterStart && beforeEnd;
      });
    }

    this.demandasFiltradas = demandasResultantes;
    this.paginaAtual = 1; // Reseta para a primeira página ao filtrar
    this.atualizarDashboard();
  }
  
  limparFiltros(): void {
    this.filtros = {
      funcionarioId: 'todos',
      prioridade: 'todas',
      dataInicio: '',
      dataFim: ''
    };
    this.aplicarFiltros();
  }

  private atualizarDashboard(): void {
    this.calcularEstatisticas();
    this.gerarResumoTexto();
    this.atualizarGraficos();
    this.atualizarPaginacao();
  }

  // Métodos de Paginação
  atualizarPaginacao(): void {
    const indiceInicial = (this.paginaAtual - 1) * this.itensPorPagina;
    const indiceFinal = indiceInicial + this.itensPorPagina;
    this.demandasPaginadas = this.demandasFiltradas.slice(indiceInicial, indiceFinal);
    this.cdr.detectChanges();
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual = pagina;
      this.atualizarPaginacao();
    }
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  totalPaginas(): number {
    return Math.ceil(this.demandasFiltradas.length / this.itensPorPagina);
  }

  getPaginas(): number[] {
    const total = this.totalPaginas();
    if (total <= 1) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  private calcularEstatisticas(): void {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    this.totalDemandasAtivas = this.demandasFiltradas.filter(d => d.status !== 'Concluída').length;
    this.demandasConcluidas = this.demandasFiltradas.filter(d => d.status === 'Concluída').length;
    this.demandasAtrasadas = this.demandasFiltradas.filter(d => {
      const prazo = new Date(d.date);
      prazo.setHours(0,0,0,0);
      return d.status !== 'Concluída' && prazo < hoje;
    }).length;

    // Calcular funcionário com mais demandas
    const contagemPorFuncionario: { [key: string]: number } = {};
    this.demandasFiltradas.forEach(demanda => {
      const nome = this.getNomeAbreviado(demanda.owner);
      if (nome && nome !== 'N/A') {
        contagemPorFuncionario[nome] = (contagemPorFuncionario[nome] || 0) + 1;
      }
    });

    let maxDemandas = 0;
    let nomeFuncionario = 'N/A';
    for (const nome in contagemPorFuncionario) {
      if (contagemPorFuncionario[nome] > maxDemandas) {
        maxDemandas = contagemPorFuncionario[nome];
        nomeFuncionario = nome;
      }
    }

    this.funcionarioComMaisDemandas = { nome: nomeFuncionario, quantidade: maxDemandas };
  }

  private gerarResumoTexto(): void {
    const nome = this.funcionarioComMaisDemandas.nome;
    const qtd = this.funcionarioComMaisDemandas.quantidade;
    this.resumoTexto = `Hoje temos ${this.totalDemandasAtivas} demandas ativas, ${this.demandasAtrasadas} atrasadas e ${nome} é o funcionário com mais demandas (${qtd}).`;
  }

  private atualizarGraficos(): void {
    // Destruir gráficos existentes antes de criar novos
    if (this.demandasPorFuncionarioChart) {
      this.demandasPorFuncionarioChart.destroy();
    }
    if (this.atrasoDeDemandasChart) {
      this.atrasoDeDemandasChart.destroy();
    }

    // Atraso de alguns milissegundos para garantir que o canvas seja renderizado antes de desenhar o gráfico
    setTimeout(() => {
        this.criarGraficoDemandasPorFuncionario();
        this.criarGraficoAtrasoDeDemandas();
    }, 100);
  }

  private criarGraficoDemandasPorFuncionario(): void {
    if (!this.demandasPorFuncionarioChartRef) return;
  
    const contagemPorFuncionario: { [key: string]: number } = {};
    this.demandasFiltradas.forEach(demanda => {
      const nome = this.getNomeAbreviado(demanda.owner);
      if (nome && nome !== 'N/A') {
        contagemPorFuncionario[nome] = (contagemPorFuncionario[nome] || 0) + 1;
      }
    });
  
    const labels = Object.keys(contagemPorFuncionario);
    const data = Object.values(contagemPorFuncionario);
  
    this.demandasPorFuncionarioChart = new Chart(this.demandasPorFuncionarioChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Quantidade de Demandas',
          data: data,
          backgroundColor: 'rgba(0, 86, 158, 0.6)',
          borderColor: 'rgba(0, 86, 158, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantidade' }
          },
          x: {
            title: { display: true, text: 'Funcionário' }
          }
        }
      }
    });
  }

  private criarGraficoAtrasoDeDemandas(): void {
    if (!this.atrasoDeDemandasChartRef) return;
  
    // Agrupa demandas atrasadas por mês
    const atrasosPorMes: { [key: string]: number } = {};
    const hoje = new Date();
  
    this.demandasFiltradas
      .filter(d => new Date(d.date) < hoje && d.status !== 'Concluída')
      .forEach(demanda => {
        const mesAno = new Date(demanda.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        atrasosPorMes[mesAno] = (atrasosPorMes[mesAno] || 0) + 1;
      });
  
    const labels = Object.keys(atrasosPorMes);
    const data = Object.values(atrasosPorMes);
  
    this.atrasoDeDemandasChart = new Chart(this.atrasoDeDemandasChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Demandas Atrasadas',
          data: data,
          backgroundColor: 'rgba(211, 47, 47, 0.6)',
          borderColor: 'rgba(211, 47, 47, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Quantidade' }
          },
          x: {
            title: { display: true, text: 'Período' }
          }
        }
      }
    });
  }
  
  getNomeAbreviado(name: string | null | undefined): string {
    if (!name) return 'N/A';
    // Lida tanto com email ('usuario@email.com') quanto com nome de usuário ('usuario')
    const nome = name.split('@')[0];
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }
}

