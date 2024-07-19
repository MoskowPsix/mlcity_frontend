import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications'

@Injectable({
  providedIn: 'root'
})
export class MobileNotificationService {

  constructor() {
    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'UPDATE_APP',
          actions: [
            {
              id: 'UPDATE_APP_ACCEPT',
              title: 'Обновить приложение',
            },
          ],
        },
      ],
    })
   }

  checkPermission() {
    LocalNotifications.requestPermissions()
  }

  sendBasicNotification(title: string, body: string, id: number, actionTypeId: string) {
    this.checkPermission()
    LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: id,
          actionTypeId: actionTypeId,
        },
      ],
    })
  }
}