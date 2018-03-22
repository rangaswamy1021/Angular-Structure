import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IPaymentResponse } from "../../payment/models/paymentresponse";

@Injectable()
export class PaymentResponseService {

    paymentResponse: IPaymentResponse;
    private contextSource = new BehaviorSubject<IPaymentResponse>(this.paymentResponse);
    currentContext = this.contextSource.asObservable();
    constructor() { }
    changeResponse(context: IPaymentResponse) {
        this.contextSource.next(context)
    }
}