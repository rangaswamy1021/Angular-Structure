import { ICustomerProfileRequest } from './../../../shared/models/customerprofilerequest';
import { IUnIdentifiedResponse } from './../models/unidentifiedresponse';
import { IUnIdentifiedRequest } from './../models/unidentifiedrequest';
import { IPaymentResponse } from './../../../payment/models/paymentresponse';
import { IMakePaymentrequest } from './../../../payment/models/makepaymentrequest';
import { IPaging } from '../../../shared/models/paging';
import { ISecurityRequest } from '../../customerdetails/models/securityrequest';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISearchCustomerResponse } from '../../search/models/searchcustomerresponse';
import { ISearchCustomerRequest } from '../../search/models/searchcustomerRequest';
import { Http } from '@angular/http';
import { HttpService } from '../../../shared/services/http.service';
import { ICustomerResponse } from "../../../shared/models/customerresponse";
import { ICustomerRequest } from "../../../shared/models/customerrequest";
import { IKYCDocumentResponse } from "../../customerdetails/models/kycdocumentsresponse";
import { IPlanResponse } from "../../../sac/plans/models/plansresponse";
import { ICustomerAttributesRequest } from "../../customerdetails/models/customerattributesrequest";
import { ITagsAmountrequest } from "../models/tagsamountrequest";
import 'rxjs/add/operator/publishReplay';
import { IPayByPlateRequest } from '../models/paybyplaterequest';
import { IPayByPlateResponse } from '../models/paybyplateresponse';
import { CustomerAdditionalInformation } from '../models/additionalinformationresponse';
import { ICustomerAttributeRequest } from '../../../shared/models/customerattributerequest';
import { ISystemActivities } from "../../../shared/models/systemactivitiesrequest";
import { StatementCycle } from '../customer-preferences.component';
import { IBlocklistRequest } from '../models/blocklistrequest';
import { IBlocklistresponse } from '../models/blocklistresponse';
import { IViolatorSearchRequest } from '../../../tvc/search/models/violatorsearchrequest';
import { IViolatorSearchResponse } from '../../../tvc/search/models/violatorsearchresponse';
import { IUserEvents } from "../../../shared/models/userevents";
//import { ICustomerProfileRequest } from '../../../shared/models/customerprofilerequest';



@Injectable()
export class CustomerAccountsService {
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  constructor(private http: HttpService) { }
  private customerUrl = '/CustomerAccounts/';
  private adjustmentRequestUrl = '/CustomerDetails/';
  private paymentConfirmUrl = 'PaymentConfirmation/';
  private violationSearchUrl = 'ViolatorDetails/';
  searchReopenAccount(searchAcc: ISearchCustomerRequest, userEvents?: IUserEvents): Observable<ISearchCustomerResponse[]> {
    const obj = JSON.stringify(searchAcc);
    return this.http.getHttpWithParams(this.customerUrl + 'SearchReopenAccount', 'objSearchAccount', obj, userEvents);
  }

  getAccountDetailsById(accountId: number): Observable<ICustomerResponse> {
    return this.http.postHttpMethod(this.customerUrl + 'GetAccountDetailsById', accountId);
  }

  getTollTypes() {
    return this.http.getHttpWithoutParams(this.customerUrl + 'GetTollTypes/');
  }

  getAllPlansWithFees(userEvents?: IUserEvents): Observable<IPlanResponse[]> {
    return this.http.getHttpWithoutParams(this.customerUrl + 'GetAllPlansWithFees/',userEvents).publishReplay().refCount();
  }

  getListOfDocumentsByAccountId(accountId: number): Observable<IKYCDocumentResponse[]> {
    return this.http.postHttpMethod(this.customerUrl + 'GetListOfDocumentsByAccountId', accountId);
  }

  createCustomer(objCustomer: ICustomerRequest, userevents?: IUserEvents): Observable<number> {
    return this.http.postHttpMethod(this.customerUrl + 'CreateCustomer', objCustomer, userevents);
  }

  isUserNameExist(strUserName: string): Observable<boolean> {
    var obj = JSON.stringify(strUserName);
    return this.http.postHttpMethod(this.customerUrl + 'IsUserNameExist', obj);
  }

  isEmailExist(strEmailAddress: string): Observable<boolean> {
    var obj = JSON.stringify(strEmailAddress);
    return this.http.postHttpMethod(this.customerUrl + 'IsEmailExist', obj);
  }

  getFeesbasedonPlanId(planid): Observable<any> {
    return this.http.postHttpMethod(this.customerUrl + 'GetFees', planid);
  }

