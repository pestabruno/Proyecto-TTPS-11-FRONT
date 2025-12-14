import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Servicios
import { AuthService } from '../../../services/auth/AuthService';
import { EstadoApiService } from '../../../services/estado-api';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.html',
  styleUrls: ['../login/login.css'],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private estadoApi = inject(EstadoApiService);
  private router = inject(Router);

  ngOnInit(): void {
    const URL_REGEXP =
      /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    this.registerForm = this.fb.group(
      {
        nombre: ['', [Validators.required]],
        apellido: ['', [Validators.required]],
        dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,9}$/)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9+]{8,15}$/)]],
        imagen: ['', [Validators.required, Validators.pattern(URL_REGEXP)]],
        email: ['', [Validators.required, Validators.email]],

        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: passwordMatchValidator }
    );
  }

  get nombre() {
    return this.registerForm.get('nombre');
  }
  get apellido() {
    return this.registerForm.get('apellido');
  }
  get dni() {
    return this.registerForm.get('dni');
  }
  get telefono() {
    return this.registerForm.get('telefono');
  }
  get imagen() {
    return this.registerForm.get('imagen');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nombre, apellido, dni, telefono, imagen, email, password } = this.registerForm.value;
    const registrationData = { nombre, apellido, dni, telefono, imagen, email, password };

    this.authService
      .register(registrationData)
      .pipe(
        switchMap((registerResponse: any) => {
          const userId = registerResponse.userId;

          if (!userId) {
            throw new Error('La respuesta de registro no contenía el ID de usuario.');
          }

          if (registerResponse.token) {
            localStorage.setItem('jwt_token', registerResponse.token);
            console.log('Token JWT guardado.');
          }

          return this.authService.getUsuarioData(userId);
        })
      )
      .subscribe({
        next: (userData: any) => {
          this.estadoApi.setUsuario(userData);
          console.log('Registro exitoso. Redirigiendo...');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Error durante el registro:', error);
          localStorage.removeItem('jwt_token');
          this.errorMessage =
            error.error?.message ||
            'Error al registrar el usuario. El email podría estar ya en uso.';
        },
      });
  }
}
