import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {


  constructor(
    private router: Router
  ) { }

  component: string = "Profile"

  loadComponent(name: string){
    this.component = name;
  }

  ngOnInit() {}

}
