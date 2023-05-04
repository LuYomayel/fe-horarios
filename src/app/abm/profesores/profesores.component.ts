import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Profesor } from 'src/app/interfaces/horarios';
import { HorariosService } from '../../services/horarios.service';
import { AgregarProfesorDialogComponent } from '../../dialogs/agregar-profesor-dialog/agregar-profesor-dialog.component';

@Component({
  selector: 'app-profesores',
  templateUrl: './profesores.component.html',
  styleUrls: ['./profesores.component.scss'],
  providers: [HorariosService]
})
export class ProfesoresComponent implements OnInit, AfterViewInit {

  // Eventos
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const tableElement = event.target as HTMLElement;
    if (!tableElement.closest('.p-datatable')) {
      this.cancelEditing();
    }
  }

  editingRowKeys: { [key: string]: boolean } = {};

  onRowDblclick(profesor: Profesor) {
    this.cancelEditing();
    this.editingRowKeys[profesor._id] = true;
    console.log('editirg; ', this.editingRowKeys)
  }

  cancelEditing(){
    this.editingRowKeys = {};
  }

  loading: boolean = false;

  profesores: Profesor[] = [];
  constructor(
    private horariosService: HorariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){

  }
  ngAfterViewInit(): void {
    const me = this;
    me.agregarProfesorDialog.displayChange.subscribe( value => {
      if(value)me.cargarProfesores();
    })
  }

  ngOnInit(): void {
    const me = this;
    me.cargarProfesores();
  }
  // Inicio
  async cargarProfesores(){
    const me = this;
    me.loading = true;
    await me.horariosService.getProfesores().subscribe({
      next: value => {
        me.profesores = value;

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

  // ABM
  @ViewChild('agregarProfesorDialog') agregarProfesorDialog!: AgregarProfesorDialogComponent;

  showagregarProfesorDialog(){
    this.agregarProfesorDialog.showDialog(undefined);
  }

  editarProfesor(id:string){
    const indexProfesor = this.profesores.findIndex(profe => profe._id == id);
    console.log('ID:', id, indexProfesor)
    if(indexProfesor == -1) return;
    this.editingRowKeys[id] = false;
    const { _id, ...body } = this.profesores[indexProfesor];
    let cuil = 0;
    if(body.cuil){
      cuil = parseInt(body.cuil.toString().split('-').join(''));
    }
    const profe: Profesor = {
      nombre: body.nombre,
      apellido: body.apellido,
      cuil,
      _id: id
    }
    console.log('Body: ', profe);
    this.agregarProfesorDialog.showDialog(profe);
    return;

    this.loading = true;
    this.horariosService.editarProfesor(id, body).subscribe({
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

        this.showSuccessToast('Profesor modificado correctamente')
        this.cargarProfesores();
      }
    })
    console.log(id)
  }

  eliminar(id:string){
    const profesor = this.profesores.find(curso => curso._id == id);
    if(!profesor) return;
    const { _id, ...body } = profesor;
    this.loading = true;
    this.horariosService.eliminarProfesor(id).subscribe({
      next: value => {

      },
      error: error => {
        console.log('Error: ', error);

        this.showErrorToast(error.error.message)
        this.loading = false;
      },
      complete: () => {

        this.showSuccessToast('Profesor eliminado correctamente')
        this.cargarProfesores();
      }
    })
    console.log(id)
  }

  // Mensajes
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
      message: '¿Estás seguro de que deseas eliminar este profesor?',
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
