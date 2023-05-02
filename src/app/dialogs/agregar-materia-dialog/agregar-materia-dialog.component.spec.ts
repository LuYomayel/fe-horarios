import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarMateriaDialogComponent } from './agregar-materia-dialog.component';

describe('AgregarMateriaDialogComponent', () => {
  let component: AgregarMateriaDialogComponent;
  let fixture: ComponentFixture<AgregarMateriaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarMateriaDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarMateriaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
