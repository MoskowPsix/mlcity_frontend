import { TestBed } from '@angular/core/testing';

import { SightForSearchService } from './sight-for-search.service';

describe('SightForSearchService', () => {
  let service: SightForSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SightForSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
