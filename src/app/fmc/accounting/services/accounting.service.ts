import { HttpService } from "./../../../shared/services/http.service";
import { Injectable } from "@angular/core";

import { ITrailBalanceRequest } from "./../models/trialBalanceRequest";
import { ITrailBalanceResponse } from "./../models/trialBalanceResponse";
import { IGeneralLedgerRequest } from "./../models/generalledgerrequest";
import { IGeneralLedgerResponse } from "./../models/generalledgerresponse";
import { IGeneralJournalRequest } from "./../models/generaljournalrequest";
import { IGeneralJournalResponse } from "./../models/generaljournalresponse";
import { IGetJournalLineItemsRequest } from "./../models/generaljournallineitemssrequest";
import { IGetJournalLineItemsResponse } from "./../models/generaljournallineitemsresponse";

import { IGLAccountRequest } from "../models/glaccountrequest";
import { ISpecialJournalRequest } from "../models/specialjournalrequest";
import { IGLAccountResponse } from "../models/glaccountresponse";
import { ISpecialJournalResponse } from "../models/specialjournalresponse";
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { IJournalTypeResponse } from "../models/journaltyperesponse";

import { IManualGLtransactionRequest } from "../models/manualgltransactionrequest";
import { IManualGLtransactionResponse } from "../models/manualgltransactionresponse";
import { IManualJournalEntriesRequest } from "../models/manualjournalentriesrequest";
import { IcloseFiscalyearRequest } from "../models/closefiscalyearrequest";
import { ICloseFiscalYearResponse } from "../models/closefiscalyearresponse";
import { Observable } from "rxjs/Observable";
import { IchartofAccountRequest } from "../models/chartofaccountrequest";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class AccountingService {
    constructor(private http: HttpService) { }
    private searchUrl = 'Accounting/';
    private myHeaders = new Headers({
        'content-type': 'application/json',
        'Accept': 'application/json'
    });

    getTrialbalance(objReqTrialBalance: ITrailBalanceRequest,userevents:IUserEvents): Observable<ITrailBalanceResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetTrialbalance', JSON.stringify(objReqTrialBalance),userevents);
    }
    getGeneralLedgerDetails(objGeneralLedger: IGeneralLedgerRequest, userEvents: IUserEvents): Observable<IGeneralLedgerResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetGeneralLedger', JSON.stringify(objGeneralLedger), userEvents);
    }
    getGeneralLedgerDropDownDetails(): Observable<any[]> {
        return this.http.getHttpWithoutParams(this.searchUrl + 'GetChartOfAccounts');
    }
    searchGeneralJournalEntries(objReqGeneralJournal: IGeneralJournalRequest, userEvents: IUserEvents): Observable<IGeneralJournalResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'SearchGeneralJournalEntries', JSON.stringify(objReqGeneralJournal), userEvents);
    }
    popUpDataOfSelectedJournalId(objReqGeneralJournal: IGetJournalLineItemsRequest, userEvents: IUserEvents): Observable<IGetJournalLineItemsResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetJournalLineItems', JSON.stringify(objReqGeneralJournal), userEvents);
    }
    getChartOfAccountsDropDown(): Observable<any[]> {
        return this.http.getHttpWithoutParams(this.searchUrl + 'GetChartOfAccounts');
    }
    getJournalTypeDrop(objSystemActivities: ISystemActivities,userEvents?: IUserEvents ): Observable<IJournalTypeResponse> {
        return this.http.postHttpMethod(this.searchUrl + 'GetSpecialJournal', JSON.stringify(objSystemActivities),userEvents);
    }
    getGLAccountDrop(intJournalTypeId: IGLAccountRequest): Observable<IGLAccountResponse> {
        var data = { 'intJournalTypeId': intJournalTypeId }
        return this.http.postHttpMethod(this.searchUrl + 'GetGLAccountByJournalTypeId', data);
    }
    getSpecialJournalDetails(objSpecialJournal: ISpecialJournalRequest,userEvents?: IUserEvents): Observable<ISpecialJournalResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'SpecialJournalSearch', JSON.stringify(objSpecialJournal),userEvents);
    }

    getManualGlTxns(objManualGLTransactions: IManualGLtransactionRequest): Observable<IManualGLtransactionResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'GetManualGlTxns', JSON.stringify(objManualGLTransactions));
    }
    approveManualGLTransactions(objlstManualGLTransactions: IManualGLtransactionRequest[],userEvents: IUserEvents): Observable<IManualGLtransactionResponse[]> {
        return this.http.postHttpMethod(this.searchUrl + 'ApproveManualGLTransactions', JSON.stringify(objlstManualGLTransactions), userEvents);
    }
    createManualJournalEntries(objManualGLTransactions: IManualJournalEntriesRequest, userevents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.searchUrl + 'CreateManualGLTransactions', objManualGLTransactions, userevents);
    }
    getProfitRevenueDetails(FiscalYearId: number): Observable<ICloseFiscalYearResponse[]> {
        var data = { 'FiscalYearId': FiscalYearId }
        return this.http.postHttpMethod(this.searchUrl + 'GetProfitRevenueDetails', JSON.stringify(data));
    }
    getTrialBalanceDetails(FiscalYearId: number): Observable<ICloseFiscalYearResponse[]> {
        var data = { 'FiscalYearId': FiscalYearId }
        return this.http.postHttpMethod(this.searchUrl + 'GetTrialBalanceDetails', JSON.stringify(data));
    }
    getIncomeSummaryDetails(FiscalYearId: number): Observable<ICloseFiscalYearResponse[]> {
        var data = { 'FiscalYearId': FiscalYearId }
        return this.http.postHttpMethod(this.searchUrl + 'GetIncomeSummaryDetails', JSON.stringify(data));
    }
    getBalanceSheetDetails(FiscalYearId: number): Observable<ICloseFiscalYearResponse[]> {
        var data = { 'FiscalYearId': FiscalYearId }
        return this.http.postHttpMethod(this.searchUrl + 'GetBalanceSheetDetails', JSON.stringify(data));
    }
    closeFiscalYearBalances(objCloseFiscalYear: IcloseFiscalyearRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.searchUrl + 'CloseFiscalYearBalances', JSON.stringify(objCloseFiscalYear),userEvents);
    }
    getParentChartOfAccountDropDown(objParentCOA: IchartofAccountRequest): Observable<any> {
        return this.http.postHttpMethod(this.searchUrl + 'GetParentChartofAccounts', JSON.stringify(objParentCOA));
    }
    updateChartofAccounts(objUpdateCOA: IchartofAccountRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.searchUrl + 'UpdateChartofAccounts', JSON.stringify(objUpdateCOA), userEvents);
    }
    createChartofAccounts(objCreateCOA: IchartofAccountRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.searchUrl + 'CreateChartofAccounts', JSON.stringify(objCreateCOA), userEvents);
    }
    searchChartOfAccountDetails(objSearchCOA: IchartofAccountRequest, userEvents: IUserEvents): Observable<any> {
        return this.http.postHttpMethod(this.searchUrl + 'GetChartofAccounts', JSON.stringify(objSearchCOA), userEvents);
    }
}