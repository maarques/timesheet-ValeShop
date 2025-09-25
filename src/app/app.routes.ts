import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Demandas } from './pages/demandas/demandas';
import { CadastroAtualizacao } from './pages/cadastro-atualizacao/cadastro-atualizacao';
import { VerMais } from './pages/ver-mais/ver-mais';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard'; 

export const routes: Routes = [
  // Rotas Públicas (não precisam de login)
  {
    path: 'login',
    loadComponent: () => Login
  },
  {
    path: 'register',
    loadComponent: () => Register
  },
  // Rotas Protegidas (precisam de login)
  {
    path: 'demandas',
    loadComponent: () => Demandas,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Normal'] }
  },
  {
    path: 'cadastro-demanda',
    loadComponent: () => CadastroAtualizacao,
    canActivate: [authGuard],
    data: { roles: ['Normal'] } 
  },
  {
    path: 'ver-mais', 
    loadComponent: () => VerMais,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Normal'] }
  },
  {
    path: 'dashboard',
    loadComponent: () => Dashboard,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] } 
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