  updateCustomerAttributes(customerAttr: ICustomerAttributesRequest, userEvents?: IUserEvents): Observable<any> {
    var obj = JSON.stringify(customerAttr);
    return this.http.putHttpMethod(this.customerUrl + 'UpdateCustomerAttributesAndPlan', obj, userEvents);
  }
  getRevenueCategorybyAccountId(customerid: number): Observable<ICustomerResponse> {
    var obj = JSON.stringify(customerid);
    return this.http.postHttpMethod(this.customerUrl + 'GetRevenueCategorybyAccountId', obj);
  }
  getCustomerCreateAccountProcessInfo(customerid: number): Observable<ITagsAmountrequest[]> {
    var obj = JSON.stringify(customerid);
    return this.http.postHttpMethod(this.customerUrl + 'GetCreateAccountProcessInformation', obj);
  }

  insertCustomerCreateAccountProcessInfo(objcustomer: ITagsAmountrequest[]) {
    var obj = JSON.stringify(objcustomer);
    return this.http.postHttpMethod(this.customerUrl + 'InsertCreateAccountProcessInformation', obj);
  }

  deleteCustomerCreateAccountProcessInfo(customerid: number) {
    return this.http.deleteHttpMethodWithParams(this.customerUrl + 'DeleteCreateAccountProcessInformation', 'lngCustomerId', customerid.toString());
  }

  uploadFile(formData: FormData): Observable<string> {
    return this.http.postHttpMethodwithoutOptions(this.customerUrl + 'UploadFile', formData);
  }


  getCustomerPayByPlateHistory(payByPlate: IPayByPlateRequest, userEvent?: IUserEvents): Observable<IPayByPlateResponse[]> {
    const obj = JSON.stringify(payByPlate);
    return this.http.postHttpMethod(this.customerUrl + 'getCustomerPayByPlateHistory', obj, userEvent);
  }

  deleteCustomerPayByPlateDetails(payByPlate: IPayByPlateRequest[], userEvent?: IUserEvents) {
    let obj = JSON.stringify(payByPlate);
    return this.http.postHttpMethod(this.customerUrl + 'deleteCustomerPayByPlateDetails', obj, userEvent);
  }

