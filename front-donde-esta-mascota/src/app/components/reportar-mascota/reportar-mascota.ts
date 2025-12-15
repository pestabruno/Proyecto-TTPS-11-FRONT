import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth/AuthService';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportar-mascota',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportar-mascota.html',
  styleUrl: './reportar-mascota.css',
})
export class ReportarMascotaComponent implements OnInit {
  registerForm!: FormGroup;
  
  // Arrays para múltiples imágenes
  public imagenesFiles: File[] = [];
  public imagesPreviews: (string | ArrayBuffer)[] = [];
  public imagenesBase64: string[] = [];

  guardando: boolean = false;
  usuarioId: number | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private publicacionService = inject(PublicacionService);
  private ngZone = inject(NgZone);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener ID del usuario logueado
    this.usuarioId = this.authService.getUsuarioId();

    // Si no hay usuario logueado, redirigir al login
    if (!this.usuarioId) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión requerida',
        text: 'Debés iniciar sesión para reportar una mascota',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    // Inicializar el formulario
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      color: ['', [Validators.required]],
      tamanio: ['', [Validators.required]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9-]+$/)]],
      estado: ['PERDIDO_PROPIO', [Validators.required]],
      provincia: ['', [Validators.required]],
      localidad: ['', [Validators.required]],
      calle: ['', [Validators.required]],
      altura: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });
  }

  // Getters para acceder a los campos del formulario
  get nombre() {
    return this.registerForm.get('nombre');
  }

  get color() {
    return this.registerForm.get('color');
  }

  get tamanio() {
    return this.registerForm.get('tamanio');
  }

  get descripcion() {
    return this.registerForm.get('descripcion');
  }

  get telefono() {
    return this.registerForm.get('telefono');
  }

  get estado() {
    return this.registerForm.get('estado');
  }

  get localidad() {
    return this.registerForm.get('localidad');
  }

  get provincia() {
    return this.registerForm.get('provincia');
  }

  get calle() {
    return this.registerForm.get('calle');
  }

  get altura() {
    return this.registerForm.get('altura');
  }

  // Método para manejar la selección de MÚLTIPLES imágenes
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      // Validar que no se excedan 5 imágenes
      if (this.imagenesFiles.length + input.files.length > 5) {
        Swal.fire({
          icon: 'warning',
          title: 'Máximo de imágenes',
          text: 'Podés subir un máximo de 5 imágenes',
        });
        return;
      }

      Array.from(input.files).forEach((file) => {
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            icon: 'error',
            title: 'Formato inválido',
            text: `${file.name}: Solo se permiten imágenes JPG, JPEG, PNG o WEBP`,
          });
          return;
        }

        // Validar tamaño (máximo 5MB por imagen)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          Swal.fire({
            icon: 'error',
            title: 'Archivo muy grande',
            text: `${file.name}: La imagen no puede superar los 5MB`,
          });
          return;
        }

        // Agregar archivo al array
        this.imagenesFiles.push(file);

        // Preview de la imagen
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.ngZone.run(() => {
            this.imagesPreviews.push(e.target?.result || '');
            this.cdr.detectChanges();
          });
        };
        reader.readAsDataURL(file);

        // Convertir a Base64 para enviar al backend
        const readerBase64 = new FileReader();
        readerBase64.onload = (e: ProgressEvent<FileReader>) => {
          this.ngZone.run(() => {
            this.imagenesBase64.push(e.target?.result as string);
            this.cdr.detectChanges();
          });
        };
        readerBase64.readAsDataURL(file);
      });

      // Limpiar el input para poder seleccionar las mismas imágenes de nuevo
      input.value = '';
    }
  }

  // Método para eliminar una imagen específica
  removeImage(index: number): void {
    this.imagenesFiles.splice(index, 1);
    this.imagesPreviews.splice(index, 1);
    this.imagenesBase64.splice(index, 1);
    this.cdr.detectChanges();
  }

  // Método para enviar el formulario
  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });

      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos',
      });
      return;
    }

    // Verificar usuario logueado
    if (!this.usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario. Por favor iniciá sesión nuevamente.',
      });
      return;
    }

    this.guardando = true;

    // Preparar el objeto para enviar
    const publicacionData = {
      nombre: this.registerForm.value.nombre,
      color: this.registerForm.value.color,
      tamanio: this.registerForm.value.tamanio,
      descripcion: this.registerForm.value.descripcion,
      telefono: this.registerForm.value.telefono,
      estado: this.registerForm.value.estado,
      provincia: this.registerForm.value.provincia,
      localidad: this.registerForm.value.localidad,
      calle: this.registerForm.value.calle,
      altura: this.registerForm.value.altura,
      imagenes64: this.imagenesBase64, // Array de imágenes en Base64
    };

    console.log('Datos a enviar:', publicacionData);
    console.log('Usuario ID:', this.usuarioId);

    // Llamar al servicio
    this.publicacionService
      .crearPublicacion(this.usuarioId, publicacionData)
      .subscribe({
        next: (response) => {
          this.guardando = false;

          Swal.fire({
            icon: 'success',
            title: '¡Publicación creada!',
            text: 'Tu mascota fue reportada exitosamente',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            // Redirigir al detalle de la publicación
            this.router.navigate(['/publicacion', response.id]);
          });
        },
        error: (err) => {
          console.error('Error al crear publicación:', err);
          this.guardando = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err.error?.message ||
              'No se pudo crear la publicación. Intentá de nuevo.',
          });

          this.cdr.detectChanges();
        },
      });
  }

  // Método para cancelar y volver
  cancelar(): void {
    if (this.registerForm.dirty || this.imagenesFiles.length > 0) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Tenés cambios sin guardar. ¿Querés salir?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/listado']);
        }
      });
    } else {
      this.router.navigate(['/listado']);
    }
  }

  // Helper para verificar si un campo tiene error
  hasError(field: string, error: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  // Helper para obtener mensaje de error
  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('minlength')) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control.hasError('pattern')) {
      if (field === 'telefono') return 'Formato de teléfono inválido (solo números y guiones)';
      if (field === 'altura') return 'Solo se permiten números';
    }

    return 'Campo inválido';
  }
}