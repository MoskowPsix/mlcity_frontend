import { TestBed } from '@angular/core/testing';

import { GeneratePlugSightEventsImgService } from './generate-plug-sight-events-img.service';

describe('GeneratePlugSightEventsImgService', () => {
  let service: GeneratePlugSightEventsImgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneratePlugSightEventsImgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
