import { Component, OnInit, ViewChild, Input, OnChanges, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IMakePaymentrequest } from "./models/makepaymentrequest";
import { AccountIntegration, AccountStatus, PaymentMode, RevenueCategory, CreditCardType } from "./constants";
import { ICreditcardpaymentrequest } from "./models/creditcardpaymentrequest";
import { ICreditCardRequest } from "./models/creditcardrequest";
import { CreditCardInformationComponent } from "./credit-card-information.component";
import { PaymentService } from "./services/payment.service";
import { CommonService } from "../shared/services/common.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { Router } from '@angular/router';
import { ITagrequests } from "./models/tagrequests";
import { IAddressRequest } from "./models/addressrequest";
import { BankInformationComponent } from "./bank-information.component";
import { ChequeComponent } from "./cheque.component";
import { MoneyOrderComponent } from "./money-order.component";
import { IBlocklistRequest } from "./models/blocklistrequest";
import { IBlocklistresponse } from "../shared/models/blocklistmessageresponse";
import { IBankRequest } from "./models/bankrequest";
import { CreateAccountService } from "../shared/services/createaccount.service";
import { CustomerAccountsService } from "../csc/customeraccounts/services/customeraccounts.service";
import { IViolationPaymentrequest } from "./models/violationpaymentrequest";
import { Observable } from "rxjs/Observable";
import { PaymentContextService } from "../tvc/paymentdetails/services/payment.context.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { IUserEvents } from "../shared/models/userevents";
import { Features, Actions, SubFeatures, defaultCulture } from "../shared/constants";
import { IUserresponse } from "../shared/models/userresponse";
import { SessionService } from "../shared/services/session.service";
import { MaterialscriptService } from "../shared/materialscript.service";
import { DatePickerFormatService } from "../shared/services/datepickerformat.service";

