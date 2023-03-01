import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { MessagesLoading } from 'src/app/enums/messages-loading';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  private isLoading: boolean = false

  constructor(private loadingController: LoadingController) { }
  
  async showLoading(message:string = MessagesLoading.default) {
    this.isLoading = true
    return await this.loadingController.create({
      message: message,
      spinner: 'circular',
      //duration: 3000,
    }).then(loading => { 
      loading.present().then(() => {
        if (!this.isLoading) {
          loading.dismiss()
        }
      })
    })
  
  }

  async hideLoading() {
    this.isLoading = false
    //return await this.loadingController.dismiss();
    // return await this.loadingController.dismiss();
    // setTimeout(() => {
    //   return this.loadingController.dismiss().catch(() => {console.log('hideLoading err')})
    // }, 500);
  }

}