import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IAffidavitRequest } from "../models/affidavitrequest";

@Injectable()
export class DisputeContextService {
  disputeContext: IAffidavitRequest;
  private contextSource = new BehaviorSubject<IAffidavitRequest>(this.disputeContext);
  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IAffidavitRequest) {
    this.contextSource.next(context);
  }
}
