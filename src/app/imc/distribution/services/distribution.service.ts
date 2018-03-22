import { ITagResponse } from './../../../shared/models/tagresponse';
import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/services/http.service";
import { Observable } from "rxjs/Observable";
import { ITagsDistributionRespone } from "../models/tagdistributionresponse";
import { IUserEvents } from "../../../shared/models/userevents";
import { ITagConfigurationResponse } from "../../../tags/models/tagsconfigurationresponse";
import { ITagsDistributionRequest } from "../models/tagdistributionrequest";
import { IOperationalLocationsRequest } from "../../../sac/usermanagement/models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../../../sac/usermanagement/models/operationallocationsresponse";

@Injectable()
export class DistributionService {
    constructor(private http: HttpService) { }
    private url = 'TagsDistribution/';
    private tagUrl = 'Tag/';
    private userManagementUrl = 'UserManagement/';

    getActiveTagConfigurations(): Observable<ITagConfigurationResponse[]> {
        return this.http.getHttpWithoutParams(this.tagUrl + 'GetAllActiveTagConfigurations');
    }

    getLocationRequests(tagRequest: ITagsDistributionRequest, userEvents?: IUserEvents): Observable<ITagsDistributionRespone[]> {
        return this.http.postHttpMethod(this.url + "GetLocationRequests", JSON.stringify(tagRequest), userEvents);
    }

    insertTagLocationRequest(objTagReq: ITagsDistributionRequest[], userEvents?: IUserEvents): Observable<boolean> {
        return this.http.postHttpMethod(this.url + "InsertTagLocationRequest", JSON.stringify(objTagReq), userEvents)
    }

    updateLocationsDistribution(objTagReq: ITagsDistributionRequest, userEvents?: IUserEvents): Observable<boolean> {
        return this.http.putHttpMethod(this.url + "UpdateLocationsDistribution", JSON.stringify(objTagReq), userEvents)
    }

    deleteTagLocationRequest(tagRequest: ITagsDistributionRequest, userEvents?: IUserEvents): Observable<boolean> {
        let obj = JSON.stringify(tagRequest);
        return this.http.deleteHttpMethodWithParams(this.url + 'DeleteTagLocationRequest', 'objTagRequest', obj, userEvents);
    }

    getTagDetailsByserialNumber(strSerialNumber: any): Observable<ITagResponse> {
        return this.http.postHttpMethod(this.tagUrl + 'GetTagDetailsByserialNumber', JSON.stringify(strSerialNumber));
    }

    getOperationalLocations(objRequestLocation: IOperationalLocationsRequest, userEvents?: IUserEvents): Observable<IOperationalLocationsResponse[]> {
        return this.http.postHttpMethod(this.userManagementUrl + 'GetOperationalLocations', objRequestLocation,userEvents);
    }

    getTagDistributionSerialNumbers(tagRequest: ITagsDistributionRequest): Observable<ITagsDistributionRespone[]> {
        return this.http.postHttpMethod(this.url + 'GetTagDistributionSerialNumbers', JSON.stringify(tagRequest));
    }
}