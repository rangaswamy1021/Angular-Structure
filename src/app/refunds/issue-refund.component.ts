import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { IRefundRequest } from './models/RefundRequest';
import { IBalanceRequest } from '../csc/customerdetails/models/balancerequest';
import { IBalanceResponse } from '../csc/customerdetails/models/balanceresponse';
import { IRefundResponse } from './models/RefundResponse';
import { FormGroup, ValidationErrors, FormControl, Validators } from '@angular/forms';
import { IPaging } from '../shared/models/paging';
import { ActivitySource, SubSystem, AccountStatus, Actions, Features, defaultCulture } from '../shared/constants';
import { PaymentMode } from '../payment/constants';
import { RefundService } from './services/refund.service';
import { RefundStatus } from './constants';
import { IUserresponse } from '../shared/models/userresponse';
import { IMakePaymentrequest } from '../payment/models/makepaymentrequest';
import { CreditCardInformationComponent } from '../payment/credit-card-information.component';
import { ChequeComponent } from '../payment/cheque.component';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../payment/services/payment.service';
import { SessionService } from '../shared/services/session.service';
import { ICreditCardRequest } from '../payment/models/creditcardrequest';
import { CommonService } from '../shared/services/common.service';
import { IAddressResponse } from '../shared/models/addressresponse';
import { IRefundQueue } from './models/RefundQueue';
import { Pipe, PipeTransform } from '@angular/core';
import { IRefundProcess } from './models/RefundProcess';
import { RefundContextService } from './services/RefundContextService';
import { IUserEvents } from '../shared/models/userevents';
import { MaterialscriptService } from '../shared/materialscript.service';
import { DatePickerFormatService } from '../shared/services/datepickerformat.service';


declare var $: any;
@Component({
  selector: 'app-issue-refund',
  templateUrl: './issue-refund.component.html',
  styleUrls: ['./issue-refund.component.css']
})
export class IssueRefundComponent implements OnInit {
  creditCardRequest: ICreditCardRequest[];
  rrId: string;
  accountID: number;
  afterSearch: boolean = false;
  refundRequest: any;
  issueRefundRequest: IRefundRequest;
  balanceRequest: any;
  balanceResponse: IBalanceResponse;
  creditCardsFrom: FormGroup;
  refundResponse: IRefundResponse[] = <IRefundResponse[]>[];
  refundResponseSelected: IRefundResponse[] = <IRefundResponse[]>[];
  paging: IPaging;
  bsRangeValue: any;
  sessionContextResponse: IUserresponse;
  payment: any;
  chequePayments: any;
  creditCard: any;
  createForm: FormGroup;
  isCreditCardPayment: boolean = false;
  isCheque: boolean = false;;
  customerid: number;
  isCreditCardModesVisible: boolean = false;
  isDisplay: boolean = false;
  addressResponse: IAddressResponse;
  items = [];
  issueRefundForm: FormGroup;
  subSystem: string;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  cancelRRIdPop: boolean = false;
  submitRRIdPop: boolean = false;
  @Input('IsDisabled') isDisbaleNext: boolean;
  @Output() onValidationChanges: EventEmitter<boolean> = new EventEmitter();
  @ViewChild(CreditCardInformationComponent) creditCardComponent;
  @ViewChild(ChequeComponent) chequeComponent;
  selectedCCID: string = '';
  pageSize: number = 10;
  iRefundProcess: IRefundProcess[] = <IRefundProcess[]>[];
  numberic = '[0-9]*';
  menuHeading: string = 'CSC';
  menuSubSystem: string = 'CSC Refunds';
  disableButton: boolean;
  disableCancelButton: boolean;
  disableProcessButton: boolean;



