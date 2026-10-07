import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs'
import { environment } from 'src/environments/environment'

interface MetrikaConfig {
  enabled: boolean
  id: number | null
  webvisor: boolean
  clickmap: boolean
  track_links: boolean
  accurate_track_bounce: boolean
}

@Injectable({ providedIn: 'root' })
export class YandexMetrikaService {
  private id: number | null = null
  private started = false
  private previous = ''

  constructor(private http: HttpClient, private router: Router) {}

  init() {
    const url = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/metrika`
    this.http.get<MetrikaConfig>(url).subscribe({
      next: (config) => {
        if (!config?.enabled || !config.id) return
        this.start(config)
      },
      error: () => undefined,
    })
  }

  private start(config: MetrikaConfig) {
    if (this.started) return
    this.started = true
    this.id = config.id
    this.install()
    const ym = (window as any).ym
    ym(this.id, 'init', {
      defer: true,
      clickmap: config.clickmap,
      trackLinks: config.track_links,
      accurateTrackBounce: config.accurate_track_bounce,
      webvisor: config.webvisor,
    })
    this.hit(this.router.url)
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.hit((event as NavigationEnd).urlAfterRedirects)
    })
  }

  private install() {
    const win = window as any
    win.ym = win.ym || function () {
      (win.ym.a = win.ym.a || []).push(arguments)
    }
    win.ym.l = Date.now()
    const src = 'https://mc.yandex.ru/metrika/tag.js'
    for (let i = 0; i < document.scripts.length; i++) {
      if (document.scripts[i].src === src) return
    }
    const script = document.createElement('script')
    script.async = true
    script.src = src
    document.head.appendChild(script)
  }

  private hit(path: string) {
    const ym = (window as any).ym
    if (!this.id || typeof ym !== 'function') return
    const url = `${location.origin}${path}`
    if (url === this.previous) return
    ym(this.id, 'hit', url, { title: document.title, referer: this.previous || undefined })
    this.previous = url
  }
}
