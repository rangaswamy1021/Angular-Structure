import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpService } from "../../../shared/services/http.service";
import { ITagConfigurationRequest } from "../models/tags-configurationsrequest";
import { ITagConfigurationResponse } from "../models/tags-configurationsresponse";
import { IConfigurationRequest } from "../models/configurationsrequest";
import { IConfigurationResponse } from "../models/configurationsresponse";
import { IPaymentPlanConfigRequest } from "../models/paymentplanconfigrequest";
import { IPaymentPlanConfigResponse } from "../models/paymentplanconfigresponse";
import { IDocumenttextRequest } from '../models/documenttextrequest';
import { IDocumenttextResponse } from '../models/documenttextresponse';
import { IHelpdeskmanagerdetailsRequest } from '../models/helpdeskmanagerdetailsrequest';
import { IHelpdeskmanagerdetailsResponse } from '../models/helpdeskmanagerdetailsresponse';
import { IComplaintturnaroundtimeRequest } from '../models/complaintturnaroundtimerequest';
import { IComplaintturnaroundtimeResponse } from '../models/complaintturnaroundtimeresponse';
import { IUserEvents } from "../../../shared/models/userevents";
import { ILowBalanceandThresholdAmountsRequest } from '../models/lowbalanceandthresholdamountsrequest';
import { ILoadBalanceTypes } from "../models/LoadBalanceTypes";


@Injectable()
export class ConfigurationService {

  Tags: ITagConfigurationResponse;

  constructor(private http: HttpService, private _http: Http) { }
  private commonUrl = 'common/';
  private _planUrl = 'Tags/';
  private conFigUrl = 'Configuration/';
  private customerUrl = '/CustomerAccounts/';
  private myheaders = new Headers({
    'content-type': 'application/json',
    'Accept': 'application/json'
  });

  SearchTagConfigs(objTagConfig: ITagConfigurationRequest, userEvents?: IUserEvents): Observable<ITagConfigurationResponse[]> {
    let obj = JSON.stringify(objTagConfig);
    return this.http.getHttpWithParams(this._planUrl + 'SearchTagConfigs', "objTagConfig", obj, userEvents);
  }
  UpdateTagConfigurations(tag: ITagConfigurationRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(tag);
    return this.http.putHttpMethod(this._planUrl + 'UpdateTagConfigurations', obj, userEvents);
  }

  GetAllConfigurations(ConfigRequest: any, userEvents: IUserEvents): Observable<any> {
    let obj = JSON.stringify(ConfigRequest);
    return this.http.postHttpMethod(this.conFigUrl + 'GetAllConfigurations', obj, userEvents);
  }
  //general configurations edit popup start
  updateApplicationParameterKey(objType: IConfigurationRequest[], userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateApplicationParameterKey', obj, userEvents);
  }
  //general configurations edit popup end
  //getting notifications
  getDefaultNotification(): Observable<any> {
    return this.http.getHttpWithoutParams(this.commonUrl + 'GetDefaultNotification');
  }
  SetValue(tag: ITagConfigurationResponse) {
    this.Tags = tag;
  }

