import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PainelService {

  getResumo() {
    return {
      total: 42,
      concluidas: 27,
      atrasadas: 5,
      funcionarioTop: 'João Silva'
    };
  }

  getDemandas() {
    return [
      { funcionario: 'João Silva', titulo: 'TimeSheet', prioridade: 1, status: 'Iniciada', prazo: '30/09/2025' },
      { funcionario: 'Carlinhos', titulo: 'Automação Financeiro', prioridade: 2, status: 'Liberada para Teste', prazo: '21/09/2025' },
      { funcionario: 'Mariazinha', titulo: 'Refatoração Sistema Interno', prioridade: 3, status: 'Autorizada para Produção', prazo: '21/09/2025' }
    ];
  }

  getChartFuncionarios() {
    return {
      labels: ['João Silva', 'Carlinhos', 'Mariazinha'],
      datasets: [
        {
          label: 'Demandas',
          data: [12, 8, 5],
          backgroundColor: '#42A5F5'
        }
      ]
    };
  }

  getChartAtraso() {
    return {
      labels: ['01/09', '05/09', '10/09', '15/09'],
      datasets: [
        {
          label: 'Atrasos',
          data: [1, 3, 2, 5],
          backgroundColor: '#EF5350'
        }
      ]
    };
  }
}
