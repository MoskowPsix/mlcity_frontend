import { TestBed } from '@angular/core/testing';

import { SearchFirstySeanceService } from './search-firsty-seance.service';

describe('SearchFirstySeanceService', () => {
  let service: SearchFirstySeanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchFirstySeanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
