import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CreateHorarioXCursoDto, Curso, EDia, ETipoProfesor, ETurno, HorarioXCurso, Materia, Profesor, UpdateHorarioXCursoDto } from '../../interfaces/horarios';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HorariosService } from '../../services/horarios.service';
import { Router } from '@angular/router';

export interface DialogHorariosData{
  dia: EDia,
  modulo: number;
  turno: ETurno;
  cursos: Curso[];
  arrayProfesores: {
    profesor: Profesor;
    tipoProfesor: ETipoProfesor
  }[];
  _id?: string;
}

@Component({
  selector: 'app-horario-dialog',
  templateUrl: './horario-dialog.component.html',
  styleUrls: ['./horario-dialog.component.scss'],
})
export class HorarioDialogComponent implements OnInit {

  @Input() display: boolean = false;
  @Input() tituloHorario: string = '';
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter();
  @Output() onClose: EventEmitter<boolean> = new EventEmitter();
  @Output() onDialogClose: EventEmitter<void> = new EventEmitter();


  // Añade aquí tus propiedades y métodos relacionados a las materias, profesores, cursos, turnos, etc.
  materias: Materia[] = [];
  selectedMateria!: Materia;

  profesores: Profesor[] = []
  selectedProfesor!: Profesor;
  disableProfesor: boolean = false;
  profesoresAgregados: any[] = [];

  opcionesTipoProfesor: ETipoProfesor[] = [ETipoProfesor.titular, ETipoProfesor.suplente, ETipoProfesor.provisional, ETipoProfesor.titular_interino]
  selectedTipoProfesor: ETipoProfesor = ETipoProfesor.titular;

  selectedFiltro: any = {key: 1};

  cursosDialog: Curso[] = []
  selectedCurso!: Curso;

  turnos: ETurno[] = [ETurno.mañana, ETurno.tarde, ETurno.prehora];
  turnoSelected!: ETurno;

  selectedDia!: EDia;
  selectedModulo!: number;

  _id: string = '';

  loading: boolean = false;
  data!: DialogHorariosData;
  constructor(
    protected dataService: HorariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route:Router,
  ) { }

  ngOnInit(): void {
    const me = this;
    me.cargarMaterias();
    me.cargarProfesores();
    // me.cargarCurso();
  }

  // Cerrar y abrir dialogo
  closeDialog() {
    this.display = false;
    this.displayChange.emit(this.display);
    this.onClose.emit(false); // emitir el evento aquí
  }


  showDialog(horario : DialogHorariosData) {
    const me = this;
    // console.log('Horario desde hijo: ', horario.turno)
    me.profesoresAgregados = horario.arrayProfesores;
    me.cursosDialog = horario.cursos;
    me.turnoSelected = horario.turno;
    me.selectedDia = horario.dia;
    me.selectedModulo = horario.modulo;
    if(horario._id) me._id = horario._id;
    this.display = true;
  }

  // Inicializadores

  // cargarCurso no va, eliminar despues
  async cargarCurso(){
    const me = this;
    me.loading = true;
    await me.dataService.getCursos().subscribe({
      next: result => {
        me.cursosDialog = result;
        // console.log('Cursos: ', result)
        me.cursosDialog = me.cursosDialog.sort((a, b) => {
          if (a.anio === b.anio) {
            return a.division - b.division;
          }
          return a.anio - b.anio;
        });
        me.selectedCurso = me.cursosDialog[0];
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

  async cargarMaterias(){
    const me = this;
    me.loading = true;
    await me.dataService.getMaterias().subscribe({
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

  // Añade aquí tus métodos como guardarHorario(), editarHorario(), eliminarProfesor(), materiaChange(), profesorChange(), turnoChange(), etc.
  guardarHorario(){
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
      materia: me.selectedMateria._id || '',
      modulo: me.selectedModulo || -1,
      dia: me.selectedDia || EDia.lunes,
      arrayProfesores
    }
    console.log('Dto agregar: ', dto)
    return;
    me.loading = true;
    me.dataService.asignarHorario(dto).subscribe({
      next: value => {
        me.display = false;
        console.log('Profesor agregado: ', value)
        // if(me.selectedFiltro.key == 1)me.cursoChange();
        // if(me.selectedFiltro.key == 2)me.profesorChange();
      },
      error: error => {
        me.showErrorToast(error.error.message)
        me.loading = false;
      },
      complete: () => me.loading = false
    })
  }

  editarHorario(){
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

    const dto: UpdateHorarioXCursoDto = {
      _id: me._id || '',
      curso: me.selectedCurso._id,
      materia: me.selectedMateria._id || '',
      modulo: me.selectedModulo || -1,
      dia: me.selectedDia || EDia.lunes,
      arrayProfesores
    }
    console.log('Dto: ', dto);
return;
    me.loading = true;
    me.dataService.editarHorario(dto).subscribe({
      next: value => {
        me.display = false;
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

  agregarProfesorArray() {
    // console.log('Hola')
    if (this.selectedProfesor && this.selectedTipoProfesor) {
      const index = this.profesoresAgregados.findIndex(profe => this.selectedTipoProfesor == profe.tipoProfesor)
      if(index != -1 ) {
        this.showErrorToast(`Ya hay un profesor ${this.selectedTipoProfesor}`)
        return;
      }
      const indexProfe = this.profesoresAgregados.findIndex(profe => profe.profesor._id == this.selectedProfesor?._id)

      if(indexProfe != -1 ) {
        this.showErrorToast(`El profesor: ${this.selectedProfesor?.nombre} ${this.selectedProfesor?.apellido} ya está agregado en la lista`)
        return
      }
      this.profesoresAgregados.push({
        profesor: this.selectedProfesor,
        tipoProfesor: this.selectedTipoProfesor,
      });

      // Reiniciar los campos

      this.selectedTipoProfesor = ETipoProfesor.titular;
    }
  }

  editarProfesorArray(){
    const index = this.profesoresAgregados.findIndex(profe => this.selectedTipoProfesor == profe.tipoProfesor)
    if(index != -1 ) return this.showErrorToast(`Ya hay un profesor ${this.selectedTipoProfesor}`)
    const indexProfe = this.profesoresAgregados.findIndex(profe => profe.profesor._id == this.selectedProfesor?._id)
    console.log('Index: ', indexProfe)
    this.profesoresAgregados[indexProfe].tipoProfesor = this.selectedTipoProfesor;
  }

  eliminarProfesor(index: number){
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

  materiaChange(event: any){

  }

  profesorChange(){

  }

  turnoChange(event: any){

  }

  eliminarHorario(){
    const me = this;
    me.loading = true;
    me.dataService.deleteHorario(me._id || '').subscribe( {
      next: value => {
        if(value.deletedCount == 1){
          me.display = false;
          me.showSuccessToast('Se ha eliminado el horario')
        }else{
          me.showErrorToast('No se ha podido eliminar el horario')
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
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  errorAutenticacion(error: any){
    if(error.error.statusCode == 401) this.route.navigate(['/login'])
  }
}
