// src/app/components/navbar/navbar.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Servicios
import { EstadoApiService } from '../../services/estado-api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  private estadoApi = inject(EstadoApiService);
  private router = inject(Router);

  // Observable que extrae el estado 'estaLogueado' del estado global
  isLoggedIn$: Observable<boolean> = this.estadoApi.estado$.pipe(
    map((estado) => estado.estaLogueado)
  );

  // Observable que extrae el objeto 'usuario' del estado global
  usuario$ = this.estadoApi.estado$.pipe(map((estado) => estado.usuario));

  onLogout(): void {
    this.estadoApi.cerrarSesion();
  }

  onGoToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}
