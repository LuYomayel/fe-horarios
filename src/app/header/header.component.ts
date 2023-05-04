import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HorariosService } from '../services/horarios.service';
import { MenuItem  } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ERoles } from '../interfaces/horarios';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [ HorariosService ]
})
export class HeaderComponent implements OnInit{

  items: MenuItem[] = []

  roles: ERoles[] = [];

  constructor(
    private horariosService: HorariosService,
    private route: Router
  ){
    const me = this;
    me.roles = me.horariosService.getRolesUsuario();
  }
  ngOnInit(): void {
    this.items = [
      {
        label: 'Horarios',
        routerLink: 'calendario'
      },
      ...(this.roles.includes(ERoles.ADMIN) ? [{
        label: `Administración`,
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

      ] : [])
    ]
  }

  cerrarSesion(){
    localStorage.clear();
    this.route.navigate(['/login']);
  }
}
