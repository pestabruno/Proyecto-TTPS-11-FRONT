import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoAvistamiento } from './listado-avistamiento';

describe('ListadoAvistamiento', () => {
  let component: ListadoAvistamiento;
  let fixture: ComponentFixture<ListadoAvistamiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoAvistamiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoAvistamiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
