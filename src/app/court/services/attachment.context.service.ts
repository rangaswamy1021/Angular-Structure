import { IAttachmentCourtResponse } from './../model/attachmentresponse';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class AttachmentContextService {

  attachmentCourtContext: IAttachmentCourtResponse[];

  private contextSource = new BehaviorSubject<IAttachmentCourtResponse[]>(this.attachmentCourtContext);

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: IAttachmentCourtResponse[]) {
    this.contextSource.next(context);
  }
}
