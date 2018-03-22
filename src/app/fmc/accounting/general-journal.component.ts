import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validator, Validators } from '@angular/forms';
import { SessionService } from '../../shared/services/session.service';
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IGeneralJournalRequest } from "./models/generaljournalrequest";
import { IGeneralJournalResponse } from "./models/generaljournalresponse";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IGetJournalLineItemsRequest } from "./models/generaljournallineitemssrequest";
import { IGetJournalLineItemsResponse } from "./models/generaljournallineitemsresponse";
import { Router } from '@angular/router';
import { AccountingService } from "./services/accounting.service";
import { ConfigurationService } from "../configuration/services/configuration.service";
import { ICategoryTypesRequest } from "../configuration/models/categoryrequest";
import { ICategoryTypesResponse } from "../configuration/models/categoryresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from '../../shared/models/userresponse';
//import { IMyDrpOptions } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
declare var $: any;

@Component({
    selector: 'app-general-journal',
    templateUrl: './general-journal.component.html',
    styleUrls: ['./general-journal.component.scss']
})
export class GeneralJournalComponent implements OnInit {
    gridArrowLinkId: boolean;
    sortingDirection: boolean;
    sortingColumn: any;
    gridArrowGL_TXNID: boolean;
    invalidDate: boolean = false;
    generalJournalCustomerId: number = -1;
    categoryId: any;
    generalJournalLinkId: any;
    generalJournalId: any;
    toDate: any;
    fromDate: any;

    disableGlTxnViewButton: boolean;
    disableSearchButton: boolean;
    sessionContextResponse: IUserresponse;
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    generalJournalResponseLength: number;
    genTxnId: number;
    // timePeriod: Date[];
    popUpModel: boolean;
    totDebitAmount: number = 0;
    totCreditAmount: number = 0;
    maxDate = new Date();
    searchClick: boolean;


    objSystemActivities: ISystemActivities;
    objGeneralJournalRequest: IGeneralJournalRequest;
    objGeneralJournalResponse: IGeneralJournalResponse[] = <IGeneralJournalResponse[]>{};
    objCategoryTypesRequest: ICategoryTypesRequest;
    objCategoryTypesResponse: ICategoryTypesResponse[];
    objGetJournalLineItemsRequest: IGetJournalLineItemsRequest;
    objGetJournalLineItemsResponse: IGetJournalLineItemsResponse[];
    searchForm: FormGroup;
    createManualJournalEntryForm: FormGroup;
    validateLinkIdPattern = /^(\-)?\d+(\.\d+)?$/;
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

    constructor(private materialscriptService: MaterialscriptService, private sessionContext: SessionService, private datePickerFormatService: DatePickerFormatService, private commonService: CommonService, private objAccountingService: AccountingService, private objConfiguarationService: ConfigurationService, private router: Router) { }

    ngOnInit() {
        this.gridArrowGL_TXNID = true;
        this.sortingColumn = "GL_TXNID";
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionContext.customerContext;
        this.searchForm = new FormGroup({
            'journalId': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
            'customerId': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
            'categoryTypeId': new FormControl(''),
            'linkId': new FormControl('', [Validators.pattern(this.validateLinkIdPattern)]),
            'timePeriod': new FormControl('', [Validators.required])
        });

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.GENERALJOURNAL];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.disableSearchButton = !this.commonService.isAllowed(Features[Features.GENERALJOURNAL], Actions[Actions.SEARCH], "");
        this.disableGlTxnViewButton = !this.commonService.isAllowed(Features[Features.JOURNALLINEITEMS], Actions[Actions.VIEW], "");

