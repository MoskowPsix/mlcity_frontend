import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { environment } from 'src/environments/environment'
import { ToastService } from './toast.service'

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}

  private platform = Capacitor.getPlatform()

  shareNowUrl(): void {
    const url = environment.BASE_URL + this.router.url
    if (this.platform === 'android') {
      Share.share({
        url: url,
      })
    } else if (this.platform === 'ios') {
      Share.share({
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      this.toastService.showToast('Ссылка скопирована в буфер обмена', 'primary')
    }
  }
}
