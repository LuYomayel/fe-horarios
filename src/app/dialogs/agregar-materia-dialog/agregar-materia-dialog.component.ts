import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CreateMateriaDto, Materia } from '../../interfaces/horarios';
import { HorariosService } from '../../services/horarios.service';

@Component({
  selector: 'app-agregar-materia-dialog',
  templateUrl: './agregar-materia-dialog.component.html',
  styleUrls: ['./agregar-materia-dialog.component.scss']
})
export class AgregarMateriaDialogComponent {
  @Input() display: boolean = false;
  @Output() displayChange: EventEmitter<boolean> = new EventEmitter();

  loading: boolean = false;

  dtoMateria: Materia ={
    nombre: '',
    _id: ''
  };

  titulo:string = '';

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

  showDialog(materia: (Materia | undefined)){
    this.display = true;
    this.dtoMateria = {
      nombre: '',
      _id: ''
    }
    this.titulo = 'Agregar Materia'
    if(materia){
      this.dtoMateria = materia;
      this.titulo = 'Editar Materia'
    }

  }


  agregarMateria(){
    const me = this;
    if(this.dtoMateria.nombre != ''){
      me.loading = true;
      const {_id, ...body} = me.dtoMateria;
      if(this.titulo == 'Agregar Materia'){
        me.dataService.agregarMateria(body).subscribe({
          next: value => {
            this.displayChange.emit(true);
          },
          error: error => {
            console.log('Error: ', error)
            me.showErrorToast(error.error.message)
            me.loading = false;
          },
          complete: () => {
            me.showSuccessToast('Materia agregada correctamente.');
            me.loading = false;

          }
        })

      }else{

        this.dataService.editarMateria(_id, body).subscribe({
          next: value => {

          },
          error: error => {
            console.log('Error: ', error);
            this.showErrorToast(error.error.message)
            this.loading = false;
          },
          complete: () => {

            this.showSuccessToast('Materia modificada correctamente')
            this.displayChange.emit(true);
            me.loading = false;
          }
        })
      }

      me.display = false;
    }else{
      me.showErrorToast('Se deben completar todos los campos.')
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
}
