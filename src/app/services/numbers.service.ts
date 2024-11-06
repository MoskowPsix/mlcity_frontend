import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class NumbersService {
  constructor() {}

  //Эта функция позволит получить разряд в таком формате
  // 1000 - 1к 100 000 - 100к 1 000 000 - 1м
  changeDischarge(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}м`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}к`
    } else {
      return num.toString()
    }
  }
}
