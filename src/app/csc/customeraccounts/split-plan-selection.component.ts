import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { ITagShipmentTypesResponse } from "../../tags/models/tagshipmentsresponse";
import { ITagConfigurationResponse } from "../../tags/models/tagsconfigurationresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { CommonService } from "../../shared/services/common.service";
import { TagService } from "../../tags/services/tags.service";
import { Router } from "@angular/router";
import { CreateAccountService } from "../../shared/services/createaccount.service";
import { SessionService } from "../../shared/services/session.service";
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { ReplenishmentType } from "./constants";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { Observable } from "rxjs/Observable";
import { ICustomerAttributesRequest } from "../customerdetails/models/customerattributesrequest";
import { ActivitySource, SubSystem, Features, SubFeatures, Actions } from "../../shared/constants";
import { ITagsAmountrequest } from "./models/tagsamountrequest";
import { IMakePaymentrequest } from "../../payment/models/makepaymentrequest";
import { ITagRequest } from "../../tags/models/tagrequest";
import { ITagResponse } from "../../shared/models/tagresponse";
import { SplitCustomerService } from "./services/splitcustomer.service";
import { ISplitRequest } from "./models/splitrequest";
import { RevenueCategory } from "../../payment/constants";
import { IAddressRequest } from "../../payment/models/addressrequest";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { IAddressResponse } from "../../shared/models/addressresponse";
import { IInvoiceCycle } from "../customerdetails/models/InvoiceCycle";
import { StatementCycle } from "./customer-preferences.component";
import { IinvoiceResponse } from "../../sac/plans/models/invoicecycleresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PlansService } from "../../sac/plans/services/plans.service";
import { IUserEvents } from "../../shared/models/userevents";


@Component({
    selector: 'app-split-plan-selection',
    templateUrl: './split-plan-selection.component.html',
    styleUrls: ['./split-plan-selection.component.scss']
})
export class SplitPlanSelectionComponent implements OnInit {
    msgType: string;
    msgDesc: string;
    msgFlag: boolean;
    isPlanBasedStmt: number = 0;
    customerId: number = 0
    planId: number
    //getDefaultAddrsResponse: IAddressResponse[];
    plansResponse: IPlanResponse[] = <IPlanResponse[]>{}
    common: any;
    shipmentTypes: ITagShipmentTypesResponse[];
    tagconfigs: ITagConfigurationResponse[];
    isVehicleTag: boolean
    cashReplnAmt: number = 0
    creditCardReplnAmt: number = 0
    bankReplnAmt: number = 0
    cashThresAmt: number = 0
    creditCardThresAmt: number = 0
    bankThresAmt: number = 0
    cashLowBalAmt: number = 0
    creditCardLowBalAmt: number = 0
    bankLowBalAmt: number = 0
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
    accountType: string
    isServiceTax: boolean
    serviceTax: number
    isCCServiceTax: boolean
    ccServiceTax: number
    replenishType: string
    purchaseMethod: string
    isTagRequired: boolean
    isAllowNonRevenuePayments: boolean
    maxNonRevenueTagsCount: number;
    sessionContextResponse: IUserresponse
    userName: string
    userId: number
    loginId: number
    isAddressEnable: boolean
    addressRequest: IAddressRequest;
    makePaymentRequest: IMakePaymentrequest = <IMakePaymentrequest>{}

    parentTags: ITagResponse[] = [];
    childTags: ITagResponse[] = [];
    parentArray = [];
    childArray = [];
    isExistTag: boolean = false;
    splitCustomer: ISplitRequest

    invoiceTypes: IinvoiceResponse[];
    objIInvoiceCycle: IInvoiceCycle[];
    objStatementCycle: StatementCycle[];
    scheduleDays = new Array();
    isInvoiceAmountTextfeild: boolean = false;
    isInvoiceDayFeild: boolean = false;
    stmtCycleForm: FormGroup;
    isPostPaid: boolean;
    isEditable: boolean = true;

    pcurrentPage = 1;
    pdataLength: number;
    ppageItemNumber: number = 10;
    pendItemNumber: number;
    pstartItemNumber: number = 1;
    ccurrentPage = 1;
    cdataLength: number;
    cpageItemNumber: number = 10;
    cendItemNumber: number;
    cstartItemNumber: number = 1;

