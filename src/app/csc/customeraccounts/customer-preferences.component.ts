import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/services/common.service';
import { IinvoiceResponse } from '../../sac/plans/models/invoicecycleresponse';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';
import { ICommon, ICommonResponse } from '../../shared/models/commonresponse';
import { LookupTypeCodes, ActivitySource } from '../../shared/constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IInvoiceCycle } from '../customerdetails/models/InvoiceCycle';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { Router } from '@angular/router';
import { CustomerAdditionalInformation } from './models/additionalinformationresponse';
import { ICustomerAttributeRequest } from '../../shared/models/customerattributerequest';
import { AdjustmentApprovedStatus, TollType } from './constants';
import { SubSystem, Features, SubFeatures, Actions } from '../../shared/constants';
import { IPlanResponse } from '../../sac/plans/models/plansresponse';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICustomerResponse } from '../../shared/models/customerresponse';
import { PlansService } from '../../sac/plans/services/plans.service';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-customer-preferences',
  templateUrl: './customer-preferences.component.html',
  styleUrls: ['./customer-preferences.component.scss']
})
export class CustomerPreferencesComponent implements OnInit {

  invoiceTypes: IinvoiceResponse[];
  objIMakePaymentrequest: IMakePaymentrequest = <IMakePaymentrequest>{}

  pattren = "[0-9]+(\.[0-9][0-9]?)?";
  commonRequest: ICommon = <ICommon>{};
  objCommonResponseLanguage: ICommonResponse[];
  hearAboutUs: any[];
  statementDeleveryOption: any[];
  objIInvoiceCycle: IInvoiceCycle[];
  objStatementCycle: StatementCycle[];
  scheduleDays = new Array();
  isInvoiceAmountTextfeild: boolean = false;
  isInvoiceDayFeild: boolean = false;
  revenueCategoty: string;

  customerAdditionalInformation: CustomerAdditionalInformation;

  isPostpaidCustomer: boolean = false;
  accountId: number;
  planID: number;
  planName: string;
  isTagRequired: boolean;
  isTagMessage: string;
  txnAmount: number;
  fee: string;
  discount: string;
  prefrenecesForm: FormGroup;
  isPaymentDisabled: boolean = false;

  // ng Model
  ngSatamentCycle: string;
  ngLanguagePref: string;
  ngInvoiceIntrervalType: number = 2;
  ngInvoiceDeliveryOption: string;
  ngStatementDeliveryOption: string;
  ngHearAboutus: string = "";
  ngFriendshipAccNumber: any;
  ngInvoiceScheduleDay: number = 1;
  icustomerAttributeRequest: ICustomerAttributeRequest = <ICustomerAttributeRequest>{};
  message: string;
  plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
  sessionContextResponse: IUserresponse
  isPlanBasedStmt: number = 0;
  //constants


  msgFlag: boolean = false;
  msgType: string
  msgTitle: string;
  msgDesc: string;

  constructor(private common: CommonService, private customerAccountsService: CustomerAccountsService
    , private createAccountService: CreateAccountService
    , private router: Router
    , private sessionService: SessionService
    , private planService: PlansService, 
    private materialscriptService:MaterialscriptService
  ) {
    this.prefrenecesForm = new FormGroup({
      'langPrefrence': new FormControl(''),
      'hearAbout': new FormControl(''),
      'statementDelivOption': new FormControl(''),//statementCycle
      'invoiceDeliveryOption': new FormControl(''),
      'invoiceTypeInterval': new FormControl('', [Validators.required]),
      'statementCycle': new FormControl(''),
      'referalTextbox': new FormControl(''),
      'invoiceAmountTextbox': new FormControl(''),
      'invoiceScheduleDay': new FormControl('')
    });
  }

