import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { IUserEvents } from '../../shared/models/userevents';
import { Actions, ActivitySource, Features, SubSystem, defaultCulture } from '../../shared/constants';
import { ICustomerAttributeRequest } from '../../shared/models/customerattributerequest';
import { CommonService } from '../../shared/services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ICustomerAttributeResponse } from '../../shared/models/customerattributeresponse';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { CustomerDetailsService } from './services/customerdetails.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IAccountSummartRequest } from "./models/accountsummaryrequest";
import { DatePickerFormatService } from './../../shared/services/datepickerformat.service';
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


// declare var $: any;
@Component({
  selector: 'app-manage-auto-pay',
  templateUrl: './manage-auto-pay.component.html',
  styleUrls: ['./manage-auto-pay.component.css']
})
export class ManageAutoPayComponent implements OnInit {
  maxCapAmount: number = 0;
  capAmount: number = 0;
  invalidDate: boolean;
  lowThresAmountresponse = [];
  vehCount: number = 0;
  IsVehLowBal: boolean;
  holdEndDateDate: any;
  toDayDate = new Date();
  minDate = new Date();


  myDatePickerOptions: ICalOptions = {
    disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() },
    //disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };
  //myDatePickerOptions: IMyDpOptions = { disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 }, disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };
  longCustomerid: number;
  custAmountResponse: ICustomerAttributeResponse;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  customerAutoRebillType: string;
  customerThresholdAmount: string;
  customerAutoReplenishmentAmount: string;
  customerRebillHoldEndEffectiveDate: Date;
  manageAutoPayFrom: FormGroup;
  manageAutoPayFromfordate: FormGroup;
  avgMonthlyUsageResponse: any[];
  labelMonthOne: string;
  labelMonthTwo: string;
  labelMonthThree: string;
  labelMonthOneUsage: string;
  labelMonthTwoUsage: string;
  labelMonthThreeUsage: string;
  monthlyAvgAmount: string;
  dailyAvgAmount: string;
  prevMonthlyAvg: string;
  prevDailyAvg: string;
  rebillTypes: any[];
  ccThreshholdAmt: string;
  ccReplnAmt: string;
  ccLowBalAmt: string;
  cashThreshholdAmt: string;
  cashReplnAmt: string;
  cashLowBalAmt: string;
  achReplnAmt: string;
  achThreshholdAmt: string;
  achLowBalAmt: string
  accountType: string = "PREPAID";
  strVehicleTag: string;
  isTagRequired: string;
  decMaxThreshold: number;
  decMaxReplinishment: number;
  creditCards: any[];
  bankAccounts: any[];
  updateRebillAmounsRequest: ICustomerAttributeRequest;
  dateDetails: any;
  customerInformationres: any;
  isNonRevenueCustomer: boolean = false;
  isDefaultCardExist: boolean;
  isDefaultBankExist: boolean;
  disableUpdateButton: boolean = false;
  disableHoldButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  errorMessage: string;

  constructor(private cdr: ChangeDetectorRef, private datePickerFormat: DatePickerFormatService, private customerDetailsService: CustomerDetailsService, private commomService: CommonService,
    private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router,
    private materialscriptService: MaterialscriptService) { }


