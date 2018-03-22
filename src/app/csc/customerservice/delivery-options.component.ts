import { AccountStatus } from './../search/constants';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ICommon, ICommonResponse } from '../../shared/models/commonresponse';
import { CommonService } from '../../shared/services/common.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ICustomerAttributeResponse } from '../../shared/models/customerattributeresponse';
import { TagRequestType } from '../../tags/constants';
import { FormArray, Validators } from '@angular/forms';
import { FormGroup, FormControl } from '@angular/forms';
import { ICustomerAttributeRequest } from '../../shared/models/customerattributerequest';
import { SubSystem, ActivitySource, RevenueCategory, Features, Actions } from '../../shared/constants';
import { SessionService } from '../../shared/services/session.service';
import { CustomerserviceService } from './services/customerservice.service';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IUserresponse } from "../../shared/models/userresponse";
import { IInvoiceCycle } from '../customerdetails/models/InvoiceCycle';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-delivery-options',
  templateUrl: './delivery-options.component.html',
  styleUrls: ['./delivery-options.component.scss']
})

export class DeliveryOptionsComponent implements OnInit {

  deliveryOptionsform: FormGroup;
  tranponderPurchasemethodfrom: FormGroup;
  customerContextResponse: ICustomerContextResponse;
  Request: ICommon;
  responseStatementDeliveryOption: IArray[];
  responseTagDeliveryOption: IArray[];
  responsestatementCycle: IArray[];
  responseInvoiceDays = [];
  responseInvoice: IArray;
  // subSystem: SubSystem;
  // activitySource: ActivitySource;
  customerAttributesRequest: ICustomerAttributeRequest;
  customerAttributesResponse: ICustomerAttributeResponse;
  invoiceCycle: any[];
  isPlanBasedStmt: number;
  customerId: number;
  invoiceInterval: string;
  isPostpaid: boolean = false;
  isPrepaid: boolean = false;
  isDisabled: boolean = false;
  customertype: string = "postpaid";
  isInvoiceDisable: boolean = false;
  invoiceAmount: number;
  isInvoiceAmount: boolean = false;
  invoiceDays: string;
  isInvoiceDays: boolean = false;
  isInvoiceDaysDisable: boolean = false;
  strStatementDelivery: string;
  strTranponderPurchasemethod: string;
  isNonRevenue: boolean = false;
  isTagRequired: boolean;
  isBoolTagRequired: boolean = true;
  strStatementCycle: string;
  strstatementDeliveryOption: string
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse
  getAccountType: string = "NONREVENUE";

