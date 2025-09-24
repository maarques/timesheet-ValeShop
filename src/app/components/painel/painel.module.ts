import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Painel } from './painel';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ContainerModule } from '../container/container.module';

@NgModule({
  declarations: [Painel],
  imports: [
    CommonModule, 
    ChartModule, 
    TableModule, 
    ButtonModule,
    ContainerModule
  ],
  exports: [Painel]
})
export class PainelModule {}
