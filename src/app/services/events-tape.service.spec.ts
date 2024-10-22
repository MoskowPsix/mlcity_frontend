import { TestBed } from '@angular/core/testing';

import { EventsTapeService } from './events-tape.service';

describe('EventsTapeService', () => {
  let service: EventsTapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsTapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
