import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  interval,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs'
import { MototrackRiderRunSession } from 'src/app/models/mototrack-rider-run'
import { AuthService } from 'src/app/services/auth.service'
import { LoadingService } from 'src/app/services/loading.service'
import { MototrackRiderRunsService } from 'src/app/services/mototrack-rider-runs.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'

const RUNS_POLL_INTERVAL_MS = 3000

@Component({
  selector: 'app-mototrack-runs',
  templateUrl: './mototrack-runs.component.html',
  styleUrls: ['./mototrack-runs.component.scss'],
})
export class MototrackRunsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private pollSub?: Subscription
  private expandedSessionKeys = new Set<string>()

  sessions: MototrackRiderRunSession[] = []
  loading = false
  savingTag = false
  rfidTagNumber = ''
  readonly rfidTagNumberControl = new FormControl('')

  constructor(
    private readonly runsService: MototrackRiderRunsService,
    private readonly userService: UserService,
    private readonly loaderService: LoadingService,
    private readonly toastService: ToastService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loading = true
    this.refreshUser()
      .pipe(
        switchMap(() => this.loadRuns$({ silent: false })),
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe()
    this.startPolling()
  }

  ngOnDestroy(): void {
    this.stopPolling()
    this.destroy$.next()
    this.destroy$.complete()
  }

  ionViewWillEnter(): void {
    this.startPolling()
  }

  ionViewWillLeave(): void {
    this.stopPolling()
  }

  handleRefresh(event: any): void {
    this.refreshUser()
      .pipe(
        switchMap(() => this.loadRuns$({ silent: false })),
        finalize(() => event?.target?.complete?.()),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  saveRfidTagNumber(): void {
    this.persistRfidTagNumber(
      this.rfidTagNumberControl.value ?? '',
      'Номер датчика сохранён',
      'Не удалось сохранить номер датчика',
    )
  }

  deleteRfidTagNumber(): void {
    this.savingTag = true
    this.loaderService.showLoading()
    this.userService
      .detachRfidTag()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingTag = false
          this.loaderService.hideLoading()
        }),
        catchError((err) => {
          if (err.status == 401 || err.status == 403) {
            this.authService.logout()
          }
          const message =
            err?.error?.errors?.rfidTagNumber?.[0] || err?.error?.message || 'Не удалось удалить датчик'
          this.toastService.showToast(message, 'danger')
          return of(EMPTY)
        }),
      )
      .subscribe((response: any) => {
        if (response?.status == 'success') {
          this.userService.setUser(response.user)
          this.patchRfidTagFromUser()
          this.toastService.showToast('Датчик удалён', 'success')
          this.loadRuns()
        }
      })
  }

  isSessionExpanded(key: string): boolean {
    return this.expandedSessionKeys.has(key)
  }

  toggleSession(key: string): void {
    const next = new Set(this.expandedSessionKeys)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    this.expandedSessionKeys = next
  }

  openSettings(): void {
    this.router.navigate(['/cabinet/settings'])
  }

  private loadRuns(): void {
    this.loading = true
    this.loadRuns$({ silent: false })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  private startPolling(): void {
    this.stopPolling()
    this.pollSub = interval(RUNS_POLL_INTERVAL_MS)
      .pipe(
        exhaustMap(() => this.loadRuns$({ silent: true })),
        takeUntil(this.destroy$),
      )
      .subscribe()
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe()
    this.pollSub = undefined
  }

  private loadRuns$(options: { silent: boolean }): Observable<unknown> {
    return this.runsService.getMyRuns().pipe(
      tap((response) => {
        this.sessions = response.sessions ?? []
        const keys = new Set(this.sessions.map((session) => session.key))
        this.expandedSessionKeys = new Set([...this.expandedSessionKeys].filter((key) => keys.has(key)))
      }),
      catchError((error) => {
        if (!options.silent) {
          this.sessions = []
          this.toastService.showToast(error?.error?.message || 'Не удалось загрузить хронометраж', 'danger')
        }
        return of(null)
      }),
    )
  }

  private persistRfidTagNumber(rfidTagNumber: string, successMessage: string, errorMessage: string): void {
    this.savingTag = true
    this.loaderService.showLoading()
    this.userService
      .updateRfidTag(rfidTagNumber)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.savingTag = false
          this.loaderService.hideLoading()
        }),
        catchError((err) => {
          if (err.status == 401 || err.status == 403) {
            this.authService.logout()
          }
          const message =
            err?.error?.errors?.rfidTagNumber?.[0] || err?.error?.message || errorMessage
          this.toastService.showToast(message, 'danger')
          return of(EMPTY)
        }),
      )
      .subscribe((response: any) => {
        if (response?.status == 'success') {
          this.userService.setUser(response.user)
          this.patchRfidTagFromUser()
          this.toastService.showToast(successMessage, 'success')
          this.loadRuns()
        }
      })
  }

  private refreshUser(): Observable<unknown> {
    return this.userService.getUserById().pipe(
      tap((res: any) => {
        if (res?.user) {
          this.userService.setUser(res.user)
        }
        this.patchRfidTagFromUser()
      }),
      catchError((err) => {
        if (err.status == 401 || err.status == 403) {
          this.authService.logout()
        }
        this.patchRfidTagFromUser()
        return of(null)
      }),
    )
  }

  private patchRfidTagFromUser(): void {
    const user = this.userService.getUserFromLocalStorage()
    this.rfidTagNumber = (user?.rfid_tag_number ?? '').trim()
    this.rfidTagNumberControl.setValue(this.rfidTagNumber)
  }
}
