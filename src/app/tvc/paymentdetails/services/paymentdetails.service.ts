import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import 'rxjs/add/operator/map';
import { IVioAmounts } from "../models/vioamountsresponse";
import { IInvoiceResponse } from "../../../invoices/models/invoicesresponse";
import { IPaymentHistoryDetailsRequest } from "../../../csc/customerdetails/models/PaymentHistoryDetailsRequest";
import { ISearchPaymentResponse } from '../../../csc/customerdetails/models/SearchPaymentResponse';
import { IViolationPaymentrequest } from "../../../payment/models/violationpaymentrequest";
import { IPaymentResponse } from "../../../payment/models/paymentresponse";
import { IPaymentPlanTerms } from '../models/PaymentPlanTerms';
import { IEMIDetailsRequest } from '../models/EMIDetailsRequest';
import { IPaymentPlanConfig } from '../models/PaymentPlanConfig';
import { IUserEvents } from '../../../shared/models/userevents';

@Injectable()
export class PaymentDetailService {
    private tvcPaymentUrl = 'TVCPayment/';
    constructor(private http: HttpService) { }

    GetChargesTrackerDetailsByCitationCSV(customerId: number, strCitationIds: string): Observable<IVioAmounts[]> {
        var data = { 'CustomerId': customerId, 'CitationIdCSV': strCitationIds }
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GetChargesTrackerDetailsByCitationCSV', JSON.stringify(data));
    }

    GetOutstandingInvoices(customerId: number): Observable<IInvoiceResponse[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GetOutstandingInvoices', JSON.stringify(customerId));
    }

    getPaymentHistoryDetails(requestUpdate: any, userEvents?: IUserEvents): Observable<ISearchPaymentResponse[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'getPaymentHistoryDetails', JSON.stringify(requestUpdate), userEvents);
    }

    doReversalPayment(objrequest: any, userEvents?: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'doReversalPayment', JSON.stringify(objrequest), userEvents);
    }

    makePayment(objPaymentRequest: IViolationPaymentrequest, userEvents?: IUserEvents): Observable<IPaymentResponse> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'MakePayment', objPaymentRequest, userEvents);
    }

    CalculateEMITerms(objPaymentPlanTerms: IPaymentPlanTerms): Observable<IEMIDetailsRequest[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'CalculateEMITerms', objPaymentPlanTerms);
    }

    generatePaymentReciept(objPaymentResponse: IPaymentResponse, longUserId: number, longLoginId: number): Observable<string> {
        let data = { 'objPaymnetresponse': objPaymentResponse, 'lngUserId': longUserId, 'longLoginId': longLoginId }
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GeneratePaymentReciept', JSON.stringify(data));
    }

    getEMIHeaderInfobyViolatorId(longViolatorid: number, userEvents?: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GetEMIHeaderInfobyViolatorId', JSON.stringify(longViolatorid), userEvents);
    }

    getEMIdetailsbyEMIheaderId(longEMIHeaderID: number): Observable<any[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GetEMIdetailsbyEMIheaderId', JSON.stringify(longEMIHeaderID));
    }

    updateEmiTermDueDate(objEMIDetailsRequest: any, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'UpdateEmiTermDueDate', objEMIDetailsRequest, userEvents);
    }

    updateTermDefaultCount(objEMIDetailsRequest: any, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'UpdateTermDefaultCount', objEMIDetailsRequest, userEvents);
    }

    getChequePayments(checkPayment: any): Observable<any[]> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'GetChequePayments', checkPayment)
            ;
    }

    doNSFPaymentReversal(checkAdjustments: any[], userEvents?: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.tvcPaymentUrl + 'DoNSFPaymentReversal', JSON.stringify(checkAdjustments), userEvents)
            ;
    }

    getPaymentPlanMasterData(userEvents?: IUserEvents): Observable<IPaymentPlanConfig[]> {
        return this.http.getHttpWithoutParams(this.tvcPaymentUrl + 'GetPaymentPlanMasterData', userEvents);
    }

}