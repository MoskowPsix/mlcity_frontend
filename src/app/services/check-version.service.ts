import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ToastService } from './toast.service';
import {
  ActionPerformed,
  LocalNotifications,
} from '@capacitor/local-notifications'
import { privateDecrypt } from 'crypto';
import { MobileNotificationService } from './mobile-notification.service';
import { MessagesUpdate } from '../enums/messages-update';
import { StoreUrls } from '../enums/store-urls';
import { StoreInfo } from '../models/store-info';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MobileVersionService } from './mobile-version.service';


@Injectable({
  providedIn: 'root',
})
export class CheckVersionService {
  constructor(
    private toastService: ToastService,
    private mobileNotificationService: MobileNotificationService,
    private mobileVersionService: MobileVersionService
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

  async showNotificationAboutVersion() {
    await LocalNotifications.requestPermissions()
    this.mobileNotificationService.sendBasicNotification(
      'Ваша версия приложения устарела',
      'Просим вас обновить приложения что бы не упустить важные исправления',
      1,
      MessagesUpdate.updateApp,
    )
  }

  async checkVersionIsDeprecated(): Promise<boolean> {
    let version: string = await this.getCurrentVersion()
    let versionActual: any
    this.mobileVersionService.getActualVersionFromServer().pipe().subscribe((res: any) => {
      versionActual = res.data[2]
    })
    if (version != versionActual && version != 'no version' && this.checkDateAfterUpdateAppMoreThenDay(versionActual.updatedAt)) {
      this.showNotificationAboutVersion()
      return true
    }

    return false
  }

  getAvalibleStores(): StoreInfo[] {
    let stores: StoreInfo[] = []

    if (Capacitor.getPlatform() == 'android') {
      stores.push({
        name: 'Google Play',
        ico: '/assets/icons/google-play.svg',
        url: StoreUrls.googleStore,
      })
      stores.push({
        name: 'Ru Store',
        ico: '/assets/icons/rustore.svg',
        url: StoreUrls.ruStore,
      })
    } else if (Capacitor.getPlatform() == 'ios') {
      stores.push({
        name: 'App Store',
        ico: '/assets/icons/app-store.svg',
        url: StoreUrls.appStpre,
      })
    }
    return stores
  }

  checkDateAfterUpdateAppMoreThenDay(vesrionUpdate: Date) {
    const oneDayInMilliseconds = 86400000
    const differenceInMilliseconds = Date.now() - vesrionUpdate.getTime()
    const differenceInDays = differenceInMilliseconds / oneDayInMilliseconds
    return differenceInDays > 1
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
