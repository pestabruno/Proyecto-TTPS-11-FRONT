import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

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
          // Si hay un token guardado previamente (por ejemplo, si falla la segunda llamada), se puede limpiar
          localStorage.removeItem('jwt_token');
          this.errorMessage =
            error.error?.message ||
            'Error de autenticación o al obtener el perfil. Inténtalo de nuevo.';
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
}
