import { SubFeatures, Actions, Features } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { debug } from 'util';
import { ReplenishmentType } from './constants';
import { IBankRequest } from './../../payment/models/bankrequest';
import { ICreditCardRequest } from './../../payment/models/creditcardrequest';
import { IMakePaymentrequest } from './../../payment/models/makepaymentrequest';
import { AmChart } from '@amcharts/amcharts3-angular';
import { IBlocklistresponse } from './../../shared/models/blocklistmessageresponse';
import { IBlocklistRequest } from './../../payment/models/blocklistrequest';
import { PaymentMode, AccountStatus } from './../../payment/constants';
import { ICreditcardpaymentrequest } from './../../payment/models/creditcardpaymentrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MoneyOrderComponent } from './../../payment/money-order.component';
import { ChequeComponent } from './../../payment/cheque.component';
import { BankInformationComponent } from './../../payment/bank-information.component';
import { CreditCardInformationComponent } from './../../payment/credit-card-information.component';
import { ISplitRequest } from './models/splitrequest';
import { SplitCustomerService } from './services/splitcustomer.service';
import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { PaymentService } from "../../payment/services/payment.service";
import { CommonService } from "../../shared/services/common.service";
import { IAddressRequest } from "../../payment/models/addressrequest";
import { ActivitySource, SubSystem } from "../../shared/constants";
import { ITagrequests } from "../../payment/models/tagrequests";
import { Router } from '@angular/router';
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { MakePaymentComponent } from "../../payment/make-payment.component";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-split-payment',
  templateUrl: './split-payment.component.html',
  styleUrls: ['./split-payment.component.scss']
})
export class SplitPaymentComponent implements OnInit {
  enableBalTranGrid: boolean = false;
  checkServiceTax: boolean;
  ccServiceTax: number;
  planName: string = "No Plan";
  isTagRequired: boolean;
  isTagMessage: string;
  txnAmount: number = 0;
  payMethod = "CreditCard";
  isCheckBloackList: boolean;
  sessionContextResponse: IUserresponse;
  availAmount: string;
  maxtransfAmount: number;
  amountTransfering: number;
  payAmount: number;
  customerId: number;
  custDetails: string;
  balTran: BalanceTransfer = <BalanceTransfer>{};
  splitReq: ISplitRequest = <ISplitRequest>{};
  makePaymentForm: FormGroup;
  splitPayForm: FormGroup;
  popupHeading: string;
  popupMessage: string;
  failureMessage: string
  successMessage: string;
  objBlockListRes: IBlocklistresponse[];
  chkBalanceTran: boolean;
  isTotPayByTran: boolean;
  isCreditCardAdd: boolean = false;
  isACHAdd: boolean = false;
  fee: string;
  discount: string;
  feeAmount: string;
  plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
  createForm: FormGroup;
  alertMessage: string = "";
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  @ViewChild(MakePaymentComponent) makePaymentComp;
  @ViewChild(CreditCardInformationComponent) creditCardComponent;
  @ViewChild(BankInformationComponent) bankCardComponent;
  @ViewChild(ChequeComponent) chequeCardComponent;
  @ViewChild(MoneyOrderComponent) moComponent;
  @ViewChild('Payment') public Payment: ElementRef;
  objBlockList: IBlocklistRequest = <IBlocklistRequest>{};
  validateNumberPattern = "[0-9]*"
  errorBlock: boolean = false;
  errorHeading: string;
  errorMessage: string;
  isAddCCBlockList: boolean = false;
  constructor(private paymentService: PaymentService, private commonService: CommonService, private router: Router, private customerAccountsService: CustomerAccountsService,
    private splitAccountService: SplitCustomerService, private sessionService: SessionService, private splitService: SplitCustomerService, private sessionContext: SessionService, public renderer: Renderer, private materialscriptService: MaterialscriptService) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }
  bindPaymentDetails(splitReq: ISplitRequest): void {
    this.makePaymentComp.bindDetailsOnBack(this.splitReq.Payment);
  }

  bindBalanceTransferDetails(splitReq: ISplitRequest): void {
    let val = true;
    //this.chkBalanceTrasferClick(val);
    this.getBackbalanceTransferDetails(this.splitReq);
    this.amountTransfering = this.splitReq.tranAmount;
    this.payAmount = this.splitReq.payingAmount;
  }

  getBackbalanceTransferDetails(chkBalTran) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.PAYMENT];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.chkBalanceTran = true;
    this.enableBalTranGrid = true;
    if (this.splitReq.CustAttrib.IsPostPaidCustomer)
      this.planName = "PostPaid";
    else
      this.planName = "Prepaid";
    this.customerId = this.splitReq.CustInfo.AccountId;
    this.custDetails = this.customerId.toString() + "," + this.planName;
    this.splitService.getBalanaceTransferDetails(this.custDetails, userEvents)
      .subscribe(
      res => {
        this.balTran = res;
        if (this.balTran.ErrorMsg != null) {
        }
        this.availAmount = this.balTran.CurrentBal;
        this.maxtransfAmount = this.balTran.AvailableBal;
      }
      );
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    //this.makePaymentComp.InitialiZeObject();
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.makePaymentComp.InitialiZeObject();
    this.splitReq = this.splitService.splitContext();
    if (this.splitReq.Payment.CreditCardPayment != null || this.splitReq.Payment.BankName != null ||
      this.splitReq.Payment.ChequeNumber != null || this.splitReq.Payment.MODate != null) {
      this.bindPaymentDetails(this.splitReq);
    }
    this.customerAccountsService.getAllPlansWithFees().subscribe(res => {
      this.plansResponse = res
      var plan = this.plansResponse.filter(x => x.PlanId == this.splitReq.CustAttrib.PlanId)[0];
      this.planName = plan.Name;
      this.isTagRequired = plan.IsTagRequired;
      this.fee = plan.FeeDesc;
      //this.feeAmount = plan.TotalFee;
      this.discount = plan.DiscountDesc;
      this.txnAmount = this.splitReq.totAmount;
      if (this.isTagRequired) { this.isTagMessage = "(Transponder Required)"; } else { this.isTagMessage = "(Vehicle Required)"; }
    });
    if (this.splitReq.isBalTran) {
      this.bindBalanceTransferDetails(this.splitReq);
    }
    this.splitReq.Payment.ICNId = this.sessionContextResponse.icnId;
    this.payMethod = this.splitReq.Payment.ReplenishmentType;

    if (this.payAmount == undefined || this.payAmount == null) {
      this.payAmount = this.splitReq.totAmount;
    }
    if (this.splitReq.CustAttrib.IsPostPaidCustomer)
      this.splitReq.IsPostPaidCustomer = true;
    else
      this.splitReq.IsPostPaidCustomer = false;

    this.splitPayForm = new FormGroup({
      'txtavailAmount': new FormControl({ value: '', disabled: true }, ),
      'txtmaxtransfAmount': new FormControl({ value: '', disabled: true }),
      'txtamountTransfering': new FormControl('', Validators.compose([Validators.pattern(this.validateNumberPattern)])),
      'txtpayAmount': new FormControl({ value: '', disabled: true }, ),
      'chkBalTran': new FormControl('', [])
    });
    this.makePaymentComp.setCustomerId(this.splitReq.CustInfo.AccountId, "");
    this.checkBlockList();
  }
  validateAmount(): void {
    let maxAmnt = this.splitPayForm.controls['txtmaxtransfAmount'].value;
    let Amnt = this.splitPayForm.controls['txtamountTransfering'].value;
    if (Amnt == null || Amnt == '') {
      this.payAmount = this.splitReq.totAmount;
    }
    debugger;
    if (parseFloat(Amnt) <= parseFloat(maxAmnt)) {
      this.payAmount = this.splitReq.totAmount - parseFloat(Amnt);
    }
    else if (parseFloat(Amnt) > parseFloat(maxAmnt)) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Amount should be less than or equal to transferable amount";
      this.msgTitle = '';
      this.amountTransfering = this.splitReq.totAmount;
      this.payAmount = 0;
      if (maxAmnt < this.splitReq.totAmount) {
        this.amountTransfering = maxAmnt;
        this.payAmount = this.splitReq.totAmount - this.amountTransfering;
      }
    }
    if (parseFloat(Amnt) >= this.splitReq.totAmount && parseFloat(Amnt) <= maxAmnt) {
      this.payAmount = 0;
      this.isTotPayByTran = true;
      this.renderer.setElementStyle(this.Payment.nativeElement, 'display', 'none');
      if (this.payMethod.toUpperCase() == "ACH" && !this.splitReq.IsAddNewBankDetails) {
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = "Add atleast one ACH account when Auto Replenishment type is ACH";
        this.msgTitle = '';
        this.isACHAdd = true;
      }
      if (this.payMethod.toUpperCase() == "CREDITCARD" && !this.splitReq.IsAddCreditCard) {
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = "Add atleast one credit card when Auto Replenishment type is credit card";
        this.msgTitle = '';
        this.isCreditCardAdd = true;
      }
    }
    else {
      this.isTotPayByTran = false;
      this.isACHAdd = false;
      this.isCreditCardAdd = false;
      this.renderer.setElementStyle(this.Payment.nativeElement, 'display', 'block');
    }
  }
  // hideAlert() {
  //   this.alertMessage = "";
  //   $('#confirm-dialog-reset').modal('hide');
  // }
  goToVerifyPayment(): void {
    let isFormValid: boolean;
    this.payMethod = this.makePaymentComp.payMethod;
    if (this.payMethod.toUpperCase() == "CREDITCARD") {
      isFormValid = this.makePaymentComp.creditCardComponent.createForm.valid;
      if (isFormValid)
        isFormValid = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.valid || (this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.status == 'DISABLED');
    }
    else if (this.payMethod == "ACH") {
      isFormValid = this.makePaymentComp.bankCardComponent.createForm.valid;
    }
    else if (this.payMethod.toUpperCase() == "CHEQUE") {
      isFormValid = this.makePaymentComp.chequeCardComponent.createForm.valid;
    }
    else if (this.payMethod == "MO") {
      isFormValid = this.makePaymentComp.moComponent.createForm.valid;
    }
    else if (this.payMethod.toUpperCase() == "CASH") {
      isFormValid = true;
    }
    if (!this.isTotPayByTran && this.splitReq.Payment.ReplenishmentType.toUpperCase() == "CREDITCARD" && this.payMethod.toUpperCase() != "CREDITCARD") {
      if (this.splitReq.IsAddCreditCard) {
        if ((this.payMethod.toUpperCase() == "CHEQUE" || this.payMethod.toUpperCase() == "MO" || this.payMethod == "ACH" || this.payMethod.toUpperCase() == "CREDITCARD") && !isFormValid) {
          this.validateFormFields();
          return;
        }
        isFormValid = true;
      }
      else {
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = "Add atleast one credit card when Auto Replenishment type is credit card";
        this.msgTitle = '';
        isFormValid = false;
        this.isCreditCardAdd = true;
      }
    }
    if (!this.isTotPayByTran && this.splitReq.Payment.ReplenishmentType.toUpperCase() == "ACH" && this.payMethod.toUpperCase() != "ACH") {
      if (this.splitReq.IsAddNewBankDetails) {
        if ((this.payMethod.toUpperCase() == "CHEQUE" || this.payMethod.toUpperCase() == "MO" || this.payMethod == "ACH" || this.payMethod.toUpperCase() == "CREDITCARD") && !isFormValid) {
          this.validateFormFields();
          return;
        }
        isFormValid = true;
      }
      else {
        this.msgFlag = true;
        this.msgType = 'alert';
        this.msgDesc = "Add atleast one ACH account when Auto Replenishment type is ACH";
        this.msgTitle = '';
        isFormValid = false;
        this.isACHAdd = true;
      }
    }
    if (this.isTotPayByTran) {
      if (this.payMethod.toUpperCase() == "ACH" && !this.splitReq.IsAddNewBankDetails)
        isFormValid = false;
      if (this.payMethod.toUpperCase() == "CREDITCARD" && !this.splitReq.IsAddCreditCard)
        isFormValid = false;
      isFormValid = true;
    }
    if (isFormValid && !this.splitPayForm.valid) {
      isFormValid = false;
    }
    if (isFormValid) {
      let creditCardNum: string;
      this.splitReq.Payment.CreditCardPayment = null;
      this.splitReq.Payment.BankName = this.splitReq.Payment.BankRoutingNumber = this.splitReq.Payment.AccountNumber = null;
      this.splitReq.Payment.ChequeDate = this.splitReq.Payment.ChequeNumber = null;
      this.splitReq.Payment.MODate = this.splitReq.Payment.MONumber = null;
      if (this.chkBalanceTran) {
        this.splitReq.isBalTran = true;
        this.splitReq.currBal = this.splitPayForm.controls['txtavailAmount'].value;
        this.splitReq.tranAmount = this.splitPayForm.controls['txtamountTransfering'].value;
        this.splitReq.payingAmount = this.splitPayForm.controls['txtpayAmount'].value;
        if (this.isTotPayByTran) {
          this.MakePayment(this.splitReq);
        }
      }
      else {
        this.splitReq.payingAmount = this.splitReq.totAmount;
      }
      if (this.payMethod.toUpperCase() == "CREDITCARD") {
        this.makePaymentForm = this.makePaymentComp.creditCardComponent.createForm;
        creditCardNum = this.makePaymentForm.get("CCNumbers.CCNumber1").value + "" + this.makePaymentForm.get("CCNumbers.CCNumber2").value + "" + this.makePaymentForm.get("CCNumbers.CCNumber3").value + "" + this.makePaymentForm.get("CCNumbers.CCNumber4").value;

        this.splitReq.Payment.CreditCardPayment = <ICreditcardpaymentrequest>{};
        this.splitReq.Payment.PaymentMode = PaymentMode.CreditCard;
        this.splitReq.Payment.CreditCardPayment.NameOnCard = this.makePaymentForm.controls['Name'].value;
        this.splitReq.Payment.CreditCardPayment.CreditCardType = this.makePaymentForm.controls['CardType'].value;
        this.splitReq.Payment.CreditCardPayment.ExpiryDate = (Number(this.makePaymentForm.controls['Year'].value * 100) + Number(this.makePaymentForm.controls['Month'].value)).toString();
        this.splitReq.Payment.CreditCardPayment.ExpiryMonth = this.makePaymentForm.controls['Month'].value;
        this.splitReq.Payment.CreditCardPayment.ExpiryYear = this.makePaymentForm.controls['Year'].value;
        this.splitReq.Payment.CreditCardPayment.CreditCardNumber = creditCardNum;
        this.splitReq.Payment.CreditCardPayment.CVV = "";
        this.splitReq.Payment.CreditCardPayment.CCSuffix4 = this.splitReq.Payment.CreditCardPayment.CreditCardNumber.toString().substring(12);
        this.splitReq.Payment.PaymentMode = PaymentMode.CreditCard;
        this.splitReq.Payment.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();

        this.splitReq.Payment.CreditCardServiceTax = this.checkServiceTax == true ? (this.splitReq.Payment.TxnAmount * Number(this.ccServiceTax)) / 100 : 0;

        this.splitReq.Payment.CreditCardPayment.Line1 = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
        this.splitReq.Payment.CreditCardPayment.Line2 = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
        this.splitReq.Payment.CreditCardPayment.Line3 = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressLine3"].value;

        this.splitReq.Payment.CreditCardPayment.City = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressCity"].value;
        this.splitReq.Payment.CreditCardPayment.State = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
        this.splitReq.Payment.CreditCardPayment.Country = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
        this.splitReq.Payment.CreditCardPayment.Zip1 = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
        this.splitReq.Payment.CreditCardPayment.Zip2 = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
        this.splitReq.Payment.IsAddNewCardDetails = this.makePaymentForm.controls['SaveCreditCard'].value;
        this.splitReq.Payment.IsNewAddress = this.makePaymentComp.creditCardComponent.isAddressEnable;
        ///TO CHECK credit card in block list
        if (this.makePaymentComp.creditCardComponent.checkCreditCard(creditCardNum, this.splitReq.Payment.CreditCardPayment.CreditCardType)) {
          if (this.makePaymentComp.creditCardComponent.CheckExpairyDate(this.makePaymentForm.controls['Month'].value, this.makePaymentForm.controls['Year'].value)) {
            if (this.isCheckBloackList) {
              this.objBlockList.CCAccountId = this.splitReq.Payment.CustomerId;
              this.objBlockList.CCNumber = creditCardNum;
              this.objBlockList.Line1 = this.splitReq.Payment.CreditCardPayment.Line1;
              this.objBlockList.Line2 = this.splitReq.Payment.CreditCardPayment.Line2
              this.objBlockList.Line3 = this.splitReq.Payment.CreditCardPayment.Line3;
              this.objBlockList.City = this.splitReq.Payment.CreditCardPayment.City;
              this.objBlockList.State = this.splitReq.Payment.CreditCardPayment.State;
              this.objBlockList.Country = this.splitReq.Payment.CreditCardPayment.Country;
              this.objBlockList.Zip1 = this.splitReq.Payment.CreditCardPayment.Zip1;
              this.objBlockList.Zip2 = this.splitReq.Payment.CreditCardPayment.Zip2;
              this.objBlockList.CCExpiryMonth = this.makePaymentForm.controls['Month'].value;
              this.paymentService.IsExistsinBlockList(this.objBlockList).subscribe(res => {
                if (res) {
                  // this.objBlockListRes = res;
                  // $('#blocklist-dialog').modal('show');
                  this.MakePayment(this.splitReq);
                }
                else {
                  this.MakePayment(this.splitReq);
                }

              });
            }
            else {
              this.MakePayment(this.splitReq);
            }
          }
          else {
            this.msgFlag = true;
            this.msgType = 'alert';
            this.msgDesc = "Invalid Expiration Date";
            this.msgTitle = '';
          }
        }
        else {
          this.msgFlag = true;
          this.msgType = 'alert';
          this.msgDesc = "Enter valid Credit Card #";
          this.msgTitle = '';
        }
      }
      else if (this.payMethod.toUpperCase() == "ACH") {
        this.splitReq.Payment.PaymentMode = PaymentMode.Bank;
        this.splitReq.Payment.PaymentProcess = PaymentMode[PaymentMode.Bank].toString();
        this.makePaymentForm = this.makePaymentComp.bankCardComponent.createForm;
        this.splitReq.Payment.AccoutName = this.makePaymentForm.controls['accountHolderName'].value;
        this.splitReq.Payment.AccountNumber = this.makePaymentForm.controls['accountNo'].value;;
        this.splitReq.Payment.BankRoutingNumber = this.makePaymentForm.controls['routingValue'].value;
        this.splitReq.Payment.BankName = this.makePaymentForm.controls['bankName'].value;
        this.splitReq.Payment.IsAddNewBankDetails = this.makePaymentForm.controls["SaveBank"].value;
        this.MakePayment(this.splitReq);
      }
      else if (this.payMethod.toUpperCase() == "CHEQUE") {
        this.splitReq.Payment.PaymentMode = PaymentMode.Cheque;
        this.splitReq.Payment.PaymentProcess = PaymentMode[PaymentMode.Cheque].toString();
        this.makePaymentForm = this.makePaymentComp.chequeCardComponent.createForm;
        this.splitReq.Payment.ChequeNumber = this.makePaymentForm.controls['checkNumber'].value;
        this.splitReq.Payment.CheckRoutingNumber = this.makePaymentForm.controls['checkRouting'].value;;
        this.splitReq.Payment.ChequeDate = this.makePaymentForm.controls['checkDate'].value;

        this.MakePayment(this.splitReq);
      }
      else if (this.payMethod.toUpperCase() == "MO") {
        this.splitReq.Payment.PaymentMode = PaymentMode.MoneyOrder;
        this.splitReq.Payment.PaymentProcess = PaymentMode[PaymentMode.MoneyOrder].toString();
        this.makePaymentForm = this.makePaymentComp.moComponent.createForm;
        this.splitReq.Payment.MONumber = this.makePaymentForm.controls['moneyOrderNumber'].value;
        this.splitReq.Payment.MODate = this.makePaymentForm.controls['moneyOrderDate'].value;;

        this.MakePayment(this.splitReq);
      }
      else if (this.payMethod.toUpperCase() == "CASH") {
        this.splitReq.Payment.PaymentMode = PaymentMode.Cash;
        this.splitReq.Payment.PaymentProcess = PaymentMode[PaymentMode.Cash].toString();
        this.MakePayment(this.splitReq);
      }
    }//
    else {
      this.validateFormFields();
    }
  }
  checkBlockList() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(
      res => {
        this.isCheckBloackList = res
        console.log(this.isCheckBloackList);
      }
    );
  }
  validateFormFields(): void {
    if (this.payMethod == "CreditCard") {
      this.makePaymentComp.validateAllFormFields(this.makePaymentComp.creditCardComponent.createForm);
      this.makePaymentComp.validateAllFormFields(this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm);
    }
    else if (this.payMethod == "ACH") {
      this.makePaymentComp.validateAllFormFields(this.makePaymentComp.bankCardComponent.createForm);
    }
    if (this.payMethod == "MO") {
      this.makePaymentComp.validateAllFormFields(this.makePaymentComp.moComponent.createForm);
    }
    if (this.payMethod.toUpperCase() == "CHEQUE") {
      this.makePaymentComp.validateAllFormFields(this.makePaymentComp.chequeCardComponent.createForm);
    }
  }

  cancel(): void {
    let link = ['/csc/customeraccounts/split-account/'];
    this.router.navigate(link);
  }
  gBackToVehicles(): void {
    let link = ['/csc/customeraccounts/split-vehicles/'];
    this.router.navigate(link);
  }
  cancelCC() {
    this.isCreditCardAdd = false;
  }
  saveCC() {
    let creditCardNum: string;
    this.createForm = this.creditCardComponent.createForm;
    creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
    this.splitReq.AddCreditcardInfo = <ICreditcardpaymentrequest>{};
    this.splitReq.AddCreditcardInfo.NameOnCard = this.createForm.controls['Name'].value.toUpperCase();
    this.splitReq.AddCreditcardInfo.CreditCardType = this.createForm.controls['CardType'].value;
    this.splitReq.AddCreditcardInfo.ExpiryDate = (Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value)).toString();
    this.splitReq.AddCreditcardInfo.ExpiryMonth = this.createForm.controls['Month'].value;
    this.splitReq.AddCreditcardInfo.ExpiryYear = this.createForm.controls['Year'].value;
    this.splitReq.AddCreditcardInfo.CreditCardNumber = creditCardNum;
    this.splitReq.AddCreditcardInfo.CVV = "";
    this.splitReq.AddCreditcardInfo.CCSuffix4 = this.splitReq.AddCreditcardInfo.CreditCardNumber.toString().substring(12);
    this.splitReq.AddCreditcardInfo.Line1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
    this.splitReq.AddCreditcardInfo.Line2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
    this.splitReq.AddCreditcardInfo.Line3 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine3"].value;
    this.splitReq.AddCreditcardInfo.City = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCity"].value;
    this.splitReq.AddCreditcardInfo.State = this.creditCardComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
    this.splitReq.AddCreditcardInfo.Country = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
    this.splitReq.AddCreditcardInfo.Zip1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
    this.splitReq.AddCreditcardInfo.Zip2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip2"].value;

    ///TO CHECK credit card in block list
    if (this.creditCardComponent.checkCreditCard(creditCardNum, this.splitReq.AddCreditcardInfo.CreditCardType)) {
      if (this.creditCardComponent.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {
        if (this.isCheckBloackList) {
          this.objBlockList.CCNumber = creditCardNum;
          this.objBlockList.Line1 = this.splitReq.AddCreditcardInfo.Line1;
          this.objBlockList.Line2 = this.splitReq.AddCreditcardInfo.Line2;
          this.objBlockList.Line3 = this.splitReq.AddCreditcardInfo.Line3;
          this.objBlockList.City = this.splitReq.AddCreditcardInfo.City;
          this.objBlockList.State = this.splitReq.AddCreditcardInfo.State;
          this.objBlockList.Country = this.splitReq.AddCreditcardInfo.Country;
          this.objBlockList.Zip1 = this.splitReq.AddCreditcardInfo.Zip1;
          this.objBlockList.Zip2 = this.splitReq.AddCreditcardInfo.Zip2;
          this.objBlockList.CCExpiryMonth = this.createForm.controls['Month'].value;
          this.paymentService.IsExistsinBlockList(this.objBlockList).subscribe(res => {
            if (res) {
              // this.isCreditCardAdd = true;
              // this.splitReq.IsAddCreditCard = false;
              // this.splitReq.IsAddNewBankDetails = false;              
              // this.objBlockListRes = res;              
              // $('#blocklist-dialog').modal('show');
              this.isCreditCardAdd = false;
              this.splitReq.IsAddCreditCard = true;
              this.splitReq.IsAddNewBankDetails = false;
              this.msgFlag = true;
              this.msgType = 'success';
              this.msgTitle = '';
              this.msgDesc = "Credit Card has been added successfully";
              if (this.checkFormValid())
                this.MakePayment(this.splitReq);
              else
                this.validateFormFields();
            }
            else {
              this.msgFlag = true;
              this.msgType = 'success';
              this.msgTitle = '';
              this.msgDesc = "Credit Card has been added successfully";
              this.isCreditCardAdd = false;
              this.splitReq.IsAddCreditCard = true;
              this.splitReq.IsAddNewBankDetails = false;
              let isFormValid: boolean;
              this.payMethod = this.makePaymentComp.payMethod;
              if (this.checkFormValid())
                this.MakePayment(this.splitReq);
              else
                this.validateFormFields();
            }
          });
        }
        else {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgTitle = '';
          this.msgDesc = "Credit Card has been added successfully";
          this.isCreditCardAdd = false;
          this.splitReq.IsAddCreditCard = true;
          this.splitReq.IsAddNewBankDetails = false;
          if (this.checkFormValid())
            this.MakePayment(this.splitReq);
          else
            this.validateFormFields();
        }
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "Invalid Expiration Date";
        this.msgTitle = '';
        this.splitReq.IsAddCreditCard = false;
      }
    }
    else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Enter valid Credit Card #";
      this.msgTitle = '';
      this.splitReq.IsAddCreditCard = false;
    }

  }
  cancelACH() {
    this.isACHAdd = false;
  }
  saveACH() {
    this.isACHAdd = false;
    this.createForm = this.bankCardComponent.createForm;
    this.splitReq.AccoutName = this.createForm.controls['accountHolderName'].value.toUpperCase();
    this.splitReq.AccountNumber = this.createForm.controls['accountNo'].value;;
    this.splitReq.BankRoutingNumber = this.createForm.controls['routingValue'].value;
    this.splitReq.BankName = this.createForm.controls['bankName'].value.toUpperCase();
    this.splitReq.IsAddNewBankDetails = true;
    this.splitReq.IsAddCreditCard = false;
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = "ACH account has been added successfully";
    this.msgTitle = '';
  }
  allowMakePayment() {
    this.isCreditCardAdd = false;
    this.splitReq.IsAddCreditCard = true;
    this.splitReq.IsAddNewBankDetails = false;
    this.goToVerifyPayment();
  }

  checkFormValid(): boolean {
    let isFormValid: boolean;
    this.payMethod = this.makePaymentComp.payMethod;
    if (this.payMethod.toUpperCase() == "CREDITCARD") {
      isFormValid = this.makePaymentComp.creditCardComponent.createForm.valid;
      if (isFormValid)
        isFormValid = this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.valid || (this.makePaymentComp.creditCardComponent.addressComponent.addAddressForm.status == 'DISABLED');
    }
    else if (this.payMethod == "ACH") {
      isFormValid = this.makePaymentComp.bankCardComponent.createForm.valid;
    }
    else if (this.payMethod.toUpperCase() == "CHEQUE") {
      isFormValid = this.makePaymentComp.chequeCardComponent.createForm.valid;
    }
    else if (this.payMethod == "MO") {
      isFormValid = this.makePaymentComp.moComponent.createForm.valid;
    }
    else if (this.payMethod.toUpperCase() == "CASH") {
      isFormValid = true;
    }
    return isFormValid;
  }

  MakePayment(makepaymentrequest: ISplitRequest) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.SPLITCUSTOMER];
    userEvents.SubFeatureName = SubFeatures[SubFeatures.PAYMENT];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;
    console.log(this.splitReq);
    this.splitReq.payMethod = this.payMethod;
    if (this.isTotPayByTran) {
      $('#pageloader').modal('show');
      this.splitService.createXML(this.splitReq).subscribe(ress => {
        if (ress) {
          $('#pageloader').modal('hide');
          this.splitReq.ReferenceNo = ress.VoucherNo;
          this.splitReq.TxnDateTime = ress.TransactionDate;
          this.splitReq.NewAccountId = ress.CustomerId;
          this.splitReq.isTotalBalanceTransfer = true;
          this.splitReq.Payment.PaymentMode = null;
          this.splitReq.payingAmount = 0;
          this.splitService.changeResponse(this.splitReq);
          this.splitService.changeSplitResponse(ress);
          this.router.navigate(['/csc/customeraccounts/split-thank-you/']);
        }
      }, err => {
        console.log(err);
        this.failureMessage = err.statusText;
        console.log(this.failureMessage);
      });
      $('#pageloader').modal('hide');
    }
    else {
      this.splitReq.isTotalBalanceTransfer = false;
      this.splitService.changeResponse(makepaymentrequest);
      this.router.navigate(['/csc/customeraccounts/split-verify-payment/']);
    }
  }

  onValidationChanged(val: any): void {
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }
  userAction(event) {
    if (event) {

    }
  }

  chkBalanceTrasferClick(chkBalTran) {
    let rootSele = this;
      setTimeout(function () {
        rootSele.materialscriptService.material();
      }, 0)
    if (chkBalTran.target.checked) {
      this.materialscriptService.material();
      this.chkBalanceTran = true;
      this.enableBalTranGrid = true;
      if (this.payAmount == undefined || this.payAmount == null)
        this.payAmount = this.splitReq.totAmount;
      if (this.splitReq.CustAttrib.IsPostPaidCustomer)
        this.planName = "PostPaid";
      else
        this.planName = "Prepaid";
      this.customerId = this.splitReq.CustInfo.AccountId;
      this.custDetails = this.customerId.toString() + "," + this.planName;
      this.splitService.getBalanaceTransferDetails(this.custDetails)
        .subscribe(
        res => {
          this.balTran = res;
          if (this.balTran.ErrorMsg != null) {
            this.failureMessage = this.balTran.ErrorMsg;
            this.enableBalTranGrid = false;
            chkBalTran.target.checked = false;
            this.chkBalanceTran = false;
            return;
          }
          this.availAmount = parseFloat(this.balTran.CurrentBal).toFixed(2);
          let a = parseFloat(this.balTran.AvailableBal.toString()).toFixed(2);
          this.maxtransfAmount = parseFloat(a);
        }
        );
    }
    else {
      this.chkBalanceTran = false;
      this.enableBalTranGrid = false;
      this.amountTransfering = 0;
      this.splitReq.tranAmount = 0;
      this.splitReq.currBal = 0;
      this.splitReq.isBalTran = false;
      this.payAmount = this.splitReq.totAmount;
      this.renderer.setElementStyle(this.Payment.nativeElement, 'display', 'block');
      this.balTran = <BalanceTransfer>{};
    }
  }
}

export interface BalanceTransfer {
  CurrentBal: string;
  AvailableBal: number;
  ErrorMsg: string
  hdnBal: string;
  hdnCurrentBal: string
  hdnMinimumAmount: string;
}