  ngOnInit() {
    let a=this;
    setTimeout(function() {
    a.materialscriptService.material();
    }, 100);
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.createAccountService.currentContext
      .subscribe(customerContext => { this.objIMakePaymentrequest = customerContext; }
      );
    if (this.objIMakePaymentrequest == undefined) {
      this.objIMakePaymentrequest = <IMakePaymentrequest>{};
      let link = ['/csc/customerAccounts/create-account/'];
      this.router.navigate(link);
    }
    else {
      this.accountId = this.objIMakePaymentrequest.CustomerId;
      this.planID = this.objIMakePaymentrequest.PlanID;
      this.txnAmount = this.objIMakePaymentrequest.TxnAmount;
      this.isPostpaidCustomer = this.objIMakePaymentrequest.IsPostpaidCustomer;
    }
    this.getAppKey();
    this.getInvoiceDay();
    this.getLanguagePreference();
    this.getHearAboutUs();
    this.getStatementDeliveryOption()
    this.getInvoiceCycle();
    this.getStatementCycleTypes();
    this.populateCustomerDetails();
    this.customerAccountsService.getAllPlansWithFees().subscribe(res => {
      this.plansResponse = res
      this.planName = this.plansResponse.filter(x => x.PlanId == this.planID)[0].Name;
      this.isTagRequired = this.plansResponse.filter(x => x.PlanId == this.planID)[0].IsTagRequired;
      this.fee = this.plansResponse.filter(x => x.PlanId == this.planID)[0].FeeDesc;
      this.discount = this.plansResponse.filter(x => x.PlanId == this.planID)[0].DiscountDesc;
      if (this.isTagRequired) { this.isTagMessage = "(Transponder Required)"; }
    });
    this.objIMakePaymentrequest.StatementCycle = 'M';
    this.objIMakePaymentrequest.InvoiceIntervalId = 1;
    this.objIMakePaymentrequest.InvoiceAmount = 0;
    this.objIMakePaymentrequest.InvoiceDay = "0";
    this.getCustomerAdditionalInformation(this.accountId);
    this.createAccountService.changeResponse(this.objIMakePaymentrequest);
  }

  getAppKey() {
    this.common.getApplicationParameterValue(ApplicationParameterkey.IsPlanBasedStmt).subscribe(res => this.isPlanBasedStmt = res);
  }

