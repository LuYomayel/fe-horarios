import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse, HttpHeaders , HttpRequest, HttpErrorResponse   } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {map} from 'rxjs/operators';
import { global } from "./global";
import { Observable } from "rxjs";
import { CreateCursoDto, CreateHorarioXCursoDto, CreateMateriaDto, CreateProfesoreDto, Curso, EDia, ERoles, ETipoProfesor, ETurno, HorarioXCurso, Materia, Profesor, UpdateCursoDto, UpdateHorarioXCursoDto, UpdateMateriaDTO, UpdateProfesorDto } from "../interfaces/horarios";
import { AppComponent } from "../app.component";
import { CalendarComponent } from "../calendar/calendar.component";
import jwtDecode from "jwt-decode";

interface Event {
  title?: string,
  start?: string,
  end?: string,
  description?: string,
}

import { environment } from '../../environments/environment';



@Injectable()
export class HorariosService{
    public url:string;
    apiUrl = environment.apiUrl;

    constructor(
        public _http:HttpClient,
        private appComponent: AppComponent
    ){
        this.url = this.apiUrl;
        console.log('Servicio de horarios listo', this.url);
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

    getTipoProfesor(string: any){
      const me = this;
      switch(string){
        case ETipoProfesor.provisional:
          return 'P';
        case ETipoProfesor.titular:
          return 'T';
        case ETipoProfesor.suplente:
          return 'S';
        case ETipoProfesor.titular_interino:
          return 'TI';
        default:
          return 'Error tipo Profe'
      }
    }

    getColorEvento(tipoProfe: ETipoProfesor){
      const me = this;
      switch(tipoProfe){
        case ETipoProfesor.provisional:
          return '#9EFFA3'; //verde
        case ETipoProfesor.titular:
          return '#92C9FF'; //azul
        case ETipoProfesor.suplente:
          return '#FFA3A3'; // rojo
        case ETipoProfesor.titular_interino:
          return '#FFF176'; //amarillo
        default:
          return 'Error tipo Profe'
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

                    const arrayNombresProfes = horarioAsignado.arrayProfesores.map( profe => {
                      return `${this.getTipoProfesor(profe.tipoProfesor)}: ${profe.profesor.nombre || ''} ${profe.profesor.apellido}`
                    })
                    const tipoProfesor = horarioAsignado.arrayProfesores[0].tipoProfesor;
                    const colorEvento = this.getColorEvento(tipoProfesor);
                    const nombresProfes = arrayNombresProfes.join('<br>')
                    const objHorario = this.getHorario((horarioAsignado.modulo || -1), (horarioAsignado.curso?.turno[0] || ETurno.noche))

                    return {
                      title: horarioAsignado.materia?.nombre,
                      start: `2023-05-0${this.getNroDia(dia)}T${objHorario.start}:00`,
                      end: `2023-05-0${this.getNroDia(dia)}T${objHorario.end}:00`,
                      backgroundColor: colorEvento,
                      borderColor: 'white',
                      textColor: 'black',
                      // start: `2023-05-0${this.getNroDia(dia)}T0${modulo}:00:00`,
                      // end: `2023-05-0${this.getNroDia(dia)}T0${modulo+1}:00:00`,
                      description: nombresProfes,
                      extendedProps: {
                        id_horario: `${horarioAsignado._id}`,
                        curso: `${horarioAsignado.curso?._id}`
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
                  const objHorario = this.getHorario((horarioAsignado.modulo || -1), (horarioAsignado.curso?.turno[0] || ETurno.noche))

                  const profesorIndex = horarioAsignado.arrayProfesores.findIndex(array => array.profesor._id == profesor._id)
                  const arrayNombresProfes = horarioAsignado.arrayProfesores.map( profe => {
                    return `${this.getTipoProfesor(profe.tipoProfesor)}: ${profe.profesor.nombre || ''} ${profe.profesor.apellido}`
                  })
                  const nombresProfes = arrayNombresProfes.join('<br>')

                  // let colorEvento = '';
                  // let tipoProfesor = ETipoProfesor.titular;
                  // if(profesorIndex != -1){
                  //   tipoProfesor = horarioAsignado.arrayProfesores[profesorIndex].tipoProfesor
                  //   colorEvento = this.getColorEvento(tipoProfesor);
                  // }

                  const tipoProfesor = horarioAsignado.arrayProfesores[profesorIndex].tipoProfesor
                  const colorEvento = this.getColorEvento(tipoProfesor);

                  const tipo = this.getTipoProfesor(tipoProfesor);
                  // const profesorNombre = profesor ? `${tipo}: ${profesor.nombre} ${profesor.apellido}` : '';
                  // console.log('Horario: ', horarioAsignado.curso)
                  return {
                    title: horarioAsignado.materia?.nombre,
                    start: `2023-05-0${this.getNroDia(dia)}T${objHorario.start}:00`,
                    end: `2023-05-0${this.getNroDia(dia)}T${objHorario.end}:00`,
                    borderColor: 'white',
                    textColor: 'black',
                    description: nombresProfes,
                    backgroundColor: colorEvento,
                    extendedProps: {
                      descripcion: `${tipoProfesor}`,
                      id_horario: `${horarioAsignado._id}`,
                      curso: `${horarioAsignado.curso?._id}`
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
            result => {
              const profesores = result.sort((a, b) => a.apellido.localeCompare(b.apellido));
              return profesores;
            }
        )
      )
    }

    getCursos(): Observable<Curso[]>{
      return this._http.get<Curso[]>(`${this.url}cursos`).pipe(
        map(
            result => {
              const cursos = result.sort((a, b) => {
                if (a.anio === b.anio) {
                  return a.division - b.division;
                }
                return a.anio - b.anio;
              });
              return cursos;
            }
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

    verPdf(anio: number, division: number): Promise<void> {
      return new Promise((resolve, reject) => {
        this._http.get(`${this.url}horario-x-curso/descargar-horario/curso/${anio}/${division}`, { responseType: 'blob' }).subscribe((pdfData: Blob) => {
          const file = new Blob([pdfData], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
          resolve();
        }, error => {
          reject(error);
        });
      });
    }

    verPdfProfesor(id: string, turno: ETurno): Promise<void> {
      return new Promise((resolve, reject) => {
        this._http.get(`${this.url}horario-x-curso/descargar-horario/profesor/${id}/${turno}`, { responseType: 'blob' }).subscribe((pdfData: Blob) => {
          console.log('PDF: ', pdfData)
          const file = new Blob([pdfData], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
          resolve();
        }, error => {
          reject(error);
        });
      });
    }

    descargarExcelProfesores(): Promise<void> {
      return new Promise((resolve, reject) => {
        this._http.get(`${this.url}profesores/exportar`, { responseType: 'blob' }).subscribe(
          (excelData: Blob) => {
            console.log('Excel: ', excelData)
            const file = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
            resolve();
          },
          error => {
            reject(error);
          }
        );
      });
    }

    getIdHorario(id: string): Observable<any>{
      return this._http.get<HorarioXCurso>(`${this.url}horario-x-curso/${id}`).pipe(
        map(
            result => result
        )
      )
    }

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
      // console.log(json)
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

    agregarCurso(dto: CreateCursoDto):Observable<any>{
      let json = JSON.stringify(dto);
      let params = 'json='+json;
      let headers = new HttpHeaders('application/x-www-form-urlencoded');
      console.log(json)
      return this._http.post<any>(`${this.url}cursos`, json, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    agregarMateria(dto: CreateMateriaDto):Observable<any>{
      let json = JSON.stringify(dto);
      let headers = new HttpHeaders('application/x-www-form-urlencoded');
      console.log(json)
      return this._http.post<any>(`${this.url}materias`, json, {headers: {"Content-type":"application/json"}}).pipe(
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

    deleteHorario(id:string ): Observable<any>{
        return this._http.delete<any>(`${this.url}horario-x-curso/${id}`).pipe(
          map(
              result => result
          )
      )
    }

    editarCurso(id:string, body: UpdateCursoDto ): Observable<any>{
      let json = JSON.stringify(body);
      return this._http.put<any>(`${this.url}cursos/${id}`, body, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    eliminarCurso(id:string): Observable<any>{
      return this._http.delete<any>(`${this.url}cursos/${id}`, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    editarProfesor(id:string, body: UpdateProfesorDto ): Observable<any>{
      let json = JSON.stringify(body);
      return this._http.put<any>(`${this.url}profesores/${id}`, body, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    eliminarProfesor(id:string): Observable<any>{
      return this._http.delete<any>(`${this.url}profesores/${id}`, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    editarMateria(id:string, body: UpdateMateriaDTO ): Observable<any>{
      let json = JSON.stringify(body);
      return this._http.put<any>(`${this.url}materias/${id}`, body, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    eliminarMateria(id:string): Observable<any>{
      return this._http.delete<any>(`${this.url}materias/${id}`, {headers: {"Content-type":"application/json"}}).pipe(
          map(
              result => result
          )
      )
    }

    sendErrorEmail(error: string){
      return this._http.post<any>(`${this.url}email/error`, {errorMessage: error}, {headers: {"Content-type":"application/json"}}).pipe(
        map(
            result => result
        )
    )
    }

    sendInicioSesionEmail(nombreUsuario: string){
      return this._http.post<any>(`${this.url}email/inicioSesion`, {nombreUsuario}, {headers: {"Content-type":"application/json"}}).pipe(
        map(
            result => result
        )
    )
    }

}
