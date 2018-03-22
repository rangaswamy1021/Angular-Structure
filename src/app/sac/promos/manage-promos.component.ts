import { Component, OnInit, Renderer, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { PromoService } from './services/promos.service';
import { Promos, Status } from './constants';
import { IPromosRequest } from './models/promosrequest';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { ActivitySource, Features, Actions, defaultCulture } from '../../shared/constants';
import { IPromosResponse } from './models/promoresponse';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { CommonService } from '../../shared/services/common.service';
import { List } from 'linqts';
import { IUserEvents } from '../../shared/models/userevents';
import { IMyDrpOptions, IMyInputFieldChanged } from 'mydaterangepicker';
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";



@Component({
    selector: 'app-manage-promos',
    templateUrl: './manage-promos.component.html',
    styleUrls: ['./manage-promos.component.scss']
})
export class ManagePromosComponent implements OnInit {
    gridArrowENDEFFECTIVEDATE: boolean;
    gridArrowSTARTEFFECTIVEDATE: boolean;
    gridArrowPROMOFACTOR_CODE: boolean;
    gridArrowFACEVALUE: boolean;
    gridArrowPROMOCODE: boolean;
    sortingDirection: boolean;
    sortingColumn: string;
    gridArrowPROMONAME: boolean;
    invalidEndDate: boolean;
    invalidStartDate: boolean;
    invalidDate: boolean;
    presentDate = new Date();
    // myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };
    // myDatePickerOptions: IMyDpOptions = {disableUntil: { year: this.presentDate.getFullYear(), month: this.presentDate.getMonth() + 1, day: this.presentDate.getDate()-1 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true };
    myDateRangePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false,
        showApplyBtn: false,
        showClearDateRangeBtn: false
    };
    myDatePickerOptions: ICalOptions = {
        disableUntil: { year: this.presentDate.getFullYear(), month: this.presentDate.getMonth() + 1, day: this.presentDate.getDate() - 1 }, dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDate: true, showClearBtn: false,
        showApplyBtn: false,
        showClearDateBtn: false
    };

    startDate: Date;
    endDate: Date;
    promoStatus1: string = "Active";
    promeofactor1: string;
    promoName1: string;
    promoCode1: string;
    isPageChanged: boolean = false;
    operation: string = "Add New";
    isUpdateFlag: boolean = false;
    isAddUpdatePanelNeedtoShow: boolean = false;
    dateRange: any;
    statusMessage: string = "";
    managePromoForm: FormGroup;
    seachPromoForm: FormGroup;
    sessionContextResponse: IUserresponse;
    descLength: number = 0;

    //Pattern
    validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
    validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
    validateNumberPattern = "[0-9]*";

    promoFactors = [];
    isCount: boolean = false;
    isCountAndPeriod: boolean = false;
    emptyStr = "";
    currentDate: Date;
    isSearched: boolean = false;

    promosRequest: IPromosRequest;
    systemActivities: ISystemActivities;
    promosResponse: IPromosResponse[];
    promosResSelected: IPromosResponse;
    noDetails: boolean = false;

    promoPayLimit: number;
    isPromoLimitExceeded: boolean = false;
    promoLimitExceededErrorMsg = this.emptyStr;

    updatePromoCode: string = this.emptyStr;

    // Paging start for Address History
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;


    //Search para
    promoName: string = this.emptyStr;
    promoCode: string = this.emptyStr;
    promoFactor: string = this.emptyStr;
    promoStatus: string = this.emptyStr;
    minDate = new Date();
    userEvents: IUserEvents;
    isAddAllowed: boolean;
    isUpdateAllowed: boolean;
    isSearchAllowed: boolean;
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;

    fromDate: Date = this.minDate;
    toDate: Date = this.minDate;
    pageChanged(event) {
        this.isPageChanged = true;
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getPromo(this.p);
    }

    constructor(private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService, private sessionService: SessionService, public renderer: Renderer,
        private router: Router, private promoService: PromoService
        , private commonService: CommonService) { }

    ngOnInit() {
        this.materialscriptService.material();

        this.gridArrowPROMOCODE = true;
        this.minDate.setDate(this.minDate.getDate());
        this.p = 1;
        this.endItemNumber = 10;
        this.sessionContextResponse = this.sessionService.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }

        this.bindFormControls();
        this.bindSearchFormControls();
        this.setUserActionObject();
        this.getAppParaKey();
        this.getPromoFactors();
        this.getPromo(this.p);
        this.isAddUpdatePanelNeedtoShow = false;
        this.isSearched = false;
        const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g, "").split('/');
        this.dateRange = null;// [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
        this.isAddAllowed = !this.commonService.isAllowed(Features[Features.PROMOS], Actions[Actions.CREATE], "");
        this.isUpdateAllowed = !this.commonService.isAllowed(Features[Features.PROMOS], Actions[Actions.UPDATE], "");
        this.isSearchAllowed = !this.commonService.isAllowed(Features[Features.PROMOS], Actions[Actions.SEARCH], "");


    }

    bindFormControls() {
        this.managePromoForm = new FormGroup({
            promoName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
            promoCode: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphaNumericsPattern)]),
            promoDescription: new FormControl('', [Validators.required, Validators.min(1), Validators.maxLength(255)]),
            faceValue: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(5), Validators.pattern(this.validateNumberPattern)]),
            promoFactor: new FormControl('', [Validators.required]),
            maxQuantity: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl(''),
        });

    }


    bindSearchFormControls() {
        this.seachPromoForm = new FormGroup({
            promoNameSearch: new FormControl(''),
            promoCodeSearch: new FormControl(''),
            promoFactorSearch: new FormControl('', ),
            promoStatusSearch: new FormControl('Active', ),
            dateRange: new FormControl('')
        });
    }
    // to show the how many characters are left for plan description
    descEvent(event: any) {
        this.descLength = 255 - event.target.value.length
    }

    getPromoFactors() {
        this.promoService.getPromos().subscribe(res => {
            this.promoFactors = res;
            // console.log(this.promoFactors + "--this.addressTypes");
        }
        );
    }
    checkPromoFactor(value) {

        if (value == Promos[Promos.COUNT]) {
            this.isCount = true;
            this.isCountAndPeriod = false;

        }
        else if (value == Promos[Promos.PERIOD]) {
            this.isCountAndPeriod = true;
            this.isCount = false;
            

        }
        else if (value == Promos[Promos.PERIODANDCOUNT]) {

            this.isCountAndPeriod = true;
            this.isCount = true;

        }
        else {
            this.isCount = this.isCountAndPeriod = false;
        }
        this.addRemoveValidation();
        this.materialscriptService.material();
    }

    addRemoveValidation() {
        if (this.isCount && !this.isCountAndPeriod) {

            this.managePromoForm.controls["maxQuantity"].setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]);
            this.managePromoForm.controls["startDate"].setValidators([]);
            this.managePromoForm.controls["endDate"].setValidators([]);
            this.managePromoForm.controls['maxQuantity'].updateValueAndValidity();
            this.managePromoForm.controls['startDate'].updateValueAndValidity();
            this.managePromoForm.controls['endDate'].updateValueAndValidity();
        }
        else if (this.isCountAndPeriod && !this.isCount) {

            this.managePromoForm.controls["maxQuantity"].setValidators([]);
            this.managePromoForm.controls["startDate"].setValidators([Validators.required]);
            this.managePromoForm.controls["endDate"].setValidators([Validators.required]);
            this.managePromoForm.controls['maxQuantity'].updateValueAndValidity();
            this.managePromoForm.controls['startDate'].updateValueAndValidity();
            this.managePromoForm.controls['endDate'].updateValueAndValidity();
        }
        else if (this.isCountAndPeriod && this.isCount) {
            this.managePromoForm.controls["maxQuantity"].setValidators([Validators.required, Validators.minLength(1), Validators.maxLength(4), Validators.pattern(this.validateNumberPattern)]);
            this.managePromoForm.controls["startDate"].setValidators([Validators.required]);
            this.managePromoForm.controls["endDate"].setValidators([Validators.required]);
            this.managePromoForm.controls['maxQuantity'].updateValueAndValidity();
            this.managePromoForm.controls['startDate'].updateValueAndValidity();
            this.managePromoForm.controls['endDate'].updateValueAndValidity();
        }
        else {
            //this.isCount = this.isCountAndPeriod = false;
        }
    }


    addPromo() {
        if (this.managePromoForm.valid) {
            this.promosRequest = <IPromosRequest>{};
            this.systemActivities = <ISystemActivities>{}
            var todayDate: Date = new Date();
            this.currentDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), todayDate.getHours(), todayDate.getMinutes(), todayDate.getSeconds(), todayDate.getMilliseconds());
            this.promosRequest.PROMONAME = this.managePromoForm.value.promoName;
            this.promosRequest.PROMOCODE = this.managePromoForm.value.promoCode;
            this.promosRequest.PROMODESCRIPTION = this.managePromoForm.value.promoDescription;

            if (parseFloat(this.managePromoForm.value.faceValue) > parseFloat(this.promoPayLimit.toString())) {
                this.statusMessage = "Face Value should not exceed maximum promo pay limit i.e , " + this.promoPayLimit;
                return;
            }

            this.promosRequest.FACEVALUE = this.managePromoForm.value.faceValue;
            this.promosRequest.MAXQUANTITY = this.managePromoForm.value.maxQuantity;
            this.promosRequest.PROMOFACTOR = this.managePromoForm.value.promoFactor;
            if (this.promosRequest.PROMOFACTOR == "COUNT") {
                this.promosRequest.STARTEFFECTIVEDATE = new Date();
                this.promosRequest.ENDEFFECTIVEDATE = new Date();
            }
            else {
                let strtDate = this.managePromoForm.controls['startDate'].value;
                let sdate = this.datePickerFormatService.getFormattedDate(strtDate.date);
                let endDate = this.managePromoForm.controls['endDate'].value;
                let edate = this.datePickerFormatService.getFormattedDate(endDate.date);

                this.promosRequest.STARTEFFECTIVEDATE = new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
                this.promosRequest.ENDEFFECTIVEDATE = new Date(edate.getFullYear(), edate.getMonth(), edate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
                if ((new Date(this.currentDate).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") == new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") ||
                    new Date(this.currentDate).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") == new Date(edate.getFullYear(), edate.getMonth(), edate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") ||
                    new Date(this.currentDate).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") >= new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") &&
                    new Date(this.currentDate).toLocaleDateString(defaultCulture).replace(/\u200E/g, "") <= new Date(edate.getFullYear(), edate.getMonth(), edate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")))

                    this.promosRequest.PromoStatus = Status[Status.Active];
                else if ((new Date(this.currentDate).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")) > (new Date(sdate.getFullYear(), sdate.getMonth(), sdate.getDate()).toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))) {
                    this.promosRequest.PromoStatus = Status[Status.Expired];
                }
                else {
                    this.promosRequest.PromoStatus = Status[Status.Future];
                }

            }
            this.promosRequest.CREATEDUSER = this.sessionContextResponse.userName;
            this.systemActivities.LoginId = this.sessionContextResponse.loginId;
            this.systemActivities.UserId = this.sessionContextResponse.userId;
            this.systemActivities.IsViewed = true;
            this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.promosRequest.SystemActivity = this.systemActivities;
            this.setUserActionObject();
            this.userEvents.ActionName = Actions[Actions.CREATE];
            //if(!this.invalidDate)
            if ((!this.invalidStartDate) || (!this.invalidEndDate))
                this.promoService.createPromos(this.promosRequest, this.userEvents).subscribe(res => {
                    if (res) {
                        this.msgFlag = true;
                        this.msgType = 'success'
                        this.msgDesc = 'Promo has been added successfully';
                        this.getPromo(this.p);
                        this.patchEmptyValues();
                        this.addRemoveValidation();
                        this.bindFormControls();
                        this.isCount = this.isCountAndPeriod = false;
                    }
                    else {
                        this.msgFlag = true;
                        this.msgType = 'error'
                        this.msgDesc = 'Error while addeding Promo';
                    }
                },
                    (err) => {
                        if (err._body) {
                            this.msgFlag = true;
                            this.msgType = 'error'
                            this.msgDesc = err.json();
                        }
                        else {
                            this.msgFlag = true;
                            this.msgType = 'error'
                            this.msgDesc = err.statusText.toString();
                        }
                    });
        }
        else {
            this.validateAllFormFields(this.managePromoForm);
        }
    }

    getPromo(pageNumber: number) {

        this.promosRequest = <IPromosRequest>{};
        this.systemActivities = <ISystemActivities>{}
        var todayDate: Date = new Date();
        let minDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g, "");
        let action = "VIEW";
        // Search parametres
        if (this.isSearched) {

            this.promosRequest.PROMONAME = this.seachPromoForm.controls['promoNameSearch'].value;
            this.promosRequest.PROMOCODE = this.seachPromoForm.controls['promoCodeSearch'].value;
            this.promosRequest.PROMOFACTOR = this.seachPromoForm.controls['promoFactorSearch'].value;
            if (this.seachPromoForm.value.promoStatusSearch == null) {
                this.promosRequest.PromoStatus = "Active";
            }
            else {
                this.promosRequest.PromoStatus = this.seachPromoForm.controls['promoStatusSearch'].value;
            }
            if (this.seachPromoForm.get('dateRange').value == "" || this.seachPromoForm.get('dateRange').value == null) {
                this.isSearched = false;
                this.promosRequest.STARTEFFECTIVEDATE = minDate;
                this.promosRequest.ENDEFFECTIVEDATE = minDate;
            }
            else {
                let parsedDate = this.datePickerFormatService.getFormattedDateRange(this.seachPromoForm.controls['dateRange'].value);
                const startEffectiveDate = new Date(parsedDate[0]);
                const endEffectiveDate = new Date(parsedDate[1]);

                this.promosRequest.STARTEFFECTIVEDATE = new Date(startEffectiveDate.getFullYear(), startEffectiveDate.getMonth(), startEffectiveDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
                this.promosRequest.ENDEFFECTIVEDATE = new Date(endEffectiveDate.getFullYear(), endEffectiveDate.getMonth(), endEffectiveDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
            }
            this.setUserActionObject();
            this.userEvents.ActionName = Actions[Actions.SEARCH];
            action = Actions[Actions.SEARCH];
            this.isPageChanged = false;
            this.promoCode1 = this.promosRequest.PROMOCODE;
            this.promoName1 = this.promosRequest.PROMONAME;
            this.promeofactor1 = this.promosRequest.PROMOFACTOR;
            this.promoStatus1 = this.promosRequest.PromoStatus;
            this.fromDate = this.promosRequest.STARTEFFECTIVEDATE;
            this.toDate = this.promosRequest.ENDEFFECTIVEDATE;
        }
        else {
            if (this.isPageChanged) {
                this.promosRequest.PROMONAME = this.promoName1;
                this.promosRequest.PROMOCODE = this.promoCode1;
                this.promosRequest.PROMOFACTOR = this.promeofactor1;
                this.promosRequest.PromoStatus = this.promoStatus1;
                this.promosRequest.STARTEFFECTIVEDATE = this.fromDate;
                this.promosRequest.ENDEFFECTIVEDATE = this.toDate;
            } else {
                this.userEvents = null;
                this.promosRequest.PROMONAME = this.emptyStr;
                this.promosRequest.PROMOCODE = this.emptyStr;
                this.promosRequest.PROMOFACTOR = this.emptyStr;
                this.promosRequest.PromoStatus = "Active";
                this.promosRequest.STARTEFFECTIVEDATE = minDate;
                this.promosRequest.ENDEFFECTIVEDATE = minDate;
            }
        }
        this.promosRequest.CREATEDUSER = this.sessionContextResponse.userName;
        this.systemActivities.LoginId = this.sessionContextResponse.loginId;
        this.systemActivities.UserId = this.sessionContextResponse.userId;
        this.systemActivities.IsViewed = !this.isSearched;
        this.systemActivities.IsSearch = this.isSearched;
        this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        this.systemActivities.FeaturesCode = "PROMOS";
        this.systemActivities.ActionCode = action; //
        this.promosRequest.SystemActivity = this.systemActivities;
        this.promosRequest.PageNumber = pageNumber;
        this.promosRequest.PageSize = 10;
        this.promosRequest.SortColumn = this.sortingColumn;
        this.promosRequest.SortDir = this.sortingDirection == false ? 1 : 0;

        if (!this.invalidDate)
            this.promoService.searchPromos(this.promosRequest, this.userEvents).subscribe(res => {
                if (res) {
                    this.promosResponse = res;
                    if (this.promosResponse.length > 0) {
                        this.noDetails = false;
                        console.log(res);
                        this.totalRecordCount = this.promosResponse[0].ReCount;
                        if (this.totalRecordCount < this.pageItemNumber) {
                            this.endItemNumber = this.totalRecordCount;
                        }
                    }
                }
                else {
                    this.noDetails = true;
                    this.promosResponse = [];
                    //this.statusMessage = "Error while getting the details";
                }

            },
                (err) => {
                    if (err._body) {
                        this.statusMessage = err.json();
                    }
                    else {
                        this.statusMessage = err.statusText.toString();
                    }
                });

    }

    patchEmptyValues() {
        this.managePromoForm.patchValue({
            promoName: this.emptyStr,
            promoCode: this.emptyStr,
            promoDescription: this.emptyStr,
            faceValue: this.emptyStr,
            promoFactor: this.emptyStr,
            maxQuantity: this.emptyStr,
            startDate: this.emptyStr,
            endDate: this.emptyStr,
        })
    }

    getAppParaKey() {
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.PromoPayLimit, this.userEvents).subscribe(
            res => {
                this.promoPayLimit = res;
                console.log("this.promoPayLimit" + this.promoPayLimit);
            }
        );
    }
    checkFaceValue() {
        this.promoLimitExceededErrorMsg = this.emptyStr;
        if (parseFloat(this.promoPayLimit.toString()) < parseFloat(this.managePromoForm.value.faceValue)) {
            this.isPromoLimitExceeded = true;
            this.promoLimitExceededErrorMsg = "Face Value should not exceed maximum promo pay limit i.e , " + this.promoPayLimit;
            return;
        }
        else {
            this.promoLimitExceededErrorMsg = this.emptyStr;
            this.isPromoLimitExceeded = false;
        }
    }

    disableControls() {
        //this.bindFormControls();
        this.managePromoForm.get('promoName').disable();
        this.managePromoForm.get('promoCode').disable();
        this.managePromoForm.get('faceValue').disable();
        this.managePromoForm.get('promoFactor').disable();
        this.managePromoForm.get('maxQuantity').disable();
        this.managePromoForm.get('startDate').disable();
        this.managePromoForm.get('endDate').disable();
    }

    enableControls() {
        this.managePromoForm.get('promoName').enable();
        this.managePromoForm.get('promoCode').enable();
        this.managePromoForm.get('faceValue').enable();
        this.managePromoForm.get('promoFactor').enable();
        this.managePromoForm.get('maxQuantity').enable();
        this.managePromoForm.get('startDate').enable();
        this.managePromoForm.get('endDate').enable();
    }

    editPromoClick(promoCode) {
        // alert(promoCode);
        this.isAddUpdatePanelNeedtoShow = true;
        this.updatePromoCode = promoCode;
        this.patchSelectedValues();
        this.disableControls();
        this.isUpdateFlag = true;
        this.materialscriptService.material();
    }

    patchSelectedValues() {
        let promosResponseList = new List<IPromosResponse>(this.newFunction());
        this.promosResSelected = promosResponseList.Where(x => x.PROMOCODE == this.updatePromoCode).SingleOrDefault();
        let factor = this.emptyStr;
        if (this.promosResSelected.PROMOFACTOR_CODE === "PERIOD AND COUNT") {
            factor = Promos[Promos.PERIODANDCOUNT];
        }
        else factor = this.promosResSelected.PROMOFACTOR_CODE;
        this.isCount = this.isCountAndPeriod = false;
        this.operation = "Update";
        this.getPromoFactors();
        this.managePromoForm.patchValue({
            promoName: this.promosResSelected.PROMONAME,
            promoCode: this.promosResSelected.PROMOCODE,
            promoDescription: this.promosResSelected.PROMODESCRIPTION,
            faceValue: this.promosResSelected.FACEVALUE,
            promoFactor: factor,
            maxQuantity: this.promosResSelected.MAXQUANTITY,
            startDate: this.promosResSelected.STARTEFFECTIVEDATE,
            endDate: this.promosResSelected.ENDEFFECTIVEDATE,
        })
    }
    private newFunction(): IPromosResponse[] {
        return this.promosResponse;
    }

    updatePromo() {
        if (this.updatePromoCode == this.emptyStr) {
            this.statusMessage = "Error occured updated code is empty";
            return
        };
        if (this.managePromoForm.valid) {
            this.promosRequest = <IPromosRequest>{};
            this.systemActivities = <ISystemActivities>{}
            var todayDate: Date = new Date();
            this.currentDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
            this.promosRequest.PROMONAME = this.promosResSelected.PROMONAME;
            this.promosRequest.PROMOCODE = this.updatePromoCode;
            this.promosRequest.PROMODESCRIPTION = this.managePromoForm.value.promoDescription;
            this.promosRequest.FACEVALUE = this.promosResSelected.FACEVALUE;
            this.promosRequest.MAXQUANTITY = this.promosResSelected.MAXQUANTITY;
            this.promosRequest.PROMOFACTOR = this.promosResSelected.PROMOFACTOR_CODE;
            this.promosRequest.STARTEFFECTIVEDATE = this.promosResSelected.STARTEFFECTIVEDATE;
            this.promosRequest.ENDEFFECTIVEDATE = this.promosResSelected.ENDEFFECTIVEDATE;
            this.promosRequest.CREATEDUSER = this.sessionContextResponse.userName;
            this.promosRequest.UPDATEDUSER = this.sessionContextResponse.userName;
            this.systemActivities.LoginId = this.sessionContextResponse.loginId;
            this.systemActivities.UserId = this.sessionContextResponse.userId;
            this.systemActivities.IsViewed = true;
            this.systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
            this.systemActivities.ActionCode = Actions[Actions.UPDATE];
            this.promosRequest.SystemActivity = this.systemActivities;
            this.setUserActionObject();
            this.userEvents.ActionName = Actions[Actions.UPDATE];
            this.promoService.updatePromos(this.promosRequest, this.userEvents).subscribe(res => {
                this.msgFlag = true;
                this.msgType = 'success'
                this.msgDesc = 'Promo has been updated successfully';
                this.isUpdateFlag = false;
                this.operation = "Add New";
                this.getPromo(this.p);
                this.isAddUpdatePanelNeedtoShow = false;
            },
                (err) => {
                    if (err._body) {
                        this.msgFlag = true;
                        this.msgType = 'error'
                        this.msgDesc = err.json();
                    }
                    else {
                        this.msgFlag = true;
                        this.msgType = 'error'
                        this.msgDesc = err.statusText.toString();
                    }
                });
        }
        else {
            // alert user
        }
    }

    addLinkClick() {
        this.prepareForforAdd();
        this.managePromoForm.reset();
        this.materialscriptService.material();
    }

    cancelClick() {
        this.isCount = this.isCountAndPeriod = false;
        this.operation = "Add New";
        this.isAddUpdatePanelNeedtoShow = false;
        this.isUpdateFlag = false;
        this.enableControls();
        this.patchEmptyValues();
        this.addRemoveValidation();
    }

    resetClick() {
        this.isCount = this.isCountAndPeriod = false;
        this.prepareForforAdd();
    }

    prepareForforAdd() {
        this.operation = "Add New";
        this.isAddUpdatePanelNeedtoShow = true;
        this.isUpdateFlag = false;
        this.enableControls();
        this.patchEmptyValues();
        this.bindFormControls();
        this.addRemoveValidation();
    }

    validateAllFormFields(formGroup: FormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(controlName => {  //{2}
            const control = formGroup.get(controlName);             //{3}
            if (control instanceof FormControl) {             //{4}
                if (control.invalid) {
                    console.log(controlName);
                    console.log(control.errors);
                }
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
            }
        });
    }

    searchPromo() {
        this.isSearched = true;
        this.totalRecordCount = 0;
        this.p = 1;
        this.startItemNumber = 1;
        this.endItemNumber = 10;
        this.getPromo(this.p);
    }
    resetSearchPromo() {
        this.promoCode1 = this.emptyStr;
        this.promoName1 = this.emptyStr;
        this.promeofactor1 = this.emptyStr;
        this.promoStatus1 = "Active";
        this.fromDate = this.minDate;
        this.toDate = this.minDate;
        this.seachPromoForm.patchValue({
            promoNameSearch: this.emptyStr,
            promoCodeSearch: this.emptyStr,
            promoFactorSearch: this.emptyStr,
            promoStatusSearch: this.emptyStr,
        })
        this.isSearched = false;
        this.isPageChanged = false;
        this.p = 1;
        this.endItemNumber = 10;
        this.startItemNumber = 1;
        this.seachPromoForm.controls['promoStatusSearch'].setValue("Active");
        this.getPromo(this.p);
        this.operation = "Add New";
        this.isAddUpdatePanelNeedtoShow = false;
        this.isUpdateFlag = false;
        this.enableControls();
        this.patchEmptyValues();
        this.addRemoveValidation();
    }
    setUserActionObject() {
        this.userEvents = <IUserEvents>{};
        this.userEvents.ActionName = Actions[Actions.VIEW];
        this.userEvents.FeatureName = Features[Features.PROMOS];
        this.userEvents.PageName = this.router.url;
        this.userEvents.CustomerId = this.sessionContextResponse.userId;
        this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        this.userEvents.UserName = this.sessionContextResponse.userName;
        this.userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    setOutputFlag(e) {
        this.msgFlag = e;
    }
    startDateChange(startDate) {
        if (!startDate.valid && startDate.value != "") {
            this.invalidStartDate = true;
        }
        else
            this.invalidStartDate = false;

        this.startDate = startDate.value;
        if (this.startDate > this.endDate) {
            this.endDate = this.startDate;
            let endingDate = new Date();
            endingDate = new Date(this.endDate);

            this.managePromoForm.patchValue({
                endDate: {
                    date: {
                        year: endingDate.getFullYear(),
                        month: endingDate.getMonth() + 1,
                        day: endingDate.getDate()
                    }
                }
            });

        }
    }

    endDateChange(endDate) {
        if (!endDate.valid && endDate.value != "") {
            this.invalidEndDate = true;
        }
        else
            this.invalidEndDate = false;
        this.endDate = endDate.value;
        if (this.startDate == undefined) {
            let todayDate = new Date();
            this.presentDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);

            this.startDate = this.presentDate;
        }

        if (this.startDate > this.endDate) {
            this.startDate = this.endDate;
            let startingDate = new Date();
            startingDate = new Date(this.startDate);
            this.managePromoForm.patchValue({
                startDate: {
                    date: {
                        year: startingDate.getFullYear(),
                        month: startingDate.getMonth() + 1,
                        day: startingDate.getDate()
                    }
                }
            });
        }


    }


    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    onDateRangeFieldChanged(event: IMyInputFieldChanged) {
        let date = this.seachPromoForm.controls["dateRange"].value;
        if (!event.valid && event.value != "") {
            this.invalidDate = true;

            return;
        }
        else
            this.invalidDate = false;

    }

    sortDirection(SortingColumn) {
        this.gridArrowPROMONAME = false;
        this.gridArrowPROMOCODE = false;
        this.gridArrowFACEVALUE = false;
        this.gridArrowPROMOFACTOR_CODE = false;
        this.gridArrowSTARTEFFECTIVEDATE = false;
        this.gridArrowENDEFFECTIVEDATE = false;


        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "PROMONAME") {
            this.gridArrowPROMONAME = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "PROMOCODE") {
            this.gridArrowPROMOCODE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "FACEVALUE") {
            this.gridArrowFACEVALUE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "PROMOFACTOR_CODE") {
            this.gridArrowPROMOFACTOR_CODE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "STARTEFFECTIVEDATE") {
            this.gridArrowSTARTEFFECTIVEDATE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "ENDEFFECTIVEDATE") {
            this.gridArrowENDEFFECTIVEDATE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        this.getPromo(this.p);
    }


}



