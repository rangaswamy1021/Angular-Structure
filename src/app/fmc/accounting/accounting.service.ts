// import { HttpService } from './../../shared/services/http.service';
// import { Injectable } from '@angular/core';
// import { ITrailBalanceRequest } from "./models/trialBalanceRequest";
// import { IGeneralJournalRequest } from "./models/generalJournalRequest";
// import { Observable } from "rxjs/Observable";
// import { IGeneralJournalResponse } from "./models/generalJournalResponse";
// import { ITrailBalanceResponse } from "./models/trialbalanceresponse";
// import { IGetJournalLineItemsResponse } from "./models/generalJournalLineItemsResponse";
// import { IGetJournalLineItemsRequest } from "./models/generalJournalLineItemsRequest";


// @Injectable()
// export class AccountingService {
//     constructor(private http: HttpService) { }
//     private accountingUrl = 'Accounting/';
//     private myHeaders = new Headers({
//         'content-type': 'application/json',
//         'Accept': 'application/json'
//     });

//     getTrialbalance(objReqTrialBalance: ITrailBalanceRequest): Observable<ITrailBalanceResponse[]> {
//         return this.http.postHttpMethod(this.accountingUrl + 'GetTrialbalance', JSON.stringify(objReqTrialBalance)) ;
//     }
//     searchGeneralJournalEntries(objReqGeneralJournal: IGeneralJournalRequest): Observable<IGeneralJournalResponse[]> {
//         return this.http.postHttpMethod(this.accountingUrl + 'SearchGeneralJournalEntries', JSON.stringify(objReqGeneralJournal)) ;
//     }
//     popUpDataOfSelectedJournalId(objReqGeneralJournal: IGetJournalLineItemsRequest): Observable<IGetJournalLineItemsResponse[]> {
//         return this.http.postHttpMethod(this.accountingUrl + 'GetJournalLineItems', JSON.stringify(objReqGeneralJournal)) ;
//     }
//     getChartOfAccountsDropDown(): Observable<any[]> {
//         return this.http.getHttpWithoutParams(this.accountingUrl + 'GetChartOfAccounts') ;
//     }
// }