import { IUserEvents } from './../../../shared/models/userevents';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../shared/services/http.service';
import { IActivityRequest } from "../../../shared/models/activitesrequest";
import { IActivityResponse } from "../../../shared/models/activitiesresponse";
import { IViolatorTransaction } from "../models/violationsrequest";
import { IVioAmountsResponse } from "../models/vioamountsresponse";
import { IBalancesResponse } from "../../../shared/models/balanceresponse";
import { IBalanceRequest } from '../models/balancerequest';
import { IBalanceResponse } from "../models/balancesresponse";
import { ICustomerResponse } from "../../../shared/models/customerresponse";
import { IAddressResponse } from '../../../shared/models/addressresponse';
import { ICitationInfo } from '../models/violationsresponse';
import { IInvoiceResponse } from "../../../invoices/models/invoicesresponse";
import { IPlanRequest } from '../../../sac/plans/models/plansrequest';
import { IPlanResponse } from '../../../sac/plans/models/plansresponse';


@Injectable()
export class ViolatordetailsService {

  constructor(private http: HttpService) { }
  private violatorDetailsUrl = 'ViolatorDetails/';
  private commonTypeUrl = 'Common/';
  private assignDiscounts = 'AssignDiscounts/';

  violatorTripsSearch(tripSearchRequest: any, userEvents? :IUserEvents): Observable<any[]> {
    var data = { 'objTripRequest': tripSearchRequest }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'ViolatorTripsSearch', JSON.stringify(data), userEvents);
  }
  searchActivities(activtyObject: IActivityRequest,userEvents?: IUserEvents): Observable<IActivityResponse[]> {
    var obj = JSON.stringify(activtyObject);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'ActivitiesSearch', obj,userEvents);
  }
  create(longCustomerId: number, activitiesObject: IActivityRequest,userEvents?: IUserEvents): Observable<boolean> {
    var data = { 'longCustomerId': longCustomerId, 'activitiesObject': activitiesObject }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'Create', data,userEvents);
  }
  getActivityTypes(objActivityReq: IActivityRequest): Observable<IActivityResponse[]> {
    const obj = JSON.stringify(objActivityReq);
    //console.log(obj);
    return this.http.getHttpWithParams(this.commonTypeUrl + 'GetLookUpByParentLookupTypeCode', 'lookupTypecode', obj);
  }
  creditAdjustment(vioAdjustments: any, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'CreditAdjustment', JSON.stringify(vioAdjustments), userEvents);
  }

  debitAdjustment(vioAdjustments: any, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'DebitAdjustment', JSON.stringify(vioAdjustments), userEvents);
  }

  getChargesTrackerDetailsByCitationCSV(violationDetails: any, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetChargesTrackerDetailsByCitationCSV', JSON.stringify(violationDetails), userEvents);
  }

  //convert to customer
  getViolatorBalances(longAccountId: number): Observable<IBalanceResponse> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetViolatorBalances', longAccountId);
  }

  //convert to customer
  getVioDepBalance(balanceReq: IBalanceRequest,userevents?:IUserEvents): Observable<IBalanceResponse> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetVioDepBalance', JSON.stringify(balanceReq),userevents);
  }

  //convert to customer
  getOutstandingInvoices(violatorId: number, vehicleId: number): Observable<any> {
    var data = { 'longViolatorId': violatorId, 'longVehicleId': vehicleId }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetOutstandingInvoices', data);
  }

  //convert to customer
  getActivitiesForViolator(activitySearchReq: any, userEvents? : IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'SearchActivities', JSON.stringify(activitySearchReq), userEvents);
  }
  //convert to customer
  getAccountDetailsById(accountId: number,userEvents: IUserEvents): Observable<ICustomerResponse> {
    return this.http.postHttpMethod(this.commonTypeUrl + 'GetAccountDetailsById', accountId,userEvents);
  }

  invoiceSearchForViolator(activitySearchReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'InvoiceSearchForViolator', JSON.stringify(activitySearchReq));
  }

  getTransactionsByTransctionTypeCode(activitySearchReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetTransactionsByTransctionTypeCode', JSON.stringify(activitySearchReq));
  }

  getCustomerDefaultDetails(longViolatorId: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetCustomerDefaultDetails', JSON.stringify(longViolatorId));
  }

  getViolatorBillDetails(longViolatorId: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetViolatorBillDetails', JSON.stringify(longViolatorId));
  }

  getViolationAmountDetails(longViolatorId: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetViolationAmountDetails', JSON.stringify(longViolatorId));
  }

  getPaymentPlan(longViolatorId: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetPaymentPlan', JSON.stringify(longViolatorId));
  }

  getOverPaymentBalances(accountId: string, userEvents?: IUserEvents): Observable<IBalancesResponse> {
    return this.http.getHttpWithParams(this.violatorDetailsUrl + 'GetOverPaymentBalances', 'strAccountId', accountId, userEvents);
  }

  getVioAmounts(strCitationIdCSV: string, longViolatorId: number): Observable<IVioAmountsResponse[]> {
    let obj = { 'strCitationIdCSV': strCitationIdCSV, 'longViolatorId': longViolatorId };
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetVioAmounts', JSON.stringify(obj));
  }

  overpaymentTransfer(violationDetails: IViolatorTransaction, userEvents: IUserEvents): Observable<string> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'OverpaymentTransfer', JSON.stringify(violationDetails), userEvents);
  }
  getViolationWorkflowDetails(userEvent ?:IUserEvents): Observable<ICitationInfo[]> {
    return this.http.getHttpWithoutParams(this.violatorDetailsUrl + 'GetViolationWorkflowDetails',userEvent);
  }
  getCitationDetails(citationId: string): Observable<ICitationInfo[]> {
    const objCitationId = JSON.stringify(citationId);
    return this.http.getHttpWithParams(this.violatorDetailsUrl + 'GetCitationDetails', "citationids", objCitationId);
  }
  citationSSTUpdate(violatorTransactions: IViolatorTransaction,userEvent?:IUserEvents): Observable<any> {
    var objViolatorTransactions = JSON.stringify(violatorTransactions);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'CitationSSTUpdate', objViolatorTransactions,userEvent);
  }
  getDetailsByAddressType(longCustomerId: number, addressTypes: string, userEvents? : IUserEvents): Observable<IAddressResponse> {
    var data = { 'longCustomerId': longCustomerId, 'straddressType': addressTypes }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'getAddressByType', data, userEvents);
  }
  correspondenceAndAddressUpdate(any,userEvents? : IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(any);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'correspondenceAndAddressUpdate', obj, userEvents);
  }

  getFeeDetailsBasedOnInvoiceId(invoiceId: number, userEvents? : IUserEvents): Observable<any[]> {
    var data = { 'longInvoiceId': invoiceId }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetFeeDetailsBasedOnInvoiceId', data, userEvents);
  }
  invoiceFeeAdjustments(any, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(any);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'InvoiceFeeAdjustments', obj, userEvents);
  }
  getCitationHistory(activitySearchReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetCitationDetailsHistory', JSON.stringify(activitySearchReq));
  }
  getCorrespondenceHistory(activitySearchReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetCorrespondenceHistory', JSON.stringify(activitySearchReq));
  }

  getRefundStatusByAccountId(longViolatorID: number): Observable<string> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetRefundStatusByAccountId', JSON.stringify(longViolatorID));
  }

  getTripAmounts(strCitationIdCSV: string): Observable<any[]> {
    var data = { 'strCitationIdCSV': strCitationIdCSV }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetTripAmounts', data);
  }

  getBalances(balanceRequest: IBalanceRequest, userEvents ?: IUserEvents): Observable<IBalanceResponse> {
    console.log(balanceRequest)
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetBalances', JSON.stringify(balanceRequest), userEvents);
  }

  adminHearingLiable(violatorTransaction: any, userEvents ?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'AdminHearingLiable', JSON.stringify(violatorTransaction), userEvents);
  }

  adminHearingNotLiable(violatorTransaction: any, userEvents ?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'AdminHearingNotLiable', JSON.stringify(violatorTransaction), userEvents);
  }

  invoiceOverpaymentTransfer(violationDetails: IViolatorTransaction): Observable<string> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'InvoiceOverpaymentTransfer', JSON.stringify(violationDetails));
  }

  transferViolationsToCustomer(violatorTransaction: any, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'TransferViolationsToCustomer', JSON.stringify(violatorTransaction), userEvents);
  }

  getVehicleNumbersForLinking(longCustomerId: number, strCitationIds: string): Observable<string> {
    var data = { 'longCustomerId': longCustomerId, 'strCitationIds': strCitationIds }
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetVehicleNumbersForLinking', data);
  }

  getPlan(longAccountId: IPlanRequest): Observable<IPlanResponse[]> {
    let obj = JSON.stringify(longAccountId);
    return this.http.postHttpMethod(this.assignDiscounts + 'GetPlan', obj);
  }

  bindTripStatusHistory(longcitationId: number): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'BindTripStatusHistory', JSON.stringify(longcitationId));
  }

  getImagePath(violationTrans: any): Observable<any[]> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'GetImagePath', JSON.stringify(violationTrans));
  }

  isExistsPaymentplanPromisetopay(longViolatorID: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'IsExistsPaymentplanPromisetopay', JSON.stringify(longViolatorID));
  }

  createManualHold(objreqmanualhold: any, userEvents? : IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objreqmanualhold);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'CreateManualHold', obj, userEvents);
  }

  removeManualHold(objreqmanualhold: any, userEvents? : IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objreqmanualhold);
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'RemoveManualHold', obj, userEvents);
  }

  checkManualHoldExists(longViolatorID: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'CheckManualHoldExists', JSON.stringify(longViolatorID));
  }

}
