// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpErrorResponse,
// } from '@angular/common/http';
// import { catchError, throwError } from 'rxjs';
// import { HorariosService } from './horarios.service'

// @Injectable()
// export class HttpInterceptorService implements HttpInterceptor {

//   constructor(private horariosService: HorariosService) {}


//   intercept(req: HttpRequest<any>, next: HttpHandler) {
//     // console.log('Interceptando')
//     const token = localStorage.getItem('token'); // Aquí asumimos que el token está almacenado en el localStorage con el nombre 'token'
//     if (token) {
//       const authReq = req.clone({
//         headers: req.headers.set('authorization', `Bearer ${token}`),
//       });
//       return next.handle(authReq).pipe(
//         catchError((error: HttpErrorResponse) => {
//           // Aquí se manejan los errores
//           if (error.status !== 401) {
//             // Verificar si el error no es de autenticación (401)
//             this.horariosService
//               .sendErrorEmail(`Error: ${JSON.stringify(error)}`)
//               .subscribe();
//           }
//           return throwError(error);
//         })
//       );
//     }
//     console.log('Req: ', req);
//     return next.handle(req).pipe(
//       catchError((error: HttpErrorResponse) => {
//         // Aquí se manejan los errores
//         if (error.status !== 401) {
//           // Verificar si el error no es de autenticación (401)
//           this.horariosService
//             .sendErrorEmail(`Error: ${JSON.stringify(error)}`)
//             .subscribe();
//         }
//         return throwError(error);
//       })
//     );
//   }

// }

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
    console.log('Req: ', req)
    return next.handle(req);
  }
}
