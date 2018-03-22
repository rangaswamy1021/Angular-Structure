import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { TagService } from "../../tags/services/tags.service";
import { ITagConfigurationResponse } from "../../tags/models/tagsconfigurationresponse";
import { ITagShipmentTypesResponse } from "../../tags/models/tagshipmentsresponse";
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IAddressResponse } from "../../shared/models/addressresponse";
import { CustomerAccountsService } from "../customeraccounts/services/customeraccounts.service";
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { ReplenishmentType } from "../customeraccounts/constants";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/forkJoin";
import { ActivitySource, SubSystem, TollType, Features, Actions } from "../../shared/constants";
import { Router, ActivatedRoute } from "@angular/router";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { AccountStatus } from "../../payment/constants";
import { StatementCycle } from "../customeraccounts/customer-preferences.component";
import { IinvoiceResponse } from "../../sac/plans/models/invoicecycleresponse";
import { CustomerserviceService } from "./services/customerservice.service";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IPlanRequests } from "./models/planrequests";
import { ITagRequest } from "./models/tagrequest";
import { IAddressRequest } from "../../payment/models/addressrequest";
import { TagRequestType } from "./constants";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { PlansService } from "../../sac/plans/services/plans.service";
import { customDateFormatPipe } from "../../shared/pipes/convert-date.pipe";
import { CurrencyPipe } from "@angular/common";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
    selector: 'app-change-of-plan',
    templateUrl: './change-of-plan.component.html',
    styleUrls: ['./change-of-plan.component.scss']
})
export class ChangeOfPlanComponent implements OnInit, AfterViewInit {
    msgFlag: boolean;
    msgType: string;
    msgDesc: string;
    customerId: number = 0
    planId: number;
    isDisabledSubmit: boolean = false;
    isDisableSatement: boolean = false;
    planResponse: IPlanResponse;
    //getDefaultAddrsResponse: IAddressResponse[];
    plansResponse: IPlanResponse[] = <IPlanResponse[]>{};
    currentPlan: IPlanResponse = <IPlanResponse>{};
    common: any;
    states: ICommonResponse[];
    countries: any;
    shipmentTypes: ITagShipmentTypesResponse[];
    tagconfigs: ITagConfigurationResponse[];
    objStatementCycle: StatementCycle[];
    isChangeOfPlanAllowed: boolean = false;
    isPlanBased: number = 0;
    noOfDaystoPlanChnage: number;
    isVehicleTag: boolean
    tagsCount: number = 0;
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
    requestedPlans = []
    invoiceTypes: IinvoiceResponse[];
    invoiceTotalTypes: IinvoiceResponse[];
    tagPurchaseMethod = []
    tagsArrayCount = []
    customerInfo = []
    accountType: string
    isServiceTax: boolean
    serviceTax: number
    scheduleDays = new Array();
    isPostpaidCustomer: boolean = false;
    purchaseMethod: string
    isTagRequired: boolean
    isAllowNonRevenuePayments: boolean
    sessionContextResponse: IUserresponse
    userName: string
    userId: number
    loginId: number
    isAddressEnable: boolean
    planDesc: string;
    name: string;
    feeDesc: string;
    makePaymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{}
    @ViewChild(AddAddressComponent) addComponent;
    customerContextResponse: ICustomerContextResponse;
    prefrenecesForm: FormGroup;
    isInvoiceAmountTextfeild: boolean = false;
    isInvoiceDayFeild: boolean = false;

    ngSatamentCycle: string;
    ngInvoiceIntrervalType: number = 2;

    ngInvoiceScheduleDay: number = 1;
    constructor(private currencyPipe: CurrencyPipe, private customDateFormatPipe: customDateFormatPipe, private commonService: CommonService, private tagService: TagService, private customerService: CustomerAccountsService,
        private router: Router, private route: ActivatedRoute, private createAccountService: CreateAccountService,
        private sessionService: SessionService, private customerContext: CustomerContextService, private customerserviceService: CustomerserviceService, private customerAccountsService: CustomerAccountsService, private planService: PlansService,
        private materialscriptService: MaterialscriptService) { }

