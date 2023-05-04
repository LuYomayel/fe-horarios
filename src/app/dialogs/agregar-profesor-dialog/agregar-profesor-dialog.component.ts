import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CreateProfesoreDto, Profesor } from '../../interfaces/horarios';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { HorariosService } from 'src/app/services/horarios.service';


@Component({
  selector: 'app-agregar-profesor-dialog',
  templateUrl: './agregar-profesor-dialog.component.html',
  styleUrls: ['./agregar-profesor-dialog.component.scss']
})
export class AgregarProfesorDialogComponent implements OnInit {
  @Input() display: boolean = false;
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter();

  loading: boolean = false;

  titulo:string = '';

  dtoProfesor: Profesor ={
    _id: '',
    nombre: '',
    apellido: '',
    cuil: 0,
  };

  constructor(
    private messageService: MessageService,
    private route: Router,
    private dataService: HorariosService
  ) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.display = false;
    this.displayChange.emit(this.display);
  }

  // showDialog(){
  //   this.display = true;
  // }

  showDialog(profesor: (Profesor | undefined) ){
    this.display = true;
    this.titulo = 'Agregar profesor';
    this.dtoProfesor = {
      _id: '',
      nombre: '',
      apellido: '',
      cuil: 0,
    }

    if(profesor) {
      this.dtoProfesor = profesor;
      this.titulo = 'Editar profesor'
    }
  }


  agregarProfesor(){
    const me = this;

    if(!me.esCuilValido(me.dtoProfesor.cuil.toString())){
      me.showErrorToast('Formato de dni inválido.')
      return;
    }
    if(this.dtoProfesor.apellido != '' && me.dtoProfesor.nombre != ''){
      me.loading = true;
      if(this.dtoProfesor.cuil) this.dtoProfesor.cuil = this.formatearMask(this.dtoProfesor.cuil.toString())
      if(this.titulo == 'Agregar profesor'){
        // this.dtoProfesor.cuil = this.formatearMask(this.dtoProfesor.cuil.toString())
        me.dataService.agregarProfesor(me.dtoProfesor).subscribe({
          next: value => {
            me.displayChange.emit(true);
          },
          error: error => {
            console.log('Error: ', error)
            me.showErrorToast(error.error.message)
            me.loading = false;
          },
          complete: () => {
            me.showSuccessToast('Profesor agregado correctamente.');
            me.loading = false;
          }
        })
      }else{
        const {_id, ...body} = me.dtoProfesor;

        this.dataService.editarProfesor(_id, body).subscribe({
          next: value => {
            console.log('Value: ', value)
          },
          error: error => {
            console.log('Error: ', error);

            const mensaje = error.error.message.join(', ')
            console.log('mensaje: ', mensaje);
            this.showErrorToast(mensaje)
            this.loading = false;
          },
          complete: () => {

            this.loading = false;
            this.showSuccessToast('Profesor modificado correctamente')
            me.displayChange.emit(true);
          }
        })
      }

      me.display = false;
    }else{
      me.showErrorToast('Se deben completar todos los campos.')
    }
  }

  esCuilValido(dni:string) {
    // La expresión regular verifica que el DNI tenga entre 1 y 8 dígito
    const dniRegex = /^\d{10,11}$/;
    const dniFormateado = this.formatearMask(dni).toString();
    // Si el DNI cumple con la expresión regular, es válido
    return dniRegex.test(dniFormateado);
  }

  formatearMask(cuil: string){
    return parseInt(cuil.split('-').join(''));
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
