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
import { Route, Router } from '@angular/router';
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
      if(modulo == 6 && me.horarioAAsignar.curso) me.horarioAAsignar.curso.turno = [ETurno.prehora];
      me.horarioAAsignar.dia = diaSemana;
      if(me.selectedFiltro.key == 1){
        me.turnos = me.selectedCurso.turno;
        me.cursosDialog = me.cursos;
      }
      if(me.selectedFiltro.key == 2){
        me.disableProfesor = true;
        me.turnos = [me.selectedFiltroTurno];
        me.cursosDialog = me.cursos.filter(curso => curso.turno.includes(me.selectedFiltroTurno))
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

  selectedFiltro: any = {key: 1};
  selectedFiltroTurno!: any;
  optionsFiltroTurno: ETurno[] = [ETurno.mañana, ETurno.tarde];
  loading: boolean = false;
  // TODO: Me falta un tipo de profesor.
  // TODO: Cambiar color del evento segun tipo de profesor.
  opcionesTipoProfesor: ETipoProfesor[] = [ETipoProfesor.titular, ETipoProfesor.suplente, ETipoProfesor.provisional]
  selectedTipoProfesor: ETipoProfesor = ETipoProfesor.titular;
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
  slotMinTime:string = '07:45'
  slotMaxTime:string = '12:50'
  constructor(
    protected dataService: HorariosService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private authGuard: AuthGuard,
    private route:Router
  ){
    const me = this;
    me.primengConfig.ripple = true;
    me.roles = me.dataService.getRolesUsuario();
  }

  async ngOnInit() {
    const me = this;
    const newDate = new Date();
    this.selectedCurso = {
      anio: 1,
      division: 1,
      turno: [ETurno.mañana],
      _id: ''
    }
    this.options = {
      locale: esLocale,
      plugins: [timeGridPlugin, interactionPlugin],
      navLinks: false,
      initialDate: `${newDate.getFullYear()}-05-01`,
      initialView: 'timeGridWeek',
      weekends: false,
      slotDuration: '01:01',
      slotMinTime: this.slotMinTime,
      slotMaxTime: this.slotMaxTime,
      // slotMinTime: '00:45:00',
      // slotMaxTime: '23:50:00',
      // slotLabelFormat: {
      //   hour: 'numeric',
      //   meridiem: false
      // },
      slotLabelFormat: (dateObj) => {
        const currentHour = dateObj.date.hour;
        const currentMinute = dateObj.date.minute;

        let hourNumber: string = '';
        if((this.selectedFiltro.key == 1 && this.selectedCurso.turno.includes(ETurno.mañana)) || (this.selectedFiltro.key == 2 && this.selectedFiltroTurno == ETurno.mañana)){
          if (currentHour === 7 && currentMinute >= 45) {
            hourNumber = `1° 7:45-8:30`;
          } else if (currentHour === 8 && currentMinute >= 30) {
            hourNumber = `2° 8:30-9:30`;
          } else if (currentHour === 9 && currentMinute >= 30) {
            hourNumber = `3° 9:50-10:50`;
          } else if (currentHour === 10 && currentMinute >= 45) {
            hourNumber = `4° 10:50-11:50`;
          } else if (currentHour === 11 && currentMinute >= 45) {
            hourNumber = `5° 11:50-12:50`;
          }
        }else{
          if(currentHour < 12 ){
            hourNumber = 'Prehora';
          }
          else if (currentHour === 12 && currentMinute >= 54) {
            hourNumber = `1° 12:50-13:50`;
          } else if (currentHour === 13 && currentMinute >= 58) {
            hourNumber = `2° 13:50-14:50`;
          } else if (currentHour === 15 && currentMinute >= 2) {
            hourNumber = `3° 15:10-16:10`;
          } else if (currentHour === 16 && currentMinute >= 1) {
            hourNumber = `4° 16:10-17:10`;
          } else if (currentHour === 17 && currentMinute >= 6) {
            hourNumber = `5° 17:10-18:10`;
          }
        }
        return hourNumber;
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
        const hora = new Date(info.dateStr).getUTCHours()
        const modulo = this.getNroModulo(hora);
        const diaSemana = me.dataService.getDia(nroDia)
        this.showDialog(modulo, diaSemana)
      },
      nowIndicator: true,
      eventClick: function(info) {
      },
      height: '32rem',
      eventContent: (info) => {
        const eventTitle = info.event.title;
        const tipoProfesor = this.getTipoProfesor(info.event.extendedProps['descripcion'])
        const eventDescription = `${tipoProfesor}: ${info.event.extendedProps['description']}`;
        const horas = new Date(info.event.start || '').getUTCHours()
        const minutos = new Date(info.event.start || '').getUTCMinutes()
        return {
          html: `<div class="fc-title">${eventTitle}<br>${eventDescription}</div>`,
          classNames: ['my-event-class']
        };
      }
    };
    this.loading = true;
    await this.dataService.getHorarioXCurso().subscribe(result => {
      this.events = result;
    })
    me.cargarMaterias();
    me.cargarProfesores();
    me.cargarCurso();

  }

  materias: Materia[] = []
  selectedMateria!: Materia;
  cargarMaterias(){
    const me = this;
    me.loading = true;
    me.loading = true;
    me.dataService.getMaterias().subscribe({
      next: result => {
        me.materias = result
        me.loading = false;
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      }

    })
  }

  profesores: Profesor[] = []
  selectedProfesor?: (Profesor);
  async cargarProfesores(){
    const me = this;
    me.loading = true;
    await me.dataService.getProfesores().subscribe( {
      next: (result) => {
        me.profesores = result
        me.selectedProfesor = result[0];
        me.profesores = me.profesores.sort((a, b) => a.apellido.localeCompare(b.apellido));
        me.loading = false;
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      }
    })
  }

  turnos: ETurno[] = [ETurno.mañana, ETurno.tarde, ETurno.prehora];
  turnoSelected!: ETurno;

  cursos: Curso[] = [];
  cursosDialog: Curso[] = [];
  selectedCurso!: Curso;

  idHorario!: string;
  async cargarCurso(){
    const me = this;
    me.loading = true;
    await me.dataService.getCursos().subscribe({
      next: result => {
        me.cursos = result;
        console.log('Cursos: ', result)
        me.cursos = me.cursos.sort((a, b) => {
          if (a.anio === b.anio) {
            return a.division - b.division;
          }
          return a.anio - b.anio;
        });
        me.loading = false;
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      }
      }
    )
  }

  cursoChange(){
    const me = this;
    if(me.selectedFiltro.key == 1){
      me.loading = true;
      me.dataService.getHorarioXCurso(me.selectedCurso.anio, me.selectedCurso.division).subscribe(result => {
        me.events = result;
        me.options.eventDisplay = 'block';
        this.cambiarHorarios();
        me.loading = false;
      })
    }
  }

  turnoChange(event:ETurno){
    const me = this;
    if(me.horarioAAsignar.curso)me.horarioAAsignar.curso.turno[0] = event;

    this.cambiarHorarios();
  }

  materiaChange(event: Materia){
    const me = this;
    me.horarioAAsignar.materia = event;
  }

  profesorChange(){
    const me = this;

    me.horarioAAsignar.profesor = me.selectedProfesor;

    if(me.selectedFiltro.key == 2 && me.selectedProfesor){
      me.loading = true;
      me.dataService.getHorarioXProfesor(me.selectedProfesor, this.selectedFiltroTurno).subscribe(result => {
        me.events = result;
        me.loading = false;
      })
    }
  }

  quitarSeleccion(){
    const me = this;
    me.horarioAAsignar.profesor = undefined;
    // me.selectedProfesor = undefined;
  }

  async guardarHorario(){
    const me = this;
    if(!me.validarCampos()) {

      return;
    }

    const dto: CreateHorarioXCursoDto = {
      curso: me.selectedCurso._id,
      materia: me.horarioAAsignar.materia?._id || '',
      profesor: me.horarioAAsignar.profesor?._id || '',
      modulo: me.horarioAAsignar.modulo || -1,
      dia: me.horarioAAsignar.dia || EDia.lunes,
      tipoProfesor: me.selectedTipoProfesor,
    }
    me.loading = true;
    me.dataService.asignarHorario(dto).subscribe({
      next: value => {
        me.display = false;
        me.loading = false;
        if(me.selectedFiltro.key == 1)me.cursoChange();
        if(me.selectedFiltro.key == 2)me.profesorChange();

      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
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
    this.selectedFiltro.key == 2 ? this.profesorChange() : this.cursoChange();
  }

  filtroTurnoChange(event: ETurno){
    const me = this;
    me.cambiarHorarios();

    if(me.selectedFiltro.key == 2 && me.selectedProfesor)me.dataService.getHorarioXProfesor(me.selectedProfesor, event).subscribe(result => {

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


  getNroModulo(modulo:number){
    const me = this;
    if(this.selectedCurso.turno.includes(ETurno.tarde) && modulo == 11 && this.selectedFiltro.key == 1) return 6;
    if(modulo == 11 && this.selectedFiltro.key == 2 && this.selectedFiltroTurno == ETurno.tarde) return 6;
    switch(modulo){
      case 7:
      case 12:
        return 1;
      case 8:
      case 13:
        return 2;
      case 9:
      case 15:
        return 3;
      case 10:
      case 16:
        return 4;
      case 11:
      case 17:
        return 5;
      default:
        return -2
    }
  }

  cambiarHorarios(){
    const me = this;
    if(me.selectedFiltro.key == 1){
      if(this.selectedCurso.turno.includes(ETurno.mañana)){
        this.options.height = '32rem';
        this.options.slotDuration = '01:01';
        this.options.slotMinTime = '07:45';
        this.options.slotMaxTime = '12:50';
      }else if(this.selectedCurso.turno.includes(ETurno.tarde)){
        this.options.height = '36rem';
        this.options.slotDuration = '01:04';
        this.options.slotMinTime = '11:50';
        this.options.slotMaxTime = '18:10';
      }
    }
    if(me.selectedFiltro.key == 2){
      if(this.selectedFiltroTurno == ETurno.mañana){
        this.options.height = '32rem';
        this.options.slotDuration = '01:01';
        this.options.slotMinTime = '07:45';
        this.options.slotMaxTime = '12:50';
      }else if(this.selectedFiltroTurno == ETurno.tarde){
        this.options.height = '36rem';
        this.options.slotDuration = '01:04';
        this.options.slotMinTime = '11:50';
        this.options.slotMaxTime = '18:10';
      }
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
      default:
        return 'Error tipo Profe'
    }
  }


  imprimir(){
    const me = this;
    me.dataService.verPdf(me.selectedCurso.anio, me.selectedCurso.division)
    // .subscribe({
    //   next: (value:any) => console.log('Value: ', value),
    //   error: (error:any) => console.log('Error 123: ', error)
    // })
  }

  cerrarSesion(){
    this.loading = true;
    localStorage.clear();
    this.route.navigate(['/login']);
    this.loading = false;
  }

}


