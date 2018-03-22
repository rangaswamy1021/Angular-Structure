import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IInvoiceSearchRequest } from '../models/invoicesearchrequest';
import { IInvoiceSearchResponse } from '../models/invoicesearchresponse';
import { HttpService } from '../../shared/services/http.service';
import { IInvoiceRequest } from '../models/invoicesrequest';
import { IInvoiceResponse } from '../models/invoicesresponse';
import { IProfileResponse } from "../../csc/search/models/ProfileResponse";
import { IUserEvents } from "../../shared/models/userevents";

@Injectable()
export class InvoiceService {
  constructor(private http: HttpService) { }
  private invoiceUrl = 'Invoice/';
  private violatorDetailsUrl = '/ViolatorDetails/';
  invoiceSearch(objSearchRequest: IInvoiceSearchRequest, userEvents?: IUserEvents): Observable<IInvoiceSearchResponse[]> {
    const obj = JSON.stringify(objSearchRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'InvoiceSearch', obj, userEvents)
      ;
  }
  viewInvoiceDetails(objInvoiceRequest: IInvoiceRequest, userEvents: IUserEvents): Observable<IInvoiceResponse> {
    const obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceDetailsByInvoiceId', obj, userEvents)
      ;
  }
  currentOrLastInvoiceDetails(objInvoiceRequest: IInvoiceRequest): Observable<IInvoiceResponse> {
    const obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceDetailsByCustomerId', obj)
      ;
  }
  getCustomerDefaultDetails(longCustomerId: number, userEvents?: IUserEvents): Observable<IProfileResponse> {
    return this.http.postHttpMethod(this.invoiceUrl + 'GetCustomerDefaultDetails', JSON.stringify(longCustomerId), userEvents)
      ;
  }

  previousInvoiceDetails(objInvoiceRequest: IInvoiceRequest, userEvents: IUserEvents): Observable<IInvoiceResponse[]> {
    const obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetPreviousInvoiceDetailsByCustomerId', obj, userEvents)
      ;
  }
  getVirtualPath(): Observable<string> {
    return this.http.postHttpMethod(this.invoiceUrl + 'GetVirtualPath', null)
      ;
  }

  invoiceSearchForViolator(objSearchRequest: IInvoiceSearchRequest, userevents: IUserEvents): Observable<IInvoiceSearchResponse[]> {
    const obj = JSON.stringify(objSearchRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'InvoiceSearchForViolator', obj, userevents)
      ;
  }
  getInvoiceHistory(longAccountId: number): Observable<IInvoiceResponse[]> {
    let obj = JSON.stringify(longAccountId);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceHistoryBasedOnInvoiceId', longAccountId);
  }

  getRecentTransactions(objInvoiceRequest: IInvoiceRequest): Observable<any[]> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetUnbilledTransactionsBasedOnInvoiceId', obj);
  }
  getInvoiceBatchDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceDetailsByBatchId', obj);
  }
  getPaymentDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetPaymentCustDetails', obj);
  }
  getFeeDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceFeeDetails', obj);
  }
  getTripDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetTripDetails', obj);
  }
  getInvoiceDuedateExtensionDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetInvoiceDueDateDetails', obj);
  }
  updateInvoiceDueDate(objInvoiceRequest: IInvoiceRequest, userEvents?: IUserEvents): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'UpdateInvoiceDueDate', obj, userEvents);
  }
  checkManualHoldExists(longViolatorID: number): Observable<any> {
    return this.http.postHttpMethod(this.violatorDetailsUrl + 'CheckManualHoldExists', JSON.stringify(longViolatorID));
  }

  createInvoiceHold(invoiceHoldReq: any): Observable<any> {
    return this.http.postHttpMethod(this.invoiceUrl + 'CreateInvoiceHold', JSON.stringify(invoiceHoldReq));
  }

  checkInvoiceHoldExists(longInvoiceID: number): Observable<any> {
    return this.http.postHttpMethod(this.invoiceUrl + 'CheckInvoiceHoldExists', JSON.stringify(longInvoiceID));
  }

  removeInvoiceHold(invoiceRemoveReq: any): Observable<any> {
    return this.http.postHttpMethod(this.invoiceUrl + 'RemoveInvoiceHold', JSON.stringify(invoiceRemoveReq));
  }

  dismissInvoices(invoiceRemoveReq: any): Observable<any> {
    return this.http.postHttpMethod(this.invoiceUrl + 'DismissInvoices', JSON.stringify(invoiceRemoveReq));
  }
  getInvoiceNextScheduleDateDetails(objInvoiceRequest: IInvoiceRequest): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'GetCustNextScheduleDate', obj);
  }

  UpdateCustomerInvoiceDueDate(objInvoiceRequest: IInvoiceRequest, userEvents?: IUserEvents): Observable<any> {
    let obj = JSON.stringify(objInvoiceRequest);
    return this.http.postHttpMethod(this.invoiceUrl + 'UpdateCustomerInvoiceDueDate', obj, userEvents);
  }
}
