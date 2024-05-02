import { TestBed } from '@angular/core/testing';

import { FirmsService } from './firms.service';

describe('FirmsService', () => {
  let service: FirmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
