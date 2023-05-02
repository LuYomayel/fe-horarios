import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarCursoDialogComponent } from './agregar-curso-dialog.component';

describe('AgregarCursoDialogComponent', () => {
  let component: AgregarCursoDialogComponent;
  let fixture: ComponentFixture<AgregarCursoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarCursoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarCursoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
