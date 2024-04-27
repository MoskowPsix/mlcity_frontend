import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { NoPathComponent } from './no-path.component'

describe('NoPathComponent', () => {
  let component: NoPathComponent
  let fixture: ComponentFixture<NoPathComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NoPathComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(NoPathComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
