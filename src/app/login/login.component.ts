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
  contraseniaIncorrecta: boolean = false;
  constructor(private dataService:HorariosService, private route: Router){

  }

  ngOnInit(): void {
    const me = this;
    const user:(string | null) = localStorage.getItem('token');
    if(user && user !== ''){
      me.route.navigate(['/calendario']);
      console.log('Ya estas logueado')
    }
  }

  login(){
    const me = this;
    me.dataService.login(this.nombreUsuario, me.contrasenia).subscribe({
      next: result => {
        console.log('Valor: ',result)
        if(result.access_token){
              this.route.navigate(['/calendario'])
              localStorage.setItem('token', result.access_token);
        }
      },
      error: error => {
        localStorage.setItem('token', '');
        me.contraseniaIncorrecta = true;
          setTimeout( () => {
            me.contraseniaIncorrecta = false;
          }, 5000)
      },
      complete: () => console.log('Completado')
    });
  }
}
