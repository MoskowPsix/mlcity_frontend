import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SettingsNotificationComponent } from './settings-notification.component'

describe('SettingsNotificationComponent', () => {
  let component: SettingsNotificationComponent
  let fixture: ComponentFixture<SettingsNotificationComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsNotificationComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(SettingsNotificationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
