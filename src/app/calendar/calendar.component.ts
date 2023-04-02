import { Component, OnInit, ViewChild } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { SelectItem } from 'primeng/api';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { CreateHorarioXCursoDto, CreateProfesoreDto, Curso, ERoles, ETipoProfesor, ETurno, HorarioXCurso, IUsuario, Materia, Profesor } from '../interfaces/horarios';
import { catchError, empty, first, map, of } from 'rxjs';
import {MessageService} from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { AuthGuard } from '../services/auth-guard';
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
  providers: [ HorariosService, MessageService ]
})

export class CalendarComponent implements OnInit {

  display: boolean = false;
  showDialog(modulo: number, diaSemana: EDia) {
    const me = this;
    if(me.roles.includes(ERoles.ADMIN)){
      me.horarioAAsignar.curso = me.selectedCurso;
      me.horarioAAsignar.modulo = modulo;
      me.horarioAAsignar.dia = diaSemana;
      if(me.selectedFiltro.key == 1){
        me.turnos = me.selectedCurso.turno;
      }
      if(me.selectedFiltro.key == 2){
        me.disableProfesor = true;
        me.turnos = [ETurno.mañana, ETurno.prehora, ETurno.tarde];
      }
      me.display = true;
    }else{
      me.showErrorToast('No tienes permisos para asignar horarios.')
    }
  }

  disableProfesor:boolean = false;
  displayProfesor: boolean = false;
  showDialogProfesor() {
    const me = this;
    if(me.roles.includes(ERoles.ADMIN)){
      me.displayProfesor = true;
    }else{
      me.showErrorToast('No tienes permisos para agregar profesores.')
    }

  }

  optionsFiltro: any[] = [
    {
    label: 'Cursos',
    key: 1
    },
    {
      label: 'Profesores',
      key: 2
    }
  ]

  selectedFiltro!: any;
  selectedFiltroTurno!: any;
  optionsFiltroTurno: ETurno[] = [ETurno.mañana, ETurno.tarde, ETurno.prehora];

