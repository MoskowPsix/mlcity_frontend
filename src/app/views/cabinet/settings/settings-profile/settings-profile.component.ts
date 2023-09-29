import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings-profile',
  templateUrl: './settings-profile.component.html',
  styleUrls: ['./settings-profile.component.scss'],
})
export class SettingsProfileComponent  implements OnInit {
  subscription_2!: Subscription
  user: any
  constructor(private userService: UserService) { }

  getUser(){
    this.subscription_2 =  this.userService.getUser().subscribe((user) => {
      this.user = user
    })
  }

  ngOnInit() {
    this.getUser()
  }

}
