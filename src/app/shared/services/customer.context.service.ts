import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ICustomerContextResponse } from "../models/customercontextresponse";
//import { ICustomerContextResponse } from '../models/customercontextresponse';

@Injectable()
export class CustomerContextService {

  customerContext: ICustomerContextResponse;

  private contextSource = new BehaviorSubject<ICustomerContextResponse>(this.customerContext); 

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: ICustomerContextResponse) {
    this.contextSource.next(context)
  }

}