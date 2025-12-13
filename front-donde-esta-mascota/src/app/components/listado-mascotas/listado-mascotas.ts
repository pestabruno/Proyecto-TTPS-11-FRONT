import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../interfaces/estado.interface';

@Component({
  selector: 'app-listado-mascotas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-mascotas.html',
  styleUrls: ['./listado-mascotas.css']
})
export class ListadoMascotasComponent implements OnInit {

  publicaciones: Publicacion[] = [];
  cargando: boolean = false;

  ngOnInit(): void {
    // Por ahora datos de prueba
    this.publicaciones = [
      {
        id: 1,
        nombre: 'Firulais',
        color: 'Marrón',
        tamanio: 'Mediano',
        fecha: '2024-12-10',
        descripcion: 'Perro perdido en zona centro',
        telefono: '1234567890',
        estado: 'PERDIDO_PROPIO',
        imagenesUrls: ['https://placedog.net/400/400'],
        autor: {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan@email.com',
          telefono: '1234567890'
        },
        avistamientos: []
      }
    ];
  }
}