import { CommonService } from './../services/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { AppSettings, PhoneType, Features, Actions } from "../../shared/constants";
import { IEmailRequest } from '../../shared/models/emailrequest';
import { IEmailResponse } from '../../shared/models/emailresponse';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { IRecentPaymentsResponse } from "../../csc/customerdetails/models/recentpaymentsresponse";
import { IAccountSummartRequest } from "../../csc/customerdetails/models/accountsummaryrequest";
import { IBalanceResponse } from "../../csc/customerdetails/models/balanceresponse";
import { CustomerDetailsService } from "../../csc/customerdetails/services/customerdetails.service";
import { CustomerContextService } from '../services/customer.context.service';
import { ICustomerContextResponse } from '../models/customercontextresponse';

@Component({
        selector: 'app-account-primary-information',
        templateUrl: './account-primary-information.component.html',
        styleUrls: ['./account-primary-information.component.scss']
})
export class AccountPrimaryInformationComponent implements OnInit {
        disableEmailbtn: boolean = false;
        boolKYCDocument: boolean;
        balanceRes: IBalanceResponse;
        rewardbalanceRes: IBalanceResponse;
        customerInformationres: ICustomerResponse;
        customerResponse: ICustomerResponse;
        paymentdetailsRes: IRecentPaymentsResponse;
        accountSummartReq: IAccountSummartRequest;
        creditCards: any[];
        isActiveArrow;
        emailRequest: IEmailRequest;
        selectedEmail: IEmailResponse;
        isVerified: boolean;
        customerContextResponse: ICustomerContextResponse;
        sessionContextResponse: IUserresponse;

        msgFlag: boolean;
        msgType: string;
        msgDesc: string;

        @Input() longAccountId;

        constructor(private customerDetailsService: CustomerDetailsService,
                private sessionContext: SessionService,
                private commonService: CommonService,
                private customerContext: CustomerContextService, ) {
                this.sessionContextResponse = this.sessionContext.customerContext;

        }

        ngOnInit() {

              
                this.customerContext.currentContext
                        .subscribe(customerContext => { this.customerContextResponse = customerContext; }
                        );
                if (this.customerContextResponse.AccountId > 0) {
                        //debugger;
                        //need to pass child customer id.
                        let AccountId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ChildCustomerId : this.customerContextResponse.AccountId;
                        this.longAccountId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ParentId : this.customerContextResponse.AccountId;
                        this.bindAccountSummaryInformation(AccountId);
                        this.checkRolesandPrivileges();
                }
        }


        checkRolesandPrivileges() {
                this.disableEmailbtn = !this.commonService.isAllowed(Features[Features.EMAIL], Actions[Actions.VERIFY], "");
        }

        bindAccountSummaryInformation(accountId:number) {
                this.customerDetailsService.bindCustomerInfoDetails(accountId).subscribe(
                        res => {
                                this.customerInformationres = res;
                        }, (err) => { }
                        , () => {
                                if (this.customerInformationres) {
                                       // this.longAccountId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.longAccountId;
                                        this.bindContactInfoBlock(accountId);
                                        this.getAccountInformation();
                                        this.getPaymentAmountDetails();
                                }
                        });
        }

        bindContactInfoBlock(accountId:number) {
              
                this.accountSummartReq = <IAccountSummartRequest>{};
                this.accountSummartReq.AccountId = this.customerInformationres.ParentId > 0 ? this.customerInformationres.ParentId : this.longAccountId;
                //child customer id need to pass.
                this.accountSummartReq.ParentId = this.customerInformationres.ParentId > 0 ? this.customerContextResponse.ChildCustomerId : 0;
                this.customerDetailsService.bindContactInfoBlock(this.accountSummartReq).subscribe(
                        res => {
                                this.customerResponse = res;
                        },
                        (err) => {
                        }, () => {

                                if (this.customerResponse) {
                                        if (this.customerResponse.PhoneList.length > 0) {
                                                for (var i = 0; i < this.customerResponse.PhoneList.length; i++) {
                                                        if (this.customerResponse.PhoneList[i].Type == PhoneType[PhoneType.DayPhone]) {
                                                                this.customerResponse.PhoneList[i].Type = "Day Phone #"
                                                        }
                                                        if (this.customerResponse.PhoneList[i].Type == PhoneType[PhoneType.EveningPhone]) {
                                                                this.customerResponse.PhoneList[i].Type = "Evening Phone #"
                                                        }
                                                        if (this.customerResponse.PhoneList[i].Type == PhoneType[PhoneType.MobileNo]) {
                                                                this.customerResponse.PhoneList[i].Type = "Mobile #"
                                                        }
                                                        if (this.customerResponse.PhoneList[i].Type == PhoneType[PhoneType.WorkPhone]) {
                                                                this.customerResponse.PhoneList[i].Type = "Work Phone #"
                                                        }
                                                        if (this.customerResponse.PhoneList[i].Type == PhoneType[PhoneType.Fax]) {
                                                                this.customerResponse.PhoneList[i].Type = "Fax #"
                                                        }
                                                }

                                        }
                                }

                                if (this.customerInformationres) {
                                        if (AppSettings.KYCDocument == '1') {
                                                this.boolKYCDocument = true;
                                                this.customerResponse.KYCStatus = this.customerInformationres.KYCStatus == "" ? '(Not Provided)' : this.customerInformationres.KYCStatus;
                                        }
                                        this.customerResponse.FrequentCaller = this.customerInformationres.FrequentCaller;
                                }
                        });
        }

