import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { quizDeactivateGuard } from './quiz-deactivate.guard';

describe('quizDeactivateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => quizDeactivateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
