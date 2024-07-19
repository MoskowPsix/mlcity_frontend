import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor() { }

  scroll(block:ElementRef, value:number, func:()=>void):void{
    func()
  }
}
