import { IUserresponse } from './../../shared/models/userresponse';
import { IUserEvents } from './../../shared/models/userevents';
import { PaymentService } from '../../payment/services/payment.service';

import { CommonService } from './../../shared/services/common.service';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { SessionService } from './../../shared/services/session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AddAddressComponent } from './../../shared/address/add-address.component';
import { PaymentMode } from './../../payment/constants';
import { CreditCardInformationComponent } from './../../payment/credit-card-information.component';
import { IPayAdvanceTollResponse } from './../search/models/payadvancetollsresponse';
import { CustomerSearchService } from './../search/services/customer.search';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IPaymentResponse } from "../../payment/models/paymentresponse";
import { Features, Actions } from "../../shared/constants";
declare var $: any;
@Component({
  selector: 'app-pay-a-advance-tolls-to-customer',
  templateUrl: './pay-a-advance-tolls-to-customer.component.html',
  styleUrls: ['./pay-a-advance-tolls-to-customer.component.scss']
})
export class PayAAdvanceTollsToCustomerComponent implements OnInit {

  statusMessage: string;
  emailRequest: any = {};
  creditCardArray: any = [];
  ccServiceTax: number;
  ccardNum: any;
  ccardType: any;
  type: string;
  ccname: any;
  showPayment: boolean;
  accountId: any;
  paymentSuccess: boolean = false;
  convertButtonText: string;
  currentAmount: number = 0.0;
  tollAmount: number = 0.0;
  paidAmount: number = 0.0;
  createForm: any;
  creditCard;
  paymentReq: any;
  paymentButtonStatus: boolean = false;
  paymentType = 'Credit Card';
  userResponse:IUserresponse;
  convertButtonStatus: boolean = true;
  customerId;
  checkServiceTax: boolean;
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  lstPaymentResponse: IPaymentResponse[];
  viewPath: string = "";
  filePath: string = "";

  userEvents = <IUserEvents>{};
  @ViewChild(CreditCardInformationComponent) creditCardComponent;
  @ViewChild(AddAddressComponent) addressComponent;
  constructor(private customerSearchService: CustomerSearchService, private route: ActivatedRoute, private router: Router, private sessionData: SessionService, private commonService: CommonService, private paymentService: PaymentService) { }


  ngOnInit() {
    this.convertButtonText = 'Convert to Customer';

    this.userResponse = this.sessionData.customerContext;
    this.route.params.subscribe(params => {
      this.customerId = +params['id'];
      this.getCovertOTTCustomers(this.customerId);
    });
  }

