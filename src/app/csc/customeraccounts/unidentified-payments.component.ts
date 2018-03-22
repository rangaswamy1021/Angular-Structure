import { AnonymousPaymentStatus } from './constants';
import { IBlocklistresponse } from './../../shared/models/blocklistmessageresponse';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { CommonService } from './../../shared/services/common.service';
import { ICSRRelationsRequest } from './../../shared/models/csrrelationsrequest';
import { ISearchCustomerResponse } from './../search/models/searchcustomerresponse';
import { ISearchCustomerRequest } from './../search/models/searchcustomerrequest';
import { AdvanceSearchComponent } from './../../shared/search/advance-search.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountIntegration, PaymentMode } from './../../payment/constants';
import { dashCaseToCamelCase } from '@angular/platform-browser/src/dom/util';
import { IMakePaymentrequest } from './../../payment/models/makepaymentrequest';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { IPaging } from '../../shared/models/paging';
import { IUnIdentifiedResponse } from './models/unidentifiedresponse';
import { ActivitySource, SubSystem, AccountStatus, Actions, Features } from './../../shared/constants';
import { IUnIdentifiedRequest } from './models/unidentifiedrequest';
import { IUserresponse } from './../../shared/models/userresponse';
import { ICustomerContextResponse } from './../../shared/models/customercontextresponse';
import { SessionService } from './../../shared/services/session.service';
import { CustomerContextService } from './../../shared/services/customer.context.service';
import { CustomerAccountsService } from './services/customeraccounts.service';
import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { UnidentifiedPaymentsService } from "./services/unidentified-payments.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";

declare var $: any;
@Component({
  selector: 'app-unidentified-payments',
  templateUrl: './unidentified-payments.component.html',
  styleUrls: ['./unidentified-payments.component.css']
})
export class UnidentifiedPaymentsComponent implements OnInit {
  invalid: boolean;
  invalidDate: boolean;
  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  payMode: string = '';
  moneyDetails;
  unIdentifiedResponse: IUnIdentifiedResponse[];
  paging: IPaging;
  customerId: number = 0;
  transferVisible: boolean = false;
  addUnidentifiedVisible: boolean = false;
  paymentForm: FormGroup;
  transferDetails: any[];
  paymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{};
  transferStatus: string;
  searchRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
  searchResponse: ISearchCustomerResponse[];
  anonymousPaymentInfo = <any>{};
  accountInfo = <any>{};
  hidePayment: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  blockListDetails: IBlocklistresponse[] = [];
  disable: boolean = false;
  disabledPayment: boolean = false;
  disableTransfer: boolean = false;

  constructor(private customerAccountService: CustomerAccountsService,
    private customerContext: CustomerContextService,
    private commonService: CommonService,
    public renderer: Renderer,
    private sessionContext: SessionService,
    private unidentifiedService: UnidentifiedPaymentsService,
    private router: Router, private materialscriptService:MaterialscriptService) { }

  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  validateNumberPattern = "[0-9]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateExceptAnglePattern = "[^<>]*";
  checkDateRange: number;
  moDateRange: number;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  apageItemNumber: number = 10;
  acurrentPage: number = 1;
  astartItemNumber: number = 1;
  aendItemNumber: number = this.apageItemNumber;;
  atotalRecordCount: number;
  toDayDate = new Date();
  myDatePickerOptions1: ICalOptions;
  myDatePickerOptions2: ICalOptions;


  minDate = new Date(2017, 5, 10);
  maxDate = new Date(2017, 11, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    this._bsValue = v;
  }
  _bsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get bsRangeValue(): any {
    return this._bsRangeValue;
  }
  set bsRangeValue(v: any) {
    this._bsRangeValue = v;
  }

  mominDate = new Date(2017, 5, 10);
  momaxDate = new Date(2017, 11, 18);
  _mobsValue: Date;
  get mobsValue(): Date {
    return this._mobsValue;
  }
  set mobsValue(v: Date) {
    this._mobsValue = v;
  }
  _mobsRangeValue: any = [new Date(2017, 7, 4), new Date(2017, 7, 20)];
  get mobsRangeValue(): any {
    return this._mobsRangeValue;
  }
  set mobsRangeValue(v: any) {
    this._mobsRangeValue = v;
  }

