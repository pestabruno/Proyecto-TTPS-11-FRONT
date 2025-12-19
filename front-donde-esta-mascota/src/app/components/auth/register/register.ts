import { Component, OnInit, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../services/auth/AuthService';
import { EstadoApiService } from '../../../services/estado-api';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordsMismatch: true });
    return { passwordsMismatch: true };
  } else {
    if (confirmPassword.hasError('passwordsMismatch')) {
      const errors = { ...confirmPassword.errors };
      delete errors['passwordsMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
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
    FormsModule,
    NgxFileDropModule,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string | null = null;

  public profileFile: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;
  public profileImageBase64: string | null = null;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private estadoApi = inject(EstadoApiService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        nombre: ['', [Validators.required]],
        apellido: ['', [Validators.required]],
        dni: ['', [Validators.required, Validators.pattern(/^[0-9]{7,9}$/)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9+]{8,15}$/)]],
        provincia: ['', [Validators.required]],
        localidad: ['', [Validators.required]],
        imagen: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );

    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      const confirmPassword = this.registerForm.get('confirmPassword');
      if (confirmPassword && confirmPassword.value) {
        this.registerForm.updateValueAndValidity();
      }
    });
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
  get provincia() {
    return this.registerForm.get('provincia');
  }
  get localidad() {
    return this.registerForm.get('localidad');
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

  public dropped(event: any) {
    console.log('Evento dropped completo:', event);

    // ngx-file-drop retorna un array directamente, no en event.files
    const files = event;
    console.log('Archivos dropeados:', files);

    if (files && files.length > 0) {
      const droppedFile = files[0];
      console.log('Primer archivo:', droppedFile);
      console.log('fileEntry:', droppedFile.fileEntry);

      // Acceder al fileEntry
      const fileEntry = droppedFile.fileEntry;

      if (fileEntry && fileEntry.isFile) {
        console.log('Es un archivo válido, obteniendo File object...');

        // Convertir FileEntry a File
        (fileEntry as FileSystemFileEntry).file(
          (file: File) => {
            console.log('File obtenido exitosamente:', file);
            console.log('Nombre:', file.name);
            console.log('Tipo:', file.type);
            console.log('Tamaño:', file.size);

            // Ejecutar dentro de NgZone para asegurar detección de cambios
            this.ngZone.run(() => {
              this.procesarImagen(file);
            });
          },
          (error: any) => {
            console.error('Error al obtener el archivo desde fileEntry:', error);
            this.ngZone.run(() => {
              this.errorMessage = 'Error al procesar el archivo.';
            });
          }
        );
      } else {
        console.error('fileEntry no es válido o no es un archivo');
        console.log('fileEntry.isFile:', fileEntry?.isFile);
      }
    } else {
      console.error('No hay archivos en el evento');
    }
  }

  private procesarImagen(file: File) {
    console.log('Procesando imagen:', file);

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'El archivo debe ser una imagen.';
      console.error('Tipo de archivo inválido:', file.type);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.ngZone.run(() => {
        console.log('Imagen cargada exitosamente');
        this.imagePreview = e.target.result;
        this.profileImageBase64 = e.target.result;

        // Actualizamos el form
        this.registerForm.get('imagen')?.setValue(file.name);
        this.registerForm.get('imagen')?.markAsTouched();
        this.registerForm.get('imagen')?.updateValueAndValidity();

        // Limpia el mensaje de error si había uno
        this.errorMessage = null;
      });
    };

    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      this.errorMessage = 'Error al cargar la imagen.';
    };

    reader.readAsDataURL(file);
  }

  public fileOver(event: any) {}
  public fileLeave(event: any) {}

  public onFileSelected(event: any) {
    this.profileFile = null;
    this.imagePreview = null;
    this.profileImageBase64 = null;

    const fileList: FileList = event.target.files;

    if (fileList && fileList.length > 0) {
      const file: File = fileList[0];
      this.profileFile = file;

      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.ngZone.run(() => {
          this.imagePreview = e.target.result;
          this.profileImageBase64 = e.target.result;

          this.registerForm.get('imagen')?.setValue(file.name);
          this.registerForm.get('imagen')?.markAsDirty();
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.profileImageBase64) {
      this.errorMessage = 'La foto de perfil es obligatoria (arrastrar y soltar).';
      return;
    }

    const finalImagenValue = this.profileImageBase64 || '';

    const { nombre, apellido, dni, telefono, email, password, provincia, localidad } =
      this.registerForm.value;
    const registrationData = {
      nombre,
      apellido,
      dni,
      telefono,
      provincia,
      localidad,
      imagen: finalImagenValue,
      email,
      password,
    };

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
          localStorage.setItem('user_id', userId.toString());

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
