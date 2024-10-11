import { TestBed } from '@angular/core/testing';

import { SwithTypeService } from './switch-type.service';

describe('SwithTypeService', () => {
  let service: SwithTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwithTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
