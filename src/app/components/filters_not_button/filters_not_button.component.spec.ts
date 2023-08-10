import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FiltersNotButtonComponent } from './filters_not_button.component';

describe('FiltersNotButtonComponent', () => {
  let component: FiltersNotButtonComponent;
  let fixture: ComponentFixture<FiltersNotButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltersNotButtonComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltersNotButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});