export enum ETurno {
  mañana = 'Mañana',
  tarde = 'Tarde',
  prehora = 'Prehora',
  noche = 'Noche',
}

export enum EDia {
  lunes = 'Lunes',
  martes = 'Martes',
  miercoles = 'Miercoles',
  jueves = 'Jueves',
  viernes = 'Vienes',
}

export enum ETipoProfesor {
  titular = 'Titular',
  suplente = 'Suplente',
  provisional = 'Provisional',
}

export interface Curso  {
  _id: string;
  anio: number;
  division: number;
  turno: ETurno[];
}

// export interface Horario  {
//   _id: string;
//   modulo: number;
//   turno: ETurno;
//   dia: EDia;
//   tipoProfesor: ETipoProfesor;
// }

export interface Materia  {
  _id: string;
  nombre: string;
}

export interface Profesor  {
  _id: string;
  nombre: string;
  apellido: string;
  dni: number;
  fechaNacimiento: Date;
}

export interface HorarioXCurso {
  materia?: Materia;
  profesor?: Profesor;
  curso?: Curso ;
  modulo?: number;
  dia?: EDia;
  tipoProfesor?: ETipoProfesor;
}

export interface CreateHorarioXCursoDto {
  materia: string;
  curso: string;
  profesor: string;
  modulo: number;
  dia: EDia;
  tipoProfesor: ETipoProfesor;
}

export interface CreateProfesoreDto {
  nombre: string;
  apellido: string;
  dni: number;
  fechaNacimiento: Date;
}

export enum ERoles {
  ADMIN = 'ADMIN',
  VISUALIZAR = 'VISUALIZAR',
}

export interface IUsuario {
  nombreUsuario: string;
  contrasenia?: string;
  correo: string;
  roles: ERoles[];
}
