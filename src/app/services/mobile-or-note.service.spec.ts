import { TestBed } from '@angular/core/testing';

import { MobileOrNoteService } from './mobile-or-note.service';

describe('MobileOrNoteService', () => {
  let service: MobileOrNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileOrNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
