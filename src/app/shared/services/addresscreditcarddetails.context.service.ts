import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IAddressResponse } from "../models/addressresponse";
// import { IAddressResponse } from '../models/addresscreditcardresponse';

@Injectable()
export class AddressCreditcardService {
    addressCreditcardContext: IAddressResponse;

    private contextSource = new BehaviorSubject<IAddressResponse>(this.addressCreditcardContext);

    currentContext = this.contextSource.asObservable();

    constructor() { }

    changeResponse(context: IAddressResponse) {
        this.contextSource.next(context);
    }
}