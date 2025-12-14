import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';

@Component({
  selector: 'app-listado-mascotas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-mascotas.html',
  styleUrls: ['./listado-mascotas.css']
})
export class ListadoMascotasComponent implements OnInit {

  publicaciones: Publicacion[] = [];
  cargando: boolean = true;
  error: string | null = null;

  constructor(private publicacionService: PublicacionService) { }

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.error = null;

    this.publicacionService.obtenerTodas().subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar las publicaciones';
        this.cargando = false;
      }
    });
  }
}