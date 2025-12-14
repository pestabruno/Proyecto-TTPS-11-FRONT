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
}
