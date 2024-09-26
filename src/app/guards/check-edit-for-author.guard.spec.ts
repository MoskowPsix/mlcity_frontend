import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { checkEditForAuthorGuard } from './check-edit-for-author.guard';

describe('checkEditForAuthorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => checkEditForAuthorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
