import { TestBed } from '@angular/core/testing';

import { EventsForSearchTapeService } from './events-for-search-tape.service';

describe('EventsForSearchTapeService', () => {
  let service: EventsForSearchTapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsForSearchTapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