    ngOnInit() {
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }

        this.customerContext.currentContext
            .subscribe(customerContext => {
                this.customerContextResponse = customerContext;
            }
            );

        if (this.customerContextResponse != null && this.customerContextResponse.AccountId > 0) {
            this.customerId = this.customerContextResponse.ParentId > 0 ? this.customerContextResponse.ParentId : this.customerContextResponse.AccountId;
            this.isPostpaidCustomer = this.customerContextResponse.AccountType.toUpperCase() == "POSTPAID" ? true : false;
        }

        this.prefrenecesForm = new FormGroup({
            'invoiceTypeInterval': new FormControl('', [Validators.required]),
            'statementCycle': new FormControl(''),
            'invoiceAmountTextbox': new FormControl(''),
            'invoiceScheduleDay': new FormControl('')
        });

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CHANGEOFPLAN];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = this.customerId;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;



        this.getApplicationParameterKeys();
        this.tagService.getActiveTagConfigurations().subscribe(
            res => {
                this.tagconfigs = res
            }
        );

        this.getInvoiceCycle();
        this.getInvoiceDay();
        this.commonService.getTransponderPurchaseMethod().subscribe(res => {
            this.tagPurchaseMethod = res; this.purchaseMethod = this.tagPurchaseMethod[0].Key
        });

        this.customerAccountsService.getStatementCycle().subscribe(res => {
            this.objStatementCycle = res
        });

        this.customerserviceService.getRequestedPlanDetails(this.customerId).subscribe(res => {
            this.requestedPlans = res
        });

        this.customerService.getRevenueCategorybyAccountId(this.customerId).subscribe(res => {
            if (res != null) {
                this.revenueCategory = res.RevenueCategory;
                // if (this.revenueCategory.toUpperCase() == "NONREVENUE") {
                //     this.showMsg("error", "This operation is not allowed for Non Revenue account");
                //     this.isDisabledSubmit = true;
                // }
                this.customerService.getTollTypes().subscribe(res => {
                    this.tollTypes = res;
                    if (this.revenueCategory.toUpperCase() == "NONREVENUE")
                        this.tollTypes = this.tollTypes.filter(x => x.Key == "PREPAID");
                    this.commonService.getPlanByCustomerId(this.customerId).subscribe(respo => {
                        if (respo != null && respo.length > 0) {
                            this.planId = respo[0].PlanId;
                            this.accountType = respo[0].ParentPlanName.toUpperCase();
                            this.customerService.getAllPlansWithFees().subscribe(res => {
                                this.customerserviceService.getCustomerData(this.customerId).subscribe(
                                    custRespo => {

                                        this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == this.accountType.toUpperCase());
                                        this.currentPlan = respo[0];
                                        this.currentPlan.InvoiceIntervalId = custRespo.InvoiceIntervalID;
                                        let plan: any = this.plansResponse.filter(x => x.PlanId == this.planId)[0];
                                        this.planDesc = plan.Desc;
                                        this.name = plan.Name;
                                        this.feeDesc = plan.FeeDesc;
                                        plan.IsSelected = true;
                                        plan.InvoiceIntervalId = custRespo.InvoiceIntervalID;
                                        this.isTagRequired = plan.IsTagRequired;
                                        this.bindFees(plan);
                                    }
                                );
                            });

                            //this.populateCustomerPlan();
                        }
                        else {
                            this.accountType = this.tollTypes[0].Value.toUpperCase();
                            this.bindPlansData(this.accountType);
                        }
                    });
                });
            }
        });
        if (!this.isDisabledSubmit)
            this.isDisabledSubmit = !this.commonService.isAllowed(Features[Features.CHANGEOFPLAN], Actions[Actions.UPDATE], this.customerContextResponse.AccountStatus);
    }

    ngAfterViewInit() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsChangeOfPlanAllowed).subscribe(
            res => {
                this.isChangeOfPlanAllowed = res;
                if (this.isChangeOfPlanAllowed == false) {
                    this.showMsg("error", "Conversion of account type is not allowed");
                    this.isDisabledSubmit = true;
                }
                else if (this.customerContextResponse.AccountStatus != AccountStatus[AccountStatus.AC]) {
                    this.showMsg("error", "Only Active status Customer can be allowed to change current plan");
                    this.isDisabledSubmit = true;
                }
            });

        this.customerService.getRevenueCategorybyAccountId(this.customerId).subscribe(res => {
            if (res != null) {
                this.revenueCategory = res.RevenueCategory;
                if (this.revenueCategory.toUpperCase() == "NONREVENUE") {
                    this.showMsg("error", "This operation is not allowed for Non Revenue account");
                    this.isDisabledSubmit = true;
                }
            }
        });
    }

    getStatementValues(plan: IPlanResponse) {
        if (this.isPlanBased) {
            this.planService.getPlanByPK(plan.PlanId.toString()).subscribe(
                res => {
                    if (res) {
                        this.planResponse = <IPlanResponse>res;

                        this.isDisableSatement = true;
                        if (this.planResponse.StatementCycle != "" && this.planResponse.StatementCycle != null)
                            this.ngSatamentCycle = this.planResponse.StatementCycle;
                        else {
                            this.ngSatamentCycle = "";
                        }
                    }
                    else {
                        this.isDisableSatement = false;
                    }
                });
        }
        else
            this.isDisableSatement = false;
    }

    getInvoiceInterval(invoceInterval: number) {
        this.invoiceTypes = this.invoiceTotalTypes;
        if (invoceInterval == 1) {
            this.ngInvoiceIntrervalType = 1;
            this.prefrenecesForm.controls["invoiceTypeInterval"].disable(true);
        }
        else {
            this.invoiceTypes = this.invoiceTotalTypes.filter(x => x.CycleID != 1);
            this.ngInvoiceIntrervalType = invoceInterval;
            this.prefrenecesForm.controls["invoiceTypeInterval"].enable(true);
        }
        if (invoceInterval == 2) {
            this.isInvoiceAmountTextfeild = true;
            this.isInvoiceDayFeild = false;
            //this.prefrenecesForm.controls["invoiceAmountTextbox"].setValue("");
            this.prefrenecesForm.addControl('invoiceAmountTextbox', new FormControl('', [Validators.required]));
            this.isValidInput();
        }
        else if (invoceInterval == 5) {
            this.isInvoiceDayFeild = true;
            this.isInvoiceAmountTextfeild = false;
            this.prefrenecesForm.removeControl('invoiceAmountTextbox');
            this.isDisabledSubmit = false;
        }
        else {
            this.isInvoiceDayFeild = false;
            this.isInvoiceAmountTextfeild = false;
            this.isDisabledSubmit = false;
        }

    }

    isValidInput() {
        if (this.isPostpaidCustomer) {
            var temp = true;
            if (this.prefrenecesForm.value.invoiceAmountTextbox.match(/^\d{1}$/)) {
                temp = true;
            }
            else if (this.prefrenecesForm.value.invoiceAmountTextbox.match(/^\d{2}$/)) {
                temp = true;
            }
            else if (this.prefrenecesForm.value.invoiceAmountTextbox.match(/^\d{3}$/)) {
                temp = true;
            }
            else if (this.prefrenecesForm.value.invoiceAmountTextbox.match(/^\d{4}$/)) {
                temp = true;
            }
            else
                temp = false;
            if (this.prefrenecesForm.value.invoiceTypeInterval == 0 || this.prefrenecesForm.value.invoiceAmountTextbox == 0 || !temp) {
                this.isDisabledSubmit = true;
                return false;
            }
            else {
                this.isDisabledSubmit = false;
                return true;
            }
        }
    }

    getInvoiceCycle() {
        this.commonService.getInvoiveCycleTypes().subscribe(res => {
            this.invoiceTypes = res.filter(x => x.CycleID != 3);
            this.invoiceTotalTypes = this.invoiceTypes;
        });
    }

    onReset() {
        this.bindPlansData(this.currentPlan.ParentPlanName);
        this.msgFlag = false;
    }

    populateCustomerPlan() {
        this.customerService.getCustomerCreateAccountProcessInfo(this.customerId).subscribe(res => {
            this.customerInfo = res
            if (this.customerInfo != null && this.customerInfo.length > 0) {
                this.totalTagFee = this.customerInfo[0].TotalTagFee;
                this.totalTagDeposit = this.customerInfo[0].TotalTagDeposit;
                this.totalFee = this.customerInfo[0].TotalFee;
                this.totalServiceTax = this.customerInfo[0].TotalServiceTax;
                this.totalShippingCharge = this.customerInfo[0].TotalShippingCharge;
                this.planId = this.customerInfo[0].PlanId;
                this.purchaseMethod = this.customerInfo[0].TransponderDeliveryMethod;
                this.shipmentServiceId = this.customerInfo[0].TagDeliveryMethod;
                this.onPurchaseMethodChange(this.purchaseMethod);
                if (this.shipmentTypes != null) {
                    if (this.shipmentTypes.filter(x => x.ServiceTypeId == this.shipmentServiceId))
                        this.shipmentTypes.filter(x => x.ServiceTypeId == this.shipmentServiceId)[0].IsSelected = true;
                }
                for (var i = 0; i < this.tagconfigs.length; i++) {
                    this.tagconfigs[i].Tagcount = 0;
                }
                this.customerInfo.forEach(x => {
                    for (var i = 0; i < this.tagconfigs.length; i++) {
                        this.tagconfigs.filter(y => y.Mounting == x.Mounting && y.Protocol == x.Protocol)[0].Tagcount = x.TagCount;
                        this.tagsCount += x.TagCount;
                    }
                })
            }
        });
    }

    getTollTypes(category) {
        this.customerService.getTollTypes().subscribe(res => {
            this.tollTypes = res;
            if (category.toUpperCase() == "NONREVENUE")
                this.tollTypes = this.tollTypes.filter(x => x.Key == "PREPAID");
        });
    }
    onTagConfigChange(tagconfig: ITagConfigurationResponse, tagcount: number) {
        if (this.tagsArrayCount.length > 0) {
            console.log(this.tagsArrayCount.filter(x => x.Protocol == tagconfig.Protocol && x.Mounting == tagconfig.Mounting))
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
            console.log(this.tagsCount);
            console.log(this.shipmentTypes.filter(x => x.IsSelected == true))
            this.totalShippingCharge = this.shipmentTypes.filter(x => x.IsSelected == true)[0].Cost * this.tagsCount;
        }
    }
    planChange(plan) {
        this.planDesc = plan.Desc;
        this.name = plan.Name;
        this.feeDesc = plan.FeeDesc;
        this.planId = plan.PlanId;
        this.isTagRequired = plan.IsTagRequired;
        this.accountType = plan.ParentPlanCode.toUpperCase();
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
        else {
            this.onPurchaseMethodChange("PickUpAfterNotification");
        }
    }

    bindFees(plan: IPlanResponse) {
        if (!this.isPostpaidCustomer)
            this.getStatementValues(plan);
        else {
            this.planService.getPlanByPK(plan.PlanId.toString()).subscribe(
                res => {
                    if (res) {
                        this.planResponse = <IPlanResponse>res;
                        this.getInvoiceInterval(this.planResponse.InvoiceIntervalId);
                    }
                });
        }
        this.customerService.getFeesbasedonPlanId(plan.PlanId).subscribe(
            res => {
                this.feesOfPlan = res
            });
        this.totalFee = parseInt(plan.TotalFee);
    }
    getCountryBystate(countryCode: string) {
        this.common.countryCode = countryCode.trim();
        console.log(countryCode);
        this.commonService.getStatesByCountryCode(this.common).subscribe(res => this.states = res);
    }
    getApplicationParameterKeys() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxDaystoRequestPlan).subscribe(res => this.noOfDaystoPlanChnage = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsPlanBasedStmt).subscribe(res => this.isPlanBased = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsVehicleTags).subscribe(res => this.isVehicleTag = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsAllowNonRevenuePayments).subscribe(res => this.isAllowNonRevenuePayments = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsServiceTax).subscribe(res => this.isServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ServiceTax).subscribe(res => this.serviceTax = res);
    }
    onServiceTypeChange(service: ITagShipmentTypesResponse) {
        this.shipmentServiceId = service.ServiceTypeId;
        this.totalShippingCharge = service.Cost * this.tagsCount;
    }

    getInvoiceDay() {
        for (var i = 1; i < 29; i++) {
            this.scheduleDays.push(i);
        }
    }

    onPurchaseMethodChange(methodType: string) {
        this.purchaseMethod = methodType;
        if (methodType.toUpperCase() == "SHIPMENTBYPOST")
            this.tagService.getShipmentServiceTypes().subscribe(res => {
                this.shipmentTypes = res;
                this.shipmentTypes[0].IsSelected = true;
                //this.shipmentServiceId = this.shipmentTypes[0].ServiceTypeId;
                this.onServiceTypeChange(this.shipmentTypes[0]);
            });
        else {
            this.shipmentTypes = [];
            this.totalShippingCharge = 0;
            this.shipmentServiceId = 0;
            this.isAddressEnable = false;
        }

    }

    bindPlansData(tollType: string) {
        this.accountType = tollType.toUpperCase();
        this.isPostpaidCustomer = this.accountType == "POSTPAID" ? true : false;
        this.customerService.getAllPlansWithFees().subscribe(res => {
            this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == tollType.toUpperCase());
            if (this.currentPlan.ParentPlanName.toUpperCase() == this.accountType)
                this.planId = this.currentPlan.PlanId;
            else
                this.planId = this.plansResponse[0].PlanId;
            let plan = <IPlanResponse>{};
            plan = this.plansResponse.filter(x => x.PlanId == this.planId)[0];
            if (this.currentPlan.ParentPlanName.toUpperCase() == this.accountType)
                plan.InvoiceIntervalId = this.currentPlan.InvoiceIntervalId;
            plan.IsSelected = true;
            this.isTagRequired = plan.IsTagRequired;
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
            this.planDesc = plan.Desc;
            this.name = plan.Name;
            this.feeDesc = plan.FeeDesc;
            this.bindFees(plan);
        });
    }

    bindShipmentTypes(deliveryType: string) {
        if (deliveryType == "SHIPMENTBYPOST")
            this.tagService.getShipmentServiceTypes().subscribe(res => this.shipmentTypes = res);
    }

    // getDefaultAddress(customerId: string) {
    //     //this.customerid = "10258205";
    //     this.commonService.getDefaultAddress(customerId).subscribe(res => {
    //         this.getDefaultAddrsResponse = res;
    //     });
    // }

    calculateTagDespositandTagBal(tagArray) {
        this.tagsCount = 0;
        this.totalTagFee = 0; this.totalTagDeposit = 0;
        //console.log(tagArray);
        if (tagArray.length > 0) {
            tagArray.forEach(x => {
                if (!(this.isAllowNonRevenuePayments && this.revenueCategory.toUpperCase() == "NONREVENUE")) {
                    var count = parseInt(x.Tagcount == "" ? "0" : x.Tagcount);
                    var fee = parseFloat(x.TagFee);
                    var deposit = parseFloat(x.TagDeposit);
                    var totalfee = count * fee;
                    var totaldep = count * deposit;
                    this.tagsCount += count;
                    this.totalTagFee += totalfee;
                    this.totalTagDeposit += totaldep;
                }
            })
            //if(this.revenueCategory == "NONREVENUE"){

            //}
        }
    }
    addressChange(addressType) {
        if (addressType == "exist")
            this.isAddressEnable = false;
        else
            this.isAddressEnable = true;
    }

    calculateAmounts() {
        if (this.isServiceTax)
            this.totalServiceTax = this.totalTagFee * (this.serviceTax / 100);
    }

    onChangeClick() {
        this.showMsg("alert", "Are you sure you want to change the current plan?");
    }

    onSubmit() {
        this.msgFlag = false;
        if (this.currentPlan.PlanChangedDate.toString() != '0001-01-01T00:00:00') {
            let date: Date = new Date(this.currentPlan.PlanChangedDate);
            date.setDate(date.getDate() + (Number)(this.noOfDaystoPlanChnage));
            if (date > new Date()) {
                date = new Date(this.currentPlan.PlanChangedDate);
                this.showMsg("error", "Frequent requests for Plan change not allowed within " + this.noOfDaystoPlanChnage + " days. Current Plan started from " + this.customDateFormatPipe.transform(date.toString()));
                return;
            }
        }

        if (this.requestedPlans != null && this.requestedPlans.length > 0) {
            this.showMsg("error", "Earlier requested plan is already inprocess");
            return;
        }

        if (this.currentPlan.IsTagRequired == false && this.isTagRequired && this.tagsCount <= 0) {
            this.showMsg("error", "Enter atleast one tag request.");
            return;
        }
        if (this.currentPlan.PlanId == this.planId) {
            this.showMsg("error", "Continue the process by changing current plan.");
            return;
        }

        if (!this.isTagRequired) {
            let activeVehicles = [];
            this.customerserviceService.GetActiveVehicleCount(this.customerId).subscribe(res => {
                activeVehicles = res
                if (activeVehicles != null && activeVehicles.length <= 0) {
                    this.showMsg("error", "This Plan requires Vehicles. Please Add Vehicles from Manage Vehicles.");
                    return;
                }
                else {
                    this.changePlan();
                }
            });
        }
        else
            this.changePlan();

    }

    changePlan() {
        let objPlanRequest: IPlanRequests = <IPlanRequests>{};
        objPlanRequest.AccountId = this.customerId;
        objPlanRequest.OldPlanId = this.currentPlan.PlanId;
        //objCreateinfo.ReplenishmentType = this.replenishType.toUpperCase();
        objPlanRequest.NewPlanId = this.planId;
        objPlanRequest.Code = this.customerContextResponse.AccountStatus;
        objPlanRequest.UpdateUser = this.sessionContextResponse.userName;
        objPlanRequest.OldPlanDesc = this.currentPlan.Name;
        objPlanRequest.NewPlanDesc = this.name;
        objPlanRequest.ActivitySource = ActivitySource.Internal;
        objPlanRequest.Subsystem = SubSystem.CSC;
        objPlanRequest.OtherPlanFee = this.totalFee;
        objPlanRequest.IsTagRequired = this.isTagRequired;
        objPlanRequest.TotalRequiredAmount = this.totalTagFee + this.totalTagDeposit + this.totalFee + this.totalServiceTax + this.totalShippingCharge;
        objPlanRequest.TollType = this.isPostpaidCustomer ? TollType.POSTPAID : TollType.PREPAID;
        objPlanRequest.NewTollType = this.customerContextResponse.AccountType.toUpperCase() == "POSTPAID" ? TollType.POSTPAID : TollType.PREPAID;
        objPlanRequest.StatementCycle = this.ngSatamentCycle;
        objPlanRequest.InvoiceIntervalId = this.ngInvoiceIntrervalType;
        objPlanRequest.InvoiceAmount = this.prefrenecesForm.controls["invoiceAmountTextbox"].value;
        objPlanRequest.InvoiceDay = this.ngInvoiceScheduleDay;
        objPlanRequest.PlanId = this.planId;

        let items = [];
        if (this.addComponent != undefined) {
            let shipmentAddress: IAddressRequest = <IAddressRequest>{};
            shipmentAddress.CustomerId = this.customerId;
            shipmentAddress.Line1 = this.addComponent.addAddressForm.controls["addressLine1"].value;
            shipmentAddress.Line2 = this.addComponent.addAddressForm.controls["addressLine2"].value;
            shipmentAddress.Line3 = this.addComponent.addAddressForm.controls["addressLine3"].value;
            shipmentAddress.City = this.addComponent.addAddressForm.controls["addressCity"].value;
            shipmentAddress.State = this.addComponent.addAddressForm.controls["addressStateSelected"].value;
            shipmentAddress.Country = this.addComponent.addAddressForm.controls["addressCountrySelected"].value;
            shipmentAddress.Zip1 = this.addComponent.addAddressForm.controls["addressZip1"].value;
            shipmentAddress.Zip2 = this.addComponent.addAddressForm.controls["addressZip2"].value;
            shipmentAddress.Type = "Shipping";
            shipmentAddress.ActivitySource = ActivitySource.Internal;
            shipmentAddress.SubSystem = SubSystem.CSC
            shipmentAddress.UserName = this.sessionContextResponse.userName;
            shipmentAddress.IsActive = true;
            shipmentAddress.IsPreferred = true;
            shipmentAddress.IsActivityRequired = true;
            items.push(shipmentAddress);
            objPlanRequest.ShipmentAddress = items.map(x => Object.assign({}, x));
        }

        this.tagsArrayCount = this.tagsArrayCount.filter(x => x.Tagcount > 0);
        items = [];
        for (var i = 0; i < this.tagsArrayCount.length; i++) {
            var tagRequest: ITagRequest = <ITagRequest>{};
            tagRequest.TagName = "No. Of " + this.tagsArrayCount[i].Protocol + "_" + this.tagsArrayCount[i].Mounting + "(s):";
            tagRequest.ReqCount = this.tagsArrayCount[i].Tagcount;
            tagRequest.CustomerId = this.customerId;
            tagRequest.TagReqDate = new Date();
            tagRequest.TagReqType = TagRequestType.New;
            tagRequest.TagPurchaseMethod = 0;
            tagRequest.TagDeliveryMethod = this.shipmentServiceId > 0 ? this.shipmentServiceId : 0;
            tagRequest.UserName = this.sessionContextResponse.userName;
            tagRequest.ActivitySource = ActivitySource.Internal;
            tagRequest.SubSystem = SubSystem.CSC;
            tagRequest.Mounting = this.tagsArrayCount[i].Mounting;
            tagRequest.Protocol = this.tagsArrayCount[i].Protocol;
            tagRequest.TagPurchaseMethodCode = this.purchaseMethod;


            items.push(tagRequest);

        }
        if (items.length > 0)
            objPlanRequest.ilTagRequest = items.map(x => Object.assign({}, x));

        let systemActivities: ISystemActivities = <ISystemActivities>{};
        systemActivities.LoginId = this.sessionContextResponse.loginId;
        systemActivities.UserId = this.sessionContextResponse.userId;
        objPlanRequest.SystemActivities = systemActivities;


        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CHANGEOFPLAN];
        userEvents.ActionName = Actions[Actions.UPDATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = this.customerId;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.customerserviceService.ChangePlan(objPlanRequest, userEvents).subscribe(res => {
            //console.log(res);
            if (res) {
                let result: boolean;
                let tagMessage: string = "";
                this.customerserviceService.TagsAvailability(objPlanRequest.AccountId).subscribe(res => {
                    result = res;
                    if (result)
                        tagMessage = " Note : All Assigned and Replaced Tags should be return, Before plan change.";
                    this.showMsg("success", "Plan change request has been submitted, maintain " + this.currencyPipe.transform(objPlanRequest.TotalRequiredAmount.toString(), 'USD', true, '1.2-2') + " for further process on it." + tagMessage);
                    this.customerserviceService.getRequestedPlanDetails(this.customerId).subscribe(res => {
                        this.requestedPlans = res
                    });

                });
            }
        },
            err => {
                this.showMsg("error", err.statusText);
                return;
            });

    }
    onPrevious() {
        let link = ['/csc/customerAccounts/create-account/'];
        this.router.navigate(link);
    }

    onCancel() {
        let link = ['/csc/customerAccounts/create-account/'];
        this.router.navigate(link);
        this.makePaymentRequest.CustomerId = 0;
        this.createAccountService.changeResponse(this.makePaymentRequest);
    }

    userAction(event) {
        if (event) {
            this.onSubmit();
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
