import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SwitchTypeService {

  public currentType: BehaviorSubject<string> = new BehaviorSubject<string>('events')
  public link: BehaviorSubject<string> = new BehaviorSubject<string>('/events')
  constructor() { }

  changeType() {
    if (this.currentType.value == 'events') {
      this.currentType.next('sights')
      this.link.next('/sights')
    } else {
      this.currentType.next('events')
      this.link.next('/events')
    }
  }
}
