import { ITollScheduleResponse } from './../models/tollschedulesresponse';
import { ITollScheduleRequest } from './../models/tollschedulesrequest';
import { HttpService } from './../../../shared/services/http.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ITollRatesResponse } from '../models/tollratesresponse';
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class TollScheduleService {
    constructor(private baseService: HttpService) {
    }

    private _tollsUrl = 'Tolls/';
    getTransactionTypes() {
        return this.baseService.getHttpWithoutParams(this._tollsUrl + 'GetTransactionTypes') ;
    }
    getAllPlazas() {
        return this.baseService.getHttpWithoutParams(this._tollsUrl + 'GetAllPlazas') ;
    }
    getTollScheduleTypesLookups() {
        return this.baseService.getHttpWithoutParams(this._tollsUrl + 'GetTollScheduleTypesLookups') ;
    }
    //  getLaneDetailsByLaneType(tollObj) {
    getTollScheduleHolidays() {
        return this.baseService.getHttpWithoutParams(this._tollsUrl + 'GetTollScheduleHolidays') ;
    }

    getLaneDetailsByLaneType(laneType, laneDir, plazaCode) {
        let tollObj = {
            laneType: laneType,
            laneDirection: laneDir,
            plazaCode: plazaCode
        }
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetLaneDetailsByLaneType', obj) ;
    }

    getTollSchedules(tollObj, userEvents?: IUserEvents) {
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollSchedules', obj, userEvents) ;
    }

    getTollSchHdrIDbyDetails(tollObj: ITollScheduleRequest): Observable<ITollScheduleResponse[]> {
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollSchHdrIDbyDetails', obj) ;
    }
    getTollScheduleByHdrId(tollId: number): Observable<ITollScheduleResponse[]> {
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollScheduleByHdrId', tollId) ;
    }

    getTollRateDetailsByScheduleId(tollObj: ITollScheduleRequest, userEvents?: IUserEvents): Observable<any> {
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollRateDetailsByScheduleId', obj, userEvents) ;
    }

    createTollSchedule(tollObj: ITollScheduleRequest[], userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'CreateTollSchedule', obj, userEvents) ;
    }
    getTollScheduleHolidaysbyYear(year: number): Observable<ITollRatesResponse[]> {

        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollScheduleHolidaysbyYear', year) ;
    }
    deleteTollSchedule(tollObj: ITollScheduleRequest[], userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(tollObj);
        return this.baseService.postHttpMethod(this._tollsUrl + 'DeleteTollSchedule', obj, userEvents ) ;
    }

    timeRangeInterval(interval: number): Observable<string[]> {
        return this.baseService.postHttpMethod(this._tollsUrl + 'TimeRangeInterval', interval) ;
    }

    getTollRatesbyLaneTypeTransaction(laneType: string, transactionMethod: string): Observable<ITollRatesResponse[]> {
        let obj = { 'laneType': laneType, 'transactionMethod': transactionMethod };
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollRatesbyLaneTypeTransaction', obj) ;
    }

    getTollRatesById(tollRateId: number): Observable<ITollRatesResponse> {
        return this.baseService.postHttpMethod(this._tollsUrl + 'GetTollRatesById', tollRateId) ;
    }



}