import { Component, OnInit } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { SelectItem } from 'primeng/api';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
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


  events: any[] = [];
  options!: CalendarOptions;
  weekDays: SelectItem[] = [];

  constructor(protected dataService: HorariosService){

  }

  ngOnInit() {

    this.dataService.getHorarioXCurso().subscribe(result => this.events = result)
    const newDate = new Date();
    this.options = {
      locale: esLocale,
      plugins: [timeGridPlugin, interactionPlugin],
      initialDate: `${newDate.getFullYear()}-05-01`,
      initialView: 'timeGridWeek',
      weekends: false,
      slotDuration: '01:00',
      slotMinTime: '01:00:00',
      slotMaxTime: '7:00:00',
      slotLabelFormat: {
        hour: 'numeric',
        meridiem: false
      },
      titleFormat: {
        year: 'numeric',
      },
      dayHeaderFormat: {
        weekday: 'short',
      },
      headerToolbar: {
        start: 'title',
        center: '',
        end: ''
      },
      selectable: true,
      timeZone: 'UTC',
      dateClick: function(info) {
        console.log('Date', new Date(info.dateStr).getUTCDate())
        console.log('Month', new Date(info.dateStr).getUTCMonth())
        console.log('Year', new Date(info.dateStr).getUTCFullYear())
      },
      nowIndicator: true,
      eventClick: function(info) {
        alert('Event: ' + info.event.title);
        alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
        alert('View: ' + info.view.type);

        // change the border color just for fun
        info.el.style.borderColor = 'red';
      }
    };
    console.log('Date: ', new Date(2023,4,1))
    console.log(this.events)
    // this.events = [
    //   {
    //     title: 'BCH237',
    //     start: '2023-03-15T10:30:00',
    //     end: '2023-03-15T11:30:00',
    //     extendedProps: {
    //       department: 'BioChemistry'
    //     },
    //     description: 'Lecture'
    //   }
    //   // more events ...
    // ]

    this.weekDays = [
      { label: 'Lunes', value: 1 },
      { label: 'Martes', value: 2 },
      { label: 'Miércoles', value: 3 },
      { label: 'Jueves', value: 4 },
      { label: 'Viernes', value: 5 }
    ];
  }
}
