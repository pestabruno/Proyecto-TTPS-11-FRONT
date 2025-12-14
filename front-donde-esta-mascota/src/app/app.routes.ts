import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { HomeComponent } from './components/home/home';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Usa la Clase importada
    title: 'Iniciar Sesión',
  },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
];
