import { IDiscountResponse } from './models/discountresponse';
import { IDiscountRequest } from './models/discountrequest';
import { IPaging } from './../../shared/models/paging';
import { IPlanResponse } from './models/plansresponse';
import { IPlanRequest } from './models/plansrequest';
import { PlansService } from './services/plans.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { SubSystem, ActivitySource, Features, Actions, SubFeatures, defaultCulture } from '../../shared/constants';
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDpOptions } from "mydatepicker";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
    selector: 'app-assign-discounts-to-plans',
    templateUrl: './assign-discounts-to-plans.component.html',
    styleUrls: ['./assign-discounts-to-plans.component.css']
})
export class AssignDiscountsToPlansComponent implements OnInit {
    endinvalidDate: boolean;
    startinvalidDate: boolean;

    //variable declaration
    invalid: boolean;
    startDateModel = {};
    endDateModel = {};
    renderer: any;
    getDiscountRequest: IDiscountRequest;
    getDiscountResponse: IDiscountResponse[];
    getPlanResponses: IPlanResponse = <IPlanResponse>{};
    getPlanResponse: IPlanResponse;
    discountObj: IDiscountRequest = <IDiscountRequest>{};
    planRequest: IPlanRequest = <IPlanRequest>{};
    paging: IPaging;
    selectedRow: number;
    selected: boolean = false;
    feelen: number;
    items = [];
    StartDate: Date;
    planId: number;
    boolDiscount: false;
    status: boolean = false;
    routeStatus: any;
    boolChecked: boolean;
    datePlanStartDate = new Date();
    datePlanEndDate = new Date();
    dateDiscEndDate = new Date();
    dateDiscStartDate = new Date();
    enteredStartDate = new Date();
    enteredEndDate = new Date();
    validDate = new Date();
    endDate = new Date();
    boolValid: boolean = true;
    boolDiscBtn: boolean = false;
    minDate = new Date();
    maxDate: Date;
    bsValue1: Date;
    bsValue2: Date;
    bsValue3: Date;
    disableButton: boolean = false;
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;

