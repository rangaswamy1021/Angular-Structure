import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IInvoicesContextResponse } from '../models/invoicescontextresponse';

@Injectable()
export class InvoicesContextService {

  invoicesContext: IInvoicesContextResponse;

  private contextSource = new BehaviorSubject<IInvoicesContextResponse>(this.invoicesContext);

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IInvoicesContextResponse) {
    this.contextSource.next(context);
  }
}
