export interface AutorReportante {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

// Estructura completa del Usuario Logueado (con todos sus campos, incluyendo password hasheado)
export interface UsuarioLogueado {
  id: number;
  nombre: string;
  apellido: string;
  password: string;
  dni: string;
  email: string;
  telefono: string;
  imagen: string;
  provincia: string;
  localidad: string;
  publicaciones: Publicacion[]; // Lista de publicaciones del usuario (podría ser un array de IDs para optimizar)
  avistamientos: Avistamiento[]; // Lista de avistamientos del usuario (podría ser un array de IDs para optimizar)
}

// Estructura de una Publicación
export interface Publicacion {
  id: number;
  nombre: string;
  color: string;
  tamanio: string;
  fecha: string; // Formato "YYYY-MM-DD"
  descripcion: string;
  telefono: string;
  estado: 'PERDIDO_PROPIO' | 'ENCONTRADO'; // O los valores que manejes
  imagenesUrls: string[];
  provincia: string;
  localidad: string;
  calle: string;
  altura: string;
  autor: AutorReportante;
  avistamientos: Avistamiento[]; // Los avistamientos asociados a esta publicación
}

// Estructura de un Avistamiento
export interface Avistamiento {
  id: number;
  publicacionId: number | null; // ID de la publicación asociada o null si es un avistamiento independiente
  reportante: AutorReportante;
  direccion: string;
  fecha: string; // Formato "YYYY-MM-DD"
  hora: string; // Formato "HH:MM:SS"
  descripcion: string;
  imagenesUrls: string[];
  provincia: string;
  localidad: string;
  calle: string;
  altura: string;
}

// --- Interfaz Principal del Estado Global ---

export interface AppEstado {
  // --- MÓDULO DE AUTENTICACIÓN / USUARIO ---
  usuario: UsuarioLogueado | null; // La información detallada del usuario logueado
  estaLogueado: boolean;

  // --- MÓDULO DE DATOS GLOBALES ---
  // (Ej. lista de todas las publicaciones visibles en el feed)
  publicacionesGlobales: Publicacion[];
  cargandoPublicaciones: boolean;
  errorPublicaciones: string | null;

  // (Ej. lista de todos los avistamientos reportados)
  avistamientosGlobales: Avistamiento[];
  cargandoAvistamientos: boolean;
  errorAvistamientos: string | null;
}
