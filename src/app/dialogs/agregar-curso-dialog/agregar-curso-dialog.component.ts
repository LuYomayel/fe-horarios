import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CreateCursoDto, CreateProfesoreDto, ETurno } from '../../interfaces/horarios';
import { HorariosService } from '../../services/horarios.service';

export interface IDialogCursoData{
  _id?: string;
  anio: number;
  division: number;
  turno: ETurno[];
  notas?: string;
}

@Component({
  selector: 'app-agregar-curso-dialog',
  templateUrl: './agregar-curso-dialog.component.html',
  styleUrls: ['./agregar-curso-dialog.component.scss']
})
export class AgregarCursoDialogComponent {
  @Input() display: boolean = false;
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter();

  loading: boolean = false;

  titulo: string = 'Agregar Curso';

  dtoCurso: IDialogCursoData ={
    anio: 0,
    division: 0,
    turno: [ETurno.mañana],
  };

  turnos: ETurno[] = [ETurno.mañana, ETurno.tarde]
  selectedTurno: ETurno = ETurno.mañana;
  constructor(
    private messageService: MessageService,
    private dataService: HorariosService
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.display = false;
    this.displayChange.emit(false);
  }

  showDialog(curso: (IDialogCursoData | undefined) ){
    this.display = true;
    this.titulo = 'Agregar Curso';
    this.dtoCurso = { anio: 0, division: 0, turno: [ETurno.mañana]};
    this.selectedTurno = ETurno.mañana;
    if(curso) {
      this.dtoCurso = curso;
      this.selectedTurno = curso.turno[0];
      this.titulo = 'Editar curso'
    }
  }


  agregarCurso(){
    const me = this;
    if(this.dtoCurso.anio != 0 && me.dtoCurso.division != 0 && me.selectedTurno){
      if(this.titulo == 'Agregar Curso'){
        me.dtoCurso.turno = [me.selectedTurno];
        me.loading = true;
        me.dataService.agregarCurso(me.dtoCurso).subscribe({
          next: value => {
            this.displayChange.emit(true);
          },
          error: error => {
            console.log('Error: ', error)
            me.showErrorToast(error.error.message)
            me.loading = false;
          },
          complete: () => {
            me.showSuccessToast('Curso agregado correctamente.');
            me.loading = false;

          }
        })
      }else{
        const { _id, ...body } = me.dtoCurso;
        if(!_id) return me.showErrorToast('Id invalido.');
        body.turno = [me.selectedTurno];
        me.loading = true;
        me.dataService.editarCurso((_id), body).subscribe({
          next: value => {
            this.displayChange.emit(true);
          },
          error: error => {
            console.log('Error: ', error)
            me.showErrorToast(error.error.message)
            me.loading = false;
          },
          complete: () => {
            me.showSuccessToast('Curso modificado correctamente.');
            me.loading = false;

          }
        })
      }

      me.display = false;
    }else{
      me.showErrorToast('Se deben completar todos los campos.')
    }
  }

  esDniValido(dni:string) {
    // La expresión regular verifica que el DNI tenga entre 1 y 8 dígito
    const dniRegex = /^\d{10,11}$/;

    // Si el DNI cumple con la expresión regular, es válido
    return dniRegex.test(dni);
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
}
