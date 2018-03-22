import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencycustom'
})
export class CurrencycustomPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) { }
  boolNegative: boolean;
  transform(value: any, args?: any): any {
    const currencyCode = 'USD';
    const showSymbol = true;
    if (value < 0)
      this.boolNegative = true;
    else
      this.boolNegative = false;
    value = this.currencyPipe.transform(value, currencyCode, showSymbol);
    if (this.boolNegative) {
      value = value.replace('-', '(') + ')';
    }
    return value;
  }
}
