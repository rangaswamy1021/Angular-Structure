import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';

@Injectable()
export class CreateAccountService {

  makePaymentRequest: IMakePaymentrequest;
  private contextSource = new BehaviorSubject<IMakePaymentrequest>(this.makePaymentRequest);
  currentContext=this.contextSource.asObservable();
  constructor() { }
  changeResponse(context: IMakePaymentrequest) {
    this.contextSource.next(context)
  }
}