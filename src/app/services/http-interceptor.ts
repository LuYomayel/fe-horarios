import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // console.log('Interceptando')
    const token = localStorage.getItem('token'); // Aquí asumimos que el token está almacenado en el localStorage con el nombre 'token'
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
