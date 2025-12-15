import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportarMascota } from './reportar-mascota';

describe('ReportarMascota', () => {
  let component: ReportarMascota;
  let fixture: ComponentFixture<ReportarMascota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportarMascota]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportarMascota);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
