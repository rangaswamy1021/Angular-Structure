import { CustomerContextService } from './../../shared/services/customer.context.service';
import { Router } from '@angular/router';
import { AccountStatus } from './../search/constants';
import { IPaymentResponse } from './../../payment/models/paymentresponse';
import { ICustomerContextResponse } from './../../shared/models/customercontextresponse';
import { ISplitRequest } from './models/splitrequest';
import { SplitCustomerService } from './services/splitcustomer.service';
import { Component, OnInit } from '@angular/core';
import { defaultCulture } from "../../shared/constants";

@Component({
  selector: 'app-split-thank-you',
  templateUrl: './split-thank-you.component.html',
  styleUrls: ['./split-thank-you.component.scss']
})
export class SplitThankYouComponent implements OnInit {
  splitReq: ISplitRequest;
  splitRes: IPaymentResponse;
  totAmntTran: boolean = false;
  txnDateTime: Date;
  referenceNo: string;
  accountId: number;
  totAmountPaid: number;
  payBy: string = "";
  bankAccName: string;
  isBankPayment: boolean;
  customerContextResponse: ICustomerContextResponse;
  viewPath: string = "";
  constructor(private splitService: SplitCustomerService, private splitResponse: SplitCustomerService, private router: Router, private customerContext: CustomerContextService) { }

  ngOnInit() {
    this.splitReq = this.splitService.splitContext();
    this.splitRes = this.splitResponse.splitResponse();
    if (this.splitReq.isTotalBalanceTransfer) {
      this.totAmntTran = true;
    }
    this.txnDateTime = this.splitReq.TxnDateTime;
    this.referenceNo = this.splitReq.ReferenceNo;
    this.accountId = this.splitReq.NewAccountId;
    this.totAmountPaid = this.splitReq.payingAmount;
    if(this.splitReq.Payment != null && this.splitReq.Payment.PaymentMode != null)
    this.payBy = this.splitReq.Payment.PaymentMode.toString();
    if (this.payBy == "ACH") {
      this.isBankPayment = true;
      this.bankAccName = this.splitReq.Payment.AccoutName
    }
    if (!this.splitReq.isTotalBalanceTransfer) {
      this.PaymentReceipt();
    }

  }

  PaymentReceipt(): void {
    console.log(this.splitReq.CustInfo);
    //if (this.splitReq.CustInfo.Alerts == null || this.splitReq.CustInfo.Alerts == undefined)
      this.splitReq.CustInfo.Alerts = false;
      this.splitReq.Payment.IsAddNewCardDetails = false;
      this.splitReq.Payment.IsAddNewBankDetails = false;
      if(this.splitReq.Vehicle != null && this.splitReq.Vehicle.length>0)
      {
        this.splitReq.Vehicle.forEach(x => x.Year = 0);
        this.splitReq.Vehicle.forEach(x => x.IsTemporaryNumber = false);
      }
    if (this.splitReq.CustAttrib.InvoiceAmount == null || this.splitReq.CustAttrib.InvoiceAmount == undefined)
      this.splitReq.CustAttrib.InvoiceAmount = 0;
    if (this.splitReq.Payment.IsAddNewBankDetails == null || this.splitReq.Payment.IsAddNewBankDetails == undefined)
      this.splitReq.Payment.IsAddNewBankDetails = false;
    if (this.splitReq.Payment.IsAddNewCardDetails == null || this.splitReq.Payment.IsAddNewCardDetails == undefined)
      this.splitReq.Payment.IsAddNewCardDetails = false;
    if (this.splitReq.CustAttrib.InvoiceIntervalID == null || this.splitReq.CustAttrib.InvoiceIntervalID == undefined)
      this.splitReq.CustAttrib.InvoiceIntervalID = 0;
    //if(this.splitReq.Payment.ChequeDate == null)
    this.splitReq.Payment.ChequeDate = (this.splitReq.TxnDateTime).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    //if(this.splitReq.Payment.MODate = null)
    this.splitReq.Payment.MODate = this.splitReq.TxnDateTime.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.splitReq.CustInfo.DOB = this.splitReq.TxnDateTime;
    this.splitService.paymentReceipt(this.splitReq, this.splitRes).subscribe(res => {
      if (res) {
        this.viewPath = res;
      }
    }
    );
  }
  goAccountSummary(): void {
    this.customerContextResponse = <ICustomerContextResponse>{};
    this.customerContextResponse.AccountId = this.splitRes.CustomerId;
    this.customerContextResponse.UserName = this.splitReq.CustInfo.UserName;
    this.customerContextResponse.AccountStatus = "AC";
    this.customerContextResponse.AccountSummaryUserActivity = true;
    //this.customerContextResponse.AccountType = this.selectedRowData.AccountType;
    this.customerContextResponse.AdditionalContactUserId = 100003;
    this.customerContextResponse.boolIsTagRequired = "Tag Required";
    this.customerContextResponse.CustomerParentPlan = this.splitReq.CustInfo.UserName;
    this.customerContextResponse.CustomerPlan = "Video Plan";
    this.customerContextResponse.IsSearched = true;
    this.customerContextResponse.IsSplitCustomer = false;
    this.customerContextResponse.RevenueCategory = this.splitReq.CustInfo.RevenueCategory;
    this.customerContext.changeResponse(this.customerContextResponse);
    let link = ['/csc/customerdetails/account-summary'];
    this.router.navigate(link);
  }

  printReceipt() {
    window.open(this.viewPath);
  }
}
