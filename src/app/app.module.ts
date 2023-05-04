import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {Table, TableModule} from 'primeng/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DropdownModule } from 'primeng/dropdown';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {ListboxModule} from 'primeng/listbox';
import {InputNumberModule} from 'primeng/inputnumber';
import {ToastModule} from 'primeng/toast';
import { LoginComponent } from './login/login.component';
import { HttpInterceptorService } from './services/http-interceptor';
import {CalendarModule} from 'primeng/calendar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { InputMaskModule } from 'primeng/inputmask';

import { HeaderComponent } from './header/header.component';
import { HorarioDialogComponent } from './dialogs/horario-dialog/horario-dialog.component';
import { SpinnerOverlayComponent } from './spinner-overlay/spinner-overlay.component';
import { AgregarProfesorDialogComponent } from './dialogs/agregar-profesor-dialog/agregar-profesor-dialog.component';
import { ProfesoresComponent } from './abm/profesores/profesores.component';
import { MateriasComponent } from './abm/materias/materias.component';
import { CursosComponent } from './abm/cursos/cursos.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AgregarCursoDialogComponent } from './dialogs/agregar-curso-dialog/agregar-curso-dialog.component';
import { AgregarMateriaDialogComponent } from './dialogs/agregar-materia-dialog/agregar-materia-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    CalendarComponent,
    LoginComponent,
    HeaderComponent,
    HorarioDialogComponent,
    SpinnerOverlayComponent,
    AgregarProfesorDialogComponent,
    ProfesoresComponent,
    MateriasComponent,
    CursosComponent,
    AgregarCursoDialogComponent,
    AgregarMateriaDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TableModule,
    AppRoutingModule,
    HttpClientModule,
    FullCalendarModule,
    DropdownModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    ListboxModule,
    InputNumberModule,
    ToastModule,
    CalendarModule,
    ProgressSpinnerModule,
    AvatarModule,
    ConfirmDialogModule,
    MenuModule,
    MenubarModule,
    InputMaskModule
  ],
  providers: [
    AppComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    MessageService,
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
