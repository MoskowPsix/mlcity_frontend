import { TestBed } from '@angular/core/testing';

import { YandexMetricService } from './yandex-metric.service';

describe('YandexMetricService', () => {
  let service: YandexMetricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YandexMetricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
