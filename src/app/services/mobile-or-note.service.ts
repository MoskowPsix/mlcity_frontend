import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Capacitor } from '@capacitor/core'

/** Ниже — full-bleed mobile; выше — оболочка «планшет» на ПК */
export const PHONE_SHELL_BREAKPOINT = 900
/** Ширина контейнера на десктопе (портретный планшет) */
export const SHELL_DEVICE_MAX_WIDTH = 768

@Injectable({
  providedIn: 'root',
})
export class MobileOrNoteService {
  /** Показывать оболочку по центру (только web + широкий экран) */
  public isPhoneShell: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  /** Мобильный layout (хедер/футер). В shell тоже true */
  public isMobileLayout: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  /** @deprecated используйте isMobileLayout */
  public mobile: BehaviorSubject<boolean> = this.isMobileLayout

  constructor() {
    this.update()
  }

  update() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 0
    const isNative = Capacitor.isNativePlatform()
    // Нативное приложение и узкий web — на весь экран; на ПК — shell
    const phoneShell = !isNative && width >= PHONE_SHELL_BREAKPOINT
    this.isPhoneShell.next(phoneShell)
    this.isMobileLayout.next(true)
  }

  mobileOrNote() {
    this.update()
  }
}
