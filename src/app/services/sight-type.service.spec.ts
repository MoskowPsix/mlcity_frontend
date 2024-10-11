import { TestBed } from '@angular/core/testing'

import { SightTypeService } from './sight-type.service'

describe('SightTypeService', () => {
  let service: SightTypeService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(SightTypeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
