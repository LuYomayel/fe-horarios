import { Component, OnInit } from '@angular/core';
import { ETipoProfesor } from '../interfaces/horarios';
import { HorariosService } from '../services/horarios.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
  providers: [HorariosService]
})
export class ReportesComponent implements OnInit {

  selectedSituacion: ETipoProfesor = ETipoProfesor.titular;
  opcionesSituacion: ETipoProfesor[] = [ETipoProfesor.titular, ETipoProfesor.provisional, ETipoProfesor.suplente, ETipoProfesor.titular_interino];
  constructor(
    protected horariosService: HorariosService
  ) { }

  ngOnInit(): void {

  }

  generarSituacionReporte() {
    const me = this;
    me.horariosService.descargarExcelTipoProfesor(me.selectedSituacion);
  }
  imprimirListadoProfesores() {
    const me = this;
    me.horariosService.descargarExcelProfesores();
  }

}
