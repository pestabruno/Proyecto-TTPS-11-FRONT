import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrls: ['./detalle-publicacion.css']
})
export class DetallePublicacionComponent implements OnInit {
  
  publicacion: Publicacion | null = null;
  cargando: boolean = true;
  error: string | null = null;
  mostrarModalEditar: boolean = false;
  publicacionEditada: any = {};
  guardando: boolean = false;
  
  // Propiedades para control de autor
  usuarioLogueadoId: number | null = null;
  esAutor: boolean = false;
  eliminando: boolean = false;

  // Para la galería de imágenes
  imagenActualIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacionService: PublicacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener el ID del usuario logueado desde localStorage
    const usuarioIdStr = localStorage.getItem('user_id');
    this.usuarioLogueadoId = usuarioIdStr ? Number(usuarioIdStr) : null;
    
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID publicación:', id);
    console.log('Usuario logueado ID:', this.usuarioLogueadoId);
    
    if (id) {
      this.cargarPublicacion(id);
    } else {
      this.error = 'ID de publicación inválido';
      this.cargando = false;
    }
  }

  cargarPublicacion(id: number): void {
    console.log('Cargando publicación con ID:', id);
    this.cargando = true;
    this.error = null;

    this.publicacionService.obtenerPorId(id).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.publicacion = data;
        
        // Verificar si el usuario logueado es el autor
        this.esAutor = this.usuarioLogueadoId !== null && 
                       this.publicacion?.autor?.id === this.usuarioLogueadoId;
        
        console.log('¿Es autor?:', this.esAutor);
        console.log('Autor ID:', this.publicacion?.autor?.id);
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.error = 'Error al cargar la publicación';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/listado']);
  }

  agregarAvistamiento(): void {
    if (this.publicacion) {
      console.log('Agregar avistamiento para publicación:', this.publicacion.id);
      alert('Funcionalidad de agregar avistamiento - Próximamente');
    }
  }

  eliminarPublicacion(): void {
    if (!this.publicacion) return;
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Querés eliminar la publicación de "${this.publicacion.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminando = true;
        this.cdr.detectChanges();
        
        this.publicacionService.eliminar(this.publicacion!.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'La publicación fue eliminada correctamente',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/listado']);
            });
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la publicación. Intentá de nuevo.'
            });
            this.eliminando = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  editarPublicacion(): void {
    if (this.publicacion) {
      // Copiamos los datos actuales para editarlos
      this.publicacionEditada = {
        nombre: this.publicacion.nombre,
        color: this.publicacion.color,
        tamanio: this.publicacion.tamanio,
        descripcion: this.publicacion.descripcion,
        telefono: this.publicacion.telefono,
        provincia: this.publicacion.provincia,
        localidad: this.publicacion.localidad,
        calle: this.publicacion.calle,
        altura: this.publicacion.altura
      };
      this.mostrarModalEditar = true;
    }
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.publicacionEditada = {};
  }

  guardarEdicion(): void {
    if (!this.publicacion) return;

    this.guardando = true;

    this.publicacionService.editar(this.publicacion.id, this.publicacionEditada).subscribe({
      next: (data) => {
        this.publicacion = data;
        this.guardando = false;
        this.cerrarModalEditar();
        
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La publicación fue actualizada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al editar:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la publicación. Intentá de nuevo.'
        });
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Métodos para la galería de imágenes
  imagenAnterior(): void {
    if (this.publicacion?.imagenes64 && this.imagenActualIndex > 0) {
      this.imagenActualIndex--;
    }
  }

  imagenSiguiente(): void {
    if (this.publicacion?.imagenes64 && 
        this.imagenActualIndex < this.publicacion.imagenes64.length - 1) {
      this.imagenActualIndex++;
    }
  }

  seleccionarImagen(index: number): void {
    this.imagenActualIndex = index;
  }
}