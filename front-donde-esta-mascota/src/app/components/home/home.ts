import { Component, OnInit } from '@angular/core';
import { faDog, faCat } from '@fortawesome/free-solid-svg-icons'; // <-- Importamos los íconos
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MapComponent } from '../map/map'; // Importación

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [FontAwesomeModule, MapComponent],
})
export class HomeComponent implements OnInit {
  tituloPrincipal: string = 'Encuentra a tu Mascota Perdida';
  faDog = faDog;
  faCat = faCat;

  constructor() {}

  ngOnInit(): void {
    // Aquí se ejecutaría la lógica inicial del componente (al cargarse)
    // Por ejemplo, cargar datos iniciales de un servicio.
  }
}
