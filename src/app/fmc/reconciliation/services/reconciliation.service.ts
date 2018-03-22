import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IReconciliationRes } from "../models/transactionsbyaccountresponse";
import { IReconcilitionReq } from "../models/transactiosbyaccountrequest";
import { ITransactionRevenueReq } from "../models/transactionrevenuerequest";
import { ITransactionRevenueRes } from "../models/transactionrevenueresponse";
import { IFinanceByCategoryReq } from "../models/financebycategoryrequest";
import { IFinanceByCategoryRes } from "../models/financebycategoryresponse";
import { ITagDepositReq } from "../models/tagdepositrequest";
import { ITagDepositRes } from "../models/tagdepositresponse";
import { ITransactionReq } from "../models/transactionreq";
import { ITransactionRes } from "../models/transactionres";
import { IUserEvents } from "../../../shared/models/userevents";
@Injectable()
export class ReconciliationService {
    constructor(private http: HttpService) { }
    private url = 'Reconciliation/';
    getTransactionByAccountService(objFinanceReconciliation: IReconcilitionReq,userevents:IUserEvents): Observable<IReconciliationRes[]> {
        return this.http.postHttpMethod(this.url + 'GetTripVsFinanceReconciliation', JSON.stringify(objFinanceReconciliation),userevents);
    }
    getTransactionRevenueService(objFinanceReconciliation: ITransactionRevenueReq,userevents:IUserEvents): Observable<ITransactionRevenueRes[]> {
        return this.http.postHttpMethod(this.url + 'GetTrasactionRevenueReconciliation', JSON.stringify(objFinanceReconciliation),userevents);
    }
    getTRansactionRevenueDropDown(objFinanceReconciliation: ITransactionRevenueReq): Observable<ITransactionRevenueRes[]> {
        return this.http.postHttpMethod(this.url + 'GetTrasactionRevenueReconciliation', JSON.stringify(objFinanceReconciliation));
    }
    getFinanceByCategoryService(objFinanceReconciliation: IFinanceByCategoryReq,userevents:IUserEvents): Observable<IFinanceByCategoryRes[]> {
        return this.http.postHttpMethod(this.url + 'GetFinanceReconciliationByCategory', JSON.stringify(objFinanceReconciliation),userevents);
    }
   
    getTransactionService(objTollReconciliation: ITransactionReq,userevents:IUserEvents): Observable<ITransactionRes[]> {
        return this.http.postHttpMethod(this.url + 'GetTollReconciliationDetails', JSON.stringify(objTollReconciliation),userevents);
    }
    getTagVsFinanceReconciliation(objFinanceReconciliation: ITagDepositReq,userevents:IUserEvents): Observable<ITagDepositRes[]> {
        return this.http.postHttpMethod(this.url + 'GetTagVsFinanceReconciliation', JSON.stringify(objFinanceReconciliation),userevents);
    }
}