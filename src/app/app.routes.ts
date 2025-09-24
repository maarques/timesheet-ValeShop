import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Demandas } from './pages/demandas/demandas';
import { CadastroAtualizacao } from './pages/cadastro-atualizacao/cadastro-atualizacao';
import { VerMais } from './pages/ver-mais/ver-mais';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => Login
  },
  {
    path: 'register',
    loadComponent: () => Register
  },
  {
    path: 'demandas',
    loadComponent: () => Demandas
  },
  {
    path: 'cadastro-demanda',
    loadComponent: () => CadastroAtualizacao
  },
  {
    path: 'ver-mais',
    loadComponent: () => VerMais
  },
  {
    path: 'dashboard',
    loadComponent: () => Dashboard
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];