  constructor(private refundService: RefundService, private router: Router, private datePickerFormat: DatePickerFormatService,
    private route: ActivatedRoute, private commonService: CommonService,
    private paymentService: PaymentService, private sessionContext: SessionService,
    private refundContextService: RefundContextService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.issueRefundForm = new FormGroup({
      'rrId': new FormControl('', [Validators.required, Validators.pattern(this.numberic)]),
    });
    this.creditCardsFrom = new FormGroup({
      'creditCards': new FormControl('', []),
    });

    let userEvents = <IUserEvents>{};

    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;

    if (this.router.url.indexOf('csc') > 0) {
      userEvents.FeatureName = Features[Features.ISSUEREFUND];
      this.subSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = 'CSC';
      this.menuSubSystem = 'Refunds';

    } else if (this.router.url.indexOf('tvc') > 0) {
      userEvents.FeatureName = Features[Features.TVCISSUEREFUND];
      this.subSystem = SubSystem[SubSystem.TVC];
      this.menuHeading = 'TVC';
      this.menuSubSystem = 'Refunds';
    } else {
      userEvents.FeatureName = Features[Features.ISSUEREFUND];

      this.subSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = 'CSC';
      this.menuSubSystem = 'Refunds';
    }

    this.route.queryParams.subscribe(params => {
      this.rrId = params['rrId'];
    });
    if (this.rrId == undefined) {
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {
      });
    }
    else {

      this.bindData(userEvents);

    }
    if (this.menuHeading === 'TVC') {
      this.disableButton = !this.commonService.isAllowed(Features[Features.TVCISSUEREFUND], Actions[Actions.SEARCH], '');
      this.disableProcessButton = !this.commonService.isAllowed(Features[Features.TVCISSUEREFUND], Actions[Actions.PROCESS], '');
      this.disableCancelButton = !this.commonService.isAllowed(Features[Features.TVCISSUEREFUND], Actions[Actions.CANCEL], '');

    } else {

      this.disableButton = !this.commonService.isAllowed(Features[Features.ISSUEREFUND], Actions[Actions.SEARCH], '');
      this.disableProcessButton = !this.commonService.isAllowed(Features[Features.ISSUEREFUND], Actions[Actions.PROCESS], '');
      this.disableCancelButton = !this.commonService.isAllowed(Features[Features.ISSUEREFUND], Actions[Actions.CANCEL], '');
    }

