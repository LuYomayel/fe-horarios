import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { AuthGuard } from './services/auth-guard';
import { ProfesoresComponent } from './abm/profesores/profesores.component';
import { CursosComponent } from './abm/cursos/cursos.component';
import { MateriasComponent } from './abm/materias/materias.component';
const routes: Routes = [
  { path: '', component: LoginComponent},
  { path: 'login', component: LoginComponent },
  { path: 'calendario', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: 'profesores', component: ProfesoresComponent, canActivate: [AuthGuard] },
  { path: 'cursos', component: CursosComponent, canActivate: [AuthGuard] },
  { path: 'materias', component: MateriasComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
