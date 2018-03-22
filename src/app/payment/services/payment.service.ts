import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../shared/services/http.service";
import { CreditCardType } from "../constants";
import 'rxjs/add/operator/map'
import { ICreditCardRequest } from "../models/creditcardrequest";
import { IBankRequest } from "../models/bankrequest";
import { IMakePaymentrequest } from "../models/makepaymentrequest";
import { IPaymentResponse } from "../models/paymentresponse";
import { IBlocklistRequest } from "../models/blocklistrequest";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { IEmailRequest } from "../models/emailrequest";
import { ICreditcardpaymentrequest } from "../models/creditcardpaymentrequest";
import { IParentPaymentModes } from '../models/parentpaymentmodesrequest';
import { IParentPaymentModesResponse } from '../models/parentpaymentmodesresponse';
import { IPaymentReversals } from '../models/paymentreversalsrequest';
import { IUserEvents } from '../../shared/models/userevents';



@Injectable()
export class PaymentService {
  private paymentUrl = 'payment/';
  private commonUrl = 'Common/';
  private paymentConfirmURL = 'PaymentConfirmation/';
  constructor(private http: HttpService) { }
  private paymentConfirmUrl = 'PaymentConfirmation/';
  data: any;
  getLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.paymentUrl + 'GetLookups');

  }

  GetCreditCardByAccountId(strCustomerId: string, userevents?: IUserEvents): Observable<ICreditCardRequest[]> {
    return this.http.getHttpWithParams(this.paymentUrl + 'GetCreditCardByAccountId', "strCustomerId", strCustomerId, userevents);

  }

  GetBankByAccountID(strCustomerId: string): Observable<IBankRequest[]> {
    return this.http.getHttpWithParams(this.paymentUrl + 'GetBankByAccountID', "strCustomerId", strCustomerId);

  }

  CreateCreditCard(creditcard: ICreditCardRequest): Observable<boolean> {
    let obj = JSON.stringify(creditcard);
    return this.http.postHttpMethod(this.paymentUrl + 'CreateCreditCard', obj);
  }

  CreateBank(bank: IBankRequest): Observable<boolean> {
    let obj = JSON.stringify(bank);
    return this.http.postHttpMethod(this.paymentUrl + 'CreateBank', obj);
  }

  MakePayment(makepayment: IMakePaymentrequest, userevents?: IUserEvents): Observable<IPaymentResponse> {
    let obj = JSON.stringify(makepayment);
    return this.http.postHttpMethod(this.paymentUrl + 'RequestPayment', obj, userevents);
  }

  ValidatePaymentDetailsOnSubmit(makepayment: IMakePaymentrequest): Observable<string> {
    let obj = JSON.stringify(makepayment);
    return this.http.postHttpMethod(this.paymentUrl + 'ValidatePaymentDetailsOnSubmit', obj);
  }

  InsertWelcomeEmail(customerId: number, updateduser: string): Observable<string> {
    this.data = { 'CustomerId': customerId, 'CreaterUser': updateduser }
    return this.http.postHttpMethod(this.paymentUrl + 'InsertWelcomeEmail', JSON.stringify(this.data));
  }

  IsExistsinBlockList(objBloackList: IBlocklistRequest): Observable<IBlocklistresponse[]> {
    return this.http.postHttpMethod(this.paymentUrl + 'IsExistBlockList', objBloackList);
  }

  GeneratePaymentReciept(paymentResponse: IPaymentResponse[], longUserId: number, longLoginId: number, strSource: string, userEvents?: IUserEvents): Observable<string[]> {

    this.data = { 'objPaymnetresponse': paymentResponse, 'lngUserId': longUserId, 'longLoginId': longLoginId, 'source': strSource }
    return this.http.postHttpMethod(this.paymentConfirmUrl + 'GeneratePaymentReciept', JSON.stringify(this.data), userEvents);

    //return this.http.getHttpWithTwoParams(this.commonUrl + 'GeneratePaymentReciept', "longPaymentTxnId", JSON.stringify(longPaymentTxnId), "longUserId", JSON.stringify(longUserId))
    //   ;
  }

  InsertPaymentReciptEmail(emailRequest: IEmailRequest): Observable<boolean> {
    let obj = JSON.stringify(emailRequest);
    return this.http.postHttpMethod(this.paymentConfirmURL + 'InsertPaymentReciptEmail', obj);
  }

  GetCreditCardByPK(strCCId: string): Observable<ICreditCardRequest> {
    return this.http.getHttpWithParams(this.paymentUrl + 'GetCreditCardByPK', "strCCId", strCCId);
  }

  UpdateCreditCard(objreqCreditCard: ICreditCardRequest): Observable<ICreditCardRequest> {
    let obj = JSON.stringify(objreqCreditCard);
    return this.http.postHttpMethod(this.paymentUrl + 'UpdateCreditCard', obj);
  }

  DeleteCreditCard(objreqCreditCard: ICreditCardRequest): Observable<ICreditCardRequest> {
    let obj = JSON.stringify(objreqCreditCard);
    return this.http.postHttpMethod(this.paymentUrl + 'DeleteCreditCard', obj);
  }

  GetBankByPK(strBankId: string): Observable<IBankRequest> {
    return this.http.getHttpWithParams(this.paymentUrl + 'GetBankByPK', "strBankId", strBankId);
  }

  updateBank(objreqBank: IBankRequest): Observable<IBankRequest> {
    let obj = JSON.stringify(objreqBank);
    return this.http.postHttpMethod(this.paymentUrl + 'UpdateBank', obj);
  }

  deleteBank(objreqBank: IBankRequest): Observable<IBankRequest> {
    let obj = JSON.stringify(objreqBank);
    return this.http.postHttpMethod(this.paymentUrl + 'DeleteBank', obj);
  }

  getParentPaymentModesLookUps(userEvents: IUserEvents): Observable<any> {
    return this.http.getHttpWithoutParams(this.paymentUrl + 'GetParentPaymentModesLookUps', userEvents);
  }
  getParentPaymentDetailsByPaymentModes(parentPaymentModesRequest: IParentPaymentModes, userEvents: IUserEvents): Observable<IParentPaymentModesResponse[]> {
    let obj = JSON.stringify(parentPaymentModesRequest);
    return this.http.postHttpMethod(this.paymentUrl + 'GetPaymentHistoryDetails', obj, userEvents);
  }

  doPaymentReversal(doPaymentReversalsRequest: IPaymentReversals): Observable<IPaymentResponse> {
    let obj = JSON.stringify(doPaymentReversalsRequest);
    return this.http.postHttpMethod(this.paymentUrl + 'DoReversals', obj);
  }

  IsPromoAvailable(strPromoCode: string): Observable<boolean> {
    var obj = JSON.stringify(strPromoCode);
    return this.http.postHttpMethod(this.paymentUrl + 'IsPromoAvailable', obj);
  }

  IsPromoAlreadyApplied(lngCustromerId: number, strPromoCode: string): Observable<boolean> {
    this.data = { 'lngCustromerId': lngCustromerId, 'strPromoCode': strPromoCode }
    return this.http.postHttpMethod(this.paymentUrl + 'IsPromoAlreadyApplied', this.data);
  }

  GetPromoFaceValue(strPromoCode: string): Observable<number> {
    var obj = JSON.stringify(strPromoCode);
    return this.http.postHttpMethod(this.paymentUrl + 'GetPromoFaceValue', obj);
  }




}
