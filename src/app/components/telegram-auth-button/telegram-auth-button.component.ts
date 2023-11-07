import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-telegram-auth-button',
  template: `<div #script >
              <ng-content></ng-content>
            </div>`,
  styleUrls: ['./telegram-auth-button.component.scss'],
})
export class TelegramAuthButtonComponent implements AfterViewInit {

  @ViewChild('script', {static: true}) script!: ElementRef;

  convertToScript() {
    const element = this.script.nativeElement;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?5';
    script.setAttribute('data-telegram-login', environment.telegramBotName);
    script.setAttribute('data-size', 'small');
    // Callback function in global scope
    script.setAttribute('data-auth-url', 'http://mlcity.ru:3443/api/social-auth/telegram/callback');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    element.parentElement.replaceChild(script, element);
    // <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="PraktZarbot" data-size="small" data-userpic="false" data-auth-url="http://mlcity.ru:3443/api/social-auth/telegram/callback" data-request-access="write"></script>
  }

  ngAfterViewInit() {
    this.convertToScript();
  }

}