    @ViewChild(AddAddressComponent) addComponent
    constructor(private commonService: CommonService, private tagService: TagService, private customerService: CustomerAccountsService,
        private router: Router, private customerContextService: CustomerContextService, private renderer: Renderer, private planService: PlansService,
        private sessionService: SessionService, private splitService: SplitCustomerService) { }

    ngOnInit() {
        this.initialFormValues();
        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }
        this.userName = this.sessionContextResponse.userName;
        this.userId = this.sessionContextResponse.userId;
        this.loginId = this.sessionContextResponse.loginId;
        this.customerContextService.currentContext.subscribe(context => {
            if (context != null)
                this.customerId = context.AccountId;
            else {
                let link = ['/csc/customerAccounts/split-account/'];
                this.router.navigate(link);
            }
        })
        this.splitCustomer = this.splitService.splitContext();
        if (this.splitCustomer == null) {
            let link = ['/csc/customerAccounts/split-account/'];
            this.router.navigate(link);
        }
        console.log(this.customerId);
        //this.customerId = 10258205;
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
        this.commonService.getTransponderPurchaseMethod().subscribe(res => { this.tagPurchaseMethod = res; this.purchaseMethod = this.tagPurchaseMethod[0].Key });
        this.getTagsbyAccountId();
        // this.customerService.getRevenueCategorybyAccountId(this.customerId).subscribe(res => {
        //   if (res != null) {
        // this.revenueCategory = res.RevenueCategory;
        this.revenueCategory = this.splitCustomer.CustInfo.RevenueCategory;
        this.customerService.getTollTypes().subscribe(res => {
            this.tollTypes = res;
            // if (this.revenueCategory.toUpperCase() == "NONREVENUE") {
            //     this.tollTypes = this.tollTypes.filter(x => x.Key == "PREPAID");
            //     this.accountType = this.tollTypes[0].Value.toUpperCase();
            //     if (this.splitCustomer.CustAttrib == null) {
            //         this.accountType = this.tollTypes[0].Value.toUpperCase();
            //         this.bindPlansData(this.accountType);
            //         this.calculateTollBalance(this.accountType);
            //         this.bindStatementInformation(this.accountType);
            //         return;
            //     }
            // }
            if (this.splitCustomer.CustAttrib != null) {
                //this.getInvoiceCycle();
                this.populateCustomerPlan();
                return;
            }
            this.commonService.getPlanByCustomerId(this.customerId).subscribe(res => {
                if (res != null && res.length > 0) {
                    this.planId = res[0].PlanId;
                    this.accountType = res[0].ParentPlanName.toUpperCase();
                    this.calculateTollBalance(this.accountType);
                    //this.bindStatementInformation(this.accountType);
                    this.customerService.getAllPlansWithFees().subscribe(res => {
                        this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == this.accountType.toUpperCase());
                        this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsSelected = true;
                        this.isTagRequired = this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsTagRequired;
                        this.bindFees(this.plansResponse.filter(x => x.PlanId == this.planId)[0]);
                        this.bindStatementInformation(this.accountType);
                    });
                }
                else {
                    this.accountType = this.tollTypes[0].Value.toUpperCase();
                    this.bindPlansData(this.accountType);
                    this.calculateTollBalance(this.accountType);
                    //this.bindStatementInformation(this.accountType);
                }
            })
        });
        //}
        //});
    }

    initialFormValues() {
        console.log(this.isEditable);
        this.stmtCycleForm = new FormGroup({
            invoiceTypeInterval: new FormControl('', Validators.compose([Validators.required])),
            invoiceAmountTextbox: new FormControl('', Validators.compose([Validators.required])),
            invoiceScheduleDay: new FormControl('', []),
            statementCycle: new FormControl('', Validators.compose([Validators.required]))
        });
    }

    getInvoiceInterval(invoceInterval: number) {
        if (invoceInterval == 2) {
            this.isInvoiceAmountTextfeild = true;
            this.isInvoiceDayFeild = false;
            this.stmtCycleForm.controls['invoiceAmountTextbox'].reset();
            this.stmtCycleForm.controls['invoiceScheduleDay'].reset();
            this.stmtCycleForm.controls['statementCycle'].reset();
            this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([Validators.required]);
            this.stmtCycleForm.controls['invoiceAmountTextbox'].updateValueAndValidity();
        }
        else if (invoceInterval == 5) {
            this.isInvoiceDayFeild = true;
            this.getInvoiceDay();
            this.isInvoiceAmountTextfeild = false;
            this.stmtCycleForm.controls['invoiceAmountTextbox'].reset();
            this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([]);
            this.stmtCycleForm.controls['invoiceAmountTextbox'].updateValueAndValidity();
            this.stmtCycleForm.controls['invoiceAmountTextbox'].reset();
            this.stmtCycleForm.controls['statementCycle'].reset();
        }
        else {
            this.isInvoiceDayFeild = false;
            this.isInvoiceAmountTextfeild = false;
            this.stmtCycleForm.controls['invoiceAmountTextbox'].reset();
            this.stmtCycleForm.controls['invoiceScheduleDay'].reset();
            this.stmtCycleForm.controls['statementCycle'].reset();
            this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([Validators.required]);
            this.stmtCycleForm.controls['invoiceAmountTextbox'].updateValueAndValidity();
        }
    }

    getTagsbyAccountId() {
        var tagRequest = <ITagRequest>{}
        tagRequest.PageNumber = 1;
        tagRequest.PageSize = 100;
        tagRequest.SortColumn = "SERIALNO";
        tagRequest.SortDirection = true;
        this.tagService.getTagsByAccountId(this.customerId.toString(), tagRequest).subscribe(res => {
            this.parentTags = res;
            if (this.parentTags.length > 0) {
                this.isExistTag = true;
            }
            //this.paginateparentdata();
        });
    }

    bindStatementInformation(accountType) {
        if (accountType.toUpperCase() == "PREPAID") {
            //this.getStatementCycleTypes();
            this.customerService.getStatementCycle().subscribe(result => {
                this.objStatementCycle = result;
                this.objStatementCycle = this.objStatementCycle.filter(x => x.CycleType != 'N');
                this.isPostPaid = false;
                this.stmtCycleForm.controls['statementCycle'].setValidators([Validators.required]);
                this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([]);
                this.stmtCycleForm.controls['invoiceTypeInterval'].setValidators([]);
                if (this.isPlanBasedStmt > 0) {
                    this.planService.getPlanByPK(this.planId.toString()).subscribe(
                        res => {
                            if (res) {
                                var planRes = <IPlanResponse>res;
                                if (planRes.StatementCycle != "" && planRes.StatementCycle != null) {
                                    this.stmtCycleForm.controls['statementCycle'].setValidators([]);
                                    this.stmtCycleForm.controls["statementCycle"].setValue(planRes.StatementCycle);
                                    this.stmtCycleForm.controls["statementCycle"].disable();
                                }
                                else {
                                    this.stmtCycleForm.controls["statementCycle"].enable();
                                    this.stmtCycleForm.controls["statementCycle"].setValue('');
                                }
                            }
                        });
                }
                else {
                    this.stmtCycleForm.controls["statementCycle"].enable();
                    this.stmtCycleForm.controls["statementCycle"].setValue('');
                }
            });
        }
        else {
            //this.getInvoiceCycle();
            this.commonService.getInvoiveCycleTypes().subscribe(res => {
                this.invoiceTypes = res;
                this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 3);//x.CycleID != 1 &&

                this.isPostPaid = true;
                this.planService.getPlanByPK(this.planId.toString()).subscribe(
                    res => {
                        if (res) {
                            var planRes = <IPlanResponse>res;
                            if (planRes.InvoiceIntervalId != null && planRes.InvoiceIntervalId != 0) {
                                this.stmtCycleForm.controls['invoiceTypeInterval'].setValidators([]);
                                this.stmtCycleForm.controls['invoiceTypeInterval'].setValue(planRes.InvoiceIntervalId);
                                this.stmtCycleForm.controls["invoiceTypeInterval"].disable();
                            }
                            else {
                                this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
                                this.stmtCycleForm.controls['statementCycle'].setValidators([]);
                                this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([]);
                                this.stmtCycleForm.controls['invoiceTypeInterval'].setValidators([Validators.required]);
                                this.stmtCycleForm.controls['invoiceTypeInterval'].setValue('');
                                this.stmtCycleForm.controls["invoiceTypeInterval"].enable();
                                this.getInvoiceInterval(0);
                            }
                        }
                        else {
                            this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
                            this.stmtCycleForm.controls['statementCycle'].setValidators([]);
                            this.stmtCycleForm.controls['invoiceAmountTextbox'].setValidators([]);
                            this.stmtCycleForm.controls['invoiceTypeInterval'].setValidators([Validators.required]);
                            this.stmtCycleForm.controls['invoiceTypeInterval'].setValue('');
                            this.stmtCycleForm.controls["invoiceTypeInterval"].enable();
                            this.getInvoiceInterval(0);
                        }
                    });
            });
        }
    }

    getStatementCycleTypes() {
        this.customerService.getStatementCycle().subscribe(result => { this.objStatementCycle = result; this.objStatementCycle = this.objStatementCycle.filter(x => x.CycleType != 'N'); });
    }

    getInvoiceCycle() {
        this.commonService.getInvoiveCycleTypes().subscribe(res => {
            this.invoiceTypes = res;
            this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 3);//x.CycleID != 1 &&
        });
    }

    getInvoiceDay() {
        for (var i = 1; i < 29; i++) {
            this.scheduleDays.push(i);
        }
    }

    transferTags() {
        if (this.parentArray.length > 0) {
            if (this.parentTags.length - this.parentArray.length == 0) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Source customer need to have at least one Tag.";
                return;
            }
            this.parentArray.forEach(x => {
                if (this.childTags.filter(y => y.SerialNumber != x.SerialNumber))
                    this.childTags.push(x);
                this.parentTags = this.parentTags.filter(y => y.SerialNumber != x.SerialNumber);
                this.parentArray = this.parentArray.filter(z => z.SerialNumber != x.SerialNumber);
            })
            // this.paginateparentdata();
            // this.paginateChilddata();
        }
    }

    paginateparentdata() {
        this.pdataLength = this.parentTags.length;
        if (this.pdataLength < this.ppageItemNumber) {
            this.pendItemNumber = this.pdataLength;
        }
        else {
            this.pendItemNumber = this.ppageItemNumber;
        }
    }

    paginateChilddata() {
        this.cdataLength = this.childTags.length;
        if (this.cdataLength < this.cpageItemNumber) {
            this.cendItemNumber = this.cdataLength;
        }
        else {
            this.cendItemNumber = this.cpageItemNumber;
        }
    }
    parentChange(checked, pTag: ITagResponse) {
        if (checked) {
            this.parentArray.push(pTag);
        }
        else {
            if (this.parentArray.filter(x => x.SerialNumber == pTag.SerialNumber))
                this.parentArray = this.parentArray.filter(x => x.SerialNumber != pTag.SerialNumber)
        }
    }

    revertTags() {
        if (this.childArray.length > 0) {
            this.childArray.forEach(x => {
                if (this.childTags.filter(y => y.SerialNumber != x.SerialNumber))
                    this.parentTags.push(x);
                this.childTags = this.childTags.filter(y => y.SerialNumber != x.SerialNumber);
                this.childArray = this.childArray.filter(z => z.SerialNumber != x.SerialNumber);
            })
        }
        // this.paginateparentdata();
        // this.paginateChilddata();
    }

    childChange(checked, cTag: ITagResponse) {
        if (checked) {
            this.childArray.push(cTag);
        }
        else {
            if (this.childArray.filter(x => x.SerialNumber == cTag.SerialNumber))
                this.childArray = this.childArray.filter(x => x.SerialNumber != cTag.SerialNumber)
        }
    }

    populateCustomerPlan() {
        if (this.splitCustomer != null && this.splitCustomer.Payment != null) {

            this.accountType = this.splitCustomer.CustAttrib.IsPostPaidCustomer ? this.tollTypes[1].Value.toUpperCase() : this.tollTypes[0].Value.toUpperCase();
            this.replenishType = this.splitCustomer.Payment.ReplenishmentType.toUpperCase();
            this.tollBalance = this.splitCustomer.TollBalance;
            this.totalTagFee = this.splitCustomer.TotalTagFee;
            this.totalTagDeposit = this.splitCustomer.TagDeposit;
            this.totalFee = this.splitCustomer.OtherPlanFee;
            this.totalServiceTax = this.splitCustomer.ServiceTax;
            this.totalShippingCharge = this.splitCustomer.TotalShippingCharge;
            this.planId = this.splitCustomer.CustAttrib.PlanId;
            this.isTagRequired = this.splitCustomer.CustAttrib.IsTagRequired;
            this.purchaseMethod = this.splitCustomer.CustAttrib.TranponderPurchasemethod;
            this.shipmentServiceId = this.splitCustomer.Payment.TagDeliveryMethod;
            this.onPurchaseMethodChange(this.purchaseMethod);
            this.customerService.getAllPlansWithFees().subscribe(res => {
                this.plansResponse = res.filter(x => x.ParentPlanCode.toUpperCase() == this.accountType.toUpperCase());
                this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsSelected = true;
                this.isTagRequired = this.plansResponse.filter(x => x.PlanId == this.planId)[0].IsTagRequired;
                this.bindFees(this.plansResponse.filter(x => x.PlanId == this.planId)[0]);
                //this.bindStatementInformation(this.accountType);
                if (this.splitCustomer.CustAttrib != null) {
                    if (this.splitCustomer.CustAttrib.IsPostPaidCustomer) {
                        this.isPostPaid = true;
                        //this.getInvoiceCycle();
                        this.commonService.getInvoiveCycleTypes().subscribe(res => {
                            this.invoiceTypes = res;
                            this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 3);//x.CycleID != 1 &&
                            this.stmtCycleForm.controls['invoiceTypeInterval'].setValue(this.splitCustomer.CustAttrib.InvoiceIntervalID);
                            this.getInvoiceInterval(this.splitCustomer.CustAttrib.InvoiceIntervalID);
                            if (this.splitCustomer.CustAttrib.InvoiceIntervalID == 2) {
                                this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
                                this.stmtCycleForm.controls["invoiceAmountTextbox"].setValue(this.splitCustomer.CustAttrib.InvoiceAmount);
                            }
                            else if (this.splitCustomer.CustAttrib.InvoiceIntervalID == 5) {
                                this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
                                this.stmtCycleForm.controls["invoiceScheduleDay"].setValue(this.splitCustomer.CustAttrib.InvoiceDay);
                            }
                            else if (this.splitCustomer.CustAttrib.InvoiceIntervalID == 4) {
                                this.invoiceTypes = this.invoiceTypes.filter(x => x.CycleID != 1);
                            }
                            else if (this.splitCustomer.CustAttrib.InvoiceIntervalID == 1) {
                                this.stmtCycleForm.controls["invoiceTypeInterval"].disable();
                            }
                        });
                    }
                    else {
                        this.isPostPaid = false;
                        //this.getStatementCycleTypes();
                        this.customerService.getStatementCycle().subscribe(result => {
                            this.objStatementCycle = result;
                            this.objStatementCycle = this.objStatementCycle.filter(x => x.CycleType != 'N');
                            if (this.isPlanBasedStmt == 0) {
                                this.stmtCycleForm.controls["statementCycle"].setValue(this.splitCustomer.CustAttrib.StatementCycle);
                            }
                            else {
                                this.stmtCycleForm.controls["statementCycle"].setValue(this.splitCustomer.CustAttrib.StatementCycle);
                                this.stmtCycleForm.controls["statementCycle"].disable();
                            }
                        });
                    }
                }
            });


            if (this.splitCustomer.Tags != null && this.splitCustomer.Tags.length > 0) {
                this.childTags = this.splitCustomer.Tags;
                this.childTags.forEach(x => {
                    this.parentTags = this.parentTags.filter(y => y.SerialNumber != x.SerialNumber);
                })
                // this.paginateparentdata();
                // this.paginateChilddata();
            }
            for (var i = 0; i < this.tagconfigs.length; i++) {
                this.tagconfigs[i].Tagcount = 0;
            }
            if (this.splitCustomer.Payment != null && this.splitCustomer.Payment.TagRequests != null && this.splitCustomer.Payment.TagRequests.length > 0) {
                this.splitCustomer.Payment.TagRequests.forEach(x => {
                    this.tagconfigs.filter(y => y.Mounting == x.Mounting && y.Protocol == x.Protocol)[0].Tagcount = x.ReqCount;
                    this.tagsArrayCount.push(this.tagconfigs.filter(y => y.Mounting == x.Mounting && y.Protocol == x.Protocol)[0]);
                    this.tagsCount = this.tagsArrayCount.length;
                })
            }
            if (this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST" && this.splitCustomer.Payment.ShipmentAddress[0].IsShipmentupdateAddress) {
                this.isAddressEnable = this.splitCustomer.Payment.ShipmentAddress[0].IsShipmentupdateAddress;
                if (this.isAddressEnable) {
                    this.addressRequest = this.splitCustomer.Payment.ShipmentAddress[0];
                }
            }
        }
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
                count = this.tagsCount - this.tagsArrayCount.filter(x => x.Mounting == tagconfig.Mounting && x.Protocol == tagconfig.Protocol)[0].Tagcount;
            }
            if ((count + parseInt(tagcount.toString())) > this.maxNonRevenueTagsCount) {
                this.tagconfigs.forEach(x => x.Tagcount = 0);
                this.totalTagFee = 0;
                this.totalTagDeposit = 0;
                this.tagsCount = 0;
                this.tagsArrayCount = [];
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Maximum allowed Tags for Non-Revenue customer are " + this.maxNonRevenueTagsCount;
                return;
            }
        }
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
        this.planId = plan.PlanId;
        this.isTagRequired = plan.IsTagRequired;
        this.accountType = plan.ParentPlanCode.toUpperCase();
        this.calculateTollBalance(this.accountType);
        this.bindFees(plan);
        this.bindStatementInformation(this.accountType);
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
            });
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
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsPlanBasedStmt).subscribe(res => this.isPlanBasedStmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CashLowBalAmt).subscribe(res => this.cashLowBalAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CreditCardLowBalAmt).subscribe(res => this.creditCardLowBalAmt = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ACHLowBalAmt).subscribe(res => this.bankLowBalAmt = res);
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
        this.purchaseMethod = methodType;
        if (methodType.toUpperCase() == "SHIPMENTBYPOST") {
            this.tagService.getShipmentServiceTypes().subscribe(res => {
                this.shipmentTypes = res;
                if (this.shipmentServiceId > 0) {
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
            this.planId = this.plansResponse[0].PlanId;
            this.bindFees(this.plansResponse[0]);
            this.bindStatementInformation(this.accountType);
            this.totalTagFee = 0;
            this.totalTagDeposit = 0;
            this.totalShippingCharge = 0;
            this.totalServiceTax = 0;
            this.tagsArrayCount = [];
            this.tagsCount = 0;
            this.tagconfigs.forEach(x => {
                x.Tagcount = 0
            })
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
        if (addressType == "exist") {
            this.isAddressEnable = false;
            this.addressRequest = <IAddressRequest>{};
        }
        else {
            this.isAddressEnable = true;
            if (this.addressRequest == null) {
                this.addComponent.addAddressForm.reset();
            }
        }
    }

    calculateAmounts() {
        if (this.isServiceTax)
            this.totalServiceTax = this.totalTagFee * (this.serviceTax / 100);
    }
    onTagSplitChange(existornew) {
        if (existornew == "EXIST")
            this.isExistTag = true
        else
            this.isExistTag = false;
    }
    onSubmit() {

        if (this.isTagRequired && this.tagsCount <= 0 && this.childTags.length <= 0) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = "Enter atleast one tag request.";
            return;
        }
        if (!(this.revenueCategory.toUpperCase() == "NONREVENUE")) {
            if (this.accountType.toUpperCase() == "PREPAID" && this.stmtCycleForm.value.statementCycle == "") {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Please select the statement cycle";
                return;
            }
            if (this.accountType.toUpperCase() == "POSTPAID" && this.stmtCycleForm.value.invoiceTypeInterval == 2 && (this.stmtCycleForm.value.invoiceAmountTextbox == null || this.stmtCycleForm.value.invoiceAmountTextbox <= 0)) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Please enter the Invoice amount";
                return;
            }
            else if (this.accountType.toUpperCase() == "POSTPAID" && this.stmtCycleForm.value.invoiceTypeInterval == 5 && (this.stmtCycleForm.value.invoiceScheduleDay == null || this.stmtCycleForm.value.invoiceScheduleDay <= 0)) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Please enter the Invoice Schedule Day";
                return;
            }
            else if (this.accountType.toUpperCase() == "POSTPAID" && this.stmtCycleForm.value.invoiceTypeInterval == 4) {
            }
            else if (this.accountType.toUpperCase() == "POSTPAID" && this.stmtCycleForm.value.invoiceTypeInterval <= 0) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Please select the Invoice cycle";
                return;
            }
        }

        if (this.isAddressEnable && this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST") {
            if (!this.addComponent.addAddressForm.valid) {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgDesc = "Enter mandatory address fields";
                return;
            }
        }
        debugger;
        var splitReq = this.splitService.splitContext();
        splitReq.Payment = <IMakePaymentrequest>{};
        splitReq.Payment.PlanID = this.planId;
        splitReq.Payment.RevenueCategory = RevenueCategory[this.revenueCategory];
        splitReq.Payment.TagDeliveryOption = this.purchaseMethod;
        splitReq.CustAttrib = <ICustomerAttributesRequest>{};
        splitReq.CustAttrib.PlanId = this.planId;
        splitReq.CustAttrib.IsTagRequired = this.isTagRequired;
        splitReq.CustAttrib.PlanDescription = this.plansResponse.filter(x => x.PlanId == this.planId)[0].Name;
        if (this.replenishType == ReplenishmentType[ReplenishmentType.CreditCard].toUpperCase()) {
            splitReq.CustAttrib.ThresholdAmount = this.creditCardThresAmt;
            splitReq.CustAttrib.CalculatedReBillAmount = this.creditCardReplnAmt;
            splitReq.CustAttrib.LowBalanceAmount = this.creditCardLowBalAmt;
            splitReq.CustAttrib.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.CreditCard];
            splitReq.Payment.ReplenishmentType = ReplenishmentType[ReplenishmentType.CreditCard];
        }
        if (this.replenishType == ReplenishmentType[ReplenishmentType.ACH].toUpperCase()) {
            splitReq.CustAttrib.ThresholdAmount = this.bankThresAmt;
            splitReq.CustAttrib.CalculatedReBillAmount = this.bankReplnAmt;
            splitReq.CustAttrib.LowBalanceAmount = this.bankLowBalAmt;
            splitReq.CustAttrib.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.ACH];
            splitReq.Payment.ReplenishmentType = ReplenishmentType[ReplenishmentType.ACH];
        }
        if (this.replenishType == ReplenishmentType[ReplenishmentType.Cash].toUpperCase()) {
            splitReq.CustAttrib.ThresholdAmount = this.cashThresAmt;
            splitReq.CustAttrib.CalculatedReBillAmount = this.cashReplnAmt;
            splitReq.CustAttrib.LowBalanceAmount = this.cashLowBalAmt;
            splitReq.CustAttrib.AutoReplenishmentType = ReplenishmentType[ReplenishmentType.Cash];
            splitReq.Payment.ReplenishmentType = ReplenishmentType[ReplenishmentType.Cash];
        }
        splitReq.CustAttrib.IsTagRequired = this.isTagRequired;
        splitReq.CustAttrib.IsPostPaidCustomer = this.accountType == "POSTPAID" ? true : false;

        if (this.accountType.toUpperCase() == "PREPAID") {
            splitReq.CustAttrib.StatementCycle = this.stmtCycleForm.controls["statementCycle"].value;
        }
        else {
            splitReq.CustAttrib.StatementCycle = "";
            splitReq.CustAttrib.InvoiceIntervalID = this.stmtCycleForm.controls["invoiceTypeInterval"].value;
            splitReq.CustAttrib.InvoiceAmount = this.stmtCycleForm.controls["invoiceAmountTextbox"].value;
            splitReq.CustAttrib.InvoiceDay = this.stmtCycleForm.controls["invoiceScheduleDay"].value;
        }

        this.tagsArrayCount = this.tagsArrayCount.filter(x => x.Tagcount > 0);

        splitReq.CustAttrib.RevenueCategory = this.revenueCategory;
        splitReq.CustAttrib.TranponderPurchasemethod = this.purchaseMethod;
        splitReq.TollBalance = this.tollBalance;
        splitReq.OtherPlanFee = this.totalFee;
        splitReq.TotalTagFee = this.totalTagFee;
        splitReq.TagDeposit = this.totalTagDeposit;
        splitReq.ServiceTax = this.totalServiceTax;
        splitReq.TotalShippingCharge = this.totalShippingCharge;
        //splitReq.Payment.TagRequests = <ITagRequest[]>{};
        if (this.childTags.length > 0)
            splitReq.Tags = this.childTags;
        if (this.tagsArrayCount.length > 0) {
            //splitReq.Payment.TagRequests = this.tagsArrayCount;
            var tagItems = [];

            this.tagsArrayCount.forEach(x => {
                var tagItem = <ITagRequest>{};
                tagItem.Mounting = x.Mounting;
                tagItem.Protocol = x.Protocol;
                tagItem.ReqCount = x.Tagcount;
                tagItems.push(tagItem);
            })
        }
        splitReq.Payment.TagRequests = tagItems;
        if (this.purchaseMethod.toUpperCase() == "SHIPMENTBYPOST") {
            splitReq.Payment.TagDeliveryMethod = this.shipmentServiceId > 0 ? this.shipmentServiceId : 0;
            let items = [];
            let objaddress: IAddressRequest = <IAddressRequest>{};
            // objaddress.CustomerId = this.makepaymentrequest.CustomerId;
            // objaddress.UserName = this.sessionContextResponse.userName;
            // objaddress.LoginId = this.sessionContextResponse.loginId;
            // objaddress.UserId = this.sessionContextResponse.userId;
            objaddress.Line1 = this.addComponent.addAddressForm.value.addressLine1;
            objaddress.Line2 = this.addComponent.addAddressForm.value.addressLine2;
            objaddress.Line3 = this.addComponent.addAddressForm.value.addressLine3;

            objaddress.City = this.addComponent.addAddressForm.value.addressCity;
            objaddress.State = this.addComponent.addAddressForm.value.addressStateSelected;
            objaddress.Country = this.addComponent.addAddressForm.value.addressCountrySelected;
            objaddress.Zip1 = this.addComponent.addAddressForm.value.addressZip1;
            objaddress.Zip2 = this.addComponent.addAddressForm.value.addressZip2;
            objaddress.IsShipmentupdateAddress = this.isAddressEnable ? true : false;
            //For system related activities                            
            // objaddress.ActivitySource = ActivitySource.Internal;
            // objaddress.SubSystem = SubSystem.CSC;
            // objaddress.IsActive = true;
            // objaddress.IsPreferred = true;
            // objaddress.IsActivityRequired = true
            items.push(objaddress);
            //splitReq.Payment.Sh
            //this.makepaymentrequest.ShipmentAddress = <IAddress[]>{};
            splitReq.Payment.ShipmentAddress = items.map(x => Object.assign({}, x));

        }
        splitReq.totAmount = splitReq.TollBalance + splitReq.OtherPlanFee + splitReq.TotalTagFee + splitReq.TagDeposit + splitReq.TotalShippingCharge + splitReq.ServiceTax;
        splitReq.Payment.IsShipmentupdateAddress = this.isAddressEnable ? true : false;
        this.splitService.changeResponse(splitReq);
        console.log(splitReq);
        let link = ['/csc/customeraccounts/split-vehicles/'];
        this.router.navigate(link);
    }
    onPrevious() {
        let link = ['/csc/customeraccounts/split-account/'];
        this.router.navigate(link);
    }

    onCancel() {
        let link = ['/csc/customeraccounts/split-account/'];
        this.router.navigate(link);
        // var splitReq = <ISplitRequest>{}
        // this.splitService.changeResponse(splitReq);
    }


    childpageChanged(event) {
        this.ccurrentPage = event;
        this.cstartItemNumber = (((this.ccurrentPage) - 1) * this.cpageItemNumber) + 1;
        this.cendItemNumber = ((this.ccurrentPage) * this.cpageItemNumber);
        if (this.cendItemNumber > this.cdataLength)
            this.cendItemNumber = this.cdataLength;
    }

    parentpageChanged(event) {
        this.pcurrentPage = event;
        this.pstartItemNumber = (((this.pcurrentPage) - 1) * this.ppageItemNumber) + 1;
        this.pendItemNumber = ((this.pcurrentPage) * this.ppageItemNumber);
        if (this.pendItemNumber > this.pdataLength)
            this.pendItemNumber = this.pdataLength;
    }

    setOutputFlag(e) {
        this.msgFlag = e;
    }
}
