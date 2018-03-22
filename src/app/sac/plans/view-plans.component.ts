import { IPlanResponse } from './models/plansresponse';
import { IPlanRequest } from './models/plansrequest';
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { IPaging } from './../../shared/models/paging';
import { Component, OnInit } from '@angular/core';
import { PlansService } from './services/plans.service';
import { Router } from '@angular/router';
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { SessionService } from "../../shared/services/session.service";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-view-plans',
  templateUrl: './view-plans.component.html',
  styleUrls: ['./view-plans.component.css']
})
export class ViewPlansComponent implements OnInit {
  // variable declaration
  getPlanRequest: IPlanRequest;
  getPlanResponse: IPlanResponse[];
  paging: IPaging;
  p: number;
  pageItemNumber: number = 10;
  //dataLength: number = this.getBlockListResp.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    let userevnts = null;
    this.getPlans(this.p, userevnts);
  }

  constructor(private planService: PlansService, private router: Router,
    private commonService: CommonService, private Context: SessionService, private materialscriptService: MaterialscriptService) { }

  // to get the plans available in the system
  getPlans(pageNumber: number, userEvent: IUserEvents): void {
    this.getPlanRequest = <IPlanRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = 10;
    this.paging.SortColumn = "PARENT_PLANNAME";
    this.paging.SortDir = 0;
    this.getPlanRequest.Paging = this.paging;
    this.planService.getPlans(this.getPlanRequest, userEvent).subscribe(
      res => {
        this.getPlanResponse = res;
        this.totalRecordCount = this.getPlanResponse[0].Paging.ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';
        return;
      });
  }

  ngOnInit() {
    this.p = 1;
    this.endItemNumber = 10;
    this.disableButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.UPDATE], "");
    let userevnts = this.userEvents();
    this.getPlans(this.p, userevnts);
    this.materialscriptService.material();
  }

  // to go to plan creation page
  buttonclick() {
    this.router.navigateByUrl('/sac/plans/create-plans');
  }

  // to edit the plan details
  onSelect(planId: number) {
    this.router.navigate(['/sac/plans/update-plans', planId]);
   
 this.materialscriptService.material();
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.PLANS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.Context.customerContext.roleID);
    this.userEventRequest.UserName = this.Context.customerContext.userName;
    this.userEventRequest.LoginId = this.Context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
