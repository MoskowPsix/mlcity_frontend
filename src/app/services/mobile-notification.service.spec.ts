import { TestBed } from '@angular/core/testing';

import { MobileNotificationService } from './mobile-notification.service';

describe('MobileNotificationService', () => {
  let service: MobileNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MobileNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
