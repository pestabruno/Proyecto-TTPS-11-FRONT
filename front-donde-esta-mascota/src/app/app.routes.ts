import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { ListadoMascotasComponent } from './components/listado-mascotas/listado-mascotas';

export const routes: Routes = [
  {
    path: '',
    component: ListadoMascotasComponent,
    title: 'Mascotas Perdidas',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión',
  },
];