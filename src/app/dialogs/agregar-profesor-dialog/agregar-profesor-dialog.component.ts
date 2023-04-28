import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CreateProfesoreDto } from '../../interfaces/horarios';
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

  dtoProfesor: CreateProfesoreDto ={
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

  showDialog(){
    this.display = true;
  }


  agregarProfesor(){
    const me = this;

    if(!me.esDniValido(me.dtoProfesor.cuil.toString())){
      me.showErrorToast('Formato de dni inválido.')
      return;
    }
    if(this.dtoProfesor.apellido != '' && me.dtoProfesor.nombre != ''){
      me.loading = true;
      me.dataService.agregarProfesor(me.dtoProfesor).subscribe({
        next: value => {

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

  errorAutenticacion(error: any){
    if(error.error.statusCode == 401) this.route.navigate(['/login'])
  }

}
