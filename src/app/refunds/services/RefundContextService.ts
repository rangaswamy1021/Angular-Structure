import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IRefundProcess } from '../models/RefundProcess';

@Injectable()
export class RefundContextService {

    setRefund(iRefundProcessList: IRefundProcess[]) {
        sessionStorage.setItem('refundData', JSON.stringify(iRefundProcessList));
    }

    getRefund(): IRefundProcess[] {
        let iRefundProcessList: IRefundProcess[] = <IRefundProcess[]>[];
        if (sessionStorage.getItem('refundData')) {
            iRefundProcessList = JSON.parse(sessionStorage.getItem('refundData'));
        }
        return iRefundProcessList;
    }

    removeRefund() {
        sessionStorage.removeItem('refundData');
    }

}