  constructor(private commonService: CommonService,
    private customerContext: CustomerContextService,
    private customerServiceService: CustomerserviceService
    , private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    
    this.customerContext.currentContext
      .subscribe(
      customerContext => {
        this.customerContextResponse = customerContext;
        if (this.customerContextResponse) {
          this.isTagRequired = this.customerContextResponse.IsTagRequired;
          this.customerId = this.customerContextResponse.AccountId;
          if (this.customerContextResponse.ParentId > 0) {
            this.customerId = this.customerContextResponse.ParentId;
            this.customertype = this.customerContextResponse.AccountType;
          }
          this.customertype = this.customerContextResponse.AccountType;

        }
      });
    if (!this.commonService.isAllowed(Features[Features.DELIVERYOPTIONS], Actions[Actions.VIEW], this.customerContextResponse.AccountStatus)) {
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.DELIVERYOPTIONS], Actions[Actions.TAGDELIVERY], this.customerContextResponse.AccountStatus);
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.DELIVERYOPTIONS], Actions[Actions.DOCUMENTDELIVERY], this.customerContextResponse.AccountStatus);
    this.tranponderPurchasemethodfrom = new FormGroup({
      tranponderPurchase: new FormControl('')
    });
    if (this.isTagRequired == true) {
      this.isBoolTagRequired = true;
      this.tranponderPurchasemethodfrom = new FormGroup({
        tranponderPurchase: new FormControl('')
      });
      this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].setValidators([Validators.compose([Validators.required])]);
      this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].updateValueAndValidity();
    }
    else {
      this.isBoolTagRequired = false;
      this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].clearValidators();
      this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].updateValueAndValidity();
    }
    this.deliveryOptionsform = new FormGroup({
      statementDeliveryOption: new FormControl(''),
      invoiceIntervalValue: new FormControl(''),
      invoiceDays: new FormControl(''),
      invoiceAmount: new FormControl('', []),
      statementCycle: new FormControl('')
    });
    let userEvent = this.userEvents();
    this.bindDataOnLoad("Load", userEvent);
    this.materialscriptService.material();
  }

  bindDropDowns(): void {
    this.statementDeliveryOption();
    this.tagDeliveryOption();
    this.statementCycle();
    this.bindInvoiceTypes();
    var num: number = 1;
    var i: number;
    var Maxnumber = 28;
    for (i = num; i <= 28; i++) {
      this.responseInvoice = <IArray>{};
      this.responseInvoice.Key = i.toString();
      this.responseInvoice.Value = i.toString();
      this.responseInvoiceDays.push(this.responseInvoice);
    }
  }

  bindInvoiceTypes() {
    this.commonService.getInvoiveCycleTypes().subscribe(
      res => {
        console.log(res);
        this.invoiceCycle = res;
      }
    );
    this.materialscriptService.material();
  }
  statementDeliveryOption() {
    this.commonService.getStatementDelivery().subscribe(
      res => {
        this.responseStatementDeliveryOption = res;
      }
    );
  }

  tagDeliveryOption(): void {
    this.commonService.getTransponderPurchasemethod().subscribe(
      res => {
        this.responseTagDeliveryOption = res;
      }
    );
  }

  statementCycle(): void {
    this.Request = <ICommon>{};
    this.Request.LookUpTypeCode = "StatementCycle";
    this.commonService.getStatementCycle().subscribe(
      res => {
        this.responsestatementCycle = res;
        this.responsestatementCycle = this.responsestatementCycle.filter(f => f.Key != "N");
      }
    );
  }

  bindDataOnLoad(event: string, userEvent: IUserEvents): void {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsPlanBasedStmt).subscribe(
      res => {
        this.isPlanBasedStmt = res;
        if (this.customertype.toUpperCase() == "PREPAID") {
          this.isPrepaid = true;
          if (this.isPlanBasedStmt == 1) {
            this.isDisabled = true;
          }
        }
        else {
          this.isPostpaid = true;
        }
        this.bindDropDowns();
        this.bindCustomerData(this.customerId, event, userEvent);
      }
    );
    this.materialscriptService.material();
  }

  bindCustomerData(CustomerId, event, userEvent: IUserEvents) {
    this.customerServiceService.getCustomerData(CustomerId, userEvent).subscribe(
      res => {
        this.customerAttributesResponse = res;
        if (this.customerAttributesResponse != undefined) {
          this.strStatementDelivery = this.customerAttributesResponse.StatementDelivery;

          if (this.strStatementDelivery == '' || this.strStatementDelivery == null) {

          } else {
            this.deliveryOptionsform.patchValue({
              statementDeliveryOption: this.strStatementDelivery
            });
          }
          if (event != "reset") {
            this.strTranponderPurchasemethod = this.customerAttributesResponse.TranponderPurchasemethod;
            if (this.strTranponderPurchasemethod == '' || this.strTranponderPurchasemethod == null) {
            } else {
              this.tranponderPurchasemethodfrom.setValue({
                tranponderPurchase: this.strTranponderPurchasemethod
              });
            }
          }
          if (this.customertype.toUpperCase() == "PREPAID") {
            if (this.isPlanBasedStmt == 0) {
              this.strStatementCycle = this.customerAttributesResponse.StatementCycle;
              this.deliveryOptionsform.patchValue({
                statementCycle: this.strStatementCycle
              });
            }
            else {
              this.customerServiceService.getCustomerCycle(CustomerId).subscribe(
                res => {
                  this.strStatementCycle = res;
                  this.deliveryOptionsform.patchValue({
                    statementCycle: this.strStatementCycle
                  });
                }
              );
            }

          }
          else {
            this.customerServiceService.getCustomerCycle(CustomerId).subscribe(
              response => {
                console.log(response);
                this.invoiceInterval = response.toString();
                if (this.invoiceInterval != "0") {
                  if (this.invoiceInterval == "1") {
                    this.isInvoiceDisable = false;
                    this.isInvoiceDays = false;
                    this.isInvoiceAmount = false;
                  }
                }
                else {
                  this.invoiceInterval = this.customerAttributesResponse.InvoiceIntervalID.toString();
                  if (this.invoiceInterval == "2") {
                    this.deliveryOptionsform.controls['invoiceDays'].clearValidators();
                    this.deliveryOptionsform.controls['invoiceDays'].updateValueAndValidity();
                    this.isInvoiceDisable = true;
                    this.isInvoiceDays = false;
                    this.isInvoiceAmount = true;
                    this.deliveryOptionsform.controls['invoiceAmount'].setValidators([Validators.compose([Validators.required])]);
                    if (this.customerAttributesResponse.InvoiceAmount.toString() == '')
                      this.invoiceAmount = 0
                    else
                      this.invoiceAmount = this.customerAttributesResponse.InvoiceAmount;
                    this.deliveryOptionsform.patchValue({
                      invoiceAmount: this.invoiceAmount,
                    });
                    let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
                  }
                  else if (this.invoiceInterval == "5") {
                    this.deliveryOptionsform.controls['invoiceAmount'].clearValidators();
                    this.deliveryOptionsform.controls['invoiceAmount'].updateValueAndValidity();
                    this.deliveryOptionsform.controls['invoiceDays'].setValidators([Validators.compose([Validators.required])]);
                    this.isInvoiceDisable = true;
                    this.isInvoiceDays = true;
                    this.isInvoiceAmount = false;
                    if (this.customerAttributesResponse != null) {
                      if (this.customerAttributesResponse.InvoiceDay.toString() == "0" ||
                        this.customerAttributesResponse.InvoiceDay == undefined)
                        this.invoiceDays = "1"
                      else
                        this.invoiceDays = this.customerAttributesResponse.InvoiceDay.toString();
                      this.deliveryOptionsform.patchValue({
                        invoiceDays: this.invoiceDays,
                      });
                      let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
                    }
                    else
                      this.invoiceDays = "1"
                  }
                  else {
                    this.deliveryOptionsform.controls['invoiceDays'].clearValidators();
                    this.deliveryOptionsform.controls['invoiceAmount'].clearValidators();
                    this.isInvoiceDisable = true;
                    this.isInvoiceDays = false;
                    this.isInvoiceAmount = false;
                  }
                  this.invoiceCycle = this.invoiceCycle.filter(f => f.CycleID != 1 && f.CycleID != 3);
                }
                this.deliveryOptionsform.patchValue({
                  //statementDeliveryOption: this.strStatementDelivery,
                  invoiceIntervalValue: this.invoiceInterval,
                  invoiceDays: this.invoiceDays,
                  invoiceAmount: this.invoiceAmount,
                  //statementCycle: this.strStatementCycle
                });
              });
          }
          if (this.customerContextResponse.RevenueCategory != undefined) {
            if (this.customerContextResponse.RevenueCategory.toString().toUpperCase() == RevenueCategory[RevenueCategory.NonRevenue].toUpperCase()) {
              this.isNonRevenue = true;
            }
          }
        }
      });
      this.materialscriptService.material();
  }

  updateStatementDeliveryOptions() {
    let userEvent = this.userEvents();
    if (this.customertype.toUpperCase() == "PREPAID") {
      if (this.strStatementDelivery != this.deliveryOptionsform.controls['statementDeliveryOption'].value)
        var isStatementChanged = true;
      if (this.strStatementCycle != this.deliveryOptionsform.controls['statementCycle'].value)
        var isCycleChanged = true;
      if (!isStatementChanged && !isCycleChanged) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "No information to update";
        this.msgTitle = '';
        return;
      }
      else {
        if (this.deliveryOptionsform.valid) {
          if (this.deliveryOptionsform.controls['statementDeliveryOption'].value > 0)
            this.customerAttributesRequest.StatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
          if (this.deliveryOptionsform.controls['statementCycle'].value > 0) {
            this.customerAttributesRequest.StatementCycle = this.deliveryOptionsform.controls['statementCycle'].value;
          }
          this.customerAttributesRequest = <ICustomerAttributeRequest>{};
          this.customerAttributesRequest.AccountId = this.customerId;
          this.customerAttributesRequest.UpdatedUser = this.context.customerContext.userName;
          this.customerAttributesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.customerAttributesRequest.SubSystem = SubSystem[SubSystem.CSC]
          this.customerAttributesRequest.UserId = this.context.customerContext.userId;
          this.customerAttributesRequest.LoginId = this.context.customerContext.loginId;
          this.customerAttributesRequest.AccountType = this.customertype.toUpperCase();
          this.customerAttributesRequest.StatementCycle = this.deliveryOptionsform.controls['statementCycle'].value;
          this.customerAttributesRequest.StatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
          this.customerAttributesRequest.isStatementChanged = isStatementChanged;
          this.customerAttributesRequest.isCycleChanged = isCycleChanged;
          userEvent.ActionName = Actions[Actions.DOCUMENTDELIVERY];
          this.customerServiceService.updateStatementDeliveryOption(this.customerAttributesRequest, userEvent).subscribe(
            res => {
              this.strStatementCycle = this.deliveryOptionsform.controls['statementCycle'].value;
              this.strStatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Statement Delivery Option has been updated successfully";
              this.msgTitle = '';
              //return;
            }, (err) => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText.toString();
              this.msgTitle = '';
              // console.log(err.statusText.toString());
            }
          );
        }
      }
    }
    else {
      if (this.strStatementDelivery != this.deliveryOptionsform.controls['statementDeliveryOption'].value)
        var isStatementChanged = true;
      if (this.invoiceInterval != this.deliveryOptionsform.controls['invoiceIntervalValue'].value)
        var isCycleChanged = true;
      if (this.invoiceAmount != this.deliveryOptionsform.controls['invoiceAmount'].value)
        var isAmountChanged = true;
      if (this.invoiceDays != this.deliveryOptionsform.controls['invoiceDays'].value)
        var isDayChanged = true;
      if (!isStatementChanged && !isCycleChanged && !isAmountChanged && !isDayChanged) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "No information to update";
        this.msgTitle = '';
        return;
      }
      else {
        if (this.deliveryOptionsform.valid) {
          this.customerAttributesRequest = <ICustomerAttributeRequest>{};
          if (this.deliveryOptionsform.controls['statementDeliveryOption'].value > 0)
            this.customerAttributesRequest.StatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
          if (this.deliveryOptionsform.controls['invoiceIntervalValue'].value > 0) {
            this.customerAttributesRequest.InvoiceIntervalID = this.deliveryOptionsform.controls['invoiceIntervalValue'].value;
            if (this.deliveryOptionsform.controls['invoiceIntervalValue'].value == 2) {
              this.customerAttributesRequest.InvoiceDay = "0";
              this.customerAttributesRequest.InvoiceAmount = this.deliveryOptionsform.controls['invoiceAmount'].value;
            }
            else if (this.deliveryOptionsform.controls['invoiceIntervalValue'].value == 5) {
              this.customerAttributesRequest.InvoiceDay = this.deliveryOptionsform.controls['invoiceDays'].value;
              this.customerAttributesRequest.InvoiceAmount = 0;
            }
            else {
              this.customerAttributesRequest.InvoiceDay = "0";
              this.customerAttributesRequest.InvoiceAmount = 0;
            }
          }
          this.customerAttributesRequest.AccountId = this.customerId;
          this.customerAttributesRequest.UpdatedUser = this.context.customerContext.userName;
          this.customerAttributesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.customerAttributesRequest.SubSystem = SubSystem[SubSystem.CSC]
          this.customerAttributesRequest.UserId = this.context.customerContext.userId;
          this.customerAttributesRequest.LoginId = this.context.customerContext.loginId;
          this.customerAttributesRequest.AccountType = this.customertype.toUpperCase();
          this.customerAttributesRequest.StatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
          this.customerAttributesRequest.isStatementChanged = isStatementChanged;
          this.customerAttributesRequest.isCycleChanged = isCycleChanged;
          this.customerAttributesRequest.isAmountChanged = isAmountChanged;
          this.customerAttributesRequest.isDayChanged = isDayChanged;
          userEvent.ActionName = Actions[Actions.DOCUMENTDELIVERY];
          this.customerServiceService.updateStatementDeliveryOption(this.customerAttributesRequest, userEvent).subscribe(
            res => {
              this.strStatementDelivery = this.deliveryOptionsform.controls['statementDeliveryOption'].value;
              this.invoiceInterval = this.deliveryOptionsform.controls['invoiceIntervalValue'].value;
              this.invoiceDays = this.deliveryOptionsform.controls['invoiceDays'].value;
              this.invoiceAmount = this.deliveryOptionsform.controls['invoiceAmount'].value;
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Statement Delivery Option has been updated successfully";
              this.msgTitle = '';
            }, (err) => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText.toString();
              this.msgTitle = '';
            }
          );
        }
      }
    }
  }

  resetDeliveryOptions() {
    this.bindDataOnLoad("reset", null);
  }

  resetTranponderPurchase() {
    this.tranponderPurchasemethodfrom.setValue({
      tranponderPurchase: this.strTranponderPurchasemethod
    });
  }

  bindInvoiceDetails() {
    var invoiceInterVal = this.deliveryOptionsform.controls['invoiceIntervalValue'].value;
    if (invoiceInterVal != '') {
      if (invoiceInterVal == "2") {
        this.deliveryOptionsform.controls['invoiceAmount'].setValidators([Validators.compose([Validators.required])]);
        this.deliveryOptionsform.controls['invoiceDays'].clearValidators();
        this.deliveryOptionsform.controls['invoiceDays'].updateValueAndValidity();
        this.isInvoiceDisable = true;
        this.isInvoiceDays = false;
        this.isInvoiceAmount = true;
        if (this.customerAttributesResponse.InvoiceAmount == 0) {
          this.deliveryOptionsform.controls['invoiceAmount'].reset();
          // this.deliveryOptionsform.addControl('invoiceAmount', new FormControl('', [Validators.required]));
        }
        else
          this.invoiceAmount = this.customerAttributesResponse.InvoiceAmount;

      }
      else if (invoiceInterVal == "5") {
        this.deliveryOptionsform.controls['invoiceDays'].setValidators([Validators.compose([Validators.required])]);
        this.deliveryOptionsform.controls['invoiceAmount'].clearValidators();
        this.deliveryOptionsform.controls['invoiceAmount'].updateValueAndValidity();
        this.isInvoiceDisable = true;
        this.isInvoiceDays = true;
        this.isInvoiceAmount = false;
        if (this.customerAttributesResponse != null) {
          if (this.customerAttributesResponse.InvoiceDay.toString() == "0" ||
            this.customerAttributesResponse.InvoiceDay.toString() == undefined)
            this.invoiceDays = "1"
          else
            this.invoiceDays = this.customerAttributesResponse.InvoiceDay.toString();
          this.deliveryOptionsform.patchValue({
            invoiceDays: this.invoiceDays,
          });
        }
        else {
          this.invoiceDays = "1"
        }
      }
      else {
        this.deliveryOptionsform.controls['invoiceDays'].clearValidators();
        this.deliveryOptionsform.controls['invoiceAmount'].clearValidators();
        this.deliveryOptionsform.controls['invoiceDays'].updateValueAndValidity();
        this.deliveryOptionsform.controls['invoiceAmount'].updateValueAndValidity();
        this.isInvoiceDisable = true;
        this.isInvoiceDays = false;
        this.isInvoiceAmount = false;
      }
    }
    else {
      this.isInvoiceAmount = false;
      this.isInvoiceDays = false;
    }
    this.materialscriptService.material();
  }

  updateTagDeliveryOptions() {
    if (this.strTranponderPurchasemethod == this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].value) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "No information to update";
      this.msgTitle = '';
      return;
    }
    else {
      if (this.tranponderPurchasemethodfrom.valid) {
        this.customerAttributesRequest = <ICustomerAttributeRequest>{};
        if (this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].value != '') {
          this.strTranponderPurchasemethod = this.customerAttributesRequest.TranponderPurchasemethod = this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].value;
        }
        this.customerAttributesRequest.AccountId = this.customerId;
        this.customerAttributesRequest.UpdatedUser = this.context.customerContext.userName;
        this.customerAttributesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.customerAttributesRequest.SubSystem = SubSystem[SubSystem.CSC]
        this.customerAttributesRequest.UserId = this.context.customerContext.userId;
        this.customerAttributesRequest.LoginId = this.context.customerContext.loginId;
        this.customerAttributesRequest.AccountType = this.customertype.toUpperCase();
        let userEvent = this.userEvents();
        userEvent.ActionName = Actions[Actions.TAGDELIVERY];
        this.customerServiceService.updateTransponderPurchaseMethod(this.customerAttributesRequest, userEvent).subscribe(
          res => {
            this.strTranponderPurchasemethod = this.tranponderPurchasemethodfrom.controls['tranponderPurchase'].value;
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Tag Delivery Option has been updated successfully";
            this.msgTitle = '';
          }, (err) => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText.toString();
            this.msgTitle = '';
            // console.log(err.statusText.toString());
          }
        );
      }
    }
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.DELIVERYOPTIONS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = this.customerContextResponse.AccountId;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

export interface IArray {
  Key: string;
  Value: string;
}

