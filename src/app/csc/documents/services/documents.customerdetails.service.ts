import { IdocumentCustomerDetailsResponse } from './../models/documentcustomerdetails';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
@Injectable()
export class DocumentCustomerdetailsService {
    documentCustomerDetailsRes:IdocumentCustomerDetailsResponse;
    private documentCustomerDetailsSource=new BehaviorSubject<IdocumentCustomerDetailsResponse>(this.documentCustomerDetailsRes)
    currentDetails=this.documentCustomerDetailsSource.asObservable();

    constructor(){}

changedDetails(newDetails:IdocumentCustomerDetailsResponse){
this.documentCustomerDetailsSource.next(newDetails)
}
}