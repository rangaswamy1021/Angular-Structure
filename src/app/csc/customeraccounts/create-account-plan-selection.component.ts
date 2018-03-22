import { Component, ViewChild, OnInit, ElementRef, Renderer } from '@angular/core';
import { TagService } from "../../tags/services/tags.service";
import { ITagConfigurationResponse } from "../../tags/models/tagsconfigurationresponse";
import { ITagShipmentTypesResponse } from "../../tags/models/tagshipmentsresponse";
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IAddressResponse } from "../../shared/models/addressresponse";
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { ReplenishmentType } from "./constants";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";
import { ICustomerAttributesRequest } from "../customerdetails/models/customerattributesrequest";
import { ActivitySource, SubSystem, Actions, Features, SubFeatures } from "../../shared/constants";
import { ITagsAmountrequest } from "./models/tagsamountrequest";
import { Router, ActivatedRoute } from "@angular/router";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { IAddressRequest } from "../../shared/models/addressrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
    selector: 'app-create-account-plan-selection',
    templateUrl: './create-account-plan-selection.component.html'
})
export class CreateAccountPlanSelectionComponent implements OnInit {
    disableButton: boolean;
    msgDesc: string;
    msgType: string;
    msgFlag: boolean;
    customerId: number = 0
    planId: number
    //getDefaultAddrsResponse: IAddressResponse[];
    plansResponse: IPlanResponse[] = <IPlanResponse[]>{}
    common: any;
    states: ICommonResponse[];
    countries: any;
    shipmentTypes: ITagShipmentTypesResponse[];
    tagconfigs: ITagConfigurationResponse[];
    isVehicleTag: boolean
    cashReplnAmt: number = 0
    creditCardReplnAmt: number = 0
    bankReplnAmt: number = 0
    cashLowBalAmt: number = 0
    creditCardLowBalAmt: number = 0
    bankLowBalAmt: number = 0
    cashThresAmt: number = 0
    creditCardThresAmt: number = 0
    bankThresAmt: number = 0
    tagsCount: number = 0;
    tollBalance: number = 0
    totalTagDeposit: number = 0
    totalFee: number = 0
    totalAmount: number = 0
    totalTagFee: number = 0
    totalShippingCharge: number = 0
    totalServiceTax: number = 0
    revenueCategory: string
    shipmentServiceId: number
    tollTypes = []
    feesOfPlan = []
    tagPurchaseMethod = []
    tagsArrayCount = []
    customerInfo = []
    accountType: string;
    isServiceTax: boolean;
    serviceTax: number;
    isCCServiceTax: boolean;
    ccServiceTax: number;
    replenishType: string;
    purchaseMethod: string;
    isTagRequired: boolean;
    isAllowNonRevenuePayments: boolean;
    maxNonRevenueTagsCount: number;
    sessionContextResponse: IUserresponse
    userName: string
    userId: number
    loginId: number
    isAddressEnable: boolean
    addressResponse: IAddressResponse;
    makePaymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{}
    @ViewChild(AddAddressComponent) addComponent
    constructor(private commonService: CommonService, private tagService: TagService, private customerService: CustomerAccountsService,
        private router: Router, private route: ActivatedRoute, private createAccountService: CreateAccountService, public renderer: Renderer,
        private sessionService: SessionService, private materialscriptService: MaterialscriptService) { }

    ngOnInit() {
        this.materialscriptService.material();
        $('#pageloader').modal('show');
        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }
        var userID = localStorage.getItem('UserDeatils').split(',');
        this.userName = userID[0];
        this.userId = parseInt(userID[1]);
        this.loginId = parseInt(userID[2]);
        this.createAccountService.currentContext.subscribe(context => {
            this.makePaymentRequest = context;
            if (this.makePaymentRequest != null)
                this.customerId = this.makePaymentRequest.CustomerId;
        })
        if (this.makePaymentRequest == null) {
            let link = ['/csc/customeraccounts/create-account-personal-information/'];
            this.router.navigate(link);
        }
        //console.log(this.customerId);
        //this.customerId = 10258265;
        this.replenishType = ReplenishmentType[ReplenishmentType.CreditCard].toUpperCase();
        //this.accountType = "POSTPAID";
        //this.revenueCategory = "REVENUE";
        this.getApplicationParameterKeys();

