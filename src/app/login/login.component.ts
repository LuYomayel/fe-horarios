import { Component, OnInit } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [HorariosService]
})
export class LoginComponent implements OnInit {
  contrasenia: string = '';
  nombreUsuario: string = '';

  constructor(private dataService:HorariosService, private route: Router){

  }

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
  }

  login(){
    const me = this;
    me.dataService.login(this.nombreUsuario, me.contrasenia).subscribe(result => {
      if(result.access_token){
        this.route.navigate(['/calendario'])
        localStorage.setItem('token', result.access_token);
      }
    })
  }
}
