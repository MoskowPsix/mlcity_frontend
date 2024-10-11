import { TestBed } from '@angular/core/testing';

import { CheckVersionService } from './check-version.service';

describe('CheckVersionService', () => {
  let service: CheckVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
