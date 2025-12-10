import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card'; // Para <mat-card>
import { MatInputModule } from '@angular/material/input'; // Para el input
import { MatFormFieldModule } from '@angular/material/form-field'; // Para el contenedor del input
import { MatButtonModule } from '@angular/material/button'; // Para el botón
import { MatIconModule } from '@angular/material/icon'; // Para el icono de email/candado/ojo

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],

  imports: [
    ReactiveFormsModule, // <-- Módulo de Angular para FormGroups
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true; // Para el toggle de visibilidad de contraseña

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Formulario Válido. Datos:', this.loginForm.value);
      // Aquí iría la llamada al EstadoApiService (o AuthService) para iniciar sesión
      alert(`Iniciando sesión con: ${this.loginForm.value.email}`);
    } else {
      console.error('Formulario no válido.');
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
