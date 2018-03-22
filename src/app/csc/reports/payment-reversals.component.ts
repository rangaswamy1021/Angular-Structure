import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { CSCReportsService } from "./services/reports.service";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivitySource, Actions, Features, defaultCulture } from "../../shared/constants";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
// import { MyDatePickerModule } from 'mydatepicker';
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';


@Component({
  selector: 'app-payment-reversals',
  templateUrl: './payment-reversals.component.html',
  styleUrls: ['./payment-reversals.component.scss']
})
export class PaymentReversalsComponent implements OnInit {
  gridArrowCHEQUENUMBER: boolean;
  gridArrowVOUCHERNUMBER: boolean;
  gridArrowBANKNAME: boolean;
  gridArrowPAYTYPE: boolean;
  gridArrowTRANSACTIONAMOUNT: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowCUSTOMERID: boolean;
  gridArrowTRANSACTIONDATE: boolean;
  gridArrowLOCATIONNAME: boolean;
  invalidDate: boolean;
  //toDayDate:Date =new Date();
  // myDatePickerOptions: IMyDpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };
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

  dateArray: any;
  setDate: any;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  disableSearchButton: boolean;
  userEventRequest: IUserEvents = <IUserEvents>{}


  noRecordsDisplay: boolean;
  gridShow: boolean;
  icnId: number;
  loginId: number;
  userName: string;
  ReportResponse: ICNReportResponse[];
  userId: number;
  icnid: any;
  paymentReversalForm: FormGroup;
  reportRequestSearch: ICNReportsRequest = <ICNReportsRequest>{};
  sessionContextResponse: IUserresponse;

