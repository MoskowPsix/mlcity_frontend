import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading: boolean = false

  constructor(private loadingController: LoadingController) { }

  async showLoading() {
    this.isLoading = true
    return await this.loadingController.create({
      message: 'Загрузка данных...',
      spinner: 'circular',
      //duration: 3000,
    }).then(loading => { loading.present()} ); 
  }

  async hideLoading() {
    this.isLoading = false;
    return await this.loadingController.dismiss();
  }
}