        getAccountInformation() {
                this.customerDetailsService.getCustomerAllTypesOfBalances(this.longAccountId).subscribe(
                        balanceResponse => {
                                this.balanceRes = balanceResponse;
                                if (this.balanceRes == null) {
                                        this.balanceRes = <IBalanceResponse>{};
                                        this.balanceRes.LastAdjustmentAmount = this.balanceRes.LastReversalAmount = this.balanceRes.LastRefundAmount = 0;
                                        this.balanceRes.TagDepositeBalance = this.balanceRes.RefundBalance = this.balanceRes.TollBalance = 0
                                        this.balanceRes.PostpaidBalance = this.balanceRes.ViolationBalance = this.balanceRes.CollectionBalance
                                }
                        });
                this.customerDetailsService.getEarnedRewardPoints(this.longAccountId).subscribe(
                        res => {
                                this.rewardbalanceRes = res;
                                if (this.rewardbalanceRes == null) {
                                        this.rewardbalanceRes = <IBalanceResponse>{};
                                }
                        });
        }

        getPaymentAmountDetails() {
                this.customerDetailsService.getLastPaymentDetails(this.longAccountId).subscribe(
                        res => {
                                this.paymentdetailsRes = res[0];
                        }, (err) => {
                        }, () => {

                                if (this.paymentdetailsRes.PaymentMode == 'CreditCard') {
                                        this.paymentdetailsRes.PaymentMode = 'Credit Card';
                                }
                                if (this.paymentdetailsRes.PaymentMode == 'Cheque') {
                                        this.paymentdetailsRes.PaymentMode = 'Check';
                                }
                                if (this.paymentdetailsRes.PaymentMode == 'MoneyOrder') {
                                        this.paymentdetailsRes.PaymentMode = 'Money Order';
                                }
                                this.customerDetailsService.getCreditCardsByAccountId(this.longAccountId).subscribe(
                                        res => {
                                                this.creditCards = res
                                        }, (err) => {
                                        }, () => {
                                                if (this.creditCards) {
                                                        for (let i = 0; i < this.creditCards.length; i++) {
                                                                if (this.creditCards[i].DefaultFlag) {
                                                                        this.paymentdetailsRes.PrefixSuffix = 'XXXX_' + this.creditCards[i].prefixsuffix;
                                                                        this.paymentdetailsRes.ExpDate = this.creditCards[i].ExpDate;;
                                                                        this.paymentdetailsRes.ExpDate = this.paymentdetailsRes.ExpDate.toString().substring(4, 6) + '/' + this.paymentdetailsRes.ExpDate.toString().substring(0, 4);
                                                                        this.paymentdetailsRes.CardType = this.creditCards[i].CCType;
                                                                        this.paymentdetailsRes.CCTypeDesc = this.creditCards[i].CCTypeDesc;
                                                                        break;
                                                                }
                                                                else {
                                                                        this.paymentdetailsRes.ExpDate = "Not Provided";
                                                                        this.paymentdetailsRes.CardType = "Not Provided";
                                                                        this.paymentdetailsRes.PrefixSuffix = "Not Provided";

                                                                }
                                                        }
                                                }
                                                else {
                                                        this.paymentdetailsRes.ExpDate = "Not Provided";
                                                        this.paymentdetailsRes.CardType = "Not Provided";
                                                        this.paymentdetailsRes.PrefixSuffix = "Not Provided";
                                                }
                                        });
                        });
        }

        onSelect(emailResponse: IEmailResponse): void {
                this.selectedEmail = emailResponse;
                this.emailRequest = <IEmailRequest>{};
                this.emailRequest.CustomerId = this.longAccountId;
                this.emailRequest.EmailAddress = emailResponse.EmailAddress;
                this.emailRequest.UserName = this.customerResponse.FullName;
                this.emailRequest.EmailInterface = "EMAILVERIFICATION"
                this.emailRequest.EmailSubject = "Email Verification";
                this.emailRequest.CreatedUser = this.sessionContextResponse.userName;
                this.emailRequest.Attachement = "";
                this.customerDetailsService.generateEmailVerification(this.emailRequest)
                        .subscribe(res => { this.isVerified = res },
                        (err) => { },
                        () => {
                                if (this.isVerified) {
                                        this.showSucsMsg('Email Verification link has been successfully sent to ' + this.emailRequest.EmailAddress);
                                }
                                else {
                                        this.showErrorMsg('Emial Verification is not completed. Please check with Administrator');
                                }
                        }
                        );

        }


        showSucsMsg(msg: string): void {
                this.msgFlag = true;
                this.msgType = 'success';
                this.msgDesc = msg;
        }


        showErrorMsg(msg: string): void {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = msg;
        }

        setOutputFlag(e) {
                this.msgFlag = e;
        }




}
