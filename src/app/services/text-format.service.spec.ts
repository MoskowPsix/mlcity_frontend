import { TestBed } from '@angular/core/testing';

import { TextFormatService } from './text-format.service';

describe('TextFormatService', () => {
  let service: TextFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
