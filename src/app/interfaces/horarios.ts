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
  titular_interino = 'Titular Interino'
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
  _id?: string;
  materia?: Materia;
  profesor?: Profesor;
  curso?: Curso ;
  modulo?: number;
  dia?: EDia;
  tipoProfesor?: ETipoProfesor;
  arrayProfesores?: {
    profesor: Profesor;
    tipoProfesor: ETipoProfesor
  }[]
}

export interface CreateHorarioXCursoDto {
  materia: string;
  curso: string;
  profesor: string;
  modulo: number;
  dia: EDia;
  tipoProfesor: ETipoProfesor;
  arrayProfesores?: {
    profesor: string;
    tipoProfesor: ETipoProfesor
  }[]
}
export interface UpdateHorarioXCursoDto {
  _id: string;
  materia: string;
  curso: string;
  profesor: string;
  modulo: number;
  dia: EDia;
  tipoProfesor: ETipoProfesor;
  arrayProfesores?: {
    profesor: string;
    tipoProfesor: ETipoProfesor
  }[]
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

export enum ETurnoManana{
  MODULO_1 = '7:30-8:30',
  MODULO_2 = '8:30-9:30',
  MODULO_3 = '9:50-10:50',
  MODULO_4 = '10:50-11:50',
  MODULO_5 = '11:50-12:50',
}
export enum ETurnoTarde{
  MODULO_1 = '12:50-13:50',
  MODULO_2 = '13:50-14:50',
  MODULO_3 = '15:10-16:10',
  MODULO_4 = '16:10-17:10',
  MODULO_5 = '17:10-18:10',
  MODULO_PREHORA = 'Prehora'
}
