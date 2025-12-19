import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/AuthService';
import { EstadoApiService } from '../../../services/estado-api';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],

  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    FormsModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword: boolean = true;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private estadoApi = inject(EstadoApiService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.value;

    this.authService
      .login(credentials)
      .pipe(
        // 1. Manejar la respuesta inicial (Login/Token/UserId)
        switchMap((loginResponse: any) => {
          // 1.1. Guardar el Token (Si lo hay) y el UserId
          const userId = loginResponse.userId;

          if (!userId) {
            throw new Error('La respuesta de login no contenía el ID de usuario.');
          }

          if (loginResponse.token) {
            localStorage.setItem('jwt_token', loginResponse.token);
            console.log('Token JWT guardado.');
          }
          localStorage.setItem('user_id', userId.toString());

          return this.authService.getUsuarioData(userId);
        })
      )
      .subscribe({
        next: (userData: any) => {
          this.estadoApi.setUsuario(userData);
          console.log('Datos completos del usuario guardados en estado global.');

          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error durante la secuencia de login:', error);
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user_id');

          if (error.status === 401) {
            this.errorMessage = 'Email o contraseña incorrectos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se pudo conectar con el servidor';
          } else {
            this.errorMessage =
              error.error?.message || 'Error al iniciar sesión. Intentá de nuevo.';
          }
        },
      });
  }

  // Getters para acceso fácil a los FormControl desde el template
  get email() {
    // Usamos el operador de aserción no nula (!) ya que se inicializa en ngOnInit
    return this.loginForm!.get('email');
  }

  get password() {
    return this.loginForm!.get('password');
  }

  mostrarModalRecuperar: boolean = false;
  emailRecuperacion: string = '';
  cargandoRecuperacion: boolean = false;

  abrirModalRecuperar(event: Event) {
    event.preventDefault();
    this.mostrarModalRecuperar = true;
  }

  enviarClaveNueva() {
    if (!this.emailRecuperacion) return;

    Swal.fire({
      title: 'Procesando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.authService.recuperarPassword(this.emailRecuperacion).subscribe({
      next: (res) => {
        this.mostrarModalRecuperar = false;
        this.emailRecuperacion = '';

        this.cd.detectChanges();

        Swal.close();

        Swal.fire({
          title: '¡Correo Enviado!',
          text: 'La nueva contraseña ya está en tu e-mail.',
          icon: 'success',
        });

        this.emailRecuperacion = '';
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error?.error || 'No se pudo enviar el correo.',
          icon: 'error',
        });
      },
    });
  }

  cerrarModalRecuperar() {
    this.mostrarModalRecuperar = false;
    this.emailRecuperacion = '';
    this.cargandoRecuperacion = false;
  }
}