  getvalue(): ITagConfigurationResponse {
    return this.Tags;
  }
  //payment plan configuration strat
  isExistsPaymentPlan(objType: IPaymentPlanConfigRequest, userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'IsExistsPaymentPlan', obj, userEvents);
  }
  insertPaymentPlanMasterData(objType: IPaymentPlanConfigRequest): Observable<number> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'InsertPaymentPlanMasterData', obj);
  }
  updatePaymentPlanMasterData(objType: IPaymentPlanConfigRequest, userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdatePaymentPlanMasterData', obj, userEvents);
  }
  getPaymentPlanMasterData(objType: IPaymentPlanConfigRequest, userEvents: IUserEvents): Observable<IPaymentPlanConfigResponse[]> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'GetPaymentPlanMasterData', obj, userEvents);
  }

  //payment plan configuration end

  //Include message to invoice start

  GetDocumentTextDetails(objDocText: IDocumenttextRequest, userEvents?: IUserEvents): Observable<IDocumenttextResponse[]> {
    let obj = JSON.stringify(objDocText);
    return this.http.postHttpMethod(this.conFigUrl + 'GetDocumentTextDetails', obj, userEvents);
  }

  CreateDocumentText(objdocText: IDocumenttextRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objdocText);
    return this.http.postHttpMethod(this.conFigUrl + 'CreateDocumentText', obj, userEvents);
  }

  UpdateDocumentText(objReqDocumentText: IDocumenttextRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objReqDocumentText);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateDocumentText', obj, userEvents);
  }

  DeleteDocumentText(objReqDocumentText: IDocumenttextRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objReqDocumentText);
    return this.http.postHttpMethod(this.conFigUrl + 'DeleteDocumentText', obj, userEvents);
  }

  //Include message to invoice end

  //Complaint turn around time start

  GetComplaintTurnAroundTimes(objTurnAroundTime: IComplaintturnaroundtimeRequest, userEvents?: IUserEvents): Observable<IComplaintturnaroundtimeResponse[]> {
    let obj = JSON.stringify(objTurnAroundTime);
    return this.http.postHttpMethod(this.conFigUrl + 'GetComplaintTurnAroundTimes', obj, userEvents);
  }

  GetComplaintTurnAroundTimesById(objTurnAround: IComplaintturnaroundtimeRequest, userEvents?: IUserEvents): Observable<IComplaintturnaroundtimeResponse[]> {
    let obj = JSON.stringify(objTurnAround);
    return this.http.postHttpMethod(this.conFigUrl + 'GetComplaintTurnAroundTimesById', obj, userEvents);
  }

  UpdateComplaintTurnAroundTimesById(objReqTimes: IComplaintturnaroundtimeRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objReqTimes);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateComplaintTurnAroundTimesById', obj, userEvents);
  }

  //Complaint turn around time end

  //Helpdesk manager email settings start
  BindManagerDetails(objDetails: IHelpdeskmanagerdetailsRequest, userEvents?: IUserEvents): Observable<IHelpdeskmanagerdetailsResponse[]> {
    let obj = JSON.stringify(objDetails);
    return this.http.postHttpMethod(this.conFigUrl + 'BindManagerDetails', obj, userEvents);
  }

  UpdateManagerDetailsById(objReq: IHelpdeskmanagerdetailsRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objReq);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateManagerDetailsById', obj, userEvents);
  }

  //Helpdesk manager email settings end


  getCustomerAccountStatus(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetCustomerAccountStatus');
  }

  createBulkEmailDetails(objBulkEmail: any, userEvent?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objBulkEmail);
    return this.http.postHttpMethod(this.conFigUrl + 'CreateBulkEmailDetails', obj, userEvent);
  }

  getBulkEmailDetails(objBulkEmail: any, userEvent?: IUserEvents): Observable<any[]> {
    let obj = JSON.stringify(objBulkEmail);
    return this.http.postHttpMethod(this.conFigUrl + 'GetBulkEmailDetails', obj, userEvent);
  }

  updateBulkEmailDetails(objBulkEmail: any, userEvent?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(objBulkEmail);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateBulkEmailDetails', obj, userEvent);
  }

  getCustomerPlans(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetCustomerPlans');
  }

  getReplanishmentTypes(): Observable<any[]> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetReplanishmentTypes');
  }

  GetLowBalanceandThresholdAmounts(): Observable<ILowBalanceandThresholdAmountsRequest[]> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetLowBalanceandThresholdAmounts');
  }

  UpdateLowBalandThresholdAmount(objType: ILowBalanceandThresholdAmountsRequest[]): Observable<boolean> {
    let obj = JSON.stringify(objType);
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateLowBalandThresholdAmounts', obj);
  }

  getTollTypes() {
    return this.http.getHttpWithoutParams(this.customerUrl + 'GetTollTypes/');
  }
  getLoadBalanceCriteria(userEvents?: IUserEvents): Observable<any> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetLoadBalCriteria', userEvents);
  }

  getLoadBalanceTypes(): Observable<ILoadBalanceTypes[]> {
    return this.http.getHttpWithoutParams(this.conFigUrl + 'GetLoadBalanceTypes');
  }

  createLoadBalanceTypes(objType, userEvents?: IUserEvents): Observable<number> {
    return this.http.postHttpMethod(this.conFigUrl + 'CreateLoadBalanceTypes', objType);
  }

  DeleteLoadBalanceTypes(loadBalTypeId): Observable<any> {
    return this.http.postHttpMethod(this.conFigUrl + 'DeleteLoadBalanceTypes', loadBalTypeId);
  }

  getAuditFeatures(objData: any,userEvent?:IUserEvents): Observable<any> {
    let obj = JSON.stringify(objData);
    return this.http.postHttpMethod(this.conFigUrl + 'GetAuditFeatures', obj,userEvent);
  }

  updateFeaturesList(objReq: any,userEvents?:IUserEvents): Observable<any> {
    return this.http.postHttpMethod(this.conFigUrl + 'UpdateFeaturesList', objReq,userEvents);
  }

}
