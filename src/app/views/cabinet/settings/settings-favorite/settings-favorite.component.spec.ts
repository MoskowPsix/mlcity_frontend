import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { IonicModule } from '@ionic/angular'

import { SettingsFavoriteComponent } from './settings-favorite.component'

describe('SettingsFavoriteComponent', () => {
  let component: SettingsFavoriteComponent
  let fixture: ComponentFixture<SettingsFavoriteComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsFavoriteComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents()

    fixture = TestBed.createComponent(SettingsFavoriteComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
