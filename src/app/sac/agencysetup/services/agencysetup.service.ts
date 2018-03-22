import { IAgencyResponse } from './../models/agencyresponse';
import { IAgencyRequest } from './../models/agencyrequest';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import { IPlazaRequest } from "../models/plazasrequest";
import { ILaneRequest } from "../models/lanerequest";
import { ILocationRequest } from '../models/locationrequest';
import { ILocationResponse } from '../models/locationresponse';
import { ICustomerRequest } from '../../../shared/models/customerrequest';
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class AgencySetupService {

    constructor(private http: HttpService) { }
    private agencysetupUrl = 'AgencySetup/';
    private commonUrl = 'Common/';
    private tollsUrl = 'Tolls/';
    GetLocation(objType: ILocationRequest, userEvents: IUserEvents): Observable<ILocationResponse[]> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetLocations', objType, userEvents);
    }

    CreateLocation(objRequestLocationList: ILocationRequest[], userEvents: IUserEvents): Observable<number> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'CreateLocation', JSON.stringify(objRequestLocationList), userEvents);
    }

    UpdateLocation(objRequestLocation: ILocationRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdateLocation', JSON.stringify(objRequestLocation), userEvents);
    }

    GetAgencies(userEvents?: IUserEvents) {
        return this.http.getHttpWithoutParams(this.agencysetupUrl + 'GetAgencies', userEvents);
    }

    GetLocations() {
        return this.http.getHttpWithoutParams(this.commonUrl + 'GetLocations');
    }

    GetTransactionTypes() {
        return this.http.getHttpWithoutParams(this.tollsUrl + 'GetTransactionTypes');
    }

    GetPlaza(objPlazas: IPlazaRequest): Observable<IPlazaRequest[]> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetPlaza', objPlazas);
    }

    GetPlazaById(plzId: number): Observable<IPlazaRequest> {
        var obj = JSON.stringify(plzId);
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetPlazaById', obj);
    }

    IsPlazaCodeExists(strPlazaCode: string): Observable<number> {
        var obj = JSON.stringify(strPlazaCode);
        return this.http.postHttpMethod(this.agencysetupUrl + 'IsPlazaCodeExists', obj);
    }

    CreatePlaza(objResponseLocationList: IPlazaRequest[], userEvents?: IUserEvents): Observable<number> {
        var obj = JSON.stringify(objResponseLocationList);
        return this.http.postHttpMethod(this.agencysetupUrl + 'CreatePlaza', obj, userEvents);
    }

    UpdatePlaza(objResponseLocation: IPlazaRequest, userEvents?: IUserEvents): Observable<boolean> {
        var obj = JSON.stringify(objResponseLocation);
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdatePlaza', obj, userEvents);
    }

    UpdatePlazaOtherInfo(objResponseLocation: IPlazaRequest, userEvents?: IUserEvents): Observable<boolean> {
        var obj = JSON.stringify(objResponseLocation);
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdatePlazaOtherInfo', obj, userEvents);
    }

    GetPriceModes(): Observable<any> {
        return this.http.getHttpWithoutParams(this.agencysetupUrl + 'GetPriceModes');
    }

    BindBankAccountTypes(): Observable<any> {
        return this.http.getHttpWithoutParams(this.agencysetupUrl + 'BindBankAccountTypes');
    }

    addAgency(objAgency: IAgencyRequest, objcustomer: ICustomerRequest, userEvents?: IUserEvents): Observable<number> {
        var obj = { 'objAgency': objAgency, 'objcustomer': objcustomer };
        return this.http.postHttpMethod(this.agencysetupUrl + 'AddAgency', obj, userEvents);
    }

    updateAgency(objAgency: IAgencyRequest, objcustomer: ICustomerRequest, userEvents?: IUserEvents): Observable<number> {
        var obj = { 'objAgency': objAgency, 'objcustomer': objcustomer };
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdateAgency', obj, userEvents);
    }

    deleteAgency(deleteAgencyReq: IAgencyRequest): Observable<number> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'DeleteAgency', JSON.stringify(deleteAgencyReq));
    }
    SearchAgency(searchAgencyReq: IAgencyRequest): Observable<IAgencyResponse[]> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetAgency', searchAgencyReq);
    }

    getAgencies(getAgenciesReq: IAgencyRequest, userEvents?: IUserEvents): Observable<IAgencyResponse[]> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetAgency', JSON.stringify(getAgenciesReq), userEvents);
    }

    activateAgency(activateReq: IAgencyRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdateActivate', JSON.stringify(activateReq), userEvents);
    }

    isUserNameExist(strUserName: string): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'IsUserNameExist', JSON.stringify(strUserName));
    }

    isEmailExist(strEmailAddress: string): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'IsEmailExist', JSON.stringify(strEmailAddress));
    }

    //check username availability
    checkAgencyCodeAvailablity(checkAgencyCode: string): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'CheckAgencyCodeAvailablity', JSON.stringify(checkAgencyCode));
    }

    getLanes(laneRequest: ILaneRequest, userEvents: IUserEvents): Observable<any[]> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetLanes', laneRequest, userEvents);
    }

    createLane(laneRequestArray: ILaneRequest[], userEvents: IUserEvents): Observable<number> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'CreateLane', laneRequestArray, userEvents);
    }

    updateLane(laneRequest: ILaneRequest, userEvents: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdateLane', laneRequest, userEvents);
    }

    getLaneById(laneId: number): Observable<any> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetLaneById', laneId);
    }

    //bank details
    updateAgencyOtherInfo(objType: IAgencyRequest, userEvents: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(objType);
        return this.http.postHttpMethod(this.agencysetupUrl + 'UpdateAgencyOtherInfo', obj, userEvents);
    }
    //getting bank details
    getAgencyBankDetails(longAgencyId: number, userEvents: IUserEvents): Observable<IAgencyResponse> {
        let obj = JSON.stringify(longAgencyId);
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetAgencyBankDetails', longAgencyId, userEvents);
    }
    //preview method
    getAgencyById(longAgencyId: number, userEvents?: IUserEvents): Observable<IAgencyResponse> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'GetAgencyById', JSON.stringify(longAgencyId), userEvents);
    }
    isUserExist(strUserName: string): Observable<boolean> {
        return this.http.postHttpMethod(this.agencysetupUrl + 'IsUserExist', JSON.stringify(strUserName));
    }
}