        this.searchClick = false;
        this.p = 1;
        this.endItemNumber = this.pageItemNumber;
        this.dateBind();
        this.getJournalEntryData(this.p, userEvents);
        this.getCategoryTypesDropDown();
        this.popUpModel = false;
        this.searchForm.controls["categoryTypeId"].setValue(0);
    }

    onDateRangeFieldChanged(event: IMyInputFieldChanged) {
        let date = this.searchForm.controls["timePeriod"].value;
        if (!event.valid && event.value != "") {
            this.invalidDate = true;
        }
        else {
            this.invalidDate = false;
        }
    }

    dateBind(): void {
        let date = new Date();
        this.searchForm.patchValue({
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
        let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.searchForm.controls['timePeriod'].value);
        this.fromDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
        this.toDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
        // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
        // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
        // this.fromDate = new Date(new Date(this.timePeriod[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
        // this.toDate = new Date(new Date(this.timePeriod[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
    }

    createJournalEntryMethod() {
        this.router.navigate(['../../../fmc/accounting/manual-journal-entries']);
    }

    manualJournalEntry() {
        this.router.navigate(['../../../fmc/accounting/manual-journal-entries-approval']);
    }

    pageChanged(event, userEvents?: IUserEvents) {
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getJournalEntryData(this.p, userEvents);
    }

    reset() {
        this.generalJournalCustomerId = -1;
        this.generalJournalId = "";
        this.generalJournalLinkId = "";
        this.categoryId = "";
        this.searchForm.reset();
        this.searchClick = false;
        this.dateBind();
        this.searchForm.controls["categoryTypeId"].setValue(0);
        this.pageChanged(1);
    }

    journalEntriesSearchOnClick() {
        if (this.searchForm.valid && this.invalidDate == false) {
            this.searchClick = true;
            let userEvents: IUserEvents;
            userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.GENERALJOURNAL];
            userEvents.ActionName = Actions[Actions.SEARCH];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = 0;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;
            this.pageChanged(1, userEvents);
        } else {
            this.validateAllFormFields(this.searchForm);
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

    systemActivity() {
        this.objSystemActivities = <ISystemActivities>{};
        this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
        this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
        this.objSystemActivities.IsViewed = true;
        this.objSystemActivities.User = this.sessionContext.customerContext.userName;
        this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    }

    getJournalEntryData(p: number, userEvents?: IUserEvents): void {
        this.objGeneralJournalRequest = <IGeneralJournalRequest>{};
        this.objGeneralJournalRequest.PageNumber = p;
        this.objGeneralJournalRequest.PageSize = 10;
        this.objGeneralJournalRequest.SortColumn = this.sortingColumn;
        this.objGeneralJournalRequest.SortDir = this.sortingDirection == true ? 1 : 0;
        this.objGeneralJournalRequest.IsSearch = true;
        this.systemActivity();
        this.objGeneralJournalRequest.SystemActivity = this.objSystemActivities;
        if (this.searchClick) {
            if (this.searchForm.get("customerId").value == null || this.searchForm.get("customerId").value == "") {
                this.objGeneralJournalRequest.CustomerId = -1;
            }
            else {
                this.objGeneralJournalRequest.CustomerId = this.searchForm.get("customerId").value;
                this.generalJournalCustomerId = this.objGeneralJournalRequest.CustomerId;
            }
            this.objGeneralJournalRequest.GLTxnId = this.searchForm.get("journalId").value;
            this.objGeneralJournalRequest.LinkId = this.searchForm.get("linkId").value;
            this.objGeneralJournalRequest.TxnTypeCategoryId = this.searchForm.controls["categoryTypeId"].value;
            let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.searchForm.controls['timePeriod'].value);
            this.objGeneralJournalRequest.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            this.objGeneralJournalRequest.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            // this.objGeneralJournalRequest.StartDate = new Date(new Date(this.timePeriod[0].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            // this.objGeneralJournalRequest.EndDate = new Date(new Date(this.timePeriod[1].toLocaleDateString(defaultCulture).replace(/\u200E/g,""))).toDateString();
            this.fromDate = this.objGeneralJournalRequest.StartDate;
            this.toDate = this.objGeneralJournalRequest.EndDate;
            this.generalJournalId = this.objGeneralJournalRequest.GLTxnId;
            this.generalJournalLinkId = this.objGeneralJournalRequest.LinkId;
            this.categoryId = this.objGeneralJournalRequest.TxnTypeCategoryId;
            this.searchClick = false;
        }
        else {
            this.objGeneralJournalRequest.CustomerId = this.generalJournalCustomerId;
            this.objGeneralJournalRequest.StartDate = this.fromDate;
            this.objGeneralJournalRequest.EndDate = this.toDate;
            this.objGeneralJournalRequest.GLTxnId = this.generalJournalId;
            this.objGeneralJournalRequest.LinkId = this.generalJournalLinkId;
            this.objGeneralJournalRequest.TxnTypeCategoryId = this.categoryId;
        }
        $('#pageloader').modal('show');
        this.objAccountingService.searchGeneralJournalEntries(this.objGeneralJournalRequest, userEvents).subscribe(
            res => {
                $('#pageloader').modal('hide');
                this.objGeneralJournalResponse = res;
                this.generalJournalResponseLength = this.objGeneralJournalResponse.length;
                if (this.objGeneralJournalResponse && this.objGeneralJournalResponse.length > 0) {
                    this.totalRecordCount = this.objGeneralJournalResponse[0].ReCount
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
            });

    }

    getCategoryTypesDropDown() {
        this.objCategoryTypesRequest = <ICategoryTypesRequest>{};
        this.systemActivity();
        this.objCategoryTypesRequest.systemActivity = this.objSystemActivities;
        this.objCategoryTypesRequest.pageNumber = 1;
        this.objCategoryTypesRequest.pageSize = 100;
        this.objCategoryTypesRequest.sortDir = 0;
        this.objConfiguarationService.getCategoryTypes(this.objCategoryTypesRequest).subscribe(
            res => {
                this.objCategoryTypesResponse = res;
            })
    }

    getPopUpDataOfJournalId(Id: number) {
        this.totCreditAmount = 0;
        this.totDebitAmount = 0;
        this.objGetJournalLineItemsRequest = <IGetJournalLineItemsRequest>{};
        this.systemActivity();
        this.objGetJournalLineItemsRequest.SystemActivity = this.objSystemActivities;
        this.objGetJournalLineItemsRequest.GLTxnId = Id;
        this.genTxnId = this.objGetJournalLineItemsRequest.GLTxnId;
        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.JOURNALLINEITEMS];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        $('#pageloader').modal('show');
        this.objAccountingService.popUpDataOfSelectedJournalId(this.objGetJournalLineItemsRequest, userEvents).subscribe(
            res => {
                $('#pageloader').modal('hide');
                this.objGetJournalLineItemsResponse = res;

                this.objGetJournalLineItemsResponse.forEach(element => {
                    this.totDebitAmount += element.DebitAmount;
                });
                this.objGetJournalLineItemsResponse.forEach(element => {
                    this.totCreditAmount += element.CreditAmount;
                });
            })
        this.popUpModel = true;
    }

    sortDirection(SortingColumn) {
        this.gridArrowGL_TXNID = false;
        this.gridArrowLinkId = false;
    
    
        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "GL_TXNID") {
          this.gridArrowGL_TXNID = true;
          if (this.sortingDirection == true) {
            this.sortingDirection = false;
          }
          else {
            this.sortingDirection = true;
          }
        }
    
        else if (this.sortingColumn == "LinkId") {
          this.gridArrowLinkId = true;
          if (this.sortingDirection == true) {
            this.sortingDirection = false;
          }
          else {
            this.sortingDirection = true;
          }
        }
        this.getJournalEntryData(this.p);
      }
}