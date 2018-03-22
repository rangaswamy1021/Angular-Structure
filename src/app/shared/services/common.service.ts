import { ICSRRelationsRequest } from '../models/csrrelationsrequest';
import { ITagsAmountrequest } from './../../csc/customeraccounts/models/tagsamountrequest';
import { ITagResponse } from './../models/tagresponse';
import { ICustomerAttributeResponse } from './../models/customerattributeresponse';
import { IVehicleResponse } from './../models/vehicleresponse';
import { IEmailResponse } from './../models/emailresponse';
import { ICustomerSecurityResponse } from './../models/customersecurityresponse';
import { IPlanResponse } from './../../sac/plans/models/plansresponse';
import { ICustomerResponse } from './../models/customerresponse';
import { ICustomerProfileResponse } from './../models/customerprofileresponse';
import { ISMSRequest } from './../models/smsrequest';
import { IPhoneResponse } from './../models/phoneresponse';
import { Injectable } from "@angular/core";
import { HttpService } from "./http.service";
import { Http, RequestOptions } from "@angular/http";
import { Observable } from "rxjs";
import { ICommon, ICommonResponse } from "../models/commonresponse";

import { tokenNotExpired } from 'angular2-jwt';

import { ApplicationParameterkey } from "../applicationparameter";
import { IAddressResponse } from "../models/addressresponse";

import { Security } from '../models/Security';

import { IAddressRequest } from '../models/addressrequest';
import 'rxjs/add/operator/publishLast';

import { User, oAuthGrant } from '../models/user';
import { IPhoneRequest } from "../models/phonerequest";
import { IEmailRequest } from "../models/emailrequest";
import { IUserresponse } from '../models/userresponse';
import { LookupTypeCodes, AccountStatus, Actions } from "../constants";
import { ICreatecomplaintrequest } from "../models/createcomplaintrequest";
import { ISearchCustomerRequest } from "../../csc/search/models/searchcustomerRequest";
import { IProfileResponse } from "../../csc/search/models/ProfileResponse";
import { IBlocklistresponse } from "../models/blocklistmessageresponse";
import { ISystemActivities } from "../models/systemactivitiesrequest";
import { IUserEvents } from "../models/userevents";
import { SessionService } from "./session.service";

