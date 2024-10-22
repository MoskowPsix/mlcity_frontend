import { TestBed } from '@angular/core/testing';

import { SightTapeService } from './sight-tape.service';

describe('SightTapeService', () => {
  let service: SightTapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SightTapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
