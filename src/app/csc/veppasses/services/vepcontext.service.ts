import { IVepVehicleContextResponse } from './../models/vepvehiclescontext';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//import { ICustomerContextResponse } from '../models/customercontextresponse';

@Injectable()
export class VepContextService {

  customerContext: IVepVehicleContextResponse;

  private contextSource = new BehaviorSubject<IVepVehicleContextResponse>(this.customerContext); 

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IVepVehicleContextResponse) {
    this.contextSource.next(context)
  }

}