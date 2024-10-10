import { TestBed } from '@angular/core/testing';

import { UserPointService } from './user-point.service';

describe('UserPointService', () => {
  let service: UserPointService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
