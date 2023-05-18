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
  profesor?: Profesor;
  materia?: string;
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
  disableCursos: boolean = true;

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
    this.loadData();

  }

  private async loadData(): Promise<void> {
    await Promise.all([
      this.cargarMaterias(),
      this.cargarProfesores(),
    ]);
  }

  // Cerrar y abrir dialogo
  closeDialog() {
    this.display = false;
    this.displayChange.emit(false);
  }


  showDialog(horario : DialogHorariosData) {
    const me = this;
    me.loading = false;
    me.profesoresAgregados = horario.arrayProfesores;
    console.log('Horario desde hijo: ',  me.profesoresAgregados)
    me.cursosDialog = horario.cursos;
    me.turnoSelected = horario.turno;
    me.selectedDia = horario.dia;
    me.selectedModulo = horario.modulo;
    if(horario.materia) me.selectedMateria = me.materias.filter(result => horario.materia == result.nombre)[0];
    if(horario._id) me._id = horario._id;
    if(horario.profesor) {
      // console.log('Profesor: ', horario.profesor)
      me.disableProfesor = true;
      me.disableCursos = false;
      me.selectedProfesor = horario.profesor;
      if(me.profesoresAgregados.length == 0)me.profesoresAgregados = [{profesor: horario.profesor, tipoProfesor: ETipoProfesor.titular}];
      console.log('Horario desde hijo: ',  me.profesoresAgregados)
    }
    else{
      me.disableCursos = true;
      me.disableProfesor = false;
    }
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
      materia: me.selectedMateria._id || '',
      modulo: me.selectedModulo || -1,
      dia: me.selectedDia || EDia.lunes,
      arrayProfesores
    }
    console.log('Dto agregar: ', dto)
    // return;
    me.loading = true;
    const validarProfe = await me.validarHorarioProfesor(arrayProfesores[0].profesor, me.selectedCurso._id, dto.modulo, me.selectedDia)
    if(validarProfe) return;
    const validarCurso = await me.validarHorarioCurso(me.selectedCurso._id, me.selectedDia, dto.modulo)
    if(validarCurso) return;
    console.log('Validar profe: ', validarProfe)
    me.dataService.asignarHorario(dto).subscribe({
      next: value => {
        console.log('Profesor agregado: ', value)
        me.displayChange.emit(true);
        me.display = false;
        // if(me.selectedFiltro.key == 1)me.cursoChange();
        // if(me.selectedFiltro.key == 2)me.profesorChange();
      },
      error: error => {
        const mensaje = error.error.message;
        const mensaje2 = error.error.message.error;
        if(mensaje2 && typeof mensaje2 == 'string'){
          me.showErrorToast(mensaje2)
        }else{
          me.showErrorToast(mensaje)
        }
        me.loading = false;
      },
      complete: () => me.loading = false
    })
  }

  async validarHorarioProfesor(_id: string, idCurso:string, modulo: number, dia:EDia){
    const me = this;
    return await new Promise((resolve, reject) => {
      me.dataService.validarHorarioProfesor(_id, idCurso, modulo, dia).subscribe({
        next: value => {
          console.log('Profesor agregado: ', value)
          resolve(false);
        },
        error: error => {
          const mensaje = error.error.message;
          const mensaje2 = error.error.message.error;
          if(mensaje2 && typeof mensaje2 == 'string'){
            me.showErrorToast(mensaje2)
          }else{
            me.showErrorToast(mensaje)
          }
          console.log('id: ', _id)
          console.log('idCurso: ', idCurso)
          console.log('modulo: ', modulo)

          me.loading = false;
          resolve(true);
        },
        complete: () => me.loading = false
      })
    })

  }

  async validarHorarioCurso(_id: string, dia:EDia, modulo: number){
    const me = this;
    return await new Promise((resolve, reject) => {
      me.dataService.validarHorarioCurso(_id, dia, modulo).subscribe({
        next: value => {
          console.log('Profesor agregado: ', value)
          resolve(false);
        },
        error: error => {
          const mensaje = error.error.message;
          const mensaje2 = error.error.message.error;
          if(mensaje2 && typeof mensaje2 == 'string'){
            me.showErrorToast(mensaje2)
          }else{
            me.showErrorToast(mensaje)
          }
          me.loading = false;
          resolve(true);
        },
        complete: () => me.loading = false
      })
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
// return;
    me.loading = true;
    me.dataService.editarHorario(dto).subscribe({
      next: value => {
        me.displayChange.emit(true);
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
    if(!this.selectedCurso){
      this.showErrorToast('Debe seleccionar un curso')
      validado = false;
    }
    if(!this.selectedMateria){
      this.showErrorToast('Debe seleccionar una materia')
      validado = false;
    }
    if(!this.selectedModulo){
      this.showErrorToast('Debe seleccionar un módulo')
      validado = false;
    }
    if(!this.selectedDia){
      this.showErrorToast('Debe seleccionar un día')
      validado = false;
    }
    if(this.profesoresAgregados.length == 0){
      this.showErrorToast('Debe agregar al menos un profesor')
      validado = false;
    }
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

  eliminarHorario(){
    const me = this;
    me.loading = true;
    me.dataService.deleteHorario(me._id || '').subscribe( {
      next: value => {
        if(value.deletedCount == 1){
          me.display = false;
          me.displayChange.emit(true);
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
      severity: 'success',
      summary: 'Exito!',
      detail: message,
    });
  }

  errorAutenticacion(error: any){
    if(error.error.statusCode == 401) this.route.navigate(['/login'])
  }
}
