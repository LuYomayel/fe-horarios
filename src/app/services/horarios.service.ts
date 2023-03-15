import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse, HttpHeaders , HttpRequest  } from '@angular/common/http';

import {map} from 'rxjs/operators';
import { global } from "./global";
import { Observable } from "rxjs";
import { EDia, HorarioXCurso } from "../interfaces/horarios";

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
        public _http:HttpClient
    ){
        this.url = global.url
    }

    getDia(dia: EDia){
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

    getHorarioXCurso(): Observable<Event[]>{
        console.log(this.url)
        return this._http.get<HorarioXCurso[]>(`${this.url}horario-x-curso/curso/1/1`).pipe(
            map(
                result => {
                  const newArray: Event[] = result.map( horarioAsignado => {
                    const newDate = new Date()
                    return {
                      title: horarioAsignado.materia.nombre,
                      start: `2023-05-${this.getDia(horarioAsignado.horario.dia)}T0${horarioAsignado.horario.modulo}:00:00`,
                      end: `2023-05-${this.getDia(horarioAsignado.horario.dia)}T0${horarioAsignado.horario.modulo+1}:00:00`
                    }
                  })
                  console.log('Nuevo array: ', newArray)
                  return newArray;
                }
            )
        )
    }

    // addAlumno(Alumno: DTOAlumno):Observable<IResultAlumno>{
    //     let json = JSON.stringify(Alumno);
    //     let params = 'json='+json;
    //     let headers = new HttpHeaders('application/x-www-form-urlencoded');
    //     console.log(Alumno)
    //     return this._http.post<IResultAlumno>(`${this.url}/students`, json, {headers: {"Content-type":"application/json"}}).pipe(
    //         map(
    //             result => result
    //         )
    //     )
    // }

    // putAlumno(alumno: IAlumno):Observable<IResultAlumno>{
    //     let json = JSON.stringify(alumno);
    //     let params = 'json='+json;
    //     let headers = new HttpHeaders('application/x-www-form-urlencoded');
    //     console.log(alumno)
    //     return this._http.put<IResultAlumno>(`${this.url}/students/${alumno.idAlumno}`, json, {headers: {"Content-type":"application/json"}}).pipe(
    //         map(
    //             result => result

    //         )
    //     )
    // }

    // deleteAlumno(idAlumno: number):Observable<IResultAlumno>{
    //     console.log(idAlumno)
    //     return this._http.delete<IResultAlumno>(`${this.url}/students/${idAlumno}`).pipe(
    //         map(
    //             result => result
    //         )
    //     )
    // }

}
