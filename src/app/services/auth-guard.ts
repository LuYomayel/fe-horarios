import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (localStorage.getItem('token')) {

      return true;
    } else {
      // El usuario no está autenticado, redirigir a la página de inicio de sesión
      this.router.navigate(['/login']);
      return false;
    }
  }
}
