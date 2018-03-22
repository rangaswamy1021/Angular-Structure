import { IUserEvents } from './../../../shared/models/userevents';
import { IFeeRequest } from './../models/feerequest';
import { IFeeResponse } from './../models/feeresponse';
import { IDiscountResponse } from './../models/discountresponse';
import { ITollTypes } from './../models/tolltypesresponse';
import { IinvoiceResponse } from './../models/invoicecycleresponse';
import { IStatementResponse } from './../models/statementcycleresponse';
import { IPlanResponse } from './../models/plansresponse';
import { IPlanRequest } from './../models/plansrequest';
import { async } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { IFeeTypesResponse } from "../../fees/models/feetypes.response";
import { IFeeTypesRequest } from "../../fees/models/feetypes.request";
import { HttpService } from "../../../shared/services/http.service";
import { IShipmentTypesRequest } from '../models/shipmenttypesrequest';
import { IShipmentservicetypesresponse } from '../models/shipmenttypesresponse';


@Injectable()
export class PlansService {

  constructor(private http: HttpService, _http: Http) { }
  private _planUrl = 'Plans/';
  private shipmentTypeURL = 'ShipmentServiceTypes/';
  private myheaders = new Headers({
    'content-type': 'application/json',
    'Accept': 'application/json'
  });

  getPlans(objPlansReq: IPlanRequest, userEvents: IUserEvents): Observable<IPlanResponse[]> {
    let obj = JSON.stringify(objPlansReq);
    return this.http.getHttpWithParams(this._planUrl + 'GetPlans', "objPlansReq", obj, userEvents);
  }

  getApplicationParameterValueByParameterKey(strKey: string): Observable<any> {
    return this.http.getHttpWithParams(this._planUrl + 'GetApplicationParameterValueByParameterKey', "strKey", strKey);
  }

  getStatementCycleTypes(): Observable<IStatementResponse[]> {
    return this.http.getHttpWithoutParams(this._planUrl + 'GetStatementCycleTypes');
  }

  getInvoiveCycleTypes(): Observable<IinvoiceResponse[]> {
    return this.http.getHttpWithoutParams(this._planUrl + 'GetInvoiceCycleType');
  }

  getTollTypes(objenum: string): Observable<ITollTypes[]> {
    return this.http.getHttpWithParams(this._planUrl + 'GetTollTypes', "objenum", objenum);
  }

  getActiveFeeTypes(planId: string): Observable<IFeeTypesResponse[]> {
    return this.http.getHttpWithParams(this._planUrl + 'GetActiveFeeTypes', "intPlanId", planId);
  }

  createPlan(plan: IPlanRequest, userEvents: IUserEvents): Observable<number> {
    let obj = JSON.stringify(plan);
    return this.http.postHttpMethod(this._planUrl + 'CreatePlan', obj, userEvents);
  }

  createPlanFeeAssociation(plan: IPlanRequest, userEvents: IUserEvents) {
    let obj = JSON.stringify(plan);
    return this.http.postHttpMethod(this._planUrl + 'CreateFeeAssociation', obj, userEvents);
  }

  getPlanByPK(planId: string): Observable<IPlanResponse> {
    return this.http.getHttpWithParams(this._planUrl + 'GetPlanByPK', "intPlanId", planId);
  }

  updatePlan(planRequest: IPlanRequest, userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(planRequest);
    return this.http.putHttpMethod(this._planUrl + 'UpdatePlan', obj, userEvents);
  }

  getEndDate(): Observable<number> {
    return this.http.getHttpWithoutParams(this._planUrl + 'GetEndDate');
  }

  getActiveDiscountsByDate(planId: string): Observable<IDiscountResponse[]> {
    return this.http.getHttpWithParams(this._planUrl + 'GetActiveDiscountsByDate', "intPlanId", planId);
  }

  getPlanDiscountsByPlanId(planId: string): Observable<IDiscountResponse[]> {
    return this.http.getHttpWithParams(this._planUrl + 'GetPlanDiscountsByPlanId', "intPlanId", planId);
  }

  getPlanFeesByPlanId(planId: string): Observable<IFeeRequest[]> {
    return this.http.getHttpWithParams(this._planUrl + 'getPlanFeesByPlanId', "intPlanId", planId);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  createPlanDiscountAssociation(plan: IPlanRequest, userEvents: IUserEvents) {
    let obj = JSON.stringify(plan);
    return this.http.postHttpMethod(this._planUrl + 'CreatePlanDiscountAssociation', obj, userEvents);
  }

  updatePlanFeeAssociation(planRequest: IPlanRequest, userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(planRequest);
    return this.http.putHttpMethod(this._planUrl + 'UpdatePlanFeeAssociation', obj, userEvents);
  }

  updatePlanDiscountAssociation(planRequest: IPlanRequest, userEvents: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(planRequest);
    return this.http.putHttpMethod(this._planUrl + 'UpdatePlanDiscountAssociation', obj, userEvents);
  }

  isPlanAssociatedToCustomer(planCode: string): Observable<boolean> {
    return this.http.getHttpWithParams(this._planUrl + 'isPlanAssociatedToCustomer', "planCode", planCode);
  }

  getShipmentServiceTypes(shipmentTypesRequest: IShipmentTypesRequest, userEvent: IUserEvents): Observable<IShipmentservicetypesresponse[]> {
    let obj = JSON.stringify(shipmentTypesRequest);
    return this.http.postHttpMethod(this.shipmentTypeURL + 'BindShipmentServiceTypes', obj, userEvent);
  }

  createShipmentServiceType(shipmentTypesRequest: IShipmentTypesRequest, userEvent: IUserEvents): Observable<IShipmentservicetypesresponse[]> {
    let obj = JSON.stringify(shipmentTypesRequest);
    return this.http.postHttpMethod(this.shipmentTypeURL + 'CreateServiceType', obj, userEvent);
  }

  updateShipmentServiceTypes(shipmentTypesRequest: IShipmentTypesRequest, userEvent: IUserEvents): Observable<IShipmentservicetypesresponse[]> {
    let obj = JSON.stringify(shipmentTypesRequest);
    return this.http.postHttpMethod(this.shipmentTypeURL + 'UpdateServiceType', obj, userEvent);
  }

  getShipmentTypeById(shipmentTypesRequest: IShipmentTypesRequest): Observable<IShipmentservicetypesresponse[]> {
    let obj = JSON.stringify(shipmentTypesRequest);
    return this.http.postHttpMethod(this.shipmentTypeURL + 'GetShipmentTypeById', obj);
  }

}
