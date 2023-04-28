import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProfesorDialogComponent } from './agregar-profesor-dialog.component';

describe('AgregarProfesorDialogComponent', () => {
  let component: AgregarProfesorDialogComponent;
  let fixture: ComponentFixture<AgregarProfesorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarProfesorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarProfesorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
