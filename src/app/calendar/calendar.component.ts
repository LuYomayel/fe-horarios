import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { SelectItem } from 'primeng/api';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { CreateHorarioXCursoDto, CreateProfesoreDto, Curso, ERoles, ETipoProfesor, ETurno, ETurnoManana, ETurnoTarde, HorarioXCurso, IUsuario, Materia, Profesor, UpdateCursoDto, UpdateHorarioXCursoDto } from '../interfaces/horarios';
import { Subject, catchError, empty, first, map, of, takeUntil } from 'rxjs';
import {MessageService} from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { AuthGuard } from '../services/auth-guard';
import { Route, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { DialogHorariosData, HorarioDialogComponent } from '../dialogs/horario-dialog/horario-dialog.component';
import { ChangeDetectorRef } from '@angular/core';
import { AgregarProfesorDialogComponent } from '../dialogs/agregar-profesor-dialog/agregar-profesor-dialog.component';

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
  providers: [ HorariosService, ConfirmationService ]
})

export class CalendarComponent implements OnInit, AfterViewInit {

  dataDialog: DialogHorariosData = {
    dia: EDia.lunes,
    modulo: 1,
    turno: ETurno.mañana,
    cursos: [],
    arrayProfesores: [],
    profesor: undefined
  }

  @ViewChild('horarioDialog') horarioDialog!: HorarioDialogComponent;
  @ViewChild('agregarProfesorDialog') agregarProfesorDialog!: AgregarProfesorDialogComponent;

  showagregarProfesorDialog(){
    this.agregarProfesorDialog.showDialog(undefined);
  }
  async showDialog(modulo: number, diaSemana: EDia, accion:string) {
    const me = this;

    if(me.roles.includes(ERoles.ADMIN)){
      me.loading = true;
      me.tituloHorario = 'Agregar Horario';
      me.dataDialog.modulo = modulo;
      me.dataDialog.dia = diaSemana;

      me.dataDialog.cursos = [];
      const curso = me.cursos.find( curso => curso._id == me.cursoId);
      if(curso){
        me.dataDialog.cursos.push(curso);
      }else{
        me.dataDialog.cursos.push(me.selectedCurso);
      }
      // console.log('Filtro: ', me.selectedFiltro)
      console.log('CURSO CALENDAR: ', me.dataDialog.cursos)
      console.log('CURSO horario asignar: ', me.horarioAAsignar.curso?._id, me.horarioAAsignar.curso)
      me.dataDialog.arrayProfesores = []
      me.dataDialog.profesor = undefined;
      if(accion == 'AGREGAR' && me.selectedFiltro.key == 2){
        me.dataDialog.profesor = me.selectedProfesor;
        me.dataDialog.cursos = me.cursos.filter(curso => curso.turno.includes(me.selectedFiltroTurno))
      }
      else if(accion == 'EDITAR'){
        me.tituloHorario = 'Editar Horario';

        me.dataDialog.arrayProfesores = await me.buscarHorario(me.horarioAAsignar._id || '') || [];

        me.dataDialog._id = me.horarioAAsignar._id;
        if(me.selectedFiltro.key == 2){
          me.dataDialog.profesor = me.selectedProfesor;
        }
      }
      me.dataDialog.turno = me.dataDialog.cursos.map(curso => curso.turno)[0][0];
      if(me.dataDialog.turno == ETurno.tarde && me.dataDialog.modulo == 6) me.dataDialog.turno = ETurno.prehora;

      me.horarioDialog.showDialog(me.dataDialog);
      me.loading=false;
    }else{
      me.showErrorToast('No tienes permisos para asignar o editar horarios.')
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
  // TODO: Cambiar color del evento segun tipo de profesor.
  opcionesTipoProfesor: ETipoProfesor[] = [ETipoProfesor.titular, ETipoProfesor.suplente, ETipoProfesor.provisional, ETipoProfesor.titular_interino]
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
      cuil: 0,
      nombre: ''
    },
    arrayProfesores: []
  };

  cursoId: string = '';
  tituloHorario: string = '';
  events: any[] = [];
  options!: CalendarOptions;
  roles: ERoles[] = [];
  slotMinTime:string = '07:45';
  slotMaxTime:string = '12:50';
  constructor(
    protected dataService: HorariosService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private route:Router,
  ){
    const me = this;
    me.primengConfig.ripple = true;
    me.roles = me.dataService.getRolesUsuario();
    this.selectedCurso = {
      anio: 1,
      division: 1,
      turno: [ETurno.mañana],
      _id: ''
    }
  }

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  ngAfterViewInit(): void {
    const me = this;

    this.horarioDialog.displayChange.subscribe((value) => {
      if(value){
        if(me.selectedFiltro.key == 1)me.cursoChange();
        if(me.selectedFiltro.key == 2)me.profesorChange();
      }
      // Aquí puedes realizar las acciones necesarias cuando el diálogo se cierra
    });

    this.agregarProfesorDialog.displayChange.subscribe( (value) => {
      if(value)this.profesorChange();
    })
  }

