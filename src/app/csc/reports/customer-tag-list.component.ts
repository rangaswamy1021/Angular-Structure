import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { CSCReportsService } from "./services/reports.service";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { DatePipe } from '@angular/common';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-customer-tag-list',
  templateUrl: './customer-tag-list.component.html',
  styleUrls: ['./customer-tag-list.component.scss']
})
export class CustomerTagListComponent implements OnInit {
  gridArrowTAGSTATUS: boolean;
  gridArrowTAGENDDATE: boolean;
  gridArrowTAGSTARTDATE: boolean;
  gridArrowTAGALIAS: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowSERIALNO: boolean;
  disableSearchButton: boolean;
  customerTagSearchForm: FormGroup;

  validNumberPattern ="[0-9][0-9]*"; //"^(0|[1-9][0-9]*)$";

  searchResultGrid: boolean;
  searchCheckNoRecords: boolean;

  sessionContextResponse: IUserresponse;
  customerTagListRequest: ICNReportsRequest = <ICNReportsRequest>{};
  customerTagListResponse: ICNReportResponse[];
  objSystemActivities: ISystemActivities;
  userEventRequest: IUserEvents = <IUserEvents>{};

  userName: string;

  userId: number;
  loginId: number;
  AccountId: number;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

   // success and error block
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;



  pageChanged(event) {

    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.customerTagSearchClick();
  }


  constructor(private sessionContext: SessionService, private commonService: CommonService, private router: Router, private reportServices: CSCReportsService, private datePipe: DatePipe, 
  private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sortingColumn='';
    this.endItemNumber = 10;
    this.customerTagSearchForm = new FormGroup({
      'account': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validNumberPattern)])),
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }


    this.disableSearchButton = !(this.commonService.isAllowed(Features[Features.CUSTOMERTAGLIST], Actions[Actions.SEARCH], ""));
    let userEvents = this.userEvents();
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

    });
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.CUSTOMERTAGLIST];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  customerTagResetClick() {
    this.searchResultGrid = false;
    this.searchCheckNoRecords = false;
    this.currentPage = 1;
    this.endItemNumber = 10;
    this.customerTagSearchForm.reset();
  }

  customerTagSearchClick() {
    if (this.customerTagSearchForm.invalid) {
      this.validateAllFormFields(this.customerTagSearchForm);
    }
    else {
      this.AccountId = this.customerTagSearchForm.controls["account"].value;
      this.customerTagListRequest.User = this.userName;
      this.customerTagListRequest.UserId = this.userId;
      this.customerTagListRequest.LoginId = this.loginId;
      this.customerTagListRequest.ActivitySource = ActivitySource.Internal.toString();
      this.customerTagListRequest.PageNumber = this.currentPage;
      this.customerTagListRequest.PageSize = this.pageItemNumber;
      this.customerTagListRequest.SortColumn = this.sortingColumn;
      this.customerTagListRequest.SortDirection = this.sortingDirection == true ? 1 : 0;;
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.SEARCH];
         $('#pageloader').modal('show')
         if(this.AccountId==0){
            this.searchResultGrid = false;
            this.searchCheckNoRecords = true;
               $('#pageloader').modal('hide')
         }
         else{
            this.reportServices.GetTagsbyAccountId(this.AccountId, this.customerTagListRequest, userEvents).subscribe(
        res => {
          this.customerTagListResponse = res;
          if (this.customerTagListResponse.length > 0) {
            this.searchResultGrid = true;
            this.searchCheckNoRecords = false;
             $('#pageloader').modal('hide')
               // console.log(res);
            this.totalRecordCount = this.customerTagListResponse[0].RecCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
          else {
            this.searchResultGrid = false;
            this.searchCheckNoRecords = true;
             $('#pageloader').modal('hide')}
        },
         (err) => {
              $('#pageloader').modal('hide')
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();;
            this.msgTitle = '';
          });
    }
  }  
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


 sortDirection(SortingColumn) {
    this.gridArrowSERIALNO = false;
    this.gridArrowTAGALIAS = false;
    this.gridArrowTAGSTARTDATE = false;
    this.gridArrowTAGENDDATE = false;
    this.gridArrowTAGSTATUS = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "SERIALNO") {
      this.gridArrowSERIALNO = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "TAGALIAS") {
      this.gridArrowTAGALIAS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "TAGSTARTDATE") {
      this.gridArrowTAGSTARTDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "TAGENDDATE") {
      this.gridArrowTAGENDDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "TAGSTATUS") {
      this.gridArrowTAGSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
this.customerTagSearchClick();
  }



}