@Injectable()
export class CommonService {
  constructor(private http: HttpService, private sessionContext: SessionService) { }
  private commonUrl = 'common/';
  private communication = 'Communication/';
  private customerUrl = 'CustomerAccounts/';
  private helpdeskUrl = 'helpdesk/';
  private countryList: Observable<any>;
  private stateList: Observable<any>;
  //Get address details based on the primary key
  getAddressbyPKID(AddressID: string): Observable<IAddressResponse> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetAddressByAddressID', "longAddressId", AddressID);
  }

  getCountries(userEvent?: IUserEvents): Observable<any> {
    if (!this.countryList) {
      return this.http.getHttpWithoutParams(this.commonUrl + 'GetCountries', userEvent);
    }
  }

  getTollScheduleTypesLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetTollScheduleTypesLookups');
  }

  //Menu Generation By RoleId
  menuGenerationByRoleId(RoleId: number,userId:number): Observable<IAddressResponse> {
    var obj = JSON.stringify({'roleId':RoleId,'userId':userId});
    return this.http.postHttpMethod(this.commonUrl + 'GenerateMenuJson', obj);
  }

  getLoginId(username: string): Observable<string> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetLoginId', "UserName", username);
  }

  getIcnId(userId: string): Observable<string> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetIcnid', "AccountId", userId);
  }

  getRoleId(userId: string): Observable<string> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetRoleId', "longUserId", userId);
  }


  decrypt(security: Security): Observable<string> {
    let obj = JSON.stringify(security);
    return this.http.postHttpMethod(this.commonUrl + 'DecryptText', obj);
  }

  Authenticate(username: string, password: string): Observable<any> {

    var credentials = {
      grant_type: 'password',
      username: username,
      password: password
    };
    return this.http.oAuthpostHttpMethod('token', credentials);
  }

  Refresh(refreshToken: string): Observable<any> {
    var credentials = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    return this.http.oAuthpostHttpMethod('token', credentials);
  }

  //get states by country code
  getStatesByCountryCode(countryCode: ICommon): Observable<ICommonResponse[]> {
    if (!this.stateList) {
      let obj = JSON.stringify(countryCode);
      return this.http.getHttpWithParams(this.commonUrl + 'GetStatesByCountryCode', "countryCode", obj);
    }
  }

  getDefaultAddress(customerId: string): Observable<IAddressResponse> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetDefaultAddressByCustomerID', "longAccountId", customerId);
  }

  getApplicationParameterValue(key: ApplicationParameterkey, userEvents?: IUserEvents): Observable<any> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParametersValueByKey/', 'parameterKey', ApplicationParameterkey[key], userEvents);
  }
  //Get customer full address
  getAllAddressesByCustomerId(longCustomerId: number, userEvents?: IUserEvents): Observable<IAddressResponse[]> {
    let obj = JSON.stringify(longCustomerId);
    return this.http.postHttpMethod(this.commonUrl + 'GetAllAddressesByCustomerId', obj, userEvents);
  }

  //get address by type and customer id
  getAddressByTypeByCustomer(longCustomerId: number, addressType: string): Observable<IAddressResponse> {
    let obj = JSON.stringify(longCustomerId);
    return this.http.postHttpMethod(this.commonUrl + 'GetAddressByTypeByCustomer', obj);
  }

  //Get Address change History
  getAddressHistoryByAccountId(addressRequest: IAddressRequest, userEvents?: IUserEvents): Observable<IAddressResponse[]> {
    let obj = JSON.stringify(addressRequest);
    return this.http.postHttpMethod(this.commonUrl + 'GetAddressHistoryByAccountId', obj, userEvents);
  }

  //Add customer ful address
  createAddress(address: IAddressRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(address);
    return this.http.postHttpMethod(this.commonUrl + 'CreateAddress', obj, userEvents);
  }

  // Update customer address
  updateAddress(address: IAddressRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(address);
    return this.http.postHttpMethod(this.commonUrl + 'UpdateAddress', obj, userEvents);
  }

  // Update customer address
  deleteAddress(address: IAddressRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(address);
    return this.http.postHttpMethod(this.commonUrl + 'DeleteAddress', obj, userEvents);
  }

  //get customer Phone
  getAllPhonesByCustomerId(longCustomerId: number, userEvents?: IUserEvents) {
    return this.http.postHttpMethod(this.communication + 'GetAllPhonesByAccountId', longCustomerId, userEvents);
  }

  //Add customer Phone
  createPhone(phone: IPhoneRequest[], userEvent?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(phone);
    //let options = new RequestOptions({ headers: this.myheaders });
    return this.http.postHttpMethod(this.communication + 'CreatePhone', obj, userEvent);
  }

  //Update customer Phone
  updatePhone(phone: IPhoneRequest[], userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(phone);
    //let options = new RequestOptions({ headers: this.myheaders });
    return this.http.postHttpMethod(this.communication + 'UpdatePhone', obj, userEvents);
  }

  //Delete customer Phone
  deletePhone(phone: IPhoneRequest, userEvent?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(phone);
    //let options = new RequestOptions({ headers: this.myheaders });
    return this.http.postHttpMethod(this.communication + 'DeletePhone', obj, userEvent);
  }
  //Verify customer Phone
  verifyPhone(phone: ISMSRequest, userEvents?: IUserEvents): Observable<number> {
    let obj = JSON.stringify(phone);
    //let options = new RequestOptions({ headers: this.myheaders });
    return this.http.postHttpMethod(this.communication + 'GenerateOTPPassword', obj, userEvents);
  }

  verifyOTP(otpRequest: any, userEvents?: IUserEvents): Observable<number> {
    let obj = JSON.stringify(otpRequest);
    //let options = new RequestOptions({ headers: this.myheaders });
    return this.http.postHttpMethod(this.communication + 'VerifyOTP', obj, userEvents);
  }

  //Phone History Details
  getPhoneHistoryByAccountId(phoneRequest: IPhoneRequest, userEvents?: IUserEvents): Observable<IPhoneResponse[]> {
    let obj = JSON.stringify(phoneRequest);
    return this.http.postHttpMethod(this.communication + 'GetPhonesHistoryByAccountId', obj, userEvents);
  }
  //create customer email
  createEmail(emailRequest: IEmailRequest[], userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.communication + 'CreateEmail', JSON.stringify(emailRequest), userEvents);
  }

  updateEmail(emailRequest: IEmailRequest[], userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.communication + 'UpdateEmail', JSON.stringify(emailRequest), userEvents);
  }

  getAllEmails(longCustomerId: number, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.communication + 'GetAllEmail', JSON.stringify(longCustomerId), userEvents);
  }

  deleteEmail(emailRequest: IEmailRequest, userEvents?: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.communication + 'DeleteEmail', JSON.stringify(emailRequest), userEvents);
  }

  //Phone History Details
  getEmailHistoryByAccountId(emailRequest: IEmailRequest, userEvents?: IUserEvents): Observable<IEmailResponse[]> {
    let obj = JSON.stringify(emailRequest);
    return this.http.postHttpMethod(this.communication + 'GetEmailsHistoryByAccountId', obj, userEvents);
  }

  getStatementCycle(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getStatementCycle');
  }

  getStatementDelivery(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getStatementDelivery');
  }

  getTransponderPurchasemethod(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getTransponderPurchasemethod');
  }

  getCustomerUserTypesLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetCustomerUserTypesLookups');
  }

  getAccountCategoriesLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetAccountCategoriesLookups');
  }

  getTitleLookups(userEvents?: IUserEvents): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetTitleLookups', userEvents);
  }

  getSuffixLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetSuffixLookups');
  }

  getGenderLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetGenderLookups');
  }

  getIndividualIDProofLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetIndividualIDProofLookups');
  }

  getBusinessIDProofLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetBusinessIDProofLookups');
  }

  getIndividualAddressProofLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetIndividualAddressProofLookups');
  }

  getBusinessAddressProofLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetBusinessAddressProofLookups');
  }

  getTransponderPurchaseMethod() {
    return this.http.getHttpWithoutParams(this.commonUrl + 'TransponderPurchaseMethod');
  }


  getProfileByCustomerId(customerId: number): Observable<ICustomerProfileResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetProfileByCustomerId', "customerId", customerId.toString());
  }

  getBaseDetailsByCustomerId(customerId: number): Observable<ICustomerResponse> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetBaseDetailsByCustomerId', "customerId", customerId.toString());
  }

  getPlanByCustomerId(customerId: number): Observable<IPlanResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetPlanByCustomerId', "customerId", customerId.toString());
  }

  getLoginDetailsByCustomerId(customerId: number): Observable<ICustomerSecurityResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetLoginDetailsByCustomerId', "customerId", customerId.toString());
  }


  getLoginDetail(customerId: number): Observable<IUserresponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetLoginInfo', "longAccountId", customerId.toString());
  }

  getAllEmailsByCustomerId(customerId: number): Observable<IEmailResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetAllEmailsByCustomerId', "customerId", customerId.toString());
  }

  getVehicledetailsByCustomerId(customerId: number): Observable<IVehicleResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetVehicledetailsByCustomerId', "customerId", customerId.toString());
  }

  getCustomerAttributesByCustomerId(customerId: number): Observable<ICustomerAttributeResponse> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetCustomerAttributesByCustomerId', "customerId", customerId.toString());
  }

  getTagRequestByCustomerId(customerId: number): Observable<ITagResponse[]> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetTagRequestByCustomerId', "customerId", customerId.toString());
  }

  getBusinessCustomerDetails(customerId: number): Observable<string> {
    return this.http.getHttpWithParams(this.commonUrl + 'GetBusinessCustomerDetails', "customerId", customerId.toString());
  }

  getInvoiveCycleTypes(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetInvoiceCycleType');
  }

  getAllPlansWithFees(): Observable<IPlanResponse[]> {
    return this.http.getHttpWithoutParams(this.customerUrl + 'GetAllPlansWithFees/');
  }

  getCustomerCreateAccountProcessInfo(customerid: number): Observable<ITagsAmountrequest[]> {
    var obj = JSON.stringify(customerid);
    return this.http.postHttpMethod(this.customerUrl + 'GetCreateAccountProcessInformation', obj);
  }

  csrRelationCheck(csrRelationsRequest: ICSRRelationsRequest): Observable<boolean[]> {
    var data = { 'objCSRRelationsRequest': csrRelationsRequest }
    return this.http.postHttpMethod(this.commonUrl + 'CsrRelationCheck', JSON.stringify(data));
  }

  getDocumentPaths(key: ApplicationParameterkey, parentLookupTypeCode: LookupTypeCodes, lookupTypeCode: LookupTypeCodes, userEvents?: IUserEvents): Observable<string> {
    var data: any = { 'strApplicationParameter': ApplicationParameterkey[key], 'strParentLookupTypeCode': LookupTypeCodes[parentLookupTypeCode], 'strLookupTypeCode': LookupTypeCodes[lookupTypeCode] };
    return this.http.postHttpMethod(this.commonUrl + 'GetDocumentPaths', data, userEvents);
  }

  getAboutHearLookups(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetAboutHearLookups');
  }

  getLanguagePref(lookupCode: ICommon): Observable<ICommonResponse[]> {
    let obj = JSON.stringify(lookupCode);
    let myParams = new URLSearchParams();
    return this.http.getHttpWithParams(this.commonUrl + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj);
  }

  getStatementDeliveryOption(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetSatementDeliveryOption');
  }


  verifyInternalUserAcces(csrRelation: ICSRRelationsRequest): Observable<boolean> {
    return this.http.postHttpMethod(this.commonUrl + 'VerifyInternalUserAcces', JSON.stringify(csrRelation));
  }

  getTollTypesLookups(userEvents?: IUserEvents): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetTollTypesLookups', userEvents);
  }

  getProblemTypeLookups(): Observable<[any]> {
    return this.http.getHttpWithoutParams(this.helpdeskUrl + 'GetProblemTypeLookups');
  }

  getLookUpByParentLookupTypeCode(lookuptypecode: ICommonResponse, userEvents?: IUserEvents): Observable<ICommonResponse[]> {
    let obj = JSON.stringify(lookuptypecode);
    return this.http.getHttpWithParams(this.commonUrl + 'GetLookUpByParentLookupTypeCode', "lookupTypecode", obj, userEvents);
  }

  create(objReqComplaints: ICreatecomplaintrequest): Observable<[string]> {
    let cmpReq = JSON.stringify(objReqComplaints);
    return this.http.postHttpMethod(this.helpdeskUrl + 'CreateComplaint', cmpReq);
  }

  uploadFile(formData: FormData): Observable<any> {
    return this.http.postHttpMethodwithoutOptions(this.helpdeskUrl + 'UploadFile', formData);
  }

  deleteFile(strDbFilePath: string): Observable<[boolean]> {
    let filePath = strDbFilePath;
    return this.http.deleteHttpMethodWithParams(this.helpdeskUrl + 'DeleteFile', 'strDbFilePath', filePath);
  }

  advancedSearchCustomer(objReqCustomerSearch: ISearchCustomerRequest): Observable<IProfileResponse[]> {
    let obj = JSON.stringify(objReqCustomerSearch);
    return this.http.postHttpMethod(this.helpdeskUrl + 'AdvancedSearchCustomer', obj);
  }

  getApplicationParameterMinMaxValuesByParameterKey(parameterKey: string): Observable<any> {
    let obj = JSON.stringify(parameterKey);
    return this.http.postHttpMethod(this.commonUrl + 'GetApplicationParameterMinMaxValuesByParameterKey', obj);
  }
  checkBlockListByAccountId(longAccountId: number): Observable<IBlocklistresponse[]> {
    let obj = JSON.stringify(longAccountId);
    return this.http.postHttpMethod(this.commonUrl + 'CheckBlockListByAccountId', longAccountId);
  }
  getInvoiceStatusLookups(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetInvoiceStatusLookups');
  }

  getPaymentModes(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getPaymentModes');
  }
  getCorrespondenceActionType(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getCorrespondenceActionType');
  }

  getAddressTypes(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getAddressTypes');
  }
  getCorrespondenceTypes(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'getCorrespondenceTypes');
  }

  isExistBlockList(blocklistRequest): Observable<IBlocklistresponse[]> {
    let obj = JSON.stringify(blocklistRequest);
    return this.http.postHttpMethod(this.commonUrl + 'IsExistBlockList', obj);
  }
  //IAddressResponse string addressType, string customerId

  getAddressByTypeCustomer(addressType: string, customerId: string): Observable<IAddressResponse> {
    var data: any = { 'addressType': addressType, 'customerId': customerId };
    return this.http.postHttpMethod(this.commonUrl + 'GetAddressByTypeCustomer', JSON.stringify(data));
  }

  getAllPhonesByCustomerIdPhoneResponse(longCustomerId: number): Observable<IPhoneResponse[]> {
    return this.http.postHttpMethod(this.communication + 'GetAllPhonesByAccountId', longCustomerId);
  }

  getRoles(systemActivities: ISystemActivities, userEvents?: IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.commonUrl + 'GetRoles', JSON.stringify(systemActivities), userEvents);
  }

  getLocations(userEvents?: IUserEvents): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetLocations', userEvents);
  }

  getPlazaDropDown(locationCode: string): Observable<any> {
    var data = { 'locationCode': locationCode };
    return this.http.postHttpMethod(this.commonUrl + 'getPlazaDropDown', data);
  }

  getIntervalTimeLookups(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetIntervalTimeLookups');
  }
  getExternalBasePath(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetExternalBasePath');
  }

  checkPrivilegeswithAuditLog(userEvents: IUserEvents): Observable<boolean> {
    return this.http.postHttpMethod(this.commonUrl + 'CheckPrivilegeswithAuditLog', userEvents);
  }

  getPrivileges(roleId: number): Observable<any> {
    var data = { 'roleId': roleId };
    return this.http.postHttpMethod(this.commonUrl + 'GetPrivileges', data);
  }

  isAllowed(featureName: string, actionName: string, accountStatus: string): boolean {
    //debugger;
    let sessionContextResponse = this.sessionContext.customerContext;
    let isAllow: boolean = false;
    if (sessionContextResponse && sessionContextResponse.privileges) {
      let featureFiltered = sessionContextResponse.privileges.filter(x => x.Key.trim().toUpperCase() == featureName.toUpperCase())[0];
      if (featureFiltered && featureFiltered.Value) {
        let lstActionCSV: string[] = featureFiltered.Value.split(',');
        isAllow = lstActionCSV.indexOf(actionName.toUpperCase()) > -1;
        if (isAllow && accountStatus == AccountStatus[AccountStatus.CL]) {
          if (actionName.toUpperCase() == Actions[Actions.VIEW] || actionName.toUpperCase() == Actions[Actions.SEARCH] || actionName.toUpperCase() == Actions[Actions.HISTORY])
            isAllow = true;
          else
            isAllow = false;
        }
      }
    }
    return isAllow;
  }
  getApplicationParameterValueByParameterKey(strKey: string): Observable<any> {
    let obj = JSON.stringify(strKey);
    return this.http.getHttpWithParams(this.commonUrl + 'GetApplicationParameterValueByParameterKey', "strKey", strKey)
      ;
  }

  getCourtGroupStatus(userEvents?: IUserEvents): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetCourtGroupStatuses', userEvents);
  }

  getKYCKey(): Observable<boolean> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetKYCKey');
  }

}