  getLanguagePreference() {
    this.commonRequest.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.Languages];
    this.common.getLanguagePref(this.commonRequest).subscribe(
      resut => {
        this.objCommonResponseLanguage = resut;
      });
  }

  getStatementCycleTypes() {
    this.customerAccountsService.getStatementCycle().subscribe(result => {
      this.objStatementCycle = result;
      this.objStatementCycle = this.objStatementCycle.filter(x => x.CycleType != 'N');
    });
  }

  getInvoiceDay() {
    for (var i = 2; i < 29; i++) {
      this.scheduleDays.push(i);
    }
  }

  getHearAboutUs() {
    this.common.getAboutHearLookups().subscribe(resut => {
      this.hearAboutUs = resut;
    });
  }

  getStatementDeliveryOption() {
    this.common.getStatementDeliveryOption().subscribe(result => {
      this.statementDeleveryOption = result;
    });
  }

  cancel() {
    this.msgFlag = true;
    this.msgType = 'alert'
    this.msgDesc = "Your Information no longer exists, if you cancel your application. Are you sure you want to Cancel?";
  }
  cancelClick(event) {
    if (event) {
      this.objIMakePaymentrequest = <IMakePaymentrequest>{};
      this.createAccountService.changeResponse(this.objIMakePaymentrequest);
      let link = ['/csc/customeraccounts/create-account-personal-information/'];
      this.router.navigate(link);
    }
    else {
      this.msgFlag = false;
    }

  }
  getCustomerAdditionalInformation(accountId: number) {
    this.customerAccountsService.getCustomerAdditionalInformation(accountId).subscribe(result => {
      this.customerAdditionalInformation = result;
      // this.prefrenecesForm.patchValue({
      //   langPrefrence: this.customerAdditionalInformation.PreferedLanguange,
      //   hearAbout: this.customerAdditionalInformation.SourceOfChannel,
      //   statementDelivOption: this.customerAdditionalInformation.StatementDelivery,
      //   invoiceDeliveryOption: this.customerAdditionalInformation.StatementDelivery,
      //   invoiceTypeInterval: this.customerAdditionalInformation.InvoiceIntervalID,
      //   statementCycle: this.customerAdditionalInformation.StatementCycle,
      //   referalTextbox: this.customerAdditionalInformation.ReferralCustomerId,
      //   invoiceAmountTextbox: this.customerAdditionalInformation.InvoiceAmount,
      //   invoiceScheduleDay: this.customerAdditionalInformation.InvoiceDay
      // });

      if (this.isPlanBasedStmt > 0) {
        this.planService.getPlanByPK(this.planID.toString()).subscribe(
          res => {
            if (res) {
              var planRes = <IPlanResponse>res;
              if (planRes.StatementCycle != "" && planRes.StatementCycle != null) {
                this.prefrenecesForm.controls['statementCycle'].setValidators([]);
                this.prefrenecesForm.controls["statementCycle"].setValue(planRes.StatementCycle);
                this.prefrenecesForm.controls["statementCycle"].disable();
              }
              else {
                this.prefrenecesForm.controls["statementCycle"].enable();
                if (this.customerAdditionalInformation.StatementCycle == '') {
                  this.ngSatamentCycle = 'M';
                }
                else {
                  this.ngSatamentCycle = this.customerAdditionalInformation.StatementCycle;
                }
              }
            }
          });
      }
      else {
        this.prefrenecesForm.controls["statementCycle"].enable();
        if (this.customerAdditionalInformation.StatementCycle == '') {
          this.ngSatamentCycle = 'M';
        }
        else {
          this.ngSatamentCycle = this.customerAdditionalInformation.StatementCycle;
        }
      }


      if (this.customerAdditionalInformation.ReferralCustomerId > 0)
        this.ngFriendshipAccNumber = this.customerAdditionalInformation.ReferralCustomerId;
      else
        this.ngFriendshipAccNumber = "";

      if (this.customerAdditionalInformation.SourceOfChannel == '') {
        this.ngHearAboutus = 'W'
      }
      else {
        this.ngHearAboutus = this.customerAdditionalInformation.SourceOfChannel;
      }

      if (this.customerAdditionalInformation.PreferedLanguange == '') {
        this.ngLanguagePref = 'English'
      }
      else {
        this.ngLanguagePref = this.customerAdditionalInformation.PreferedLanguange;
      }

      this.planService.getPlanByPK(this.planID.toString()).subscribe(
        res => {
          if (res) {
            var planRes = <IPlanResponse>res;
            if (planRes.InvoiceIntervalId != null && planRes.InvoiceIntervalId != 0) {
              this.prefrenecesForm.controls['invoiceTypeInterval'].setValidators([]);
              this.prefrenecesForm.controls['invoiceTypeInterval'].setValue(planRes.InvoiceIntervalId);
              this.prefrenecesForm.controls["invoiceTypeInterval"].disable();
            }
            else {
              this.prefrenecesForm.controls["invoiceTypeInterval"].enable();
              this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
              if (this.customerAdditionalInformation.InvoiceIntervalID == 0) {
                this.ngInvoiceIntrervalType = 2;
                this.isInvoiceAmountTextfeild = true;
                this.isInvoiceDayFeild = false;
                this.isValidInput();
              }
              else {
                this.ngInvoiceIntrervalType = this.prefrenecesForm.value.invoiceTypeInterval = this.customerAdditionalInformation.InvoiceIntervalID;
                if (this.ngInvoiceIntrervalType == 2) {
                  this.isInvoiceAmountTextfeild = true;
                  this.prefrenecesForm.patchValue({
                    invoiceAmountTextbox: this.customerAdditionalInformation.InvoiceAmount
                  });
                  this.prefrenecesForm.value.invoiceAmountTextbox = this.customerAdditionalInformation.InvoiceAmount;
                  this.isInvoiceDayFeild = false;
                  this.prefrenecesForm.controls['invoiceScheduleDay'].setValue("1");
                  this.isValidInput();
                }
                else if (this.ngInvoiceIntrervalType == 5) {
                  this.isInvoiceDayFeild = true;
                  this.ngInvoiceScheduleDay = parseInt(this.customerAdditionalInformation.InvoiceDay);
                  this.isInvoiceAmountTextfeild = false;
                  this.prefrenecesForm.controls['invoiceAmountTextbox'].setValue("");
                  this.prefrenecesForm.controls['invoiceAmountTextbox'].setValidators([]);
                }
                else {
                  this.isInvoiceDayFeild = false;
                  this.prefrenecesForm.controls['invoiceScheduleDay'].setValue("1");
                  this.prefrenecesForm.controls['invoiceAmountTextbox'].setValue("");
                  this.isInvoiceAmountTextfeild = false;
                }
              }
            }
          }

        });


      if (this.customerAdditionalInformation.StatementDelivery == '') {
        this.ngInvoiceDeliveryOption = 'Email'
      }
      else {
        this.ngInvoiceDeliveryOption = this.customerAdditionalInformation.StatementDelivery;
      }

      if (this.customerAdditionalInformation.StatementDelivery == '') {
        this.ngStatementDeliveryOption = 'Email';
      }
      else {
        this.ngStatementDeliveryOption = this.customerAdditionalInformation.StatementDelivery;
      }
    });

  }
  populateCustomerDetails() {
    var customerResponse: ICustomerResponse;
    // getting customer details
    this.customerAccountsService.getAccountDetailsById(this.accountId).subscribe(res => {
      customerResponse = res;
      if (res) {
        this.revenueCategoty = customerResponse.RevenueCategory;
      }
    });
  }
  getInvoiceCycle() {
    this.common.getInvoiveCycleTypes().subscribe(res => {
      this.invoiceTypes = res;
      this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 3);
    });
  }

  navigateToVehicleInformation() {
    let link = ['/csc/customeraccounts/create-account-vehicle-information/'];
    this.router.navigate(link);
  }

  updateCustomerInformation() {
    if (this.isValidInput) {
      this.icustomerAttributeRequest.AccountId = this.accountId;
      this.icustomerAttributeRequest.IsCreateAccountUserActivity = true;
      this.icustomerAttributeRequest.SourceOfChannel = this.prefrenecesForm.value.hearAbout;
      this.icustomerAttributeRequest.RevenueCategory = this.revenueCategoty;
      this.icustomerAttributeRequest.ReferralCustomerId = this.prefrenecesForm.value.referalTextbox;
      this.icustomerAttributeRequest.RequestDate=new Date().toLocaleTimeString();
      this.icustomerAttributeRequest.RefIndicator = 0;

      this.icustomerAttributeRequest.RequestStatus = AdjustmentApprovedStatus[AdjustmentApprovedStatus.Pending];
      this.icustomerAttributeRequest.UpdatedUser = this.sessionContextResponse.userName;
      this.icustomerAttributeRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.icustomerAttributeRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.icustomerAttributeRequest.UserId = this.accountId;
      this.icustomerAttributeRequest.LoginId = this.sessionContextResponse.loginId;
      this.icustomerAttributeRequest.PreferedLanguange = this.prefrenecesForm.value.langPrefrence;
      this.icustomerAttributeRequest.IsHearingImpirement = false;
      this.icustomerAttributeRequest.IsSupervisor = false;

      if (this.isPostpaidCustomer) {
        this.icustomerAttributeRequest.InvoiceIntervalID = this.prefrenecesForm.value.invoiceTypeInterval;
        this.icustomerAttributeRequest.StatementDelivery = this.prefrenecesForm.value.invoiceDeliveryOption;
        this.icustomerAttributeRequest.ParentPaln = TollType[TollType.POSTPAID];
        if (this.prefrenecesForm.value.invoiceTypeInterval == 2) {
          this.icustomerAttributeRequest.InvoiceAmount = this.prefrenecesForm.value.invoiceAmountTextbox;
          this.icustomerAttributeRequest.InvoiceDay = this.prefrenecesForm.value.invoiceScheduleDay;;
        }
        else if (this.prefrenecesForm.value.invoiceTypeInterval == 5) {
          this.icustomerAttributeRequest.InvoiceAmount = 0;
          this.icustomerAttributeRequest.InvoiceDay = this.prefrenecesForm.value.invoiceScheduleDay;
        }
        else {
          this.icustomerAttributeRequest.InvoiceAmount = 0;
          this.icustomerAttributeRequest.InvoiceDay = "0";
        }
        this.icustomerAttributeRequest.StatementCycle = 'M';
      }
      else {
        // console.log("this.ngSatamentCycle"+this.ngSatamentCycle)
        this.icustomerAttributeRequest.ParentPaln = TollType[TollType.PREPAID];
        this.icustomerAttributeRequest.StatementCycle = this.ngSatamentCycle;
        this.icustomerAttributeRequest.StatementDelivery = this.prefrenecesForm.value.statementDelivOption;
        this.icustomerAttributeRequest.InvoiceIntervalID = 0;
        this.icustomerAttributeRequest.InvoiceAmount = 0;
        this.icustomerAttributeRequest.InvoiceDay = "0";
      }
      this.customerAccountsService.updateAdditionalInformation(this.icustomerAttributeRequest).subscribe(
        result => {
          if (result) {
            this.objIMakePaymentrequest.StatementCycle = this.icustomerAttributeRequest.StatementCycle;
            this.objIMakePaymentrequest.InvoiceIntervalId = this.icustomerAttributeRequest.InvoiceIntervalID;
            this.objIMakePaymentrequest.InvoiceAmount = this.icustomerAttributeRequest.InvoiceAmount;
            this.objIMakePaymentrequest.InvoiceDay = this.icustomerAttributeRequest.InvoiceDay;
            this.createAccountService.changeResponse(this.objIMakePaymentrequest);
            this.insertUserAction();
            this.router.navigateByUrl('csc/customeraccounts/payment-modes');
          }
        },
        res => {
          this.msgType = 'error'
          this.msgFlag = true;
          this.msgDesc = res.statusText;
          return;
        }
      );

    }
  }

  getInvoiceInterval(invoceInterval: number) {
    if (invoceInterval == 2) {
      this.isInvoiceAmountTextfeild = true;
      this.isInvoiceDayFeild = false;
      this.prefrenecesForm.controls['invoiceScheduleDay'].setValue("1");
      this.prefrenecesForm.controls['invoiceAmountTextbox'].setValidators([Validators.required, Validators.pattern(this.pattren)]);
      this.isValidInput();
    }
    else if (invoceInterval == 5) {
      this.isInvoiceDayFeild = true;
      this.isInvoiceAmountTextfeild = false;
      this.prefrenecesForm.controls['invoiceAmountTextbox'].setValue("");
      this.prefrenecesForm.controls['invoiceAmountTextbox'].setValidators([]);
      if (!this.prefrenecesForm.controls['invoiceTypeInterval'].valid) {
        this.isPaymentDisabled = true;
      }
      else
        this.isPaymentDisabled = false;
    }
    else {
      this.isInvoiceDayFeild = false;
      this.prefrenecesForm.controls['invoiceScheduleDay'].setValue("1");
      this.prefrenecesForm.controls['invoiceAmountTextbox'].setValue("");
      this.isInvoiceAmountTextfeild = false;
      if (!this.prefrenecesForm.controls['invoiceTypeInterval'].valid) {
        this.isPaymentDisabled = true;
      }
      else
        this.isPaymentDisabled = false;
    }

  }

  isValidInput() {
    if (this.isPostpaidCustomer) {
      this.prefrenecesForm.controls['invoiceAmountTextbox'].setValidators([Validators.required, Validators.pattern(this.pattren)]);
      var temp = true;
      if (this.prefrenecesForm.controls['invoiceAmountTextbox'].valid) {
        temp = true;
      }
      else
        temp = false;
      var amount = this.prefrenecesForm.controls['invoiceAmountTextbox'].value;
      // if (amount.match(/^\d{1}$/)) {
      //   temp = true;
      // }
      // else if (amount.match(/^\d{2}$/)) {
      //   temp = true;
      // }
      // else if (amount.match(/^\d{3}$/)) {
      //   temp = true;
      // }
      // else if (amount.match(/^\d{4}$/)) {
      //   temp = true;
      // }
      // else
      //   temp = false;

      if (this.prefrenecesForm.value.invoiceTypeInterval == 0 || amount == 0 || !temp) {
        this.isPaymentDisabled = true;
        return false;
      }
      else {
        this.isPaymentDisabled = false;
        return true;
      }
    }
  }

  checkStatementCycle(statementCycle: string) {
    if (this.prefrenecesForm.value.statementCycle == '') {
      this.isPaymentDisabled = true;
    }
    else
      this.isPaymentDisabled = false;
  }

  // insert the user action 
  insertUserAction() {
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.objIMakePaymentrequest.FeatureName;
    userEvents.SubFeatureName = SubFeatures[SubFeatures.PREFERENCES]
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.common.checkPrivilegeswithAuditLog(userEvents).subscribe();
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
}


export class StatementCycle {
  CycleID: number
  CycleType: string
  CycleDescription: string
}