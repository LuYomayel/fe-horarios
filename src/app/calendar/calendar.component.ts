import { Component, OnInit, ViewChild } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { SelectItem } from 'primeng/api';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es';
import { CreateHorarioXCursoDto, CreateProfesoreDto, Curso, ERoles, ETipoProfesor, ETurno, ETurnoManana, ETurnoTarde, HorarioXCurso, IUsuario, Materia, Profesor, UpdateCursoDto, UpdateHorarioXCursoDto } from '../interfaces/horarios';
import { catchError, empty, first, map, of } from 'rxjs';
import {MessageService} from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { AuthGuard } from '../services/auth-guard';
import { Route, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

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
  providers: [ HorariosService, MessageService, ConfirmationService ]
})

export class CalendarComponent implements OnInit {

  display: boolean = false;

  async showDialog(modulo: number, diaSemana: EDia, accion:string) {
    const me = this;
    if(me.roles.includes(ERoles.ADMIN)){
      me.profesoresAgregados = [];
      me.tituloHorario = 'Agregar Horario';
      // console.log('Curso: ', me.cursos.find( curso => curso._id == me.horarioAAsignar.curso?._id))
      const curso = me.cursos.find( curso => curso._id == me.horarioAAsignar.curso?._id)
      console.log('Curso: ', curso)
      if(curso){
        me.horarioAAsignar.curso = {...curso} ;
        me.selectedCurso = curso;
      }
      me.horarioAAsignar.modulo = modulo;
      me.horarioAAsignar.dia = diaSemana;
      me.cursosDialog = me.cursos;
      if(accion == 'AGREGAR'){
        if(me.selectedFiltro.key == 1){
          if(modulo == 6 && me.horarioAAsignar.curso &&  me.horarioAAsignar.curso.turno.includes(ETurno.tarde)) me.turnoSelected = ETurno.prehora;
          else if(modulo != 6 && me.horarioAAsignar.curso && me.horarioAAsignar.curso.turno.includes(ETurno.tarde)) me.turnoSelected = ETurno.tarde;
          else me.turnoSelected = ETurno.mañana;
          // me.turnos = me.selectedCurso.turno;
          me.disableProfesor = false;
        }
        if(me.selectedFiltro.key == 2){
          console.log('Hola')
          me.disableProfesor = true;
          if(modulo == 6 && me.selectedFiltroTurno == ETurno.tarde) me.turnos = [ETurno.prehora];
          else me.turnos = [me.selectedFiltroTurno];
          me.profesoresAgregados = await me.buscarHorario(me.horarioAAsignar._id || '') || []
          me.cursosDialog = me.cursos.filter(curso => curso.turno.includes(me.selectedFiltroTurno))
        }

      }else{
        me.tituloHorario = 'Editar Horario';
        me.loading = true;
        me.profesoresAgregados = await me.buscarHorario(me.horarioAAsignar._id || '') || [];
        me.selectedFiltro.key == 2 ? me.disableProfesor = true : me.disableProfesor = false;
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
      dni: 0,
      nombre: '',
      fechaNacimiento: new Date()
    },
    arrayProfesores: []
  };
  tituloHorario: string = '';
  events: any[] = [];
  options!: CalendarOptions;
  weekDays: SelectItem[] = [];
  roles: ERoles[] = [];
  slotMinTime:string = '07:45';
  slotMaxTime:string = '12:50';
  profesoresAgregados: any[] = [];
  constructor(
    protected dataService: HorariosService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private authGuard: AuthGuard,
    private route:Router,
    private confirmationService: ConfirmationService
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
        // console.log('Hour: ', hourNumber, currentHour, currentMinute)
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
        this.showDialog(modulo, diaSemana, 'AGREGAR')
      },
      nowIndicator: true,
      eventClick: (info) =>  {
        const nroDia = new Date(info.event.start || '').getUTCDate()
        const hora = new Date(info.event.start || '').getUTCHours()
        // console.log('Hora: ', hora)
        const modulo = this.getNroModulo(hora);
        const profesor = info.event.extendedProps['description'].split(' ');
        me.horarioAAsignar._id = info.event.extendedProps['id_horario'];
        if(me.horarioAAsignar.curso)me.horarioAAsignar.curso._id = info.event.extendedProps['curso'];

        // console.log('curso', me.horarioAAsignar.curso?._id)
        const profeEncontrado = this.profesores.find(profe => {
          if(!profe.nombre){
            if(!profe.apellido) return false;
            else {
              return profe.apellido.includes(profesor[profesor.length - 1])
            }
          }
          return profe.nombre.includes(profesor[1]) && profe.apellido.includes(profesor[profesor.length - 1])
        });
        // this.horarioAAsignar.profesor = this.profesores.find(profe => profe.nombre.includes(profesor[0]) && profe.apellido.includes(profesor[profesor.length - 1]))
        // console.log('Profe: ', profeEncontrado)
        this.selectedProfesor = profeEncontrado;

        const diaSemana = me.dataService.getDia(nroDia)
        this.showDialog(modulo, diaSemana, 'EDITAR')
        // console.log('Info: ', info.event);
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
      },
      error: error => {
        me.errorAutenticacion(error);
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
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
        me.cursos = me.cursos.sort((a, b) => {
          if (a.anio === b.anio) {
            return a.division - b.division;
          }
          return a.anio - b.anio;
        });
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
      console.log('Curso: ', me.selectedCurso)
      me.loading = true;
      me.dataService.getHorarioXCurso(me.selectedCurso.anio, me.selectedCurso.division).subscribe({
        next: result => {
          me.events = result;
          me.options.eventDisplay = 'block';
          this.cambiarHorarios();
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

  materiaChange(event: Materia){
    const me = this;
    me.horarioAAsignar.materia = event;
  }

  profesorChange(){
    const me = this;

    me.horarioAAsignar.profesor = me.selectedProfesor;

    if(me.selectedFiltro.key == 2 && me.selectedProfesor){
      me.loading = true;
      me.dataService.getHorarioXProfesor(me.selectedProfesor, this.selectedFiltroTurno).subscribe({
        next: result => {
          me.events = result;
        },
        complete: () => me.loading = false
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
    const arrayProfesores = this.profesoresAgregados.map(profe => {
      return {
        tipoProfesor: profe.tipoProfesor,
        profesor: profe.profesor._id
      }
    })
    const dto: CreateHorarioXCursoDto = {
      curso: me.selectedCurso._id,
      materia: me.horarioAAsignar.materia?._id || '',
      modulo: me.horarioAAsignar.modulo || -1,
      dia: me.horarioAAsignar.dia || EDia.lunes,
      arrayProfesores
    }
    console.log('Dto agregar: ', dto)
    me.loading = true;
    me.dataService.asignarHorario(dto).subscribe({
      next: value => {
        me.display = false;
        if(me.selectedFiltro.key == 1)me.cursoChange();
        if(me.selectedFiltro.key == 2)me.profesorChange();
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
    })
  }

  async editarHorario(){
    const me = this;
    if(!me.validarCampos()) {

      return;
    }
    const arrayProfesores = this.profesoresAgregados.map(profe => {
      return {
        tipoProfesor: profe.tipoProfesor,
        profesor: profe.profesor._id
      }
    })
    const id = me.horarioAAsignar._id || '';
    const dto: UpdateHorarioXCursoDto = {
      _id: id,
      curso: me.selectedCurso._id,
      materia: me.horarioAAsignar.materia?._id || '',
      modulo: me.horarioAAsignar.modulo || -1,
      dia: me.horarioAAsignar.dia || EDia.lunes,
      arrayProfesores
    }
    // console.log('Dto: ', dto);

    me.loading = true;
    me.dataService.editarHorario(dto).subscribe({
      next: value => {
        me.display = false;

        if(me.selectedFiltro.key == 1)me.cursoChange();
        if(me.selectedFiltro.key == 2)me.profesorChange();

      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
    })
  }

  validarCampos(){
    let validado: boolean = true;
    return validado;
  }

  dtoProfesor: CreateProfesoreDto ={
    nombre: '',
    apellido: '',
    cuil: 0,
  };
  agregarProfesor(){
    const me = this;

    if(!me.esDniValido(me.dtoProfesor.cuil.toString())){
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

  esDniValido(dni:string) {
    // La expresión regular verifica que el DNI tenga entre 1 y 8 dígito
    const dniRegex = /^\d{10,11}$/;

    // Si el DNI cumple con la expresión regular, es válido
    return dniRegex.test(dni);
  }


  getNroModulo(modulo:number){
    const me = this;
    // console.log('Modulo: ', modulo)
    if(this.selectedCurso.turno.includes(ETurno.tarde) && modulo == 11 && this.selectedFiltro.key == 1) return 6;
    if(modulo == 11 && this.selectedFiltro.key == 2 && this.selectedFiltroTurno == ETurno.tarde) return 6;
    if(modulo == 12 && this.selectedCurso.turno.includes(ETurno.mañana)) return 5;
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

  errorAutenticacion(error: any){
    if(error.error.statusCode == 401) this.route.navigate(['/login'])
  }
  agregarProfesorArray() {
    console.log('Hola')
    if (this.selectedProfesor && this.selectedTipoProfesor) {
      const index = this.profesoresAgregados.findIndex(profe => this.selectedTipoProfesor == profe.tipoProfesor)
      if(index != -1 ) return this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: `Ya hay un profesor ${this.selectedTipoProfesor}`});
      const indexProfe = this.profesoresAgregados.findIndex(profe => profe.profesor._id == this.selectedProfesor?._id)

      if(indexProfe != -1 ) return this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: `El profesor: ${this.selectedProfesor?.nombre} ${this.selectedProfesor?.apellido} ya está agregado en la lista`});
      console.log('Profe: ', this.profesoresAgregados)
      this.profesoresAgregados.push({
        profesor: this.selectedProfesor,
        tipoProfesor: this.selectedTipoProfesor,
      });

      // Reiniciar los campos
      this.selectedProfesor = undefined;
      this.selectedTipoProfesor = ETipoProfesor.titular;
    }
  }

  editarProfesorArray(){
    console.log('Selected profe: ', this.selectedProfesor)
    const index = this.profesoresAgregados.findIndex(profe => this.selectedTipoProfesor == profe.tipoProfesor)
    if(index != -1 ) return this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: `Ya hay un profesor ${this.selectedTipoProfesor}`});
    const indexProfe = this.profesoresAgregados.findIndex(profe => profe.profesor._id == this.selectedProfesor?._id)
    console.log('Index: ', indexProfe)
    this.profesoresAgregados[indexProfe].tipoProfesor = this.selectedTipoProfesor;
  }

  buscarHorario(id: string): Promise<[]>{
    const me = this;
    return new Promise( (resolve, reject) => {

      me.dataService.getIdHorario(id).subscribe({
        next: value => {
          // console.log('Array: ', value)
          if(value.arrayProfesores){
            resolve(value.arrayProfesores)
          }
          else resolve([])
        },
        error: error => {
          reject(error)
        },
        complete: () => me.loading = false
      })
    })
  }

  eliminarProfesor(index: number) {
    if(this.selectedFiltro.key == 2){
      console.log('Profe: ', this.selectedProfesor)
      if(this.selectedProfesor?._id === this.profesoresAgregados[index].profesor._id){
        return this.messageService.add({key: 'bc', severity:'error', summary: 'Error', detail: `El profesor: ${this.selectedProfesor?.nombre} ${this.selectedProfesor?.apellido} no se puede eliminar`});
      }else{
        this.profesoresAgregados.splice(index, 1);
      }
    }else{
      this.profesoresAgregados.splice(index, 1);
    }
  }
  eliminarHorario(){
    const me = this;
    me.loading = true;
    me.dataService.deleteHorario(me.horarioAAsignar._id || '').subscribe( {
      next: value => {
        if(value.deletedCount == 1){
          me.display = false;
          this.messageService.add({key: 'bc', severity:'success', summary: 'Exito!', detail: `Se ha eliminado el horario`});
          if(me.selectedFiltro.key == 1)me.cursoChange();
          if(me.selectedFiltro.key == 2)me.profesorChange();
        }else{
          this.messageService.add({key: 'bc', severity:'error', summary: 'Error!', detail: `No se ha podido eliminar el horario`});
        }
        console.log('Value: ', value)
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
    } )
  }

  mostrarConfirmacion() {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar este horario?',
      accept: () => {
        // Acción a realizar si el usuario confirma
        this.eliminarHorario();
        console.log('Usuario confirmó');
      },
      reject: () => {
        // Acción a realizar si el usuario rechaza
        console.log('Usuario rechazó');
      },
    });
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
    this.dataService.guardarNota(this.selectedCurso._id, dto).subscribe({
      next: value => {
        console.log('Value: ', value)

      },
      error: error => {

        this.editarNotas();
        this.loading = false;
      },
      complete: () => {
        this.messageService.add({key: 'bc', severity:'success', summary: 'Registro exitoso', detail: 'Nota guardada correctamente!'});
        this.loading = false;
        this.editarNotas();
      }
    })
  }
}


