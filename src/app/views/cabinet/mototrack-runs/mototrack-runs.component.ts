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
import { MessagesLoading } from 'src/app/enums/messages-loading'
import { MototrackRiderRunSession, MototrackSessionLap } from 'src/app/models/mototrack-rider-run'
import { AuthService } from 'src/app/services/auth.service'
import { LoadingService } from 'src/app/services/loading.service'
import { MototrackRiderRunsService } from 'src/app/services/mototrack-rider-runs.service'
import { ToastService } from 'src/app/services/toast.service'
import { UserService } from 'src/app/services/user.service'

const RUNS_POLL_INTERVAL_MS = 3000
const DISPLAY_TIMEZONE = 'Europe/Moscow'

@Component({
  selector: 'app-mototrack-runs',
  templateUrl: './mototrack-runs.component.html',
  styleUrls: ['./mototrack-runs.component.scss'],
})
export class MototrackRunsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>()
  private pollSub?: Subscription
  private expandedSessionKeys = new Set<string>()
  private didInitExpand = false

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
    this.loadInitial()
    this.startPolling()
  }

  ngOnDestroy(): void {
    this.stopPolling()
    this.destroy$.next()
    this.destroy$.complete()
    this.loaderService.hideLoading()
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

  sessionPlaceName(session: MototrackRiderRunSession): string {
    return this.formatPlaceName(session.place_name || session.title)
  }

  sessionDateLabel(session: MototrackRiderRunSession): string {
    if (session.date) {
      const [year, month, day] = session.date.split('-').map(Number)
      if (year && month && day) {
        const formatted = new Date(year, month - 1, day).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        return formatted
      }
    }
    return session.date_label || ''
  }

  sessionStartTime(session: MototrackRiderRunSession): string {
    const start = session.laps.find((lap) => lap.type === 'start')
    return this.formatStartClock(start?.at || session.started_at)
  }

  lapsCountLabel(count: number): string {
    const abs = Math.abs(count) % 100
    const last = abs % 10
    if (abs > 10 && abs < 20) {
      return `${count} кругов`
    }
    if (last === 1) {
      return `${count} круг`
    }
    if (last >= 2 && last <= 4) {
      return `${count} круга`
    }
    return `${count} кругов`
  }

  lapLabel(lap: MototrackSessionLap): string {
    if (lap.type === 'start') {
      return 'Старт'
    }
    if (lap.lap_number) {
      return `Круг ${lap.lap_number}`
    }
    return (lap.label || 'Круг').replace(/^круг\s*/i, 'Круг ').trim()
  }

  lapTime(lap: MototrackSessionLap): string {
    if (lap.type === 'start') {
      return this.formatStartClock(lap.at)
    }
    if (lap.status === 'active' && lap.duration_ms == null) {
      return 'идёт'
    }
    if (lap.duration_ms != null) {
      return this.formatDuration(lap.duration_ms)
    }
    return this.normalizeTime(lap.time)
  }

  isBestLap(session: MototrackRiderRunSession, lap: MototrackSessionLap): boolean {
    if (lap.type === 'start' || lap.duration_ms == null) {
      return false
    }
    const best = this.bestLapMs(session)
    return best != null && lap.duration_ms === best
  }

  bestLapTime(session: MototrackRiderRunSession): string | null {
    const best = this.bestLapMs(session)
    return best == null ? null : this.formatDuration(best)
  }

  private bestLapMs(session: MototrackRiderRunSession): number | null {
    const times = session.laps
      .filter((lap) => lap.type !== 'start' && lap.duration_ms != null && lap.duration_ms > 0)
      .map((lap) => lap.duration_ms as number)
    return times.length ? Math.min(...times) : null
  }

  private formatPlaceName(name: string): string {
    return (name || '').replace(/([^\s])\(/g, '$1 (').trim()
  }

  private formatStartClock(iso: string | null | undefined): string {
    if (!iso) {
      return '—'
    }
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) {
      return this.normalizeTime(iso)
    }
    const parts = new Intl.DateTimeFormat('ru-RU', {
      timeZone: DISPLAY_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(date)
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
    return `${get('hour')}:${get('minute')}:${get('second')}`
  }

  private formatDuration(durationMs: number): string {
    const totalCentiseconds = Math.floor(Math.max(0, durationMs) / 10)
    const hundredths = totalCentiseconds % 100
    const totalSeconds = Math.floor(totalCentiseconds / 100)
    const seconds = totalSeconds % 60
    const totalMinutes = Math.floor(totalSeconds / 60)
    const minutes = totalMinutes % 60
    const hours = Math.floor(totalMinutes / 60)
    const pad = (value: number) => value.toString().padStart(2, '0')

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`
  }

  private normalizeTime(value: string | null | undefined): string {
    if (!value) {
      return '—'
    }
    const parts = value.split(':').map((part) => part.trim())
    if (parts.length === 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}.${parts[3]}`
    }
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}.${parts[2]}`
    }
    return value
  }

  private loadInitial(): void {
    this.loading = true
    this.loaderService.showLoading(MessagesLoading.chronometry)
    this.refreshUser()
      .pipe(
        switchMap(() => this.loadRuns$({ silent: false })),
        finalize(() => {
          this.loading = false
          this.loaderService.hideLoading()
        }),
        takeUntil(this.destroy$),
      )
      .subscribe()
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
        const kept = [...this.expandedSessionKeys].filter((key) => keys.has(key))
        if (!this.didInitExpand && !kept.length && this.sessions[0]) {
          kept.push(this.sessions[0].key)
          this.didInitExpand = true
        }
        this.expandedSessionKeys = new Set(kept)
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
