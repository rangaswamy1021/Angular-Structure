import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ITripsContextResponse } from '../models/tripscontextresponse';

@Injectable()
export class TripsContextService {
  totalCount: any;
  pageIndex: any;
  searchData: any;
  searchResults: any;

  tripsContext: ITripsContextResponse;

  private contextSource = new BehaviorSubject<ITripsContextResponse>(this.tripsContext);

  currentContext = this.contextSource.asObservable();

  constructor() { }

  changeResponse(context: ITripsContextResponse) {
    this.contextSource.next(context);
  }

  saveRequest(searchInput, pageIndex, totalCount?) {
    this.searchData = searchInput;
    this.pageIndex = pageIndex
    this.totalCount = totalCount;
  }
}
