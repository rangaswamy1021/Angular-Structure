import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IViolationPaymentrequest } from "../../../payment/models/violationpaymentrequest";

@Injectable()
export class PaymentContextService {

    violationPaymentrequest: IViolationPaymentrequest;
    private contextSource = new BehaviorSubject<IViolationPaymentrequest>(this.violationPaymentrequest);
    currentContext = this.contextSource.asObservable();
    constructor() { }
    changeResponse(context: IViolationPaymentrequest) {
        this.contextSource.next(context)
    }
}