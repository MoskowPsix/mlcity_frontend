import { Injectable } from '@angular/core';
import { Location } from "@angular/common";
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history: string[] = [];
  public showBackButton: BehaviorSubject<boolean> = new BehaviorSubject(true);
 
  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event) => {
      //Скрываем кнопку назад на этих страницах
      if (this.location.path() === '/home' 
        || this.location.path() === '/events' 
        || this.location.path() === '/cabinet' 
        || this.location.path() === '/cabinet/favorites' 
        || this.location.path() === '/login'
      ){
        this.showBackButton.next(false)
      } else {
        this.showBackButton.next(true)
      }
      //Добавляем маршрут в историю  
      if (event instanceof NavigationEnd) 
        this.history.push(event.urlAfterRedirects);

    });
  }
 
  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl("/");
    }
  }
}
