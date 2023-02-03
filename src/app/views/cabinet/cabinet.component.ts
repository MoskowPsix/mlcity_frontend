import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-cabinet',
  templateUrl: './cabinet.component.html',
  styleUrls: ['./cabinet.component.scss'],
})
export class CabinetComponent implements OnInit {
  // subscription_1!: Subscription 
  // subscriptions: Subscription[] = []
  // user: any
  // socialAccount: any
  
  constructor(private userService: UserService, private toastService: ToastService) { }

  ngOnInit() {
    // this.user = this.userService.getUser()

    //Грузим инфу об оккаунте соц сети
    // this.subscription_1 = this.userService.getSocialAccountByUserId(this.user.id).subscribe({
    //   next: data => {
    //     this.socialAccount = data
    //   },
    //   error: err => {
    //     this.toastService.showToast(err.error.message, 'warning')
    //   }
    // })

    //this.socialAccount = this.userService.getSocialAccountByUserId(this.user.id)

    //Добавляем подписки в массив
    // this.subscriptions.push(this.subscription_1)
  }

  ngOnDestroy() {
    // отписываемся от всех подписок
  //  this.subscriptions.forEach((subscription) => subscription.unsubscribe())
 }
}