declare var $: any;
@Component({
    selector: 'app-make-payment',
    templateUrl: './make-payment.component.html',
    styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit, OnChanges, AfterViewInit {
    msgFlag: boolean;
    msgType: string;
    msgDesc: string;
    creditCardRequest: ICreditCardRequest[];
    bankRequest: IBankRequest[];
    paymentDetailsHeading: string;
    isGiftCertificateAvailable: boolean = false;
    @Input("IsPromoAvailable") isPromoAvailable: boolean = false;
    checkServiceTax: boolean;
    ccServiceTax: number;
    isCreditCardModesVisible: boolean = true;
    isCheckBloackList: boolean;
    paymentrequest: IMakePaymentrequest = <IMakePaymentrequest>{};
    vioPaymentRequest: IViolationPaymentrequest
    replenishmentType: string;
    createForm: FormGroup;
    objBlockList: IBlocklistRequest = <IBlocklistRequest>{};
    objBlockListRes: IBlocklistresponse[];
    payMethod: string = "CreditCard";
    popupHeading: string;
    popupMessage: string;
    isSaveCheckBox: boolean = true;
    chequeDate: Date;
    chequeNumber: string;
    checkRoutingNumber: string;
    ccDisable: boolean = false;
    achDisable: boolean = false;
    cashDisable: boolean = false;
    checkDisable: boolean = false;
    moDisable: boolean = false;
    promoCode: string;
    mODate: Date;
    mONumber: string;
    isModesVisisble: boolean = true;;
    customerid: number;
    sessionContextResponse: IUserresponse
    @Input("IsDisabled") isDisbaleNext: boolean;
    @Input("IsCCTaxShow") isCCTaxShow: boolean = false;
    @Input("Feature") feature: string;
    @Output() onValidationChanges: EventEmitter<boolean> = new EventEmitter();
    @ViewChild(CreditCardInformationComponent) creditCardComponent;
    @ViewChild(BankInformationComponent) bankCardComponent;
    @ViewChild(ChequeComponent) chequeCardComponent;
    @ViewChild(MoneyOrderComponent) moComponent;
    promoForm: FormGroup;
    constructor(private datePickerFormat: DatePickerFormatService, private customerContext: CustomerContextService, private paymentService: PaymentService, private commonService: CommonService, private router: Router, private createAccountService: CreateAccountService, private vioPaymentContextService: PaymentContextService, private sessionService: SessionService, private materialscriptService: MaterialscriptService) { }
    @Output() sendPromoValue: EventEmitter<number> = new EventEmitter<number>();
    initialzseObjects(): void {
        this.creditCardRequest = <ICreditCardRequest[]>{};
        this.bankRequest = <IBankRequest[]>{};
        //this.replenishmentType = makepaymentrequest.ReplenishmentType;
        this.chequeNumber = " ";
        this.mONumber = " ";
    }

    ngOnInit() {
        this.materialscriptService.material();
        this.promoForm = new FormGroup({
            'promoCode': new FormControl('', [Validators.required]),
        });
        this.checkApplicationParameterStatus();
        this.getApplicationParameterValue();
        this.checkBlockList();
        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }
        if (this.feature != undefined && this.feature != "") {
            this.ccDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CC], "");
            this.achDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.BANK], "");
            this.cashDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CASH], "");
            this.checkDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CHEQUE], "");
            this.moDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.MO], "");
            if (this.ccDisable && this.achDisable && this.cashDisable && this.checkDisable && this.moDisable) {
                this.payMethod = "Cash";
            }
            else {
                this.payMethod = this.getDefaultPaymentMethod();
            }
        }
    }

    getDefaultPaymentMethod(): string {
        if (this.ccDisable) {
            if (this.achDisable) {
                if (this.cashDisable) {

                    if (this.checkDisable) {
                        if (this.moDisable) {
                            return "Cash";
                        } else
                            return "MO";
                    } else
                        return "Cheque";
                }
                return "Cash";
            } else
                return "ACH";
        } else
            return "CreditCard";
    }

    changePayment() {
        //console.log(this.payMethod);
    }

    ngOnChanges(): void {
        this.onValidationChanges.emit(this.isDisbaleNext);
    }

    doPayment(makepaymentrequest: IMakePaymentrequest) {
        this.msgFlag = false;
        let isFormValid: boolean;
        makepaymentrequest.CreditCardServiceTax = 0;
        if (this.payMethod == "CreditCard") {
            isFormValid = this.creditCardComponent.createForm.valid;
            if (isFormValid)
                isFormValid = this.creditCardComponent.addressComponent.addAddressForm.valid || (this.creditCardComponent.addressComponent.addAddressForm.status == 'DISABLED');
            if (!isFormValid) {
                this.validateAllFormFields(this.creditCardComponent.createForm);
                this.validateAllFormFields(this.creditCardComponent.addressComponent.addAddressForm);
            }

        }
        else if (this.payMethod == "ACH") {
            isFormValid = this.bankCardComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.bankCardComponent.createForm);
            }
        }
        else if (this.payMethod == "Cheque") {
            isFormValid = this.chequeCardComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.chequeCardComponent.createForm);
            }
        }
        else if (this.payMethod == "MO") {
            isFormValid = this.moComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.moComponent.createForm);
            }
        }
        else if (this.payMethod == "Promo") {
            isFormValid = this.promoForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.promoForm);
            }
        }
        else {
            isFormValid = true;
        }

        if (isFormValid) {
            this.msgFlag = false;
            let creditCardNum: string;
            makepaymentrequest.CreditCardPayment = null;
            makepaymentrequest.BankName = null;
            makepaymentrequest.ChequeDate = null;
            makepaymentrequest.MONumber = null;
            if (this.payMethod == "CreditCard") {
                this.createForm = this.creditCardComponent.createForm;
                creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
                makepaymentrequest.CreditCardPayment = <ICreditcardpaymentrequest>{};
                makepaymentrequest.CreditCardPayment.NameOnCard = this.createForm.controls['Name'].value.toUpperCase();
                makepaymentrequest.CreditCardPayment.CreditCardType = this.createForm.controls['CardType'].value;
                makepaymentrequest.CreditCardPayment.ExpiryDate = (Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value)).toString();
                makepaymentrequest.CreditCardPayment.ExpiryMonth = this.createForm.controls['Month'].value;
                makepaymentrequest.CreditCardPayment.ExpiryYear = this.createForm.controls['Year'].value;
                makepaymentrequest.CreditCardPayment.CreditCardNumber = creditCardNum;
                makepaymentrequest.CreditCardPayment.CVV = "";

                makepaymentrequest.PaymentMode = PaymentMode.CreditCard;
                makepaymentrequest.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();

                makepaymentrequest.CreditCardServiceTax = this.checkServiceTax == true ? Math.round(makepaymentrequest.TxnAmount * Number(this.ccServiceTax)) / 100 : Math.round(this.ccServiceTax);

                makepaymentrequest.CreditCardPayment.Line1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
                makepaymentrequest.CreditCardPayment.Line2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
                makepaymentrequest.CreditCardPayment.Line3 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine3"].value;

                makepaymentrequest.CreditCardPayment.City = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCity"].value;
                makepaymentrequest.CreditCardPayment.State = this.creditCardComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
                makepaymentrequest.CreditCardPayment.Country = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
                makepaymentrequest.CreditCardPayment.Zip1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
                makepaymentrequest.CreditCardPayment.Zip2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
                makepaymentrequest.IsAddNewCardDetails = this.createForm.controls['SaveCreditCard'].value;
                makepaymentrequest.CreditCardPayment.DefaultFlag = this.createForm.controls['SaveCreditCard'].value;
                makepaymentrequest.IsNewAddress = this.creditCardComponent.isAddressEnable;
                ///TO CHECK credit card in block list
                if (this.creditCardComponent.checkCreditCard(creditCardNum, makepaymentrequest.CreditCardPayment.CreditCardType)) {
                    if (this.creditCardComponent.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {
                        if (this.isCheckBloackList) {
                            this.objBlockList.CCAccountId = makepaymentrequest.CustomerId;
                            this.objBlockList.CCNumber = creditCardNum;
                            this.objBlockList.Line1 = makepaymentrequest.CreditCardPayment.Line1;
                            this.objBlockList.Line2 = makepaymentrequest.CreditCardPayment.Line2
                            this.objBlockList.Line3 = makepaymentrequest.CreditCardPayment.Line3;
                            this.objBlockList.City = makepaymentrequest.CreditCardPayment.City;
                            this.objBlockList.State = makepaymentrequest.CreditCardPayment.State;
                            this.objBlockList.Country = makepaymentrequest.CreditCardPayment.Country;
                            this.objBlockList.Zip1 = makepaymentrequest.CreditCardPayment.Zip1;
                            this.objBlockList.Zip2 = makepaymentrequest.CreditCardPayment.Zip2;
                            this.objBlockList.CCExpiryMonth = this.createForm.controls['Month'].value;
                            this.paymentService.IsExistsinBlockList(this.objBlockList).subscribe(res => {
                                if (res) {
                                    this.paymentrequest = makepaymentrequest;
                                    this.objBlockListRes = res;
                                    $('#blocklist-dialog').modal('show');
                                    //this.popupHeading = " The Information you have entered is matched with block list. Are you sure you want to proceed?";
                                    //this.popupMessage = " <table class='table table-bordered table-sm'><thead><tr><th>Field Name</th><th> Field Value </th><th>Created By</th><th> Created Date</th><th>Flag Reason</th></tr></thead><tbody> <tr><td>" + this.objBlockListRes[0].SourceName + "</td><td>" + this.objBlockListRes[0].FieldValue + "</td><td>" + this.objBlockListRes[0].CreatedUser + "</td><td>" + this.objBlockListRes[0].CreatedDateTime + "</td><td>" + this.objBlockListRes[0].FlagReason + "</td></tr></tbody></table>";
                                    //$('#refund-conf').modal('show');
                                }
                                else {
                                    this.MakePayment(makepaymentrequest);
                                }

                            });
                        }
                        else {
                            this.MakePayment(makepaymentrequest);
                        }
                    }
                    else {
                        this.showMsg("error", "Invalid Expiration Date");
                    }
                }
                else {
                    this.showMsg("error", "Enter valid Credit Card #");
                }
            }
            else if (this.payMethod == "ACH") {
                makepaymentrequest.PaymentMode = PaymentMode.Bank;
                makepaymentrequest.PaymentProcess = PaymentMode[PaymentMode.Bank].toString();
                this.createForm = this.bankCardComponent.createForm;
                makepaymentrequest.AccoutName = this.createForm.controls['accountHolderName'].value.toUpperCase();
                makepaymentrequest.AccountNumber = this.createForm.controls['accountNo'].value;;
                makepaymentrequest.BankRoutingNumber = this.createForm.controls['routingValue'].value;
                makepaymentrequest.BankName = this.createForm.controls['bankName'].value.toUpperCase();
                makepaymentrequest.IsAddNewBankDetails = this.createForm.controls["SaveBank"].value;
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "Cheque") {
                makepaymentrequest.PaymentMode = PaymentMode.Cheque;
                makepaymentrequest.PaymentProcess = PaymentMode[PaymentMode.Cheque].toString();
                this.createForm = this.chequeCardComponent.createForm;
                makepaymentrequest.ChequeNumber = this.createForm.controls['checkNumber'].value;
                makepaymentrequest.CheckRoutingNumber = this.createForm.controls['checkRouting'].value;;
                let chkdate = this.createForm.controls['checkDate'].value;
                // makepaymentrequest.ChequeDate = chkdate.formatted;
                makepaymentrequest.ChequeDate = this.datePickerFormat.getFormattedDate(chkdate.date).toLocaleString(defaultCulture).replace(/\u200E/g, "");
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "MO") {
                makepaymentrequest.PaymentMode = PaymentMode.MoneyOrder;
                makepaymentrequest.PaymentProcess = PaymentMode[PaymentMode.MoneyOrder].toString();
                this.createForm = this.moComponent.createForm;
                makepaymentrequest.MONumber = this.createForm.controls['moneyOrderNumber'].value;
                let moneyOrder = this.createForm.controls['moneyOrderDate'].value;
                makepaymentrequest.MODate = this.datePickerFormat.getFormattedDate(moneyOrder.date).toLocaleString(defaultCulture).replace(/\u200E/g, "");
                // makepaymentrequest.MODate = this.createForm.controls['moneyOrderDate'].value;              
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "Cash") {
                makepaymentrequest.PaymentMode = PaymentMode.Cash;
                makepaymentrequest.PaymentProcess = PaymentMode[PaymentMode.Cash].toString();
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "OldCreditCard") {
                makepaymentrequest.CreditCardServiceTax = this.checkServiceTax == true ? Math.round(makepaymentrequest.TxnAmount * Number(this.ccServiceTax)) / 100 : Math.round(this.ccServiceTax);
                makepaymentrequest.PaymentMode = PaymentMode.CreditCard;
                makepaymentrequest.PaymentProcess = "OldCreditCard";
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "OldBankAccount") {
                makepaymentrequest.PaymentMode = PaymentMode.Bank;
                makepaymentrequest.PaymentProcess = "OldBankAccount";
                this.MakePayment(makepaymentrequest);
            }
            else if (this.payMethod == "Promo") {
                makepaymentrequest.PaymentMode = PaymentMode.Promo;
                makepaymentrequest.PaymentProcess = "Promo";
                makepaymentrequest.PromoCode = this.promoForm.controls["promoCode"].value;
                this.MakePayment(makepaymentrequest);
            }
        }
        else {
            // this.errorBlock = true;
            // this.errorHeading = "";
            // this.errorMessage = "Enter data in all required fields";
        }
    }

    DoViolationPayment(objPaymentRequest: IViolationPaymentrequest) {
        this.msgFlag = false;
        let isFormValid: boolean;
        objPaymentRequest.CreditCardServiceTax = 0;
        if (this.payMethod == "CreditCard") {
            isFormValid = this.creditCardComponent.createForm.valid;
            if (isFormValid)
                isFormValid = this.creditCardComponent.addressComponent.addAddressForm.valid || (this.creditCardComponent.addressComponent.addAddressForm.status == 'DISABLED');
            if (!isFormValid) {
                this.validateAllFormFields(this.creditCardComponent.createForm);
                this.validateAllFormFields(this.creditCardComponent.addressComponent.addAddressForm);
            }

        }
        else if (this.payMethod == "ACH") {
            isFormValid = this.bankCardComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.bankCardComponent.createForm);
            }
        }
        else if (this.payMethod == "Cheque") {
            isFormValid = this.chequeCardComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.chequeCardComponent.createForm);
            }
        }
        else if (this.payMethod == "MO") {
            isFormValid = this.moComponent.createForm.valid;
            if (!isFormValid) {
                this.validateAllFormFields(this.moComponent.createForm);
            }
        }
        else if (this.payMethod == "Cash") {
            isFormValid = true;
        }

        if (isFormValid) {
            this.msgFlag = false;
            let creditCardNum: string;
            objPaymentRequest.CreditCardPayment = null;
            objPaymentRequest.BankName = null;
            objPaymentRequest.ChequeDate = null;
            objPaymentRequest.CreditCardPayment = null;
            if (this.payMethod == "CreditCard") {
                this.createForm = this.creditCardComponent.createForm;
                creditCardNum = this.createForm.get("CCNumbers.CCNumber1").value + "" + this.createForm.get("CCNumbers.CCNumber2").value + "" + this.createForm.get("CCNumbers.CCNumber3").value + "" + this.createForm.get("CCNumbers.CCNumber4").value;
                objPaymentRequest.CreditCardPayment = <ICreditcardpaymentrequest>{};
                objPaymentRequest.CreditCardPayment.NameOnCard = this.createForm.controls['Name'].value.toUpperCase();
                objPaymentRequest.CreditCardPayment.CreditCardType = this.createForm.controls['CardType'].value;
                objPaymentRequest.CreditCardPayment.ExpiryDate = (Number(this.createForm.controls['Year'].value * 100) + Number(this.createForm.controls['Month'].value)).toString();
                objPaymentRequest.CreditCardPayment.ExpiryMonth = this.createForm.controls['Month'].value;
                objPaymentRequest.CreditCardPayment.ExpiryYear = this.createForm.controls['Year'].value;
                objPaymentRequest.CreditCardPayment.CreditCardNumber = creditCardNum;
                objPaymentRequest.CreditCardPayment.CVV = "";

                objPaymentRequest.PaymentMode = PaymentMode.CreditCard;
                objPaymentRequest.PaymentProcess = PaymentMode[PaymentMode.CreditCard].toString();

                objPaymentRequest.CreditCardServiceTax = this.checkServiceTax == true ? Math.round(objPaymentRequest.TxnAmount * Number(this.ccServiceTax)) / 100 : Math.round(this.ccServiceTax);

                objPaymentRequest.CreditCardPayment.Line1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine1"].value;
                objPaymentRequest.CreditCardPayment.Line2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine2"].value;
                objPaymentRequest.CreditCardPayment.Line3 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressLine3"].value;

                objPaymentRequest.CreditCardPayment.City = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCity"].value;
                objPaymentRequest.CreditCardPayment.State = this.creditCardComponent.addressComponent.addAddressForm.controls["addressStateSelected"].value;
                objPaymentRequest.CreditCardPayment.Country = this.creditCardComponent.addressComponent.addAddressForm.controls["addressCountrySelected"].value;
                objPaymentRequest.CreditCardPayment.Zip1 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip1"].value;
                objPaymentRequest.CreditCardPayment.Zip2 = this.creditCardComponent.addressComponent.addAddressForm.controls["addressZip2"].value;
                objPaymentRequest.IsAddNewCardDetails = this.createForm.controls['SaveCreditCard'].value;
                objPaymentRequest.IsNewAddress = this.creditCardComponent.isAddressEnable;
                objPaymentRequest.CreditCardPayment.DefaultFlag = this.createForm.controls['SaveCreditCard'].value;
                if (this.creditCardComponent.checkCreditCard(creditCardNum, objPaymentRequest.CreditCardPayment.CreditCardType)) {
                    if (this.creditCardComponent.CheckExpairyDate(this.createForm.controls['Month'].value, this.createForm.controls['Year'].value)) {
                        this.violationPayment(objPaymentRequest);
                    }
                    else {
                        this.showMsg("error", "Invalid Expiration Date");
                    }
                }
                else {
                    this.showMsg("error", "Enter valid Credit Card #");
                }
            }
            else if (this.payMethod == "ACH") {
                objPaymentRequest.PaymentMode = PaymentMode.Bank;
                objPaymentRequest.PaymentProcess = PaymentMode[PaymentMode.Bank].toString();
                this.createForm = this.bankCardComponent.createForm;
                objPaymentRequest.AccoutName = this.createForm.controls['accountHolderName'].value.toUpperCase();
                objPaymentRequest.AccountNumber = this.createForm.controls['accountNo'].value;;
                objPaymentRequest.BankRoutingNumber = this.createForm.controls['routingValue'].value;
                objPaymentRequest.BankName = this.createForm.controls['bankName'].value.toUpperCase();
                objPaymentRequest.IsAddNewBankDetails = this.createForm.controls["SaveBank"].value;
                this.violationPayment(objPaymentRequest);
            }
            else if (this.payMethod == "Cheque") {
                objPaymentRequest.PaymentMode = PaymentMode.Cheque;
                objPaymentRequest.PaymentProcess = PaymentMode[PaymentMode.Cheque].toString();
                this.createForm = this.chequeCardComponent.createForm;
                objPaymentRequest.ChequeNumber = this.createForm.controls['checkNumber'].value;
                objPaymentRequest.CheckRoutingNumber = this.createForm.controls['checkRouting'].value;;
                // objPaymentRequest.ChequeDate = this.createForm.controls['checkDate'].value;
                let chkdate = this.createForm.controls['checkDate'].value;
                //let formattedDate=new Date(chkdate.date.year,chkdate.date.month,chkdate.date.day);



                let date = this.datePickerFormat.getFormattedDate(chkdate.date);
                objPaymentRequest.ChequeDate = date.toLocaleString(defaultCulture).replace(/\u200E/g, "");

                this.violationPayment(objPaymentRequest);
            }
            else if (this.payMethod == "MO") {
                objPaymentRequest.PaymentMode = PaymentMode.MoneyOrder;
                objPaymentRequest.PaymentProcess = PaymentMode[PaymentMode.MoneyOrder].toString();
                this.createForm = this.moComponent.createForm;
                objPaymentRequest.MONumber = this.createForm.controls['moneyOrderNumber'].value;
                // objPaymentRequest.MODate = this.createForm.controls['moneyOrderDate'].value;
                let MODate = this.createForm.controls['moneyOrderDate'].value;
                objPaymentRequest.MODate = this.datePickerFormat.getFormattedDate(MODate.date).toLocaleString(defaultCulture).replace(/\u200E/g, "");
                this.violationPayment(objPaymentRequest);
            }
            else if (this.payMethod == "Cash") {
                objPaymentRequest.PaymentMode = PaymentMode.Cash;
                objPaymentRequest.PaymentProcess = PaymentMode[PaymentMode.Cash].toString();
                this.violationPayment(objPaymentRequest);
            }
        }
        else {
            // this.errorBlock = true;
            // this.errorHeading = "";
            // this.errorMessage = "Enter data in all required fields";            
        }
    }

    violationPayment(paymentRequest: IViolationPaymentrequest) {
        if (paymentRequest.ViolationProcess == "MakePayment") {
            let userEvents = <IUserEvents>{};
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = paymentRequest.CustomerId;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
            userEvents.FeatureName = Features[Features.TVCPAYMENT];
            userEvents.ActionName = this.getAction(paymentRequest.PaymentMode);
            this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
        }
        this.vioPaymentContextService.changeResponse(paymentRequest);
        this.router.navigate(['/tvc/paymentdetails/verify-violation-payment']);
    }

    allowVioMakePayment() {
        this.isCheckBloackList = false;
        if (this.vioPaymentRequest != null && this.vioPaymentRequest != undefined)
            this.DoViolationPayment(this.vioPaymentRequest)
        else if (this.paymentrequest != null && this.paymentrequest != undefined)
            this.doPayment(this.paymentrequest);
    }

    getAction(paymentMode: PaymentMode): string {
        switch (paymentMode) {
            case PaymentMode.CreditCard:
                return Actions[Actions.CC];
            case PaymentMode.Bank:
                return Actions[Actions.BANK];
            case PaymentMode.Cheque:
                return Actions[Actions.CHEQUE];

            case PaymentMode.MoneyOrder:
                return Actions[Actions.MO];

            case PaymentMode.Cash:
                return Actions[Actions.CASH];

            case PaymentMode.Promo:
                return Actions[Actions.PROMO];
        }
    }

    MakePayment(paymentRequest: IMakePaymentrequest) {
        $('#refund-conf').modal('hide');
        let userEvents = <IUserEvents>{};
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = paymentRequest.CustomerId;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        if (paymentRequest.Description == "MakePayment") {
            userEvents.FeatureName = Features[Features.PAYMENT];
            userEvents.ActionName = this.getAction(paymentRequest.PaymentMode);
            this.paymentService.ValidatePaymentDetailsOnSubmit(paymentRequest).subscribe(
                res => {
                    if (res == "" || res == undefined || res == null) {
                        this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
                        this.createAccountService.changeResponse(paymentRequest);
                        this.router.navigate(['/csc/customerdetails/customer-verify-payment']);
                    }
                    else {
                        this.showMsg("error", res);
                    }
                });
        }
        else {
            paymentRequest.Description = "Create Account Payment";
            paymentRequest.UserName = "tpsuperuser";
            //makepaymentrequest.RevenueCategory = RevenueCategory[this.revenueCategory];

            paymentRequest.AccountIntegration = AccountIntegration.CreateAccount;
            paymentRequest.AccountStatus = AccountStatus.NA;


            userEvents.FeatureName = paymentRequest.FeatureName;
            userEvents.SubFeatureName = SubFeatures[SubFeatures.PAYMENT];
            userEvents.ActionName = Actions[Actions.CREATE];

            this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();

            this.createAccountService.changeResponse(paymentRequest);

            this.router.navigate(['csc/payment/verify-makepayment']);
        }
    }

    checkApplicationParameterStatus() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTax).subscribe(
            res => this.ccServiceTax = res
        );
    }

    getApplicationParameterValue() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTaxInd).subscribe(
            res => this.checkServiceTax = (res == "1" ? true : false)
        );
    }

    checkBlockList() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CheckBlockList).subscribe(
            res => this.isCheckBloackList = res
        );
    }

    setCustomerId(customerId: number, defaultPaymenthod: string) {
        this.customerid = customerId;
        this.isSaveCheckBox = true;
        if (defaultPaymenthod != undefined && defaultPaymenthod != "") {
            this.changePaymentMethod(defaultPaymenthod);
        }
    }

    changePaymentMethod(paymentMethod: string) {
        this.msgFlag = false;
        this.payMethod = paymentMethod;
        this.replenishmentType = " ";
        if (paymentMethod == "Cash" || paymentMethod == "OldCreditCard" || paymentMethod == "OldBankAccount")
            this.isModesVisisble = false;
        else {
            this.isModesVisisble = true;
            if (this.payMethod == "CreditCard")
                this.paymentDetailsHeading = "Credit Card Details";
            else if (this.payMethod == "ACH")
                this.paymentDetailsHeading = "Bank Account Details";
            else if (this.payMethod == "Cheque")
                this.paymentDetailsHeading = "Check Details";
            else if (this.payMethod == "MO")
                this.paymentDetailsHeading = "Money Order Details";
            else if (this.payMethod == "Promo") {
                this.paymentDetailsHeading = "Promo Details";
                if (this.promoForm != undefined) {
                    this.promoForm.controls["promoCode"].setValue("");
                }
            }
        }
        this.isCreditCardModesVisible = false;
    }

    validateAllFormFields(formGroup: FormGroup) { //{1}
        Object.keys(formGroup.controls).forEach(controlName => { //{2}
            const control = formGroup.get(controlName); //{3}
            if (control instanceof FormControl) { //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) { //{5}
                this.validateAllFormFields(control); //{6}
            }
        });
    }

    getCreditCardBankInformation(makepaymentrequest: IMakePaymentrequest) {
        this.customerid = makepaymentrequest.CustomerId;
        this.replenishmentType = makepaymentrequest.ReplenishmentType.toUpperCase();
        if (makepaymentrequest.PaymentProcess != null && makepaymentrequest.PaymentProcess != '') {
            this.bindDetailsOnBack(makepaymentrequest);
        }
        else {
            this.chequeNumber = " ";
            this.mONumber = " ";
            if (makepaymentrequest.ReplenishmentType.toUpperCase() == "CREDITCARD") {
                this.paymentService.GetCreditCardByAccountId(makepaymentrequest.CustomerId.toString()).subscribe(res => {
                    if (res) {
                        this.creditCardRequest = res;
                        this.bankRequest = <IBankRequest[]>{};
                        this.payMethod = "CreditCard";
                        if (this.creditCardRequest != null && this.creditCardRequest.length > 0) {
                            this.creditCardRequest[0].DefaultFlag = false;
                            this.isCreditCardModesVisible = true;
                        }
                        else {
                            this.isDisbaleNext = true;
                            this.ngOnChanges();
                            this.isCreditCardModesVisible = false;
                            this.paymentDetailsHeading = "Credit Card Details";
                        }
                    }
                });
            }
            else if (makepaymentrequest.ReplenishmentType.toUpperCase() == "ACH") {
                this.paymentService.GetBankByAccountID(makepaymentrequest.CustomerId.toString()).subscribe(res => {
                    if (res) {
                        this.bankRequest = res;
                        this.payMethod = "ACH";
                        this.creditCardRequest = <ICreditCardRequest[]>{};
                        if (this.bankRequest != null && this.bankRequest.length > 0) {
                            this.bankRequest[0].IsDefault = false;
                            this.isCreditCardModesVisible = true;
                        }
                        else {
                            this.isDisbaleNext = true;
                            this.ngOnChanges();
                            this.isCreditCardModesVisible = false;
                            this.paymentDetailsHeading = "Bank Account Details";
                        }
                    }
                });
            }
            else {
                this.payMethod = "Cash";
                this.creditCardRequest = <ICreditCardRequest[]>{};
                this.bankRequest = <IBankRequest[]>{};
                this.isCreditCardModesVisible = true;
            }
        }

    }

    bindDetailsOnBack(makepaymentrequest: any) {

        if (makepaymentrequest.ReplenishmentType != undefined)
            this.replenishmentType = makepaymentrequest.ReplenishmentType;
        else if (makepaymentrequest.PaymentFor != undefined) {
            if (makepaymentrequest.PaymentMode == PaymentMode.CreditCard)
                this.replenishmentType = "CREDITCARD";
            else if (makepaymentrequest.PaymentMode == PaymentMode.Bank)
                this.replenishmentType = "ACH";
            else
                this.replenishmentType = " ";
        }
        else
            this.replenishmentType = " ";
        this.chequeNumber = " ";
        this.mONumber = " ";

        if (makepaymentrequest.PaymentMode == PaymentMode.CreditCard && makepaymentrequest.PaymentProcess != "OldCreditCard") {
            this.payMethod = "CreditCard";
            let ccardRequest = <ICreditCardRequest>{};
            ccardRequest.NameOnCard = makepaymentrequest.CreditCardPayment.NameOnCard;
            ccardRequest.CCNumber = makepaymentrequest.CreditCardPayment.CreditCardNumber;
            ccardRequest.CCType = makepaymentrequest.CreditCardPayment.CreditCardType;
            ccardRequest.ExpDate = (Number)(makepaymentrequest.CreditCardPayment.ExpiryDate);
            ccardRequest.DefaultFlag = makepaymentrequest.IsAddNewCardDetails;
            if (makepaymentrequest.IsNewAddress) {
                ccardRequest.Line1 = makepaymentrequest.CreditCardPayment.Line1;
                ccardRequest.Line2 = makepaymentrequest.CreditCardPayment.Line2;
                ccardRequest.Line3 = makepaymentrequest.CreditCardPayment.Line3;
                ccardRequest.City = makepaymentrequest.CreditCardPayment.City;
                ccardRequest.State = makepaymentrequest.CreditCardPayment.State
                ccardRequest.Country = makepaymentrequest.CreditCardPayment.Country
                ccardRequest.Zip1 = makepaymentrequest.CreditCardPayment.Zip1;
                ccardRequest.Zip2 = makepaymentrequest.CreditCardPayment.Zip2
                ccardRequest.IsPreferred = makepaymentrequest.IsNewAddress;
            }
            let item = [];
            item.push(ccardRequest);
            this.creditCardRequest = item.map(x => Object.assign({}, x));
            this.bankRequest = <IBankRequest[]>{};
        }
        else if (makepaymentrequest.PaymentMode == PaymentMode.Bank && makepaymentrequest.PaymentProcess != "OldBankAccount") {
            this.payMethod = "ACH";
            let objBank = <IBankRequest>{};
            objBank.BankName = makepaymentrequest.BankName;
            objBank.AccName = makepaymentrequest.AccoutName;
            objBank.Accnumber = makepaymentrequest.AccountNumber;
            objBank.MICRCode = makepaymentrequest.BankRoutingNumber;
            objBank.IsDefault = makepaymentrequest.IsAddNewBankDetails;
            let item = [];
            item.push(objBank);
            this.bankRequest = item.map(x => Object.assign({}, x));
            this.creditCardRequest = <ICreditCardRequest[]>{};
        }
        else if (makepaymentrequest.PaymentMode == PaymentMode.Cash) {
            this.payMethod = "Cash";
            this.creditCardRequest = <ICreditCardRequest[]>{};
            this.bankRequest = <IBankRequest[]>{};
        }
        else if (makepaymentrequest.PaymentMode == PaymentMode.Cheque) {
            this.payMethod = "Cheque";
            this.creditCardRequest = <ICreditCardRequest[]>{};
            this.bankRequest = <IBankRequest[]>{};

            this.chequeDate = makepaymentrequest.ChequeDate;
            this.chequeNumber = makepaymentrequest.ChequeNumber;
            this.checkRoutingNumber = makepaymentrequest.CheckRoutingNumber;
        }
        else if (makepaymentrequest.PaymentMode == PaymentMode.MoneyOrder) {
            this.payMethod = "MO";
            this.creditCardRequest = <ICreditCardRequest[]>{};
            this.bankRequest = <IBankRequest[]>{};

            this.mODate = makepaymentrequest.MODate;
            this.mONumber = makepaymentrequest.MONumber;
        }
        else if (makepaymentrequest.PaymentMode == PaymentMode.Promo) {
            this.payMethod = "Promo";
            this.creditCardRequest = <ICreditCardRequest[]>{};
            this.bankRequest = <IBankRequest[]>{};
            this.promoCode = makepaymentrequest.PromoCode;
        }
    }

    ngAfterViewInit() {
        this.promoForm.controls["promoCode"].setValue(this.promoCode);
    }

    promoChnaged(promoCode: string) {
        this.msgFlag = false;
        if (!this.promoForm.valid) {
            this.sendPromoValue.emit();
            return;
        }
        let customerContextResponse: ICustomerContextResponse;;
        this.customerContext.currentContext
            .subscribe(customerContext => {
                customerContextResponse = customerContext;
            }
            );
        if (customerContextResponse != null && customerContextResponse.AccountId > 0) {
            if (customerContextResponse.AccountStatus != AccountStatus[AccountStatus.AC]) {
                this.showMsg("error", "Promo code can be allowed only Active customer");
                this.promoForm.controls["promoCode"].setValue("");
                return;
            }
            else {
                this.paymentService.IsPromoAvailable(promoCode).subscribe(res => {
                    if (res) {
                        this.paymentService.IsPromoAlreadyApplied(customerContextResponse.AccountId, promoCode).subscribe(res => {
                            if (res) {
                                this.showMsg("error", "Entered Promo Code already applied on this account.");
                                this.promoForm.controls["promoCode"].setValue("");
                                this.sendPromoValue.emit();
                                return;
                            }
                            else {
                                this.paymentService.GetPromoFaceValue(promoCode).subscribe(res => {
                                    if (res) {
                                        let promoValue = res;
                                        this.showMsg("success", promoCode + " applied successfully.");
                                        this.sendPromoValue.emit(promoValue);
                                    }
                                });
                            }
                        });
                    }
                    else {
                        this.showMsg("error", "Invalid Promo Code");
                        this.promoForm.controls["promoCode"].setValue("");
                        this.sendPromoValue.emit();
                        return;
                    }
                }
                );
            }
        }
    }

    onSaveClicked($event) {
        if ($event.result == true) {
            this.showMsg("success", $event.msg);
            this.isDisbaleNext = false;
            this.ngOnChanges();
            this.isCreditCardModesVisible = true;
            this.paymentDetailsHeading = "";
        }
        else {
            this.showMsg("error", $event.msg);
        }

    }

    InitialiZeObject(customerId: number) {
        this.creditCardRequest = <ICreditCardRequest[]>{};
        this.bankRequest = <IBankRequest[]>{};
        this.replenishmentType = " ";
        this.chequeNumber = " ";
        this.mONumber = " ";
        this.customerid = customerId;
        this.isSaveCheckBox = false;
    }

    resetclick(customerId: number) {
        this.msgFlag = false;
        this.creditCardRequest = <ICreditCardRequest[]>{};
        this.bankRequest = <IBankRequest[]>{};
        this.replenishmentType = " ";
        this.chequeNumber = " ";
        this.mONumber = " ";
        this.customerid = customerId;
        this.isSaveCheckBox = false;
        if (this.payMethod == "CreditCard") {
            this.creditCardComponent.createForm.reset();
            this.creditCardComponent.createForm.patchValue({ 'CardType': '', 'Month': '', 'Year': '' });
            this.creditCardComponent.addressChange('exist');
        }
        else if (this.payMethod == "ACH")
            this.bankCardComponent.createForm.reset();
        else if (this.payMethod == "Cheque") {
            this.chequeCardComponent.createForm.reset();
            this.chequeCardComponent.createForm.reset();
        }
        else if (this.payMethod == "MO") {
            this.moComponent.createForm.reset();
            this.moComponent.createForm.reset();
        }
        else if (this.payMethod == "Promo")
            this.promoForm.reset();
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

