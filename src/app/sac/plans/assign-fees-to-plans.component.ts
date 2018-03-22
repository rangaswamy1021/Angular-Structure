import { SubSystem, ActivitySource, Features, Actions, SubFeatures, defaultCulture } from "../../shared/constants";
import { IFeeTypesRequest } from './../fees/models/feetypes.request';
import { IFeeRequest } from './models/feerequest';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PlansService } from './services/plans.service';
import { IFeeTypesResponse } from '../fees/models/feetypes.response';
import { FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { IPlanRequest } from './models/plansrequest';
import { IPlanResponse } from './models/plansresponse';
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { isDate } from "util";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
    selector: 'app-assign-fees-to-plans',
    templateUrl: './assign-fees-to-plans.component.html',
    styleUrls: ['./assign-fees-to-plans.component.css']
})

export class AssignFeesToPlansComponent implements OnInit {
    endinvalidDate: boolean;
    startinvalidDate: boolean;
    invalid: boolean;
    startDateModel = {};
    endDateModel = {};
    searchValue: any;
    // variable declaration
    minDate = new Date();
    maxDate: Date;

    _bsValue: Date;
    get bsValue(): Date {
        return this._bsValue;
    }
    set bsValue(v: Date) {
        this._bsValue = v;
    }
    feeTypesResponse: IFeeTypesResponse[] = <IFeeTypesResponse[]>{};
    selectedRow: number;
    selected: boolean = false;
    feelen: number;
    items = [];
    StartDate: Date;
    planId: number;
    planrequest: IPlanRequest = <IPlanRequest>{};
    planResponse: IPlanResponse;
    getPlanResponses: IPlanResponse = <IPlanResponse>{};
    feeObj: IFeeRequest = <IFeeRequest>{};
    datePlanStartDate = new Date();
    datePlanEndDate: Date = new Date();
    dateFeeEndDate = new Date();
    dateFeeStartDate = new Date();
    enteredStartDate = new Date();
    enteredEndDate = new Date();
    validDate = new Date();
    boolValid: boolean = true;
    status: any;
    boolFeeBtn: boolean = false;
    disableButton: boolean = false;
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;
    myDatePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
        firstDayOfWeek: 'mo', sunHighlight: false, inline: false,
        alignSelectorRight: true, indicateInvalidDate: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
    };
    startDate: Date[];
    myDatePickerOptionsGridStart: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, height: '34px', width: '200px',
        alignSelectorRight: true, indicateInvalidDate: true,
        openSelectorTopOfInput: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
    };
    myDatePickerOptionsGridEnd: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo', sunHighlight: false,
        inline: false, height: '34px', width: '200px',
        alignSelectorRight: true, indicateInvalidDate: true,
        openSelectorTopOfInput: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
    };

    constructor(private plansService: PlansService, private router: Router,
        private route: ActivatedRoute, private Context: SessionService, private commonService: CommonService,private materialscriptService: MaterialscriptService) { }

    ngOnInit() {
        const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
        this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];

        this.disableButton = !this.commonService.isAllowed(Features[Features.PLANS], Actions[Actions.CREATE], "");
        this.planId = +this.route.snapshot.paramMap.get('id');
        this.status = this.route.snapshot.paramMap.get('status');
        if (this.status == "false") {
            this.boolFeeBtn = true;
        }
        else {
            this.boolFeeBtn = false;
        }
        this.getFeeTypes(this.planId);
        this.bindPlanDetails(this.planId);
        this.materialscriptService.material();
    }

    // to get the active fees for the current date
    getFeeTypes(id: number) {
        this.plansService.getActiveFeeTypes(id.toString()).subscribe(res => {
            this.feeTypesResponse = res;
        });
    }

    // to get the plan detalis based on planid
    bindPlanDetails(id: number) {
        this.plansService.getPlanByPK(id.toString()).subscribe(
            res => {
                this.planResponse = <IPlanResponse>res;
                if (res) {
                    this.getPlanResponses.StartEffDate = this.planResponse.StartEffDate;
                    this.getPlanResponses.EndEffDate = this.planResponse.EndEffDate;

                    let startDate = new Date();
                    startDate = new Date(this.planResponse.StartEffDate);
                    this.startDateModel = {
                        date: {
                            year: startDate.getFullYear(),
                            month: startDate.getMonth() + 1,
                            day: startDate.getDate()
                        }
                    };
                    let endDate = new Date();
                    endDate = new Date(this.planResponse.EndEffDate);
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

    // to select the fee row
    selectedFee(index: number, feeType: IFeeTypesRequest) {
        this.selectedRow = index;
        this.selected = !this.selected;
        if (feeType.IsSelected) {
            this.feeObj = <IFeeRequest>{};
            this.feeObj.Id = feeType.FeeTypeId;
            this.feeObj.DtStartEffDate = null;
            this.feeObj.DtEndEffDate = null;
            this.feeObj.StartDate = new Date(feeType.StartDate);
            this.feeObj.EndDate = new Date(feeType.EndDate);
            this.feeObj.FeeName = feeType.FeeName;
            this.feeObj.IsActive = true;
            this.items.push(this.feeObj);
        }
        else {
            feeType.FeeNamerow_no = null;
            feeType.FeeCoderow_no = null;
            this.items = this.items.filter(d => d.Id !== feeType.FeeTypeId);
        }
    }

    // to add the fees to the plans
    addFees() {
        if (this.items.length > 0) {
            this.boolValid = this.feeValidations(this.items);
            if (this.boolValid) {
                this.planrequest.FeeTypes = this.items.map(x => Object.assign({}, x));
                this.planrequest.PlanId = this.planId;
                this.planrequest.UpdateUser = this.Context.customerContext.userName;
                let userEvents = <IUserEvents>{};
                userEvents.FeatureName = Features[Features.PLANS];
                userEvents.SubFeatureName = SubFeatures[SubFeatures.FEEASSOCIATE];
                userEvents.ActionName = Actions[Actions.CREATE];
                userEvents.PageName = this.router.url;
                userEvents.CustomerId = 0;
                userEvents.RoleId = parseInt(this.Context.customerContext.roleID);
                userEvents.UserName = this.Context.customerContext.userName;
                userEvents.LoginId = this.Context.customerContext.loginId;
                this.plansService.createPlanFeeAssociation(this.planrequest, userEvents).subscribe(res => {
                    if (res) {
                        if (this.status == "false") {
                            this.items = [];
                            this.router.navigate(['/sac/plans/assign-discounts-to-plans', this.status, this.planId]);
                        }
                        else {
                            this.getFeeTypes(this.planId);
                            this.msgType = 'success';
                            this.msgFlag = true;
                            this.msgDesc = "Fee(s) has been added successfully";
                            this.msgTitle = '';
                        }
                    }
                    else {
                        this.router.navigate(['/sac/plans/assign-discounts-to-plans', this.status, this.planId]);
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
        }
        else {
            if (this.status == "true") {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Select atleast one Fee";
                this.msgTitle = '';
            }
            else {
                this.router.navigate(['/sac/plans/assign-discounts-to-plans', false, this.planId]);
            }
        }
    }

    // to validate the entered fee details
    feeValidations(itemValues: any): boolean {
        this.datePlanStartDate.setHours(0, 0, 0, 0);
        this.datePlanEndDate.setHours(23, 59, 59, 997);
        this.datePlanStartDate = new Date(this.getPlanResponses.StartEffDate);
        this.datePlanEndDate = new Date(this.getPlanResponses.EndEffDate);
        if (new Date(this.datePlanEndDate.toDateString()) < new Date(new Date().toDateString())) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Plan had Expired, update Plan End Effective Date";
            this.msgTitle = '';
            this.boolValid = false;
            return this.boolValid;
        }
        if (this.items.length > 0) {
            for (var i = 0; i < this.items.length; i++) {
                this.dateFeeStartDate = new Date(this.items[i].StartDate);
                this.dateFeeEndDate = new Date(this.items[i].EndDate);

                this.enteredStartDate = new Date(this.items[i].DtStartEffDate);
                this.enteredEndDate = new Date(this.items[i].DtEndEffDate);
                if (this.items[i].DtStartEffDate == "Invalid Date") {
                    this.boolValid = false;
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Start Effective Date is Invalid";
                    this.msgTitle = '';
                    return this.boolValid;
                }
                 if (this.items[i].DtEndEffDate== "Invalid Date") {
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
                        || new Date(this.enteredStartDate.toDateString()) > new Date(this.enteredEndDate.toDateString())
                        || new Date(this.enteredStartDate.toDateString()) < new Date(this.datePlanStartDate.toDateString())
                        || new Date(this.enteredEndDate.toDateString()) > new Date(this.datePlanEndDate.toDateString())
                        || new Date(this.enteredEndDate.toDateString()) > new Date(this.dateFeeEndDate.toDateString())) {
                        if (new Date(this.datePlanEndDate.toDateString()) < new Date(this.dateFeeEndDate.toDateString())) {
                            this.validDate = this.datePlanEndDate;
                        }
                        else {
                            this.validDate = this.dateFeeEndDate;
                        }
                        if (new Date(this.datePlanStartDate.toDateString()) > new Date(new Date().toDateString())) {
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = "For Fee Type " + this.items[i].FeeName + "  date range should be " +
                                this.datePlanStartDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"") + " to " + this.validDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
                            this.msgTitle = '';
                        }
                        else {
                            this.msgType = 'error';
                            this.msgFlag = true;
                            this.msgDesc = "For Fee Type " + this.items[i].FeeName + "  date range should be " +
                                new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"") + " to " + this.validDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
                            this.msgTitle = '';
                        }
                        this.boolValid = false;
                        return this.boolValid;
                    }
                }
            }
            this.boolValid = true;
            return this.boolValid;
        }
    }

    // to update the start date of selected row
    updateStartEffectiveDate(index: number, feeType: IFeeTypesRequest, startDate: IMyInputFieldChanged) {

        this.changeDate(startDate.value);
        var filteredItem = this.items.filter(d => d.Id == feeType.FeeTypeId);
        if (filteredItem.length > 0) {
            filteredItem[0].DtStartEffDate = new Date(startDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        }
    }

    // to update the end date of selected row
    updateEndEffectiveDate(feeTYpeid: number, feeType: IFeeTypesRequest, endDate: IMyInputFieldChanged) {

        var filteredItem = this.items.filter(d => d.Id == feeType.FeeTypeId);
        if (filteredItem.length > 0)
            filteredItem[0].DtEndEffDate = new Date(endDate.value).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    }

    changeDate(startDate) {
        // let transformedDate = this.datePipe.transform(startDate.value, 'MM/dd/yyyy');
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
                openSelectorTopOfInput: true,
                firstDayOfWeek: 'mo', sunHighlight: false,
                inline: false, height: '34px', width: '200px',
                alignSelectorRight: true, indicateInvalidDate: true,
                showClearBtn: false,
                showApplyBtn: false,
                showClearDateBtn: false
            };
        }
    }

    // to cancel the event
    cancelClick() {
        if (!this.boolFeeBtn) {
            this.router.navigate(['/sac/plans/update-plans', this.planId]);
        }
        else {
            this.router.navigateByUrl("/sac/plans/view-plans");
        }
    }

    // to go to plans page
    prevoiusPlans() {
        this.router.navigate(['/sac/plans/create-plans', this.planId]);
    }

    resetClick() {
        this.getFeeTypes(this.planId);
        this.items = [];
    }

    setOutputFlag(e) {
        this.msgFlag = e;
    }


    validateDateFormat(inputDate: any) {

        let strDateRangeArray = inputDate.slice(",");
        if (strDateRangeArray.length < 2) {
            this.invalid = true;
            const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
            this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
            return;
        }
        else {
            if ((strDateRangeArray[0] != null) || (strDateRangeArray[1] != null)) {
                if (!isDate(new Date(strDateRangeArray[0])) || !isDate(new Date(strDateRangeArray[1]))) {
                    this.invalid = true;
                    const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
                    this.startDate = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
                    return;
                }
            }
            else {
                this.invalid = true;
            }
        }
    }



    validateDateMessages(event, val) {
        debugger;
        if (val[0] && val[1]) {
            if (isDate(new Date(val[0])) && isDate(new Date(val[1]))) {
                this.invalid = false;
            }
        }
        else {
            this.invalid = true;
        }
    }

    // onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    //     if (!event.valid && event.value != "") {
    //         this.endinvalidDate = true;

    //         return;
    //     }
    //     else {
    //         this.endinvalidDate = false;
    //     }
}







    // changeDate(startDate) {
    //     //  let transformedDate = this.datePipe.transform(startDate.value, 'MM/dd/yyyy');
    //     // let myDate = new Date(transformedDate);
    //     if (startDate != null) {
    //         let date = new Date(startDate).toDateString();
    //         this.maxDate = new Date(date);
    //     }
    // }

    // changeDate(startDate) {
    //     let dateval = startDate.date;
    //     let start = new Date(dateval.year, (dateval.month) - 1, dateval.day);
    //     if (start != null) {
    //         let date = new Date(start).toDateString();
    //         this.maxDate = new Date(date);
    //         this.myDatePickerOptionsGridEnd = {
    //             dateFormat: 'mm/dd/yyyy',
    //             disableUntil: {
    //                 year: this.maxDate.getFullYear(),
    //                 month: this.maxDate.getMonth() + 1,
    //                 day: this.maxDate.getDate() - 1
    //             },
    //             firstDayOfWeek: 'mo', sunHighlight: false,
    //             inline: false,
    //             alignSelectorRight: false, indicateInvalidDate: true
    //         };

    //           this.myDatePickerOptions1.disableUntil = { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() - 1 };
    //     }
    // }



    // // to update the start date of selected row
    // updateStartEffectiveDate(index: number, feeType: IFeeTypesRequest, startDate) {
    //     this.changeDate(startDate);
    //     var filteredItem = this.items.filter(d => d.Id == feeType.FeeTypeId);
    //     if (filteredItem.length > 0) {
    //         let dateval = startDate.date;
    //         let start = new Date(dateval.year, (dateval.month) - 1, dateval.day, 0, 0, 0, 0);
    //         // filteredItem[0].DtStartEffDate.setHours(0, 0, 0, 0);
    //         filteredItem[0].DtStartEffDate = new Date(start.toLocaleDateString(defaultCulture).replace(/\u200E/g,""));
    //     }
    // }

    // // to update the end date of selected row
    // updateEndEffectiveDate(feeTYpeid: number, feeType: IFeeTypesRequest, endDate) {
    //     var filteredItem = this.items.filter(d => d.Id == feeType.FeeTypeId);
    //     if (filteredItem.length > 0) {
    //         let dateval = endDate.date;
    //         let eDate = new Date(dateval.year, (dateval.month) - 1, dateval.day, 23, 59, 59, 997);
    //         // filteredItem[0].DtEndEffDate.setHours(23, 59, 59, 997);
    //         filteredItem[0].DtEndEffDate = new Date(eDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,""));
    //     }
    // }
