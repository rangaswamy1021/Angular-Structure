import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TagService } from "../../tags/services/tags.service";
import { ITagRequest } from "../../tags/models/tagrequest";
import { ITagResponse } from "../../shared/models/tagresponse";
import { TagRequestType } from "../../tags/constants";
import { ActivitySource, Actions, Features, defaultCulture } from "../../shared/constants";
import { Router } from "@angular/router";
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { ICSRRelationsRequest } from "../../shared/models/csrrelationsrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";

import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-customer-fulfillment',
  templateUrl: './customer-fulfillment.component.html',
  styleUrls: ['./customer-fulfillment.component.scss']
})
export class CustomerFulfillmentComponent implements OnInit {
  invalidDate: boolean;
  disableSelectBtn: boolean;
  allowSelect: boolean;
  disableCancelBtn: boolean;
  allowCancel: boolean;
  disableSearchButton: boolean;
  disableCancelLink: boolean;
  allowSearch: boolean;
  allowView: boolean;
  pageLoad: boolean = true;
  searchPage: boolean = false;
  cancelRequestResponse: boolean;
  cancelCustTagReqId: any;
  cancelCustomerId: any;
  custTagReqId: number;
  customerId: any;
  // isSuccess: boolean;
  // errorMessage: string;
  // isError: boolean;
  tagRequest: ITagRequest = <ITagRequest>{};
  tagResponse: ITagResponse[];
  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear() - 3);
  //startDate = this.todayDate;
  toDayDate: Date = new Date();
  // endDate = this.toDayDate;  
  startDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  endDate = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");


  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false
  };


  customerFulfillmentSearchForm: FormGroup;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  fulfillVisible: boolean = false;
  childObject: ITagResponse;
  index: number;
  // successMessage: string;
  timePeriod: any;
  total: number = 0;
  userEventRequest: IUserEvents = <IUserEvents>{};

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageChanged(event) {
    // this.successMessage = "";
    // this.errorMessage = "";
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.customerFulfillmentSearch("", this.p, null);
  }

  constructor(private _tagService: TagService,
    private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private router: Router, private sessionContext: SessionService, private commonService: CommonService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = 10;
    //searchform
    this.customerFulfillmentSearchForm = new FormGroup({
      'requestType': new FormControl(''),
      'timePeriod': new FormControl(''),
      'accountNumber': new FormControl(''),
    });
    //this.cusomerFullfillmentSearchData();
    // this.allowView = this.commonService.isAllowed(Features[Features.FULFILLMENT], Actions[Actions.VIEW], "");
    this.allowSearch = this.commonService.isAllowed(Features[Features.FULFILLMENT], Actions[Actions.SEARCH], "");
    this.allowCancel = this.commonService.isAllowed(Features[Features.FULFILLMENT], Actions[Actions.DELETE], "");
    this.allowSelect = this.commonService.isAllowed(Features[Features.FULFILLMENT], Actions[Actions.CUSTOMER], "");

    this.customerFulfillment();
    if (this.allowSearch) {
      //this.cusomerFullfillmentSearchData();
      this.disableSearchButton = false;
    }
    else {
      this.disableSearchButton = true;
    }

    if (this.allowCancel) {
      this.disableCancelBtn = false;
    }
    else {
      this.disableCancelBtn = true;
    }
    if (this.allowSelect) {
      this.disableSelectBtn = false;
    }
    else {
      this.disableSelectBtn = true;
    }

  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }

  changeStatus() {
    this.p = 1;
  }

  customerFulfillment() {
    this.searchPage = true;
    this.pageLoad = false;
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    let userevents = this.userEvents();
    this.customerFulfillmentSearch("VIEW", this.p, userevents);
  }

  cusomerFullfillmentSearchData() {
    this.fulfillVisible = false;
    this.searchPage = true;
    this.pageLoad = false;
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    let userevents = this.userEvents();
    userevents.ActionName = Actions[Actions.SEARCH];
    this.customerFulfillmentSearch("SEARCH", this.p, userevents);
  };

  //  search button click
  customerFulfillmentSearch(type: any, PageNumber: number, userevents: IUserEvents) {
    if (type == "VIEW") {
      const requestType = this.customerFulfillmentSearchForm.controls['requestType'].value;
      this.tagRequest.TagReqType = (requestType == "" || requestType == null) ? TagRequestType.All : requestType;
      this.tagRequest.CustomerId = 0;
      this.tagRequest.StartEffectiveDate = this.startDate;
      this.tagRequest.EndEffectiveDate = this.endDate;
    }
    if (type == "SEARCH") {
      const requestType = this.customerFulfillmentSearchForm.controls['requestType'].value;
      const accountNumber = this.customerFulfillmentSearchForm.controls['accountNumber'].value;
      this.tagRequest.TagReqType = (requestType == "" || requestType == null) ? TagRequestType.All : requestType;

      let strDate = this.customerFulfillmentSearchForm.controls['timePeriod'].value;
      if (strDate != "" && strDate != null) {
        let date = this.datePickerFormat.getFormattedDateRange(this.customerFulfillmentSearchForm.controls['timePeriod'].value)
        let fromDate = date[0];
        let toDate = date[1];
        let start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        let end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.tagRequest.StartEffectiveDate = start;
        this.tagRequest.EndEffectiveDate = end;


      }
      else {
        this.tagRequest.StartEffectiveDate = this.startDate;
        this.tagRequest.EndEffectiveDate = this.endDate;
      }

      if (accountNumber != "" && accountNumber != null) {
        this.tagRequest.CustomerId = accountNumber;
      }
      else {
        this.tagRequest.CustomerId = 0;
      }
    }
    this.tagRequest.PageNumber = this.p;
    this.tagRequest.PageSize = 10;
    this.tagRequest.SortColumn = "TAGREQDATE";
    this.tagRequest.SortDirection = true;
    this.tagRequest.IsPageLoad = this.pageLoad;
    this.tagRequest.IsSearch = this.searchPage;
    this.tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.tagRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.tagRequest.UserName = this.sessionContext.customerContext.userName;
    if (!(this.invalidDate)) {
      this._tagService.TagRequestSearch(this.tagRequest, userevents).subscribe(
        res => {
          if (res != null && res.length > 0) {
            this.tagResponse = res;
            this.total = 0;
            this.totalRecordCount = this.tagResponse[0].RecCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;

            }
            for (var itemTag in this.tagResponse) {
              this.tagResponse[itemTag].TagReqType = TagRequestType[this.tagResponse[itemTag].TagReqType];
              this.total += this.tagResponse[itemTag].ReqCount;
            }
          }
          else {
            this.tagResponse = res;
          }
        }
        , err => {
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          //this.errorMessage = err.statusText;
          return;
        }
      );
    }
    else {

    }


  }

  //Reset click
  customerFulfillmentReset() {
    this.fulfillVisible = false;
    this.customerFulfillmentSearchForm.reset();
    this.startItemNumber=1;
    this.endItemNumber=10;
    this.customerFulfillmentSearch("VIEW", this.p, null);
  }

  redirectPage(tagResponse) {
    this.childObject = tagResponse;
    this.customerId = tagResponse.CustomerId;
    this.fulfillVisible = true;
  }

  onFulfillClicked(message: string): void {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = message;
    this.msgTitle = '';
    this.cusomerFullfillmentSearchData();

  }
  onCancelClicked(status: boolean): void {
    this.fulfillVisible = status;
  }
  _keyPress(event: any) {
    const pattern = /[0-9][0-9]*/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  cancelRequest(tag, index) {
    //this.isError = false;
    //this.isSuccess = false;
    this.cancelCustomerId = tag.CustomerId;
    this.cancelCustTagReqId = tag.CustTagReqId;
    let internalUserVerify: ITagRequest = <ITagRequest>{};
    var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
    csrRelationReq.CustomerIds = tag.CustomerId;
    csrRelationReq.VehicleNumbers = "";
    csrRelationReq.TagIds = tag.SerialNumber;
    csrRelationReq.InternalUserId = this.sessionContext.customerContext.userId;
    this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
      this.cancelRequestResponse = res;
      if (res) {
        //$('#confirm-dialog').modal('hide');
        //this.isSuccess = false;
        //this.isError = true;
        //this.errorMessage = "Access Denied. You do not have privileges to access Serial Number " + csrRelationReq.TagIds;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Access Denied. You do not have privileges to access Serial Number " + csrRelationReq.TagIds;
        this.msgTitle = '';
        return true;
      }
      else {
        this.cancelCustomerId = tag.CustomerId;
        this.cancelCustTagReqId = tag.CustTagReqId;
        this.msgType = 'alert';
        this.msgFlag = true;
        this.msgDesc = "Are you sure you want to cancel?";
        this.msgTitle = '';
      }
    }, (error) => {
      //this.isError = true
      //this.errorMessage = error.statusText.toString();
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = error.statusText.toString();
      this.msgTitle = '';
    });
  }

  btnYesClick(event) {
    if (event) {
      this.tagRequest.CustTagReqId = this.cancelCustTagReqId;
      this.tagRequest.CustomerId = this.cancelCustomerId;
      this.tagRequest.UserId = this.sessionContext.customerContext.userId;
      this.tagRequest.LoginId = this.sessionContext.customerContext.loginId;
      this.tagRequest.UserName = this.sessionContext.customerContext.userName;
      this.tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.DELETE];
      this._tagService.removeTagRequest(this.tagRequest, userevents).subscribe(
        res => {
          if (res) {
            this.customerFulfillmentSearch("VIEW", this.p, null);
            // this.isSuccess = true;
            // this.successMessage = "Tag request cancelled successfully";
            this.fulfillVisible = false;
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Tag request cancelled successfully";
            this.msgTitle = '';
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Error Occured While Cancelling,Please Try Again";
            this.msgTitle = '';
          }
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.FULFILLMENT];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }


  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.customerFulfillmentSearchForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
  // onDateRangeChanged(event: IMyDateRangeModel) {
  // //console.log("event properties are:" + event.beginDate, event.endDate, event.formatted,
  // // event.beginEpoc, event.endEpoc)
  // }
}