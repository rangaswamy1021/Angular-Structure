import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RetailerService } from "./services/retailer.service";
import { IretailerResponse } from "./models/retailerresponse";
import { ICommonResponse } from './../../tags/models/tagshipmentaddressresponse';
import { IPOSOutletItems } from "./models/retaileruserrequest";
import { DatePipe } from '@angular/common';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-retailer-fulfillment',
  templateUrl: './retailer-fulfillment.component.html',
  styleUrls: ['./retailer-fulfillment.component.scss']
})
export class RetailerFulfillmentComponent implements OnInit {
  disableFulFillButton: boolean;
  totalAmount: any;
  retailerFulfillmentForm: FormGroup;

  userName: string;
  loginId: number;
  userId: number;
  itemValue: any;


  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  msgTitle: string;

  validateNumericOnly = "[1-9][0-9]*";
  validateDecimalWith2ValuesAferDotAllowsZero = "^[1-9][0-9]*(\.)?[0-9]{1,2}$";
  notAllowInitialZeropattern = "[1-9]\d*"
  ParameterKey: string = "POSOutletItemValue";

  activeRetailerDropDown: IretailerResponse[];
  commonResponse: ICommonResponse[];
  sessionContextResponse: IUserresponse;
  userEventRequest: IUserEvents = <IUserEvents>{};
  POSOutletRequest: IPOSOutletItems = <IPOSOutletItems>{};
  POSOutletResponse: any[];
  protocolResponse: any[];
  constructor(private retailerService: RetailerService,
    private commonService: CommonService, private _routers: Router, private datePipe: DatePipe, private sessionContext: SessionService, 
    private materialscriptService:MaterialscriptService) { }


  ngOnInit() {
    this.materialscriptService.material();
    this.retailerFulfillmentForm = new FormGroup({
      'retailer': new FormControl('', Validators.required),
      'mounting': new FormControl('', Validators.required),
      'quantity': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateNumericOnly)])),
      'itemValue': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateDecimalWith2ValuesAferDotAllowsZero)])),
      'protocol': new FormControl('', Validators.required),
      'totalAmount': new FormControl('', Validators.pattern(this.validateDecimalWith2ValuesAferDotAllowsZero))

    });

    this.disableFulFillButton = !(this.commonService.isAllowed(Features[Features.FULFILLMENT], Actions[Actions.RETAILERFULFILLMENT], ""));


    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._routers.navigate(link);
    }
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.getInventoryProtocol();
    this.getActiveRetailersDropDown();

  }


  _keyPress(event: any) {
    const pattern = /[0-9][0-9]*/;
    const pattern2 = /^[0-9]*(\.)?[0-9]{1,2}$/;
    let inputChar = String.fromCharCode(event.charCode);
    if ((!pattern.test(inputChar) || !pattern2.test(inputChar)) && !(event.which === 8)) {
      event.preventDefault();
    }
  }

  onlyDecimalNumberKey(event) {
    let charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  retailerFulfillmentReset() {
    this.retailerFulfillmentForm.reset();
  }

  getActiveRetailersDropDown() {
    this.retailerService.getActiveRetailers().subscribe(
      res => {
        this.activeRetailerDropDown = res;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.FULFILLMENT];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this._routers.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  getInventoryProtocol() {
    let userEvents = this.userEvents();
    this.retailerFulfillmentForm.controls['mounting'].setValue("");
    this.retailerService.getInventryProtocol(userEvents).subscribe(res => {
      this.protocolResponse = res;
    }, (err) => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText.toString();
      this.msgTitle = '';
      return;
    });
  }
  getInventoryMounting(protocol: string) {
    this.retailerFulfillmentForm.controls['mounting'].setValue("");
    this.retailerService.getInventryMounting(protocol).subscribe(res => {
      if (res) {
        this.commonResponse = res;
      }
    }, (err) => {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = err.statusText.toString();
      this.msgTitle = '';
      return;
    });
  }


  getPOSOutletFulfillment() {
    $('#pageloader').modal('show')
    var todayDate: Date = new Date();
    let date: any = new Date(todayDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    this.POSOutletRequest.Quantity = this.retailerFulfillmentForm.controls['quantity'].value;
    this.POSOutletRequest.TagValue = this.retailerFulfillmentForm.controls['itemValue'].value;
    this.POSOutletRequest.TotalAmount = this.retailerFulfillmentForm.controls['totalAmount'].value;
    this.POSOutletRequest.Protocol = this.retailerFulfillmentForm.controls['protocol'].value;
    this.POSOutletRequest.Mounting = this.retailerFulfillmentForm.controls['mounting'].value;
    this.POSOutletRequest.POSOutletId = this.retailerFulfillmentForm.controls['retailer'].value;
    this.POSOutletRequest.CreatedDate = todayDate;
    this.POSOutletRequest.UserId = this.userId;
    this.POSOutletRequest.UserName = this.userName;
    this.POSOutletRequest.LoginId = this.loginId;
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.RETAILERFULFILLMENT];
    this.retailerService.getPOSOutletFulfillment(this.POSOutletRequest, userEvents).subscribe(
      res => {
        this.POSOutletResponse = res;
        if (res) {
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgTitle = '';
          this.msgDesc = "Retailer item(s) request fulfilled successfully";
          $('#pageloader').modal('hide')
          this.itemValue = null;
          this.retailerFulfillmentForm.reset();
          this.retailerFulfillmentForm.controls['retailer'].setValue("");
          this.retailerFulfillmentForm.controls['mounting'].setValue("");
          this.retailerFulfillmentForm.controls['protocol'].setValue("");

        }
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgTitle = '';
        this.msgDesc = err.statusText.toString();
        return;
      });
  }

  getApplicationParameterValueByParameterKey(ParameterKey) {
    if (this.retailerFulfillmentForm.invalid) {
      this.validateAllFormFields(this.retailerFulfillmentForm);
    }
    else {
      $('#pageloader').modal('show')
      this.retailerService.getApplicationParameterValueByParameterKey(this.ParameterKey).subscribe(
        res => {
          if ((parseInt(this.itemValue) < res)) {
            $('#pageloader').modal('hide');
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgTitle = '';
            this.msgDesc = "Item value should be greater than or equal to $" + res;
          }
          else {
            this.getPOSOutletFulfillment();
            $('#pageloader').modal('hide');
          }
        },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgTitle = '';
          this.msgDesc = err.statusText.toString();
          $('#pageloader').modal('hide');
          return;
        });
    }
  }

  totalAmountCalculation() {
    let quantity = this.retailerFulfillmentForm.controls['quantity'].value;
    this.itemValue = this.retailerFulfillmentForm.controls['itemValue'].value;
    this.totalAmount = (((quantity * this.itemValue) / 1).toFixed(2));
    this.retailerFulfillmentForm.controls['totalAmount'].setValue(this.totalAmount);
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
}