  horarioAAsignar: HorarioXCurso = {
    dia: EDia.lunes,
    modulo: 1,
    tipoProfesor: ETipoProfesor.titular,
    curso: {
      _id: '1',
      anio: 1,
      division: 1,
      turno: [ETurno.mañana]
    },
    materia: {
      _id: '',
      nombre: ''
    },
    profesor:{
      _id: '',
      apellido: '',
      dni: 0,
      nombre: '',
      fechaNacimiento: new Date()
    }
  };
  events: any[] = [];
  options!: CalendarOptions;
  weekDays: SelectItem[] = [];
  roles: ERoles[] = [];
  constructor(
    protected dataService: HorariosService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private authGuard: AuthGuard
  ){
    const me = this;
    me.primengConfig.ripple = true;
    me.roles = me.dataService.getRolesUsuario();
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
      eventContent: function(info) {
        const eventTitle = info.event.title;
        const eventDescription = info.event.extendedProps['description'];
        return {
          html: `<div class="fc-title">${eventTitle}<br>${eventDescription}</div>`,
          classNames: ['my-event-class']
        };
      }
    };
    await this.dataService.getHorarioXCurso().subscribe(result => {
      this.events = result
    })
    me.cargarMaterias();
    me.cargarProfesores();
    me.cargarCurso();
  }

  materias: Materia[] = []
  selectedMateria!: Materia;
  cargarMaterias(){
    const me = this;
    me.dataService.getMaterias().subscribe({
      next: result => me.materias = result,
      error: error => me.showErrorToast(error.error.message)
    })
  }

  profesores: Profesor[] = []
  selectedProfesor?: (Profesor);
  async cargarProfesores(){
    const me = this;
    await me.dataService.getProfesores().subscribe( {
      next: (result) => {
      me.profesores = result
      me.selectedProfesor = result[0]
      },
      error: error => me.showErrorToast(error.error.message)
    })
  }

  turnos: ETurno[] = [ETurno.mañana, ETurno.tarde, ETurno.prehora];
  turnoSelected!: ETurno;

  cursos: Curso[] = [];
  selectedCurso!: Curso;

  idHorario!: string;
  async cargarCurso(){
    const me = this;
    await me.dataService.getCursos().subscribe({
      next: result => me.cursos = result,
      error: error => me.showErrorToast(error.error.message)
      }
    )
  }

  cursoChange(){
    const me = this;
    if(me.selectedFiltro.key == 1)me.dataService.getHorarioXCurso(me.selectedCurso.anio, me.selectedCurso.division).subscribe(result => {
      me.events = result
      me.options.eventDisplay = 'block';
    })
  }

  turnoChange(event:ETurno){
    const me = this;
    if(me.horarioAAsignar.curso)me.horarioAAsignar.curso.turno[0] = event;
  }

  materiaChange(event: Materia){
    const me = this;
    me.horarioAAsignar.materia = event;
  }

  profesorChange(event: Profesor){
    const me = this;
    me.horarioAAsignar.profesor = event;
    me.selectedProfesor = event;
    if(me.selectedFiltro.key == 2)me.dataService.getHorarioXProfesor(event, this.selectedFiltroTurno).subscribe(result => {

      me.events = result;
    })
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

    const dto: CreateHorarioXCursoDto = {
      curso: me.selectedCurso._id,
      materia: me.horarioAAsignar.materia?._id || '',
      profesor: me.horarioAAsignar.profesor?._id || '',
      modulo: me.horarioAAsignar.modulo || -1,
      dia: me.horarioAAsignar.dia || EDia.lunes,
      tipoProfesor: me.horarioAAsignar.tipoProfesor || ETipoProfesor.provisional,
    }
    me.dataService.asignarHorario(dto).subscribe({
      next: value => {
        me.display = false;
        me.cursoChange();
      },
      error: error => {
        me.showErrorToast(error.error.message)
      },
      complete: () => console.log('Completado')
    })
    // me.dataService.asignarHorario(dto).subscribe(result => {
    //   me.display = false;
    //   me.cursoChange();
    // }, error => {
    //   console.log('ERROR: ', error.error.message)
    //   me.showErrorToast(error.error.message)
    // })
  }

  validarCampos(){
    let validado: boolean = true;
    return validado;
  }

  dtoProfesor: CreateProfesoreDto ={
    nombre: '',
    apellido: '',
    dni: 0,
    fechaNacimiento: new Date()
  };
  agregarProfesor(){
    const me = this;

    if(!me.esFechaValida()) {
      me.showErrorToast(`Fecha de nacimiento inválida: el año debe estar entre 1920 y ${new Date().getFullYear()-18}.`)
      return;
    }
    if(!me.esDniValido(me.dtoProfesor.dni.toString())){
      me.showErrorToast('Formato de dni inválido.')
      return;
    }
    if(this.dtoProfesor.apellido != '' && me.dtoProfesor.nombre != ''){
      me.dataService.agregarProfesor(me.dtoProfesor).subscribe(() => me.cargarProfesores())
      me.displayProfesor = false;
      me.showBottomCenter();
    }else{
      me.showErrorToast('Se deben completar todos los campos.')
    }
  }

  showBottomCenter() {
    this.messageService.add({key: 'bc', severity:'success', summary: 'Registro exitoso', detail: 'Profesor guardado correctamente!'});
  }

  showErrorToast(message: string) {
    this.messageService.add({
      key: 'bc',
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  filtroChange(event:any){
    console.log(this.selectedFiltro)
  }

  filtroTurnoChange(event: ETurno){
    const me = this;

    if(me.selectedFiltro.key == 2 && me.selectedProfesor)me.dataService.getHorarioXProfesor(me.selectedProfesor, event).subscribe(result => {
      console.log('Horarios del profe: ', result)
      me.events = result;
    })
  }

  esDniValido(dni:string) {
    // La expresión regular verifica que el DNI tenga entre 1 y 8 dígito
    const dniRegex = /^\d{7,8}$/;

    // Si el DNI cumple con la expresión regular, es válido
    return dniRegex.test(dni);
  }

  esFechaValida(){
    const me = this;
    const fechaNacimiento = new Date(me.dtoProfesor.fechaNacimiento);
    return (fechaNacimiento.getFullYear() > 1920 && fechaNacimiento.getFullYear() < (new Date().getFullYear()-18));
  }

  imprimir(){
    const me = this;
    me.dataService.verPdf()
    // .subscribe({
    //   next: (value:any) => console.log('Value: ', value),
    //   error: (error:any) => console.log('Error 123: ', error)
    // })
  }
}


