import { Component, OnInit, inject, NgZone } from '@angular/core';
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
    this.profileFile = null;
    this.imagePreview = null;
    this.profileImageBase64 = null;

    if (!event || !event.files || event.files.length === 0) {
      return;
    }

    const droppedFile = event.files[0];

    if (droppedFile.fileEntry.isFile) {
      const fileEntry = droppedFile.fileEntry as any;

      fileEntry.file((file: File) => {
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
      });
    }
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
