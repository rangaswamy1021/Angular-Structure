import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CustomerDetailsService } from "../customerdetails/services/customerdetails.service";
import { CustomerserviceService } from "./services/customerservice.service";
import { IPlanRequest } from "../../sac/plans/models/plansrequest";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { IDiscountRequest } from "../customerdetails/models/discountrequest";
import { IDiscountResponse } from "../customerdetails/models/discountsresponse";
import { ICustomerDiscountRequest } from "./models/customerdiscountsrequest";
import { ICustomerDiscountResponse } from "./models/customerdiscountsresponse";
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from "../../shared/constants";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { IMyDpOptions, IMyDateModel, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-manage-discounts',
  templateUrl: './manage-discounts.component.html',
  styleUrls: ['./manage-discounts.component.scss']
})
export class ManageDiscountsComponent implements OnInit {
  isNonRevenue: boolean;
  invalidStartDate: boolean;
  invalidEndDate: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isAssign: boolean = false;
  isDelete: boolean = false;
  enableStartDate: boolean = true;
  enableEndDate: boolean = true;
  accountStatus: boolean;
  dateForm: FormGroup;
  endDate: Date;
  startDate: Date;
  manageDiscountsForm: FormGroup;
  count: number = 0;
  UserId: number;
  LoginId: number;
  items = [];
  discountObj: ICustomerDiscountRequest;
  selectedRow: number;
  selected: boolean = false;
  deactivateResponse: ICustomerDiscountResponse[];
  customerDiscount: ICustomerDiscountRequest;
  planResponse: IDiscountResponse[];
  getDisocuntResponse: IDiscountResponse[];
  discountResponse: IDiscountResponse[];
  discountRequest: IDiscountRequest;
  intDiscountIds: number = 1;
  getPlanResponse: IPlanResponse[];
  getPlanId: IPlanResponse = <IPlanResponse>{};
  //longAccountId: number = 10003498;
  isPeriod: boolean;
  SystemActivity: ISystemActivities;
  planRequest: IPlanRequest;
  isAllowToAddDiscount: boolean = false;
  discountByPkResponse: ICustomerDiscountResponse;
  maxRangetoaddToEndDate: number;
  sessionContextResponse: IUserresponse;
  objICustomerContextResponse: ICustomerContextResponse;
  calOptions: ICalOptions = <ICalOptions>{};
  toDayDate = new Date();
  myDatePickerOptions1: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };


  myDatePickerOptions: ICalOptions =
  {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() - 1 },
    firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };

  constructor(private customerContextService: CustomerContextService, private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private sessionContext: SessionService,
    private customerDetailsService: CustomerDetailsService, private customerService: CustomerserviceService,
    private commonService: CommonService, private router: Router, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.customerContextService.currentContext
      .subscribe(customerContext => {
        this.objICustomerContextResponse = customerContext;
        console.log("customer");
        console.log(this.objICustomerContextResponse);
      }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.objICustomerContextResponse.RevenueCategory == "NonRevenue") {
      this.isNonRevenue = false;
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'You are not allowed to do this operation';
    }
    else {
      this.isNonRevenue = true;
      this.dateForm = new FormGroup({
        'start': new FormControl('', [Validators.required]),
        'end': new FormControl('', [Validators.required])
      });
      this.getActiveDiscounts();
      this.getPlanAndOpenDiscounts();
      // this.getAccountStatus()
      //this.getByDiscountPK();
      if (!this.commonService.isAllowed(Features[Features.DISCOUNTS], Actions[Actions.VIEW], this.objICustomerContextResponse.AccountStatus)) {
        //error page;

      }
      this.isAssign = !this.commonService.isAllowed(Features[Features.DISCOUNTS], Actions[Actions.ASSIGNDISCOUNTS], this.objICustomerContextResponse.AccountStatus);
      this.isDelete = !this.commonService.isAllowed(Features[Features.DISCOUNTS], Actions[Actions.DELETE], this.objICustomerContextResponse.AccountStatus);
    }
  }
  getActiveDiscounts() {
    this.discountRequest = <IDiscountRequest>{};
    this.discountRequest.SortColumn = "CUSTOMERID";
    this.discountRequest.SortDirection = 1;
    this.discountRequest.PageSize = 10;
    this.discountRequest.PageNumber = 1;
    this.discountRequest.CustomerId = this.objICustomerContextResponse.AccountId;
    this.customerDetailsService.getActiveDiscounts(this.discountRequest)
      .subscribe(res => {
        debugger;
        this.discountResponse = res;
        if (this.discountResponse != null) {
          for (let i = 0; i < this.discountResponse.length; i++) {
            if ((this.discountResponse[i].DiscountType.toUpperCase() == 'PLAN' || this.discountResponse[i].DiscountType.toUpperCase() == 'PERIOD' || this.discountResponse[i].DiscountType.toUpperCase() == 'VOLUME'
              || this.discountResponse[i].DiscountType.toUpperCase() == 'TRIP')) {
              this.isAllowToAddDiscount = true;
            }
          }
        }
      });
  }
  getByDiscountPK(discountId: number) {
    this.customerDiscount = <ICustomerDiscountRequest>{};
    this.customerDiscount.DiscountId = discountId;
    this.customerService.getDisocuntByPk(this.customerDiscount).subscribe(
      res => {
        //this.getDisocuntResponse = res;
        this.discountByPkResponse = res;
        this.maxRangetoaddToEndDate = this.discountByPkResponse.DiscountDetails.MaxRange;
        console.log("max days");
        console.log(this.maxRangetoaddToEndDate);
      });

  }
  // selectDate(event) {
  //   if (event.value != null) {
  //     let disableDate = event.value
  //     this.myDatePickerOptions1 = {
  //       dateFormat: 'mm/dd/yyyy',
  //       disableUntil: { year: disableDate.getFullYear(), month: disableDate.getMonth() + 1, day: disableDate.getDate() - 1 },
  //       firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true
  //     };
  //   }
  //   if (this.isPeriod) {
  //     let currentDate: Date = this.startDate;
  //     this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (Number)(this.maxRangetoaddToEndDate));
  //     this.enableStartDate = true;
  //     this.enableEndDate = false;
  //   }
  //   else {
  //     this.isPeriod = false;
  //     this.enableEndDate = true;
  //     this.enableStartDate = true;
  //   }
  // }

  selectDate() {
    if (this.isPeriod) {
      let currentDate: Date = new Date(this.startDate);
      this.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (Number)(this.maxRangetoaddToEndDate));
      this.enableStartDate = true;
      let date = this.endDate;
      this.dateForm.patchValue({
        end: {
          date: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
          }
        }
      });
      this.enableEndDate = false;

    }
    else {
      this.isPeriod = false;
      this.enableEndDate = true;
      this.enableStartDate = true;

    }
  }

  changeDate(start) {
    //let start = new Date();
    //let strDate = this.dateForm.controls['end'].value;
    let strDate = new Date(start.date.month + '/' + start.date.day + '/' + start.date.year);
    if (start != null) {
      // let date = new Date(start);
      this.maxDate = new Date(strDate);
      this.myDatePickerOptions1 = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: {
          year: this.maxDate.getFullYear(),
          month: this.maxDate.getMonth() + 1,
          day: this.maxDate.getDate() - 1
        },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false,
        alignSelectorRight: false, indicateInvalidDate: true
      };
      this.startDate = strDate;
      this.selectDate();
    }
  }
  changeEndDate(event) {
    let date = this.dateForm.controls["end"].value;
    if (!event.valid && event.value != "") {
      this.invalidEndDate = true;
      return;
    }
    else
      this.invalidEndDate = false;
    let endDate = event.value
    if (endDate != null) {
      this.maxDate = new Date(endDate);
      this.myDatePickerOptions = {
        dateFormat: 'mm/dd/yyyy',
        disableSince: {
          year: this.maxDate.getFullYear(),
          month: this.maxDate.getMonth() + 1,
          day: this.maxDate.getDate() + 1
        },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false,
        alignSelectorRight: false, indicateInvalidDate: true
      };
    }
  }
  getPlanAndOpenDiscounts() {
    this.planRequest = <IPlanRequest>{};
    this.planRequest.AccountId = this.objICustomerContextResponse.AccountId;
    this.customerService.getPlan(this.planRequest)
      .subscribe(res => {
        this.getPlanId.PlanId = res[0].PlanId;
        console.log(this.getPlanId.PlanId);
      }, (err) => { }
      , () => {
        this.planRequest.PlanId = this.getPlanId.PlanId;
        this.planRequest.StartEffDate = new Date();
        this.customerService.getPlanAndOpenDiscounts(this.planRequest.PlanId, this.planRequest.StartEffDate)
          .subscribe(res => {
            this.planResponse = res;
            if (this.planResponse && this.planResponse.length > 0) {
              this.planResponse = this.planResponse.filter(element =>
                element.DiscountType.toUpperCase() !== "GLOBAL" &&
                element.DiscountType.toUpperCase() !== "VOLUME" &&
                element.DiscountType.toUpperCase() !== "PERIOD" &&
                element.DiscountType.toUpperCase() !== "TRIP");
            }
          });
      });

  }
  selectedChkBox(index: number, discountType: ICustomerDiscountRequest) {
    this.dateForm.reset();
    this.selectedRow = index;
    this.selected = !this.selected;
    if (discountType.DiscountType.toUpperCase() == 'PERIOD') {
      this.getByDiscountPK(discountType.DiscountId);
      this.isPeriod = true;
    }
    else {
      this.isPeriod = false;
      this.enableEndDate = true;
    }
    if (discountType.DiscountType.toUpperCase() == 'SUBSCRIPTION') {
      this.isAllowToAddDiscount = false;
    }
    // if (discountType.IsSelected) {
    this.discountObj = <ICustomerDiscountRequest>{};
    this.discountObj.DiscountId = discountType.DiscountId;
    this.discountObj.DiscountType = discountType.DiscountType;
    //this.getByDiscountPK(discountType.DiscountId);
    this.discountObj.DiscountName = discountType.DiscountName;
    this.discountObj.Description = discountType.Description;
    this.discountObj.Isactive = true;
    this.items.push(this.discountObj);
    //  }
    var bind = new Date();
    this.myDatePickerOptions1 = {
      dateFormat: 'mm/dd/yyyy',
      disableUntil: {
        year: bind.getFullYear(),
        month: bind.getMonth() + 1,
        day: bind.getDate() - 1
      },
      firstDayOfWeek: 'mo', sunHighlight: false,
      inline: false,
      alignSelectorRight: false, indicateInvalidDate: true
    };
  }
  // getAccountStatus() {
  //   let userEvents = <IUserEvents>{};
  //   userEvents.FeatureName = Features[Features.DISCOUNTS];
  //   userEvents.ActionName = Actions[Actions.VIEW];
  //   userEvents.PageName = this.router.url;
  //   userEvents.CustomerId = this.objICustomerContextResponse.AccountId;
  //   userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
  //   userEvents.UserName = this.sessionContextResponse.userName;
  //   userEvents.LoginId = this.sessionContextResponse.loginId;
  //   let boolActiveAccount: boolean = false;
  //   this.customerService.getAccountstatusForCloseAccount(this.objICustomerContextResponse.AccountId, userEvents).subscribe(
  //     res => {
  //         boolActiveAccount = true;
  //         this.accountStatus = boolActiveAccount;

  //     });
  // }

  assignCustomerDiscounts() {
    this.addorRemoveValidtions();
    if (this.dateForm.valid) {
      if (this.objICustomerContextResponse.AccountStatus == "AC") {
        if (this.isAllowToAddDiscount) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Customer can have only one Plan discount at a time';
        }
        else {
          this.discountObj = <ICustomerDiscountRequest>{};
          if (this.items.length) {
            //this.endDate= new Date(this.dateForm.controls['end'].value).toDateString();
            let strDate = this.dateForm.controls['end'].value;
            this.endDate = new Date(strDate.date.month + '/' + strDate.date.day + '/' + strDate.date.year);
            for (var i = 0; i < this.items.length; i++) {
              this.discountObj.DiscountId = this.items[i].DiscountId;
              this.discountObj.DiscountName = this.items[i].DiscountName;
              this.discountObj.StartEffectiveDate = this.startDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
              this.discountObj.EndEffectiveDate = this.endDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
              this.discountObj.PerformBy = this.sessionContextResponse.userName;
              this.discountObj.Description = this.items[i].Description;
              this.discountObj.Isactive = true;
              this.discountObj.SubSystem = SubSystem[SubSystem.CSC];;
              this.discountObj.ActivitySource = ActivitySource[ActivitySource.Internal];
              this.SystemActivity = <ISystemActivities>{};
              this.SystemActivity.ActionCode = "";
              this.SystemActivity.FeaturesCode = "";
              this.SystemActivity.UserId = this.sessionContextResponse.userId;
              this.SystemActivity.LoginId = this.sessionContextResponse.loginId;
              this.SystemActivity.User = this.sessionContextResponse.userName;
              this.discountObj.SystemActivity = this.SystemActivity;
            }
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.DISCOUNTS];
            userEvents.ActionName = Actions[Actions.ASSIGNDISCOUNTS];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = this.objICustomerContextResponse.AccountId;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
            this.customerService.assignCustomerDiscounts(this.objICustomerContextResponse.AccountId, this.discountObj, userEvents)
              .subscribe(res => {
                if (res) {
                  this.msgFlag = true;
                  this.msgType = 'success';
                  this.msgTitle = '';
                  this.msgDesc = 'Discount has been assigned successfully';
                  this.enableEndDate = true;
                  this.getActiveDiscounts();
                  this.getPlanAndOpenDiscounts();
                  this.dateForm.reset();
                  this.dateForm.controls["start"].setValidators([]);
                  this.dateForm.controls["end"].setValidators([]);
                  this.dateForm.controls['start'].updateValueAndValidity();
                  this.dateForm.controls['end'].updateValueAndValidity();
                  var bind = new Date();
                  this.myDatePickerOptions1 = {
                    dateFormat: 'mm/dd/yyyy',
                    disableUntil: {
                      year: bind.getFullYear(),
                      month: bind.getMonth() + 1,
                      day: bind.getDate() - 1
                    },
                    firstDayOfWeek: 'mo', sunHighlight: false,
                    inline: false,
                    alignSelectorRight: false, indicateInvalidDate: true
                  };

                }
              }, (err) => {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = err.statusText.toString();

              });
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgTitle = '';
            this.msgDesc = 'Select atleast one Discount';
            return;
          }
        }
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Account should be in Active status to add discount';
      }
    }
    else {
      this.validateFeilds();
    }
  }
  addorRemoveValidtions() {
    this.dateForm.controls["start"].setValidators([Validators.required]);
    this.dateForm.controls["end"].setValidators([Validators.required]);
    this.dateForm.controls['start'].updateValueAndValidity();
    this.dateForm.controls['end'].updateValueAndValidity();
  }

  updateCustomerDiscount() {
    this.customerDiscount = <ICustomerDiscountRequest>{};
    this.customerService.updateCustomerDiscount(this.objICustomerContextResponse.AccountId, this.customerDiscount.Isactive)
      .subscribe(res => {
        this.deactivateResponse = res;
      });
  }
  reset() {
    this.enableEndDate = true;
    this.isPeriod = false;
    this.getActiveDiscounts();
    this.getPlanAndOpenDiscounts();
    this.dateForm.reset();
    var bind = new Date();
    this.myDatePickerOptions1 = {
      dateFormat: 'mm/dd/yyyy',
      disableUntil: {
        year: bind.getFullYear(),
        month: bind.getMonth() + 1,
        day: bind.getDate() - 1
      },
      firstDayOfWeek: 'mo', sunHighlight: false,
      inline: false,
      alignSelectorRight: false, indicateInvalidDate: true
    };
    //  {year: 0, month: 0, day: 0}
  }

  deleteDiscount(discounntId: number, availedDiscountId: number, discountName: string) {
    this.discountObj = <ICustomerDiscountRequest>{};
    this.discountObj.DiscountId = discounntId;
    this.discountObj.AvailedDiscountId = availedDiscountId;
    this.discountObj.DiscountName = discountName;
    this.discountObj.EndEffectiveDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
    this.discountObj.PerformBy = this.sessionContextResponse.userName;
    this.discountObj.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.discountObj.SubSystem = SubSystem[SubSystem.CSC];
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgTitle = '';
    this.msgDesc = 'Are you sure you want to delete this discount?';
  }

  deleteOKDiscount(event) {
    if (event) {
      this.SystemActivity = <ISystemActivities>{};
      this.SystemActivity.UserId = this.sessionContextResponse.userId;
      this.SystemActivity.LoginId = this.sessionContextResponse.loginId;
      this.SystemActivity.User = this.sessionContextResponse.userName;
      this.discountObj.SystemActivity = this.SystemActivity;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DISCOUNTS];
      userEvents.ActionName = Actions[Actions.DELETE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.objICustomerContextResponse.AccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.customerService.deactivateDiscount(this.objICustomerContextResponse.AccountId, this.discountObj, userEvents)
        .subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgTitle = '';
            this.msgDesc = 'Discount has been deleted successfully';
            this.items.length = null;
            this.enableEndDate = true;
            this.isPeriod = false;
            this.isAllowToAddDiscount = false;
            this.dateForm.reset();
            this.getActiveDiscounts();
            this.getPlanAndOpenDiscounts();
            //this.selectedChkBox(null,null);
            var bind = new Date();
            this.myDatePickerOptions1 = {
              dateFormat: 'mm/dd/yyyy',
              disableUntil: {
                year: bind.getFullYear(),
                month: bind.getMonth() + 1,
                day: bind.getDate() - 1
              },
              firstDayOfWeek: 'mo', sunHighlight: false,
              inline: false,
              alignSelectorRight: false, indicateInvalidDate: true
            };
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = 'Discount';
          this.msgDesc = 'Error while deleting Discount. Try again later';
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  validateFeilds() {
    this.dateForm.controls["start"].markAsTouched({ onlySelf: true });
    this.dateForm.controls["end"].markAsTouched({ onlySelf: true });
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  //for date picker
  minDate = new Date();
  maxDate = new Date(2070, 9, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
  _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }
  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.dateForm.controls["start"].value;
    if (!event.valid && event.value != "") {
      this.invalidStartDate = true;

      return;
    }
    else
      this.invalidStartDate = false;

  }
}
