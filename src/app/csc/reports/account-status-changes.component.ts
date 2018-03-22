import { Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { AccountAdjustmentsComponent } from './../customerdetails/account-adjustments.component';
import { Component, OnInit } from '@angular/core';
import { CSCReportsService } from "./services/reports.service";
import { IPaging } from "../../shared/models/paging";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-account-status-changes',
  templateUrl: './account-status-changes.component.html',
  styleUrls: ['./account-status-changes.component.scss']
})
export class AccountStatusChangesComponent implements OnInit {
  gridArrowUPDATEDUSER: boolean;
  gridArrowUPDATEDDATE: boolean;
  gridArrowCREATEDDATE: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowACCOUNTSTATUSUPDATE: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  disableSearchButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  sessionContextResponse: IUserresponse;
  accountStatusChangeResponse: any;
  AccountId: number;
  searchResults: boolean = false;
  objPaging: IPaging;
  accountStatusForm: FormGroup;
  validatePattern =  "^[0-9]+$";

  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number;

  constructor(
    private CSCreportsService: CSCReportsService,
    private sessionContext: SessionService,
    private context: SessionService,
    private commonService: CommonService,
    private router: Router, 
    private materialscriptService:MaterialscriptService
  ) { }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;

  }


  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.gridArrowUPDATEDDATE = true;
    this.sortingColumn="UPDATEDDATE";
    this.endItemNumber = 10;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.accountStatusForm = new FormGroup({
      'account': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),

    });
    this.userEventRequest.FeatureName = Features[Features.ACCOUNTSTATUSCHANGES];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.commonService.checkPrivilegeswithAuditLog(this.userEventRequest).subscribe(res => {
    });

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.ACCOUNTSTATUSCHANGES], Actions[Actions.SEARCH], "");


  }
  getSearchResults() {
    if (!this.accountStatusForm.valid) {
      this.validateAllFormFields(this.accountStatusForm);
      return;
    }
    else {
      this.searchResults = true;
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.SEARCH];
      this.getAccountStatusDetails(true, userevents);
    }
  }

  resetSearchResults() {
    this.accountStatusChangeResponse = false;
    this.searchResults = false;
    this.accountStatusForm.reset();
  }

  getAccountStatusDetails(isSearch: boolean, userevents) {
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.objPaging = <IPaging>{};
    this.objPaging.PageNumber = 1;
    this.objPaging.PageSize = 10;
    this.objPaging.SortColumn = this.sortingColumn;
    this.objPaging.SortDir = this.sortingDirection == true ? 1 : 0;
    let accountStatusRequest: ICNReportsRequest = <ICNReportsRequest>{};
    accountStatusRequest.PageIndex = this.objPaging;
    this.AccountId = this.accountStatusForm.controls['account'].value;
    accountStatusRequest.LoginId = this.context.customerContext.userId;
    accountStatusRequest.LoggedUserID = this.context.customerContext.loginId;
    accountStatusRequest.LoggedUserName = this.context.customerContext.userName;
    accountStatusRequest.IsSearchEventFired = isSearch;
    accountStatusRequest.ActivitySource = ActivitySource.Internal.toString();
    this.CSCreportsService.GetAccountStatusDetails(this.AccountId, accountStatusRequest, userevents).subscribe(
      res => {
        console.log(res);
        this.accountStatusChangeResponse = res;
         this.totalRecordCount = this.accountStatusChangeResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      }
    )
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }


  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.ACCOUNTSTATUSCHANGES];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }


sortDirection(SortingColumn) {
    this.gridArrowACCOUNTSTATUSUPDATE = false;
    this.gridArrowCREATEDDATE = false;
    this.gridArrowUPDATEDDATE = false;
    this.gridArrowUPDATEDUSER = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "ACCOUNTSTATUSUPDATE") {
      this.gridArrowACCOUNTSTATUSUPDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "CREATEDDATE") {
      this.gridArrowCREATEDDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "UPDATEDDATE") {
      this.gridArrowUPDATEDDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "UPDATEDUSER") {
      this.gridArrowUPDATEDUSER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
   
    
  this.getAccountStatusDetails(true,null);
  }




}
