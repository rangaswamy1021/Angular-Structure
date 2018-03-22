import { ITagsAmountrequest } from './../csc/customeraccounts/models/tagsamountrequest';
import { ApplicationParameterkey } from './../shared/applicationparameter';
import { CreateAccountService } from './../shared/services/createaccount.service';
import { ActivatedRoute } from '@angular/router';
import { IinvoiceResponse } from './../sac/plans/models/invoicecycleresponse';

import { ICustomerResponse } from './../shared/models/customerresponse';
import { ICustomerSecurityResponse } from './../shared/models/customersecurityresponse';
import { ICustomerProfileResponse } from './../shared/models/customerprofileresponse';
import { IPlanResponse } from './../sac/plans/models/plansresponse';
import { IEmailResponse } from './../shared/models/emailresponse';
import { IPhoneResponse } from './../shared/models/phoneresponse';
import { IAddressResponse } from './../shared/models/addressresponse';
import { ITagResponse } from './../shared/models/tagresponse';
import { IVehicleResponse } from './../shared/models/vehicleresponse';
import { ICustomerAttributeResponse } from './../shared/models/customerattributeresponse';
import { CommonService } from './../shared/services/common.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PaymentService } from "./services/payment.service";
import { Router } from '@angular/router';
import { IMakePaymentrequest } from "./models/makepaymentrequest";
import { IPaymentResponse } from "./models/paymentresponse";
import { PaymentMode, CreditCardType } from "./constants";
import { ITagrequests } from "./models/tagrequests";
import { List } from 'linqts';
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { PaymentResponseService } from "../shared/services/payment.response.service";
import { CustomerAccountsService } from "../csc/customeraccounts/services/customeraccounts.service";
import { IUserEvents } from "../shared/models/userevents";
import { Features, SubFeatures, Actions } from "../shared/constants";
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-verify-makepayment',
  templateUrl: './verify-makepayment.component.html',
  styleUrls: ['./verify-makepayment.component.scss']
})
export class VerifyMakepaymentComponent implements OnInit {
  makePaymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{};
  paymentResponse: IPaymentResponse = <IPaymentResponse>{};
  paymentmode: string;
  customerAttributeResponse: ICustomerAttributeResponse = <ICustomerAttributeResponse>{};
  vehicleResponse: IVehicleResponse[];
  tagResponse: ITagResponse[];
  addressResponse: IAddressResponse;
  phoneResponse: IPhoneResponse = <IPhoneResponse>{};
  emailResponse: IEmailResponse = <IEmailResponse>{};
  customerProfileResponse: ICustomerProfileResponse[];
  customerSecurityResponse: ICustomerSecurityResponse[];
  customerResponse: ICustomerResponse;
  customerId: number;
  planId: number;
  emails: any[];
  phones: any[];
  invoiceTypes: IinvoiceResponse[];
  businessOrganization: string;
  invoiceIntervalCycle: string;
  plansResponse: IPlanResponse[];
  customerInfo: ITagsAmountrequest[];
  isServiceTax: boolean;
  serviceTax: number;
  isCCServiceTax: boolean;
  ccServiceTax: number;
  sessionContextResponse: IUserresponse;
  feesOfPlan = [];
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private customerAccountsService: CustomerAccountsService,private materialscriptService:MaterialscriptService, private paymentService: PaymentService, private router: Router,
    private commonService: CommonService, private sessionService: SessionService,
    private createAccountService: CreateAccountService, private paymentResponseService: PaymentResponseService, ) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.createAccountService.currentContext
      .subscribe(customerContext => {
        if (customerContext == null || customerContext.CustomerId == 0) {
          //let link = ['/csc/customeraccounts/create-account-personal-information'];
          //this.router.navigate(link);
        }
        else {
          this.makePaymentRequest = customerContext;
          if (this.makePaymentRequest.PaymentMode == PaymentMode.Cheque)
            this.paymentmode = "Check";
          else if (this.makePaymentRequest.PaymentMode == PaymentMode.MoneyOrder)
            this.paymentmode = "Money Order";
          else if (this.makePaymentRequest.PaymentMode == PaymentMode.CreditCard)
            this.paymentmode = "Credit Card";
          else
            this.paymentmode = PaymentMode[this.makePaymentRequest.PaymentMode];
          this.customerId = this.makePaymentRequest.CustomerId;
          this.planId = this.makePaymentRequest.PlanID;
        }
      }
      );


    this.getInvoiveCycleTypes();
    this.getProfileByCustomerId(this.customerId);
    this.getCustomerCreateAccountProcessInfo(this.customerId);
    this.getLoginDetailsByCustomerId(this.customerId);
    this.getAllEmailsByCustomerId(this.customerId);
    this.getAllPhonesByCustomerId(this.customerId);
    this.getVehicledetailsByCustomerId(this.customerId);
    this.getCustomerAttributesByCustomerId(this.customerId);
    this.getTagRequestByCustomerId(this.customerId);
    this.getDefaultAddressByCustomerID(this.customerId);
    this.getBaseDetailsByCustomerId(this.customerId);
    this.getBusinessCustomerDetails(this.customerId);
    this.bindPlansData();
    this.customerAccountsService.getFeesbasedonPlanId(this.planId).subscribe(res => this.feesOfPlan = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsServiceTax).subscribe(res => this.isServiceTax = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ServiceTax).subscribe(res => this.serviceTax = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTaxInd).subscribe(res => this.isCCServiceTax = res);
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTax).subscribe(res => this.ccServiceTax = res);
  }

  MakePayment() {
    let responsevalue: boolean;
    $('#pageloader').modal('show');
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.makePaymentRequest.FeatureName;
    userEvents.SubFeatureName = SubFeatures[SubFeatures.VERIFYPAYMENT];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.makePaymentRequest.CustomerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.paymentService.MakePayment(this.makePaymentRequest, userEvents).subscribe(res => {
      if (res) {
        $('#pageloader').modal('hide');
        this.paymentResponse = res;
        responsevalue = true;
        if (responsevalue) {
          this.msgFlag = false;
          this.paymentService.InsertWelcomeEmail(this.makePaymentRequest.CustomerId, this.sessionContextResponse.userName).subscribe(
            res => {
              if (this.paymentResponse && (this.paymentResponse.CustomerId == undefined || this.paymentResponse.CustomerId == null)) {
                let paymentResponse = <IPaymentResponse>{};
                paymentResponse.CustomerId = this.makePaymentRequest.CustomerId;
                paymentResponse.VoucherNo = "";
                paymentResponse.EmailAddress = res;
                paymentResponse.FeatureName = this.makePaymentRequest.FeatureName;
                this.paymentResponseService.changeResponse(paymentResponse);
              }
              else {
                this.paymentResponse.EmailAddress = res;
                this.paymentResponse.FeatureName = this.makePaymentRequest.FeatureName;
                this.paymentResponseService.changeResponse(this.paymentResponse);
              }
              this.createAccountService.changeResponse(null);
              this.router.navigate(['csc/payment/payment-confirmation']);
            }
          );
        }
      }
      else
        responsevalue = false;
    },
      err => {
        $('#pageloader').modal('hide');
        this.showMsg("error", err.statusText);
        return;
      });

  }

  getProfileByCustomerId(customerId: number) {
    this.commonService.getProfileByCustomerId(customerId).subscribe(
      res => {
        this.customerProfileResponse = res;
      }
    );
  }

  getLoginDetailsByCustomerId(customerId: number) {
    this.commonService.getLoginDetailsByCustomerId(customerId).subscribe(
      res => {
        this.customerSecurityResponse = res;
      }
    );
  }

  getAllEmailsByCustomerId(customerId: number) {
    this.commonService.getAllEmailsByCustomerId(customerId).subscribe(res => {
      this.emailResponse.EmailAddress = "";
      this.emailResponse.SecondaryAddress = "";
      this.emails = res;
      for (let i = 0; i < this.emails.length; i++) {
        if (this.emails[i].Type == "PrimaryEmail")
          this.emailResponse.EmailAddress = this.emails[i].EmailAddress;
        if (this.emails[i].Type == "SecondaryEmail")
          this.emailResponse.SecondaryAddress = this.emails[i].EmailAddress;
        if (this.emails[i].IsPreferred == true) {
          if (this.emails[i].Type == "PrimaryEmail")
            this.emailResponse.EmailPreference = "Primary Email";
          else
            this.emailResponse.EmailPreference = "Secondary Email";
        }
      }
    });
  }

  getAllPhonesByCustomerId(customerId: number) {
    this.commonService.getAllPhonesByCustomerId(customerId).subscribe(res => {
      this.phones = res;
      this.phoneResponse.DayPhone = "";
      this.phoneResponse.EveningPhone = "";
      this.phoneResponse.MobilePhone = "";
      this.phoneResponse.WorkPhone = "";
      this.phoneResponse.Fax = "";
      for (let i = 0; i < this.phones.length; i++) {
        if (this.phones[i].Type == "DayPhone")
          this.phoneResponse.DayPhone = this.phones[i].PhoneNumber;
        else if (this.phones[i].Type == "EveningPhone")
          this.phoneResponse.EveningPhone = this.phones[i].PhoneNumber;
        else if (this.phones[i].Type == "MobileNo")
          this.phoneResponse.MobilePhone = this.phones[i].PhoneNumber;
        else if (this.phones[i].Type == "WorkPhone") {
          this.phoneResponse.WorkPhone = this.phones[i].PhoneNumber;
          if (this.phones[i].Extension != '')
            this.phoneResponse.WorkPhone += ' - ' + this.phones[i].Extension;
        }
        else if (this.phones[i].Type == "Fax")
          this.phoneResponse.Fax = this.phones[i].PhoneNumber;
        if (this.phones[i].IsCommunication == true) {
          if (this.phones[i].Type == "DayPhone")
            this.phoneResponse.PhonePreference = "Day Phone";
          else if (this.phones[i].Type == "EveningPhone")
            this.phoneResponse.PhonePreference = "Evening Phone";
          else if (this.phones[i].Type == "MobileNo")
            this.phoneResponse.PhonePreference = "Mobile #";
          else if (this.phones[i].Type == "WorkPhone")
            this.phoneResponse.PhonePreference = "Work Phone";
          else if (this.phones[i].Type == "Fax")
            this.phoneResponse.PhonePreference = "Fax #";
        }
      }
    });
  }

  getVehicledetailsByCustomerId(customerId: number) {
    this.commonService.getVehicledetailsByCustomerId(customerId).subscribe(res => {
      this.vehicleResponse = res;
    });
  }

  getCustomerAttributesByCustomerId(customerId: number) {
    this.commonService.getCustomerAttributesByCustomerId(customerId).subscribe(res => {
      if (res) {
        this.customerAttributeResponse = res;
        if (res.SourceOfChannel == "W")
          this.customerAttributeResponse.SourceOfChannel = "WalkIn";
        else if (res.SourceOfChannel == "T")
          this.customerAttributeResponse.SourceOfChannel = "Telephone";
        else if (res.SourceOfChannel == "M")
          this.customerAttributeResponse.SourceOfChannel = "Mail";
        else if (res.SourceOfChannel == "I")
          this.customerAttributeResponse.SourceOfChannel = "Internet";
        else if (res.SourceOfChannel == "F")
          this.customerAttributeResponse.SourceOfChannel = "Friend";
        else if (res.SourceOfChannel == "E")
          this.customerAttributeResponse.SourceOfChannel = "Employee";
        if (res.StatementCycle == "M")
          this.customerAttributeResponse.StatementCycle = "Monthly";
        else if (res.SourceOfChannel == "Q")
          this.customerAttributeResponse.StatementCycle = "Quarterly";
        else if (res.SourceOfChannel == "H")
          this.customerAttributeResponse.StatementCycle = "Half-Yearly";
        else if (res.SourceOfChannel == "Y")
          this.customerAttributeResponse.StatementCycle = "Yearly";
        else if (res.SourceOfChannel == "N")
          this.customerAttributeResponse.StatementCycle = "No Statement";
        this.customerAttributeResponse.TranponderPurchasemethod = res.TranponderPurchasemethod;
        if (res.TranponderPurchasemethod == "PickUpAfterNotification")
          this.customerAttributeResponse.TranponderPurchasemethod = "PickUp After Notification";
        else
          this.customerAttributeResponse.TranponderPurchasemethod = "Shipment By Post";
        if (res.StatementDelivery == "Email")
          this.customerAttributeResponse.StatementDelivery = "Electronic Delivery";
        else
          this.customerAttributeResponse.StatementDelivery = "Paper Delivery";
        this.customerAttributeResponse.AutoReplenishmentType = res.AutoReplenishmentType;
        this.customerAttributeResponse.LanguagePreference = res.LanguagePreference;
        this.customerAttributeResponse.IsHearingImpairment = res.IsHearingImpairment;
        this.customerAttributeResponse.IsFrequentCaller = res.IsFrequentCaller
        this.customerAttributeResponse.IsSuperVisor = res.IsSuperVisor
        this.customerAttributeResponse.IsTagInStatusFile = res.IsTagInStatusFile
        this.customerAttributeResponse.InvoiceAmount = res.InvoiceAmount;
        this.customerAttributeResponse.InvoiceDay = res.InvoiceDay;
        this.customerAttributeResponse.InvoiceIntervalID = res.InvoiceIntervalID;
        this.customerAttributeResponse.CalculatedReBillAmount = res.CalculatedReBillAmount;
        this.customerAttributeResponse.ThresholdAmount = res.ThresholdAmount;
        this.getInvoice(this.customerAttributeResponse.InvoiceIntervalID.toString());
        if (res.ReferralCustomerId > 0)
          this.customerAttributeResponse.ReferralCustomerId = res.ReferralCustomerId
      }
    });
  }

  getInvoice(id: string) {
    let list = new List<IinvoiceResponse>(this.newFunction());
    this.invoiceIntervalCycle = list.Where(x => x.CycleID == this.customerAttributeResponse.InvoiceIntervalID).Select(y => y.CycleType).FirstOrDefault();
  }

  private newFunction(): any {
    return this.invoiceTypes;
  }

  getTagRequestByCustomerId(customerId: number) {
    this.commonService.getTagRequestByCustomerId(customerId).subscribe(res => {
      this.tagResponse = res;
    });
  }

  getBaseDetailsByCustomerId(customerId: number) {
    this.commonService.getBaseDetailsByCustomerId(customerId).subscribe(res => {
      this.customerResponse = res;
      console.log(this.customerResponse);
    });
  }

  getDefaultAddressByCustomerID(customerId: number) {
    this.commonService.getDefaultAddress(customerId.toString()).subscribe(res => {
      this.addressResponse = res;
    });
  }

  getBusinessCustomerDetails(customerId: number) {
    this.commonService.getBusinessCustomerDetails(customerId).subscribe(res => {
      this.businessOrganization = res;
    });
  }

  getInvoiveCycleTypes() {
    this.commonService.getInvoiveCycleTypes().subscribe(res => {
      this.invoiceTypes = res;
    });
  }

  getCustomerCreateAccountProcessInfo(customerId: number) {
    this.commonService.getCustomerCreateAccountProcessInfo(this.customerId).subscribe(
      res => {
        this.customerInfo = res;
      });
  }

  bindPlansData() {
    this.commonService.getAllPlansWithFees().subscribe(res => {
      this.plansResponse = res.filter(x => x.PlanId == this.planId);
    });
  }

  previous() {
    this.router.navigate(['/csc/customeraccounts/payment-modes']);
  }

  onCancel(val) {
    if (val == 0) {
      this.showMsg("alert", "Your Information no longer exists, if you cancel your application.<br/>Are you sure you want to Cancel?");
    }
    else {
      let link = ['/csc/customeraccounts/create-account-personal-information/'];
      this.router.navigate(link);
      this.createAccountService.changeResponse(null);
    }
  }

  userAction(event) {
    if (event) {
      this.onCancel(1);
    }
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
