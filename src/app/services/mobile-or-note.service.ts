import { HostListener, Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class MobileOrNoteService {
  constructor() {}
  public mobile: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  @HostListener('window:resize', ['$event'])
  mobileOrNote() {
    if (window.innerWidth < 900) {
      this.mobile.next(true)
    } else if (window.innerWidth > 900) {
      this.mobile.next(false)
    } else {
      this.mobile.next(false)
    }
  }
}
