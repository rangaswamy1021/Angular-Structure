import { IOperationalLocationsRequest } from './../../sac/usermanagement/models/operationallocationsrequest';
import { TagTypes } from './../models/tagtypes';
import { IUserEvents } from './../../shared/models/userevents';
import { IVehicleRequest } from './../../vehicles/models/vehiclecrequest';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from '../../shared/services/http.service';
import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { ITagConfigurationResponse } from '../models/tagsconfigurationresponse';
import { ITagShipmentTypesResponse } from '../models/tagshipmentsresponse';
import { ICommon, IShipmentAdressResponse, ICommonResponse } from '../models/tagshipmentaddressresponse';
import { ITagRequest, IAssignTagRequest } from '../models/tagrequest';
import { ITagResponse } from '../../shared/models/tagresponse';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { IVehicleResponse } from "../../shared/models/vehicleresponse";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";

@Injectable()
export class TagService {
  constructor(private baseService: HttpService) { }
  private tagUrl = 'Tag/';
  private fulfillmenturl = 'fullfillment/';
  private commonUrl = 'common/';
  private customerDetailsUrl = 'CustomerDetails/';
  private userManagementUrl = 'UserManagement/';

  getActiveTagConfigurations(userEvents?: IUserEvents): Observable<ITagConfigurationResponse[]> {
    return this.baseService.getHttpWithoutParams(this.tagUrl + 'GetAllActiveTagConfigurations', userEvents);
  }

  getShipmentServiceTypes(): Observable<ITagShipmentTypesResponse[]> {
    return this.baseService.getHttpWithoutParams(this.tagUrl + 'GetShipmentServiceTypes');
  }

  getRequestedTagsByAccountId(tagRequest: ITagRequest): Observable<ITagResponse[]> {
    let obj = JSON.stringify(tagRequest);
    return this.baseService.postHttpMethod(this.tagUrl + 'GetRequestedTagsByAccountId', obj);
  }

  getTagsByAccountId(strAccountId: string, tagRequest: ITagRequest): Observable<ITagResponse[]> {
    var data: any = { 'strAccountId': strAccountId, 'objTagRequest': tagRequest };
    return this.baseService.postHttpMethod(this.tagUrl + 'GetTagsByAccountId', data);
  }

  removeTagRequestFromQueue(tagRequest: ITagRequest, userEvents?: IUserEvents): Observable<boolean> {
    let obj = JSON.stringify(tagRequest);
    return this.baseService.deleteHttpMethodWithParams(this.tagUrl + 'RemoveTagRequestFromQueue', 'objTagRequest', obj, userEvents);
  }

  getAccountDetailsById(strAccountId: any): Observable<ICustomerResponse> {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetAccountDetailsById', JSON.stringify(strAccountId));
  }

  getTagDetailsByserialNumber(strSerialNumber: any): Observable<ITagResponse> {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetTagDetailsByserialNumber', JSON.stringify(strSerialNumber));
  }

  tagRequestInqueue(tagAssignrequest: ITagRequest[], userEvents?: IUserEvents): Observable<boolean> {
    return this.baseService.postHttpMethod(this.tagUrl + 'TagRequestInsert', JSON.stringify(tagAssignrequest), userEvents);
  }

  updateTagAliasandStatus(tagrequest: ITagRequest, userEvents?: IUserEvents): Observable<boolean> {
    let objTagRequest = JSON.stringify(tagrequest);
    return this.baseService.putHttpMethod(this.tagUrl + 'UpdateTagAliasandStatus', objTagRequest, userEvents);
  }

  getTagStatusbyMatrix(strTagStatus: any): Observable<ITagResponse[]> {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetTagStatusbyMatrix', JSON.stringify(strTagStatus));
  }

  checkInventoryforTagAssign(strTagCode: string, tagCount: string): Observable<boolean> {
    var data: any = { 'strTagCode': strTagCode, 'tagCount': tagCount };
    return this.baseService.postHttpMethod(this.tagUrl + 'CheckInventoryforTagAssign', data);
  }

  replaceTag(tagrequest: ITagRequest, userEvents?: IUserEvents): Observable<boolean> {
    let objTagRequestObject = JSON.stringify(tagrequest);
    return this.baseService.postHttpMethod(this.tagUrl + 'ReplaceTag', objTagRequestObject, userEvents);
  }

  assignTag(tagrequest: ITagRequest[], userEvents?: IUserEvents): Observable<boolean> {
    let objTagRequestObject = JSON.stringify(tagrequest);
    return this.baseService.postHttpMethod(this.tagUrl + 'AssignTags', objTagRequestObject, userEvents);
  }

