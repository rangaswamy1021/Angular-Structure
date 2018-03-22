import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common'
import { IPayByPlateResponse } from './models/paybyplateresponse';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { IPayByPlateRequest } from './models/paybyplaterequest';
import { Data, Router } from '@angular/router';
import { SubSystem, ActivitySource, Features, Actions, defaultCulture } from '../../shared/constants';
import { SessionService } from '../../shared/services/session.service';
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import {  IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import {  IMyDateModel } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";


declare var $: any;
@Component({
  selector: 'app-pay-by-plate-list',
  templateUrl: './pay-by-plate-list.component.html',
  styleUrls: ['./pay-by-plate-list.component.css']
})
export class PayByPlateListComponent implements OnInit {
  invalidDate: boolean;
  payByPlateform: FormGroup;
  payByPlateRequest: IPayByPlateRequest;
  payByPlateResponse: IPayByPlateResponse[];
  bsRangeValue: any;
  payByPlateResponseSelected: IPayByPlateResponse[] = <IPayByPlateResponse[]>[];
  isSelected: boolean;
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

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

  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear());
  toDayDate: Date = new Date();
  start = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");

  constructor(private customerAccounts: CustomerAccountsService, private commonService: CommonService
    , public datepipe: DatePipe, private router: Router,
    private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService
    , private context: SessionService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    //let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    this.materialscriptService.material();
    if (!this.commonService.isAllowed(Features[Features.PAYBYPLATELIST], Actions[Actions.VIEW], "")) {
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.PAYBYPLATELIST], Actions[Actions.SEARCH], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.PAYBYPLATELIST], Actions[Actions.UPDATE], "");
    this.payByPlateform = new FormGroup({
      'AccountId': new FormControl('', []),
      'bsRangeValue': new FormControl('', [Validators.required]),

    });
    let date = new Date();
    this.payByPlateform.patchValue({
      bsRangeValue: {
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
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    // this.payByPlateform = new FormGroup({
    //   'AccountId': new FormControl('', []),
    //   'bsRangeValue': new FormControl('', [Validators.required]),
    // });
    let userEvent = this.userEvents();
    this.bindData(userEvent);
  }

  bindData(userEvent: IUserEvents) {
    let fromDate;
    let toDate;
    if (this.payByPlateform.controls['bsRangeValue'].value == '') {
      fromDate = this.start;
      toDate = this.end;
    }
    else {
      let strDate = this.payByPlateform.controls['bsRangeValue'].value;
      if (strDate != "" && strDate != null) {
        let date = this.datePickerFormat.getFormattedDateRange(this.payByPlateform.controls['bsRangeValue'].value)
        let firstDate = date[0];
        let lastDate = date[1];
        fromDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        toDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
      }
      else {
        fromDate = this.start;
        toDate = this.end;
      }
    }
    // let strDateRange = strDate.slice(",");
    // let fromDate = new Date(strDateRange[0]);
    // let toDate = new Date(strDateRange[1]);
    this.payByPlateRequest = <IPayByPlateRequest>{};
    if (this.payByPlateform.controls['AccountId'].value == '')
      this.payByPlateRequest.AccountId = 0;
    else
      this.payByPlateRequest.AccountId = this.payByPlateform.controls['AccountId'].value;

    this.payByPlateRequest.StartDate = fromDate;
    this.payByPlateRequest.EndDate = toDate;

    this.customerAccounts.getCustomerPayByPlateHistory(this.payByPlateRequest, userEvent).subscribe(
      res => {
        if (res.length > 0) {
          this.payByPlateResponse = res;
        }
        else {
          this.payByPlateResponse = [];
        }
      });



  }



  payByPlateSearch() {
    if (!this.invalidDate && this.payByPlateform.valid) {
      this.payByPlateResponse = [];
      let userEvent = this.userEvents();
      userEvent.ActionName = Actions[Actions.SEARCH];

      this.bindData(userEvent);
    }
  }

  submitPaybyPlate(payByPlateResponseSelected, event) {
    if (event) {
      let paybyPlateReqList = [];
      if (this.payByPlateResponseSelected.length > 0) {
        for (let i = 0; i < payByPlateResponseSelected.length; i++) {
          this.payByPlateRequest = <IPayByPlateRequest>{};
          this.payByPlateRequest.AccountId = payByPlateResponseSelected[i].AccountId;
          this.payByPlateRequest.SubSystem == SubSystem[SubSystem.CSC];
          this.payByPlateRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.payByPlateRequest.UpdatedUser = this.context.customerContext.userName;
          this.payByPlateRequest.PbyPCustId = payByPlateResponseSelected[i].PbyPCustId;
          paybyPlateReqList.push(this.payByPlateRequest);
        }
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.UPDATE];
        this.customerAccounts.deleteCustomerPayByPlateDetails(paybyPlateReqList, userEvent).subscribe(
          res => {
            if (res) {
              this.bindData(null);
              this.payByPlateResponseSelected = [];
              this.msgFlag = true;
              this.msgType = "success";
              this.msgTitle = "Pay-by-Plate Delete";
              this.msgDesc = "Account successfully deleted from Pay by Plate list";
            }
          },
          (err) => {
            this.msgFlag = true;
            this.msgType = "error";
            this.msgTitle = "";
            this.msgDesc = err.statusText;
          },
          () => {
            $('#AccountId').val('');
            // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
            // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
            let date = new Date();
            this.payByPlateform.patchValue({
              bsRangeValue: {
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
          });
      }
    }
    else {
      this.msgFlag = false;
    }
  }

  deleteFromPayByPlateList(payByPlateResponseSelected: IPayByPlateResponse[]) {
    if (this.payByPlateResponseSelected.length > 0) {
      this.msgFlag = true;
      this.msgType = "alert";
      this.msgTitle = "Alert";
      this.msgDesc = "Are you sure you want to delete? ";
    }
    else {
      this.msgFlag = true;
      this.msgType = "error";
      this.msgTitle = "";
      this.msgDesc = "Select at least one transaction";
    }
  }

  onCheckChange(event, value: IPayByPlateResponse) {
    if (event.target.checked) {
      this.payByPlateResponseSelected.push(value);
    } else {
      var index = this.payByPlateResponseSelected.indexOf(value);
      if (index > -1) {
        this.payByPlateResponseSelected.splice(index, 1);
      }
    }
  }

  resetclick() {
    this.payByPlateform.reset();
    let date = new Date();
    this.payByPlateform.patchValue({
      bsRangeValue: {
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
    //let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    // this.payByPlateform.patchValue({
    //   'bsRangeValue': this.bsRangeValue,
    //   'AccountId': ''
    // });
    this.bindData(null);
    this.payByPlateResponseSelected = [];
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.PAYBYPLATELIST];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.payByPlateform.controls["bsRangeValue"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
}

