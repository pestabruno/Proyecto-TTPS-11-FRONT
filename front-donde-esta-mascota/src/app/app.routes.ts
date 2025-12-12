import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Usa la Clase importada
    title: 'Iniciar Sesión',
  },
];
