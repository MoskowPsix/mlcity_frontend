import { TestBed } from '@angular/core/testing';

import { MobileVersionService } from './mobile-version.service';

describe('MobileVersionService', () => {
  let service: MobileVersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileVersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