  printCustomerAddress(strCustomerId: string, strFullAddress: string, strFullName: string): Observable<string> {
    var data: any = { 'strCustomerId': strCustomerId, 'strFullAddress': strFullAddress, 'strFullName': strFullName };
    return this.baseService.postHttpMethod(this.tagUrl + 'GeneratefulfillCustomerAddressPDF', data);
  }

  getSerialNumByTagTypeAndTagStatus(longCustomerId: number): Observable<IVehicleResponse[]> {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetSerialNumByTagTypeAndTagStatus', longCustomerId);
  }

  getVehiclesByAccountId(longCustomerId: number) {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetVehiclesByAccountIdAndTagId', longCustomerId);
  }

  getVehicleDetailsByTagId(strTagSerialNum: any) {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetVehicleDetailsByTagId', JSON.stringify(strTagSerialNum));
  }

  updateVehicleTagIdByVehicleId(vehicleRequest: IVehicleRequest, userEvents?: IUserEvents): Observable<boolean> {

    return this.baseService.putHttpMethod(this.tagUrl + 'UpdateVehicleTagIdByVehicleID', vehicleRequest, userEvents);
  }

  bindCustomerInfoDetails(longCustomerId: number): Observable<ICustomerResponse> {
    return this.baseService.postHttpMethod(this.customerDetailsUrl + 'BindCustomerInfoDetails', JSON.stringify(longCustomerId));
  }

  bindCustomerAssocDetails(longCustomerId: number, tag): Observable<IVehicleResponse[]> {
    var obj = { 'strAccountId': longCustomerId, 'objTagRequest': tag }
    return this.baseService.postHttpMethod(this.tagUrl + 'GetAssociatedTagVehicles', JSON.stringify(obj));
  }

  TagRequestSearch(objTagRequest: ITagRequest, userevents?: IUserEvents) {
    return this.baseService.postHttpMethod(this.fulfillmenturl + 'TagRequestSearch', objTagRequest, userevents);
  }
  removeTagRequest(objTagRequest: ITagRequest, userevents?: IUserEvents) {
    return this.baseService.postHttpMethod(this.fulfillmenturl + 'RemoveTagRequestFromRequestQueue', objTagRequest, userevents);
  }

  getTagSerialNumbersbyLocationId(objTagRequestObject: ITagRequest): Observable<ITagResponse[]> {
    return this.baseService.postHttpMethod(this.tagUrl + 'GetTagSerialNumbersbyLocationId', objTagRequestObject);
  }
  getTagTypesConfiguration(): Observable<TagTypes> {
    return this.baseService.getHttpWithoutParams(this.tagUrl + 'GetTagTypesConfiguration');
  }

  getAssignedTagsbyCustomerId(strAccountId: string, tagRequest: ITagRequest, userEvents?: IUserEvents): Observable<ITagResponse[]> {
    var data: any = { 'strAccountId': strAccountId, 'objTagRequest': tagRequest };
    return this.baseService.postHttpMethod(this.tagUrl + 'GetAssignedTagsbyCustomerId', data, userEvents);
  }

  deactivateAssociation(strAccountId: string): Observable<boolean> {
    var data: any = { 'strAccountId': strAccountId };
    return this.baseService.postHttpMethod(this.tagUrl + 'DeactivateAssociation', data);
  }

  GetActiveAssocCountBySerialNo(strSerialNo: string): Observable<number> {
    var data: any = { 'strSerialNo': strSerialNo };
    return this.baseService.postHttpMethod(this.tagUrl + 'GetActiveAssocCountBySerialNo', data);
  }

  updateIsNonRevenueForTags(strCustTagId: string, strNonRevenue: string, strUpdatedUser: string, userEvents?: IUserEvents): Observable<boolean> {
    var data: any = { 'strCustTagId': strCustTagId, 'strNonRevenue': strNonRevenue, 'strUpdatedUser': strUpdatedUser };
    return this.baseService.putHttpMethod(this.tagUrl + 'UpdateIsNonRevenueForTags', data, userEvents);
  }

  getOperationalLocations(objRequestLocation: IOperationalLocationsRequest, userEvents?: IUserEvents): Observable<IOperationalLocationsResponse[]> {
    return this.baseService.postHttpMethod(this.userManagementUrl + 'GetOperationalLocations', objRequestLocation, userEvents);
  }
} 