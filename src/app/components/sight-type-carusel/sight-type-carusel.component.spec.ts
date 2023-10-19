import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SightTypeCaruselComponent } from './sight-type-carusel.component';

describe('SightTypeCaruselComponent', () => {
  let component: SightTypeCaruselComponent;
  let fixture: ComponentFixture<SightTypeCaruselComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SightTypeCaruselComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SightTypeCaruselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
