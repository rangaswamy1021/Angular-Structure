import { AccountInfoComponent } from './../../shared/accountprimaryinfo/account-info.component';
import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';

import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ITransactionActivityRequest } from "./models/transactionactivityrequest";
import { CustomerDetailsService } from "./services/customerdetails.service";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { ITripsContextResponse } from "../../shared/models/tripscontextresponse";
import { CustomerSearchService } from "../search/services/customer.search";
import { Features, Actions, defaultCulture, ActivitySource } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { ITransactionActivityResponse } from "./models/transactionactivityresponse";
import { IMyDrpOptions, IMyInputFieldChanged } from 'mydaterangepicker';
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
    selector: 'app-transaction-acitivities',
    templateUrl: './transaction-acitivities.component.html',
    styleUrls: ['./transaction-acitivities.component.css']
})
export class TransactionAcitivitiesComponent implements OnInit, AfterViewInit {
    disputesBtn: boolean = true;
    gridArrowTransactionAmount: boolean;
    gridArrowOutStandingAmount: boolean;
    gridArrowTOLLAMOUNT: boolean;
    gridArrowENTRYTRIPDATETIME: boolean;
    gridArrowVehicleNumber: boolean;
    gridArrowTAGREFID: boolean;
    gridArrowLOCATIONNAME: boolean;
    sortingDirection: boolean;
    sortingColumn: any;
    gridArrowCUSTTRIPID: boolean;
    disableSearchButton: boolean;
    searchByTransForm: FormGroup;
    msgDesc: string;
    msgType: string;
    msgFlag: boolean;
    tranActProb: Array<number> = [];
    txnType: string = "";
    validateNumberPattern = "[0-9]*";
    selectedTransTypeValue: string = "";
    PageSize: number = 10;
    customerContextResponse: ICustomerContextResponse;
    tollTypes: ICommonResponse[];
    transActivityReq: ITransactionActivityRequest;
    tranActResp: ITransactionActivityResponse[] = [];
    transactionActivitySearchForm: FormGroup;
    searchByTrans: string;
    accountId: number;
    transTypes: Array<any>;
    selectedAll: boolean = false;
    selectedTransType: any;
    sessionContextResponse: IUserresponse;
    p: number = 1;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    invalidDate: boolean = false;
    myDateRangePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false,
        showApplyBtn: false,
        showClearDateRangeBtn: false
    };

    pageChanged(event) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount) {
            this.endItemNumber = this.totalRecordCount;
        }
        this.transActivity(this.p, "");
        this.selectedAll = false;
    }

    constructor(private datePickerFormatService: DatePickerFormatService, private commonService: CommonService, private router: Router, private route: ActivatedRoute,
        private tripsContextService: TripsContextService, private customerDetailsService: CustomerDetailsService,
        private customerContext: CustomerContextService, private sessionContext: SessionService, private cdr: ChangeDetectorRef,
        private materialscriptService: MaterialscriptService) { }

    ngOnInit() {
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionContext.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }

        this.transTypes = [{
            key: 1,
            value: 'All Transactions'
        },
        {
            key: 2,
            value: 'Adjusted'
        },
        {
            key: 3,
            value: 'Disputes'
        },
        {
            key: 4,
            value: 'Violations'
        }
        ]

        this.customerContext.currentContext
            .subscribe(customerContext => { this.customerContextResponse = customerContext; this.accountId = this.customerContextResponse.AccountId }
            );

        this.transactionActivitySearchForm = new FormGroup({
            'serialNum': new FormControl('', Validators.pattern(this.validateNumberPattern)),
            'platNum': new FormControl(''),
            'transactionType': new FormControl(''),
            'timePeriod': new FormControl('', [Validators.required]),
        });

        this.searchByTransForm = new FormGroup({
            'searchByRadio': new FormControl('All Transactions')
        })
        this.patchValue();
        if (window.location.href.includes("?txnType")) {
            this.route.queryParams.subscribe(params => {
                this.txnType = params['txnType'];
            });
        } else {
            this.txnType = "";
        }

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CUSTOMERTRANSACTIONACTIVITIES];
        userEvents.ActionName = Actions[Actions.VIEW];
        this.userEventsCalling(userEvents);
        this.commonService.getTollTypesLookups(userEvents).subscribe(res => this.tollTypes = res);
        this.disableSearchButton = !this.commonService.isAllowed(Features[Features.CUSTOMERTRANSACTIONACTIVITIES], Actions[Actions.SEARCH], "");
        let tripContext: ITripsContextResponse = <ITripsContextResponse>{};
        this.tripsContextService.currentContext.subscribe(customerContext => tripContext = customerContext);
        if (tripContext) {
            if (tripContext.successMessage) {
                this.msgFlag = true;
                this.msgType = 'success';
                this.msgDesc = tripContext.successMessage;
            }
            tripContext = <ITripsContextResponse>{};
            this.tripsContextService.changeResponse(tripContext);
        }

        if (!this.tripsContextService.searchData) {
            this.pageChanged(1);
        }
        this.route.queryParams
            .filter(params => params.fromSearch).subscribe(
            params => {
                if (params.fromSearch) {
                    if (this.tripsContextService.searchData) {
                        this.p = this.tripsContextService.pageIndex;
                        this.transactionActivitySearchForm.controls['serialNum'].setValue(this.tripsContextService.searchData.TagId);
                        this.transactionActivitySearchForm.controls['platNum'].setValue(this.tripsContextService.searchData.VehicleNumber);
                        let rootSelect = this;
                        setTimeout(function () {
                            rootSelect.materialscriptService.material();
                        }, 100);
                        let startDate = new Date(this.tripsContextService.searchData.Entry_TripDateTime);
                        let enddate = new Date(this.tripsContextService.searchData.Exit_TripDateTime)
                        this.transactionActivitySearchForm.patchValue({
                            timePeriod: {
                                beginDate: {
                                    year: startDate.getFullYear(),
                                    month: startDate.getMonth() + 1,
                                    day: startDate.getDate()
                                },
                                endDate: {
                                    year: enddate.getFullYear(),
                                    month: enddate.getMonth() + 1,
                                    day: enddate.getDate()
                                }
                            }
                        });
                    }
                }
            })
    }

    ngAfterViewInit() {
        this.route.queryParams
            .filter(params => params.fromSearch).subscribe(
            params => {
                if (params.fromSearch) {
                    if (this.tripsContextService.searchData) {
                        this.p = this.tripsContextService.pageIndex;
                        if (this.tripsContextService.searchData.TollTransactionTypeCode != "") {
                            this.txnType = this.tripsContextService.searchData.TollTransactionTypeCode;
                        } else {
                            this.txnType = "";
                        }
                        this.selectedTransTypeValue = this.tripsContextService.searchData.TripStatusCode;
                        if (this.selectedTransTypeValue !== '') {
                            this.searchByTransForm.controls['searchByRadio'].setValue(this.selectedTransTypeValue);
                            if (this.selectedTransTypeValue === 'Disputes') {
                                this.disputesBtn = false;
                            }
                            this.pageChanged(this.p);
                        } else {
                            this.searchByTransForm.controls['searchByRadio'].setValue('All Transactions');
                            this.pageChanged(this.p);
                        }
                    }
                }
            });
        this.cdr.detectChanges();
    }

    onSelectionTransTypeChange(transType) {
        this.selectedTransType = Object.assign({}, this.selectedTransType, transType);
        if (this.selectedTransType.value === "All Transactions") {
            this.selectedTransType.value = "";
            this.selectedTransTypeValue = this.selectedTransType.value;
            this.pageChanged(1);
            this.disputesBtn = true;
        } else {
            this.selectedTransTypeValue = this.selectedTransType.value;
            this.pageChanged(1);
        }
    }

    resetTransActivity() {

        let strDate;
        let parsedDate = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitySearchForm.controls['timePeriod'].value);
        strDate = parsedDate;
        if (strDate == null || new Date(strDate[0]) != strDate[1]) {
            this.patchValue();
            this.pageChanged(1);
            this.txnType = "";
            this.searchByTransForm.controls['searchByRadio'].setValue('All Transactions');
        }

        if (this.transactionActivitySearchForm.get('transactionType').value != '' || this.transactionActivitySearchForm.get('platNum').value != '' || this.transactionActivitySearchForm.get('serialNum').value != '') {
            this.txnType = "";
            this.transactionActivitySearchForm.controls['platNum'].reset();
            this.transactionActivitySearchForm.controls['serialNum'].reset();
            this.disputesBtn = false;
            this.pageChanged(1);
        }
    }

    submitTransActivity() {
        if (this.transactionActivitySearchForm.invalid) {
            this.validateAllFormFields(this.transactionActivitySearchForm);
        }
        else {
            let userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.CUSTOMERTRANSACTIONACTIVITIES];
            userEvents.ActionName = Actions[Actions.SEARCH];
            this.userEventsCalling(userEvents);
            if (!this.invalidDate) {
                this.transActivity(this.p, userEvents);

            }
        }
    }

    transActivity(pageNumber: number, userEvents): void {
        let strDate;
        let parsedDate = this.datePickerFormatService.getFormattedDateRange(this.transactionActivitySearchForm.controls['timePeriod'].value);
        strDate = parsedDate;
        this.transActivityReq = <ITransactionActivityRequest>{};
        this.transActivityReq.AccountId = this.customerContextResponse.AccountId;
        this.transActivityReq.VehicleNumber = this.transactionActivitySearchForm.get('platNum').value;
        this.transActivityReq.TagId = this.transactionActivitySearchForm.get('serialNum').value;
        this.transActivityReq.TripId = "";
        const entry_TripDateTime = new Date(strDate[0]);
        const exit_TripDateTime = new Date(strDate[1]);
        this.transActivityReq.Entry_TripDateTime = new Date(entry_TripDateTime.getFullYear(), entry_TripDateTime.getMonth(), entry_TripDateTime.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.transActivityReq.Exit_TripDateTime = new Date(exit_TripDateTime.getFullYear(), exit_TripDateTime.getMonth(), exit_TripDateTime.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        this.transActivityReq.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.transActivityReq.PageNumber = pageNumber;
        this.transActivityReq.PageSize = this.PageSize;
        if (this.txnType == "")
            this.transActivityReq.TollTransactionTypeCode = ""
        else
            this.transActivityReq.TollTransactionTypeCode = this.txnType;
        this.transActivityReq.SortDir = this.sortingDirection == false ? 1 : 0;
        this.transActivityReq.SortColumn = this.sortingColumn;;
        this.transActivityReq.UserId = this.sessionContextResponse.userId;
        this.transActivityReq.User = this.sessionContextResponse.userName;
        this.transActivityReq.LoginId = this.sessionContextResponse.loginId;
        this.transActivityReq.IsSearchEventFired = true;
        this.transActivityReq.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.transActivityReq.IsPageLoad = true;
        this.transActivityReq.TripStatusCode = this.selectedTransTypeValue;
        $('#pageloader').modal('show');
        this.customerDetailsService.pagingBasicSearchTrips(this.transActivityReq, userEvents).subscribe(
            res => {
                this.tranActResp = res;
                $('#pageloader').modal('hide');
                if (this.tranActResp && this.tranActResp.length > 0) {
                    this.totalRecordCount = this.tranActResp[0].ReCount
                    if (this.endItemNumber > this.totalRecordCount) {
                        this.endItemNumber = this.totalRecordCount;
                    }
                }
                if (this.selectedTransTypeValue === "Disputes" && this.tranActResp.length >= 1) {
                    this.disputesBtn = false;
                } else {
                    this.disputesBtn = true;
                }
            },
            err => {
                this.msgFlag = true;
                this.msgType = 'error'
                this.msgDesc = err.message
            }
        );

    }

    viewTransactions(trans) {
        let tripContextResponse: ITripsContextResponse = <ITripsContextResponse>{};
        tripContextResponse.startDate = trans.Entry_TripDateTime;
        tripContextResponse.endDate = trans.Exit_TripDateTime;
        tripContextResponse.tripProblemId = trans.ProblemId;
        tripContextResponse.vehicleNumber = trans.VehicleNumber;
        tripContextResponse.tripIDs = [trans.TripId];
        tripContextResponse.tripNumber = trans.CustomerTripId;
        tripContextResponse.tripStatusCode = trans.TripStatusCode;
        tripContextResponse.tagId = trans.TagId;
        tripContextResponse.PostedDate = trans.PostedDate;
        tripContextResponse.tollTransactionType = trans.TollTransactionTypeCode;
        if (tripContextResponse.tripIDs.length >= 1) {
            this.tripsContextService.changeResponse(tripContextResponse);
            this.tripsContextService.saveRequest(this.transActivityReq, this.p, this.totalRecordCount)
            let link = ['/csc/customerdetails/transaction-activity-details/'];
            this.router.navigate(link);
        }
    }

    viewComplaints(trans) {
        this.tripsContextService.saveRequest(this.transActivityReq, this.p, this.totalRecordCount)
        this.router.navigate(['csc/helpdesk/view-complaints'], { queryParams: { id: trans.ProblemId, url: this.router.url } });
    }

    selectAllTransActivity() {
        for (var i = 0; i < this.tranActResp.length; i++) {
            this.tranActResp[i].selected = this.selectedAll;
        }
    }

    checkIfAllTransSelected(item) {
        this.selectedAll = this.tranActResp.every(function (item: any) {
            return item.selected == true;
        });
    }

    transferTransactions() {
        let tripContextResponse: ITripsContextResponse = <ITripsContextResponse>{};
        tripContextResponse.tripIDs = [];
        this.tranActProb = [];
        for (var i = 0; i < this.tranActResp.length; i++) {
            if (this.tranActResp[i].selected || this.selectedAll == true) {
                if (this.tranActResp[i].OutStandingAmount == 0) {
                    this.tranActProb.push(this.tranActResp[i].TripId)
                    this.msgFlag = true;
                    this.msgType = 'error'
                    this.msgDesc = "For " + this.tranActProb + " trip(s)  have zero outstanding amount, system will not allow to transfer to another customer";
                } else if (this.tranActResp[i].OutStandingAmount != 0) {
                    tripContextResponse.tripIDs.push(this.tranActResp[i].CustomerTripId);
                }
            }
        }

        if (tripContextResponse.tripIDs.length >= 1 && this.tranActProb.length <= 0) {
            this.tripsContextService.changeResponse(tripContextResponse);
            this.tripsContextService.saveRequest(this.transActivityReq, this.p, this.totalRecordCount);
            let link = ['/csc/customerdetails/transaction-transfer/'];
            this.router.navigate(link);
        } else if (tripContextResponse.tripIDs.length == 0 && this.tranActProb.length == 0) {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = "Select atleast one trip to transfer";
        }
    }

    createComplaints() {
        let tripContext: ITripsContextResponse = <ITripsContextResponse>{};
        tripContext.tripIDs = [];
        this.tranActProb = [];
        for (var i = 0; i < this.tranActResp.length; i++) {
            if (this.tranActResp[i].selected || this.selectedAll == true) {
                if (this.tranActResp[i].ProblemId > 0 && this.tranActResp[i].ProblemStatus != 'CLOSED') {
                    this.tranActProb.push(this.tranActResp[i].TripId);
                    this.msgFlag = true;
                    this.msgType = 'error'
                    this.msgDesc = "For " + this.tranActProb + " trip(s) complaint is already logged, system will not allow to create a new complaint for the same trip(s) until it is closed";
                } else if (this.tranActResp[i].ProblemId == 0 && this.tranActResp[i].ProblemStatus == '') {
                    tripContext.tripIDs.push(this.tranActResp[i].CustomerTripId);
                }
            }
        }

        if (tripContext.tripIDs.length >= 1 && this.tranActProb.length <= 0) {
            tripContext.referenceURL = 'csc/customerdetails/transaction-activities?fromSearch=true';
            this.tripsContextService.changeResponse(tripContext);
            this.tripsContextService.saveRequest(this.transActivityReq, this.p, this.totalRecordCount);
            let link = ['csc/helpdesk/create-complaint'];
            this.router.navigate(link);
        } else if (tripContext.tripIDs.length == 0 && this.tranActProb.length == 0) {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = 'Select atleast one trip to create complaint'
        }

    }

    disputeTransactions() {
        let tripContext: ITripsContextResponse = <ITripsContextResponse>{};
        tripContext.tripIDs = [];
        this.tranActProb = [];
        for (var i = 0; i < this.tranActResp.length; i++) {
            if (this.tranActResp[i].selected || this.selectedAll == true) {
                if (this.tranActResp[i].OutStandingAmount == 0) {
                    this.tranActProb.push(this.tranActResp[i].TripId)
                    this.msgFlag = true;
                    this.msgType = 'error'
                    this.msgDesc = "For " + this.tranActProb + " trip(s)  have zero outstanding amount, system will not allow to transfer to another customer";
                } else if (this.tranActResp[i].OutStandingAmount != 0) {
                    tripContext.tripIDs.push(this.tranActResp[i].CustomerTripId);
                    ////console.log("tranActProb: ", tripContext.tripIDs);
                }
            }
        }
        if (tripContext.tripIDs.length >= 1 && this.tranActProb.length <= 0) {
            // tripContext.referenceURL = 'csc/customerdetails/transaction-activities?fromSearch=true';
            let link = ['/csc/customerdetails/dispute-transaction/'];
            this.tripsContextService.saveRequest(this.transActivityReq, this.p, this.totalRecordCount);
            this.tripsContextService.changeResponse(tripContext);
            this.router.navigate(link);
        } else if (tripContext.tripIDs.length == 0 && this.tranActProb.length == 0) {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = "Select atleast one trip to dispute";
        }
    }

    setOutputFlag(e) { this.msgFlag = e; }

    userEventsCalling(userEvents) {
        // userEvents.FeatureName = Features[Features.CUSTOMERTRANSACTIONACTIVITIES];
        // userEvents.ActionName = userEvents.ActionName;
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = this.customerContextResponse.AccountId;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        ////console.log("userEvents: ", userEvents);
    }
    patchValue(): void {
        let date = new Date();

        this.transactionActivitySearchForm.patchValue({
            timePeriod: {
                beginDate: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate()
                },
                endDate: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate()
                }
            }
        });
    }

    sortDirection(SortingColumn) {
        this.gridArrowCUSTTRIPID = false;
        this.gridArrowLOCATIONNAME = false;
        this.gridArrowTAGREFID = false;
        this.gridArrowVehicleNumber = false;
        this.gridArrowENTRYTRIPDATETIME = false;
        this.gridArrowTOLLAMOUNT = false;
        this.gridArrowOutStandingAmount = false;
        this.gridArrowTransactionAmount = false;
        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "CUSTTRIPID") {
            this.gridArrowCUSTTRIPID = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "LOCATIONNAME") {
            this.gridArrowLOCATIONNAME = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "TAGREFID") {
            this.gridArrowTAGREFID = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "ENTRYTRIPDATETIME") {
            this.gridArrowENTRYTRIPDATETIME = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        else if (this.sortingColumn == "VehicleNumber") {
            this.gridArrowVehicleNumber = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        else if (this.sortingColumn == "TOLLAMOUNT") {
            this.gridArrowTOLLAMOUNT = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "OutStandingAmount") {
            this.gridArrowOutStandingAmount = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "OutStandingAmount") {
            this.gridArrowOutStandingAmount = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        else if (this.sortingColumn == "TransactionAmount") {
            this.gridArrowTransactionAmount = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        this.transActivity(this.p, "");
    }


    onDateRangeFieldChanged(event: IMyInputFieldChanged) {
        if (!event.valid && event.value != "") {
            this.invalidDate = true;
            return;
        }
        else
            this.invalidDate = false;
    }
    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
            const control = formGroup.get(controlName);
            if (control instanceof FormControl) {
                if (control.invalid) { }
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }
}
