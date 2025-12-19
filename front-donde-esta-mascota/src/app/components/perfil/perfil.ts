import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/AuthService';
import { EstadoApiService } from '../../services/estado-api';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  provincia: string;
  localidad: string;
  imagen: string;
}

interface UsuarioUpdate {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  provincia?: string;
  localidad?: string;
  imagen?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class PerfilComponent implements OnInit {
  usuario: Usuario | null = null;
  usuarioEditado: UsuarioUpdate = {};

  cargando: boolean = true;
  guardando: boolean = false;
  error: string | null = null;
  exito: string | null = null;

  modoEdicion: boolean = false;
  mostrarModalPassword: boolean = false;

  // Para cambio de contraseña
  passwordActual: string = '';
  passwordNueva: string = '';
  passwordConfirmar: string = '';
  cambiandoPassword: boolean = false;
  errorPassword: string | null = null;

  // Para imagen
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  provincias: string[] = [
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private estadoApi: EstadoApiService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = null;

    // Obtener el ID del usuario logueado
    const userId = this.authService.getUsuarioId();

    if (!userId) {
      this.error = 'No hay usuario logueado';
      this.cargando = false;
      this.router.navigate(['/login']);
      return;
    }

    // Obtener los datos del usuario desde el backend
    this.authService.getUsuarioData(userId).subscribe({
      next: (user) => {
        if (user) {
          this.usuario = user as Usuario;
          this.inicializarFormularioEdicion();
        } else {
          this.error = 'No se pudo cargar el perfil';
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.error = 'Error al cargar el perfil';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  inicializarFormularioEdicion(): void {
    if (this.usuario) {
      this.usuarioEditado = {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        telefono: this.usuario.telefono,
        provincia: this.usuario.provincia,
        localidad: this.usuario.localidad,
        imagen: this.usuario.imagen,
      };
    }
  }

  activarEdicion(): void {
    this.modoEdicion = true;
    this.inicializarFormularioEdicion();
    this.exito = null;
    this.error = null;
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.inicializarFormularioEdicion();
    this.imagenPreview = null;
    this.imagenFile = null;
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no puede superar los 5MB';
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.error = 'El archivo debe ser una imagen';
        return;
      }

      this.imagenFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios(): void {
    if (!this.usuario) return;

    // Validaciones
    if (!this.usuarioEditado.nombre?.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }

    if (!this.usuarioEditado.apellido?.trim()) {
      this.error = 'El apellido es obligatorio';
      return;
    }

    if (!this.usuarioEditado.telefono?.trim()) {
      this.error = 'El teléfono es obligatorio';
      return;
    }

    if (!this.usuarioEditado.localidad?.trim()) {
      this.error = 'La localidad es obligatoria';
      return;
    }
    this.guardando = true;
    this.error = null;
    this.exito = null;

    this.authService.actualizarPerfil(this.usuario.id, this.usuarioEditado).subscribe({
      next: (usuarioActualizado) => {
        this.usuario = { ...this.usuario!, ...usuarioActualizado };
        this.estadoApi.setUsuario(this.usuario as any);
        this.exito = '¡Perfil actualizado correctamente!';
        this.modoEdicion = false;
        this.imagenPreview = null;
        this.imagenFile = null;
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.error = 'Error al guardar los cambios. Intentá de nuevo.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Cambio de contraseña
  abrirModalPassword(): void {
    this.mostrarModalPassword = true;
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirmar = '';
    this.errorPassword = null;
  }

  cerrarModalPassword(): void {
    this.mostrarModalPassword = false;
    this.passwordActual = '';
    this.passwordNueva = '';
    this.passwordConfirmar = '';
    this.errorPassword = null;
  }

  cambiarPassword(): void {
    if (!this.usuario) return;

    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirmar) {
      this.errorPassword = 'Completá todos los campos';
      return;
    }

    if (this.passwordNueva.length < 6) {
      this.errorPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.passwordNueva !== this.passwordConfirmar) {
      this.errorPassword = 'Las contraseñas no coinciden';
      return;
    }

    this.cambiandoPassword = true;
    this.errorPassword = null;

    this.authService
      .cambiarPassword(this.usuario.id, this.passwordActual, this.passwordNueva)
      .subscribe({
        next: () => {
          this.exito = '¡Contraseña actualizada correctamente!';
          this.cerrarModalPassword();
          this.cambiandoPassword = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cambiar contraseña:', err);
          this.errorPassword = err.error || 'Error al cambiar la contraseña';
          this.cambiandoPassword = false;
          this.cdr.detectChanges();
        },
      });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  getImagenUrl(): string {
    if (this.imagenPreview) {
      return this.imagenPreview;
    }
    if (this.usuario?.imagen) {
      return this.usuario.imagen;
    }
    return 'assets/images/default-avatar.png';
  }
}
