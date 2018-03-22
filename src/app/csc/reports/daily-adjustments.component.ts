import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { CSCReportsService } from "./services/reports.service";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyOptions, IMyDpOptions, IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';



@Component({
  selector: 'app-daily-adjustments',
  templateUrl: './daily-adjustments.component.html',
  styleUrls: ['./daily-adjustments.component.scss']
})
export class DailyAdjustmentsComponent implements OnInit {
  gridArrowTRANSACTIONDATE: boolean;
  gridArrowAMOUNT: boolean;
  gridArrowTXNTYPE: boolean;
  gridArrowLINKID: boolean;
  sortingColumn: any;
  sortingDirection: boolean;
  gridArrowCUSTOMERID: boolean;
  gridArrowLOCATIONNAME: boolean;
  LocationName: any;
  invalidDate: boolean;
  setDate: string;
  allowSearch: boolean;
  disableSearchButton: boolean;
  allowView: boolean;
  dailyAdjustments: boolean;
  totalRecordCount: number;
  endItemNumber: number;
  pageItemNumber: number = 10;
  p: number;
  startItemNumber: number = 1;
  // postingDate: any;
  icnNumber: any;
  userEventRequest: IUserEvents = <IUserEvents>{};
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false

  };

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  locationResponse: IManageUserResponse[];
    locationsRequest: IManageUserRequest;


  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.generateReportSearch("", this.p, null);
  }

  constructor(private _reportService: CSCReportsService, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private router: Router, private commonService: CommonService, private sessionContext: SessionService, private materialscriptService:MaterialscriptService) { }

  generateReportSearchForm: FormGroup;
  dailyRequest: ICNReportsRequest = <ICNReportsRequest>{};
  dailyResponse: ICNReportResponse[];


  ngOnInit() {
    this.gridArrowCUSTOMERID = true;
    this.sortingColumn = "CUSTOMERID";
    this.materialscriptService.material();
    this.generateReportSearchForm = new FormGroup({
      'icnNumber': new FormControl(''),
      'postingDate': new FormControl('', ),
      'location': new FormControl('')
    });


    let userevents = this.userEvents();
    this.commonService.checkPrivilegeswithAuditLog(userevents).subscribe(res => {
    });
    
    this.allowSearch = !this.commonService.isAllowed(Features[Features.DAILYADJUSTMENTS], Actions[Actions.SEARCH], "");

    this.getLocations();

  }


  //search click

  generateReport() {
    if (this.generateReportSearchForm.valid && !(this.invalidDate)) {
      this.p = 1;
      this.endItemNumber = 10;
      this.startItemNumber = 1;
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.SEARCH];
      this.generateReportSearch("SEARCH", this.p, userevents);
    }
    else {
      this.validateAllFormFields(this.generateReportSearchForm);
    }
  }



  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.DAILYADJUSTMENTS];  //logging out
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  //event for allowing only numbers in textbox
  _keyPress(event: any) {
    const pattern = /[0-9][0-9 ]*/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      event.preventDefault();
    }
  }


  generateReportSearch(type: any, pageNumber: number, userevents: IUserEvents) {

    if (type == "SEARCH") {
      this.dailyAdjustments = true;
      // this.icnNumber = this.generateReportSearchForm.controls["icnNumber"].value;
      // this.dailyRequest.ICNId = this.icnNumber;
      if (this.generateReportSearchForm.controls['icnNumber'].value != "" && this.generateReportSearchForm.controls['icnNumber'].value != null) {
        this.dailyRequest.ICNId = this.generateReportSearchForm.controls['icnNumber'].value;
      }
      else{
        this.dailyRequest.ICNId=0;
      }
      this.LocationName = this.generateReportSearchForm.controls["location"].value;
      this.dailyRequest.LocationName = this.LocationName;

      let postingDate = this.generateReportSearchForm.controls["postingDate"].value;
      if (postingDate != "" && postingDate != null) {
        let date = this.datePickerFormat.getFormattedDate(postingDate.date);
        this.setDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.dailyRequest.PostingDate = this.setDate;
      }
      else {
        this.dailyRequest.PostingDate = null;
      }
    }
    this.dailyRequest.IsOptional = false;
    this.dailyRequest.UserId = this.sessionContext.customerContext.userId;
    this.dailyRequest.User = this.sessionContext.customerContext.userName;
    this.dailyRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.dailyRequest.SearchFlag = true;
    this.dailyRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.dailyRequest.SortColumn = this.sortingColumn;
    this.dailyRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    this.dailyRequest.PageNumber = this.p;
    this.dailyRequest.PageSize = 10;
    this._reportService.GetPaymentAdjustmentsReports(this.dailyRequest, userevents).subscribe(
      res => {
        if (res != null && res.length > 0) {
          this.dailyResponse = res;
          this.totalRecordCount = this.dailyResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }

        else {
          this.dailyResponse = res;
        }
      },
      err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = '';

        return;
      }

    );

  }

  generateReportReset() {
    this.generateReportSearchForm.reset();
    this.dailyAdjustments = false;
    this.generateReportSearchForm.patchValue({ location: "" });
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

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateFieldChanged(event: IMyInputFieldChanged) {
    let date = this.generateReportSearchForm.controls["postingDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  getLocations(){
    this.locationsRequest=<IManageUserRequest>{};
    this.locationsRequest.LocationCode='';
    this.locationsRequest.LocationName='';
    this.locationsRequest.SortColumn='LOCATIONCODE';
    this.locationsRequest.SortDir=1;
    this.locationsRequest.PageNumber=1;
    this.locationsRequest.PageSize=100;
    this._reportService.getLocations(this.locationsRequest).subscribe(res=>{
        this.locationResponse=res;
        console.log(this.locationResponse)
    })
}

sortDirection(SortingColumn) {
  this.gridArrowCUSTOMERID = false;
  this.gridArrowLINKID = false;
  this.gridArrowAMOUNT = false;
  this.gridArrowTXNTYPE = false;
  this.gridArrowCUSTOMERID = false;
  this.gridArrowLOCATIONNAME = false;


  this.sortingColumn = SortingColumn;
  if (this.sortingColumn == "CUSTOMERID") {
    this.gridArrowCUSTOMERID = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }

  else if (this.sortingColumn == "LINKID") {
    this.gridArrowLINKID = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }

  else if (this.sortingColumn == "AMOUNT") {
    this.gridArrowAMOUNT = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }
  else if (this.sortingColumn == "TXNTYPE") {
    this.gridArrowTXNTYPE = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }
  else if (this.sortingColumn == "TRANSACTIONDATE") {
    this.gridArrowTRANSACTIONDATE = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }
  else if (this.sortingColumn == "LOCATIONNAME") {
    this.gridArrowLOCATIONNAME = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }

  this.generateReportSearch("", this.p, null);
}

}

