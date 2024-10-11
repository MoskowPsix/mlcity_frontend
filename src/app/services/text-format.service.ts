import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TextFormatService {

  constructor() { }

  formatingText(text:string): string{
   return text.replace(/\n/g, '<br>');
  }
}
