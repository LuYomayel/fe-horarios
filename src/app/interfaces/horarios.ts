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
}

export interface Horario  {
  modulo: number;
  turno: ETurno;
  dia: EDia;
  tipoProfesor: ETipoProfesor;
}

export interface Materia  {
  nombre: string;
}

export interface Profesor  {
  nombre: string;
  apellido: string;
  dni: number;
}

export interface HorarioXCurso {
  materia: Materia;
  profesor: Profesor;
  curso: Curso ;
  horario: Horario ;
}
