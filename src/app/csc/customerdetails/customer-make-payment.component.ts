import { Component, OnInit, ViewChild } from '@angular/core';
import { MakePaymentComponent } from "../../payment/make-payment.component";
import { IUserresponse } from "../../shared/models/userresponse";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { AccountStatus, BalanceType, Features, SubFeatures, Actions } from "../../shared/constants";
import { AccountIntegration, PaymentMode } from "../../payment/constants";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { PaymentService } from "../../payment/services/payment.service";
import { Router } from '@angular/router';
import { SessionService } from "../../shared/services/session.service";
import { ICreditCardRequest } from "../../payment/models/creditcardrequest";
import { IBankRequest } from "../../payment/models/bankrequest";
import { CustomerDetailsService } from "./services/customerdetails.service";
import { IBalanceResponse } from "./models/balanceresponse";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
    selector: 'app-customer-make-payment',
    templateUrl: './customer-make-payment.component.html',
    styleUrls: ['./customer-make-payment.component.scss']
})
export class CustomerMakePaymentComponent implements OnInit {
    @ViewChild(MakePaymentComponent) makePaymentComp;
    msgFlag: boolean;
    msgType: string;
    msgDesc: string;
    isPromoAvailable: boolean = true;
    isCCTaxShow: boolean = true;
    creditCardRequest: ICreditCardRequest[];
    bankRequest: IBankRequest[];
    balanceResponse: IBalanceResponse = <IBalanceResponse>{};
    sessionContextResponse: IUserresponse;
    customerId: number;
    isPostpaidCustomer: boolean;
    paymentAmount: number;
    currentBalanceMsg: string;
    currentBalance: number;
    collectionBalance: number;
    constructor(private commonService: CommonService, private customerContext: CustomerContextService, private paymentService: PaymentService, private router: Router, private sessionService: SessionService, private customerDetailsService: CustomerDetailsService, private createAccountService: CreateAccountService, private materialscriptService: MaterialscriptService) { }
    makepaymentrequest: IMakePaymentrequest = <IMakePaymentrequest>{};
    customerContextResponse: ICustomerContextResponse;
    paymentForm: FormGroup;
    creditCardId: string;
    bankId: string;
    modeOfPayment: string = "Cash";
    arrayAccountStatus: string[];
    isHidePayment: boolean = false;
    ccDisable: boolean = false;
    achDisable: boolean = false;
    cashDisable: boolean = false;
    checkDisable: boolean = false;
    moDisable: boolean = false;
    pormoDisable: boolean = false;
    intCCMaxCount: number;
    intACHMaxCount: number;
    ngOnInit() {

        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }

        this.arrayAccountStatus = [];
        this.arrayAccountStatus.push("CORR");
        this.arrayAccountStatus.push("COWO");
        this.arrayAccountStatus.push("COCL");
        this.arrayAccountStatus.push("RR");
        this.arrayAccountStatus.push("WO");
        this.arrayAccountStatus.push("CL");


        if (this.router.url.endsWith('/customer-makepayment')) {
            this.createAccountService.changeResponse(null);
        }

        this.customerContext.currentContext
            .subscribe(customerContext => {
                this.customerContextResponse = customerContext;
            }
            );
        if (this.customerContextResponse != null && this.customerContextResponse.AccountId > 0) {
            this.customerId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ParentId : this.customerContextResponse.AccountId;
            this.isPostpaidCustomer = this.customerContextResponse.AccountType.toUpperCase() == "POSTPAID" ? true : false;
        };

