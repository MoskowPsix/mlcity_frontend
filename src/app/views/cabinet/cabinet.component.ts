import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cabinet',
  templateUrl: './cabinet.component.html',
  styleUrls: ['./cabinet.component.scss'],
})
export class CabinetComponent implements OnInit {
  user: any
  
  constructor(private userService: UserService) { }

  ngOnInit() {
    this.user = this.userService.getUser()
  }

}
