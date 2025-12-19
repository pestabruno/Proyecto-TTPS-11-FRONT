import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navBar/navbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PublicacionService } from './services/publicacion/publicacion.service';
import { EstadoApiService } from './services/estado-api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FontAwesomeModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class AppComponent implements OnInit {
  private publicacionService = inject(PublicacionService);
  private estadoApi = inject(EstadoApiService);

  ngOnInit(): void {
    // 1. Ponemos el estado en "cargando"
    this.estadoApi.actualizarEstado({ cargandoPublicaciones: true });

    // 2. Disparamos la carga inicial
    this.publicacionService.obtenerTodas().subscribe({
      next: () => {
        this.estadoApi.actualizarEstado({ cargandoPublicaciones: false });
        console.log('App: Carga inicial de publicaciones completada');
      },
      error: (err) => {
        this.estadoApi.actualizarEstado({
          cargandoPublicaciones: false,
          errorPublicaciones: 'Error al iniciar la app',
        });
      },
    });
  }
}
