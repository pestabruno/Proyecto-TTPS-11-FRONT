import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { HomeComponent } from './components/home/home';
import { ListadoMascotasComponent } from './components/listado-mascotas/listado-mascotas';
import { DetallePublicacionComponent } from './components/detalle-publicacion/detalle-publicacion';
import { ReportarMascotaComponent } from './components/reportar-mascota/reportar-mascota';
//import { authGuard } from './guards/auth.guard'
import { PerfilComponent } from './components/perfil/perfil';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'listado',
    pathMatch: 'full'
  },
  {
    path: 'listado',  
    component: ListadoMascotasComponent,
    title: 'Mascotas Perdidas',
  },
  {
    path: 'publicacion/:id',  
    component: DetallePublicacionComponent,
    title: 'Detalle de Publicación',
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión',
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registro',
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Home',
  },
  {
    path: 'reportar',
    component: ReportarMascotaComponent,
    title: 'Reportar Mascota',
  },
  {
  path: 'perfil',
  component: PerfilComponent,
  //canActivate: [authGuard]  // si querés que solo usuarios logueados puedan acceder
  }
];