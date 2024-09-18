import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextFormatService {

  constructor() { }

  formatingText(text:string): string{
   let newText =  text.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')
    return newText
  }
}
