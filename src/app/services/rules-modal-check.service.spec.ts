import { TestBed } from '@angular/core/testing'

import { RulesModalCheckService } from './rules-modal-check.service'

describe('RulesModalCheckService', () => {
  let service: RulesModalCheckService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(RulesModalCheckService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
