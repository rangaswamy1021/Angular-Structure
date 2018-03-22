import { Component, OnInit, ViewChild } from '@angular/core';
import { IPaymentResponse } from "./models/paymentresponse";
import { PaymentService } from "./services/payment.service";
import { PaymentMode, CreditCardType } from "./constants";
import { IEmailRequest } from "./models/emailrequest";
import { Router } from '@angular/router';
import { CreateAccountService } from "../shared/services/createaccount.service";
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { PaymentResponseService } from "../shared/services/payment.response.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { CustomerSearchService } from "../csc/search/services/customer.search";
import { LoginService } from "../login/services/login.service";
import { IUserEvents } from "../shared/models/userevents";
import { Features, Actions } from "../shared/constants";
import { CommonService } from "../shared/services/common.service";
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-payment-confirmation',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.scss']
})
export class PaymentConfirmationComponent implements OnInit {
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  paymentResponse: IPaymentResponse;
  lstPaymentResponse: IPaymentResponse[];
  emailRequest: IEmailRequest = <IEmailRequest>{};
  message: string;
  ccMode: string;
  userId: number;
  customerId: number;
  sessionContextResponse: IUserresponse;
  viewPath: string = "";
  filePath: string = "";
  isZeroAmountCustomer: boolean = false;
  paymentMode: string;
  disableReceipt: boolean = true;
  customerContextResponse: ICustomerContextResponse;
  // apiUrl = 'http://localhost:49563/'; // Need to move to Config
  // downloadPath = 'pdf/'; // Need to move to Config and Need to populate from virtual Path

  constructor(private commonService: CommonService, private materialscriptService: MaterialscriptService, private loginService: LoginService, private customerSearchService: CustomerSearchService, private customerContext: CustomerContextService, private paymentResponseService: PaymentResponseService, private paymentService: PaymentService, private router: Router, private createAccountService: CreateAccountService, private sessionService: SessionService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.userId = this.sessionContextResponse.userId;
    let items = [];
    this.paymentResponseService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.CustomerId == 0) {
          //let link = ['/csc/customerAccounts/create-account/'];
          //this.router.navigate(link);
        }
        else {
          this.paymentResponse = customerContext;
          this.paymentResponse.UpdatedUser = this.sessionContextResponse.userName;
          this.customerId = this.paymentResponse.CustomerId;
          if (this.paymentResponse.VoucherNo != "") {
            if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.Cheque]) {
              this.paymentMode = "Check";
            }
            else if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.MoneyOrder]) {
              this.paymentMode = "Money Order";
            }
            else if (this.paymentResponse.PaymentMode.toString() == PaymentMode[PaymentMode.CreditCard]) {
              this.paymentMode = "Credit Card";
            }
            else {
              this.paymentMode = this.paymentResponse.PaymentMode.toString();
            }
          }
        }
      }
      );

    items.push(this.paymentResponse);
    if (this.paymentResponse.VoucherNo != "") {
      this.lstPaymentResponse = items.map(x => Object.assign({}, x));;
      var strViewPath: string;
      this.ccMode = CreditCardType[this.paymentResponse.CardType];

      this.GeneratePaymentReciept();
    }
    else {
      this.isZeroAmountCustomer = true;
      let userEvents = <IUserEvents>{};
      this.lstPaymentResponse = items.map(x => Object.assign({}, x));;
      userEvents.FeatureName = this.lstPaymentResponse[0].FeatureName;
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.lstPaymentResponse[0].CustomerId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
    }
    this.showMsg("success", "Thank you for registering with us!");
  }

  GeneratePaymentReciept() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.lstPaymentResponse[0].FeatureName;
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.lstPaymentResponse[0].CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.paymentService.GeneratePaymentReciept(this.lstPaymentResponse, this.userId, this.sessionContextResponse.loginId, 'CreateAccount', userEvents).subscribe(res => {
      if (res) {
        this.disableReceipt = false;
        this.viewPath = res[0];
        this.filePath = res[1];
        this.paymentEmail(0);
        this.paymentResponseService.changeResponse(null);
      }
    });

  }

  printReceipt() {
    window.open(this.viewPath + this.filePath);
  }

  goAccountSummary(): void {
    this.customerSearchService.bindCustomerInfoBlock(this.paymentResponse.CustomerId).subscribe(respose => {
      let customerData: any;
      if (respose)
        customerData = respose;

      this.customerContextResponse = <ICustomerContextResponse>{};
      this.customerContextResponse.AccountId = this.paymentResponse.CustomerId;
      this.customerContextResponse.UserName = this.sessionContextResponse.userName;
      this.customerContextResponse.AccountStatus = "AC";
      this.customerContextResponse.AccountSummaryUserActivity = true;
      this.customerContextResponse.AccountType = customerData.ParentPlanName;
      this.customerContextResponse.AdditionalContactUserId = this.paymentResponse.CustomerId;
      this.customerContextResponse.boolIsTagRequired = customerData.IsTagRequired
      this.customerContextResponse.CustomerParentPlan = customerData.ParentPlanName;
      this.customerContextResponse.CustomerPlan = customerData.PlanName;
      this.customerContextResponse.IsSearched = true;
      this.customerContextResponse.IsSplitCustomer = false;
      this.customerContextResponse.RevenueCategory = customerData.RevenueCategory;
      this.customerContext.changeResponse(this.customerContextResponse);
      this.loginService.setCustomerContext(this.customerContextResponse);
      this.loginService.setViolatorContext(null);
      let link = ['/csc/customerdetails/account-summary'];
      this.router.navigate(link);
    });
  }

  paymentEmail(status) {

    this.emailRequest.CustomerId = this.customerId;
    this.emailRequest.EmailSubject = "Payment Receipt";
    this.emailRequest.CreatedUser = this.sessionContextResponse.userName;
    this.emailRequest.CreatedDate = new Date();
    this.emailRequest.EmailInterface = "PAYMENTRECEIPT";
    this.emailRequest.Attachement = this.filePath;

    this.paymentService.InsertPaymentReciptEmail(this.emailRequest).subscribe(res => {
      if (res) {
        if (status == 1)
          this.showMsg("success", "Successfully Payment receipt Send to Customer Email Address");
      }
      else {
        this.showMsg("error", "Error while sending email");
      }
    }, (err) => {
      this.showMsg("error", err.statusText);
    });

  }

  onCancel() {
    let link = ['/csc/customeraccounts/create-account-personal-information'];
    this.router.navigate(link);
    this.createAccountService.changeResponse(null);
  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }

}
