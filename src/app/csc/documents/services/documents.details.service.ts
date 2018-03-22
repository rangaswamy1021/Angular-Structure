import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { IdocumentDetailsResponse } from "../models/documentdetails";
@Injectable()
export class DocumentdetailsService {
    documentDetails:IdocumentDetailsResponse;
    private documentDetailsSource=new BehaviorSubject<IdocumentDetailsResponse>(this.documentDetails)
    currentDetails=this.documentDetailsSource.asObservable();

    constructor(){}

changedDetails(newDetails:IdocumentDetailsResponse){
this.documentDetailsSource.next(newDetails)
}
}