import { Component, OnInit } from '@angular/core';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IJournalTypeResponse } from "./models/journaltyperesponse";
import { IGLAccountRequest } from "./models/glaccountrequest";
import { IGLAccountResponse } from "./models/glaccountresponse";
import { ISpecialJournalRequest } from "./models/specialjournalrequest";
import { ISpecialJournalResponse } from "./models/specialjournalresponse";
import { AccountingService } from "./services/accounting.service";
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IMyDrpOptions } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
    selector: 'app-special-journal',
    templateUrl: './special-journal.component.html',
    styleUrls: ['./special-journal.component.scss']
})
export class SpecialJournalComponent implements OnInit {
    gridArrowGL_TXNID: boolean;
    sortingDirection: boolean;
    sortingColumn: any;
    gridArrowTxntype: boolean;
    gridArrowCustomerId: boolean;
    invalidDate: boolean = false;
    customerId: number;
    chartOfAcntId: number;
    specialJournalId: number;
    toDate: any;
    fromDate: any;
    searchClick: boolean = false;
    disableSearchButton: boolean;

    specialJournalResponseLength: number;
    // timePeriodValue: Date[];
    objreqSystemActivities: ISystemActivities;
    objjournaltyperesponse: IJournalTypeResponse;
    objglaccountrequest: IGLAccountRequest;
    objglaccountresponse: IGLAccountResponse;
    objspecialjournalrequest: ISpecialJournalRequest = <ISpecialJournalRequest>{};
    objspecialjournalresponse: ISpecialJournalResponse[];
    searchSpecialJournalForm: FormGroup;
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    validateNumberPattern = "[0-9]*";
    myDateRangePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy',
        firstDayOfWeek: 'mo',
        sunHighlight: true,
        height: '34px',
        width: '260px',
        inline: false,
        alignSelectorRight: false,
        indicateInvalidDateRange: true,
        showClearBtn: false,
        showApplyBtn: false,
        showClearDateRangeBtn: false
    };

    constructor(private materialscriptService: MaterialscriptService, private objSessionService: SessionService, private commonService: CommonService, private accountingservices: AccountingService, private router: Router, private datePickerFormatService: DatePickerFormatService) { }

    ngOnInit() {
        this.sortingColumn = "GL_TXNID";
        this.materialscriptService.material();
        this.searchSpecialJournalForm = new FormGroup({
            'journalTypeSelected': new FormControl(''),
            'glAccountSelected': new FormControl(''),
            'customer': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
            'dateRange': new FormControl('', [Validators.required])
        });
        $('#pageloader').modal('show');
        this.p = 1;
        this.endItemNumber = this.pageItemNumber;
        this.getJournaltypeDropDownDetails();
        this.dateBind();
        this.searchSpecialJournalForm.controls["journalTypeSelected"].setValue(0);
        this.searchSpecialJournalForm.controls["glAccountSelected"].setValue(0);
        let userEvents: IUserEvents = <IUserEvents>{};
        userEvents.ActionName = Actions[Actions.VIEW];
        this.userEventsCalling(userEvents);
        this.getSpecialJournalDetails(this.p, userEvents);
        this.disableSearchButton = !this.commonService.isAllowed(Features[Features.SPECIALJOURNAL], Actions[Actions.SEARCH], "");
        $('#pageloader').modal('hide');
    }
    pageChanged(event) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getSpecialJournalDetails(this.p);
    }

    getJournaltypeDropDownDetails(): void {
        this.objreqSystemActivities = <ISystemActivities>{};
        this.objreqSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
        this.objreqSystemActivities.UserId = this.objSessionService.customerContext.userId;
        this.objreqSystemActivities.User = this.objSessionService.customerContext.userName;
        this.objreqSystemActivities.IsViewed = true;
        this.objreqSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        let userEvents = <IUserEvents>{};
        userEvents.ActionName = Actions[Actions.VIEW];
        this.userEventsCalling(userEvents);
        this.accountingservices.getJournalTypeDrop(this.objreqSystemActivities, userEvents).subscribe(res => {
            this.objjournaltyperesponse = res;
        });
    }
    dateBind(): void {
        let date = new Date();
        this.searchSpecialJournalForm.patchValue({
            dateRange: {
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
        let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.searchSpecialJournalForm.controls['dateRange'].value);
        this.fromDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
        this.toDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
        // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
        // this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
        // this.fromDate = new Date(new Date(this.timePeriodValue[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
        // this.toDate = new Date(new Date(this.timePeriodValue[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    }
    reset() {
        this.searchClick = false;
        this.chartOfAcntId = null;
        this.specialJournalId = null;
        this.customerId = null;
        this.searchSpecialJournalForm.reset();
        this.dateBind();
        this.searchSpecialJournalForm.controls["journalTypeSelected"].setValue(0);
        this.searchSpecialJournalForm.controls["glAccountSelected"].setValue(0);
        this.getSpecialJournalDetails(this.p = 1);
        this.materialscriptService.material();
    }
    specialJournalSearchOnClick() {
        if (this.searchSpecialJournalForm.valid && this.invalidDate == false) {
            this.searchClick = true;
            let userEvents: IUserEvents = <IUserEvents>{};
            userEvents.ActionName = Actions[Actions.SEARCH];
            this.userEventsCalling(userEvents);
            this.startItemNumber = 1;
            this.getSpecialJournalDetails(this.p = 1, userEvents);
        } else {
            this.validateAllFormFields(this.searchSpecialJournalForm);
        }
    }

    onDateRangeFieldChanged(event: IMyInputFieldChanged) {
        if (!event.valid && event.value != "") {
            this.invalidDate = true;
        }
        else {
            this.invalidDate = false;
        }
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    getSpecialJournalDetails(pageNumber: number, userEvents?: IUserEvents): void {
        this.objreqSystemActivities = <ISystemActivities>{};
        this.objspecialjournalrequest = <ISpecialJournalRequest>{};
        this.objreqSystemActivities.LoginId = this.objSessionService.customerContext.loginId;
        this.objreqSystemActivities.UserId = this.objSessionService.customerContext.userId;
        this.objreqSystemActivities.IsSearch = true;
        this.objreqSystemActivities.IsViewed = true;
        if (this.searchClick) {
            // this.objspecialjournalrequest.StartDate = new Date(new Date(this.timePeriodValue[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            // this.objspecialjournalrequest.EndDate = new Date(new Date(this.timePeriodValue[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.searchSpecialJournalForm.controls['dateRange'].value);
            this.objspecialjournalrequest.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
            this.objspecialjournalrequest.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
            this.objspecialjournalrequest.SpecialJournalId = this.searchSpecialJournalForm.controls['journalTypeSelected'].value;
            this.objspecialjournalrequest.ChartOfAccountId = this.searchSpecialJournalForm.controls['glAccountSelected'].value;
            this.objspecialjournalrequest.CustomerId = this.searchSpecialJournalForm.get('customer').value;
            this.fromDate = this.objspecialjournalrequest.StartDate;
            this.toDate = this.objspecialjournalrequest.EndDate;
            this.specialJournalId = this.objspecialjournalrequest.SpecialJournalId;
            this.chartOfAcntId = this.objspecialjournalrequest.ChartOfAccountId;
            this.customerId = this.objspecialjournalrequest.CustomerId;
            this.searchClick = false;
        } else {
            this.objspecialjournalrequest.StartDate = this.fromDate;
            this.objspecialjournalrequest.EndDate = this.toDate;
            this.objspecialjournalrequest.SpecialJournalId = this.specialJournalId;
            this.objspecialjournalrequest.ChartOfAccountId = this.chartOfAcntId;
            this.objspecialjournalrequest.CustomerId = this.customerId;
        }
        this.objspecialjournalrequest.PageNumber = pageNumber;
        this.objspecialjournalrequest.PageSize = 10;
        this.objspecialjournalrequest.User = this.objSessionService.customerContext.userName;
        this.objspecialjournalrequest.SortColumn = this.sortingColumn;
        this.objspecialjournalrequest.SortDir = this.sortingDirection == true ? 1 : 0;
        this.objspecialjournalrequest.SystemActivities = this.objreqSystemActivities;
        this.accountingservices.getSpecialJournalDetails(this.objspecialjournalrequest, userEvents).subscribe(res => {
            this.objspecialjournalresponse = res;
            this.specialJournalResponseLength = this.objspecialjournalresponse.length;
            if (this.objspecialjournalresponse && this.objspecialjournalresponse.length > 0) {
                this.totalRecordCount = this.objspecialjournalresponse[0].ReCount
                if (this.totalRecordCount < this.pageItemNumber) {
                    this.endItemNumber = this.totalRecordCount;
                }
                else {
                    this.endItemNumber = ((this.p) * this.pageItemNumber);
                    if (this.totalRecordCount < this.endItemNumber) {
                        this.endItemNumber = this.totalRecordCount;
                    }
                }
            }
        })
    }

    onJournalTypeSelected() {
        this.accountingservices.getGLAccountDrop(this.searchSpecialJournalForm.controls['journalTypeSelected'].value).subscribe(res => {
            this.objglaccountresponse = res;
            this.searchSpecialJournalForm.controls["glAccountSelected"].setValue(0);
        });
    }


    userEventsCalling(userEvents) {
        // let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.SPECIALJOURNAL];
        userEvents.ActionName = userEvents.ActionName;
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.objSessionService.customerContext.roleID);
        userEvents.UserName = this.objSessionService.customerContext.userName;
        userEvents.LoginId = this.objSessionService.customerContext.loginId;
    }

    sortDirection(SortingColumn) {
        this.gridArrowCustomerId = false;
        this.gridArrowTxntype = false;
        this.gridArrowGL_TXNID = false;


        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "CustomerId") {
            this.gridArrowCustomerId = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "Txntype") {
            this.gridArrowTxntype = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        else if (this.sortingColumn == "GL_TXNID") {
            this.gridArrowGL_TXNID = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }

        this.getSpecialJournalDetails(this.p);
    }

}



