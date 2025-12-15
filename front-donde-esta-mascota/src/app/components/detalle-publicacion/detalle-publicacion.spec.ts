import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePublicacion } from './detalle-publicacion';

describe('DetallePublicacion', () => {
  let component: DetallePublicacion;
  let fixture: ComponentFixture<DetallePublicacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePublicacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePublicacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
