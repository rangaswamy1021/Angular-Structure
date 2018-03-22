import { IComplaintContextresponse } from './../models/complaintcontextresponse';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

@Injectable()
export class ComplaintContextService {

  complaintContext: IComplaintContextresponse;
  
    private contextSource = new BehaviorSubject<IComplaintContextresponse>(this.complaintContext);
  
    currentContext = this.contextSource.asObservable();
  
    constructor() { }
  
    changeResponse(context: IComplaintContextresponse) {
      this.contextSource.next(context);
    }

}
