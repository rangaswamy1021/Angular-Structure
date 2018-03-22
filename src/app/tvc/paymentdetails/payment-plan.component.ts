import { ViolatordetailsService } from '../violatordetails/services/violatordetails.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MakePaymentComponent } from '../../payment/make-payment.component';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IInvoiceResponse } from '../../invoices/models/invoicesresponse';
import { PaymentDetailService } from './services/paymentdetails.service';
import { CommonService } from '../../shared/services/common.service';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { IPaymentPlanTerms } from './models/PaymentPlanTerms';
import { IEMIDetailsRequest } from './models/EMIDetailsRequest';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { IViolationPaymentrequest } from '../../payment/models/violationpaymentrequest';
import { IInvoiceRequest } from '../../invoices/models/invoicesrequest';
import { PaymentContextService } from './services/payment.context.service';
import { PaymentService } from '../../payment/services/payment.service';
import { ICreditCardRequest } from '../../payment/models/creditcardrequest';
import { IAddressResponse } from '../../shared/models/addressresponse';
import { AddAddressComponent } from '../../shared/address/add-address.component';
import { IRequestCreditCard } from './models/RequestCreditCard';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { IPaymentPlanConfig } from './models/PaymentPlanConfig';
import { List } from 'linqts/dist/linq';
import { Features, Actions, SubFeatures } from '../../shared/constants';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-payment-plan',
  templateUrl: './payment-plan.component.html',
  styleUrls: ['./payment-plan.component.scss']
})
export class PaymentPlanComponent implements OnInit {

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  @ViewChild(MakePaymentComponent) makePaymentComp;
  paymentPlanStatus: boolean = true;
  autoCardDetails: boolean = false;
  isSaveCheckBox: boolean = false;

  @ViewChild(AddAddressComponent) addressComponent;
  createForm: FormGroup;
  isAddressEnable: boolean = false;
  addressResponse: IAddressResponse;
  cardType = [];
  years = [];
  months = [];
  isCreditCardPopUp: boolean = false;
  iSNewCreditCard: boolean = false;
  iRequestCreditCard: IRequestCreditCard;
  isAutoDebit: boolean = false;

  disableButtonADD: boolean = false;

  creditCardRequest: ICreditCardRequest[];
  objPaymentRequest: IViolationPaymentrequest = <IViolationPaymentrequest>{};

  iPaymentPlanConfig: IPaymentPlanConfig[] = <IPaymentPlanConfig[]>[];

  isFullPayment: boolean = false;
  isFullPaymentPlanBlock: boolean = false;
  accountId: number;
  invoicesResponse: IInvoiceResponse[] = <IInvoiceResponse[]>[];
  invoicesResponseSelected: IInvoiceResponse[] = <IInvoiceResponse[]>[];
  iPaymentPlanTerms: IPaymentPlanTerms = <IPaymentPlanTerms>{};
  iEMIDetailsRequest: IEMIDetailsRequest[] = <IEMIDetailsRequest[]>[];
  isSelected: boolean;
  strDownPaymentPercentage: string;
  strMinimumPaymentPlanAmount: string;
  strMintermsForMonthly: string;
  strMintermsForBiWeekly: string;
  termsList = [];
  strEditDownPayPercentage: string;
  violatorContextResponse: IViolatorContextResponse;
  sessionContextResponse: IUserresponse;

  paymentPlanForm: FormGroup;
  baseDownPayNote: string = "Down payment #percent% or $#Amount  is required to establish payment plan";
  strDownPayNote: string;

  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";
  validatePhoneAllZerosPattern = "^(\\(([0]{3})\\)[ ]([0]{3})[-]([0]{4}))$";
  isInvalidPhone: boolean = false;

  isInvalidExpirationDate: boolean = false;
  isInvalidCreditCard: boolean = false;
  isParentSelected: boolean = false;
  minDownPaymentAmount: number = 0;
  paymentPlanErrormsg: string;

  get ccNumbers(): any { return this.createForm.get('CCNumbers'); }

  constructor(private paymentDetailService: PaymentDetailService, private commonService: CommonService, private router: Router,
    private sessionContext: SessionService, private el: ElementRef, private vioPaymentContextService: PaymentContextService, private paymentService: PaymentService,
    private violatorContext: ViolatorContextService, private violatordetailsService: ViolatordetailsService, private materialscriptService: MaterialscriptService) {

    this.createForm = new FormGroup({
      'Name': new FormControl('', [Validators.required]),
      'CCNumbers': new FormGroup({
        'CCNumber1': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber2': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber3': new FormControl('', [Validators.required, Validators.minLength(4)]),
        'CCNumber4': new FormControl('', [Validators.required])
      }),
      'CardType': new FormControl('', Validators.required),
      'Month': new FormControl('', Validators.required),
      'Year': new FormControl('', Validators.required)
    });

  }

  ngOnInit() {
    this.materialscriptService.material();

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.violatorContext.currentContext
      .subscribe(customerContext => {
        this.violatorContextResponse = customerContext;
      }
      );

    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.accountId = this.violatorContextResponse.accountId;
    }

    if (this.router.url.endsWith('/payment-plan')) {
      this.vioPaymentContextService.changeResponse(null);
    }

