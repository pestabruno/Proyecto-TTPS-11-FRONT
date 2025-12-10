import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Usa la Clase importada
    title: 'Iniciar Sesión',
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  // ...
];
