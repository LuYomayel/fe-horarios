import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent {
  title = 'fe-horarios';
  constructor(private primengConfig: PrimeNGConfig, private messageService: MessageService, private router: Router) {}
  showNavBar = true;

  showErrorToast(message: string) {
    this.messageService.add({
      key: 'bc',
      severity: 'error',
      summary: 'Error',
      detail: message,
    });
  }

  ngOnInit() {
      this.primengConfig.ripple = true;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          if(this.router.url.includes('/login') || (this.router.url == '/')){
            this.showNavBar = false;
          }else{
            this.showNavBar = true;
          }
          // this.showNavBar = !this.router.url.includes('/login') || !(this.router.url == '/');
          // console.log('url: ', (this.router.url == '/'))
        }
      });
      this.primengConfig.setTranslation({
        accept: 'Aceptar',
        reject: 'Cancelar',
        startsWith: "Empieza con",
        contains: "Contains",
        notContains: "Not contains",
        endsWith: "Ends with",
        equals: "Equals",
        notEquals: "Not equals",
        noFilter: "No Filter",
        lt: "Less than",
        lte: "Less than or equal to",
        gt: "Greater than",
        gte: "Greater than or equal to",
        is: "Is",
        isNot: "Is not",
        before: "Before",
        after: "After",
        dateIs: "Date is",
        dateIsNot: "Date is not",
        dateBefore: "Date is before",
        dateAfter: "Date is after",
        clear: "Clear",
        apply: "Apply",
        matchAll: "Match All",
        matchAny: "Match Any",
        addRule: "Add Rule",
        removeRule: "Remove Rule",
        choose: "Choose",
        upload: "Upload",
        cancel: "Cancel",
        dayNames: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
        dayNamesShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
        dayNamesMin: ["D","Lu","Ma","Mi","Ju","Vi","Sa"],
        monthNames: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
        monthNamesShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun","Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        dateFormat: "dd/mm/yy",
        firstDayOfWeek: 1,
        today: "Hoy",
        weekHeader: "Wk",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
        passwordPrompt: "Enter a password",
        emptyMessage: "No se encontraron resultados",
        emptyFilterMessage: "No se encontraron resultados"
    });
  }
}
