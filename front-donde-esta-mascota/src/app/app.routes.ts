import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { HomeComponent } from './components/home/home';
import { ListadoMascotasComponent } from './components/listado-mascotas/listado-mascotas';

export const routes: Routes = [
  {
    path: 'ListadoMascotas',
    component: ListadoMascotasComponent,
    title: 'Mascotas Perdidas',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión',
  },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
];
