import { Component, OnInit, ViewChild } from '@angular/core';
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { PaymentService } from "../../payment/services/payment.service";
import { CommonService } from "../../shared/services/common.service";
import { RevenueCategory } from "../../payment/constants";
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
@Component({
  selector: 'app-payment-modes',
  templateUrl: './payment-modes.component.html',
  styleUrls: ['./payment-modes.component.scss']
})
export class PaymentModesComponent implements OnInit {
  makepaymentrequest: IMakePaymentrequest = <IMakePaymentrequest>{};
  revenueCategory: string;
  tollBalance: number = 0;
  totalFee: number = 0;
  totalTagFee: number = 0;
  totalTagDeposit: number = 0;
  totalServiceTax: number = 0;
  totalShippingCharge: number;
  planId: number = 0;
  customerInfo = [];
  isDisbaleNext: boolean = false;
  fee: string;
  discount: string;

  planName: string = "No Plan";
  isTagRequired: boolean;
  isTagMessage: string;
  txnAmount: number = 0;
  plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
  sessionContextResponse: IUserresponse;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  @ViewChild(MakePaymentComponent) makePaymentComp;
  constructor(private paymentService: PaymentService, private commonService: CommonService, private router: Router, private createAccountService: CreateAccountService, private customerService: CustomerAccountsService, private sessionService: SessionService) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    //const token = localStorage.getItem('access_token');
    //var userID = localStorage.getItem('UserDeatils').split(',');


    this.createAccountService.currentContext
      .subscribe(customerContext => {
        this.makepaymentrequest = customerContext;
        if (this.makepaymentrequest == null) {
          //let link = ['/csc/customerAccounts/create-account/'];
          //this.router.navigate(link);
        }
      }
      );

    if (this.makepaymentrequest.CustomerId > 0) {
      this.customerService.getRevenueCategorybyAccountId(this.makepaymentrequest.CustomerId).subscribe(
        res => {
          this.revenueCategory = res.RevenueCategory;
          this.makepaymentrequest.RevenueCategory = RevenueCategory[this.revenueCategory];
        }
      );
      this.customerService.getCustomerCreateAccountProcessInfo(this.makepaymentrequest.CustomerId).subscribe(
        res => {
          this.customerInfo = res;
          if (this.customerInfo != null && this.customerInfo.length > 0) {

            this.tollBalance = this.customerInfo[0].TollFee;
            this.totalFee = this.customerInfo[0].TotalFee;
            this.totalTagFee = this.customerInfo[0].TotalTagFee;
            this.totalTagDeposit = this.customerInfo[0].TotalTagDeposit;
            this.totalServiceTax = this.customerInfo[0].TotalServiceTax;
            this.totalShippingCharge = this.customerInfo[0].TotalShippingCharge;
            this.planId = this.customerInfo[0].PlanId;
            this.makepaymentrequest.TxnAmount = this.tollBalance + this.totalFee + this.totalTagFee + this.totalTagDeposit + this.totalServiceTax + this.totalShippingCharge;
            this.txnAmount = this.makepaymentrequest.TxnAmount;
            this.makepaymentrequest.OtherPlanFee = this.totalFee;
            this.makepaymentrequest.PlanFee = this.totalFee;
            this.makepaymentrequest.ReplenishmentType = this.customerInfo[0].ReplenishmentType;
            this.makepaymentrequest.TagDeliveryOption = this.customerInfo[0].TransponderDeliveryMethod;
            this.makepaymentrequest.TagDeliveryMethod = this.customerInfo[0].TagDeliveryMethod;
            this.makePaymentComp.getCreditCardBankInformation(this.makepaymentrequest);
            this.makepaymentrequest.PlanID = this.customerInfo[0].PlanId;
            this.makepaymentrequest.LoginId = this.sessionContextResponse.loginId;
            this.customerService.getAllPlansWithFees().subscribe(res => {
              this.plansResponse = res;
              let plan = <IPlanResponse>{};
              plan = this.plansResponse.filter(x => x.PlanId == this.makepaymentrequest.PlanID)[0];
              this.planName = plan.Name;
              this.isTagRequired = plan.IsTagRequired;
              this.fee = plan.FeeDesc;
              this.discount = plan.DiscountDesc;
              if (this.isTagRequired) { this.isTagMessage = "(Transponder Required)"; }
            });


            this.makepaymentrequest.ICNId = this.sessionContextResponse.icnId;
            this.makepaymentrequest.UserId = this.sessionContextResponse.userId;
            this.makepaymentrequest.UserName = this.sessionContextResponse.userName;
            let item = [];
            for (let key in this.customerInfo) {
              let tagRequest: ITagrequests = <ITagrequests>{};
              if (this.customerInfo[key].TagCount > 0) {
                tagRequest.ReqCount = this.customerInfo[key].TagCount;
                tagRequest.Mounting = this.customerInfo[key].Mounting;
                tagRequest.Protocol = this.customerInfo[key].Protocol;
                item.push(tagRequest);
              }
            }
            this.makepaymentrequest.TagRequests = item.map(x => Object.assign({}, x));
            if (this.makepaymentrequest.TagDeliveryOption.toUpperCase() == "ShipmentByPost") {
              let items = [];
              let objaddress: IAddressRequest = <IAddressRequest>{};
              objaddress.CustomerId = this.makepaymentrequest.CustomerId;
              objaddress.UserName = this.sessionContextResponse.userName;
              objaddress.LoginId = this.sessionContextResponse.loginId;
              objaddress.UserId = this.sessionContextResponse.userId;

              objaddress.Line1 = this.customerInfo[0].Line1;
              objaddress.Line2 = this.customerInfo[0].Line2;
              objaddress.Line3 = this.customerInfo[0].Line3;

              objaddress.City = this.customerInfo[0].City;
              objaddress.State = this.customerInfo[0].State;
              objaddress.Country = this.customerInfo[0].country;
              objaddress.Zip1 = this.customerInfo[0].Zip1;
              objaddress.Zip2 = this.customerInfo[0].Zip2;
              //For system related activities                            
              objaddress.ActivitySource = ActivitySource.Internal;
              objaddress.SubSystem = SubSystem.CSC;
              objaddress.IsActive = true;
              objaddress.IsPreferred = true;
              objaddress.IsActivityRequired = true
              items.push(objaddress);

              //this.makepaymentrequest.ShipmentAddress = <IAddress[]>{};
              this.makepaymentrequest.ShipmentAddress = items.map(x => Object.assign({}, x));
            }
          }
        }
      );

    }
    else {
      let link = ['/csc/customerAccounts/create-account/'];
      this.router.navigate(link);
    }

  }

  doPayment() {
    this.makePaymentComp.doPayment(this.makepaymentrequest);
  }
  gotoPreferences() {
    this.makepaymentrequest.PaymentProcess = undefined;
    this.router.navigateByUrl('csc/customeraccounts/customer-preferences');
  }
  onValidationChanged($event) {
    this.isDisbaleNext = $event;
  }

  onCancel(val) {
    if (val == 0) {
      this.showMsg("alert", "Your Information no longer exists, if you cancel your application.<br/>Are you sure you want to Cancel?");
    }
    else {
      let link = ['/csc/customeraccounts/create-account-personal-information'];
      this.router.navigate(link);
      this.makepaymentrequest.CustomerId = 0;
      this.createAccountService.changeResponse(this.makepaymentrequest);
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