  // minDate = new Date(2017, 5, 10);
  // maxDate = new Date(2018, 9, 15);
  _bsValue: Date = new Date();
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    this._bsValue = v;
  }

  ngOnInit() {
    let rootSelector = this;
    setTimeout(function () {
      rootSelector.materialscriptService.material();
    }, 1000)
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.longCustomerid = this.customerContextResponse.AccountId;
      if (this.customerContextResponse.ParentId > 0) {
        this.longCustomerid = this.customerContextResponse.ParentId;
      }
      this.accountType = this.customerContextResponse.AccountType;
      this.isTagRequired = this.customerContextResponse.boolIsTagRequired;
    }

    // let currentDate: Date = new Date();
    // let minDateTime: Date = new Date();
    // minDateTime.setDate(currentDate.getDate() + 1);
    // this.minDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate());

    this.manageAutoPayFrom = new FormGroup({
      'thresholdAmount': new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(\.)?[0-9]{1,2}$")]),
      'rebillAmount': new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(\.)?[0-9]{1,2}$")]),
      'rdoRebillType': new FormControl('', [Validators.required]),
      'lowBalanceAmount': new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(\.)?[0-9]{1,2}$")]),
      'capAmount': new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(\.)?[0-9]{1,2}$")]),
    });

    this.manageAutoPayFromfordate = new FormGroup({
      'holdEndDateDate': new FormControl('', [Validators.required]),
    });
    if (this.accountType == "PREPAID") {
      this.getValuesinpageload();
    }

    Observable.forkJoin(
      this.commomService.getApplicationParameterValue(ApplicationParameterkey.CapAmount),
      this.commomService.getApplicationParameterValue(ApplicationParameterkey.MaxCapAmount),
    ).subscribe(response => {
      this.capAmount = <any>response[0];
      this.maxCapAmount = <any>response[1];
    })

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AUTOPAY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longCustomerid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    !this.commomService.isAllowed(Features[Features.AUTOPAY], Actions[Actions.VIEW], "");
    this.disableUpdateButton = !this.commomService.isAllowed(Features[Features.AUTOPAY], Actions[Actions.UPDATE], "");
    this.disableHoldButton = !this.commomService.isAllowed(Features[Features.AUTOPAY], Actions[Actions.HOLD], "");
    this.getAccountInformation();
    if (!this.isNonRevenueCustomer) {
      this.getCustomerAmountAutoPayDetails(userEvents);
      this.getAvgMonthUsage();
    }

    this.customerDetailsService.getCreditCardsByAccountId(this.longCustomerid).subscribe(
      res => {
        this.creditCards = res;
      });

    this.customerDetailsService.getBankByAccountID(this.longCustomerid).subscribe(
      res => {
        this.bankAccounts = res;
      });

    this.commomService.getApplicationParameterValue(ApplicationParameterkey.IsVehbasedLowBal).subscribe(res => {
      this.IsVehLowBal = res;
      if (this.IsVehLowBal) {
        this.getVehicles();
        this.customerDetailsService.GetLowBalanceandThresholdAmounts().subscribe(
          res => {
            this.lowThresAmountresponse = res;
          }
        );
      }
    })
  }



  radioButtonsList: lookUps[] =
  [
    { "LookUpTypeCode": "CreditCard", "LookUpTypeCodeDesc": "Credit Card" },
    { "LookUpTypeCode": "ACH", "LookUpTypeCodeDesc": "ACH" },
    { "LookUpTypeCode": "Cash", "LookUpTypeCodeDesc": "Cash" }
  ];


  getAccountInformation() {
    this.customerDetailsService.bindCustomerInfoDetails(this.longCustomerid).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => {

      }, () => {
        if (this.customerInformationres) {
          if (this.customerInformationres.RevenueCategory == 'NonRevenue') {
            //this.showErrorMsg('You are not allowed to do this operation');
            this.isNonRevenueCustomer = true;
          }
        }
      });
  }

  getValuesinpageload() {
    this.customerDetailsService.getApplicationParameterValueByParameterKey("CreditCardThreshAmt").subscribe(
      res => {
        this.ccThreshholdAmt = res;
      });

    this.customerDetailsService.getApplicationParameterValueByParameterKey("CreditCardReplnAmt").subscribe(
      res => {
        this.ccReplnAmt = res;
      });

    this.customerDetailsService.getApplicationParameterValueByParameterKey("ACHThreshAmt").subscribe(
      res => {
        this.achThreshholdAmt = res;

      });

    this.customerDetailsService.getApplicationParameterValueByParameterKey("ACHReplnAmt").subscribe(
      res => {
        this.achReplnAmt = res;
      });

    this.customerDetailsService.getApplicationParameterValueByParameterKey("CashThreshAmt").subscribe(
      res => {
        this.cashThreshholdAmt = res;

      });

    this.customerDetailsService.getApplicationParameterValueByParameterKey("CashReplnAmt").subscribe(
      res => {
        this.cashReplnAmt = res;
      });
    this.commomService.getApplicationParameterValue(ApplicationParameterkey.CashLowBalAmt).subscribe(
      res => {
        this.cashLowBalAmt = res;
      });
    this.commomService.getApplicationParameterValue(ApplicationParameterkey.ACHLowBalAmt).subscribe(
      res => {
        this.achLowBalAmt = res;
      });
    this.commomService.getApplicationParameterValue(ApplicationParameterkey.CreditCardLowBalAmt).subscribe(
      res => {
        this.ccLowBalAmt = res;
      });

  }

  getCustomerAmountAutoPayDetails(userEvents?) {
    this.customerDetailsService.getCustomerAmountAutoPayDetails(this.longCustomerid, userEvents)
      .subscribe(res => {
        this.custAmountResponse = res;
        console.log(this.custAmountResponse);
      }, (err) => {

      }, () => {
        if (this.custAmountResponse != null) {
          this.customerAutoRebillType = this.custAmountResponse.AutoReplenishmentType;
          this.customerAutoReplenishmentAmount = this.custAmountResponse.CalculatedReBillAmount;
          this.customerThresholdAmount = this.custAmountResponse.ThresholdAmount;
          this.manageAutoPayFrom.controls['lowBalanceAmount'].setValue(this.custAmountResponse.LowBalanceAmount);
          this.manageAutoPayFrom.controls['capAmount'].setValue(this.custAmountResponse.CapAmount);
          let strtDate = new Date();
          strtDate = new Date(this.custAmountResponse.Rebill_Hold_EndEffectiveDate);
          if (new Date(strtDate).toString() != new Date('0001-01-01T00:00:00').toString()) {
            this.customerRebillHoldEndEffectiveDate = strtDate;
            this.manageAutoPayFromfordate.patchValue({
              holdEndDateDate: {
                date: {
                  year: strtDate.getFullYear(),
                  month: strtDate.getMonth() + 1,
                  day: strtDate.getDate()
                }
              }
            });
          }
          this.getApplicationparameters(this.customerAutoRebillType);
        }
      });

  }

  getAvgMonthUsage() {
    this.customerDetailsService.getAverageMonthlyUsage(this.longCustomerid)
      .subscribe(res => {
        this.avgMonthlyUsageResponse = res;
        if (this.avgMonthlyUsageResponse != null && this.avgMonthlyUsageResponse.length > 0) {
          for (var i = 0; i < this.avgMonthlyUsageResponse.length; i++) {
            if (i == 0) {
              this.labelMonthOne = this.avgMonthlyUsageResponse[i].YearMonth.toString();
              this.labelMonthOneUsage = this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != null && this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != '' ? this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() : "N/A";
              this.monthlyAvgAmount = this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() != null && this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() != '' ? this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() : "N/A";
              this.dailyAvgAmount = this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() != null && this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() != '' ? this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() : "N/A";
            }
            if (i == 1) {
              this.labelMonthTwo = this.avgMonthlyUsageResponse[i].YearMonth.toString();
              this.labelMonthTwoUsage = this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != null && this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != '' ? this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() : "N/A";
              this.prevMonthlyAvg = this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() != null && this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() != '' ? this.avgMonthlyUsageResponse[i].MonthlyWiseAvgToll.toString() : "N/A";
              this.prevDailyAvg = this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() != null && this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() != '' ? this.avgMonthlyUsageResponse[i].DayWiseAvgToll.toString() : "N/A";
            }
            if (i == 2) {
              this.labelMonthThree = this.avgMonthlyUsageResponse[i].YearMonth.toString();
              this.labelMonthThreeUsage = this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != null && this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() != '' ? this.avgMonthlyUsageResponse[i].MonthlyUsage.toString() : "N/A";
            }
          }

          if (this.avgMonthlyUsageResponse.length == 1) {
            this.labelMonthTwo = this.avgMonthlyUsageResponse[0].PreviousMonth2.toString();
            this.labelMonthThree = this.avgMonthlyUsageResponse[0].PreviousMonth3.toString();
          }
          if (this.avgMonthlyUsageResponse.length == 2) {
            this.labelMonthThree = this.avgMonthlyUsageResponse[1].PreviousMonth3.toString();
          }
        }
        else {
          this.customerDetailsService.getDateDetails()
            .subscribe(res => {
              this.dateDetails = res;
              if (this.dateDetails) {
                this.labelMonthOne = this.dateDetails.PreviousMonth1;
                this.labelMonthTwo = this.dateDetails.PreviousMonth2;
                this.labelMonthThree = this.dateDetails.PreviousMonth3;
              }
            })
        }
      }, (err) => {
        this.customerDetailsService.getDateDetails()
          .subscribe(res => {
            this.dateDetails = res;
            if (this.dateDetails) {
              this.labelMonthOne = this.dateDetails.PreviousMonth1;
              this.labelMonthTwo = this.dateDetails.PreviousMonth2;
              this.labelMonthThree = this.dateDetails.PreviousMonth3;
            }

          })
      });
  }

  updateRebillTypeAmounts() {
    debugger;
    // $('#confirm-dialog').modal('hide');
    if (this.accountType == 'PREPAID') {
      if (this.manageAutoPayFrom.valid) {
        this.updatecommon();
      }
    }
    else {
      this.customerAutoReplenishmentAmount = '0';
      this.customerThresholdAmount = '0';
      this.manageAutoPayFrom.controls['lowBalanceAmount'].setValue('0');
      this.updatecommon();
    }
  }

  updatecommon() {
    debugger;
    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AUTOPAY];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longCustomerid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.errorMessage = '';
    if (this.checkValidations().length > 0) {
      this.showErrorMsg(this.errorMessage);
      return false;
    }
    else {
      this.updateRebillAmounsRequest = <ICustomerAttributeRequest>{};
      this.updateRebillAmounsRequest.AccountId = this.longCustomerid;
      this.updateRebillAmounsRequest.AutoReplenishmentType = this.customerAutoRebillType;
      this.updateRebillAmounsRequest.UpdatedUser = this.sessionContextResponse.userName;
      this.updateRebillAmounsRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.updateRebillAmounsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.updateRebillAmounsRequest.UserId = this.sessionContextResponse.userId;
      this.updateRebillAmounsRequest.LoginId = this.sessionContextResponse.loginId;
      this.customerDetailsService.updateAutoReplenishmentType(this.updateRebillAmounsRequest).subscribe(
        res => {
          if (res) {
            this.updateRebillAmounsRequest = <ICustomerAttributeRequest>{};
            this.updateRebillAmounsRequest.AccountId = this.longCustomerid;
            this.updateRebillAmounsRequest.CalculatedReBillAmount = parseFloat(this.customerAutoReplenishmentAmount);
            this.updateRebillAmounsRequest.ThresholdAmount = parseFloat(this.customerThresholdAmount);
            this.updateRebillAmounsRequest.LowBalanceAmount = parseFloat(this.manageAutoPayFrom.value.lowBalanceAmount);
            this.updateRebillAmounsRequest.AccountType = this.accountType;
            this.updateRebillAmounsRequest.CapAmount = parseFloat(this.manageAutoPayFrom.value.capAmount);
            this.updateRebillAmounsRequest.UpdatedUser = this.sessionContextResponse.userName;
            this.updateRebillAmounsRequest.SubSystem = SubSystem[SubSystem.CSC];
            this.updateRebillAmounsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.updateRebillAmounsRequest.UserId = this.sessionContextResponse.userId;
            this.updateRebillAmounsRequest.LoginId = this.sessionContextResponse.loginId;
            this.customerDetailsService.updateRebillThresholdAmounts(this.updateRebillAmounsRequest, userEvents).subscribe(
              res => {
                if (res) {
                  this.showSucsMsg('Amount details has been updated successfully');//Rebill and Threshold details has been updated successfully
                }
              }, (err) => {
                this.showErrorMsg(err.statusText.toString());
              }
            );
          }
        });
    }
  }

  checkValidations(): string {
    var minThresholdAmount = '';
    var minAutoReolenishmentamount = '';
    if (this.customerAutoRebillType.toUpperCase() == "CREDITCARD") {
      minThresholdAmount = this.ccThreshholdAmt;
      minAutoReolenishmentamount = this.ccReplnAmt;
    } else if (this.customerAutoRebillType.toUpperCase() == "ACH") {
      minThresholdAmount = this.achThreshholdAmt;
      minAutoReolenishmentamount = this.achReplnAmt;
    } else if (this.customerAutoRebillType.toUpperCase() == "CASH") {
      minThresholdAmount = this.cashThreshholdAmt;
      minAutoReolenishmentamount = this.cashReplnAmt;
    }

    if (parseInt(minThresholdAmount) > parseInt(this.customerThresholdAmount)) {
      this.errorMessage = 'Threshold Amount should be minimum $' + minThresholdAmount;
      return this.errorMessage;
    }
    if (parseInt(minAutoReolenishmentamount) > parseInt(this.customerAutoReplenishmentAmount)) {
      this.errorMessage = 'Auto Replenishment Amount should be minimum $' + minAutoReolenishmentamount;
 return this.errorMessage;
    }
    else if (parseInt(this.customerThresholdAmount) > this.decMaxThreshold) {
      this.errorMessage = 'Threshold Amount should not exceed maximum amount $' + this.decMaxThreshold;
      return this.errorMessage;
    }
    else if (parseInt(this.customerAutoReplenishmentAmount) > this.decMaxReplinishment) {
      this.errorMessage = 'Auto Replenishment Amount should not exceed maximum amount $' + this.decMaxReplinishment;
     return this.errorMessage;
    }
    if (this.accountType.toUpperCase() == "POSTPAID" && parseInt(this.manageAutoPayFrom.value.capAmount) < this.capAmount) {
      this.errorMessage = 'Cap Amount should be greater than $' + this.capAmount;
     return this.errorMessage;
    }
    else if (this.accountType.toUpperCase() == "POSTPAID" && parseInt(this.manageAutoPayFrom.value.capAmount) > this.maxCapAmount) {
      this.errorMessage = 'Cap Amount should be less than $' + this.maxCapAmount;
    return this.errorMessage;
    }
    if (this.accountType == 'PREPAID' && this.manageAutoPayFrom.value.lowBalanceAmount >= this.customerThresholdAmount) {
      this.errorMessage = 'Low Balance Amount should be less than Threshold Amount';
     return this.errorMessage;
    }
    //Crediit card validations
    if (this.customerAutoRebillType.toUpperCase() == "CREDITCARD") {
      if (this.creditCards && this.creditCards.length > 0) {
        for (let i = 0; i < this.creditCards.length; i++) {
          if (this.creditCards[i].DefaultFlag) {
            this.isDefaultCardExist = true;
          }
        }
        if (!this.isDefaultCardExist) {
          this.errorMessage = 'Update one of the credit card as primary and change the replenishment type'
          return this.errorMessage;
        }
      }
      else {
        this.errorMessage = 'Add credit card to the account and change the replenishment type';
        return this.errorMessage;
      }
    }
    //Bank validations
    if (this.customerAutoRebillType.toUpperCase() == "ACH") {
      if (this.bankAccounts && this.bankAccounts.length > 0) {
        for (let i = 0; i < this.bankAccounts.length; i++) {
          if (this.bankAccounts[i].IsDefault) {
            this.isDefaultBankExist = true;
          }
        }
        if (!this.isDefaultBankExist) {
          this.errorMessage = 'Update one of the bank as primary and change the replenishment type'
          return this.errorMessage;
        }
      }
      else {
        this.errorMessage = 'Add bank to the account and change the replenishment type'
        return this.errorMessage;
      }
    }
    return this.errorMessage;
  }

  getApplicationparameters(rebillType: string) {
    this.customerDetailsService.getApplicationParameterValueByParameterKey("IsVehicleTags").subscribe(
      res => {
        this.strVehicleTag = res;
      });

    if (rebillType.toUpperCase() == "CREDITCARD") {
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("CreditCardThreshAmt").subscribe(
        res => {
          this.decMaxThreshold = res.MAXLENGTH;
        });
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("CreditCardReplnAmt").subscribe(
        res => {
          this.decMaxReplinishment = res.MAXLENGTH;
        });
    } else if (rebillType.toUpperCase() == "ACH") {
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("ACHThreshAmt").subscribe(
        res => {
          this.decMaxThreshold = res.MAXLENGTH;
        });
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("ACHReplnAmt").subscribe(
        res => {
          this.decMaxReplinishment = res.MAXLENGTH;
        });
    } else if (rebillType.toUpperCase() == "CASH") {
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("CashThreshAmt").subscribe(
        res => {
          this.decMaxThreshold = res.MAXLENGTH;
        });
      this.commomService.getApplicationParameterMinMaxValuesByParameterKey("CashReplnAmt").subscribe(
        res => {
          this.decMaxReplinishment = res.MAXLENGTH;
        });
    }
  }

  rebillTypeChnage(rebiilType) {
    debugger;
    if (rebiilType.toUpperCase() == "CREDITCARD") {
      this.customerAutoReplenishmentAmount = this.ccReplnAmt;
      this.customerThresholdAmount = this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "THRESHOLD" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.ccThreshholdAmt;
      this.manageAutoPayFrom.controls['lowBalanceAmount'].setValue(this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "LOW" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.ccLowBalAmt);
    }
    if (rebiilType.toUpperCase() == "ACH") {
      this.customerAutoReplenishmentAmount = this.achReplnAmt;
      this.customerThresholdAmount = this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "THRESHOLD" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.achThreshholdAmt;
      this.manageAutoPayFrom.controls['lowBalanceAmount'].setValue(this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "LOW" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.achLowBalAmt);
    }
    if (rebiilType.toUpperCase() == "CASH") {
      this.customerAutoReplenishmentAmount = this.cashReplnAmt;
      this.customerThresholdAmount = this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "THRESHOLD" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.cashThreshholdAmt;
      this.manageAutoPayFrom.controls['lowBalanceAmount'].setValue(this.IsVehLowBal && this.vehCount > 0 ? this.lowThresAmountresponse.filter(x => x.AmountType.toUpperCase() == "LOW" && x.ReplenishType.toUpperCase() == rebiilType.toUpperCase()).filter(y => y.MinSlab <= this.vehCount && y.MaxSlab >= this.vehCount)[0].Amount : this.cashLowBalAmt);
    }
  }

  resetForm() {
    this.getCustomerAmountAutoPayDetails();
    this.getAvgMonthUsage();
  }

  updateAutorebillManualHold() {
    debugger;
    this.manageAutoPayFromfordate.controls["holdEndDateDate"].markAsTouched({ onlySelf: true });
    if (this.manageAutoPayFromfordate.valid) {
      //User Events 
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.AUTOPAY];
      userEvents.ActionName = Actions[Actions.HOLD];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.longCustomerid;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.updateRebillAmounsRequest = <ICustomerAttributeRequest>{};
      this.updateRebillAmounsRequest.AccountId = this.longCustomerid;

      let convertedDate = this.datePickerFormat.getFormattedDate(this.manageAutoPayFromfordate.controls["holdEndDateDate"].value.date);
      const rebill_Hold_EndEffectiveDate = convertedDate;
      // let rebill_Hold_EndEffectiveDate=this.customerRebillHoldEndEffectiveDate;
      this.updateRebillAmounsRequest.Rebill_Hold_EndEffectiveDate = rebill_Hold_EndEffectiveDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.updateRebillAmounsRequest.UpdatedUser = this.sessionContextResponse.userName;
      this.updateRebillAmounsRequest.SubSystem = SubSystem[SubSystem.CSC];
      this.updateRebillAmounsRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.updateRebillAmounsRequest.UserId = this.sessionContextResponse.userId;
      this.updateRebillAmounsRequest.LoginId = this.sessionContextResponse.loginId;
      this.customerDetailsService.updateAutorebillManualHold(this.updateRebillAmounsRequest, userEvents).subscribe(
        res => {
          if (res) {
            this.showSucsMsg('Rebill Hold has been updated successfully');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
        }
      );
    }
  }

  resetFormforhold() {
    this.getCustomerAmountAutoPayDetails();
    this.manageAutoPayFromfordate.reset();
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  alertClick() {
    this.msgFlag = true;
    this.msgType = 'alert';
    if (this.customerAutoRebillType && this.customerAutoRebillType == 'Cash' && this.customerAutoRebillType != this.custAmountResponse.AutoReplenishmentType) {
      this.msgDesc = 'By disabling Auto Pay, you will need to pay with Cash or Check to keep the Account in good standing'
    } else {
      if (this.accountType == "PREPAID")
        this.msgDesc = 'Are you sure you want to change the Auto Pay details?'
      else
        this.msgDesc = 'Are you sure you want to change the Cap Amount?'
    }
  }

  userAction(e) {
    if (e) {
      this.msgFlag = false;
      this.updateRebillTypeAmounts();
    }
  }
  getVehicles() {
    var vehicleReq = <IAccountSummartRequest>{};
    vehicleReq.AccountId = this.longCustomerid;
    vehicleReq.SortColumn = "VEHICLENUMBER";
    vehicleReq.CurrentDateTime = new Date();
    vehicleReq.SortDirection = true;
    vehicleReq.PageSize = 10000;
    vehicleReq.PageNumber = 1;
    this.customerDetailsService.getVehicles(vehicleReq)
      .subscribe(res => {
        if (res)
          this.vehCount = res.length;
      });
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.manageAutoPayFromfordate.controls["holdEndDateDate"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }
}


export class lookUps {
  LookUpTypeCode: string
  LookUpTypeCodeDesc: string
};