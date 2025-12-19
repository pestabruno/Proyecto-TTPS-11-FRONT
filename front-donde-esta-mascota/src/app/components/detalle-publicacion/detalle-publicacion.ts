import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detalle-publicacion.html',
  styleUrls: ['./detalle-publicacion.css']
})
export class DetallePublicacionComponent implements OnInit {
  
  publicacion: Publicacion | null = null;
  cargando: boolean = true;
  error: string | null = null;
  mostrarModalEditar: boolean = false;
  guardando: boolean = false;
  
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
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
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
      estado: ['', Validators.required]
    });
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
      // Cargar estados permitidos según el estado actual
      this.cargarEstadosPermitidos(this.publicacion.estado);

      // Cargar los valores actuales en el formulario
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
        estado: this.publicacion.estado
      });

      this.mostrarModalEditar = true;
    }
  }

  cargarEstadosPermitidos(estadoActual: string): void {
    this.estadosPermitidos = [];

    // Siempre incluir el estado actual
    this.estadosPermitidos.push({
      value: estadoActual,
      label: this.obtenerLabelEstado(estadoActual)
    });

    // ✅ REGLAS ACTUALIZADAS: Más flexibles para permitir reversiones
    switch (estadoActual) {
      case 'PERDIDO_PROPIO':
        // Desde PERDIDO_PROPIO → puede cambiar a RECUPERADO
        this.estadosPermitidos.push({
          value: 'RECUPERADO',
          label: 'Recuperado'
        });
        break;

      case 'PERDIDO_AJENO':
        // Desde PERDIDO_AJENO → puede cambiar a RECUPERADO o ADOPTADO
        this.estadosPermitidos.push(
          { value: 'RECUPERADO', label: 'Recuperado' },
          { value: 'ADOPTADO', label: 'Adoptado' }
        );
        break;

      case 'RECUPERADO':
        // ✅ NUEVO: Desde RECUPERADO → puede volver a PERDIDO_PROPIO o PERDIDO_AJENO
        this.estadosPermitidos.push(
          { value: 'PERDIDO_PROPIO', label: 'Perdido propio (revertir)' },
          { value: 'PERDIDO_AJENO', label: 'Perdido ajeno (revertir)' }
        );
        break;

      case 'ADOPTADO':
        // ADOPTADO es definitivo, no puede cambiar
        // Solo mantiene el estado actual
        break;
    }
  }

  obtenerLabelEstado(estado: string): string {
    const labels: { [key: string]: string } = {
      'PERDIDO_PROPIO': 'Perdido propio',
      'PERDIDO_AJENO': 'Perdido ajeno',
      'RECUPERADO': 'Recuperado',
      'ADOPTADO': 'Adoptado'
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
        text: 'Por favor completá todos los campos correctamente.'
      });
      return;
    }

    // Validar que el cambio de estado sea permitido
    const estadoNuevo = this.editarForm.value.estado;
    const estadoActual = this.publicacion.estado;

    if (!this.esTransicionEstadoValida(estadoActual, estadoNuevo)) {
      Swal.fire({
        icon: 'error',
        title: 'Estado no permitido',
        text: 'No se puede realizar este cambio de estado.'
      });
      return;
    }

    // Si está revirtiendo desde RECUPERADO, mostrar confirmación
    if (estadoActual === 'RECUPERADO' && 
        (estadoNuevo === 'PERDIDO_PROPIO' || estadoNuevo === 'PERDIDO_AJENO')) {
      this.confirmarReversion(estadoNuevo);
    } else {
      this.ejecutarGuardado();
    }
  }

  confirmarReversion(estadoNuevo: string): void {
    const mensaje = estadoNuevo === 'PERDIDO_PROPIO' 
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
      cancelButtonText: 'Cancelar'
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

  esTransicionEstadoValida(estadoActual: string, estadoNuevo: string): boolean {
    // Si no cambia el estado, es válido
    if (estadoActual === estadoNuevo) {
      return true;
    }

    // ✅ TRANSICIONES ACTUALIZADAS: Incluyen reversiones desde RECUPERADO
    const transicionesValidas: { [key: string]: string[] } = {
      'PERDIDO_PROPIO': ['RECUPERADO'],
      'PERDIDO_AJENO': ['RECUPERADO', 'ADOPTADO'],
      'RECUPERADO': ['PERDIDO_PROPIO', 'PERDIDO_AJENO'],  // ✅ NUEVO: Permite revertir
      'ADOPTADO': []  // ADOPTADO es definitivo
    };

    return transicionesValidas[estadoActual]?.includes(estadoNuevo) || false;
  }

  // Métodos auxiliares para validaciones en el template
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
      pattern: 'Formato inválido'
    };

    const primerError = Object.keys(control.errors)[0];
    return errores[primerError] || 'Error de validación';
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