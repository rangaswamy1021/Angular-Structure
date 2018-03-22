import { AdjustmentCategory, ActivitySource, SubSystem, Features, Actions } from './../../shared/constants';
import { SessionService } from './../../shared/services/session.service';
import { LoginService } from './../../login/services/login.service';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IPaging } from './../../shared/models/paging';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";

@Component({
  selector: 'app-adjustment-requests',
  templateUrl: './adjustment-requests.component.html',
  styleUrls: ['./adjustment-requests.component.css']
})
export class AdjustmentRequestsComponent implements OnInit {
  sessionContextResponse: IUserresponse;
  disableApproveButton: boolean;
  disableRejectButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  objApprove: any;
  objReject: any;
  systemActivity: any;
  constructor(private objcustomerAccountService: CustomerAccountsService, public renderer: Renderer, private loginContext: SessionService, private router: Router, private commonService: CommonService) { }
  objAdjustmentRequest: any;
  objAdjustmentResponse: any[];
  p: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  icnId: number = 0;
  paging: IPaging;
  systemactivites: ISystemActivities;
  isApprove: boolean = false;
  isReject: boolean = false;
  @ViewChild('SuccessMessage') public SuccessMessage: ElementRef
  @ViewChild('FailureMessage') public FailureMessage: ElementRef

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
  }

  ngOnInit() {
    this.sessionContextResponse = this.loginContext.customerContext;
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableApproveButton = !this.commonService.isAllowed(Features[Features.ADJUSTMENTAPPROVALREQUEST], Actions[Actions.APPROVE], "");
    this.disableRejectButton = !this.commonService.isAllowed(Features[Features.ADJUSTMENTAPPROVALREQUEST], Actions[Actions.REJECT], "");
    this.getPendingAdjustments();
  }

  getPendingAdjustments() {
    this.objAdjustmentRequest = <any>{};
    this.objAdjustmentRequest.PageNumber = 1;
    this.objAdjustmentRequest.PageSize = 5;
    this.objAdjustmentRequest.SortColumn = "AdjustmentDate";
    this.objAdjustmentRequest.SortDir = 1;
    this.objAdjustmentRequest.ICNId = this.loginContext.customerContext.icnId;
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.IsViewed = true;
    this.systemActivity.IsSearch = true;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.ActivitySource = "Internal";
    this.objAdjustmentRequest.SystemActivity = this.systemActivity;
    this.objcustomerAccountService.getPendingAdjustments(this.objAdjustmentRequest).subscribe(
      res => {
        this.objAdjustmentResponse = res
      })
  }

  approvePopup(selectedRow) {
    this.isApprove = true;
    this.isReject = false;
    this.objApprove = selectedRow;
    this.msgType = "alert";
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to approve this request ?";
  }

  rejectPopup(selectedRow) {
    this.isApprove = false;
    this.isReject = true;
    this.objReject = selectedRow;
    this.msgType = "alert";
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to reject this request ?";
  }

  approvePendingAdjustments() {
    if (this.objAdjustmentRequest.ICNId > 0) {
      this.objAdjustmentRequest.CustomerId = this.objApprove.CustomerId;
      this.objAdjustmentRequest.AdjustmentCategory = this.objApprove.AdjustmentCategory;
      this.objAdjustmentRequest.Amount = this.objApprove.Amount;
      this.objAdjustmentRequest.DrCr_Flag = this.objApprove.DrCr_Flag;
      this.objAdjustmentRequest.IsApproved = "Approved";
      this.objAdjustmentRequest.TxnType = this.objApprove.TxnType;
      this.objAdjustmentRequest.Stmt_Literal = "ADJUSTMENT";
      this.objAdjustmentRequest.TxnTypeDesc = this.objApprove.TxnTypeDesc;
      this.objAdjustmentRequest.Description = this.objApprove.Description;
      this.objAdjustmentRequest.AdjustmentReason = this.objApprove.AdjustmentReason;
      this.objAdjustmentRequest.User = this.loginContext.customerContext.userName;
      this.objAdjustmentRequest.AccStatusCode = this.objApprove.AccountStatusCode;
      this.objAdjustmentRequest.AdjustmentDate = new Date();
      this.objAdjustmentRequest.AdjustmentCategoryId = this.objApprove.AdjustmentCategoryId;
      this.objAdjustmentRequest.AdjustmentLevelId = 1;
      this.objAdjustmentRequest.ICNId = this.loginContext.customerContext.icnId;
      this.objAdjustmentRequest.LoginId = this.loginContext.customerContext.loginId;
      this.objAdjustmentRequest.UserId = this.loginContext.customerContext.userId;
      this.objAdjustmentRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.objAdjustmentRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objAdjustmentRequest.systemActivity = this.systemActivity.SubSystem;
      let userEvents: IUserEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.APPROVE];
      this.userEventsCalling(userEvents);
      this.objcustomerAccountService.approvePendingAdjustment(this.objAdjustmentRequest, userEvents).subscribe(res => {
        if (res) {
          this.successMessageBlock("Adjustment has been approved successfully.");
          this.getPendingAdjustments();
          this.isApprove = false;
          this.isReject = false;
        }
      }, err => {
        this.errorMessageBlock(err.statusText.toString());
      })
    }
    else {
      this.errorMessageBlock("ICN is not assigned to do transactions.");
    }
  }

  rejectPendingAdjustments() {
    if (this.objAdjustmentRequest.ICNId > 0) {
      this.objAdjustmentRequest.CustomerId = this.objReject.CustomerId;
      this.objAdjustmentRequest.AdjustmentCategory = this.objReject.AdjustmentCategory;
      this.objAdjustmentRequest.Amount = this.objReject.Amount;
      this.objAdjustmentRequest.DrCr_Flag = this.objReject.DrCr_Flag;
      this.objAdjustmentRequest.IsApproved = "Rejected";
      this.objAdjustmentRequest.TxnType = this.objReject.TxnType;
      this.objAdjustmentRequest.Stmt_Literal = "ADJUSTMENT";
      this.objAdjustmentRequest.TxnTypeDesc = this.objReject.TxnTypeDesc;
      this.objAdjustmentRequest.Description = this.objReject.Description;
      this.objAdjustmentRequest.AdjustmentReason = this.objReject.AdjustmentReason;
      this.objAdjustmentRequest.User = this.loginContext.customerContext.userName;
      this.objAdjustmentRequest.AccStatusCode = this.objReject.AccountStatusCode;
      this.objAdjustmentRequest.AdjustmentDate = new Date();
      this.objAdjustmentRequest.AdjustmentCategoryId = this.objReject.AdjustmentCategoryId;
      this.objAdjustmentRequest.AdjustmentLevelId = 1;
      this.objAdjustmentRequest.ICNId = this.loginContext.customerContext.icnId;
      this.objAdjustmentRequest.LoginId = this.loginContext.customerContext.loginId;
      this.objAdjustmentRequest.UserId = this.loginContext.customerContext.userId;
      this.objAdjustmentRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.objAdjustmentRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objAdjustmentRequest.systemActivity = this.systemActivity.SubSystem;
      let userEvents: IUserEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.REJECT];
      this.userEventsCalling(userEvents);
      this.objcustomerAccountService.rejectPendingAdjustment(this.objAdjustmentRequest, userEvents).subscribe(res => {
        if (res) {
          this.successMessageBlock("Adjustment has been rejected successfully.");
          this.getPendingAdjustments();
          this.isApprove = false;
          this.isReject = false;
        }
      },
        err => {
          this.errorMessageBlock(err.statusText.toString());
        });
    }
    else {
      this.errorMessageBlock("ICN is not assigned to do transactions.");
    }
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.ADJUSTMENTAPPROVALREQUEST];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }

  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }

  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }

  userAction(event) {
    if (event) {
      if (this.isApprove) {
        this.approvePendingAdjustments();
      }
      else if (this.isReject) {
        this.rejectPendingAdjustments();
      }
    }
    else {
      this.msgFlag = false;
    }
  }
}


