import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Curso } from 'src/app/interfaces/horarios';
import { HorariosService } from 'src/app/services/horarios.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss'],
  providers: [ MessageService, HorariosService]
})
export class CursosComponent implements OnInit {

  loading: boolean = false;

  cursos: Curso[] = [];
  constructor(
    private horariosService: HorariosService,
    private messageService: MessageService
  ){

  }
  ngOnInit(): void {
    const me = this;
    me.cargarCursos();
  }

  editar(id:string){
    const curso = this.cursos.find(curso => curso._id == id);
    if(!curso) return;
    const { _id, ...body } = curso;
    this.loading = true;
    this.horariosService.guardarNota(id, body).subscribe({
      next: value => {

      },
      error: error => {
        console.log('Error: ', error);
        this.showErrorToast(error.error.message)
        this.loading = false;
      },
      complete: () => {

        this.showSuccessToast('Curso cambiado correctamente')
        this.cargarCursos();
      }
    })
    console.log(id)
  }

  eliminar(id:string){
    console.log(id)
  }

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
