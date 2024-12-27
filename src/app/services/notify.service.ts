import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Subject, takeUntil } from 'rxjs'
import { environment } from 'src/environments/environment'
import { UserService } from './user.service'

@Injectable({
  providedIn: 'root',
})
export class NotifyService {
  private readonly destroy$ = new Subject<void>()
  private eventSource!: EventSource
  private eventSourceAll!: EventSource
  private eventSubject: BehaviorSubject<any> = new BehaviorSubject<any>('')
  private eventSubjectAll: BehaviorSubject<any> = new BehaviorSubject<any>('')

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  initSSE() {
    const user = this.userService.getUserFromLocalStorage()
    if (user?.id) {
      this.connectChanelUser(user?.id)
    }
    this.connectChanelAll()
  }
  public connectChanelUser(id: number): Subject<any> {
    this.eventSource = new EventSource(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/notify/chanel/user/${id}`,
    )

    this.eventSource.onmessage = (event: any) => {
      const data = JSON.parse(event.data)
      if (data?.length) {
        this.eventSubject.next(data)
        data.forEach((notify: any) => {
          this.viewNotify(notify.id).pipe(takeUntil(this.destroy$)).subscribe()
          console.log(notify)
        })
      }
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      this.eventSource.close()
    }

    return this.eventSubject
  }

  public connectChanelAll(): Subject<any> {
    this.eventSourceAll = new EventSource(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/notify/chanel/all`,
    )

    this.eventSourceAll.onmessage = (event: any) => {
      const data = JSON.parse(event.data)

      if (data?.length) {
        this.eventSubjectAll.next(data)
        console.log(event)
      }
    }

    this.eventSourceAll.onerror = (error) => {
      console.error('SSE error:', error)
      this.eventSourceAll.close()
    }

    return this.eventSubjectAll
  }

  viewNotify(id: Number) {
    return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/notify/view/${id}`)
  }

  ngOnDestroy() {
    if (this.eventSource) {
      this.eventSource.close()
    }
    if (this.eventSourceAll) {
      this.eventSourceAll.close()
    }
    this.destroy$.next()
    this.destroy$.complete()
  }
}
