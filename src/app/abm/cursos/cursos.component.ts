import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AgregarProfesorDialogComponent } from '../../dialogs/agregar-profesor-dialog/agregar-profesor-dialog.component';
import { Curso, ETurno } from '../../interfaces/horarios';
import { HorariosService } from '../../services/horarios.service';
import { AgregarCursoDialogComponent } from 'src/app/dialogs/agregar-curso-dialog/agregar-curso-dialog.component';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss'],
  providers: [ HorariosService]
})
export class CursosComponent implements OnInit, AfterViewInit {

  // Eventos
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const tableElement = event.target as HTMLElement;
    if (!tableElement.closest('.p-datatable')) {
      this.cancelEditing();
    }
  }

  editingRowKeys: { [key: string]: boolean } = {};

  onRowDblclick(curso: Curso) {
    this.cancelEditing();
    this.editingRowKeys[curso._id] = true;
    console.log('editirg; ', this.editingRowKeys)
  }

  cancelEditing(){
    this.editingRowKeys = {};
  }

  loading: boolean = false;

  cursos: Curso[] = [];
  turnos: ETurno[] = [ETurno.mañana,ETurno.tarde, ETurno.noche]
  constructor(
    private horariosService: HorariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){

  }
  ngAfterViewInit(): void {
    const me= this;
    me.agregarCursoDialog.displayChange.subscribe( value => {
      if(value)me.cargarCursos();
    })
  }
  ngOnInit(): void {
    const me = this;
    me.cargarCursos();
  }

  //Inicio
  async cargarCursos(){
    const me = this;
    me.loading = true;
    me.horariosService.getCursos().subscribe({
      next: value => {
        me.cursos = value;

      },
      error: error => {
        me.loading = false;
        me.showErrorToast(error.error.message);
      },
      complete: () => {
        me.loading = false;
      }
    })

  }

  //ABM
  @ViewChild('agregarCursoDialog') agregarCursoDialog!: AgregarCursoDialogComponent;

  showagregarProfesorDialog(){
    this.agregarCursoDialog.showDialog(undefined);
  }

  editar(id:string){
    const curso = this.cursos.find(curso => curso._id == id);

    if(!curso) return;
    const { __v, ...body } = curso;

    this.agregarCursoDialog.showDialog(body);
    return;
  }

  eliminar(id:string){
    const curso = this.cursos.find(curso => curso._id == id);
    if(!curso) return;
    const { _id, ...body } = curso;
    this.loading = true;
    this.horariosService.eliminarCurso(id).subscribe({
      next: value => {

      },
      error: error => {
        console.log('Error: ', error);
        this.showErrorToast(error.error.message)
        this.loading = false;
      },
      complete: () => {

        this.showSuccessToast('Curso eliminado correctamente')
        this.cargarCursos();
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
      detail: message
    });
  }

  mostrarConfirmacion(id:string) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar este Curso?',
      accept: () => {
        // Acción a realizar si el usuario confirma
        this.eliminar(id);
      },
      reject: () => {
        // Acción a realizar si el usuario rechaza
      },
    });
  }

}
