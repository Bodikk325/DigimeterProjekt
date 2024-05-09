import { TestBed } from '@angular/core/testing';

import { CountResultService } from './count-result.service';

describe('CountResultService', () => {
  let service: CountResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
