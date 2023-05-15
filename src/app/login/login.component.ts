import { Component, OnInit } from '@angular/core';
import { HorariosService } from '../services/horarios.service';
import { Router } from '@angular/router';
// import { decode } from 'jsonwebtoken';


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
    // const token = this.decodePayload(user ||'');
    if (user != null && !this.isTokenExpired(user)) {
      // Realizar acciones que requieran autenticación
      me.route.navigate(['/calendario']);
      console.log('Ya estas logueado')
    } else {
      // Manejar la situación cuando el token ha expirado
      console.log('No estas logueado')
      localStorage.clear();
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
              me.dataService.sendInicioSesionEmail(this.nombreUsuario).subscribe({
                next: result => {
                  console.log('Valor: ',result)
                }
              })
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

  decodePayload(token: string): any {
    try {
      const payloadBase64Url = token.split('.')[1];
      const payloadBase64 = payloadBase64Url.replace('-', '+').replace('_', '/');
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return payload;
    } catch (error) {
      console.log('Error al decodificar la carga útil del token: ', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    if (payload && payload.exp) {
      // El objeto 'payload' tiene una propiedad 'exp' que contiene la fecha de expiración en formato Unix timestamp (segundos desde el 1 de enero de 1970).
      // Por lo tanto, necesitamos convertir la fecha actual en un timestamp para comparar.
      const currentTime = Math.floor(Date.now() / 1000);

      // Comprobar si el token ha expirado o no
      if (payload.exp < currentTime) {
        // El token ha expirado
        return true;
      } else {
        // El token aún es válido
        return false;
      }
    } else {
      console.log('No se pudo obtener la propiedad "exp" del token.');
      return false;
    }
  }




}
