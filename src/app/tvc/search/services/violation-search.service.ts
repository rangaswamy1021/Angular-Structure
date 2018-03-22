import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpService } from "../../../shared/services/http.service";
import { IViolatorSearchRequest } from "../models/violatorsearchrequest";
import { IViolatorSearchResponse } from "../models/violatorsearchresponse";
import { IUserEvents } from "../../../shared/models/userevents";

@Injectable()
export class ViolationSearchService {
  private violationSearchUrl = 'ViolatorDetails/';

  constructor(private http: HttpService) { }

  getViolatorsBySearchRequest(violatorSearchRequest: IViolatorSearchRequest, userEvents?: IUserEvents): Observable<IViolatorSearchResponse[]> {
    return this.http.postHttpMethod(this.violationSearchUrl + 'SearchViolator', JSON.stringify(violatorSearchRequest), userEvents);
  }
}
