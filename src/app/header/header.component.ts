import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HorariosService } from '../services/horarios.service';
import { MenuItem  } from 'primeng/api';
import { Menu } from 'primeng/menu';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [ HorariosService ]
})
export class HeaderComponent {

  items: MenuItem[] = [
    {
      label: 'Horarios',
      routerLink: 'calendario'
    },
    {
      label: `ABM's`,
      items: [
        {
          label: 'Profesores',
          routerLink: 'profesores'
        },
        {
          label: 'Materias',
          routerLink: 'materias'
        },
        {
          label: 'Cursos',
          routerLink: 'cursos'
        }
      ]
    },
    {
      label: 'Reportes'
    }
  ]

  constructor(
    private horariosService: HorariosService,
    private route: Router
  ){

  }

  cerrarSesion(){
    localStorage.clear();
    this.route.navigate(['/login']);
  }
}