    this.sessionContextResponse = this.sessionContext.customerContext;
  }

  ngOnChanges(): void {
    this.onValidationChanges.emit(this.isDisbaleNext);
    this.sessionContextResponse = this.sessionContext.customerContext;
  }

  bindData(userEvents: any) {
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.refundRequest = <any>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = this.pageSize;
    this.paging.ReCount = 0;
    this.paging.SortColumn = 'CustomerId';
    this.paging.SortDir = 1;
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.PageIndex = this.paging;
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.RefundType = this.subSystem == 'TVC' ? 'OVERPAYMENT' : 'RR';
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.IsSearchEventFired = false;
    this.refundRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.refundRequest.RefundRequestState = RefundStatus[RefundStatus.QUEUED];
    this.refundRequest.RefundRequestedDate = new Date();
    this.refundRequest.StartDate = new Date();
    //TimeSpan ts = new TimeSpan(23, 59, 59);
    this.refundRequest.EndDate = new Date();
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.Amount = '';
    this.refundRequest.CreatedUser = this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
    this.refundRequest.ActivityType = 'ACCTREFUND';
    this.refundRequest.RRID = this.rrId;
    this.refundService.getRefundQueue(this.refundRequest, userEvents).subscribe(
      res => {
        this.refundResponse = res;
      }, (error) => {

      }, () => {
        this.afterSearch = true;
        if (this.refundResponse && this.refundResponse.length) {
          this.customerid = this.refundResponse[0].AccountID;
          if (this.refundResponse[0].ModeofPayment.toString().toUpperCase() == PaymentMode[PaymentMode.CreditCard].toString().toUpperCase()) {
            if (this.subSystem.toUpperCase() == SubSystem[SubSystem.CSC].toString().toUpperCase()) {
              this.paymentService.GetCreditCardByAccountId(this.refundResponse[0].AccountID.toString()).subscribe(res => {
                if (res) {
                  this.creditCardRequest = res;
                  for (let i = 0; i < this.creditCardRequest.length; i++) {
                    this.creditCardRequest[i].TypeSuffix = this.creditCardRequest[i].CCType + '-' + this.creditCardRequest[i].prefixsuffix;
                  }
                  if (this.creditCardRequest != null && this.creditCardRequest.length > 0) {
                    this.isCreditCardModesVisible = true;
                    this.isDisplay = true;
                  }
                  else {
                    this.ngOnChanges();
                    this.isCreditCardModesVisible = false;
                    this.isCreditCardPayment = true;
                    this.isDisplay = true;
                  }
                }
              });
            }
            else {
              this.isCreditCardPayment = true;
              this.isDisplay = true;
            }
          }
          else if (this.refundResponse[0].ModeofPayment.toString().toUpperCase() == PaymentMode[PaymentMode.Cheque].toString().toUpperCase()) {
            this.isCheque = true;
            this.isDisplay = true;
          }
        }
        else {
          this.isCreditCardModesVisible = false;
          this.isCreditCardPayment = false;
          this.isDisplay = false;
          this.isCheque = false;
        }
      });

  }

  SearchClick() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;
    
    if (this.menuHeading === 'TVC') {
      userEvents.FeatureName = Features[Features.TVCISSUEREFUND];
    }
    else {
      userEvents.FeatureName = Features[Features.ISSUEREFUND];

    }
    this.bindData(userEvents);
  }
  ResetClick() {
    this.materialscriptService.material();
    this.rrId = '';
    this.bindData(null);
    this.isCheque = false;
    this.isDisplay = false;
    this.isCreditCardModesVisible = false;
    this.isCreditCardPayment = false;
    this.afterSearch = false;
  }

  refundQueueSave() {
     $('#pageloader').modal('show');
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.PROCESS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;
    if (this.menuHeading === 'TVC') {
      userEvents.FeatureName = Features[Features.TVCISSUEREFUND];
    }
    else {
      userEvents.FeatureName = Features[Features.ISSUEREFUND];

    }
    if (this.refundResponse[0].ModeofPayment.toString().toUpperCase() == PaymentMode[PaymentMode.CreditCard].toString().toUpperCase()) {
      if (!this.isCreditCardModesVisible) {
        if (!this.creditCardComponent.createForm.valid || (this.creditCardComponent.isAddressEnable && !this.creditCardComponent.addressComponent.addAddressForm.valid)) {
          // this.errorBlock = true;
          // this.errorHeading = 'Refunds Submit';
          // this.errorMessage = 'Error while submitting refunds.';
          this.validateAllFormFields(this.creditCardComponent.createForm);
          this.validateAllFormFields(this.creditCardComponent.addressComponent.addAddressForm);
          $('#pageloader').modal('hide');
          return;
        }
      }
      else {
        if (!this.creditCardsFrom.valid) {
          this.validateAllFormFields(this.creditCardsFrom);
          $('#pageloader').modal('hide');
          return;
        }
      }
    }

    if (this.isCheque) {
      if (!this.chequeComponent.createForm.valid) {
        this.validateAllFormFields(this.chequeComponent.createForm);
        $('#pageloader').modal('hide');
        return;
      }
    }
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.CreatedUser = this.sessionContextResponse.userName;
    this.refundRequest.AccountID = this.refundResponse[0].AccountID;
    this.refundRequest.RRID = this.refundResponse[0].RRID;
    this.refundRequest.Amount = this.refundResponse[0].Amount;
    this.refundRequest.ModeofPayment = this.refundResponse[0].ModeofPayment;
    this.refundRequest.RefundType = this.refundResponse[0].RefundType;
    let result = this.CreateCreditCardDTO();
    if (result) {
      //this.refundRequest.PaymentRequest =
      this.refundService.processRefunds(this.refundRequest, userEvents).subscribe(
        res => {
          $('#pageloader').modal('hide');
          if (res) {
            this.showSucsMsg('Refunds successfully submitted');
            this.isDisplay = false;
            this.isCreditCardModesVisible = false;
            this.isCreditCardPayment = false;
            this.isCheque = false;
            this.bindData(null);
            this.rrId = '';
          } else {
            this.submitRRIdPop = true;
            this.alertClick('Are you sure you want to generate Refund Request for selected accounts. ');
          }
           // $('#pageloader').modal('hide');
        },
        (err) => {
          $('#pageloader').modal('hide');
          if (this.refundRequest.ModeofPayment.toString().toUpperCase() == PaymentMode[PaymentMode.CreditCard].toString().toUpperCase()) {
            this.submitRRIdPop = true;
            this.alertClick('Are you sure you want to generate Refund Request for selected accounts. ');
          }
        });
        // $('#pageloader').modal('hide');
    }
    else {
      return;
    }
  }
  CreateCreditCardDTO(): boolean {
    let result = true;
    if (this.refundResponse[0].ModeofPayment.toString().toUpperCase() == PaymentMode[PaymentMode.CreditCard].toString().toUpperCase()) {
      this.payment = <any>{};
      this.creditCard = <any>{};
      let creditCardNum: string;
      this.payment.ShipmentAddress = <any>{};
      if (this.isCreditCardModesVisible) {
        this.creditCard.NameOnCard = this.creditCardRequest[0].NameOnCard;
        this.creditCard.CreditCardType = this.creditCardRequest[0].CCType;
        this.creditCard.ExpiryDate = this.creditCardRequest[0].ExpDate;
        this.creditCard.CreditCardNumber = this.creditCardRequest[0].CCNumber;
        this.creditCard.PaymentMode = PaymentMode[PaymentMode.CreditCard];
        this.creditCard.CCID = this.selectedCCID;
        this.creditCard.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();
        this.payment.CreditCardPayments = this.creditCard;
      } else {
        this.createForm = this.creditCardComponent.createForm;

        creditCardNum = this.createForm.get('CCNumbers.CCNumber1').value + '' + this.createForm.get('CCNumbers.CCNumber2').value + '' + this.createForm.get('CCNumbers.CCNumber3').value + '' + this.createForm.get('CCNumbers.CCNumber4').value;
        //  this.payment.creditCard.CreditCardPayment = <ICreditcardpaymentrequest>{};
        this.creditCard.NameOnCard = this.createForm.controls['Name'].value;
        this.creditCard.CreditCardType = this.createForm.controls['CardType'].value;
        this.creditCard.ExpiryDate = (Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value)).toString();
        this.creditCard.ExpiryMonth = this.createForm.controls['Month'].value;
        this.creditCard.ExpiryYear = this.createForm.controls['Year'].value;
        this.creditCard.CreditCardNumber = creditCardNum;
        this.creditCard.CVV = '';

        this.creditCard.PaymentMode = PaymentMode[PaymentMode.CreditCard];
        this.creditCard.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();
        this.creditCard.Line1 = this.creditCardComponent.addressComponent.addAddressForm.controls['addressLine1'].value;
        this.creditCard.Line2 = this.creditCardComponent.addressComponent.addAddressForm.controls['addressLine2'].value;
        this.creditCard.Line3 = this.creditCardComponent.addressComponent.addAddressForm.controls['addressLine3'].value;

        this.creditCard.City = this.creditCardComponent.addressComponent.addAddressForm.controls['addressCity'].value;
        this.creditCard.State = this.creditCardComponent.addressComponent.addAddressForm.controls['addressStateSelected'].value;
        this.creditCard.Country = this.creditCardComponent.addressComponent.addAddressForm.controls['addressCountrySelected'].value;
        this.creditCard.Zip1 = this.creditCardComponent.addressComponent.addAddressForm.controls['addressZip1'].value;
        this.creditCard.Zip2 = this.creditCardComponent.addressComponent.addAddressForm.controls['addressZip2'].value;
        this.creditCard.IsAddNewCardDetails = this.createForm.controls['SaveCreditCard'].value;
        this.creditCard.IsNewAddress = this.creditCardComponent.isAddressEnable;
        if (this.creditCardComponent.checkCreditCard(creditCardNum, this.creditCard.CreditCardType)) {
          if (this.creditCardComponent.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {
            this.payment.CreditCardPayments = this.creditCard;
          }
          else {
            this.showErrorMsg('Invalid Expiration Date');
            result = false;
          }
        }
        else {
          this.showErrorMsg('Enter valid Credit Card #');
          result = false;
        }
      }
    }
    else {
      this.chequePayments = <any>{}
      this.payment = <any>{};
      this.chequePayments.PaymentMode = PaymentMode[PaymentMode.Cheque];
      this.chequePayments.PaymentProcess = PaymentMode[PaymentMode.Cheque].toString();
      this.createForm = this.chequeComponent.createForm;
      this.chequePayments.ChequeNumber = this.createForm.controls['checkNumber'].value;
      this.chequePayments.RoutingNumber = this.createForm.controls['checkRouting'].value;;
      // this.chequePayments.ChequeDate = this.createForm.controls['checkDate'].value;
      let chkdate = this.createForm.controls['checkDate'].value;
      // makepaymentrequest.ChequeDate = chkdate.formatted;
      this.chequePayments.ChequeDate = this.datePickerFormat.getFormattedDate(chkdate.date).toLocaleString(defaultCulture).replace(/\u200E/g, '');

      this.payment.ChequePayments = this.chequePayments;
      this.payment.SubSystem = this.subSystem;
    }
    this.payment.ICNId = this.sessionContextResponse.icnId;
    this.refundRequest.Payment = this.payment;
    return result;
  }
  onSaveClicked($event) {
    if ($event.result == true) {

      this.showSucsMsg($event.msg);
      this.isDisbaleNext = false;
      this.ngOnChanges();
      this.isCreditCardModesVisible = true;
    }
    else {
      this.showErrorMsg($event.msg);
    }

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


  Back() {
    if (this.subSystem == SubSystem[SubSystem.CSC])
      this.router.navigate(['/csc/refund-queue']);
    else if (this.subSystem == SubSystem[SubSystem.TVC])
      this.router.navigate(['/tvc/refund-queue']);
  }

  submitCheckRefund() {

    this.isDisplay = false;
    let isSuccess: boolean = false;
    this.isCreditCardPayment = false;
    this.isCreditCardModesVisible = false;

    this.refundRequest.SubSystem = this.subSystem;
    this.refundResponse.forEach(resp => {
      this.refundRequest.ModeofPayment = resp.ModeofPayment;
      this.refundRequest = <IRefundQueue>{};
      this.refundRequest.AccountID = resp.AccountID;
      this.refundRequest.Amount = resp.Amount;
      this.refundRequest.AccountStatus = resp.AccountStatus;
      this.refundRequest.StartDate = new Date();
      this.refundRequest.EndDate = new Date();
      this.items.push(this.refundRequest);
    });
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.CreatedUser = this.sessionContextResponse.userName;
    this.refundRequest.AccountID = this.refundResponse[0].AccountID;
    this.refundRequest.CreatedDate = new Date();
    this.refundRequest.StartDate = new Date();
    this.refundRequest.RRID = this.refundRequest.ExceptionRRID = this.rrId;
    this.refundRequest.EndDate = new Date();
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.RefundType = this.refundResponse[0].RefundType;
    this.refundRequest.ActivityType = 'ACCTREFUND';
    this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
    this.refundRequest.RefundRequestedDate = new Date();
    this.refundRequest.RefundRequestState = RefundStatus[RefundStatus.QUEUED];
    this.refundRequest.ModeofPayment = this.refundResponse[0].ModeofPayment;
    this.refundRequest.DCCCcnvrtcheck = true;
    this.refundRequest.objIlRefundQueue = this.items.map(x => Object.assign({}, x));
    this.refundService.postRefundRequests(this.refundRequest).subscribe(
      res => {
        if (res) {
          if (this.subSystem == SubSystem[SubSystem.CSC])
            this.router.navigate(['/csc/refund-queue']);
          else if (this.subSystem == SubSystem[SubSystem.TVC])
            this.router.navigate(['/tvc/refund-queue']);
          this.iRefundProcess = res;
          this.refundContextService.setRefund(this.iRefundProcess);

          var strSplitPath = window.location.href.split('#');
          let navigatePath: string = '';

          if (this.subSystem == 'TVC') {
            navigatePath = (strSplitPath[0] + '#/tvc/violator-refund-form').toString();
          }
          else {
            navigatePath = (strSplitPath[0] + '#/csc/customer-refund-form').toString();
          }

          if (navigatePath) {
            var newWindow = window.open(navigatePath);
          }
          this.isDisplay = true;
          this.isCheque = true;
          this.showSucsMsg('Refunds successfully submitted');
          this.bindData(null);
        } else {
          this.showErrorMsg('Error while submitting refunds.');
          this.afterSearch = false;

        }
      },
      (err) => {

        this.showErrorMsg(err.statusText);
        this.afterSearch = false;
      },
      () => {
        $('#accountId').val('');
        $('#firstName').val('');
        $('#lastName').val('');
      });

  }

  addnewCreditCard() {
    this.isCreditCardModesVisible = false;
    this.isCreditCardPayment = true;
    this.isDisplay = true;
  }

  cancelRRId() {

    // $('#refund-cancel').modal('show');
    // this.popupMessage = 'Are you sure you want to cancel the Refund Request?';

  }
  submitCancelRefundQueue() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.CANCEL];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;
    if (this.menuHeading === 'TVC') {
      userEvents.FeatureName = Features[Features.TVCISSUEREFUND];
    }
    else {
      userEvents.FeatureName = Features[Features.ISSUEREFUND];

    }
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.CreatedUser = this.sessionContextResponse.userName;
    this.refundRequest.AccountID = this.refundResponse[0].AccountID;
    this.refundRequest.RRID = this.refundResponse[0].RRID;
    this.refundRequest.Amount = this.refundResponse[0].Amount;
    this.refundRequest.ModeofPayment = this.refundResponse[0].ModeofPayment;
    this.refundRequest.RefundType = this.refundResponse[0].RefundType;
    this.refundRequest.StartDate = new Date();
    //TimeSpan ts = new TimeSpan(23, 59, 59);
    this.refundRequest.EndDate = new Date();
    this.refundRequest.RefundRequestState = RefundStatus[RefundStatus.CANCELLED];
    this.refundRequest.ActivityType = 'REFUNDCAN';
    this.refundService.RefundRequests_Queue_Update(this.refundRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.showSucsMsg('Refunds successfully cancelled.');
          this.isDisplay = false;
          this.isCreditCardModesVisible = false;
          this.isCheque = false;
          this.rrId = '';
          this.bindData(null);
          $('#refund-cancel').modal('hide');

        } else {
          this.showErrorMsg('Error while submitting refunds.');
        }
      },
      (err) => {
        this.showErrorMsg(err.statusText);
      });
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  ResetClickCheck() {
    $('#refund-conf').modal('hide');
  }

  submitCancelRefund() {
    this.cancelRRIdPop = true;
    this.alertClick('Are you sure you want to cancel the Refund Request?');
  }
  setOutputFlag(e) {
    this.msgFlag = e;
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
  alertClick(msgDesc) {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgDesc = msgDesc;
  }
  userAction(event) {
    if (event) {
      if (this.cancelRRIdPop) {
        this.submitCancelRefundQueue();
      } else if (this.submitRRIdPop) {
        this.submitCheckRefund();
      } else {

      }

    }
  }
}


