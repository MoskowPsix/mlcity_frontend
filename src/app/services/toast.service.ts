import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async showToast(message: string, type: string) {

    const toast = await this.toastController.create({
      message: message,
      duration: 10000,
      color: type, //"primary", "secondary", "tertiary", "success", "warning", "danger", "light", "medium", and "dark"
      position: 'top',
      buttons: [
        {
          text: 'Х',
          role: 'cancel'
        }
      ],
    });

    await toast.present();
    
  }
}
