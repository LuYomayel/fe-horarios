import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse, HttpHeaders , HttpRequest, HttpErrorResponse   } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {map} from 'rxjs/operators';
import { global } from "./global";
import { Observable } from "rxjs";
import { CreateHorarioXCursoDto, CreateProfesoreDto, Curso, EDia, ERoles, ETurno, HorarioXCurso, Materia, Profesor, UpdateHorarioXCursoDto } from "../interfaces/horarios";
import { AppComponent } from "../app.component";
import { CalendarComponent } from "../calendar/calendar.component";
import jwtDecode from "jwt-decode";
interface Event {
  title?: string,
  start?: string,
  end?: string,
  description?: string,
}

@Injectable()
export class HorariosService{
    public url:string;

    constructor(
        public _http:HttpClient,
        private appComponent: AppComponent
    ){
        this.url = global.url

    }

    getNroDia(dia: EDia){
      switch(dia){
        case EDia.lunes:
          return 1
        case EDia.martes:
          return 2
        case EDia.miercoles:
          return 3
        case EDia.jueves:
          return 4
        case EDia.viernes:
          return 5
        default:
          return -1;
      }
    }

    getDia(nro: number){
      switch(nro){
        case 1:
          return EDia.lunes
        case 2:
          return EDia.martes
        case 3:
          return EDia.miercoles
        case 4:
          return EDia.jueves
        case 5:
          return EDia.viernes
        default:
          return EDia.lunes;
      }
    }

    getHorario(modulo:number, turno: ETurno) : any {
      const me = this;
      switch(modulo){
        case 1:
          return turno == ETurno.mañana ? {start: '07:30' , end: '08:30'} : {start: '12:50' , end: '13:50'}
        case 2:
          return turno == ETurno.mañana ? {start: '08:30' , end: '09:30'} : {start: '13:50' , end: '14:50'}
        case 3:
          return turno == ETurno.mañana ? {start: '09:50' , end: '10:50'} : {start: '15:10' , end: '16:10'}
        case 4:
          return turno == ETurno.mañana ? {start: '10:50' , end: '11:50'} : {start: '16:10' , end: '17:10'}
        case 5:
          return turno == ETurno.mañana ? {start: '11:50' , end: '12:50'} : {start: '17:10' , end: '18:10'}
        case 6:
          return turno == ETurno.tarde ? {start: '11:50' , end: '12:50'} : {start: '17:10' , end: '18:10'}
      }
    }

    getHorarioXCurso(anio: number=1, curso:number=1): Observable<Event[]>{
        return this._http.get<HorarioXCurso[]>(`${this.url}horario-x-curso/curso/${anio}/${curso}`).pipe(
            map(
                result => {
                  const newArray: Event[] = result.map( horarioAsignado => {
                    const newDate = new Date()
                    const dia = horarioAsignado.dia ? horarioAsignado.dia : EDia.lunes
                    const modulo = horarioAsignado.modulo ? horarioAsignado.modulo : -1;
                    // console.log('Array: ', horarioAsignado.arrayProfesores)
                    let profesor = '';
                    let tipoProfesor = '';
                    if(horarioAsignado.arrayProfesores && horarioAsignado.arrayProfesores.length > 0){
                      profesor = `${horarioAsignado.arrayProfesores[0].profesor.nombre} ${horarioAsignado.arrayProfesores[0].profesor.apellido}`
                      tipoProfesor = `${horarioAsignado.arrayProfesores[0].tipoProfesor}`
                    }
                    // const profesor = horarioAsignado.profesor ? `${horarioAsignado.profesor.nombre} ${horarioAsignado.profesor.apellido}` : ''
                    const objHorario = this.getHorario((horarioAsignado.modulo || -1), (horarioAsignado.curso?.turno[0] || ETurno.noche))
                    // console.log('horarios: ', objHorario)
                    return {
                      title: horarioAsignado.materia?.nombre,
                      start: `2023-05-0${this.getNroDia(dia)}T${objHorario.start}:00`,
                      end: `2023-05-0${this.getNroDia(dia)}T${objHorario.end}:00`,
                      // start: `2023-05-0${this.getNroDia(dia)}T0${modulo}:00:00`,
                      // end: `2023-05-0${this.getNroDia(dia)}T0${modulo+1}:00:00`,
                      description: profesor,
                      extendedProps: {
                        descripcion: `${tipoProfesor}`,
                        lugar: `${horarioAsignado._id}`
                      }
                    }
                  })
                  // console.log('Nuevo array: ', newArray)
                  return newArray;
                }
            ),
            catchError((error: HttpErrorResponse) => {
              console.log('Error; ', error)
              return throwError(() => new Error(error.message));
            }),

        )
    }

