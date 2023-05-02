import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CreateMateriaDto } from '../../interfaces/horarios';
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

  dtoMateria: CreateMateriaDto ={
    nombre: ''
  };


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

  showDialog(){
    this.display = true;
  }


  agregarMateria(){
    const me = this;
    if(this.dtoMateria.nombre != ''){
      me.loading = true;
      me.dataService.agregarMateria(me.dtoMateria).subscribe({
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
