import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorarioDialogComponent } from './horario-dialog.component';

describe('HorarioDialogComponent', () => {
  let component: HorarioDialogComponent;
  let fixture: ComponentFixture<HorarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorarioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
