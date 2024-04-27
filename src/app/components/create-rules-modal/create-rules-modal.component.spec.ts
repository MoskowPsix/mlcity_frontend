import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { CreateRulesModalComponent } from './create-rules-modal.component'

describe('CreateRulesModalComponent', () => {
  let component: CreateRulesModalComponent
  let fixture: ComponentFixture<CreateRulesModalComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRulesModalComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(CreateRulesModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