    this.paymentPlanForm = new FormGroup({
      'txtDepositAmount': new FormControl({ value: '', disabled: true }, []),
      'txtDownPaymentAmount': new FormControl({ value: '', disabled: true }, []),
      'txtTotalPaymentPlanAmount': new FormControl({ value: '', disabled: true }, []),
      'rdlTerm': new FormControl('Monthly', []),
      'ddlMonthlyTerms': new FormControl('', [Validators.required]),
      'chkAutoDebit': new FormControl('', []),
      'txtMobileNumber': new FormControl('', [Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]),
      'txtEmailId': new FormControl('', [Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)]),
      'checkAll': new FormControl('', [])
    });

    this.disableButtonADD = !this.commonService.isAllowed(Features[Features.PAYMENTPLAN], Actions[Actions.CREATE], "");

    this.GetPaymentPlanMasterData();

    this.creditCardRequest = <ICreditCardRequest[]>{};

    this.getApplicationParameterValue();

    this.vioPaymentContextService.currentContext.subscribe(res => {
      this.objPaymentRequest = res;

      if (this.objPaymentRequest == null || this.objPaymentRequest.CustomerId == 0) {
        this.makePaymentComp.InitialiZeObject(this.accountId);
        this.paymentPlanCheck();
        this.callGetOutstandingInvoices(this.accountId);
      } else {
        this.paymentPlanCheck();
        this.callGetOutstandingInvoices(this.accountId);
        this.makePaymentComp.setCustomerId(this.accountId, "");
        this.makePaymentComp.bindDetailsOnBack(this.objPaymentRequest);
      }
      this.CheckManualHoldExists();
    });

  }

  paymentPlanCheck() {
    this.violatordetailsService.isExistsPaymentplanPromisetopay(this.accountId)
      .subscribe(res => {
        if (res && res.PaymentPlan) {
          this.paymentPlanStatus = false;
          this.paymentPlanErrormsg = "Payment plan already initiated for this account";
        }
      });
  }

  CheckManualHoldExists() {
    this.violatordetailsService.checkManualHoldExists(this.accountId).subscribe(
      res => {
        if (res) {
          this.paymentPlanStatus = false;
          this.paymentPlanErrormsg = "Manual hold already initiated for this account";
        }
      });
  }

  moveToNextTab(event, toTextBox, fromTexBox) {
    if (event.target.maxLength === event.target.value.length) {
      this.el.nativeElement.querySelector("#" + toTextBox).focus();
    }
    if (event.target.maxLength === 4 && event.target.value.length === 0) {
      this.el.nativeElement.querySelector("#" + fromTexBox).focus();
    }
    if (event.target.id === 'txtCredit4' && event.target.maxLength === event.target.value.length) {
      this.el.nativeElement.querySelector("#expiry-monthCredit").focus();
    }
  }

  callGetOutstandingInvoices(longViolatorid: number) {

    this.paymentDetailService.GetOutstandingInvoices(longViolatorid).subscribe(
      res => {

        if (res) {
          this.invoicesResponse = res;
          // if (res.find(x => x.AgingHoldType == "Payment Plan") &&
          //   res.find(x => x.IsAgingHold == true)) {
          //   this.paymentPlanStatus = false;
          //   this.paymentPlanErrormsg = "Payment plan already initiated for this account";
          // }
          // else {
          if (this.objPaymentRequest != null && this.objPaymentRequest.CustomerId != 0) {
            for (var temp = 0; temp < this.objPaymentRequest.objListInvoices.length; temp++) {
              for (var i = 0; i < res.length; i++) {
                if (this.objPaymentRequest.objListInvoices[temp].InvoiceId == res[i].InvoiceId) {
                  res[i].IsChecked = true;

                  if (this.invoicesResponseSelected.length > 0) {
                    if (!(this.invoicesResponseSelected.find(x => x.InvoiceNumber.toUpperCase() == res[i].InvoiceNumber.toUpperCase()))) {
                      this.invoicesResponseSelected.push(res[i]);
                    }
                  }
                  else {
                    this.invoicesResponseSelected.push(res[i]);
                  }
                  break;
                }
              }
            }
            this.paymentPlanForm.controls['txtDepositAmount'].setValue(this.objPaymentRequest.DepositAmount);
            this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(this.objPaymentRequest.DownPaymentAmount);
            this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(this.objPaymentRequest.TotalPaymentPlanAmount);
            this.paymentPlanForm.controls['txtMobileNumber'].setValue(this.objPaymentRequest.MobileNo);
            this.paymentPlanForm.controls['txtEmailId'].setValue(this.objPaymentRequest.Email);
            this.paymentPlanForm.controls['chkAutoDebit'].setValue(this.objPaymentRequest.IsAutoDebit);

            if (this.objPaymentRequest.Terms == "Monthly") {
              this.termsList = [];
              for (var i = Number(this.strMintermsForMonthly); i <= 12; i++)
                this.termsList.push(i);
            }

            if (this.objPaymentRequest.Terms == "BiWeekly") {
              this.termsList = [];
              for (var i = Number(this.strMintermsForBiWeekly); i <= 26; i++)
                this.termsList.push(i);
            }

            this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue(this.objPaymentRequest.MonthlyTerms);
            this.paymentPlanForm.controls['rdlTerm'].setValue(this.objPaymentRequest.Terms);
            this.isFullPaymentPlanBlock = this.objPaymentRequest.IsFullPayment;
            this.isFullPayment = this.objPaymentRequest.IsFullPayment;
            if (this.objPaymentRequest.requestCreditCard != null && this.objPaymentRequest.IsAutoDebit) {
              this.iRequestCreditCard = this.objPaymentRequest.requestCreditCard;
              this.autoCardDetails = true;
              this.isCreditCardPopUp = true;
              this.paymentService.getLookups().subscribe(
                res => {
                  this.cardType = res;
                  this.bindExpireMonthsAndYears();
                  if (this.iRequestCreditCard != null) {
                    this.iSNewCreditCard = true;
                    this.createForm.patchValue({ 'Name': this.iRequestCreditCard.NameOnCard, 'CardType': this.iRequestCreditCard.CCType, 'Month': (Number)(this.iRequestCreditCard.ExpDate.toString().slice(-2)), 'Year': this.iRequestCreditCard.ExpDate.toString().substring(0, 4) });
                    if (this.iRequestCreditCard.CCNumber != '') {
                      this.ccNumbers.setValue({
                        CCNumber1: this.iRequestCreditCard.CCNumber.substring(0, 4),
                        CCNumber2: this.iRequestCreditCard.CCNumber.substring(4, 8),
                        CCNumber3: this.iRequestCreditCard.CCNumber.substring(8, 12),
                        CCNumber4: this.iRequestCreditCard.CCNumber.substring(12, 16)
                      });
                    }

                    if (this.iRequestCreditCard.isAddressEnable) {
                      var addressResponse = <IAddressResponse>{};
                      addressResponse.Line1 = this.iRequestCreditCard.Line1;
                      addressResponse.Line2 = this.iRequestCreditCard.Line2;
                      addressResponse.Line3 = this.iRequestCreditCard.Line3;
                      addressResponse.City = this.iRequestCreditCard.City;
                      addressResponse.State = this.iRequestCreditCard.State
                      addressResponse.Country = this.iRequestCreditCard.Country
                      addressResponse.Zip1 = this.iRequestCreditCard.Zip1;
                      addressResponse.Zip2 = this.iRequestCreditCard.Zip2
                      this.addressResponse = addressResponse;
                      this.isAddressEnable = true;
                    }
                  }
                });
            }
          }
          this.invoicesResponse = null;
          this.invoicesResponse = res;
        }
      },
      (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText;
      },
      () => {
      });
  }

  getApplicationParameterValue() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.PercentageofDownPMT).subscribe(
      res => {
        if (res) {
          this.strDownPaymentPercentage = res;
          this.strDownPayNote = this.baseDownPayNote;

          if (this.strDownPaymentPercentage) {
            this.strDownPayNote = this.strDownPayNote.replace("#percent", this.strDownPaymentPercentage);
          }
        }
      }
    );

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MinimumPaymentPlanAmount).subscribe(
      res => {
        if (res) {
          this.strMinimumPaymentPlanAmount = res;
          if (this.strMinimumPaymentPlanAmount) {
            this.strDownPayNote = this.strDownPayNote.replace("#Amount", this.strMinimumPaymentPlanAmount);
          }
        }
      }
    );

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MintermsForMonthly).subscribe(
      res => {
        this.strMintermsForMonthly = res;

        this.termsList = [];
        for (var i = Number(this.strMintermsForMonthly); i <= 12; i++)
          this.termsList.push(i);

      }
    );

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MintermsForBiWeekly).subscribe(
      res => this.strMintermsForBiWeekly = res
    );

  }

  bindTermsDropDown(event: any) {
    let termsChecked: string = event.target.value;
    this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");

    if (termsChecked == "Monthly") {
      this.termsList = [];
      for (var i = Number(this.strMintermsForMonthly); i <= 12; i++)
        this.termsList.push(i);
    }

    if (termsChecked == "BiWeekly") {
      this.termsList = [];
      for (var i = Number(this.strMintermsForBiWeekly); i <= 26; i++)
        this.termsList.push(i);
    }

  }

  UpdateDownPayPercentage() {
    if (this.strEditDownPayPercentage != "") {
      let downPayPercentage: number = Number(this.strEditDownPayPercentage);

      if (!isNaN(downPayPercentage)) {
        if (downPayPercentage > 100) {

          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Down payment percentage should not be greater than 100.";

          $('#updateDown').modal('hide');
          return;
        }

        let totamount: number = Number(this.paymentPlanForm.controls['txtDepositAmount'].value);

        let downPay: string = ((totamount / 100) * downPayPercentage).toFixed(2);
        this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(downPay);

        let downamount: number = Number(this.paymentPlanForm.controls['txtDownPaymentAmount'].value);

        let emiamount: number = totamount - downamount;

        if (downamount < this.minDownPaymentAmount) {

          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Down Payment should not be less than minimum amount " + this.minDownPaymentAmount.toFixed(2);

          $('#updateDown').modal('hide');

          this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(this.minDownPaymentAmount.toFixed(2));
          this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue((totamount - this.minDownPaymentAmount).toFixed(2));
        }
        else {
          this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(emiamount.toFixed(2));
          $('#updateDown').modal('hide');
        }

        if (downamount >= totamount) {
          this.isFullPaymentPlanBlock = true;
          this.isFullPayment = true;
        }
        else {
          this.isFullPaymentPlanBlock = false;
          this.isFullPayment = false;
        }

      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Invalid down payment percentage.";

        $('#updateDown').modal('hide');
      }
    }
  }

  callTermsView() {
    if (this.paymentPlanForm.controls['txtDepositAmount'].value != "" &&
      this.paymentPlanForm.controls['txtDownPaymentAmount'].value != "" &&
      this.paymentPlanForm.controls['ddlMonthlyTerms'].value != "") {


      this.iPaymentPlanTerms.DepositAmount = this.paymentPlanForm.controls['txtDepositAmount'].value;
      this.iPaymentPlanTerms.DownPaymentAmount = this.paymentPlanForm.controls['txtDownPaymentAmount'].value;
      this.iPaymentPlanTerms.Terms = this.paymentPlanForm.controls['rdlTerm'].value;
      this.iPaymentPlanTerms.MonthlyTerms = this.paymentPlanForm.controls['ddlMonthlyTerms'].value;
      this.iPaymentPlanTerms.Username = this.sessionContextResponse.userName;

      this.paymentDetailService.CalculateEMITerms(this.iPaymentPlanTerms).subscribe(
        res => {
          this.iEMIDetailsRequest = res;
          $('#termsView').modal('show');
        },
        (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText;
        },
        () => {

        });

    }
    else {

      this.msgFlag = true;
      this.msgType = 'error';
      if (this.paymentPlanForm.controls['txtDepositAmount'].value == "") {
        this.msgDesc = "Down payment percentage should not be greater than 100.";
      }

      if (this.paymentPlanForm.controls['txtDownPaymentAmount'].value == "") {
        this.msgDesc = "Please provide Down Payment.";
      }

      let stt: string = this.paymentPlanForm.controls['ddlMonthlyTerms'].value;

      if (this.paymentPlanForm.controls['ddlMonthlyTerms'].value == "") {
        this.msgDesc = "Please Select Terms.";
      }

    }
  }

  ddlMonthlyTermsChange() {

    var termsSelected = this.paymentPlanForm.value.ddlMonthlyTerms;

    if (termsSelected != "") {
      let totalPaymentPlanAmount: number = Number(this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].value);

      if (totalPaymentPlanAmount > 0) {
        if (this.iPaymentPlanConfig.length > 0) {

          if (this.paymentPlanForm.controls['rdlTerm'].value == "Monthly") {
            const planConfigList = new List<IPaymentPlanConfig>(this.newFunction());
            var query = planConfigList.Where(x => totalPaymentPlanAmount >= x.MinAmount &&
              totalPaymentPlanAmount <= x.MaxAmount &&
              x.TermType == "Monthly").Select(x => x.MaxTerm);

            let intmaxterms: List<number> = query.Distinct().ToList();

            if (intmaxterms.Count() > 0) {
              if (Number(termsSelected) > intmaxterms.Last()) {
                this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");

                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Selected Term should not be greater than " + intmaxterms.Last();

              }
            }
            else {
              this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");
              this.msgFlag = true;
              this.msgType = 'error';
              this.msgDesc = "Payment plan can not be instated for amount less than minimum amount.";
            }

          }

          if (this.paymentPlanForm.controls['rdlTerm'].value == "BiWeekly") {
            const planConfigList = new List<IPaymentPlanConfig>(this.newFunction());
            var query = planConfigList.Where(x => totalPaymentPlanAmount >= x.MinAmount &&
              totalPaymentPlanAmount <= x.MaxAmount &&
              x.TermType == "BiWeekly").Select(x => x.MaxTerm);

            let intmaxterms: List<number> = query.Distinct().ToList();

            if (intmaxterms.Count() > 0) {
              if (Number(termsSelected) > intmaxterms.Last()) {
                this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");

                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Selected Term should not be greater than " + intmaxterms.Last();
              }
            }
            else {
              this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");
              this.msgFlag = true;
              this.msgType = 'error';
              this.msgDesc = "Payment plan can not be instated for amount less than minimum amount.";
            }
          }

        }
      }
      else {
        this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");

        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Please select at least one invoice.";
      }
    }

  }

  private newFunction(): IPaymentPlanConfig[] {
    return this.iPaymentPlanConfig;
  }

  GetPaymentPlanMasterData() {

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PAYMENTPLAN];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.paymentDetailService.getPaymentPlanMasterData(userEvents).subscribe(
      res => {
        if (res) {
          this.iPaymentPlanConfig = res;
        }
      },
      (err) => {
        this.iPaymentPlanConfig = <IPaymentPlanConfig[]>[];
      },
      () => {

      });

  }

  doPayment() {

    this.addorRemoveValidators();
    if (this.paymentPlanForm.valid) {

      let paymentAmount: number = this.paymentPlanForm.controls['txtDownPaymentAmount'].value;
      let totalPaymentPlanAmount: number = Number(this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].value);
      let depositAmount: number = Number(this.paymentPlanForm.controls['txtDepositAmount'].value);

      if (paymentAmount <= 0) {

        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Amount to be paid should be  greater than zero.";

        this.paymentPlanForm.controls['txtDepositAmount'].setValue('');
      }
      else {

        let selectGV: boolean = false;
        let objLstInvoiceRequest: IInvoiceRequest[] = [];
        this.objPaymentRequest = <IViolationPaymentrequest>{};
        for (let i = 0; i < this.invoicesResponseSelected.length; i++) {
          let invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
          selectGV = true;
          invoiceRequest.InvoicePaymentAmount = this.invoicesResponseSelected[i].OutstandingDue;
          invoiceRequest.InvOutstading = this.invoicesResponseSelected[i].OutstandingDue;
          invoiceRequest.InvoiceId = this.invoicesResponseSelected[i].InvoiceId;
          invoiceRequest.InvoiceNumber = this.invoicesResponseSelected[i].InvoiceNumber;
          invoiceRequest.PlateNumber = this.invoicesResponseSelected[i].PlateNumber;
          invoiceRequest.BalanceDue = this.invoicesResponseSelected[i].BalanceDue;
          invoiceRequest.InvBatchId = this.invoicesResponseSelected[i].InvoiceBatchId;
          invoiceRequest.VehicleId = this.invoicesResponseSelected[i].VehicleId;
          invoiceRequest.AccountId = this.accountId;
          objLstInvoiceRequest.push(invoiceRequest);
        }
        this.objPaymentRequest.objListInvoices = objLstInvoiceRequest;

        if (this.isFullPayment != true) {
          this.objPaymentRequest.IsFullPayment = this.isFullPayment;
          this.iPaymentPlanTerms.DepositAmount = this.paymentPlanForm.controls['txtDepositAmount'].value;
          this.iPaymentPlanTerms.DownPaymentAmount = this.paymentPlanForm.controls['txtDownPaymentAmount'].value;
          this.iPaymentPlanTerms.Terms = this.paymentPlanForm.controls['rdlTerm'].value;
          this.iPaymentPlanTerms.MonthlyTerms = this.paymentPlanForm.controls['ddlMonthlyTerms'].value;
          this.iPaymentPlanTerms.Username = this.sessionContextResponse.userName;

          this.paymentDetailService.CalculateEMITerms(this.iPaymentPlanTerms).subscribe(
            res => {
              if (res) {
                this.iEMIDetailsRequest = res;

                if (this.iEMIDetailsRequest.length > 0) {
                  this.objPaymentRequest.LstEMIDetails = this.iEMIDetailsRequest;
                }
                this.doPaymentCommon(paymentAmount, totalPaymentPlanAmount, depositAmount)
              }
            },
            (err) => {
            },
            () => {

            });
        }
        else {
          this.objPaymentRequest.IsFullPayment = this.isFullPayment;
          this.doPaymentCommon(paymentAmount, totalPaymentPlanAmount, depositAmount)
        }
      }
    }
    else {
      this.validateAllFormFields(this.paymentPlanForm);
    }
  }

  doPaymentCommon(paymentAmount: number, totalPaymentPlanAmount: number, depositAmount: number) {
    if (paymentAmount > 0) {
      this.objPaymentRequest.TxnAmount = paymentAmount;
      this.objPaymentRequest.TotalPaymentPlanAmount = totalPaymentPlanAmount;
      this.objPaymentRequest.DownPaymentAmount = paymentAmount;
      this.objPaymentRequest.DepositAmount = depositAmount;
      this.objPaymentRequest.CustomerId = this.accountId;
      this.objPaymentRequest.PaymentType = "PaymentPlan";
      this.objPaymentRequest.ViolationProcess = "PaymentPlan";
      this.objPaymentRequest.UserName = this.sessionContextResponse.userName;
      this.objPaymentRequest.LoginId = this.sessionContextResponse.loginId;
      this.objPaymentRequest.UserId = this.sessionContextResponse.userId;
      this.objPaymentRequest.ICNId = this.sessionContextResponse.icnId;

      this.objPaymentRequest.IsAutoDebit = this.isAutoDebit;
      this.objPaymentRequest.MobileNo = this.paymentPlanForm.controls['txtMobileNumber'].value;
      this.objPaymentRequest.Email = this.paymentPlanForm.controls['txtEmailId'].value;
      this.objPaymentRequest.MonthlyTerms = Number(this.paymentPlanForm.controls['ddlMonthlyTerms'].value);
      this.objPaymentRequest.Terms = this.paymentPlanForm.controls['rdlTerm'].value;

      if (this.iRequestCreditCard != null)
        this.objPaymentRequest.requestCreditCard = this.iRequestCreditCard;

      this.objPaymentRequest.NavProcess = "PaymentPlan";
      this.vioPaymentContextService.changeResponse(this.objPaymentRequest);

      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.PAYMENTPLAN];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.SubFeatureName = SubFeatures[SubFeatures.PAYMENTPLANSETUP];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

      });

      this.makePaymentComp.DoViolationPayment(this.objPaymentRequest);
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Please provide Down Payment.";
    }
  }

  doPaymentReset() {
    this.isFullPaymentPlanBlock = false;
    this.paymentPlanForm.reset();

    this.createForm.reset();
    this.isAddressEnable = false;
    this.addressResponse = null;
    this.autoCardDetails = false;
    this.invoicesResponseSelected = <IInvoiceResponse[]>[];
    this.paymentPlanForm.controls['rdlTerm'].setValue("Monthly");
    this.paymentPlanForm.controls['ddlMonthlyTerms'].setValue("");

    this.termsList = [];
    for (var i = Number(this.strMintermsForMonthly); i <= 12; i++)
      this.termsList.push(i);

    this.makePaymentComp.resetclick();
    this.vioPaymentContextService.changeResponse(null);
  }

  doPaymentCancel() {
    this.router.navigate(["/tvc/violatordetails/violator-summary"]);
    this.vioPaymentContextService.changeResponse(null);
  }

  callAutoDebit(event) {
    this.createForm.reset();
    this.createForm.controls['CardType'].setValue("");
    this.createForm.controls['Month'].setValue("");
    this.createForm.controls['Year'].setValue("");
    if (event.target.checked) {

      this.paymentService.getLookups().subscribe(
        res => {
          this.cardType = res;
          this.bindExpireMonthsAndYears();

          this.paymentService.GetCreditCardByAccountId(this.accountId.toString()).subscribe(res => {
            if (res) {
              this.creditCardRequest = res;

              if (this.creditCardRequest != null && this.creditCardRequest.length > 0) {
                this.iSNewCreditCard = true;
                this.createForm.patchValue({ 'Name': this.creditCardRequest[0].NameOnCard, 'CardType': this.creditCardRequest[0].CCType, 'Month': (Number)(this.creditCardRequest[0].ExpDate.toString().slice(-2)), 'Year': this.creditCardRequest[0].ExpDate.toString().substring(0, 4) });
                if (this.creditCardRequest[0].IsPreferred) {
                  var addressResponse = <IAddressResponse>{};
                  addressResponse.Line1 = this.creditCardRequest[0].Line1;
                  addressResponse.Line2 = this.creditCardRequest[0].Line2;
                  addressResponse.Line3 = this.creditCardRequest[0].Line3;
                  addressResponse.City = this.creditCardRequest[0].City;
                  addressResponse.State = this.creditCardRequest[0].State
                  addressResponse.Country = this.creditCardRequest[0].Country
                  addressResponse.Zip1 = this.creditCardRequest[0].Zip1;
                  addressResponse.Zip2 = this.creditCardRequest[0].Zip2
                  this.addressResponse = addressResponse;
                  this.isAddressEnable = this.creditCardRequest[0].IsPreferred;
                }
              } else {
                this.iSNewCreditCard = false;
              }

              this.isCreditCardPopUp = true;
            }
          });

        });

      $('#autoDebit').modal({ backdrop: 'static', keyboard: false, show: true });
    }
    else {
      this.autoCardDetails = false;
      $('#autoDebit').modal('hide');
    }


  }

  callAutoDebitDetails() {
    $('#autoDebit').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  addressChange(addressType) {
    if (addressType == "exist") {
      this.isAddressEnable = false;
      this.addressResponse = null;
    }
    else {
      this.isAddressEnable = true;
      if (this.addressResponse) {
        this.addressComponent.addAddressForm.reset();
      }
    }
  }

  bindExpireMonthsAndYears() {
    var ccExpirtyYears = 10;
    for (var i = (new Date()).getFullYear(); i <= (new Date()).getFullYear() + ccExpirtyYears; i++)
      this.years.push(i);
    for (var i = 1; i < 13; i++)
      this.months.push(i);
  }

  cancelCreditCardPopUp() {
    this.createForm.reset();
    this.isAddressEnable = false;
    this.addressResponse = null;
    this.autoCardDetails = false;
    this.paymentPlanForm.controls['chkAutoDebit'].setValue(false);
    $('#autoDebit').modal('hide');
  }

  resetCreditCardPopUp() {

    this.iSNewCreditCard = false;
    this.createForm.reset();
    this.isAddressEnable = false;
    this.addressResponse = null;
    this.createForm.controls['CardType'].setValue("");
    this.createForm.controls['Month'].setValue("");
    this.createForm.controls['Year'].setValue("");
    this.paymentService.getLookups().subscribe(
      res => {
        this.cardType = res;
        this.bindExpireMonthsAndYears();

        this.paymentService.GetCreditCardByAccountId(this.accountId.toString()).subscribe(res => {
          if (res) {
            this.creditCardRequest = res;

            if (this.creditCardRequest != null && this.creditCardRequest.length > 0) {
              this.iSNewCreditCard = true;
              this.createForm.patchValue({ 'Name': this.creditCardRequest[0].NameOnCard, 'CardType': this.creditCardRequest[0].CCType, 'Month': (Number)(this.creditCardRequest[0].ExpDate.toString().slice(-2)), 'Year': this.creditCardRequest[0].ExpDate.toString().substring(0, 4) });

              if (this.creditCardRequest[0].IsPreferred) {
                var addressResponse = <IAddressResponse>{};
                addressResponse.Line1 = this.creditCardRequest[0].Line1;
                addressResponse.Line2 = this.creditCardRequest[0].Line2;
                addressResponse.Line3 = this.creditCardRequest[0].Line3;
                addressResponse.City = this.creditCardRequest[0].City;
                addressResponse.State = this.creditCardRequest[0].State
                addressResponse.Country = this.creditCardRequest[0].Country
                addressResponse.Zip1 = this.creditCardRequest[0].Zip1;
                addressResponse.Zip2 = this.creditCardRequest[0].Zip2
                this.addressResponse = addressResponse;
                this.isAddressEnable = this.creditCardRequest[0].IsPreferred;
              }
            }

          }
        });

      });
    this.autoCardDetails = false;

  }

  submitCreditCardPopUp() {

    this.iRequestCreditCard = <IRequestCreditCard>{};
    this.iRequestCreditCard.CustomerId = this.accountId;
    this.iRequestCreditCard.UserId = this.sessionContextResponse.userId;
    this.iRequestCreditCard.User = this.sessionContextResponse.userName;
    this.isInvalidCreditCard = false;
    this.isInvalidExpirationDate = false;

    let isFormValid: boolean;
    isFormValid = this.createForm.valid;

    if (isFormValid) {
      isFormValid = this.addressComponent.addAddressForm.valid || (this.addressComponent.addAddressForm.status == 'DISABLED');
    }
    if (!isFormValid) {
      this.validateAllFormFields(this.createForm);
      this.validateAllFormFields(this.addressComponent.addAddressForm);
    }
    else {
      let creditCardNum: string;
      creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;

      if (this.checkCreditCard(creditCardNum, this.createForm.controls['CardType'].value)) {
        if (this.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {

          if (creditCardNum != "")
            this.iRequestCreditCard.prefixsuffix = +creditCardNum.substr(creditCardNum.length - 4);
          else
            this.iRequestCreditCard.prefixsuffix = 0;
          this.iRequestCreditCard.CCNumber = creditCardNum;
          this.iRequestCreditCard.CCType = this.createForm.controls['CardType'].value;
          this.iRequestCreditCard.ExpDate = Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value);
          this.iRequestCreditCard.NameOnCard = this.createForm.controls['Name'].value;

          this.iRequestCreditCard.Line1 = this.addressComponent.addAddressForm.controls["addressLine1"].value;
          this.iRequestCreditCard.Line2 = this.addressComponent.addAddressForm.controls["addressLine2"].value;
          this.iRequestCreditCard.Line3 = this.addressComponent.addAddressForm.controls["addressLine3"].value;
          this.iRequestCreditCard.City = this.addressComponent.addAddressForm.controls["addressCity"].value;
          this.iRequestCreditCard.State = this.addressComponent.addAddressForm.controls["addressStateSelected"].value;
          this.iRequestCreditCard.Country = this.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
          this.iRequestCreditCard.Zip1 = this.addressComponent.addAddressForm.controls["addressZip1"].value;
          this.iRequestCreditCard.Zip2 = this.addressComponent.addAddressForm.controls["addressZip2"].value;
          this.iRequestCreditCard.isAddressEnable = this.isAddressEnable;

          this.iRequestCreditCard.ActivitySource = "Internal";
          this.iRequestCreditCard.SubSystem = "TVC";
          // this.iRequestCreditCard.DefaultFlag = true;
          this.iRequestCreditCard.IsDeletePreviousCard = true;

          //this.iRequestCreditCard.IsCardChanging = true;

          this.autoCardDetails = true;
          $('#autoDebit').modal('hide');

        }
        else {
          this.isInvalidExpirationDate = true;
        }

      }
      else {
        this.isInvalidCreditCard = true;
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        console.log(controlName);
        if (control.invalid) {
          console.log(controlName);
          console.log(control.errors);
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  addorRemoveValidators() {
    if (!this.isFullPaymentPlanBlock) {
      this.paymentPlanForm.controls["txtEmailId"].setValidators([Validators.minLength(6), Validators.maxLength(100), Validators.pattern(this.validateEmailPattern)]);
      this.paymentPlanForm.controls["txtMobileNumber"].setValidators([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)]);
      this.paymentPlanForm.controls["ddlMonthlyTerms"].setValidators([Validators.required]);
    }
    else {
      this.paymentPlanForm.controls["txtEmailId"].setValidators([]);
      this.paymentPlanForm.controls["txtMobileNumber"].setValidators([]);
      this.paymentPlanForm.controls["ddlMonthlyTerms"].setValidators([]);
    }
    this.paymentPlanForm.controls['txtEmailId'].updateValueAndValidity();
    this.paymentPlanForm.controls['txtMobileNumber'].updateValueAndValidity();
    this.paymentPlanForm.controls['ddlMonthlyTerms'].updateValueAndValidity();
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.paymentPlanForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.paymentPlanForm.controls[objId].setValue(phone);
    }
  }

  validateDayPhoneAllZeros() {
    if (this.paymentPlanForm.controls["txtMobileNumber"].valid) {
      if (this.validateAllZerosinPhone(this.paymentPlanForm.value.txtMobileNumber))
        this.isInvalidPhone = true;
      else
        this.isInvalidPhone = false;
    }
    else
      this.isInvalidPhone = false;
  }

  validateAllZerosinPhone(phoneNumber: string): boolean {
    var pattern = new RegExp(this.validatePhoneAllZerosPattern);
    var result = pattern.test(phoneNumber);
    return result;
  }

  // function to validate credit card number based on Card type
  checkCreditCard(cardnumber, cardname): boolean {

    // Array to hold the permitted card characteristics
    var cards = new Array();

    // Define the cards we support. You may add addtional card types.

    //  Name:      As in the selection box of the form - must be same as user's
    //  Length:    List of possible valid lengths of the card number for the card
    //  prefixes:  List of possible prefixes for the card
    //  checkdigit Boolean to say whether there is a check digit

    cards[0] = {
      name: "VISA",
      length: "13,16",
      prefixes: "4",
      checkdigit: true
    };
    cards[1] = {
      name: "MASTER",
      length: "16",
      prefixes: "51,52,53,54,55",
      checkdigit: true
    };
    cards[2] = {
      name: "DINERS",
      length: "14,16",
      prefixes: "300,301,302,303,304,305,36,38,55",
      checkdigit: true
    };
    cards[3] = {
      name: "CarteBlanche",
      length: "14",
      prefixes: "300,301,302,303,304,305,36,38",
      checkdigit: true
    };
    cards[4] = {
      name: "AMEX",
      length: "15",
      prefixes: "34,37",
      checkdigit: true
    };
    cards[5] = {
      name: "Discover",
      length: "16",
      prefixes: "6011,650",
      checkdigit: true
    };
    cards[6] = {
      name: "JCB",
      length: "15,16",
      prefixes: "3,1800,2131",
      checkdigit: true
    };
    cards[7] = {
      name: "enRoute",
      length: "15",
      prefixes: "2014,2149",
      checkdigit: true
    };
    cards[8] = {
      name: "Solo",
      length: "16,18,19",
      prefixes: "6334, 6767",
      checkdigit: true
    };
    cards[9] = {
      name: "Switch",
      length: "16,18,19",
      prefixes: "4903,4905,4911,4936,564182,633110,6333,6759",
      checkdigit: true
    };
    cards[10] = {
      name: "Maestro",
      length: "16,18",
      prefixes: "5020,6",
      checkdigit: true
    };
    cards[11] = {
      name: "VisaElectron",
      length: "16",
      prefixes: "417500,4917,4913",
      checkdigit: true
    };

    // Establish card type
    var cardType = -1;
    for (var i = 0; i < cards.length; i++) {

      // See if it is this card (ignoring the case of the string)
      if (cardname.toLowerCase() == cards[i].name.toLowerCase()) {
        cardType = i;
        break;
      }
    }

    // If card type not found, report an error
    if (cardType == -1) {
      //ccErrorNo = 0;
      return false;
    }

    // Ensure that the user has provided a credit card number
    if (cardnumber.length == 0) {
      //ccErrorNo = 1;
      return false;
    }

    // Now remove any spaces from the credit card number
    cardnumber = cardnumber.replace(/\s/g, "");

    // Check that the number is numeric
    var cardNo = cardnumber
    var cardexp = /^[0-9]{13,19}$/;
    if (!cardexp.exec(cardNo)) {
      //ccErrorNo = 2;
      return false;
    }

    // Now check the modulus 10 check digit - if required
    if (cards[cardType].checkdigit) {
      var checksum = 0;                                  // running checksum total
      var mychar = "";                                   // next char to process
      var j = 1;                                         // takes value of 1 or 2

      // Process each digit one by one starting at the right
      var calc;
      for (i = cardNo.length - 1; i >= 0; i--) {

        // Extract the next digit and multiply by 1 or 2 on alternative digits.
        calc = Number(cardNo.charAt(i)) * j;

        // If the result is in two digits add 1 to the checksum total
        if (calc > 9) {
          checksum = checksum + 1;
          calc = calc - 10;
        }

        // Add the units element to the checksum total
        checksum = checksum + calc;

        // Switch the value of j
        if (j == 1) { j = 2 } else { j = 1 };
      }

      // All done - if checksum is divisible by 10, it is a valid modulus 10.
      // If not, report an error.
      if (checksum % 10 != 0) {
        //ccErrorNo = 3;
        return false;
      }
    }

    // The following are the card-specific checks we undertake.
    var LengthValid = false;
    var PrefixValid = false;
    var undefined;

    // We use these for holding the valid lengths and prefixes of a card type
    var prefix = new Array();
    var lengths = new Array();

    // Load an array with the valid prefixes for this card
    prefix = cards[cardType].prefixes.split(",");

    // Now see if any of them match what we have in the card number
    for (i = 0; i < prefix.length; i++) {
      var exp = new RegExp("^" + prefix[i]);
      if (exp.test(cardNo)) PrefixValid = true;
    }

    // If it isn't a valid prefix there's no point at looking at the length
    if (!PrefixValid) {
      //ccErrorNo = 3;
      return false;
    }

    // See if the length is valid for this card
    lengths = cards[cardType].length.split(",");
    for (j = 0; j < lengths.length; j++) {
      if (cardNo.length == lengths[j]) LengthValid = true;
    }

    // See if all is OK by seeing if the length was valid. We only check the 
    // length if all else was hunky dory.
    if (!LengthValid) {
      //ccErrorNo = 4;
      return false;
    };
    // The credit card is in the required format.
    return true;
  }

  CheckExpairyDate(month: number, year: number): boolean {
    var date = new Date();
    var currentYear = date.getFullYear();
    var currentMonth = date.getMonth() + 1;
    if (currentYear == year && month < currentMonth)
      return false;
    else
      return true;
  }

  checkAllClick(event) {
    this.isFullPaymentPlanBlock = false;
    let isChecked: boolean = event.target.checked;

    this.invoicesResponseSelected = <IInvoiceResponse[]>[];

    if (this.invoicesResponse != null && this.invoicesResponse.length > 0) {

      for (var i = 0; i < this.invoicesResponse.length; i++) {

        if (isChecked && this.invoicesResponse[i].InvoiceChecked) {

          if (this.invoicesResponseSelected.length > 0) {
            if (!(this.invoicesResponseSelected.find(x => x.InvoiceNumber.toUpperCase() == this.invoicesResponse[i].InvoiceNumber.toUpperCase()))) {
              this.invoicesResponseSelected.push(this.invoicesResponse[i]);
            }
          }
          else {
            this.invoicesResponseSelected.push(this.invoicesResponse[i]);
          }

          this.invoicesResponse[i].IsChecked = true;
        }
        else
          this.invoicesResponse[i].IsChecked = false;
      }

      if (!isChecked) {
        this.invoicesResponseSelected = <IInvoiceResponse[]>[];
      }

      let amount: number = 0;

      if (this.invoicesResponseSelected && this.invoicesResponseSelected.length > 0) {
        amount = this.invoicesResponseSelected.map(c => c.OutstandingDue).reduce((sum, current) => sum + current);
        this.paymentPlanForm.controls['txtDepositAmount'].setValue(amount.toFixed(2));
      }
      else {
        this.paymentPlanForm.controls['txtDepositAmount'].setValue('');
      }

      if (amount > 0) {
        var calamount = ((amount * Number(this.strDownPaymentPercentage)) / 100);

        if (calamount <= Number(this.strMinimumPaymentPlanAmount)) {
          let decTotalPaymentPlanAmount: number = amount - calamount;
          this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(calamount.toFixed(2));
          this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(decTotalPaymentPlanAmount.toFixed(2));
          this.minDownPaymentAmount = calamount;
        }
        else {
          let decTotalPaymentPlanAmount: number = amount - Number(this.strMinimumPaymentPlanAmount)
          this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(Number(this.strMinimumPaymentPlanAmount).toFixed(2));
          this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(decTotalPaymentPlanAmount.toFixed(2));
          this.minDownPaymentAmount = Number(this.strMinimumPaymentPlanAmount);
        }
      }
      else {
        this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue('');
        this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue('');
        this.minDownPaymentAmount = 0;
      }
    }
    this.materialscriptService.material();
  }

  checkorUncheckInvoices(invoicesResponse: IInvoiceResponse, event: any) {
    this.isFullPaymentPlanBlock = false;
    let isChecked: boolean = event.target.checked;

    if (isChecked) {

      if (this.invoicesResponseSelected.length > 0) {
        if (!(this.invoicesResponseSelected.find(x => x.InvoiceNumber.toUpperCase() == invoicesResponse.InvoiceNumber.toUpperCase()))) {
          this.invoicesResponseSelected.push(invoicesResponse);
        }
      } else {
        this.invoicesResponseSelected.push(invoicesResponse);
      }

      invoicesResponse.IsChecked = true;
    }
    else {

      this.invoicesResponseSelected = this.invoicesResponseSelected.filter(item => item.InvoiceNumber.toUpperCase() !== invoicesResponse.InvoiceNumber.toUpperCase());
      invoicesResponse.IsChecked = false;

    }

    let cnt: number = this.invoicesResponse.filter(x => x.InvoiceChecked == true).length;
    if (cnt == this.invoicesResponseSelected.length) {
      this.paymentPlanForm.controls['checkAll'].setValue(true);
      this.isParentSelected = true;
    } else {
      this.paymentPlanForm.controls['checkAll'].setValue(false);
      this.isParentSelected = false;
    }

    let amount: number = 0;

    if (this.invoicesResponseSelected && this.invoicesResponseSelected.length > 0) {
      amount = this.invoicesResponseSelected.map(c => c.OutstandingDue).reduce((sum, current) => sum + current);
      this.paymentPlanForm.controls['txtDepositAmount'].setValue(amount.toFixed(2));
    }
    else {
      this.paymentPlanForm.controls['txtDepositAmount'].setValue('');
    }

    if (amount > 0) {
      var calamount = ((amount * Number(this.strDownPaymentPercentage)) / 100);

      if (calamount <= Number(this.strMinimumPaymentPlanAmount)) {
        let decTotalPaymentPlanAmount: number = amount - calamount;
        this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(calamount.toFixed(2));
        this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(decTotalPaymentPlanAmount.toFixed(2));
        this.minDownPaymentAmount = calamount;
      }
      else {
        let decTotalPaymentPlanAmount: number = amount - Number(this.strMinimumPaymentPlanAmount)
        this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue(Number(this.strMinimumPaymentPlanAmount).toFixed(2));
        this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue(decTotalPaymentPlanAmount.toFixed(2));
        this.minDownPaymentAmount = Number(this.strMinimumPaymentPlanAmount);
      }
    }
    else {
      this.paymentPlanForm.controls['txtDownPaymentAmount'].setValue('');
      this.paymentPlanForm.controls['txtTotalPaymentPlanAmount'].setValue('');
      this.minDownPaymentAmount = 0;
    }
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 100);

  }

  callUpdateDownPopUp() {
    if (this.invoicesResponseSelected && this.invoicesResponseSelected.length > 0) {
      this.strEditDownPayPercentage = "";
      $('#updateDown').modal('show');
    } else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select atleast one invoice";
    }
  }

  exitClick() {
    this.vioPaymentContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  backClick() {
    this.vioPaymentContextService.changeResponse(null);
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
