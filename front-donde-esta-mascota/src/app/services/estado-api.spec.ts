import { TestBed } from '@angular/core/testing';

import { EstadoApiService } from './estado-api';

describe('EstadoApi', () => {
  let service: EstadoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
