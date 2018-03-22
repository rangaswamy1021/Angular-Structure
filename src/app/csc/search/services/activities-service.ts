import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { HttpService } from '../../../shared/services/http.service';
import { IActivityRequest } from '../../../shared/models/activitesrequest';
import { IActivityResponse } from '../../../shared/models/activitiesresponse';
import { ICustomerActivitesRequest } from '../../customerdetails/models/customeractivitiesrequest';
import { IUserEvents } from "../../../shared/models/userevents";


@Injectable()
export class ActivityTypesService
{
constructor(private http: HttpService) {}
private commonTypeUrl = 'Common/';
private activityUrl= 'Activity/';
private myHeaders = new Headers({
'content-type':'application/json',
'Accept':'application/json'
})

getActivityTypes(objActivityReq: IActivityRequest, userEvents?: IUserEvents): Observable<IActivityResponse[]> {
    const obj = JSON.stringify(objActivityReq);
    //console.log(obj);
    return this.http.getHttpWithParams(this.commonTypeUrl + 'GetLookUpByParentLookupTypeCode', 'lookupTypecode', obj, userEvents) ;
  }

  getActivityTypesByTypeDescription(typeDescription: string): Observable<IActivityResponse[]> {
    const obj = JSON.stringify(typeDescription);
    //console.log(obj);
    return this.http.getHttpWithParams(this.activityUrl + 'GetActivitiesByTypeDesc', 'strActivityType', obj) ;
  }
createActivities(objActivityReq: IActivityRequest, userEvents?: IUserEvents): Observable<IActivityResponse[]> {
    const object = JSON.stringify(objActivityReq);
    //console.log(object);
    return this.http.postHttpMethod(this.commonTypeUrl + 'CreateActivities', object, userEvents) ;
  }

  createSpecialAlertActivities(objActivityReq: IActivityRequest, userEvents?: IUserEvents): Observable<IActivityResponse[]> {
    const obj = JSON.stringify(objActivityReq);
    //console.log(obj);
    return this.http.postHttpMethod(this.activityUrl + 'InsertSpecialAlert', obj, userEvents) ;
  }

  getActivityHistory(activityRequest: ICustomerActivitesRequest): Observable<string> {
        const obj = JSON.stringify(activityRequest);
        return this.http.postHttpMethod(this.activityUrl + 'GetRecentActivitiesPdf', obj) ;
    }



}
