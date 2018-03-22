import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { ImcReportsService } from "./services/report.service";
import { IReturnedPOItemRequest } from "./models/returnedpoitemsrequest";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IMyDrpOptions } from "mydaterangepicker";
import { isDate } from "util";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-purchase-order-items-returned',
  templateUrl: './purchase-order-items-returned.component.html',
  styleUrls: ['./purchase-order-items-returned.component.scss']
})
export class PurchaseOrderItemsReturnedComponent implements OnInit {
  invalidDate: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  invalid: boolean;
  disableSearchButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  returnItemDetails: any;
  poItemsList: any;
  returnedResponse: any;
  returnedPOItemsResponse: any;
  sessionContextResponse: any;
  timePeriod: Date[];
  validatOrderPattern = "^[0-9]+$";
  POItemsReturnForm: FormGroup;
  purchaseOrderDetails: any;
  returnItemsDetails: any;
  RMADetails: any;
  action: any;
  isSearch: boolean = false;
  calOptions: ICalOptions = <ICalOptions>{};
  myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };
  constructor(private itemsReturnedService: ImcReportsService,
    private datePickerFormat: DatePickerFormatService,
    private sessionContext: SessionService,
    private commonService: CommonService,
    private router: Router, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }


    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
    this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.POItemsReturnForm = new FormGroup({
      'timePeriod': new FormControl('', [Validators.required]),
      'purchaseOrderNumber': new FormControl('', Validators.pattern(this.validatOrderPattern))

    });
    let date = new Date();
    this.POItemsReturnForm.patchValue({
      timePeriod: {
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

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.RETURNEDPOITEMS], Actions[Actions.SEARCH], "");
    //this.dateBind();
    let userevents = this.userEvents();
    // this.POItemsReturnForm.controls['timePeriod'].setValue(this.timePeriod);
    this.action = "view";
    this.getReturnedPOItem(userevents);
  }
  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

  // }
  resetclick() {
    this.POItemsReturnForm.reset();
    this.POItemsReturnForm.controls['purchaseOrderNumber'].setValue("");
    //this.dateBind();
    // this.POItemsReturnForm.controls['timePeriod'].setValue(this.timePeriod);
    this.returnedPOItemsResponse = null;
    this.isSearch = false;
    this.action = 'reset';
    //this.getReturnedPOItem(null);
    let date = new Date();
    this.POItemsReturnForm.patchValue({
      timePeriod: {
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
    this.getReturnedPOItem(null);
  }
  getReturnedPOItems() {
    let userevents = this.userEvents();
    this.getReturnedPOItem(userevents);
  }

  getReturnedPOItem(userevents) {
    debugger;
    if (!this.invalidDate) {
      if (this.POItemsReturnForm.valid) {
        this.returnedPOItemsResponse = null;
        let returnedPOItemsRequest: IReturnedPOItemRequest = <IReturnedPOItemRequest>{};
        let activitySource: string = ActivitySource[ActivitySource.Internal];
        let PONumber = this.POItemsReturnForm.controls['purchaseOrderNumber'].value;
        const strDate = this.POItemsReturnForm.controls['timePeriod'].value;
        let fromDate = new Date();
        let toDate = new Date();
        //debugger;
        if (strDate) {
          //let strDateRange = strDate.slice(",");
          fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
          toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
          //toDate = new Date(strDateRange[1]);
          returnedPOItemsRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
          returnedPOItemsRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
        }
        // if (strDate != "" && strDate != null) {
        //   const strDateRange = strDate.slice(',');
        //   let firstDate = new Date(strDateRange[0]);
        //   let lastDate = new Date(strDateRange[1]);
        //   let startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        //   let endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        //   returnedPOItemsRequest.StartDate = startDate;
        //   returnedPOItemsRequest.EndDate = endDate;
        // }
        returnedPOItemsRequest.User = this.sessionContextResponse.userName;
        returnedPOItemsRequest.UserId = this.sessionContextResponse.userId;
        returnedPOItemsRequest.LoginId = this.sessionContextResponse.loginId;
        returnedPOItemsRequest.ActivitySource = activitySource;
        returnedPOItemsRequest.OnSearchClick = true;
        if (PONumber != "" && PONumber != null)
          returnedPOItemsRequest.POId = PONumber;
        else
          returnedPOItemsRequest.POId = 0;

        if (this.action == 'view') {
          userevents = this.userEvents();
          userevents.ActionName = Actions[Actions.VIEW];
        }
        else {
          userevents = this.userEvents();
          userevents.ActionName = Actions[Actions.SEARCH];
        }
        if (this.action == 'reset') {
          userevents = null;
        }
        this.itemsReturnedService.getReturnedPOItems(returnedPOItemsRequest, userevents).subscribe(res => {
          this.isSearch = true;
          this.action = null;
          if (res.length != 0) {
            this.returnedPOItemsResponse = res;
            this.purchaseOrderDetails = this.returnedPOItemsResponse[0].POItemsList;
            this.returnItemsDetails = this.returnedPOItemsResponse[0].ReturnedPOItemsList;
            this.RMADetails = this.returnedPOItemsResponse[0].RMADetailsList;
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          return;
        }
        );
      }
      else
        this.validateAllFormFields(this.POItemsReturnForm);
    }
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) { }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


  userEvents(): IUserEvents {

    this.userEventRequest.FeatureName = Features[Features.RETURNEDPOITEMS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;

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