  pageNumber: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  locationResponse: IManageUserResponse[];
  locationsRequest: IManageUserRequest;

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.generateReport("", this.pageNumber, null);
  }

  onlyNumberKey(event) {
    return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
  }

  constructor(private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private commonService: CommonService, private CSCReportService: CSCReportsService, private sessionContext: SessionService, private _routers: Router, private datePipe: DatePipe, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.gridArrowVOUCHERNUMBER = true;
    this.sortingColumn = "VOUCHERNUMBER";
    this.materialscriptService.material();
    this.pageNumber = 1;
    this.endItemNumber = 10;
    this.paymentReversalForm = new FormGroup({
      'icn': new FormControl('', Validators.compose([Validators.minLength(1), Validators.maxLength(50)])),
      'startDate': new FormControl(''),
      'location': new FormControl('')
    });

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._routers.navigate(link);
    }
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.PAYMENTREVERSALS], Actions[Actions.SEARCH], "");
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.icnId = this.sessionContextResponse.icnId;

    let userEvents = this.userEvents();
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

    },
      (err) => {

        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });

    this.getLocations();

  }
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.PAYMENTREVERSALS];
    this.userEventRequest.ActionName = Actions[Actions.SEARCH];
    this.userEventRequest.PageName = this._routers.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  reportGenration() {
    this.pageNumber = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;

    if (this.paymentReversalForm.invalid) {
      this.validateAllFormFields(this.paymentReversalForm);

    }
    else {
      let userevents = this.userEvents();
      this.generateReport("SEARCH", this.pageNumber, userevents);
    }
  }
  generateReport(type: any, pageNumber: number, userevents: IUserEvents) {
    if (type == "SEARCH") {
      if (this.paymentReversalForm.controls['icn'].value != "" && this.paymentReversalForm.controls['icn'].value != null) {
        this.reportRequestSearch.ICNId = this.paymentReversalForm.controls['icn'].value;
      }
      else{
        this.reportRequestSearch.ICNId=0;
      }
      // this.reportRequestSearch.ICNId = this.paymentReversalForm.controls['icn'].value != "" || this.paymentReversalForm.controls['icn'].value != null ? this.paymentReversalForm.controls['icn'].value : 0;
      this.icnid = this.paymentReversalForm.controls['icn'].value;
      this.reportRequestSearch.UserId = this.userId;
      this.reportRequestSearch.User = this.userName;
      this.reportRequestSearch.LocationName = this.paymentReversalForm.controls['location'].value;
      if (this.paymentReversalForm.controls['startDate'].value == null || this.paymentReversalForm.controls['startDate'].value == "") {
        let todayDate = new Date();
        this.setDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.reportRequestSearch.PostingDate = this.setDate;

        this.reportRequestSearch.IsOptional = true;
      }
      else {
        let startDate = this.paymentReversalForm.controls['startDate'].value;
        let date = this.datePickerFormat.getFormattedDate(startDate.date);
        // obj.StartEffectiveDate = dateArray[0];
        // obj.EndEffectiveDate = dateArray[1];
        //  let strdate=this.paymentReversalForm.controls['startDate'].value
        // if(dateArray.getFullYear() <= 1970)
        // {

        //    this.msgType = 'error';
        //     this.msgFlag = true;
        //     this.msgDesc = "Enter valid Posting Date";
        //     this.msgTitle = '';
        //     this. onResetClick();
        //   return;
        // }
        this.reportRequestSearch.IsOptional = false;
        this.setDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.reportRequestSearch.PostingDate = this.setDate;


        // this.reportRequestSearch.PostingDate = this.paymentReversalForm.controls['startDate'].value;
      }
    }

    this.reportRequestSearch.PageNumber = this.pageNumber;
    this.reportRequestSearch.PageSize = 10;
    this.reportRequestSearch.SortColumn = this.sortingColumn;
    this.reportRequestSearch.SortDirection = this.sortingDirection == true ? 1 : 0;
    this.reportRequestSearch.UserId = this.userId;
    this.reportRequestSearch.LoginId = this.loginId
    this.reportRequestSearch.SearchFlag = true;
    this.reportRequestSearch.ActivitySource = ActivitySource[ActivitySource.Internal];
    if (!this.invalidDate)
      this.CSCReportService.GetPaymentReversalReports(this.reportRequestSearch, userevents).subscribe(
        res => {
          this.ReportResponse = res;
          if (this.ReportResponse.length > 0) {
            this.gridShow = true;
            this.totalRecordCount = this.ReportResponse[0].RecCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
          else {
            this.noRecordsDisplay = true;
            this.gridShow = false;
          }

        },
        (err) => {

          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
        }
      );
    // this.gridShow = false;
    // this.noRecordsDisplay = true;

  }
  onResetClick() {
    this.gridShow = false;
    this.noRecordsDisplay = false;
    this.startItemNumber = 1;
    this.endItemNumber = 10;

    //this.paymentReversalForm.controls['icn'].value.focus();
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
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.paymentReversalForm.controls["startDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  getLocations() {
    this.locationsRequest = <IManageUserRequest>{};
    this.locationsRequest.LocationCode = '';
    this.locationsRequest.LocationName = '';
    this.locationsRequest.SortColumn = 'LOCATIONCODE';
    this.locationsRequest.SortDir = 1;
    this.locationsRequest.PageNumber = 1;
    this.locationsRequest.PageSize = 100;
    this.CSCReportService.getLocations(this.locationsRequest).subscribe(res => {
      this.locationResponse = res;
      console.log(this.locationResponse)
    })
  }

  sortDirection(SortingColumn) {
    this.gridArrowCUSTOMERID = false;
    this.gridArrowTRANSACTIONAMOUNT = false;
    this.gridArrowPAYTYPE = false;
    this.gridArrowBANKNAME = false;
    this.gridArrowVOUCHERNUMBER = false;
    this.gridArrowCHEQUENUMBER = false;
    this.gridArrowTRANSACTIONDATE = false;
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

    else if (this.sortingColumn == "TRANSACTIONAMOUNT") {
      this.gridArrowTRANSACTIONAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "PAYTYPE") {
      this.gridArrowPAYTYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "BANKNAME") {
      this.gridArrowBANKNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "VOUCHERNUMBER") {
      this.gridArrowVOUCHERNUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "CHEQUENUMBER") {
      this.gridArrowCHEQUENUMBER = true;
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

    this.generateReport("", this.pageNumber, null);
  }


}
