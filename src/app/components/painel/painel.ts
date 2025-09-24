import { Component, OnInit } from '@angular/core';
import { PainelService } from '../../services/painel.service';

@Component({
  selector: 'app-painel',
  standalone: false,
  templateUrl: './painel.html',
  styleUrls: ['./painel.scss']
})
export class Painel implements OnInit {
  resumo: any;
  demandas: any[] = [];
  chartFuncionarios: any;
  chartAtraso: any;

  dataAtual!: string;

  constructor(private painelService: PainelService) {}

  ngOnInit(): void {
    this.resumo = this.painelService.getResumo();
    this.demandas = this.painelService.getDemandas();
    this.chartFuncionarios = this.painelService.getChartFuncionarios();
    this.chartAtraso = this.painelService.getChartAtraso();

    const hoje = new Date();
    this.dataAtual = hoje.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
