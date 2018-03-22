import { IdocumentMessageResponse } from './../models/documentmessageresponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
@Injectable()
export class DocumentMessageService {
    documentMessageRes:IdocumentMessageResponse;
    private documentMessageSource=new BehaviorSubject<IdocumentMessageResponse>(this.documentMessageRes)
    currentDetails=this.documentMessageSource.asObservable();

    constructor(){}

changedDetails(newDetails:IdocumentMessageResponse){
this.documentMessageSource.next(newDetails)
}
}