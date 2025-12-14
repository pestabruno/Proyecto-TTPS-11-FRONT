import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Usa la Clase importada
    title: 'Iniciar Sesión',
  },
  { path: 'register', component: RegisterComponent },
];
