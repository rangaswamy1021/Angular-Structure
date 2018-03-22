import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IViolatorContextResponse } from "../models/violatorcontextresponse";

@Injectable()
export class ViolatorContextService {

  violatorContext: IViolatorContextResponse;

  private contextSource = new BehaviorSubject<IViolatorContextResponse>(this.violatorContext);

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IViolatorContextResponse) {
    this.contextSource.next(context);
  }
}