  async ngOnInit() {
    const me = this;
    const newDate = new Date();

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
      slotLabelFormat: (dateObj) => {
        const currentHour = dateObj.date.hour;
        const currentMinute = dateObj.date.minute;

        let hourNumber: string = '';
        if((this.selectedFiltro.key == 1 && this.selectedCurso.turno.includes(ETurno.mañana)) || (this.selectedFiltro.key == 2 && this.selectedFiltroTurno == ETurno.mañana)){
          if (currentHour === 7 && currentMinute >= 30) {
            hourNumber = ETurnoManana.MODULO_1;
          } else if (currentHour === 8 && currentMinute >= 30) {
            hourNumber = ETurnoManana.MODULO_2;
          } else if (currentHour === 9 && currentMinute >= 38) {
            hourNumber = ETurnoManana.MODULO_3;
          } else if (currentHour === 10 && currentMinute >= 42) {
            hourNumber = ETurnoManana.MODULO_4;
          } else if (currentHour === 11 && currentMinute >= 46) {
            hourNumber = ETurnoManana.MODULO_5;
          }
        }else{
          if(currentHour < 12 ){
            hourNumber = ETurnoTarde.MODULO_PREHORA;
          }
          else if (currentHour === 12 && currentMinute >= 54) {
            hourNumber = ETurnoTarde.MODULO_1;
          } else if (currentHour === 13 && currentMinute >= 58) {
            hourNumber = ETurnoTarde.MODULO_2;
          } else if (currentHour === 15 && currentMinute >= 2) {
            hourNumber = ETurnoTarde.MODULO_3;
          } else if (currentHour === 16 && currentMinute >= 1) {
            hourNumber = ETurnoTarde.MODULO_4;
          } else if (currentHour === 17 && currentMinute >= 6) {
            hourNumber = ETurnoTarde.MODULO_5;
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
        const diaSemana = me.dataService.getDia(nroDia);
        me.cursoId = me.selectedCurso._id;
        this.showDialog(modulo, diaSemana, 'AGREGAR')

      },
      nowIndicator: true,
      eventClick: (info) =>  {
        const nroDia = new Date(info.event.start || '').getUTCDate()
        const hora = new Date(info.event.start || '').getUTCHours()
        // console.log('Title: ', info.event.title);
        me.dataDialog.materia = info.event.title;
        const modulo = this.getNroModulo(hora);
        const profesor = info.event.extendedProps['description'].split(' ');
        me.horarioAAsignar._id = info.event.extendedProps['id_horario'];

        me.cursoId = info.event.extendedProps['curso'];
        // const profeEncontrado = this.profesores.find(profe => {
        //   if(!profe.nombre){
        //     if(!profe.apellido) return false;
        //     else {
        //       return profe.apellido.includes(profesor[profesor.length - 1])
        //     }
        //   }
        //   console.log('Hola: ',profesor[1] ,profesor[profesor.length - 1])
        //   return profe.nombre.includes(profesor[1]) && profe.apellido.includes(profesor[profesor.length - 1])
        // });
        // this.selectedProfesor = profeEncontrado;
        // console.log('Event profe: ',  info.event.extendedProps['description'])
        const diaSemana = me.dataService.getDia(nroDia)
        this.showDialog(modulo, diaSemana, 'EDITAR')
      },
      height: '32rem',
      eventContent: (info) => {
        const eventTitle = info.event.title;
        const tipoProfesor = this.getTipoProfesor(info.event.extendedProps['descripcion'])
        const eventDescription = `${info.event.extendedProps['description']}`;
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
    me.cargarProfesores();
    me.cargarCurso();

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
      },
      error: error => {
        me.errorAutenticacion(error);
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
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
        // console.log('Cursos: ', result)

        me.selectedCurso = me.cursos[0];
      },
      error: error => {
        me.errorAutenticacion(error);
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
      }
    )
  }

  cursoChange(){
    const me = this;
    if(me.selectedFiltro.key == 1){
      // console.log('Curso: ', me.selectedCurso)
      me.loading = true;
      me.dataService.getHorarioXCurso(me.selectedCurso.anio, me.selectedCurso.division).subscribe({
        next: result => {
          me.events = result;
          me.options.eventDisplay = 'block';
          this.cambiarHorarios();
        },
        error: error =>{
          console.log('Error: ', error)
          // me.showErrorToast(error.error.message)
          me.loading=false;
        },
        complete: () => me.loading = false
      })
    }
  }

  turnoChange(event:ETurno){
    const me = this;
    if(me.horarioAAsignar.curso)me.horarioAAsignar.curso.turno[0] = event;

    this.cambiarHorarios();
  }

  async profesorChange(){
    const me = this;

    me.horarioAAsignar.profesor = me.selectedProfesor;

    if(me.selectedFiltro.key == 2 && me.selectedProfesor){
      me.loading = true;

      me.dataService.getHorarioXProfesor(me.selectedProfesor, me.selectedFiltroTurno).subscribe({
        next: result => {
          me.events = result;
        },
        complete: () => me.loading = false
      })
    }
  }

  showErrorToast(message: string) {
    this.messageService.add({
      key: 'bc',
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  showSuccessToast(message: string) {
    this.messageService.add({
      key: 'bc',
      severity: 'success',
      summary: 'Exito!',
      detail: message,
    });
  }

  filtroChange(event:any){
    // console.log(this.selectedFiltro)
    this.selectedFiltro.key == 2 ? this.profesorChange() : this.cursoChange();
  }

  filtroTurnoChange(event: ETurno){
    const me = this;
    me.cambiarHorarios();

    if(me.selectedFiltro.key == 2 && me.selectedProfesor)me.dataService.getHorarioXProfesor(me.selectedProfesor, event).subscribe(result => {

      me.events = result;
    })
  }


  getNroModulo(modulo:number){
    const me = this;
    if(me.selectedFiltro.key == 1){
      if(this.selectedCurso.turno.includes(ETurno.tarde) && modulo == 11 && this.selectedFiltro.key == 1) return 6;
      if(modulo == 12 && this.selectedCurso.turno.includes(ETurno.mañana)) return 5;
    }else if(me.selectedFiltro.key == 2){
      if(modulo == 11  && this.selectedFiltroTurno == ETurno.tarde) return 6;
    }
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
        this.options.slotDuration = '01:04';
        this.options.slotMinTime = '07:30';
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
        this.options.slotDuration = '01:04';
        this.options.slotMinTime = '07:30';
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
      case ETipoProfesor.titular_interino:
        return 'TI';
      default:
        return 'Error tipo Profe'
    }
  }


  async imprimir() {
    this.loading = true;
    try {
      await this.dataService.verPdf(this.selectedCurso.anio, this.selectedCurso.division);
    } catch (error) {
      console.error('Error al obtener el PDF:', error);
      // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje de error en la interfaz de usuario
    } finally {
      this.loading = false;
    }
  }

  async imprimirProfesor() {
    this.loading = true;
    try {
      if(!this.selectedProfesor) throw new Error('No se selecciono un profesor');
      // console.log(this.selectedProfesor?._id, this.selectedFiltroTurno);
      await this.dataService.verPdfProfesor(this.selectedProfesor?._id, this.selectedFiltroTurno);
    } catch (error) {
      this.showErrorToast('Error al obtener el PDF');
      console.error('Error al obtener el PDF:', error);
      // Aquí puedes manejar el error, por ejemplo, mostrar un mensaje de error en la interfaz de usuario
    } finally {
      this.loading = false;
    }
  }


  cerrarSesion(){
    this.loading = true;
    localStorage.clear();
    this.route.navigate(['/login']);
    this.loading = false;
  }

  errorAutenticacion(error: any){
    if(error.error.statusCode == 401) this.route.navigate(['/login'])
  }

  buscarHorario(id: string): Promise<[]>{
    const me = this;
    return new Promise( (resolve, reject) => {

      me.dataService.getIdHorario(id).subscribe({
        next: value => {
          me.loading = false
          // console.log('Array: ', value)
          if(value.arrayProfesores){
            resolve(value.arrayProfesores)
          }
          else resolve([])
        },
        error: error => {
          reject(error)
          me.loading = false;
        },
        complete: () => me.loading = false
      })
    })
  }

  editarNota:boolean = false;
  editarNotas(){
    this.editarNota = !this.editarNota;
  }

  guardarNota(){
    this.loading = true;
    const dto: UpdateCursoDto = {
      notas: this.selectedCurso.notas || ''
    }
    this.dataService.editarCurso(this.selectedCurso._id, dto).subscribe({
      next: value => {
        console.log('Value: ', value)

      },
      error: error => {
        this.showErrorToast(error.error.message)
        this.editarNotas();
        this.loading = false;
      },
      complete: () => {
        this.showSuccessToast('Nota guardada correctamente!')
        this.loading = false;
        this.editarNotas();
      }
    })
  }
}


