import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HorariosService } from '../services/horarios.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [ HorariosService ]
})
export class HeaderComponent {
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
