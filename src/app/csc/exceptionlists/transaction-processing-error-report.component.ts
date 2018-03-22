import { IUserEvents } from './../../shared/models/userevents';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IExceptionListRequest } from './models/exceptionlistrequest';
import { ExceptionListService } from './services/exceptionlists.service';
import { Component, OnInit } from '@angular/core';
import { ITransactionProcessorErrorsRequest } from "./models/transactionprocessorerrorsrequest";
import { ITransactionProcessorErrorsResponse } from "./models/transactionprocessorerrorsresponse";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { SubSystem, ActivitySource, Features, Actions, defaultCulture } from '../../shared/constants';
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-transaction-processing-error-report',
  templateUrl: './transaction-processing-error-report.component.html',
  styleUrls: ['./transaction-processing-error-report.component.css']
})
export class TransactionProcessingErrorReportComponent implements OnInit {
  invalidDate:boolean;
  searchForm: FormGroup;
  exceptionRequest: ITransactionProcessorErrorsRequest = <ITransactionProcessorErrorsRequest>{};
  exceptionResponse: ITransactionProcessorErrorsResponse[];
  selectedErrorList: ITransactionProcessorErrorsResponse[] = <ITransactionProcessorErrorsResponse[]>[];
  AfterSearch: boolean;
  checkIndCheckBox: boolean;
  isParentSelected: boolean;
  failureMessage: string;
  successMessage: string;
  dateRange: any;
  sessionContextResponse: IUserresponse;
  disableButton: boolean = false;
  disableReprocessButton: boolean = false;
  todayDateRange = new Date();
  startDateRange = this.todayDateRange.setFullYear(this.todayDateRange.getFullYear());
  calOptions: ICalOptions = <ICalOptions>{};
  todayDate: Date = new Date();
  startDate = new Date(this.todayDateRange.getFullYear(), this.todayDateRange.getMonth(), this.todayDateRange.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  endDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  userEventRequest: IUserEvents = <IUserEvents>{};
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
 myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };
  constructor(private exceptionService: ExceptionListService, private datePickerFormat: DatePickerFormatService, private Context: SessionService,
    private commonService: CommonService, private router: Router, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.disableButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONERRORREPORT], Actions[Actions.VIEW], "");
    this.disableReprocessButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONERRORREPORT], Actions[Actions.REPROCESS], "");
    this.AfterSearch = false;
    this.searchForm = new FormGroup({
      date: new FormControl('', [Validators.required]),
      checkAll: new FormControl('', []),
      indCheckBox: new FormControl('', []),
    });
    let date = new Date();
    this.searchForm.patchValue({
      date: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    //const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
   // this.dateRange = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  // to get the active fees for the current date
  getErrorTransactionReport(userEvent: IUserEvents) {
     let datevalue = this.datePickerFormat.getFormattedDateRange(this.searchForm.controls['date'].value);
 
    if (this.searchForm.valid && new Date(datevalue[0]) != null &&  new Date(datevalue[1])!= null) 
    {
      this.AfterSearch = true;
      
     const strDate = this.searchForm.controls['date'].value;
    // let datevalue = this.datePickerFormat.getFormattedDateRange(this.searchForm.controls['date'].value);
    // this.exceptionRequest.CreatedDate = datevalue[0];
    // this.exceptionRequest.UpdatedDate = datevalue[1];
      if (strDate != "" && strDate != null) {
        //const strDateRange = strDate.slice(',');
        let firstDate = new Date(datevalue[0]);
        let lastDate = new Date(datevalue[1]);
        let startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        let endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        this.exceptionRequest.StartDate = startDate;
        this.exceptionRequest.EndDate = endDate;
      }
      else {
        this.exceptionRequest.StartDate = this.startDate;
        this.exceptionRequest.EndDate = this.endDate;
      }
      this.exceptionRequest.TripStatus = "DMVDATANOTFOUND";
      this.exceptionRequest.RetryCount = 3;
      this.exceptionService.getErrorTransactionReport(this.exceptionRequest, userEvent).subscribe(res => {
        if (res) {
          this.exceptionResponse = res;
          console.log(this.exceptionResponse);
          if (this.exceptionResponse.length > 0)
            this.AfterSearch = false;
          else
            this.AfterSearch = true;
        }
      });
    }
  }

  searchReport() {
    if(this.invalidDate){
      return;
    }
    let userEvent = this.userEvents();
    this.getErrorTransactionReport(userEvent);
  }

  checkboxCheckedEvent(object: ITransactionProcessorErrorsResponse, event) {
    var index = this.selectedErrorList.findIndex(x => x.TripId == object.TripId);
    if (event.target.checked) {
      if (index == -1) {
        this.selectedErrorList.push(object);
        object.isSelected = true;
        var result = this.exceptionResponse.filter(x => x.isSelected == true).length;
        if (result == this.exceptionResponse.length)
          this.isParentSelected = true;
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedErrorList.splice(index, 1);
        object.isSelected = false;
      }
    }
  }

  checkAllClick(event) {
    for (var i = 0; i < this.exceptionResponse.length; i++) {
      let isChecked: boolean = event.target.checked;
      this.exceptionResponse[i].isSelected = isChecked;
      var index = this.selectedErrorList.findIndex(x => x.TripId == this.exceptionResponse[i].TripId);
      if (index > -1 && !isChecked) {
        this.selectedErrorList = this.selectedErrorList.filter(item => item.TripId != this.exceptionResponse[i].TripId);
        this.exceptionResponse[i].isSelected = false;
      }
      else if (isChecked) {
        var index = this.selectedErrorList.findIndex(x => x.TripId == this.exceptionResponse[i].TripId);
        if (index === -1) {
          this.selectedErrorList.push(this.exceptionResponse[i]);
          this.exceptionResponse[i].isSelected = true;
        }
      }
    }
  }

  reProcessTran() {
    if (this.selectedErrorList.length > 0) {
      this.msgType = 'alert';
      this.msgFlag = true;
      this.msgDesc = "Are you sure you want to ReProcess the transactions ?";
      this.msgTitle = 'Alert';
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Select at least one trip";;
      this.msgTitle = '';
    }
  }

  reProcess(event) {
    if (event) {
      if (this.selectedErrorList.length > 0) {
        var ipcIds = [];
        var tpProcessIds = [];
        var violationIds = [];
        var createdUser = this.Context.customerContext.userName;
        for (var i = 0; i < this.selectedErrorList.length; i++) {
          if (this.selectedErrorList[i].PlanId == "1") {
            ipcIds.push(this.selectedErrorList[i].TripId.toString());
          }
          else if (this.selectedErrorList[i].PlanId == "2") {
            tpProcessIds.push(this.selectedErrorList[i].TripId.toString());
          }
          else if (this.selectedErrorList[i].PlanId == "3") {
            violationIds.push(this.selectedErrorList[i].TripId.toString());
          }
        }
        let userEvents = this.userEvents();
        this.userEventRequest.ActionName = Actions[Actions.REPROCESS];
        this.exceptionService.updateErrorQueueRelease(tpProcessIds, violationIds, ipcIds, createdUser, userEvents).subscribe(res => {
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = res;
            this.msgTitle = '';
            let userEvent = null;
            this.getErrorTransactionReport(userEvent);
            this.selectedErrorList = [];
          }
        });
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Select at least one trip";;
        this.msgTitle = '';
      }
    }
    else {
      this.msgFlag = false;
    }
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.TRANSACTIONERRORREPORT];
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
    onDateRangeFieldChanged(event) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

}
