import { Injectable } from '@angular/core'
import { environment } from 'src/environments/environment'
import Pusher from 'pusher-js'
import { AuthService } from './auth.service'
import { UserService } from './user.service'

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private pusher: Pusher
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    // Инициализация Pusher с вашим ключом и другими параметрами
    this.pusher = new Pusher('eEPPwivu', {
      cluster: 'mt1', // Ваш кластер
      wsHost: 'localhost', // Ваш хост
      wsPort: 6001, // Ваш порт
      forceTLS: false, // Использование HTTP вместо HTTPS
      disableStats: true, // Отключение сбора статистики
      enabledTransports: ['ws', 'wss'], // Разрешение только WebSocket
    })
  }

  subscribeToChannel(channelName: string) {
    return this.pusher.subscribe(channelName)
  }

  // Метод для привязки события к каналу
  bindEvent(channelName: string, eventName: string, callback: (data: any) => void) {
    const channel = this.subscribeToChannel(channelName)
    channel.bind(eventName, callback)
  }

  // Метод для отписки от канала
  unsubscribeFromChannel(channelName: string) {
    this.pusher.unsubscribe(channelName)
  }

  // Отключение от Pusher
  disconnect() {
    this.pusher.disconnect()
  }

  initWS() {
    // Подписка на события для вошедших пользователей
    if (this.authService.authenticationState) {
      this.bindEvent(
        `App.Models.User.${this.userService.user.value?.id}`,
        'App\\Events\\Statuses\\ChangeStatusForAuthor',
        (data) => {
          console.log('Received event data:', data)
        },
      )
    }
    // Подписка на события для всех пользователей
    this.bindEvent(`All`, 'App\\Events\\Statuses\\ChangeStatusForAuthor', (data) => {
      console.log('Received event data:', data)
    })
  }
}
