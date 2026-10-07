import { Injectable, OnDestroy } from '@angular/core'
import { Location } from '@angular/common'
import { NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, Subject, takeUntil } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class NavigationService implements OnDestroy {
  private readonly destroy$ = new Subject<void>()
  subCount: number = 0
  private history: string[] = []
  public showBackButton: BehaviorSubject<boolean> = new BehaviorSubject(true)

  public modalAuthEmail: BehaviorSubject<boolean> = new BehaviorSubject(false)

  public modalSearchCityesOpen: BehaviorSubject<boolean> = new BehaviorSubject(false) //открытие модалки с поиском городов
  public modalSearchEventsOpen: BehaviorSubject<boolean> = new BehaviorSubject(false) //открытие модалки с поиском событий
  public modalEventRadiusShowOpen: BehaviorSubject<boolean> = new BehaviorSubject(false) //открытие модалки с ивентов или местом в радиусе карты
  public modalEventShowOpen: BehaviorSubject<boolean> = new BehaviorSubject(false) //открытие модалки с ивентов или местом - клик по метке на карте
  public modalFiltersOpen: BehaviorSubject<boolean> = new BehaviorSubject(false) //открытие модалки с фильтрами
  public appFirstLoading: BehaviorSubject<boolean> = new BehaviorSubject(true) // первый запуск приложения
  private readonly authReturnKey = 'authReturnUrl'

  constructor(
    private router: Router,
    private location: Location,
  ) {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      //Скрываем кнопку назад на этих страницах
      // if (
      //   this.location.path() === '/home' ||
      //   this.location.path() === '/events' ||
      //   this.location.path() === '/cabinet' ||
      //   this.location.path() === '/cabinet/favorites' ||
      //   this.location.path() === '/login'
      // ) {
      //   this.showBackButton.next(false)
      // } else {
      //   this.showBackButton.next(true)
      // }
      //Добавляем маршрут в историю
      if (event instanceof NavigationEnd) this.history.push(event.urlAfterRedirects)
      // скпываем модалки при переходе по маршрутам
      // this.modalSearchCityesOpen.next(false)
      // this.modalSearchEventsOpen.next(false)
      // this.modalEventShowOpen.next(false)
      // this.modalFiltersOpen.next(false)
      // this.modalEventRadiusShowOpen.next(false)
      //this.appFirstLoading.next(false)
    })
  }

  rememberAuthReturn(url: string) {
    const path = (url || '').split(/[?#]/)[0]
    if (this.isCommissionReturn(path)) sessionStorage.setItem(this.authReturnKey, path)
  }

  proceedAfterAuth(fallback: string) {
    const back = sessionStorage.getItem(this.authReturnKey)
    sessionStorage.removeItem(this.authReturnKey)
    return this.router.navigateByUrl(back && this.isCommissionReturn(back) ? back : fallback)
  }

  private isCommissionReturn(path: string) {
    return /^\/cabinet\/checkpoint\/invite\/[A-Za-z0-9]+$/.test(path) || /^\/cabinet\/events\/\d+\/commission$/.test(path)
  }

  back(): void {
    this.history.pop()
    if (this.history.length > 0) {
      this.location.back()
    } else {
      this.router.navigateByUrl('/')
    }
  }

  ionViewDidLeave() {
    console.log('died ioin')
  }

  ngOnDestroy() {
    console.log('died')
  }
}
