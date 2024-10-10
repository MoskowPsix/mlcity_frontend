import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MyLocationPage } from './my-location.page';

describe('MyLocationPage', () => {
  let component: MyLocationPage;
  let fixture: ComponentFixture<MyLocationPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(MyLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
