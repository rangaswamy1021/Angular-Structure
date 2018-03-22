import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IPhoneResponse } from "./models/phoneresponse";
import { CustomerserviceService } from "./services/customerservice.service";
import { IAddressResponse } from "../../shared/models/addressresponse";
import { IEmailResponse } from "../../shared/models/emailresponse";
import { CommonService } from "../../shared/services/common.service";
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { IVehicleRequest } from "../../vehicles/models/vehiclecrequest";
import { IVehicleResponse } from "../../vehicles/models/vehicleresponse";
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from "../../shared/constants";
import { CustomerDetailsService } from "../customerdetails/services/customerdetails.service";
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDpOptions } from "mydatepicker";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-close-account',
  templateUrl: './close-account.component.html',
  styleUrls: ['./close-account.component.scss']
})
export class CloseAccountComponent implements OnInit {
  invalidDate: boolean;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  reason: string;
  isClosed: boolean;
  accountStatus: boolean;
  descLength: number;
  successBlock: boolean;
  parameterValue: any;
  accountClosureDate: Date;
  successMessage: string;
  objCloseInputs: CloseAccountInputs;
  objRequestVehicle: IVehicleRequest;
  closeAccountResponse: boolean;
  phoneResponse: IPhoneResponse;
  addressResponse: IAddressResponse;
  emailResponse: IEmailResponse;
  closeAccount: FormGroup;
  customerStatus: ICustomerResponse;
  sessionContextResponse: IUserresponse;
  objICustomerContextResponse: ICustomerContextResponse;
  longAccountId: number;
  ICNID: number = 1;
  calOptions: ICalOptions = <ICalOptions>{};
  toDayDate = new Date();
  myDatePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() },
    firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };
  Message: string = " TollPlus customer account will be closed based on the fixed period (currently '' 1 '' days) from the date of initializing the request for closure. ";
  constructor(private customerContextService: CustomerContextService, private datePickerFormat: DatePickerFormatService, private customerService: CustomerserviceService, private sessionContext: SessionService,
    private router: Router, private commonService: CommonService, private customerdetailsservice: CustomerDetailsService,
    private materialscriptService: MaterialscriptService) {

  }

  ngOnInit() {
     this.materialscriptService.material();
    this.customerContextService.currentContext
      .subscribe(customerContext => {
        this.objICustomerContextResponse = customerContext;
      });
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log("customer1");
    console.log(this.objICustomerContextResponse);
    if (!this.commonService.isAllowed(Features[Features.CLOSEACCOUNT], Actions[Actions.VIEW], this.objICustomerContextResponse.AccountStatus)) {
      //error page;
    }
    this.isClosed = !this.commonService.isAllowed(Features[Features.CLOSEACCOUNT], Actions[Actions.REQUEST], this.objICustomerContextResponse.AccountStatus);
    this.closeAccount = new FormGroup({
      'accountClosureDate': new FormControl('', [Validators.required]),
      'reason': new FormControl('', [Validators.required])
    });
    this.getDefaultPhone();
    this.getDefaultAddress();

    this.getDefaultEmail();
    this.customerdetailsservice.getApplicationParameterValueByParameterKey("MaxDaysToPCtoCL").subscribe(
      res => {
        this.parameterValue = res;
        console.log(this.parameterValue);
      });
    this.getParentDetails();
    this.descLength = 225;
  }
  getParentDetails() {
    if (this.objICustomerContextResponse.ParentId != this.objICustomerContextResponse.AdditionalContactUserId) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'You are not allowed to close account';
      this.isClosed = true;
    }
    else {
      this.getAccountStatus();
    }
  }
  descEvent(event: any) {
    this.descLength = 225 - event.target.value.length
  }
  getDefaultPhone() {
    this.customerService.getDefaultPhone(this.objICustomerContextResponse.AccountId).subscribe(
      res => {
        this.phoneResponse = res;
        console.log(res);
      });
  }
  getDefaultAddress() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CLOSEACCOUNT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.objICustomerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.customerService.getDefaultAddress(this.objICustomerContextResponse.AccountId, userEvents).subscribe(
      result => {
        this.addressResponse = result;
        console.log(result);
      });
  }
  getDefaultEmail() {
    this.customerService.getDefaultEmail(this.objICustomerContextResponse.AccountId).subscribe(
      result1 => {
        this.emailResponse = result1;
        console.log(result1);
      });
  }
  getAccountStatus(): boolean {
    let boolActiveAccount: boolean = false;
    this.customerService.getAccountstatusForCloseAccount(this.objICustomerContextResponse.AccountId).subscribe(
      res => {
        if (res) {
          boolActiveAccount = true;
          this.isClosed = false;
          this.accountStatus = boolActiveAccount;
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = 'Error for not closing account';
        this.msgDesc = err.statusText.toString();
        this.isClosed = true;
      });
    return boolActiveAccount;
  }
  closeCustomerAccount() {
    
    
    if (this.accountStatus) {
      
      if (this.closeAccount.controls['reason'].value == "") {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = 'Required';
        this.msgDesc = "Reason required";
       
      }
      else {
          if(this.invalidDate)
      {
        return;
      }
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgTitle = '';
        this.msgDesc = 'Are you sure you want to close this account?';
      }
    }
    else {
      (err) => {
        this.isClosed = true;
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = 'Error for not closing account';
        this.msgDesc = err.statusText.toString();
      }
    }
     
  }
  closeCustomerAccountOk(event) {
    if (event) {
      this.objRequestVehicle = <IVehicleRequest>{};
      this.objRequestVehicle.AccountId = this.objICustomerContextResponse.AccountId;
      this.objRequestVehicle.UserName = this.sessionContextResponse.userName;
      this.objRequestVehicle.ActivitySource = ActivitySource.Internal;
      this.objRequestVehicle.Subsystem = SubSystem.CSC;
      this.objRequestVehicle.LoginId = this.sessionContextResponse.loginId;
      this.objRequestVehicle.UserId = this.sessionContextResponse.userId;
      this.objRequestVehicle.SortColumn = "VEHICLENUMBER";
      this.objRequestVehicle.SortDirection = true;
      this.objRequestVehicle.PageSize = 20;
      this.objRequestVehicle.PageNumber = 1;
      this.objRequestVehicle.DeactivatedDate = new Date();
      let datevalue: any;
      if (this.closeAccount.controls['accountClosureDate'].value) {
        datevalue = this.datePickerFormat.getFormattedDate(this.closeAccount.controls['accountClosureDate'].value.date);
        datevalue = new Date(datevalue).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      }
      // this.objRequestVehicle.FutureClosureDate = this.closeAccount.controls['accountClosureDate'].value ? this.closeAccount.controls['accountClosureDate'].value : '';
      this.objRequestVehicle.FutureClosureDate = datevalue ? datevalue : '';
      this.objCloseInputs = <CloseAccountInputs>{};
      this.objCloseInputs.CloseAccountReason = this.closeAccount.controls['reason'].value;
      this.objCloseInputs.longICNId = this.sessionContextResponse.icnId;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.CLOSEACCOUNT];
      userEvents.ActionName = Actions[Actions.REQUEST];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.objICustomerContextResponse.AccountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    
      this.customerService.closeCustomerAccount(this.objRequestVehicle, this.objCloseInputs, userEvents)
        .subscribe(res => {
          if (res) {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgTitle = '';
            if (datevalue) {
              this.msgDesc = 'Future Closing Account request has been submitted successfully';
              this.isClosed = false;
            }
            else {
              this.msgDesc = 'Closing Account requested, account status changed to pending closed.';
              this.isClosed = true;
            }
            this.getDefaultPhone();
            this.getDefaultAddress();
            this.getDefaultEmail();
            this.closeAccount.reset();
            //Future Closing Account request has been submitted successfully.
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = 'Error for not closing account';
          this.msgDesc = err.statusText.toString();
        });
    }
    else {
      this.msgFlag = false;
    }
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  newDate = new Date(Date.now());
  minDate = this.newDate.setDate(this.newDate.getDate() + 1);
  maxDate = new Date(2067, 12, 31);

  onDateRangeFieldChanged(event) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

}



export class CloseAccountInputs {
  CloseAccountReason: string;
  longICNId: number;
}

