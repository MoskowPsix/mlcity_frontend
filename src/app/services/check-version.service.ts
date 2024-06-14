import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ToastService } from './toast.service';
import { ActionPerformed, LocalNotifications } from '@capacitor/local-notifications'
import { privateDecrypt } from 'crypto';
import { MobileNotificationService } from './mobile-notification.service';
import { MessagesUpdate } from '../enums/messages-update';
import { StoreUrls } from '../enums/store-urls';


@Injectable({
  providedIn: 'root',
})
export class CheckVersionService {
  constructor(
    private toastService: ToastService,
    private mobileNotificationService: MobileNotificationService,
  ) {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification: ActionPerformed) => {
      this.goToUpdateApp(notification)
      },
    )
  }

  async getCurrentVersion() {
    let appInfo: string = 'no version'
    if (Capacitor.getPlatform() == 'android' || Capacitor.getPlatform() == 'ios') {
      let appInfo = await (await App.getInfo()).version
      return appInfo
    }

    return appInfo
  }

  async showNotificationAboutVersion(version: string) {
    await LocalNotifications.requestPermissions()
    this.mobileNotificationService.sendBasicNotification(
      'Ваша версия приложения устарела',
      'Просим вас обновить приложения что бы не упустить важные исправления',
      1,
      MessagesUpdate.updateApp,
    )
  }

  async checkVersionIsDeprecated() {
    let version: string = await this.getCurrentVersion()

    if (version != '1.5.6') {
      this.showNotificationAboutVersion('1.5.4')
    }
  }

  async goToUpdateApp(notification: ActionPerformed) {
    let platform = Capacitor.getPlatform()
    if (notification.actionId == MessagesUpdate.updateAppAccept) {
      if (platform == 'android') {
        window.open(StoreUrls.ruStore, '_self')
      } else if (platform == 'ios') {
        window.open(StoreUrls.appStpre, '_self')
      }
    }
    this.toastService.showToast(notification.actionId, 'primary')
  }
}