  getPasswordAttempts(cutomerId, userEvents?: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.customerUrl + 'GetPasswordAttempts', cutomerId, userEvents);
  }

  resetPasswordAttempts(securityRequest: ISecurityRequest, userEvents?: IUserEvents): Observable<any> {
    var data = { 'objSecurityRequest': securityRequest }
    return this.http.postHttpMethod(this.customerUrl + 'ResetPasswordAttempts', JSON.stringify(data));
  }
  getStatementCycle(): Observable<StatementCycle[]> {
    return this.http.getHttpWithoutParams(this.customerUrl + 'GetStatementCycleTypes');
  }

  getCustomerAdditionalInformation(accountID): Observable<CustomerAdditionalInformation> {
    return this.http.getHttpWithParams(this.customerUrl + 'GetCustomerAdditionalInformation', 'AccountID', accountID);
  }

  updateAdditionalInformation(customerAdditinalInfo: ICustomerAttributeRequest): Observable<any> {
    var data = { 'objCreateAccountProcessInformation': customerAdditinalInfo }
    var obj = JSON.stringify(customerAdditinalInfo);
    return this.http.putHttpMethod(this.customerUrl + 'UpdateAdditionalInformation', obj);
  }

  mergeCustomerSearch(searchCustomerRequest: ISearchCustomerRequest): Observable<ICustomerResponse[]> {
    return this.http.postHttpMethod(this.customerUrl + 'MergeAccountSearch', searchCustomerRequest);
  }

  mergAccounts(parentAccountId: number, customersArray: ICustomerResponse[], createdUser: string, objSystemActivities: ISystemActivities, checkBlockList: boolean, userEvents: IUserEvents): Observable<string> {
    var data: any = { 'parentAccountId': parentAccountId, 'customersList': customersArray, 'strCreatedUser': createdUser, 'objSystemActivities': objSystemActivities, 'checkBlockList': checkBlockList };
    return this.http.postHttpMethod(this.customerUrl + 'MergAccounts', data, userEvents);
  }

  getRefferalCustomers(pagingRequest: IPaging, userEvents?: IUserEvents): Observable<any> {
    var data = { 'objPagingRequest': pagingRequest }
    return this.http.postHttpMethod(this.customerUrl + 'GetRefferalCustomers', JSON.stringify(data), userEvents);
  }

  updateReferralCustomer(custAttRequest: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<any> {
    var data = { 'objCustAttRequest': custAttRequest }
    return this.http.postHttpMethod(this.customerUrl + 'UpdateReferralCustomer', JSON.stringify(data), userEvents);
  }
  // Pending Adjustments block started
  getPendingAdjustments(objaccountAdjustmentReq: any): Observable<any[]> {
    return this.http.postHttpMethod(this.adjustmentRequestUrl + 'GetPendingAdjustments', JSON.stringify(objaccountAdjustmentReq))
      ;
  }

  approvePendingAdjustment(objaccountAdjustmentReq: any,userEvents: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.adjustmentRequestUrl + 'ApproveAdjustmentRequest', JSON.stringify(objaccountAdjustmentReq), userEvents);
      ;
  }

  rejectPendingAdjustment(objaccountAdjustmentReq: any,userEvents: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.adjustmentRequestUrl + 'RejectAdjustmentRequest', JSON.stringify(objaccountAdjustmentReq),userEvents);
      ;
  }
  //Pending Adjustments block ended

  //added for UnIdentified
  getAnonymousPayments(unIdentifiedReq: IUnIdentifiedRequest): Observable<IUnIdentifiedResponse[]> {
    //const obj = JSON.stringify(unIdentifiedReq);
    return this.http.postHttpMethod(this.customerUrl + 'GetAnonymousPayments', unIdentifiedReq);
  }

  getAdvancedSearch(searchCustomer: ISearchCustomerRequest): Observable<ISearchCustomerResponse[]> {
    const objsearchCustomer = JSON.stringify(searchCustomer);
    return this.http.postHttpMethod(this.customerUrl + 'AdvancedSearchCustomer', objsearchCustomer);
  }

  makeAnonymousPayment(makepayment: IMakePaymentrequest, userEvents?: IUserEvents): Observable<IPaymentResponse> {
    let obj = JSON.stringify(makepayment);
    return this.http.postHttpMethod(this.customerUrl + 'InsertAnonymousPayments', obj, userEvents);
  }

  transferAnonymousPayments(makepayment: IMakePaymentrequest, userEvents?: IUserEvents): Observable<IPaymentResponse> {
    let obj = JSON.stringify(makepayment);
    return this.http.postHttpMethod(this.customerUrl + 'TransferAnonymousPayments', obj, userEvents);
  }

  setResponseValue(makepayment: IPaymentResponse) {
    this.paymentResponse = makepayment;
  }

  getResponseValue(): IPaymentResponse {
    return this.paymentResponse;
  }

  generatePaymentReciept(paymentResponse: IPaymentResponse[], longUserId: number, longLoginId: number): Observable<string[]> {
    var data = { 'objPaymnetresponse': paymentResponse, 'lngUserId': longUserId, 'longLoginId': longLoginId, 'source': 'Payment' }
    return this.http.postHttpMethod(this.paymentConfirmUrl + 'GeneratePaymentReciept', JSON.stringify(data));
  }

  getBlockListData(objPaging: IPaging, userEvents: IUserEvents): Observable<IBlocklistresponse[]> {
    return this.http.postHttpMethod(this.customerUrl + 'GetBlockListData', objPaging, userEvents);
  }

  addBlockList(blockListRequest: IBlocklistRequest, userEvents: IUserEvents) {
    return this.http.postHttpMethod(this.customerUrl + 'AddToBlockList', blockListRequest, userEvents);
  }

  updateBlockList(blockListRequest: IBlocklistRequest, userEvents: IUserEvents) {
    var data = { 'objBlockList': blockListRequest }
    var obj = JSON.stringify(blockListRequest);
    return this.http.putHttpMethod(this.customerUrl + 'UpdateBlockList', obj, userEvents);
  }

  deleteBlockList(blockListRequest: IBlocklistRequest, userEvents: IUserEvents) {
    var data = { 'objBlockList': blockListRequest }
    let obj = JSON.stringify(data);
    return this.http.postHttpMethod(this.customerUrl + 'DeleteBlockList', obj, userEvents);
  }

  getBlockListById(blockListId: number): Observable<IBlocklistresponse> {
    var obj = JSON.stringify(blockListId);
    return this.http.postHttpMethod(this.customerUrl + 'GetBlockListById', obj);
  }

  getAdditionalContactsByParentAccountId(icustomerProfileRequest: ICustomerProfileRequest): Observable<ICustomerResponse[]> {
    let obj = JSON.stringify(icustomerProfileRequest);
    return this.http.getHttpWithParams(this.customerUrl + 'GetAdditionalContactsByParentAccountId', 'objCustProfile', obj);
  }

  getAccountDetail(accountId: number): Observable<ICustomerResponse> {
    let obj = JSON.stringify(accountId);
    return this.http.getHttpWithParams(this.customerUrl + 'GetAccountDetail', 'accountId', obj);
  }

  updateAccountStatus(objCustomer: ICustomerRequest,userEvents?:IUserEvents): Observable<number> {
    return this.http.postHttpMethod(this.customerUrl + 'UpdateAccountStatus', objCustomer,userEvents);
  }

  getAccountCreatedDateTime(accountId: number) {
    return this.http.postHttpMethod(this.customerUrl + 'GetAccountCreatedDateTime', accountId);
  }

  getViolatorsBySearchRequest(violatorSearchRequest: IViolatorSearchRequest): Observable<IViolatorSearchResponse[]> {
    return this.http.postHttpMethod(this.violationSearchUrl + 'SearchViolator', JSON.stringify(violatorSearchRequest))
      ;
  }
}
