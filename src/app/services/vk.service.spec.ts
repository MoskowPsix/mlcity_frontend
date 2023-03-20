import { TestBed } from '@angular/core/testing';

import { VkService } from './vk.service';

describe('VkService', () => {
  let service: VkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