    _bsValue: Date;
    get bsValue(): Date {
        return this._bsValue;
    }
    set bsValue(v: Date) {
        this._bsValue = v;
    }
    myDatePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo', sunHighlight: false, inline: false,
        alignSelectorRight: false, indicateInvalidDate: true,
        indicateInvalidDateRange: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
    };
    startDate: Date[];
    myDatePickerOptionsGridStart: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, height: '34px', width: '150px',
        alignSelectorRight: true, indicateInvalidDate: true,
        indicateInvalidDateRange: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
        openSelectorTopOfInput: true,
    };
    myDatePickerOptionsGridEnd: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, height: '34px', width: '150px',
        alignSelectorRight: true, indicateInvalidDate: true,
        indicateInvalidDateRange: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false,
        openSelectorTopOfInput: true,
    };
    constructor(private router: Router, private route: ActivatedRoute,
        private planService: PlansService, private Context: SessionService, private commonService: CommonService,private materialscriptService: MaterialscriptService) { }

    ngOnInit() {

        const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
        this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

        this.disableButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.CREATE], "");
        this.planId = +this.route.snapshot.paramMap.get('id');
        this.routeStatus = this.route.snapshot.paramMap.get('status');
        if (this.routeStatus == "false") {
            this.boolDiscBtn = true;
        }
        else {
            this.boolDiscBtn = false;
        }
        this.getActiveDiscountsByDate(this.planId);
        this.bindPlanDetails(this.planId);
        this.getdiscountsAvailable(this.planId);
        this.materialscriptService.material();
    }

    // to get the discounts available for the plan
    getdiscountsAvailable(id: number): boolean {
        this.planService.getPlanDiscountsByPlanId(this.planId.toString()).subscribe(res => {
            if (res) {
                this.endDate = new Date(res[0].EndEffectiveDate);
                if (this.endDate > new Date()) {
                    this.status = true;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "This plan is already associated with discount";
                    this.msgTitle = '';
                    return this.status;
                }
                else {
                    this.status = false;
                    return this.status;
                }
            }
            else {
                this.status = false;
                return this.status;
            }
        }, err => {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = err.statusText;
            this.msgTitle = '';
            return;
        });
        return this.status;
    }

    // to get the active discounts for current date
    getActiveDiscountsByDate(id: number): void {
        this.planService.getActiveDiscountsByDate(id.toString()).subscribe(
            res => {
                if (res) {
                    this.getDiscountResponse = res;
                }
            }, err => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText;
                this.msgTitle = '';
                return;
            });
    }

    // to get the plan details by planid
    bindPlanDetails(id: number) {
        this.planService.getPlanByPK(id.toString()).subscribe(
            res => {
                this.getPlanResponse = <IPlanResponse>res;
                if (res) {
                    this.getPlanResponses.StartEffDate = this.getPlanResponse.StartEffDate;
                    this.getPlanResponses.EndEffDate = this.getPlanResponse.EndEffDate;


                    let startDate = new Date();
                    startDate = new Date(this.getPlanResponses.StartEffDate);
                    this.startDateModel = {
                        date: {
                            year: startDate.getFullYear(),
                            month: startDate.getMonth() + 1,
                            day: startDate.getDate()
                        }
                    };
                    let endDate = new Date();
                    endDate = new Date(this.getPlanResponses.EndEffDate);
                    this.endDateModel = {
                        date: {
                            year: endDate.getFullYear(),
                            month: endDate.getMonth() + 1,
                            day: endDate.getDate()
                        }
                    };

                }
                else {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Error while getting the plan details";
                    this.msgTitle = '';
                }
            },
            err => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText;
                this.msgTitle = '';
                return;
            });
    }

    // to reset the discount details
    resetClick() {
        this.getActiveDiscountsByDate(this.planId);
        this.bindPlanDetails(this.planId);
        this.items = [];
    }

    // to cancel the event
    cancelClick() {
        if (!this.boolDiscBtn) {
            this.router.navigate(['/sac/plans/update-plans', this.planId]);
        }
        else {
            this.router.navigateByUrl("/sac/plans/view-plans");
        }
    }

    // to go to fee page
    prevoiusPlans() {
        this.router.navigate(['/sac/plans/assign-fees-to-plans', false, this.planId]);
    }

    //to add discounts to plans
    addDiscounts() {
        this.planService.getPlanDiscountsByPlanId(this.planId.toString()).subscribe(res => {
            if (res) {
                this.endDate = new Date(res[0].EndEffectiveDate);
                if (this.endDate > new Date()) {
                    this.status = true;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "This plan is already associated with discount";
                    this.msgTitle = '';
                    return;
                }
            }
        }, (err) => { }
            , () => {
                if (!this.status) {
                    if (this.items.length > 0) {
                        this.boolValid = this.discountValidations(this.items);
                        if (this.boolValid) {
                            this.planRequest.Discounts = this.items.map(x => Object.assign({}, x));
                            this.planRequest.PlanId = this.planId;
                            this.planRequest.UpdateUser = this.Context.customerContext.userName;
                            let userEvents = <IUserEvents>{};
                            userEvents.FeatureName = Features[Features.PLANS];
                            userEvents.SubFeatureName = SubFeatures[SubFeatures.FEEASSOCIATE];
                            userEvents.ActionName = Actions[Actions.CREATE];
                            userEvents.PageName = this.router.url;
                            userEvents.CustomerId = 0;
                            userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
                            userEvents.UserName = this.Context.customerContext.userName;
                            userEvents.LoginId = this.Context.customerContext.loginId;
                            this.planService.createPlanDiscountAssociation(this.planRequest, userEvents).subscribe(res => {
                                if (res) {
                                    this.getActiveDiscountsByDate(this.planId);
                                    this.bindPlanDetails(this.planId);
                                    this.items = [];
                                    this.msgType = 'success';
                                    this.msgFlag = true;
                                    this.msgDesc = "Discount(s) has been added successfully";
                                    this.msgTitle = '';
                                }
                                else {
                                    this.getActiveDiscountsByDate(this.planId);
                                    this.bindPlanDetails(this.planId);
                                }
                            }, err => {
                                this.msgType = 'error';
                                this.msgFlag = true;
                                this.msgDesc = err.statusText;
                                this.msgTitle = '';
                                return;
                            });
                        }
                    }
                    else {
                        this.msgType = 'error';
                        this.msgFlag = true;
                        this.msgDesc = "Select atleast one Discount";
                        this.msgTitle = '';
                    }
                }
                else {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "This plan is already associated with discount";
                    this.msgTitle = '';
                }
            });
    }

    // to select the row 
    selectedFee(index: number, discount: IDiscountRequest) {
        this.selectedRow = index;
        // if (filteredItem.length > 0) {
        //     for (var i = 0; i < filteredItem.length; i++) {
        //         this.getDiscountResponse[filteredItem[i].index].IsSelected = false;
        //         //discountType.IsSelected = this.items[0].IsSelected;
        //         this.items[filteredItem[i].index].DisNamerow_no = null;
        //         this.items[filteredItem[i].index].DisCoderow_no = null;
        //         const index: number = this.items.indexOf(discountType);
        //         this.items = this.items.splice(filteredItem[i].DiscountId);
        //         this.discountObj = <IDiscountRequest>{};
        //     }
        //     this.discountObj = <IDiscountRequest>{};
        //     this.discountObj.DiscountId = discountType.DiscountId;
        //     this.discountObj.StartEffectiveDate = null;
        //     this.discountObj.EndEffectiveDate = null;
        //     this.discountObj.StartDate = discountType.StartEffectiveDate;
        //     this.discountObj.EndDate = discountType.EndEffectiveDate;
        //     this.discountObj.DiscountName = discountType.DiscountName;
        //     this.discountObj.Description = discountType.Description;
        //     this.discountObj.IsSelected = discountType.IsSelected;
        //     this.discountObj.DisNamerow_no = discountType.StartEffectiveDate;
        //     this.discountObj.DisCoderow_no = discountType.EndEffectiveDate;
        //     this.discountObj.Isactive = true;
        //     this.discountObj.index = index;
        //     this.items.push(this.discountObj);
        //     this.boolChecked = true;
        // }
        this.selected = !this.selected;
        if (discount.IsSelected) {
            this.discountObj = <IDiscountRequest>{};
            this.discountObj.DiscountId = discount.DiscountId;
            this.discountObj.StartEffectiveDate = null;
            this.discountObj.EndEffectiveDate = null;
            this.discountObj.StartDate = discount.StartEffectiveDate;
            this.discountObj.EndDate = discount.EndEffectiveDate;
            this.discountObj.DiscountName = discount.DiscountName;
            this.discountObj.Description = discount.Description;
            this.discountObj.IsSelected = discount.IsSelected;
            this.discountObj.DisNamerow_no = null;
            this.discountObj.DisCoderow_no = null;
            this.discountObj.Isactive = true;
            this.discountObj.index = index;
            this.items.push(this.discountObj);
            this.boolChecked = true;
        }
        else {
            discount.DisNamerow_no = null;
            discount.DisCoderow_no = null;
            const index: number = this.items.indexOf(discount);
            this.items = this.items.filter(d => d.DiscountId !== discount.DiscountId);
        }
    }

    // to update the start date for selected row
    updateStartEffectiveDate(index: number, feeType: IDiscountRequest, startDate: IMyInputFieldChanged) {
        this.changeDate(startDate.value);
        var filteredItem = this.items.filter(d => d.DiscountId == feeType.DiscountId);
        if (filteredItem.length > 0) {
            filteredItem[0].StartEffectiveDate = new Date(startDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        }
    }

    // to update the end date for selected row
    updateEndEffectiveDate(feeTYpeid: number, feeType: IDiscountRequest, endDate: IMyInputFieldChanged) {

        var filteredItem = this.items.filter(d => d.DiscountId == feeType.DiscountId);
        if (filteredItem.length > 0) {
            filteredItem[0].EndEffectiveDate = new Date(endDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        }
    }

    // to validate the discounts details
    discountValidations(itemValues: any): boolean {
        this.datePlanStartDate.setHours(0, 0, 0, 0);
        this.datePlanEndDate.setHours(23, 59, 59, 997);
        this.datePlanStartDate = new Date(this.getPlanResponses.StartEffDate);
        this.datePlanEndDate = new Date(this.getPlanResponses.EndEffDate);
        if (itemValues.length > 1) {
            this.boolValid = false;
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "You can select only one discount at a time.";
            this.msgTitle = '';
            return this.boolValid;
        }
        if (new Date(this.datePlanEndDate.toDateString()) < new Date(new Date().toDateString())) {
            this.boolValid = false;
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Plan had Expired, update Plan End Effective Date";
            this.msgTitle = '';
            return this.boolValid;
        }
        if (this.items.length) {
            for (var i = 0; i < this.items.length; i++) {
                this.dateDiscStartDate = new Date(this.items[i].StartDate);
                this.dateDiscEndDate = new Date(this.items[i].EndDate);
                this.enteredStartDate = new Date(this.items[i].StartEffectiveDate);
                this.enteredEndDate = new Date(this.items[i].EndEffectiveDate);
                 if (this.items[i].StartEffectiveDate == "Invalid Date") {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Start Effective Date is Invalid";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                  if (this.items[i].EndEffectiveDate == "Invalid Date") {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "End Effective Date is Invalid";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                if (this.enteredStartDate == null) {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Enter Start Effective Date";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                else if (this.enteredEndDate == null) {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Enter End Effective Date";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                else if (new Date(this.enteredEndDate.toDateString()) < new Date(this.enteredStartDate.toDateString())) {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "End Effective Date should not be less than Start Effective Date";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                else {
                    if (new Date(this.enteredStartDate.toDateString()) < new Date(new Date().toDateString())
                        || new Date(this.enteredStartDate.toDateString()) < new Date(this.datePlanStartDate.toDateString())
                        || new Date(this.enteredEndDate.toDateString()) > new Date(this.datePlanEndDate.toDateString())
                        || new Date(this.enteredEndDate.toDateString()) > new Date(this.dateDiscEndDate.toDateString())) {
                        if (new Date(this.datePlanEndDate.toDateString()) < new Date(this.dateDiscEndDate.toDateString())) {
                            this.validDate = this.datePlanEndDate;
                        }
                        else {
                            this.validDate = this.dateDiscEndDate;
                        }
                        if (new Date(this.datePlanStartDate.toDateString()) > new Date(new Date())) {
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = "For Discount " + this.items[i].DiscountName + "  date range should be " +
                                this.datePlanStartDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"") + " to " + this.validDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
                            this.msgTitle = '';
                        }
                        else {
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = "For Discount " + this.items[i].DiscountName + "  date range should be " +
                                new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"") + " to " + this.validDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
                            this.msgTitle = '';
                        }
                        this.boolValid = false;
                        return this.boolValid;
                    }
                }
            }
        }
        this.boolValid = true;
        return this.boolValid;
    }

    changeDate(startDate) {
        //  let transformedDate = this.datePipe.transform(startDate.value, 'MM/dd/yyyy');
        // let myDate = new Date(transformedDate);
        if (startDate != null) {
            let date = new Date(startDate).toDateString();
            this.maxDate = new Date(date);
            this.myDatePickerOptionsGridEnd = {
                dateFormat: 'mm/dd/yyyy',
                disableUntil: {
                    year: this.maxDate.getFullYear(),
                    month: this.maxDate.getMonth() + 1,
                    day: this.maxDate.getDate() - 1
                },
                firstDayOfWeek: 'mo', sunHighlight: false,
                inline: false, height: '34px', width: '150px',
                alignSelectorRight: true, indicateInvalidDate: true,
                showClearBtn: false,
                showApplyBtn: false,
                showClearDateBtn: false,
                indicateInvalidDateRange: true,
                openSelectorTopOfInput: true,

            };
        }
    }

    setOutputFlag(e) {
        this.msgFlag = e;
    }
    // onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    //     if (!event.valid && event.value != "") {
    //         this.endinvalidDate = true;

    //         return;
    //     }
    //     else
    //         this.endinvalidDate = false;

    // }
}
