import { IAccountFlagsResponse } from '../models/accountflagsresponse';
import { ICommonResponse } from '../../../shared/models/commonresponse';
import { IAccountFlagsRequest } from '../models/accountflagsrequest';
import { ICustomerAttributeRequest } from '../../../shared/models/customerattributerequest';
import { ICustomerAttributeResponse } from '../../../shared/models/customerattributeresponse';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpService } from '../../../shared/services/http.service';
import { IPhoneResponse } from "../models/phoneresponse";
import { IAddressResponse } from "../../../shared/models/addressresponse";
import { IEmailResponse } from "../../../shared/models/emailresponse";
import { ICustomerResponse } from "../../../shared/models/customerresponse";
import { IVehicleRequest } from "../../../vehicles/models/vehiclecrequest";
import { CloseAccountInputs } from "../close-account.component";
import { IPlanResponse } from "../../../sac/plans/models/plansresponse";
import { IDiscountResponse } from "../../customerdetails/models/discountsresponse";
import { ICustomerDiscountRequest } from "../models/customerdiscountsrequest";
import { ICustomerDiscountResponse } from "../models/customerdiscountsresponse";
import { IPlanRequest } from "../../../sac/plans/models/plansrequest";
import { IPlanRequests } from "../models/planrequests";
import { IAlertandCommunicationResponse } from '../models/alertsandcommunicationsresponse';
import { IAlertsAndCommunicationsRequest } from '../models/alertandcommunicationsrequest';
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class CustomerserviceService {
  options: any;
  data: any;
  constructor(private http: HttpService) { }
  private customerDetails = 'CustomerDetails/';
  private closeAccount = 'CloseAccount/';
  private common = 'Common/';
  private planUrl = 'Plans/';
  private assignDiscounts = 'AssignDiscounts/';

  getReferralAccounts(longAccountId: number, userEvents?: IUserEvents): Observable<ICustomerAttributeResponse> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.customerDetails + 'GetReferralDetailsByCustomerId', 'longCustomerId', obj, userEvents);
  }

  getDefaultPhone(longAccountId: number): Observable<IPhoneResponse> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.closeAccount + 'GetDefaultPhone', 'longAccountId', obj);
  }
  getDefaultAddress(longAccountId: number, userEvents?: IUserEvents): Observable<IAddressResponse> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.closeAccount + 'GetDefaultAddress', 'longAccountId', obj, userEvents);
  }
  getDefaultEmail(longAccountId: number): Observable<IEmailResponse> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.closeAccount + 'GetDefaultEmail', 'longAccountId', obj);
  }
  getAccountstatusForCloseAccount(longAccountId: number, userEvents?: IUserEvents): Observable<string> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.closeAccount + 'GetAccountstatusForCloseAccount', 'longAccountId', obj, userEvents);
  }
  closeCustomerAccount(vehicleRequest: IVehicleRequest, strOptions: CloseAccountInputs, userEvents: IUserEvents): Observable<boolean> {
    this.data = { 'strVehileObject': vehicleRequest, 'strOptions': strOptions }
    return this.http.postHttpMethod(this.closeAccount + 'CloseCustomerAccount', JSON.stringify(this.data), userEvents);
  }
  getPlanAndOpenDiscounts(planid: number, startDate: Date): Observable<IDiscountResponse[]> {
    this.data = { 'strPlanId': planid, 'dtStartDate': startDate }
    return this.http.postHttpMethod(this.assignDiscounts + 'GetPlanAndOpenDiscounts', JSON.stringify(this.data));
  }
  getPlan(longAccountId: IPlanRequest): Observable<IPlanResponse[]> {
    let obj = JSON.stringify(longAccountId);
    return this.http.postHttpMethod(this.assignDiscounts + 'GetPlan', obj);
  }
  getDisocuntByPk(intDiscountIds: ICustomerDiscountRequest): Observable<ICustomerDiscountResponse> {
    let obj = JSON.stringify(intDiscountIds);
    return this.http.postHttpMethod(this.assignDiscounts + 'GetByDiscountPK', obj);
  }
  deactivateDiscount(customerId: number, requestActive: ICustomerDiscountRequest, userEvents: IUserEvents): Observable<ICustomerDiscountResponse[]> {
    this.data = { 'longCustomerId': customerId, 'objReqDeActivate': requestActive }
    return this.http.postHttpMethod(this.assignDiscounts + 'DeActivateDiscount', JSON.stringify(this.data), userEvents);
  }
  assignCustomerDiscounts(customerId: number, requestAssign: ICustomerDiscountRequest, userEvents: IUserEvents): Observable<ICustomerDiscountResponse[]> {
    this.data = { 'longCustomerId': customerId, 'objReqAssign': requestAssign }
    return this.http.postHttpMethod(this.assignDiscounts + 'AssignDiscounts', JSON.stringify(this.data), userEvents);
  }
  updateCustomerDiscount(customerId: number, requestUpdate: boolean): Observable<ICustomerDiscountResponse[]> {
    this.data = { 'longCustomerId': customerId, 'objReqUpdate': requestUpdate }
    return this.http.postHttpMethod(this.assignDiscounts + 'UpdateCustomerDiscount', JSON.stringify(this.data));
  }
  checkReferralCustomer(longAccountId: number, ReferralAccountId: number, userEvents?: IUserEvents): Observable<boolean> {
    this.data = { 'strAccountId': longAccountId, 'srtRefIndicator': ReferralAccountId }
    return this.http.postHttpMethod(this.customerDetails + 'CheckReferralCustomer', JSON.stringify(this.data), userEvents);
  }

  insertReferalCustomer(RequestObject: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(RequestObject);
    return this.http.postHttpMethod(this.customerDetails + 'InsertReferalCustomer', obj, userEvents);
  }

  getAccountFlags(longAccountId: number, userEvents?: IUserEvents): Observable<IAccountFlagsResponse> {
    const obj = JSON.stringify(longAccountId);
    return this.http.getHttpWithParams(this.customerDetails + 'GetAccountFlagsbyCustomerId', 'longCustomerId', obj, userEvents);
  }

  getLookUpByParentLookupTypeCode(lookuptypecode: ICommonResponse): Observable<ICommonResponse[]> {
    let obj = JSON.stringify(lookuptypecode);
    console.log(obj);
    return this.http.getHttpWithParams(this.common + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj);
  }

  updateAccountFlags(activityRequest: IAccountFlagsRequest, userEvents?: IUserEvents): Observable<any[]> {
    return this.http.postHttpMethod(this.customerDetails + 'UpdateAccountFlags', JSON.stringify(activityRequest), userEvents)
      ;
  }

  getRequestedPlanDetails(longCustomerId: number): Observable<any> {
    return this.http.postHttpMethod(this.customerDetails + 'GetRequestedPlanDetails', JSON.stringify(longCustomerId))
      ;
  }

  GetActiveVehicleCount(longCustomerId: number): Observable<any> {
    return this.http.postHttpMethod(this.customerDetails + 'GetActiveVehicleCount', JSON.stringify(longCustomerId))
      ;
  }

  ChangePlan(objPlanRequest: IPlanRequests, userEvents?: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.customerDetails + 'ChangePlan', objPlanRequest, userEvents);
  }

  TagsAvailability(longCustomerId: number): Observable<boolean> {
    return this.http.postHttpMethod(this.customerDetails + 'TagsAvailability', JSON.stringify(longCustomerId))
      ;
  }
  updateStatementDeliveryOption(CustomerAttributesRequest: ICustomerAttributeRequest, userEvents?: IUserEvents): Observable<any[]> {
    let obj = JSON.stringify(CustomerAttributesRequest);
    return this.http.postHttpMethod(this.customerDetails + 'updateStatementDeliveryOption', obj, userEvents);
  }

  updateTransponderPurchaseMethod(CustomerAttributesRequest: ICustomerAttributeRequest, userEvent?: IUserEvents): Observable<any[]> {
    let obj = JSON.stringify(CustomerAttributesRequest);
    return this.http.postHttpMethod(this.customerDetails + 'UpdateTransponderPurchaseMethod', obj, userEvent);
  }

  getCustomerData(longCustomerId: number, userEvent?: IUserEvents): Observable<ICustomerAttributeResponse> {
    let obj = JSON.stringify(longCustomerId);
    return this.http.postHttpMethod(this.customerDetails + 'getCustomerData', obj, userEvent);
  }

  getCustomerCycle(longCustomerId: number): Observable<string> {
    let obj = JSON.stringify(longCustomerId);
    return this.http.getHttpWithParams(this.customerDetails + 'getCustomerCycle', "longCustomerId", obj)
      ;
  }
  getDefaultAlerts(): Observable<IAlertandCommunicationResponse[]> {
    return this.http.getHttpWithoutParams(this.customerDetails + 'getDefaultAlerts');
  }

  getAlertsByCustomerId(longCustomerId: number, userEvent: IUserEvents): Observable<IAlertandCommunicationResponse[]> {
    let obj = JSON.stringify(longCustomerId);
    return this.http.postHttpMethod(this.customerDetails + 'getAlertsByCustomerId', obj, userEvent);
  }

  alertSettingInsertOrUpdate(AlertsAndCommunicationsRequest: IAlertsAndCommunicationsRequest[], userEvent: IUserEvents): Observable<any[]> {
    let obj = JSON.stringify(AlertsAndCommunicationsRequest);
    return this.http.postHttpMethod(this.customerDetails + 'AlertSettingInsertOrUpdate', obj, userEvent);
  }

  getPlanByPK(planId: string): Observable<IPlanResponse> {
    return this.http.getHttpWithParams(this.planUrl + 'GetPlanByPK', "intPlanId", planId);
  }
}
