import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core'; // Añadido OnDestroy
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import { MapaDetalleComponent } from '../mapaDetalle/mapaDetalle';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapaDetalleComponent],
  templateUrl: './detalle-publicacion.html',
  styleUrls: ['./detalle-publicacion.css'],
})
export class DetallePublicacionComponent implements OnInit, OnDestroy {
  // Implementa OnDestroy
  publicacion: Publicacion | null = null;
  cargando: boolean = true;
  error: string | null = null;
  mostrarModalEditar: boolean = false;
  guardando: boolean = false;

  // Propiedades nuevas para el mapa
  mostrarModalMapa: boolean = false;
  private mapDetalle?: L.Map;

  // FormGroup para validaciones
  editarForm!: FormGroup;

  // Propiedades para control de autor
  usuarioLogueadoId: number | null = null;
  esAutor: boolean = false;
  eliminando: boolean = false;

  // Para la galería de imágenes
  imagenActualIndex: number = 0;

  // Opciones para los selectores
  opcionesTamanio: string[] = ['Chico', 'Mediano', 'Grande'];
  opcionesProvincias: string[] = [
    'Buenos Aires',
    'CABA',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ];

  // Estados permitidos según el estado actual
  estadosPermitidos: { value: string; label: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacionService: PublicacionService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    const usuarioIdStr = localStorage.getItem('user_id');
    this.usuarioLogueadoId = usuarioIdStr ? Number(usuarioIdStr) : null;

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.cargarPublicacion(id);
    } else {
      this.error = 'ID de publicación inválido';
      this.cargando = false;
    }
  }

  // Limpieza al destruir el componente
  ngOnDestroy(): void {
    this.destruirMapa();
  }

  abrirModalMapa(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Intentando abrir modal...'); // SI NO VES ESTO EN CONSOLA, EL BOTÓN NO ANDA
    this.mostrarModalMapa = true;
    this.cdr.detectChanges();
  }

  cerrarModalMapa(): void {
    this.mostrarModalMapa = false;
  }

  private destruirMapa(): void {
    if (this.mapDetalle) {
      this.mapDetalle.remove();
      this.mapDetalle = undefined;
    }
  }

  private inicializarMapa(): void {
    if (!this.publicacion || !this.publicacion.latitud || !this.publicacion.longitud) return;

    const lat = this.publicacion.latitud;
    const lng = this.publicacion.longitud;

    // Inicializar mapa
    this.mapDetalle = L.map('mapa-detalle').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.mapDetalle);

    // Definición de iconos personalizados
    const iconRed = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const iconYellow = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Marcador principal (Mascota - Rojo)
    L.marker([lat, lng], { icon: iconRed })
      .addTo(this.mapDetalle)
      .bindPopup(`<b>Origen: ${this.publicacion.nombre}</b>`)
      .openPopup();

    // Marcadores de avistamientos (Amarillo)
    if (this.publicacion.avistamientos && this.publicacion.avistamientos.length > 0) {
      this.publicacion.avistamientos.forEach((a: any) => {
        if (a.latitud && a.longitud) {
          L.marker([parseFloat(a.latitud), parseFloat(a.longitud)], { icon: iconYellow })
            .addTo(this.mapDetalle!)
            .bindPopup(`<b>Avistamiento</b><br>${a.fecha}<br>${a.descripcion || ''}`);
        }
      });
    }

    // Corregir renderizado de tiles
    setTimeout(() => this.mapDetalle?.invalidateSize(), 200);
  }

  // --- FIN MÉTODOS DEL MAPA ---

  inicializarFormulario(): void {
    this.editarForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      color: ['', [Validators.required, Validators.minLength(2)]],
      tamanio: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[\d\s\-\(\)]+$/)]],
      provincia: ['', Validators.required],
      localidad: ['', [Validators.required, Validators.minLength(2)]],
      calle: ['', [Validators.required, Validators.minLength(2)]],
      altura: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      estado: ['', Validators.required],
    });
  }

  cargarPublicacion(id: number): void {
    this.cargando = true;
    this.error = null;

    this.publicacionService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.publicacion = data;
        this.esAutor =
          this.usuarioLogueadoId !== null && this.publicacion?.autor?.id === this.usuarioLogueadoId;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar la publicación';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  volver(): void {
    this.router.navigate(['/listado']);
  }

  agregarAvistamiento(): void {
    if (this.publicacion) {
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
      cancelButtonText: 'Cancelar',
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
              showConfirmButton: false,
            }).then(() => {
              this.router.navigate(['/listado']);
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la publicación. Intentá de nuevo.',
            });
            this.eliminando = false;
            this.cdr.detectChanges();
          },
        });
      }
    });
  }

  editarPublicacion(): void {
    if (this.publicacion) {
      this.cargarEstadosPermitidos(this.publicacion.estado);
      this.editarForm.patchValue({
        nombre: this.publicacion.nombre,
        color: this.publicacion.color,
        tamanio: this.publicacion.tamanio,
        descripcion: this.publicacion.descripcion,
        telefono: this.publicacion.telefono,
        provincia: this.publicacion.provincia,
        localidad: this.publicacion.localidad,
        calle: this.publicacion.calle,
        altura: this.publicacion.altura,
        estado: this.publicacion.estado,
      });
      this.mostrarModalEditar = true;
    }
  }

  cargarEstadosPermitidos(estadoActual: string): void {
    this.estadosPermitidos = [];
    this.estadosPermitidos.push({
      value: estadoActual,
      label: this.obtenerLabelEstado(estadoActual),
    });

    switch (estadoActual) {
      case 'PERDIDO_PROPIO':
        this.estadosPermitidos.push({ value: 'RECUPERADO', label: 'Recuperado' });
        break;
      case 'PERDIDO_AJENO':
        this.estadosPermitidos.push(
          { value: 'RECUPERADO', label: 'Recuperado' },
          { value: 'ADOPTADO', label: 'Adoptado' }
        );
        break;
      case 'RECUPERADO':
        this.estadosPermitidos.push(
          { value: 'PERDIDO_PROPIO', label: 'Perdido propio (revertir)' },
          { value: 'PERDIDO_AJENO', label: 'Perdido ajeno (revertir)' }
        );
        break;
    }
  }

  obtenerLabelEstado(estado: string): string {
    const labels: { [key: string]: string } = {
      PERDIDO_PROPIO: 'Perdido propio',
      PERDIDO_AJENO: 'Perdido ajeno',
      RECUPERADO: 'Recuperado',
      ADOPTADO: 'Adoptado',
    };
    return labels[estado] || estado;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.editarForm.reset();
  }

  guardarEdicion(): void {
    if (!this.publicacion || this.editarForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos correctamente.',
      });
      return;
    }

    const estadoNuevo = this.editarForm.value.estado;
    const estadoActual = this.publicacion.estado;

    if (!this.esTransicionEstadoValida(estadoActual, estadoNuevo)) {
      Swal.fire({
        icon: 'error',
        title: 'Estado no permitido',
        text: 'No se puede realizar este cambio de estado.',
      });
      return;
    }

    if (
      estadoActual === 'RECUPERADO' &&
      (estadoNuevo === 'PERDIDO_PROPIO' || estadoNuevo === 'PERDIDO_AJENO')
    ) {
      this.confirmarReversion(estadoNuevo);
    } else {
      this.ejecutarGuardado();
    }
  }

  confirmarReversion(estadoNuevo: string): void {
    const mensaje =
      estadoNuevo === 'PERDIDO_PROPIO'
        ? '¿Querés marcar nuevamente la mascota como perdida (tuya)?'
        : '¿Querés marcar nuevamente la mascota como perdida (ajena)?';

    Swal.fire({
      title: '¿Revertir el estado?',
      text: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f0ad4e',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, revertir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardado();
      }
    });
  }

  ejecutarGuardado(): void {
    this.guardando = true;
    const datosActualizados = this.editarForm.value;

    this.publicacionService.editar(this.publicacion!.id, datosActualizados).subscribe({
      next: (data) => {
        this.publicacion = data;
        this.guardando = false;
        this.cerrarModalEditar();
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'La publicación fue actualizada correctamente',
          timer: 2000,
          showConfirmButton: false,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la publicación. Intentá de nuevo.',
        });
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  esTransicionEstadoValida(estadoActual: string, estadoNuevo: string): boolean {
    if (estadoActual === estadoNuevo) return true;
    const transicionesValidas: { [key: string]: string[] } = {
      PERDIDO_PROPIO: ['RECUPERADO'],
      PERDIDO_AJENO: ['RECUPERADO', 'ADOPTADO'],
      RECUPERADO: ['PERDIDO_PROPIO', 'PERDIDO_AJENO'],
      ADOPTADO: [],
    };
    return transicionesValidas[estadoActual]?.includes(estadoNuevo) || false;
  }

  hasError(campo: string, error: string): boolean {
    const control = this.editarForm.get(campo);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(campo: string): string {
    const control = this.editarForm.get(campo);
    if (!control || !control.errors) return '';
    const errores: { [key: string]: string } = {
      required: 'Este campo es obligatorio',
      minlength: `Mínimo ${control.errors['minlength']?.requiredLength} caracteres`,
      pattern: 'Formato inválido',
    };
    const primerError = Object.keys(control.errors)[0];
    return errores[primerError] || 'Error de validación';
  }

  imagenAnterior(): void {
    if (this.publicacion?.imagenes64 && this.imagenActualIndex > 0) {
      this.imagenActualIndex--;
    }
  }

  imagenSiguiente(): void {
    if (
      this.publicacion?.imagenes64 &&
      this.imagenActualIndex < this.publicacion.imagenes64.length - 1
    ) {
      this.imagenActualIndex++;
    }
  }

  seleccionarImagen(index: number): void {
    this.imagenActualIndex = index;
  }
}
