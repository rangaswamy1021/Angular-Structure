import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IViolatorSearchContextResponse } from "../models/violatorSearchContextresponse";

@Injectable()
export class ViolatorSearchContextService {

  violatorSearchContext: IViolatorSearchContextResponse;

  private contextSource = new BehaviorSubject<IViolatorSearchContextResponse>(this.violatorSearchContext);

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IViolatorSearchContextResponse) {
    this.contextSource.next(context);
  }
}