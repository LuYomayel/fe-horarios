import { Component, OnInit } from '@angular/core';
import { HorariosService } from '../services/horarios.service';

interface horarioSemanal {
  modulos: number[];
  dias: EDia[]
}

enum EDia {
  lunes = 'Lunes',
  martes = 'Martes',
  miercoles = 'Miercoles',
  jueves = 'Jueves',
  viernes = 'Vienes',
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [ HorariosService ]
})

export class CalendarComponent implements OnInit {

  currentDate = new Date();
  months : string[] = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  // days: string[] = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
  days: EDia[] = [
    EDia.lunes,
    EDia.martes,
    EDia.miercoles,
    EDia.jueves,
    EDia.viernes,
  ]
  mod: horarioSemanal = {
    modulos: [1,2,3,4,5,6],
    dias: this.days
  }
  currentYear? : number;

  modulos: Array<any> = [
    this.days,
    this.days,
    this.days,
    this.days,
    this.days,
    this.days,
  ]


  weeks: Array<any> = [
    [
      new Date(2019, 11, 1),
      new Date(2019, 11, 2),
      new Date(2019, 11, 3),
      new Date(2019, 11, 4),
      new Date(2019, 11, 5),
      new Date(2019, 11, 6),
      new Date(2019, 11, 7)],
    [
      new Date(2019, 11, 8),
      new Date(2019, 11, 9),
      new Date(2019, 11, 10),
      new Date(2019, 11, 11),
      new Date(2019, 11, 12),
      new Date(2019, 11, 13),
      new Date(2019, 11, 14),
    ],
    [
      new Date(2019, 11, 15),
      new Date(2019, 11, 16),
      new Date(2019, 11, 17),
      new Date(2019, 11, 18),
      new Date(2019, 11, 19),
      new Date(2019, 11, 20),
      new Date(2019, 11, 21),
    ],
    [
      new Date(2019, 11, 22),
      new Date(2019, 11, 23),
      new Date(2019, 11, 24),
      new Date(2019, 11, 25),
      new Date(2019, 11, 26),
      new Date(2019, 11, 27),
      new Date(2019, 11, 28),
    ],
    [
      new Date(2019, 11, 29),
      new Date(2019, 11, 30),
      new Date(2019, 11, 31),
    ]
  ]


  constructor(protected horarioService: HorariosService) { }

  ngOnInit() {
    const me = this;
    me.horarioService.getHorarioXCurso().subscribe( result => console.log(result))
  }

  getMonth() {
    return this.months[this.currentDate.getMonth()];
  }

  getFirstDay() {
    return this.days[this.currentDate.getDay()];
  }

  getYear() {
    return this.currentDate.getFullYear();
  }
}
