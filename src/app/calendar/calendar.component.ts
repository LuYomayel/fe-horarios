import { Component, OnInit, ViewChild } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { SelectItem } from 'primeng/api';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { CreateHorarioXCursoDto, CreateProfesoreDto, Curso, ETipoProfesor, ETurno, HorarioXCurso, Materia, Profesor } from '../interfaces/horarios';
import { catchError, empty, first, map, of } from 'rxjs';
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

  display: boolean = false;
  showDialog(modulo: number, diaSemana: EDia) {
    const me = this;
    me.horarioAAsignar.curso = me.selectedCurso;
    me.horarioAAsignar.modulo = modulo;
    me.horarioAAsignar.dia = diaSemana;
    me.display = true;
  }

  displayProfesor: boolean = false;
  showDialogProfesor() {
    const me = this;
    me.displayProfesor = true;
  }

  horarioAAsignar: HorarioXCurso = {
    dia: EDia.lunes,
    modulo: 1,
    tipoProfesor: ETipoProfesor.titular,
    turno: ETurno.mañana,
    curso: {
      _id: '1',
      anio: 1,
      division: 1
    },
    materia: {
      _id: '',
      nombre: ''
    },
    profesor:{
      _id: '',
      apellido: '',
      dni: 0,
      nombre: ''
    }
  };
  events: any[] = [];
  options!: CalendarOptions;
  weekDays: SelectItem[] = [];

  constructor(protected dataService: HorariosService){
    const me = this;

  }

  async ngOnInit() {
    const me = this;
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
      dayHeaderFormat: {
        weekday: 'short',
      },
      headerToolbar: {
        start: '',
        center: '',
        end: ''
      },
      selectable: true,
      allDaySlot: false,
      timeZone: 'UTC',
      dateClick: (info) => {
        const nroDia = new Date(info.dateStr).getUTCDate()
        const modulo = new Date(info.dateStr).getUTCHours()
        const diaSemana = me.dataService.getDia(nroDia)
        this.showDialog(modulo, diaSemana)
      },
      nowIndicator: true,
      eventClick: function(info) {
      },
      height: '36rem',

    };
    await this.dataService.getHorarioXCurso().subscribe(result => {
      this.events = result
    })
    me.cargarMaterias();
    me.cargarProfesores();
    me.cargarCurso();
    // this.events = [
    //   {
    //     title: 'BCH237',
    //     start: '2023-05-01T01:30:00',
    //     end: '2023-05-01T05:30:00',
    //     extendedProps: {
    //       department: 'BioChemistry'
    //     },
    //     description: 'Lecture'
    //   }
    //   // more events ...
    // ]
  }

  materias: Materia[] = []
  selectedMateria!: Materia;
  cargarMaterias(){
    const me = this;
    me.dataService.getMaterias().subscribe( result => me.materias = result)
  }

  profesores: Profesor[] = []
  selectedProfesor?: (Profesor);
  async cargarProfesores(){
    const me = this;
    await me.dataService.getProfesores().subscribe( (result) => {
      me.profesores = result
      me.selectedProfesor = result[0]
    })
  }

  turnos: ETurno[] = [ETurno.mañana, ETurno.tarde, ETurno.prehora];
  turnoSelected!: ETurno;

  cursos: Curso[] = [];
  selectedCurso!: Curso;

  idHorario!: string;
  cargarCurso(){
    const me = this;
    me.dataService.getCursos().subscribe(result => me.cursos = result)
  }

  cursoChange(){
    const me = this;
    // console.log('Curso selected', event)
    // console.log('Curso selected', me.selectedCurso)
    me.dataService.getHorarioXCurso(me.selectedCurso.anio, me.selectedCurso.division).subscribe(result => me.events = result)
  }

  turnoChange(event:ETurno){
    const me = this;
    me.horarioAAsignar.turno = event;
  }

  materiaChange(event: Materia){
    const me = this;
    me.horarioAAsignar.materia = event;
  }

  profesorChange(event: Profesor){
    const me = this;
    me.horarioAAsignar.profesor = event;
    me.selectedProfesor = event;
  }

  quitarSeleccion(){
    const me = this;
    me.horarioAAsignar.profesor = undefined;
    // me.selectedProfesor = undefined;
  }

  async guardarHorario(){
    const me = this;
    if(!me.validarCampos()) {
      console.log('No está validado')
      return;
    }

    // await me.getIdHorario().then(result => me.idHorario = result._id)

    const dto: CreateHorarioXCursoDto = {
      curso: me.selectedCurso._id,
      materia: me.horarioAAsignar.materia?._id || '',
      profesor: me.horarioAAsignar.profesor?._id || '',
      modulo: me.horarioAAsignar.modulo || -1,
      turno: me.horarioAAsignar.turno || ETurno.noche,
      dia: me.horarioAAsignar.dia || EDia.lunes,
      tipoProfesor: me.horarioAAsignar.tipoProfesor || ETipoProfesor.provisional,
    }
    console.log(dto)
    me.dataService.asignarHorario(dto).subscribe(result => {
      me.display = false;
      me.cursoChange();
    })
    console.log('Guardando...')
  }

  validarCampos(){
    let validado: boolean = true;
    return validado;
  }

  dtoProfesor: CreateProfesoreDto ={
    nombre: '',
    apellido: '',
    dni: 0,
  };
  agregarProfesor(){
    const me = this;
    if(this.dtoProfesor.apellido != '' && me.dtoProfesor.nombre != '' && me.dtoProfesor.dni != 0){
      me.dataService.agregarProfesor(me.dtoProfesor).subscribe(() => me.cargarProfesores())
    }
  }
}


