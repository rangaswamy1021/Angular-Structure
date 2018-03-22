import { Component, OnInit } from '@angular/core';
import { ViolatordetailsService } from './services/violatordetails.service';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from '../../shared/services/common.service';

import { MaterialscriptService } from "../../shared/materialscript.service";



@Component({
  selector: 'app-view-correspondence',
  templateUrl: './view-correspondence.component.html',
  styleUrls: ['./view-correspondence.component.scss']
})
export class ViewCorrespondenceComponent implements OnInit {

   violatorContextResponse: IViolatorContextResponse;
  tripContextResponse: ITripsContextResponse;
  accountId: number;
  citationId: number;
  tripsSearchRequest: any;
  tripResponse: any[];
  sessionConstextResponse: IUserresponse;
  constructor(private vioService: ViolatordetailsService, private materialscriptService: MaterialscriptService, private tripContextService: TripsContextService, private sessionContext: SessionService, private violatorContext: ViolatorContextService, private router: Router,private commonService: CommonService) { }

  ngOnInit() {
    
 this.materialscriptService.material();
    this.tripContextService.currentContext.subscribe(tripContext => this.tripContextResponse = tripContext);
    if (this.tripContextResponse != null) {
      this.citationId = this.tripContextResponse.tripIDs[0];
    }
    this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
    if (this.violatorContextResponse != null) {
      this.accountId = this.violatorContextResponse.accountId;

    }
    this.sessionConstextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CORREPONDENCEHISTORY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

    });
    this.bindCorrespondenceHistory();

  }

  bindCorrespondenceHistory() {

    this.tripsSearchRequest = <any>{};
    this.tripsSearchRequest.ViolatorId = this.accountId;
    this.tripsSearchRequest.CitationId = this.citationId;
    this.tripsSearchRequest.UserId = this.sessionConstextResponse.userId;
    this.tripsSearchRequest.LoginId = this.sessionConstextResponse.loginId;
    this.tripsSearchRequest.UserName = this.sessionConstextResponse.userName;
    this.vioService.getCorrespondenceHistory(this.tripsSearchRequest).subscribe(res => {

      this.tripResponse = res;

    },
      err => {
      },
      () => {
        if (this.tripResponse.length) {
          console.log('correspondence history details');
        }

      }
    );

  }
   backClick() {
     let link = ['tvc/violatordetails/violation-trip-history'];
    this.router.navigate(link);

  }

}