        this.tagService.getActiveTagConfigurations().subscribe(res => {
            this.tagconfigs = res;
            for (var i = 0; i < this.tagconfigs.length; i++) {
                this.tagconfigs[i].Tagcount = 0;
            }
        });
        this.disableButton = !this.commonService.isAllowed(this.makePaymentRequest.FeatureName, Actions[Actions.CREATE], SubFeatures[SubFeatures.PLANSELECTION]);
        this.commonService.getTransponderPurchaseMethod().subscribe(res => { this.tagPurchaseMethod = res; this.purchaseMethod = this.tagPurchaseMethod[0].Key });
        this.customerService.getRevenueCategorybyAccountId(this.customerId).subscribe(res => {
            if (res != null) {
                this.revenueCategory = res.RevenueCategory;
                this.customerService.getTollTypes().subscribe(res => {
                    this.tollTypes = res;
                    // if (this.revenueCategory.toUpperCase() == "NONREVENUE") {
                    //     this.tollTypes = this.tollTypes.filter(x => x.Key == "PREPAID");
                    //     this.accountType = this.tollTypes[0].Value;
                    // }
                    this.commonService.getPlanByCustomerId(this.customerId).subscribe(res => {
                        if (res != null && res.length > 0) {
                            this.planId = res[0].PlanId;
                            this.accountType = res[0].ParentPlanName.toUpperCase();
                            this.calculateTollBalance(this.accountType);
                            this.customerService.getAllPlansWithFees().subscribe(res => {
                                this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == this.accountType.toUpperCase());
                                this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsSelected = true;
                                this.isTagRequired = this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsTagRequired;
                                this.bindFees(this.plansResponse.filter(x => x.PlanId == this.planId)[0]);
                            });
                            this.populateCustomerPlan();

                        }
                        else {
                            this.accountType = this.tollTypes[0].Value.toUpperCase();
                            this.bindPlansData(this.accountType);
                            this.calculateTollBalance(this.accountType);
                        }
                    })
                });
            }
        });
        $('#pageloader').modal('hide');
    }

    populateCustomerPlan() {
        this.customerService.getCustomerCreateAccountProcessInfo(this.customerId).subscribe(res => {
            debugger;
            this.customerInfo = res
            if (this.customerInfo != null && this.customerInfo.length > 0) {
                this.replenishType = this.customerInfo[0].ReplenishmentType;
                this.tollBalance = this.customerInfo[0].TollFee;
                this.totalTagFee = this.customerInfo[0].TotalTagFee;
                this.totalTagDeposit = this.customerInfo[0].TotalTagDeposit;
                this.totalFee = this.customerInfo[0].TotalFee;
                this.totalServiceTax = this.customerInfo[0].TotalServiceTax;
                this.totalShippingCharge = this.customerInfo[0].TotalShippingCharge;
                this.planId = this.customerInfo[0].PlanId;
                this.purchaseMethod = this.customerInfo[0].TransponderDeliveryMethod;
                this.shipmentServiceId = this.customerInfo[0].TagDeliveryMethod;
                this.onPurchaseMethodChange(this.purchaseMethod);
                for (var i = 0; i < this.tagconfigs.length; i++) {
                    this.tagconfigs[i].Tagcount = 0;
                }
                this.customerInfo.forEach(x => {
                    this.tagconfigs.filter(y => y.Mounting == x.Mounting && y.Protocol == x.Protocol)[0].Tagcount = x.TagCount;
                    this.tagsArrayCount.push(this.tagconfigs.filter(y => y.Mounting == x.Mounting && y.Protocol == x.Protocol)[0]);
                    this.tagsCount += x.TagCount;
                })
                if (this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST" && this.customerInfo[0].IsNewShippingAddress) {
                    var addressResponse = <IAddressResponse>{};
                    addressResponse.Line1 = this.customerInfo[0].ShipmentAddressLine1;
                    addressResponse.Line2 = this.customerInfo[0].ShipmentAddressLine2;
                    addressResponse.Line3 = this.customerInfo[0].ShipmentAddressLine3;
                    addressResponse.City = this.customerInfo[0].ShipmentCity;
                    addressResponse.State = this.customerInfo[0].ShipmentState;
                    addressResponse.Country = this.customerInfo[0].ShipmentCountry;
                    addressResponse.Zip1 = this.customerInfo[0].ShipmentZip1;
                    addressResponse.Zip2 = this.customerInfo[0].ShipmentZip2;
                    this.addressResponse = addressResponse;
                    this.isAddressEnable = this.customerInfo[0].IsNewShippingAddress;
                    //objCreateinfo.TagDeliveryMethod = this.shipmentServiceId > 0 ? this.shipmentServiceId.toString() : "0";
                }
            }
        });
    }

    getTollTypes(category) {
        this.customerService.getTollTypes().subscribe(res => {
            this.tollTypes = res;
            // if (category == "NONREVENUE")
            //     this.tollTypes = this.tollTypes.filter(x => x.Key == "PREPAID");
        });
    }
    onTagConfigChange(tagconfig: ITagConfigurationResponse, tagcount: number) {
        if (this.revenueCategory.toUpperCase() == "NONREVENUE") {
            var count = this.tagsCount;
            if (this.tagsArrayCount.filter(x => x.Mounting == tagconfig.Mounting && x.Protocol == tagconfig.Protocol).length > 0) {
                count -= this.tagsArrayCount.filter(x => x.Mounting == tagconfig.Mounting && x.Protocol == tagconfig.Protocol)[0].Tagcount;
            }
            if ((count + parseInt(tagcount.toString())) > this.maxNonRevenueTagsCount) {
                this.tagconfigs.forEach(x => x.Tagcount = 0);
                this.totalTagFee = 0;
                this.totalTagDeposit = 0;
                this.totalServiceTax = 0;
                this.tagsCount = 0;
                this.tagsArrayCount = [];
                this.msgFlag = true;
                this.msgType = 'error'
                this.msgDesc = "Maximum allowed Tags for Non-Revenue customer are " + this.maxNonRevenueTagsCount;
                return;
            }
        }
        if (this.tagsArrayCount.length > 0) {
            if (this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting).length > 0) {
                this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting)[0].Tagcount = tagcount
            }
            else {
                tagconfig.Tagcount = tagcount;
                this.tagsArrayCount.push(tagconfig);
            }
        }
        else {
            tagconfig.Tagcount = tagcount;
            this.tagsArrayCount.push(tagconfig);
        }

        this.calculateTagDespositandTagBal(this.tagsArrayCount);
        this.calculateAmounts();
        if (this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST") {
            this.totalShippingCharge = this.shipmentTypes.filter(x => x.IsSelected == true)[0].Cost * this.tagsCount;
        }
    }
    planChange(plan) {
        this.planId = plan.PlanId;
        this.isTagRequired = plan.IsTagRequired;
        this.accountType = plan.ParentPlanCode.toUpperCase();
        this.calculateTollBalance(this.accountType);
        this.bindFees(plan);
        if (!this.isTagRequired) {
            this.totalTagFee = 0;
            this.totalTagDeposit = 0;
            this.totalShippingCharge = 0;
            this.totalServiceTax = 0;
            this.tagsArrayCount = [];
            this.tagconfigs.forEach(x => {
                if (x.Tagcount > 0) {
                    x.Tagcount = 0
                }
            })
        }
    }

    bindFees(plan: IPlanResponse) {
        this.customerService.getFeesbasedonPlanId(plan.PlanId).subscribe(res => this.feesOfPlan = res);
        this.totalFee = parseInt(plan.TotalFee);
    }
    getApplicationParameterKeys() {
        var card = 0; var cash = 0; var bank = 0;
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsVehicleTags).subscribe(res => this.isVehicleTag = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CashReplnAmt).subscribe(res => this.cashReplnAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CreditCardReplnAmt).subscribe(res => this.creditCardReplnAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ACHReplnAmt).subscribe(res => this.bankReplnAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsAllowNonRevenuePayments).subscribe(res => this.isAllowNonRevenuePayments = res == "1" ? true : false);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxTagCountforNonRevenue).subscribe(res => this.maxNonRevenueTagsCount = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsServiceTax).subscribe(res => this.isServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ServiceTax).subscribe(res => this.serviceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTaxInd).subscribe(res => this.isCCServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTax).subscribe(res => this.ccServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CashLowBalAmt).subscribe(res => this.cashLowBalAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CreditCardLowBalAmt).subscribe(res => this.creditCardLowBalAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ACHLowBalAmt).subscribe(res => this.bankLowBalAmt = res);
        // Observable.forkJoin(
        //     this.commonService.getApplicationParameterValue(ApplicationParameterkey.CashThreshAmt),
        //     this.commonService.getApplicationParameterValue(ApplicationParameterkey.CreditCardReplnAmt),
        //     this.commonService.getApplicationParameterValue(ApplicationParameterkey.ACHReplnAmt),
        // ).subscribe(response => {
        //     this.cashThresAmt = <any>response[0];
        //     this.creditCardThresAmt = <any>response[1];
        //     this.bankThresAmt = <any>response[2];
        //     this.calculateTollBalance(this.bankThresAmt, this.creditCardThresAmt, this.cashThresAmt);
        // })
        // console.log(this.bankThresAmt,this.creditCardThresAmt,this.cashThresAmt);
    }
    onServiceTypeChange(service: ITagShipmentTypesResponse) {
        this.shipmentServiceId = service.ServiceTypeId;
        this.totalShippingCharge = service.Cost * this.tagsCount;
    }

    onReplenishTypeChange(replenishtype) {
        this.replenishType = replenishtype.toUpperCase();
        this.calculateTollBalance(this.accountType);
    }
    onPurchaseMethodChange(methodType: string) {
        let b = this;
        setTimeout(function () {
            b.materialscriptService.material();
        }, 1000);
        this.purchaseMethod = methodType;
        if (methodType.toUpperCase() == "SHIPMENTBYPOST") {
            this.tagService.getShipmentServiceTypes().subscribe(res => {
                this.shipmentTypes = res;
                if (this.customerInfo != null && this.customerInfo.length > 0 && this.shipmentServiceId > 0) {
                    if (this.shipmentTypes.filter(x => x.ServiceTypeId == this.shipmentServiceId).length > 0) {
                        this.shipmentTypes.filter(x => x.ServiceTypeId == this.shipmentServiceId)[0].IsSelected = true;
                        this.onServiceTypeChange(this.shipmentTypes.filter(x => x.ServiceTypeId == this.shipmentServiceId)[0]);
                    }
                }
                else {
                    this.shipmentTypes[0].IsSelected = true;
                    this.onServiceTypeChange(this.shipmentTypes[0]);
                }

                //this.shipmentServiceId = this.shipmentTypes[0].ServiceTypeId;
            });
        }
        else {
            this.shipmentTypes = [];
            this.totalShippingCharge = 0;
            this.shipmentServiceId = 0;
        }

    }

    bindPlansData(tollType: string) {
        this.accountType = tollType.toUpperCase();
        this.customerService.getAllPlansWithFees().subscribe(res => {
            this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == tollType.toUpperCase());
            this.plansResponse[0].IsSelected = true;
            this.isTagRequired = this.plansResponse[0].IsTagRequired;
            this.totalTagFee = 0;
            this.totalTagDeposit = 0;
            this.totalShippingCharge = 0;
            this.totalServiceTax = 0;
            this.tagsArrayCount = [];
            this.tagsCount=0;
            this.tagconfigs.forEach(x => {
                x.Tagcount = 0
            })
            this.planId = this.plansResponse[0].PlanId;
            this.bindFees(this.plansResponse[0]);
        });
        this.calculateTollBalance(this.accountType);
    }

    bindShipmentTypes(deliveryType: string) {
        if (deliveryType == "SHIPMENTBYPOST")
            this.tagService.getShipmentServiceTypes().subscribe(res => this.shipmentTypes = res);
    }

    calculateTagDespositandTagBal(tagArray) {
        this.tagsCount = 0;
        this.totalTagFee = 0; this.totalTagDeposit = 0;
        if ((!this.isAllowNonRevenuePayments && this.revenueCategory.toUpperCase() == "NONREVENUE")) {
            this.totalTagFee = 0; this.totalTagDeposit = 0;
            tagArray.forEach(x => {
                this.tagsCount += parseInt(x.Tagcount == "" ? "0" : x.Tagcount);
            })
            // this.tagsArrayCount = [];
            // this.tagconfigs.forEach(x => x.Tagcount = 0);
            return;
        }
        if (tagArray.length > 0) {
            tagArray.forEach(x => {
                var count = parseInt(x.Tagcount == "" ? "0" : x.Tagcount);
                var fee = parseFloat(x.TagFee);
                var deposit = parseFloat(x.TagDeposit);
                var totalfee = count * fee;
                var totaldep = count * deposit;
                this.tagsCount += count;
                this.totalTagFee += totalfee;
                this.totalTagDeposit += totaldep;
            })
        }
    }
    calculateTollBalance(tollType: string) {
        if (tollType.toUpperCase() == "PREPAID" && this.revenueCategory.toUpperCase() == "REVENUE") {
            if (this.creditCardThresAmt <= 0) {
                Observable.forkJoin(
                    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CashThreshAmt),
                    this.commonService.getApplicationParameterValue(ApplicationParameterkey.CreditCardThreshAmt),
                    this.commonService.getApplicationParameterValue(ApplicationParameterkey.ACHThreshAmt),
                ).subscribe(response => {
                    this.cashThresAmt = <any>response[0];
                    this.creditCardThresAmt = <any>response[1];
                    this.bankThresAmt = <any>response[2];
                    if (this.replenishType == ReplenishmentType[ReplenishmentType.CreditCard].toUpperCase())
                        this.tollBalance = parseInt(this.creditCardThresAmt.toString());
                    else if (this.replenishType == ReplenishmentType[ReplenishmentType.ACH].toUpperCase())
                        this.tollBalance = parseInt(this.bankThresAmt.toString());
                    else if (this.replenishType == ReplenishmentType[ReplenishmentType.Cash].toUpperCase())
                        this.tollBalance = parseInt(this.cashThresAmt.toString());
                })
            }
            if (this.replenishType == ReplenishmentType[ReplenishmentType.CreditCard].toUpperCase())
                this.tollBalance = parseInt(this.creditCardThresAmt.toString());
            else if (this.replenishType == ReplenishmentType[ReplenishmentType.ACH].toUpperCase())
                this.tollBalance = parseInt(this.bankThresAmt.toString());
            else if (this.replenishType == ReplenishmentType[ReplenishmentType.Cash].toUpperCase())
                this.tollBalance = parseInt(this.cashThresAmt.toString());
        }
        else {
            this.tollBalance = 0;
        }
    }
    addressChange(addressType) {
        let a = this;
        setTimeout(function () {
            a.materialscriptService.material();
        }, 1000);
        if (addressType == "exist") {
            this.isAddressEnable = false;
            this.addressResponse = <IAddressResponse>{};


        }
        else {
            this.isAddressEnable = true;
            if (this.addressResponse == null) {
                this.addComponent.addAddressForm.reset();
            }
        }

    }

    calculateAmounts() {
        if (this.isServiceTax)
            this.totalServiceTax = this.totalTagFee * (this.serviceTax / 100);
    }

    onSubmit() {
        if (this.isTagRequired && this.tagsCount <= 0) {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = "Enter atleast one tag request.";
            return;
        }
        var objcustomer: ICustomerAttributesRequest = <ICustomerAttributesRequest>{}
        objcustomer.AccountId = this.customerId;
        objcustomer.PlanId = this.planId;
        objcustomer.RevenueCategory = this.revenueCategory;
        objcustomer.UpdatedUser = this.userName;//this.sessionContextResponse.UserName;
        objcustomer.ActivitySource = ActivitySource.Internal;
        objcustomer.SubSystem = SubSystem.CSC;
        objcustomer.TranponderPurchasemethod = this.purchaseMethod;
        //objcustomer.AutoReplenishmentType = ReplenishmentType[this.replenishType];
        if (this.replenishType == ReplenishmentType[ReplenishmentType.CreditCard].toUpperCase()) {
            objcustomer.ThresholdAmount = this.creditCardThresAmt;
            objcustomer.CalculatedReBillAmount = this.creditCardReplnAmt;
            objcustomer.LowBalanceAmount = this.creditCardLowBalAmt;
            objcustomer.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.CreditCard];
        }
        if (this.replenishType == ReplenishmentType[ReplenishmentType.ACH].toUpperCase()) {
            objcustomer.ThresholdAmount = this.cashThresAmt;
            objcustomer.CalculatedReBillAmount = this.cashReplnAmt;
            objcustomer.LowBalanceAmount = this.bankLowBalAmt;
            objcustomer.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.ACH];
        }
        if (this.replenishType == ReplenishmentType[ReplenishmentType.Cash].toUpperCase()) {
            objcustomer.ThresholdAmount = this.cashThresAmt;
            objcustomer.CalculatedReBillAmount = this.cashReplnAmt;
            objcustomer.LowBalanceAmount = this.cashLowBalAmt;
            objcustomer.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.Cash];
        }
        objcustomer.UserId = this.userId;//this.sessionContextResponse.userId;
        objcustomer.LoginId = this.loginId;//this.sessionContextResponse.loginId;
        objcustomer.IsCreateAccountUserActivity = true;
        objcustomer.IsTagRequired = this.isTagRequired;
        objcustomer.IsPostPaidCustomer = this.accountType == "POSTPAID" ? true : false;
        this.tagsArrayCount = this.tagsArrayCount.filter(x => x.Tagcount > 0);
        var objCreateCustomerInfo = [];
        if (!this.isTagRequired) {
            var objCreateinfo = <ITagsAmountrequest>{}
            objCreateinfo.CustomerId = this.customerId;
            objCreateinfo.PlanId = this.planId;
            objCreateinfo.ReplenishmentType = this.replenishType.toUpperCase();
            objCreateinfo.RevenueCategory = this.revenueCategory;
            objCreateinfo.TransponderDeliveryMethod = this.purchaseMethod;
            objCreateinfo.TollFee = this.tollBalance;
            objCreateinfo.TotalFee = this.totalFee;
            objCreateinfo.TotalTagFee = this.totalTagFee;
            objCreateinfo.TotalTagDeposit = this.totalTagDeposit;
            objCreateinfo.TotalServiceTax = this.totalServiceTax;
            objCreateinfo.TotalShippingCharge = this.totalShippingCharge;
            objCreateCustomerInfo.push(objCreateinfo);
        }
        else {
            for (var i = 0; i < this.tagsArrayCount.length; i++) {
                var objCreateinfo = <ITagsAmountrequest>{}
                objCreateinfo.CustomerId = this.customerId;
                objCreateinfo.PlanId = this.planId;
                objCreateinfo.ReplenishmentType = this.replenishType.toUpperCase();
                objCreateinfo.RevenueCategory = this.revenueCategory;
                objCreateinfo.TransponderDeliveryMethod = this.purchaseMethod;
                objCreateinfo.TollFee = this.tollBalance;
                objCreateinfo.TotalFee = this.totalFee;
                objCreateinfo.TotalTagFee = this.totalTagFee;
                objCreateinfo.TotalTagDeposit = this.totalTagDeposit;
                objCreateinfo.TotalServiceTax = this.totalServiceTax;
                objCreateinfo.TotalShippingCharge = this.totalShippingCharge;

                if (this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST") {
                    objCreateinfo.TagDeliveryMethod = this.shipmentServiceId > 0 ? this.shipmentServiceId.toString() : "0";
                    objCreateinfo.ShipmentAddressLine1 = this.addComponent.addAddressForm.controls["addressLine1"].value;
                    objCreateinfo.ShipmentAddressLine2 = this.addComponent.addAddressForm.controls["addressLine2"].value;
                    objCreateinfo.ShipmentAddressLine3 = this.addComponent.addAddressForm.controls["addressLine3"].value;
                    objCreateinfo.ShipmentCity = this.addComponent.addAddressForm.controls["addressCity"].value;
                    objCreateinfo.ShipmentState = this.addComponent.addAddressForm.controls["addressStateSelected"].value;
                    objCreateinfo.ShipmentCountry = this.addComponent.addAddressForm.controls["addressCountrySelected"].value;
                    objCreateinfo.ShipmentZip1 = this.addComponent.addAddressForm.controls["addressZip1"].value;
                    objCreateinfo.ShipmentZip2 = this.addComponent.addAddressForm.controls["addressZip2"].value;
                    objCreateinfo.IsNewShippingAddress = this.isAddressEnable ? "true" : "false";
                }
                else {
                    objCreateinfo.ShipmentAddressLine1 = "";
                    objCreateinfo.ShipmentAddressLine2 = "";
                    objCreateinfo.ShipmentAddressLine3 = "";
                    objCreateinfo.ShipmentCity = "";
                    objCreateinfo.ShipmentState = "";
                    objCreateinfo.ShipmentCountry = "";
                    objCreateinfo.ShipmentZip1 = "";
                    objCreateinfo.ShipmentZip2 = "";
                    objCreateinfo.IsNewShippingAddress = "";
                }
                objCreateinfo.Protocol = this.tagsArrayCount[i].Protocol;
                objCreateinfo.Mounting = this.tagsArrayCount[i].Mounting;
                objCreateinfo.TagCount = this.tagsArrayCount[i].Tagcount;
                objCreateinfo.TagFee = this.tagsArrayCount[i].TagFee;
                objCreateinfo.TagDeposit = this.tagsArrayCount[i].TagDeposit;
                objCreateCustomerInfo.push(objCreateinfo);
            }
        }

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = this.makePaymentRequest.FeatureName; //Features[Features.ICNASSIGN];
        userEvents.SubFeatureName = SubFeatures[SubFeatures.PLANSELECTION];
        userEvents.ActionName = Actions[Actions.CREATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;

        this.customerService.updateCustomerAttributes(objcustomer, userEvents).subscribe(res => {
            if (res) {
                this.customerService.insertCustomerCreateAccountProcessInfo(objCreateCustomerInfo).subscribe(
                    res => {
                        this.makePaymentRequest.PlanID = this.planId;
                        this.makePaymentRequest.IsPostpaidCustomer = this.accountType.toUpperCase() == "POSTPAID" ? true : false;
                        this.makePaymentRequest.TxnAmount = (this.tollBalance + this.totalFee + this.totalTagFee + this.totalTagDeposit + this.totalShippingCharge + this.totalServiceTax);
                        this.createAccountService.changeResponse(this.makePaymentRequest);

                        let link = ['/csc/customeraccounts/create-account-vehicle-information/'];
                        this.router.navigate(link);
                    }, err => {
                        this.msgFlag = true;
                        this.msgType = 'error'
                        this.msgDesc = err.statusText;
                        return;
                    }
                );
            }
        },
            err => {
                this.msgFlag = true;
                this.msgType = 'error'
                this.msgDesc = err.statusText;
                return;
            });
    }
    onPrevious() {
        let link = ['/csc/customeraccounts/create-account-personal-information/'];
        this.router.navigate(link);
        let a = this;
        setTimeout(function () {
            a.materialscriptService.material();
        }, 100);
    }

    onCancel() {
        this.msgFlag = true;
        this.msgType = 'alert'
        this.msgDesc = "Your Information no longer exists, if you cancel your application.\n Are you sure you want to Cancel?";
    }

    userAction(event) {
        if (event) {
            this.cancelClick();
        }
    }

    cancelClick() {
        let link = ['/csc/customeraccounts/create-account-personal-information/'];
        this.router.navigate(link);
        this.makePaymentRequest.CustomerId = 0;
        this.createAccountService.changeResponse(this.makePaymentRequest);
    }

    setOutputFlag(e) {
        this.msgFlag = e;
    }
}
