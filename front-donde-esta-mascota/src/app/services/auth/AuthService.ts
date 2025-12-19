import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  getUsuarioData(userId: number): Observable<any> {
    const url = `${this.baseUrl}/usuarios/${userId}`;
    const token = localStorage.getItem('jwt_token');

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.error(
        'Error: No se encontró token JWT en localStorage para la petición de datos de usuario.'
      );
    }

    return this.http.get<any>(url, { headers: headers });
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData);
  }

  //  CORREGIDO: Usar 'user_id' en lugar de 'userId'
  getUsuarioId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? parseInt(userId, 10) : null;
  }

  //  Verificar si hay usuario logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token') && !!localStorage.getItem('user_id');
  }

  //  Obtener token
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  //  Cerrar sesión
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
  }

  recuperarPassword(email: string): Observable<any> {
    const url = `${this.baseUrl}/usuarios/recuperar-password`;
    return this.http.post(url, { email });
  }

  actualizarPerfil(userId: number, datos: any): Observable<any> {
    const url = `${this.baseUrl}/usuarios/${userId}`;
    const token = localStorage.getItem('jwt_token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put<any>(url, datos, { headers });
  }

  cambiarPassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    const url = `${this.baseUrl}/usuarios/${userId}/cambiar-password`;
    const token = localStorage.getItem('jwt_token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.put(
      url,
      { oldPassword, newPassword },
      {
        headers,
        responseType: 'text',
      }
    );
  }
}
