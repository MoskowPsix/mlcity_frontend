import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  isMobile!: boolean;

  constructor(
    private router: Router,
    private platform: Platform
  ) {}

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
  }
}