  getCovertOTTCustomers(custId) {

    this.userEvents.FeatureName = Features[Features.PAYADVANCETOLLS];
    this.userEvents.SubFeatureName = "";
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.userResponse.roleID);
    this.userEvents.UserName = this.userResponse.userName;
    this.userEvents.LoginId = this.userResponse.loginId;
    this.customerSearchService.getCovertOTTCustomers(custId,this.userEvents).subscribe(res => {
      console.log(res);
      if (res) {
        this.currentAmount = res.CurrentBalance
        this.tollAmount = res.TollAmount
        this.paidAmount = res.PaidAmount
        if (this.paidAmount <= 0) {
          this.paymentButtonStatus = true;
        }
        this.getCustomerBalancesbyAccountId(custId);
      }
    })
  }

  getCustomerBalancesbyAccountId(custId) {
    this.customerSearchService.getCustomerBalancesbyAccountId(custId).subscribe(res => {
      if (res == true) {
        this.convertButtonStatus = true;
        this.convertButtonText = "Converted";
      }
      else {
        if (this.paidAmount > 0) {
          this.convertButtonStatus = true;
        }
        else {
          this.convertButtonStatus = false;
        }
      }
    })
  }

  confirmPayment() {

    $('#verifyPayment').modal('show');
    this.checkApplicationParameterStatus();

    this.type = this.paymentType;
    this.ccname = this.creditCardComponent.createForm.controls['Name'].value;
    this.ccardType = this.creditCardComponent.createForm.controls['CardType'].value;
    this.ccardNum = this.creditCardComponent.createForm.get("CCNumbers.CCNumber4").value;
    this.ccServiceTax = this.checkServiceTax == true ? Math.round(this.paymentReq.TxnAmount * Number(this.ccServiceTax)) / 100 : 0;
    //this.ccServiceTax = 2.05;
    this.accountId = this.customerId;
    console.log(this.accountId);
  }

  checkApplicationParameterStatus() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTax).subscribe(
      res => {
        this.checkServiceTax = (res = "1" ? true : false)
        this.getApplicationParameterValue();
      }
    );
  }

  getApplicationParameterValue() {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTaxInd).subscribe(
      res => this.ccServiceTax = res
    );
  }

  makePayment() {
this.userEvents.ActionName = Actions[Actions.PAYMENT];
    if (this.paymentType == 'Cash') {
      this.paymentReq = {};
      this.paymentReq.PaymentMode = PaymentMode[PaymentMode.Cash];
      this.paymentReq.TxnAmount = this.paidAmount;//26.00;
      this.paymentReq.IntiatedBy = "tpsuperuser";
      this.paymentReq.UserName = "tpsuperuser";
      this.paymentReq.CustomerBalance = this.currentAmount;
      this.paymentReq.LoginId = this.userResponse.loginId;
      this.paymentReq.ICNId = this.userResponse.icnId;
      this.paymentReq.CustomerId = this.customerId;
      this.paymentReq.AccountIntegration = "MakePayment";
    }
    else {
      let creditCardNum;
      this.creditCard = {};
      this.paymentReq = {};
      this.createForm = this.creditCardComponent.createForm;
      this.paymentReq.TxnAmount = this.paidAmount;//26.00;    
      this.paymentReq.IntiatedBy = "tpsuperuser";
      this.paymentReq.UserName = "tpsuperuser";
      this.paymentReq.CustomerBalance = this.currentAmount;
      this.paymentReq.LoginId = this.userResponse.loginId;
      this.paymentReq.ICNId = this.userResponse.icnId;
      this.paymentReq.CustomerId = this.customerId;
      this.paymentReq.AccountIntegration = "MakePayment";
      this.paymentReq.PaymentMode = PaymentMode[PaymentMode.CreditCard];
      this.paymentReq.CreditCardServiceTax = this.checkServiceTax == true ? Math.round(this.paymentReq.TxnAmount * Number(this.ccServiceTax)) / 100 : 0;
      creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
      //  this.payment.creditCard.CreditCardPayment = <ICreditcardpaymentrequest>{};
      this.creditCard.NameOnCard = this.createForm.controls['Name'].value;
      this.creditCard.CreditCardType = this.createForm.controls['CardType'].value;
      this.creditCard.ExpiryDate = (Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value)).toString();
      this.creditCard.ExpiryMonth = this.createForm.controls['Month'].value;
      this.creditCard.ExpiryYear = this.createForm.controls['Year'].value;
      this.creditCard.CreditCardNumber = creditCardNum;
      this.creditCard.CVV = "";
      this.creditCard.PaymentMode = PaymentMode[PaymentMode.CreditCard];
      this.creditCard.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();
      this.creditCard.Line1 = this.addressComponent.addAddressForm.controls["addressLine1"].value;
      this.creditCard.Line2 = this.addressComponent.addAddressForm.controls["addressLine2"].value;
      this.creditCard.Line3 = this.addressComponent.addAddressForm.controls["addressLine3"].value;

      this.creditCard.City = this.addressComponent.addAddressForm.controls["addressCity"].value;
      this.creditCard.State = this.addressComponent.addAddressForm.controls["addressStateSelected"].value;
      this.creditCard.Country = this.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
      this.creditCard.Zip1 = this.addressComponent.addAddressForm.controls["addressZip1"].value;
      this.creditCard.Zip2 = this.addressComponent.addAddressForm.controls["addressZip2"].value;
      //this.creditCardArray.push(this.creditCard);
      this.paymentReq.CreditCardPayments = this.creditCard;
    }
    // this.creditCard.IsAddNewCardDetails = this.createForm.controls['SaveCreditCard'].value;
    // this.creditCard.IsNewAddress = this.creditCardComponent.isAddressEnable;
    this.customerSearchService.convertOTTMakePayment(this.paymentReq,this.userEvents).subscribe(res => {
      if (res) {
        $('#verifyPayment').modal('hide')
        $('#thankYou').modal('show')

        this.paymentResponse = res;
        this.getCovertOTTCustomers(this.customerId);
        console.log(res);
        let items = [];
        items.push(this.paymentResponse);
        if (this.paymentResponse.VoucherNo != "") {

          this.lstPaymentResponse = items.map(x => Object.assign({}, x));;
          var strViewPath: string;

          this.GeneratePaymentReciept();
        }
      }
    })



  }
  convertToCust() {
     this.userEvents.ActionName = Actions[Actions.CONVERT];
     debugger;
    this.commonService.checkPrivilegeswithAuditLog(this.userEvents).subscribe(res =>{
      console.log(res);
      this.router.navigate(['csc/customeraccounts/create-account-personal-information'],
      {
        queryParams: {
          customerId: this.customerId
        }
      });
    });
    
  }
  GeneratePaymentReciept() {
    this.paymentService.GeneratePaymentReciept(this.lstPaymentResponse, this.userResponse.userId, this.userResponse.loginId,'Payment').subscribe(res => {
      if (res) {
        this.viewPath = res[0];
        this.filePath = res[1];
        this.paymentSuccess = true;
        this.statusMessage = "Payment has been done successfully";
      }
    });

  }
  printReciept() {
    window.open(this.viewPath + this.filePath);
  }

  displayMessage(flag, text) {

  }

  paymentEmail() {

    this.emailRequest.CustomerId = this.customerId;
    this.emailRequest.EmailSubject = "Payment Receipt";
    this.emailRequest.CreatedUser = this.userResponse.userName;
    this.emailRequest.CreatedDate = new Date();
    this.emailRequest.EmailInterface = "PAYMENTRECEIPT";
    this.emailRequest.Attachement = this.filePath;

    this.paymentService.InsertPaymentReciptEmail(this.emailRequest).subscribe(res => {
      if (res) {

        this.statusMessage = "Successfully Payment receipt Send to Customer Email Address";
        this.paymentSuccess = true;
      }
      else {
        this.paymentSuccess = false;
        this.statusMessage = "Error while sending email";
      }
    }, (err) => {
      this.displayMessage(true, err.statusText);
    });

  }


}