    getHorarioXProfesor(profesor: Profesor, turno: ETurno): Observable<Event[]>{
      return this._http.get<HorarioXCurso[]>(`${this.url}horario-x-curso/profesor/${profesor._id}/${turno}`).pipe(
          map(
              result => {
                const newArray: Event[] = result.map( horarioAsignado => {
                  const newDate = new Date()
                  const dia = horarioAsignado.dia ? horarioAsignado.dia : EDia.lunes
                  const modulo = horarioAsignado.modulo ? horarioAsignado.modulo : -1;
                  const profesorNombre = profesor ? `${profesor.nombre} ${profesor.apellido}` : '';
                  const objHorario = this.getHorario((horarioAsignado.modulo || -1), (horarioAsignado.curso?.turno[0] || ETurno.noche))
                  return {
                    title: horarioAsignado.materia?.nombre,
                    start: `2023-05-0${this.getNroDia(dia)}T${objHorario.start}:00`,
                    end: `2023-05-0${this.getNroDia(dia)}T${objHorario.end}:00`,
                    description: profesorNombre,
                    extendedProps: {
                      descripcion: `${horarioAsignado.tipoProfesor}`,
                      lugar: `${horarioAsignado._id}`
                    }
                  }
                })
                // console.log('Nuevo array: ', newArray)
                return newArray;
              }
          )
      )
  }

    getMaterias(): Observable<Materia[]>{
      return this._http.get<Materia[]>(`${this.url}materias`).pipe(
        map(
            result => result

        )
      )
    }

    getProfesores(): Observable<Profesor[]>{
      return this._http.get<Profesor[]>(`${this.url}profesores`).pipe(
        map(
            result => result
        )
      )
    }

    getCursos(): Observable<Curso[]>{
      return this._http.get<Curso[]>(`${this.url}cursos`).pipe(
        map(
            result => result
        )
      )
    }

    getPDF(): any{
      return this._http.get<any>(`${this.url}horario-x-curso/descargar-horario`).pipe(
        map(
            result => result
        )
      )
    }

    verPdf(anio: number, division: number) {
      return this._http.get(`${this.url}horario-x-curso/descargar-horario/curso/${anio}/${division}`, { responseType: 'blob' }).subscribe((pdfData: Blob) => {
        const file = new Blob([pdfData], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
      });
    }

    // getIdHorario(modulo:number, turno: ETurno, dia: EDia): Observable<Horario>{
    //   return this._http.get<Horario>(`${this.url}horarios/${modulo}/${turno}/${dia}`).pipe(
    //     map(
    //         result => result
    //     )
    //   )
    // }

    asignarHorario(horarioAAsignar: CreateHorarioXCursoDto):Observable<any>{
        let json = JSON.stringify(horarioAAsignar);
        let params = 'json='+json;
        let headers = new HttpHeaders('application/x-www-form-urlencoded');
        console.log(json)
        return this._http.post<any>(`${this.url}horario-x-curso`, json, {headers: {"Content-type":"application/json"}}).pipe(
            map(
                result => result
            )
        )
    }

    editarHorario(horarioAAsignar: UpdateHorarioXCursoDto):Observable<any>{
      let json = JSON.stringify(horarioAAsignar);
      let params = 'json='+json;
      let headers = new HttpHeaders('application/x-www-form-urlencoded');
      console.log(json)
      return this._http.put<any>(`${this.url}horario-x-curso`, horarioAAsignar, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    agregarProfesor(dto: CreateProfesoreDto):Observable<any>{
      let json = JSON.stringify(dto);
      let params = 'json='+json;
      let headers = new HttpHeaders('application/x-www-form-urlencoded');
      console.log(json)
      return this._http.post<any>(`${this.url}profesores`, json, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    login(nombre: string, contrasenia:string):Observable<any>{
      const usuario = {
        nombreUsuario: nombre,
        contrasenia
      }
      let json = JSON.stringify(usuario);
      let params = 'json='+json;
      let headers = new HttpHeaders('application/x-www-form-urlencoded');
      return this._http.post<any>(`${this.url}login`, json, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    getRolesUsuario(): ERoles[] {
      try {
        const token = localStorage.getItem('token') || '';
        const decodedToken: any = jwtDecode(token);
        // console.log(decodedToken)
        const roles: ERoles[] = decodedToken.role || [];
        return roles;
      } catch (error) {
        console.error('Error decoding token:', error);
        return [];
      }
    }

}