  ngOnInit() {
   let a=this;
   setTimeout(function() {
      a.materialscriptService.material();
   }, 1000);
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.unidentifiedService.currentContext.subscribe(customerContext => this.paymentRequest = customerContext);

    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ChequeDateRange, userEvents).subscribe(
      res => {
        this.checkDateRange = res;
        let currentDate: Date = new Date();
        let minDateTime: Date = new Date();
        let maxDateTime: Date = new Date();

        minDateTime.setDate(currentDate.getDate() - (Number)(this.checkDateRange));
        maxDateTime.setDate(currentDate.getDate() + (Number)(this.checkDateRange));
        this.minDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate());
        this.maxDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate());
        this.myDatePickerOptions1 = {
          // other options...
          dateFormat: 'mm/dd/yyyy',
          disableUntil: { year: minDateTime.getFullYear(), month: minDateTime.getMonth() + 1, day: minDateTime.getDate() - 1 },
          disableSince: { year: maxDateTime.getFullYear(), month: maxDateTime.getMonth() + 1, day: maxDateTime.getDate() + 1 },
          inline: false,
          indicateInvalidDate: true,
          showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
        };
      }
    );

    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MODateRange).subscribe(
      res => {
        this.moDateRange = res;
        let currentDate: Date = new Date();
        let minDateTime: Date = new Date();
        let maxDateTime: Date = new Date();

        minDateTime.setDate(currentDate.getDate() - (Number)(this.moDateRange));
        maxDateTime.setDate(currentDate.getDate() + (Number)(this.moDateRange));
        this.mominDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate());
        this.momaxDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate());
        this.myDatePickerOptions2 = {
          // other options...
          dateFormat: 'mm/dd/yyyy',
          disableUntil: { year: minDateTime.getFullYear(), month: minDateTime.getMonth() + 1, day: minDateTime.getDate() - 1 },
          disableSince: { year: maxDateTime.getFullYear(), month: maxDateTime.getMonth() + 1, day: maxDateTime.getDate() + 1 },
          inline: false,
          indicateInvalidDate: true,
          showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
        };
      }
    );
    this.disabledPayment = !this.commonService.isAllowed(Features[Features.UNIDENTIFIEDPAYMENTS], Actions[Actions.PAYMENT], "");
    this.disableTransfer = !this.commonService.isAllowed(Features[Features.UNIDENTIFIEDPAYMENTS], Actions[Actions.TRANSFER], "");
    if (this.sessionContextResponse.icnId == 0) {
      this.errorMessageBlock("ICN is not assigned to do transactions");
      return false;
    }
    this.initiateFormValues();
    if (this.paymentRequest != null) {
      this.populateValues(this.paymentRequest);
    }
    this.getUnIdentifiedPayments();
  }

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getUnIdentifiedPayments();
  }
  pageChangedforSearch(event) {
    this.acurrentPage = event;
    this.astartItemNumber = (((this.acurrentPage) - 1) * this.apageItemNumber) + 1;
    this.aendItemNumber = ((this.acurrentPage) * this.apageItemNumber);
    if (this.aendItemNumber > this.atotalRecordCount)
      this.aendItemNumber = this.atotalRecordCount;
    this.customerSearch();
  }

  initiateFormValues() {
    this.paymentForm = new FormGroup({
      fname: new FormControl('', Validators.compose([Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)])),
      address: new FormControl('', Validators.compose([Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)])),
      amount: new FormControl('', Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern(this.validateNumberPattern)])),
      checkNo: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)])),
      routing: new FormControl('', Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)])),
      checkDate: new FormControl('', Validators.required),
      moneyOrder: new FormControl('', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)])),
      moDate: new FormControl('', Validators.required),
      inlineRadioOptions: new FormControl('Cheque')
      //inlineRadioOptions2: new FormControl('', Validators.required),
    });
  }
  populateValues(paymentRequest: IMakePaymentrequest) {
    debugger;
    this.initiateFormValues();
    this.payMode = PaymentMode[paymentRequest.PaymentMode];
    this.changePayment(this.payMode);
    if (paymentRequest.IsPayment == true) {
      this.addUnidentifiedVisible = true;
      if (paymentRequest.ChequeNumber != null && paymentRequest.ChequeNumber != '') {
        this.paymentForm.patchValue({
          fname: paymentRequest.Name,
          address: paymentRequest.Address,
          amount: paymentRequest.TxnAmount,
          checkNo: paymentRequest.ChequeNumber,
          routing: paymentRequest.CheckRoutingNumber,
          //  checkDate: paymentRequest.ChequeDate,
          inlineRadioOptions: 'Cheque',
        });
        let startDate = new Date();
        startDate = new Date(paymentRequest.ChequeDate);
        this.paymentForm.patchValue({
          checkDate: {
            date: {
              year: startDate.getFullYear(),
              month: startDate.getMonth() + 1,
              day: startDate.getDate()
            }
          }
        });
      }
      if (paymentRequest.MONumber != null && paymentRequest.MONumber != '') {
        this.paymentForm.patchValue({
          fname: paymentRequest.Name,
          address: paymentRequest.Address,
          amount: paymentRequest.TxnAmount,
          moneyOrder: paymentRequest.MONumber,
          //  moDate: paymentRequest.MODate,
          inlineRadioOptions: 'MoneyOrder'
        });
        let moDate = new Date();
        moDate = new Date(paymentRequest.MODate);
        this.paymentForm.patchValue({
          moDate: {
            date: {
              year: moDate.getFullYear(),
              month: moDate.getMonth() + 1,
              day: moDate.getDate()
            }
          }
        });
      }
    }
    else {
      this.transferDetails = [];
      if (paymentRequest.CustomerId > 0) {
        this.disable = false;
      }
      else {
        this.disable = true;
      }
      this.addUnidentifiedVisible = false;
      this.transferVisible = true;
      this.anonymousPaymentInfo.AccountId = paymentRequest.CustomerId;
      this.anonymousPaymentInfo.AnonymousID = paymentRequest.AnonymousID;
      this.anonymousPaymentInfo.PaymentID = paymentRequest.PaymentID;
      this.anonymousPaymentInfo.PaymentType = PaymentMode[paymentRequest.PaymentMode];
      this.anonymousPaymentInfo.ReferenceNumber = paymentRequest.CheckRoutingNumber;
      this.anonymousPaymentInfo.Amount = paymentRequest.TxnAmount;
      this.anonymousPaymentInfo.Date = paymentRequest.MODate;
      this.anonymousPaymentInfo.ReceivedDate = paymentRequest.ChequeDate;
      this.transferDetails.push(this.anonymousPaymentInfo);
    }
  }
  getUnIdentifiedPayments() {
    debugger;
    var unIdentiifedReq = <IUnIdentifiedRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = this.currentPage;;
    this.paging.PageSize = this.pageItemNumber;
    this.paging.ReCount = 0;
    this.paging.SortColumn = "ANONYMOUS_PAYMENTID";
    this.paging.SortDir = 1;
    unIdentiifedReq.Status = AnonymousPaymentStatus[AnonymousPaymentStatus.Pending];
    unIdentiifedReq.UserId = this.sessionContextResponse.userId;
    unIdentiifedReq.LoginId = this.sessionContextResponse.loginId;
    unIdentiifedReq.UserName = this.sessionContextResponse.userName;
    unIdentiifedReq.ActivitySource = ActivitySource[ActivitySource.Internal];
    unIdentiifedReq.Paging = this.paging;
    this.customerAccountService.getAnonymousPayments(unIdentiifedReq).subscribe(res => {
      this.unIdentifiedResponse = res;
      console.log("response:" + JSON.stringify(this.unIdentifiedResponse));
      if (this.unIdentifiedResponse != null && this.unIdentifiedResponse.length > 0) {
        this.totalRecordCount = this.unIdentifiedResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount
        }
      }
    });
  }
  addUnIdentifiedPayment() {
    this.addUnidentifiedVisible = true;
    this.transferVisible = false;
    this.clearPaymentFields();
  }
  changePayment(payMethod) {
    this.payMode = payMethod;
    if (payMethod == "Cheque") {
      this.paymentForm.controls["moneyOrder"].setValidators([]);
      this.paymentForm.controls['moneyOrder'].updateValueAndValidity();
      this.paymentForm.controls["moDate"].setValidators([]);
      this.paymentForm.controls['moDate'].updateValueAndValidity();

      this.paymentForm.controls["checkNo"].setValidators(Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)]));
      this.paymentForm.controls['checkNo'].updateValueAndValidity();
      this.paymentForm.controls["routing"].setValidators(Validators.compose([Validators.required, Validators.minLength(9), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)]));
      this.paymentForm.controls['routing'].updateValueAndValidity();
      this.paymentForm.controls["checkDate"].setValidators([Validators.compose([Validators.required])]);
      this.paymentForm.controls['checkDate'].updateValueAndValidity();
      this.validateCheckFeilds();
    }
    else {
      this.paymentForm.controls["checkNo"].setValidators([]);
      this.paymentForm.controls['checkNo'].updateValueAndValidity();
      this.paymentForm.controls["routing"].setValidators([]);
      this.paymentForm.controls['routing'].updateValueAndValidity();
      this.paymentForm.controls["checkDate"].setValidators([]);
      this.paymentForm.controls['checkDate'].updateValueAndValidity();
      this.paymentForm.controls["moneyOrder"].setValidators(Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(15), Validators.pattern(this.validateNumberPattern)]));
      this.paymentForm.controls['moneyOrder'].updateValueAndValidity();
      this.paymentForm.controls["moDate"].setValidators([Validators.compose([Validators.required])]);
      this.paymentForm.controls['moDate'].updateValueAndValidity();
      this.validateMOFeilds();
    }
    let b=this;
    setTimeout(function() {
      b.materialscriptService.material();
    }, 100);
  }
  continueToPayment(): void {
    debugger;
    if (this.paymentForm.valid) {
      this.paymentRequest = <IMakePaymentrequest>{};
      this.paymentRequest.AccountIntegration = AccountIntegration.MakePayment;
      this.paymentRequest.IsPostpaidCustomer = false;
      this.paymentRequest.Name = this.paymentForm.controls['fname'].value;
      this.paymentRequest.Address = this.paymentForm.controls['address'].value;
      this.paymentRequest.TxnAmount = this.paymentForm.controls['amount'].value;
      this.paymentRequest.UserName = this.sessionContextResponse.userName;
      this.paymentRequest.LoginId = this.sessionContextResponse.loginId;
      this.paymentRequest.UserId = this.sessionContextResponse.userId;
      this.paymentRequest.Description = "Unidentified Payment";
      this.paymentRequest.ICNId = this.sessionContextResponse.icnId;
      this.paymentRequest.CustomerId = 0;
      this.paymentRequest.IsPayment = true;
      let userEvents = <IUserEvents>{};
      if (this.payMode == "Cheque") {
        this.paymentRequest.PaymentMode = PaymentMode.Cheque;
        this.paymentRequest.PaymentProcess = PaymentMode[PaymentMode.Cheque].toString();
        this.paymentRequest.ChequeNumber = this.paymentForm.controls['checkNo'].value;
        this.paymentRequest.CheckRoutingNumber = this.paymentForm.controls['routing'].value;
        let checkDate = this.paymentForm.controls['checkDate'].value;
        checkDate = new Date(checkDate.date.year, (checkDate.date.month) - 1, checkDate.date.day, 23, 59, 59, 997);
        this.paymentRequest.ChequeDate = checkDate;
        //userEvents.ActionName = Actions[Actions.CHEQUE];
      }
      if (this.payMode == "MoneyOrder") {
        this.paymentRequest.ChequeDate = null;
        this.paymentRequest.PaymentMode = PaymentMode.MoneyOrder;
        this.paymentRequest.PaymentProcess = PaymentMode[PaymentMode.MoneyOrder].toString();
        this.paymentRequest.MONumber = this.paymentForm.controls['moneyOrder'].value;
        let moDate = this.paymentForm.controls['moDate'].value;
        moDate = new Date(moDate.date.year, (moDate.date.month) - 1, moDate.date.day, 23, 59, 59, 997);
        this.paymentRequest.MODate = moDate;
        //   this.paymentRequest.MODate = this.paymentForm.controls['moDate'].value;
        // userEvents.ActionName = Actions[Actions.MONEYORDER];
      }
      userEvents.ActionName = Actions[Actions.PAYMENT];
      this.userEventsCalling(userEvents);
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
      this.unidentifiedService.changeResponse(this.paymentRequest);
      this.router.navigate(['/csc/customeraccounts/verify-unidentified-payment']);
    }
    else {
      this.validateCheckFeilds()
    }
  }

  onSubmit(): void {
    if (this.advanceSearchchild.createForm.valid) {
      if ((this.advanceSearchchild.createForm.controls['AccountNo'].value !== '' &&
        this.advanceSearchchild.createForm.controls['AccountNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['SerialNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['SerialNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PlateNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PlateNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Fname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Fname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Lastname'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Lastname'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['PhoneNo'].value !== '' &&
          this.advanceSearchchild.createForm.controls['PhoneNo'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['EmailAdd'].value !== '' &&
          this.advanceSearchchild.createForm.controls['EmailAdd'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['Address'].value !== '' &&
          this.advanceSearchchild.createForm.controls['Address'].value !== null) ||
        (this.advanceSearchchild.createForm.controls['CCSuffix'].value !== '' &&
          this.advanceSearchchild.createForm.controls['CCSuffix'].value !== null)) {
        this.customerSearch();
      } else {
        this.errorMessageBlock('Please fill at-least one field');
        return;
      }
    }
  }
  resetSearch(): void {
    this.advanceSearchchild.createForm.reset();
    this.searchResponse = null;
  }
  paymentTransfer(paymentDetails) {
    this.transferDetails = [];
    this.addUnidentifiedVisible = false;
    this.disable = true;
    this.transferVisible = true;
    this.anonymousPaymentInfo.AccountId = 0;
    this.anonymousPaymentInfo.AnonymousID = paymentDetails.AnonymousID;
    this.anonymousPaymentInfo.PaymentID = paymentDetails.PaymentID;
    this.anonymousPaymentInfo.PaymentType = paymentDetails.PaymentType;
    this.anonymousPaymentInfo.ReferenceNumber = paymentDetails.ReferenceNumber;
    this.anonymousPaymentInfo.Amount = paymentDetails.Amount;
    this.anonymousPaymentInfo.Date = paymentDetails.Date;
    this.anonymousPaymentInfo.ReceivedDate = paymentDetails.ReceivedDate;
    this.transferDetails.push(this.anonymousPaymentInfo);
  }
  customerSearch() {
    var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
    csrRelationReq.CustomerIds = this.customerId.toString();
    csrRelationReq.VehicleNumbers = "";
    csrRelationReq.TagIds = "";
    csrRelationReq.InternalUserId = this.sessionContextResponse.userId;
    this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
      if (res) {
        this.errorMessageBlock('Access Denied. You do not have privileges to access this account information');
        return;
      }
      else {
        if (this.advanceSearchchild.createForm.controls['AccountNo'].value === null || this.advanceSearchchild.createForm.controls['AccountNo'].value === '') {
          this.searchRequest.AccountId = 0;
        } else {
          this.searchRequest.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value; // 10258206;
        }
        if (this.advanceSearchchild.createForm.controls['CCSuffix'].value === null || this.advanceSearchchild.createForm.controls['CCSuffix'].value === '') {
          this.searchRequest.CCSuffix = -1;
        } else {
          this.searchRequest.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value; // 1111;
        }
        this.searchRequest.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
        this.searchRequest.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
        this.searchRequest.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
        this.searchRequest.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
        this.searchRequest.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
        this.searchRequest.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;

        this.searchRequest.Address = this.advanceSearchchild.createForm.controls['Address'].value;
        this.searchRequest.ActivitySource = ActivitySource.Internal.toString();
        this.searchRequest.LoginId = this.sessionContextResponse.loginId;
        this.searchRequest.LoggedUserID = this.sessionContextResponse.userId;
        this.paging.PageSize = this.apageItemNumber;
        this.paging.PageNumber = this.acurrentPage;
        this.paging.SortColumn = 'CUSTOMERID';
        this.paging.SortDir = 1;
        this.searchRequest.PageIndex = this.paging;
        this.customerAccountService.getAdvancedSearch(this.searchRequest).subscribe(res => {
          if (res) {
            this.searchResponse = res;
            this.atotalRecordCount = this.searchResponse[0].RecordCount;
            if (this.atotalRecordCount < this.apageItemNumber) {
              this.aendItemNumber = this.atotalRecordCount
            }
          }
        },
          (err) => {
            this.errorMessageBlock(err.statusText.toString());
          },
          () => {
          });
      }
    });
  }
  radioButtonSearch(object) {
    if (object.AccountStatus == AccountStatus[AccountStatus.AC]) {
      this.disable = false;
    }
    else {
      this.disable = true;
      $('#alert-dialog').modal('show');
      this.customerSearch();
      return;
    }
    this.anonymousPaymentInfo.AccountId = object.AccountId;
    this.anonymousPaymentInfo.AccountStatus = object.AccountStatus;
  }
  continueToTransfer(objTransfer: any): void {
    this.customerId = objTransfer.AccountId;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(res => {
      if (res) {
        this.commonService.checkBlockListByAccountId(this.accountInfo.AccountId).subscribe(response => {
          if (response) {
            this.blockListDetails = response;
            $('#blocklist-dialog').modal('show');
          } else {
            this.continueToTransferPayment();
          }
        });
      } else {
        this.continueToTransferPayment();
      }
    });
  }

  continueToTransferPayment() {
    debugger;
    this.paymentRequest = <IMakePaymentrequest>{};
    this.paymentRequest.IsPayment = false;
    this.paymentRequest.CustomerId = this.accountInfo.AccountId > 0 ? this.accountInfo.AccountId : this.customerId;
    this.paymentRequest.AnonymousID = this.anonymousPaymentInfo.AnonymousID;
    this.paymentRequest.PaymentID = this.anonymousPaymentInfo.PaymentID;
    if (this.anonymousPaymentInfo.PaymentType == "Cheque")
      this.paymentRequest.PaymentMode = PaymentMode.Cheque;
    if (this.anonymousPaymentInfo.PaymentType == "MoneyOrder")
      this.paymentRequest.PaymentMode = PaymentMode.MoneyOrder;
    this.paymentRequest.AccountStatus = this.accountInfo.AccountStatus;
    this.paymentRequest.CheckRoutingNumber = this.anonymousPaymentInfo.ReferenceNumber;
    this.paymentRequest.TxnAmount = this.anonymousPaymentInfo.Amount;
    this.paymentRequest.UserName = this.sessionContextResponse.userName;
    this.paymentRequest.LoginId = this.sessionContextResponse.loginId;
    this.paymentRequest.ICNId = this.sessionContextResponse.icnId;
    this.paymentRequest.UserId = this.sessionContextResponse.userId;
    this.paymentRequest.ChequeDate = this.anonymousPaymentInfo.ReceivedDate;
    this.paymentRequest.MODate = this.anonymousPaymentInfo.Date;


    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.TRANSFER];
    this.userEventsCalling(userEvents);
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
    this.unidentifiedService.changeResponse(this.paymentRequest);
    this.router.navigate(['/csc/customeraccounts/verify-unidentified-payment']);
  }

  transferCancel(): void {
    this.transferVisible = false;
  }
  paymentCancel(): void {
    this.clearPaymentFields();
    this.addUnidentifiedVisible = false;
  }
  paymentClear(): void {
    this.clearPaymentFields();
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  clearPaymentFields() {
    this.changePayment('Cheque');
    this.paymentForm.reset();
    this.paymentForm.controls['inlineRadioOptions'].setValue('Cheque');
  }
  validateCheckFeilds() {
    this.paymentForm.controls["amount"].markAsTouched({ onlySelf: true });
    this.paymentForm.controls["checkNo"].markAsTouched({ onlySelf: true });
    this.paymentForm.controls["routing"].markAsTouched({ onlySelf: true });
    this.paymentForm.controls["checkDate"].markAsTouched({ onlySelf: true });
  }
  validateMOFeilds() {
    this.paymentForm.controls["amount"].markAsTouched({ onlySelf: true });
    this.paymentForm.controls["moneyOrder"].markAsTouched({ onlySelf: true });
    this.paymentForm.controls["moDate"].markAsTouched({ onlySelf: true });
  }
  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.UNIDENTIFIEDPAYMENTS];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
  onDateChanged1(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalid = true;
      return;
    }
    else
      this.invalid = false;
  }
  onDateChanged2(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }

}