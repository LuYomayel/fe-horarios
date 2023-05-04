import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HorariosService } from '../../services/horarios.service';
import { Materia } from '../../interfaces/horarios';
import { AgregarMateriaDialogComponent } from '../../dialogs/agregar-materia-dialog/agregar-materia-dialog.component';

@Component({
  selector: 'app-materias',
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.scss'],
  providers: [HorariosService]
})
export class MateriasComponent implements AfterViewInit {

  // Eventos
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const tableElement = event.target as HTMLElement;
    if (!tableElement.closest('.p-datatable')) {
      this.cancelEditing();
    }
  }

  editingRowKeys: { [key: string]: boolean } = {};

  onRowDblclick(materia: Materia) {
    this.cancelEditing();
    this.editingRowKeys[materia._id] = true;
    console.log('editirg; ', this.editingRowKeys)
  }

  cancelEditing(){
    this.editingRowKeys = {};
  }

  loading: boolean = false;

  materias: Materia[] = [];
  constructor(
    private horariosService: HorariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){

  }
  ngAfterViewInit(): void {
    const me = this;
    me.agregarMateriaDialog.displayChange.subscribe(value => {
      if(value) me.cargarMaterias();
    })
  }

  ngOnInit(): void {
    const me = this;

    me.cargarMaterias();
  }

  async cargarMaterias(){
    const me = this;
    me.loading = true;
    await me.horariosService.getMaterias().subscribe({
      next: value => {
        me.materias = value;
      },
      error: error => {
        me.loading = false;
        me.showErrorToast(error.error.message);

      },
      complete: ()  => {
        me.loading = false;
      }
    })
  }

  //ABM
  @ViewChild('agregarMateriaDialog') agregarMateriaDialog!: AgregarMateriaDialogComponent;

  showagregarProfesorDialog(){
    this.agregarMateriaDialog.showDialog();
  }

  editar(id:string){
    const materia = this.materias.find(mate => mate._id == id);
    if(!materia) return;
    const { _id, ...body } = materia;
    this.loading = true;
    this.horariosService.editarMateria(id, body).subscribe({
      next: value => {

      },
      error: error => {
        console.log('Error: ', error);
        this.showErrorToast(error.error.message)
        this.loading = false;
      },
      complete: () => {

        this.showSuccessToast('Materia modificada correctamente')
        this.cargarMaterias();
      }
    })
    console.log(id)
  }

  eliminar(id:string){
    const materia = this.materias.find(mate => mate._id == id);
    if(!materia) return;
    const { _id, ...body } = materia;
    this.loading = true;
    this.horariosService.eliminarMateria(id).subscribe({
      next: value => {

      },
      error: error => {
        console.log('Error: ', error);
        this.showErrorToast(error.error.message)
        this.loading = false;
      },
      complete: () => {

        this.showSuccessToast('Materia eliminada correctamente')
        this.cargarMaterias();
      }
    })
    console.log(id)
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
  mostrarConfirmacion(id:string) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar esta materia?',
      accept: () => {
        // Acción a realizar si el usuario confirma
        this.eliminar(id);
        console.log('Usuario confirmó');
      },
      reject: () => {
        // Acción a realizar si el usuario rechaza
        console.log('Usuario rechazó');
      },
    });
  }

}