        this.paymentForm = new FormGroup({
            'paymentAmount': new FormControl('', [Validators.required]),
        });

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.PAYMENT];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = this.customerId;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;

        this.makePaymentComp.InitialiZeObject(this.customerId);
        this.ccDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.CC], "");
        this.achDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.BANK], "");
        this.cashDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.CASH], "");
        this.checkDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.CHEQUE], "");
        this.moDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.MO], "");
        this.pormoDisable = !this.commonService.isAllowed(Features[Features.PAYMENT], Actions[Actions.PROMO], "");
        if (this.ccDisable && this.achDisable && this.cashDisable && this.checkDisable && this.moDisable && this.pormoDisable) {
            this.modeOfPayment = '';
            this.makePaymentComp.setCustomerId(this.customerId, "Cash");
        }
        else {
            this.makePaymentComp.setCustomerId(this.customerId, this.getDefaultPaymentMethod());
        }

        this.paymentService.GetCreditCardByAccountId(this.customerId.toString(), userEvents).subscribe(res => {
            if (res) {
                let creditCardResponse: ICreditCardRequest[]
                creditCardResponse = res;
                if (creditCardResponse.length > 0) {
                    //let currentYYYMM: Date = new Date();
                    this.creditCardRequest = creditCardResponse;// creditCardResponse.filter(x => x.ExpDate > (Number)(currentYYYMM.getFullYear().toString() + currentYYYMM.getMonth().toString()));
                }
                console.log(this.makepaymentrequest);
                if (this.makepaymentrequest != undefined && this.makepaymentrequest != null && this.makepaymentrequest.PaymentProcess == "OldCreditCard")
                    this.creditCardId = this.makepaymentrequest.CustomerCCorBankAccountId.toString();
                else
                    this.creditCardId = "";
            }
        });

        this.paymentService.GetBankByAccountID(this.customerId.toString()).subscribe(res => {
            if (res) {
                this.bankRequest = res;
                if (this.makepaymentrequest != undefined && this.makepaymentrequest != null && this.makepaymentrequest.PaymentProcess == "OldBankAccount")
                    this.bankId = this.makepaymentrequest.CustomerCCorBankAccountId.toString();
                else
                    this.bankId = "";
            }

        });
        this.BindCustomerRelatedBalances(this.customerId);

        this.createAccountService.currentContext
            .subscribe(customerContext => {
                this.makepaymentrequest = customerContext;
                if (this.makepaymentrequest == null || this.makepaymentrequest.CustomerId == 0) {
                }
                else {
                    this.makePaymentComp.setCustomerId(this.customerId, "");
                    let payMethod: string;
                    if (this.makepaymentrequest.PaymentMode == PaymentMode.CreditCard) {
                        if (this.makepaymentrequest.PaymentProcess == "OldCreditCard") {
                            payMethod = "OldCreditCard";
                        }
                        else
                            payMethod = "CreditCard";
                    }
                    else if (this.makepaymentrequest.PaymentMode == PaymentMode.Bank) {
                        if (this.makepaymentrequest.PaymentProcess == "OldBankAccount") {
                            payMethod = "OldBankAccount";
                        }
                        else
                            payMethod = "ACH";
                    }
                    else if (this.makepaymentrequest.PaymentMode == PaymentMode.Cash) {
                        payMethod = "Cash";
                    }
                    else if (this.makepaymentrequest.PaymentMode == PaymentMode.Cheque) {
                        payMethod = "Cheque";
                    }
                    else if (this.makepaymentrequest.PaymentMode == PaymentMode.MoneyOrder) {
                        payMethod = "MO";
                    }
                    else if (this.makepaymentrequest.PaymentMode == PaymentMode.Promo) {
                        payMethod = "Promo";
                        this.paymentForm.controls["paymentAmount"].disable(true);
                    }
                    this.modeOfPayment = payMethod;
                    this.makePaymentComp.bindDetailsOnBack(this.makepaymentrequest);
                    this.makePaymentComp.changePaymentMethod(payMethod);
                    this.paymentAmount = this.makepaymentrequest.TxnAmount;
                }
            });


        if (this.arrayAccountStatus.indexOf(this.customerContextResponse.AccountStatus) > -1) {
            this.isHidePayment = true;
        }
        this.getApplicationParameters();
    }

    getApplicationParameters() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxCreditCards).subscribe(
            res => this.intCCMaxCount = res
        );

        this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxBankAccounts).subscribe(
            res => this.intACHMaxCount = res
        );
    }

    getDefaultPaymentMethod(): string {
        if (this.cashDisable) {
            if (this.ccDisable) {
                if (this.achDisable) {
                    if (this.checkDisable) {
                        if (this.moDisable) {
                            if (this.pormoDisable) {
                                return "Cash";
                            }
                            else
                                return "Promo";
                        } else
                            return "MO";
                    } else
                        return "Cheque";
                } else
                    return "ACH";
            } else
                return "CreditCard";

        }
        return "Cash";
    }

    payMethodClick(payMethod: string) {
        let a=this;
        setTimeout(function() {
            a.materialscriptService.material();
        }, 100);
        this.makePaymentComp.changePaymentMethod(payMethod);
        this.creditCardId = "";
        this.bankId = "";
        this.paymentForm.controls["paymentAmount"].disable(false);
        this.paymentForm.controls["paymentAmount"].enable(true);
        this.modeOfPayment = payMethod;
    }

    onCreditCardSelectionChanged(creditCardValue: string) {
        this.bankId = "";
        if (creditCardValue == "" && (this.bankId != "" || this.creditCardId != "")) {
            this.creditCardId = "";
            this.makePaymentComp.changePaymentMethod(this.getDefaultPaymentMethod());
        }
        else if (creditCardValue != "") {
            this.makePaymentComp.changePaymentMethod("OldCreditCard");
            this.creditCardId = creditCardValue;
        }
        else
            this.makePaymentComp.changePaymentMethod(this.getDefaultPaymentMethod());
    }

    onBankSelectionChanged(bankValue: string) {
        this.creditCardId = ""
        if (bankValue == "" && (this.bankId != "" || this.creditCardId != "")) {
            this.bankId = "";
            this.makePaymentComp.changePaymentMethod(this.getDefaultPaymentMethod());
        }
        else if (bankValue != "") {
            this.makePaymentComp.changePaymentMethod("OldBankAccount");
            this.bankId = bankValue;
        }
        else
            this.makePaymentComp.changePaymentMethod(this.getDefaultPaymentMethod());
    }

    cancelClick(val) {
        if (val == 0) {
            this.showMsg("alert", "Your Information no longer exists, if you cancel make payment.<br/>Are you sure you want to Cancel?");
        }
        else {
            this.router.navigate(['/csc/customerdetails/account-summary']);
            this.createAccountService.changeResponse(null);
        }
    }

    resetClick() {
        this.makePaymentComp.resetclick(this.customerId);
        this.makePaymentComp.setCustomerId(this.customerId, "");
        this.creditCardId = "";
        this.bankId = "";
        this.paymentForm.reset();
        this.createAccountService.changeResponse(null);
    }

    BindCustomerRelatedBalances(longAccountId: number) {

        this.customerDetailsService.getBalance(longAccountId, this.customerContextResponse.AccountStatus, this.isPostpaidCustomer).subscribe(res => {
            if (res) {
                this.balanceResponse = res;
                if (!this.isPostpaidCustomer) {
                    this.currentBalance = this.balanceResponse.TollBalance;
                    if (this.balanceResponse.TollBalance < 0)
                        this.currentBalanceMsg = "Balance Due";
                    else
                        this.currentBalanceMsg = "Current Balance";
                }
                else {
                    this.currentBalance = this.balanceResponse.PostpaidBalance < 0 ? -1 * this.balanceResponse.PostpaidBalance : this.balanceResponse.PostpaidBalance;
                    if (this.balanceResponse.PostpaidBalance <= 0)
                        this.currentBalanceMsg = "Current Balance";
                    else
                        this.currentBalanceMsg = "Balance Due";
                }
                if (this.customerContextResponse.AccountStatus.toUpperCase() == "CO" || this.customerContextResponse.AccountStatus.toUpperCase() == "COPD") {
                    this.collectionBalance = this.balanceResponse.CollectionBalance;
                }


            }
        });
    }


    doPayment() {
        this.msgFlag = false;
        let paymentrequest = <IMakePaymentrequest>{};
        if (this.modeOfPayment == "CreditCard" && this.creditCardId == "" && this.makePaymentComp.creditCardComponent.createForm.controls['SaveCreditCard'].value) {
            if (this.creditCardRequest) {
                if (this.creditCardRequest.length >= (Number)(this.intCCMaxCount)) {
                    this.showMsg("error", "You have exceeded maximum number of Credit Cards");
                    return;
                }
            }
        }
        else if (this.modeOfPayment == "ACH" && this.makePaymentComp.bankCardComponent.createForm.controls['SaveBank'].value) {
            if (this.bankRequest) {
                if (this.bankRequest.length >= (Number)(this.intACHMaxCount)) {
                    this.showMsg("error", "You have exceeded maximum number of Credit Cards");
                    return;
                }
            }
        }
        else if (this.creditCardId != "") {
            let currentYYYMM: Date = new Date();
            if (this.creditCardRequest.filter(x => x.CCID == (Number)(this.creditCardId))[0].ExpDate < (currentYYYMM.getFullYear() * 100 + currentYYYMM.getMonth())) {
                this.showMsg("error", "Selected Credit Card is expired");
                return;
            }
        }

        paymentrequest.TxnAmount = (Number)(this.paymentAmount);
        paymentrequest.IsCollectionCustomer = this.customerContextResponse.AccountStatus.toUpperCase() == AccountStatus[AccountStatus.CO] || this.customerContextResponse.AccountStatus.toUpperCase() == AccountStatus[AccountStatus.COPD] ? true : false;
        if (paymentrequest.TxnAmount > 0) {
            paymentrequest.AccountIntegration = AccountIntegration.MakePayment;
            paymentrequest.Description = "MakePayment";
            paymentrequest.AccountStatus = AccountStatus[this.customerContextResponse.AccountStatus];

            paymentrequest.CustomerId = this.customerId;
            paymentrequest.UserName = this.sessionContextResponse.userName;
            paymentrequest.IsPostpaidCustomer = this.isPostpaidCustomer;
            if (this.creditCardId != "") {
                paymentrequest.CustomerCCorBankAccountId = (Number)(this.creditCardId);
            }
            else if (this.bankId != "") {
                paymentrequest.CustomerCCorBankAccountId = (Number)(this.bankId);
            }
            else
                paymentrequest.CustomerCCorBankAccountId = 0;
            paymentrequest.CustomerParentPlan = this.customerContextResponse.AccountType;
            paymentrequest.ICNId = this.sessionContextResponse.icnId;
            paymentrequest.LoginId = this.sessionContextResponse.loginId;
            paymentrequest.UserId = this.sessionContextResponse.userId;
            paymentrequest = this.makePaymentComp.doPayment(paymentrequest);
        }
        else {
            this.showMsg("error", "Enter amount more than zero");

        }
    }

    populatePromoValue($event) {
        if ($event == undefined) {
            this.paymentForm.controls["paymentAmount"].setValue("");
            this.paymentForm.controls["paymentAmount"].disable(false);
            this.paymentForm.controls["paymentAmount"].enable(true);
        }
        else {
            this.paymentForm.controls["paymentAmount"].setValue($event);
            this.paymentForm.controls["paymentAmount"].disable(true);
        }

    }

    userAction(event) {
        if (event) {
            this.cancelClick(1);
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
