import { fees } from './../split-verify-payment.component';
import { IPaymentResponse } from './../../../payment/models/paymentresponse';
import { ISplitRequest } from './../models/splitrequest';
import { BalanceTransfer } from './../split-payment.component';
import { IPaging } from './../../../shared/models/paging';
import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { ISearchCustomerRequest } from "../../search/models/searchcustomerRequest";
import { Observable } from "rxjs/Observable";
import { IProfileResponse } from "../../search/models/profileresponse";
import { ICustomerResponse } from "../../../shared/models/customerresponse";
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class SplitCustomerService {
  private customerUrl = '/CustomerAccounts/';

  constructor(private http: HttpService) { }

  private splitUrl = 'Split/';

  splitCustomerSearch(splitSearch: ISearchCustomerRequest, userEvents?: IUserEvents): Observable<ICustomerResponse[]> {
    return this.http.postHttpMethod(this.splitUrl + 'SplitCustomerSearch', JSON.stringify(splitSearch), userEvents);
  }

  public _splitContext: ISplitRequest;
  public _splitRespContext: IPaymentResponse;
  public splitContext() {
    return this._splitContext;
  }

  public splitResponse() {
    return this._splitRespContext;
  }

  //create a private setter
  private setSplitContext(customer: ISplitRequest) {
    this._splitContext = customer;
    //console.log("Set Session Service", this._customerContext)
  }
  private setSplitResponseContext(customer: IPaymentResponse) {
    this._splitRespContext = customer;
    //console.log("Set Session Service", this._customerContext)
  }

  changeResponse(context: ISplitRequest) {
    //console.log("Set change response", context)
    this.setSplitContext(context)
  }
  changeSplitResponse(context: IPaymentResponse) {
    //console.log("Set change response", context)
    this.setSplitResponseContext(context)
  }
  getBalanaceTransferDetails(custDetails: string, userEvents?: IUserEvents): Observable<BalanceTransfer> {
    return this.http.getHttpWithParams(this.splitUrl + 'GetBalanceTransfer', 'custDetails', custDetails, userEvents);
  }

  createXML(splitReq: ISplitRequest, userEvents?: IUserEvents): Observable<IPaymentResponse> {
    var obj = JSON.stringify(splitReq);
    return this.http.postHttpMethod(this.splitUrl + 'CreateXMLData', obj, userEvents);
  }
  getServiceTax(): Observable<string> {
    return this.http.getHttpWithoutParams(this.customerUrl + 'ServiceTax');
  }

  paymentReceipt(objSplitRequest, objSplitResponse) {
    var obj = { 'objPaymentRequest': objSplitRequest, 'objPaymnetresponse': objSplitResponse, }
    return this.http.postHttpMethod(this.splitUrl + 'GenerateSplitPaymentReciept', JSON.stringify(obj));
  }

  getFeesByPlanId(id: number, userEvents?: IUserEvents): Observable<fees[]> {
    var obj = { 'planId': id }
    return this.http.postHttpMethod(this.splitUrl + 'GetFeesBasedOnPlanId', JSON.stringify(obj), userEvents);
  }
}