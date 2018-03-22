import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { AccountingService } from "../accounting/services/accounting.service";
import { ConfigurationService } from "./services/configuration.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { IManageTransactionTypeResponse } from "./models/managetransactiontypesresponse";
import { IJournalTypeResponse } from "../accounting/models/journaltyperesponse";
import { ICategoryTypesResponse } from "./models/categoryresponse";
import { ICategoryTypesRequest } from "./models/categoryrequest";
import { IManageTransactionTypeRequest } from "./models/managetransactiontypesrequest";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
    selector: 'app-manage-transaction-types',
    templateUrl: './manage-transaction-types.component.html',
    styleUrls: ['./manage-transaction-types.component.scss']
})
export class ManageTransactionTypesComponent implements OnInit {
    gridArrowTXNTYPE: boolean;
    sortingDirection: boolean;
    sortingColumn: any;
    gridArrowAdjustmentcategory: boolean;
    isPageChanged: boolean = false;
    status: string;
    specialJournalTypeId: any;
    adjustmentCategoryId: any;
    txnTypeCategoryId: any;
    txnType: string;
    disableViewButton: boolean;
    disableHistoryButton: boolean;
    disableUpdateButton: boolean;
    disableCreateButton: boolean;
    disableSearchButton: boolean;
    sessionContextResponse: IUserresponse;
    showDropdowns: boolean = false;
    searchClick: any = false;
    test: any;
    hideHistory: boolean = false;
    glAccountDetails: boolean = false;
    showCancelButton: boolean = false;
    txnTypesId: number;
    getTransactionTypeHistoryResponse: IManageTransactionTypeResponse[];
    viewPopup: boolean = false;
    historyPopup: boolean = false;
    glAccount: any;
    selectedItem: any;
    addGlAct: boolean;
    updateGlAct: boolean;
    glAccountName: Array<string>;
    txnTypeId: number;
    resetAddNewTrans: boolean;
    cancelAddNewTrans: boolean = true;
    updateAddNewTrans: boolean;
    submitAddNewTrans: boolean = true;
    getLineItemsResponse: IManageTransactionTypeResponse[];
    categorySearchType: string;
    adjustmentSearchType: string;
    specialJournalSearchType: string;
    selectedGlActDetailCD: Array<string> = [];
    selectedGlActDetailIds: Array<string> = [];
    selectedGlAcntId: any;
    isAutoChecked: boolean;
    public items: Array<any> = [];
    glAccountAlreadyExists: boolean;
    debitCreditValue: string;
    selectedGlActDetails: Array<any> = [];
    selectedGlAcntValue: string;
    selectedDcValue: string;
    getChartOfActs: Array<any> = [];
    getChartOfAccounts: Array<any> = [];
    objSystemActivities: ISystemActivities;
    objManageTransactionTypesRequest: IManageTransactionTypeRequest;
    objCategoryTypesRequest: ICategoryTypesRequest;
    specialJournalTypes: IJournalTypeResponse;
    adjustmentTypes: IManageTransactionTypeResponse;
    categoryTypes: ICategoryTypesResponse[] = [];
    transactionTypeDetails: IManageTransactionTypeResponse[] = [];
    transactionTypeDetailsLength: number;
    statusValue: string;
    specialJournalType: string;
    adjustmentType: string;
    categoryType: string;
    addNewTransactionType: boolean = false;
    p: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    addNewTransactionTypeForm: FormGroup;
    transactionTypeForm: FormGroup;
    defaultStatus: number = 0;
    showLineItemButton: boolean = false;
    msgFlag: boolean;
    msgType: string;
    msgDesc: string;
    codePattern: any = "[A-Za-z0-9]*";
    activeInactiveStatus = [
        {
            id: 0,
            Value: 'ALL'
        },

        {
            id: 1,
            Value: 'Active'
        },
        {
            id: 2,
            Value: 'Inactive'
        }
    ];
    radioStatus = [
        {
            id: 0,
            Value: 'Active'
        },

        {
            id: 1,
            Value: 'Inactive'
        }
    ];

    constructor(private sessionContext: SessionService, private materialscriptService: MaterialscriptService, private accountService: AccountingService, private configurationService: ConfigurationService, private router: Router, private commonService: CommonService) { }
    ngOnInit() {
        this.gridArrowTXNTYPE = true;
        this.sortingColumn = "TXNTYPE";
        this.materialscriptService.material();
        this.sessionContextResponse = this.sessionContext.customerContext;
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.VIEW];
        this.disableSearchButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONTYPES], Actions[Actions.SEARCH], "");
        this.disableCreateButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONTYPES], Actions[Actions.CREATE], "");
        this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONTYPES], Actions[Actions.UPDATE], "");
        this.disableViewButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONTYPELINEITEMS], Actions[Actions.VIEW], "");
        this.disableHistoryButton = !this.commonService.isAllowed(Features[Features.TRANSACTIONTYPES], Actions[Actions.HISTORY], "");
        this.transactionTypeForm = new FormGroup({
            'txnType': new FormControl(''),
            'categoryType': new FormControl(''),
            'adjustmentType': new FormControl(''),
            'specialJournalType': new FormControl(''),
            'status': new FormControl('')
        });
        this.addNewTransactionTypeForm = new FormGroup({
            'type': new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.codePattern)]),
            'description': new FormControl('', [Validators.required, Validators.maxLength(255)]),
            'categoryType': new FormControl('', [Validators.required]),
            'automatic': new FormControl(''),
            'adjustmentType': new FormControl(''),
            'specialJournalType': new FormControl('', [Validators.required]),
            'rdostatus': new FormControl(''),
            'glAccount': new FormControl('', [Validators.required]),
            'debitCreditSelect': new FormControl('', [Validators.required])
        });

        this.categorySearchType = '';
        this.adjustmentSearchType = '';
        this.specialJournalSearchType = '';
        this.statusValue = 'ALL';
        this.selectedDcValue = '';

        this.categoryType = '';
        this.specialJournalType = '';
        this.adjustmentType = '';
        this.p = 1;
        this.endItemNumber = 10;
        this.getCategoryTypes();
        this.getAdjustmentTypeDetails();
        this.getJournalTypeDrop();
        this.getTransactionTypes(this.p, userEvents);
        this.getChartofAccountsDropDown();
    }

    systemActivities() {
        this.objSystemActivities = <ISystemActivities>{};
        this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
        this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
        this.objSystemActivities.IsViewed = true;
        this.objSystemActivities.IsSearch = true;
        this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
        return this.objSystemActivities;
    }
    pageChanged(event) {
        this.isPageChanged = true;
        this.p = event;
        this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.p) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.getTransactionTypes(this.p);
    }

    getCategoryTypes() {
        this.objCategoryTypesRequest = <ICategoryTypesRequest>{};
        this.systemActivities();
        this.objCategoryTypesRequest.systemActivity = this.objSystemActivities;
        this.objCategoryTypesRequest.pageNumber = 1;
        this.objCategoryTypesRequest.pageSize = 100;
        this.configurationService.getCategoryTypes(this.objCategoryTypesRequest).subscribe(
            res => {
                this.categoryTypes = res;
            });
    }

    getAdjustmentTypeDetails() {
        this.configurationService.getAdjustmentTypeDetails().subscribe(
            res => {
                this.adjustmentTypes = res;
            });
    }

    getJournalTypeDrop(): void {
        this.systemActivities();
        this.accountService.getJournalTypeDrop(this.objSystemActivities).subscribe(res => {
            this.specialJournalTypes = res;
        });
    }

    getTransactionTypes(pageNo: number, userEvents?: IUserEvents) {
        $('#pageloader').modal('show');
        this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
        this.systemActivities();
        this.objManageTransactionTypesRequest.SystemActivities = this.objSystemActivities;
        this.objManageTransactionTypesRequest.PageNumber = this.p;
        this.objManageTransactionTypesRequest.SortColumn = this.sortingColumn;
        // this.objManageTransactionTypesRequest.SortColumn = "TXNTYPE";
        this.objManageTransactionTypesRequest.PageSize = 10;
        this.objManageTransactionTypesRequest.SortDir = this.sortingDirection == true ? 1 : 0;;
        this.objManageTransactionTypesRequest.User = this.sessionContext.customerContext.userName;

        if (this.searchClick) {
            this.objManageTransactionTypesRequest.TxnType = this.transactionTypeForm.get('txnType').value;
            this.objManageTransactionTypesRequest.TxnTypeCategoryId = this.transactionTypeForm.controls['categoryType'].value;
            this.objManageTransactionTypesRequest.AdjustmentCategoryId = this.transactionTypeForm.controls['adjustmentType'].value;
            this.objManageTransactionTypesRequest.SpecialJournalTypeId = this.transactionTypeForm.controls['specialJournalType'].value;
            this.txnType = this.objManageTransactionTypesRequest.TxnType;
            this.txnTypeCategoryId = this.objManageTransactionTypesRequest.TxnTypeCategoryId;
            this.adjustmentCategoryId = this.objManageTransactionTypesRequest.AdjustmentCategoryId;
            this.specialJournalTypeId = this.objManageTransactionTypesRequest.SpecialJournalTypeId;
            if (this.transactionTypeForm.controls['status'].value == 'ALL') {
                this.objManageTransactionTypesRequest.Status = "";
            } else {
                this.objManageTransactionTypesRequest.Status = this.transactionTypeForm.controls['status'].value;
            }
            this.status = this.objManageTransactionTypesRequest.Status;
            this.searchClick = false;
            this.isPageChanged = false;
        }
        else {
            if (this.isPageChanged) {
                this.objManageTransactionTypesRequest.TxnType = this.txnType;
                this.objManageTransactionTypesRequest.TxnTypeCategoryId = this.txnTypeCategoryId;
                this.objManageTransactionTypesRequest.AdjustmentCategoryId = this.adjustmentCategoryId;
                this.objManageTransactionTypesRequest.SpecialJournalTypeId = this.specialJournalTypeId;
                this.objManageTransactionTypesRequest.Status = this.status;
            } else {
                this.objManageTransactionTypesRequest.Status = "";
            }
        }
        this.configurationService.searchTransactionTypeDetails(this.objManageTransactionTypesRequest, userEvents).subscribe(res => {
            if (res) {
                $('#pageloader').modal('hide');
                this.transactionTypeDetails = res;
                if (res.length > 0) {
                    this.totalRecordCount = this.transactionTypeDetails[0].ReCount;
                    if (this.totalRecordCount < this.pageItemNumber) {
                        this.endItemNumber = this.totalRecordCount;
                    }
                }
            }
        }
            , err => {
                $('#pageloader').modal('hide');
                this.transactionTypeDetails.length = 0;
                this.errorMessageBlock(err.statusText.toString());
            }
        );
    }

    getChartofAccountsDropDown(): void {
        this.accountService.getGeneralLedgerDropDownDetails().subscribe(
            res => {
                this.getChartOfAccounts = res;
                this.getChartOfAccounts.forEach(element => {
                    this.getChartOfActs.push({ "id": element.ChartOfAccountId, "text": element.AccountDescription });
                    this.items = this.getChartOfActs;
                });
            });
    }

    glAccountSelected(value) {
        this.selectedGlAcntId = value.id;
        this.selectedGlAcntValue = value.text;
        if (this.selectedGlActDetails && this.selectedGlActDetails.length >= 1) {
            for (var i = 0; i < this.selectedGlActDetails.length; i++) {
                if (this.selectedGlActDetails[i].glAccount == this.selectedGlAcntValue) {
                    this.glAccountAlreadyExists = true;
                    return true;
                } else if (this.selectedGlActDetails[i].glAccount != this.selectedGlAcntValue) {
                    this.glAccountAlreadyExists = false;
                }
            }
        }
    }

    addGlAccounts() {
        this.selectedGlActDetails.push({ 'creditDebit': this.selectedDcValue, 'glAccount': this.selectedGlAcntValue, 'id': this.selectedGlAcntId });
        this.addNewTransactionTypeForm.controls['glAccount'].reset();
        this.addNewTransactionTypeForm.controls['debitCreditSelect'].reset();
        this.selectedDcValue = '';
        this.glAccountDetails = true;
    }

    resetGlAccounts() {
        this.addNewTransactionTypeForm.controls['glAccount'].reset();
        this.addNewTransactionTypeForm.controls['debitCreditSelect'].reset();
        this.addNewTransactionTypeForm.controls['debitCreditSelect'].setValue("");
        this.glAccountAlreadyExists = false;
    }
    cancelGlAccounts() {
        this.showLineItemButton = true;
        this.showDropdowns = false;
    }

    searchTransTypes() {
        this.addNewTransactionType = false;
        this.searchClick = true;
        this.p = 1;
        this.endItemNumber = 10;
        this.startItemNumber = 1;
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.SEARCH];
        this.getTransactionTypes(this.p, userEvents);
    }

    removeGlAccount(selectedActDetail) {
        let index = this.selectedGlActDetails.indexOf(selectedActDetail);
        this.selectedGlActDetails.splice(index, 1);
        let deletedIndex = selectedActDetail.glAccount;
        if (this.selectedGlAcntValue !== undefined || this.selectedGlAcntValue !== "") {
            if (deletedIndex === this.selectedGlAcntValue) {
                this.glAccountAlreadyExists = false;
                this.selectedGlAcntValue = "";
                return true;
            }
        } else {
            this.glAccountAlreadyExists = true;
        }
        if (this.selectedGlActDetails.length == 0) {
            this.glAccountDetails = false;
        }
    }

    submitAddNewTransType() {

        if (this.selectedGlActDetails.length >= 2 &&
            this.addNewTransactionTypeForm.controls['type'].valid &&
            this.addNewTransactionTypeForm.controls['description'].valid &&
            this.addNewTransactionTypeForm.controls['categoryType'].valid &&
            this.addNewTransactionTypeForm.controls['specialJournalType'].valid) {
            this.selectedGlActDetails.forEach(element => {
                this.selectedGlActDetailIds.push(element.id);
                this.selectedGlActDetailCD.push(element.creditDebit);
            });
            this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
            this.objManageTransactionTypesRequest.SystemActivities = <ISystemActivities>{};
            this.objManageTransactionTypesRequest.TxnType = this.addNewTransactionTypeForm.controls['type'].value;
            this.objManageTransactionTypesRequest.TxnDescription = this.addNewTransactionTypeForm.controls['description'].value;
            this.objManageTransactionTypesRequest.TxnTypeCategoryId = this.addNewTransactionTypeForm.controls['categoryType'].value;
            if (this.isAutoChecked == true) {
                this.objManageTransactionTypesRequest.IsAutomatic = 1;
            }
            else {
                this.objManageTransactionTypesRequest.IsAutomatic = 0;
            }
            if (this.addNewTransactionTypeForm.controls['rdostatus'].value == 0) {
                this.objManageTransactionTypesRequest.Status = "Active";
            }
            else {
                this.objManageTransactionTypesRequest.Status = "Inactive";
            }
            this.objManageTransactionTypesRequest.LevelId = 1;
            this.objManageTransactionTypesRequest.AdjustmentCategoryId = this.addNewTransactionTypeForm.controls['adjustmentType'].value;
            this.objManageTransactionTypesRequest.SpecialJournalTypeId = this.addNewTransactionTypeForm.controls['specialJournalType'].value;
            this.objManageTransactionTypesRequest.User = this.sessionContext.customerContext.userName;
            this.objManageTransactionTypesRequest.ChartofAccountids = this.selectedGlActDetailIds.toString();
            this.objManageTransactionTypesRequest.DRCRFlags = this.selectedGlActDetailCD.toString();
            this.objManageTransactionTypesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
            this.objManageTransactionTypesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
            this.objManageTransactionTypesRequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
            let userEvents: IUserEvents = <IUserEvents>{};
            this.userEventsCalling(userEvents);
            userEvents.ActionName = Actions[Actions.CREATE];
            $('#pageloader').modal('show');
            this.configurationService.createTransactionTypesDetails(this.objManageTransactionTypesRequest, userEvents).subscribe(
                res => {
                    if (res) {
                        this.successMessageBlock("Transaction type has been added successfully");
                        this.addNewTransactionType = false;
                        this.getTransactionTypes(this.p);
                        window.scroll(0, 0);
                        this.selectedGlActDetails = [];
                        this.selectedGlActDetailIds = [];
                        this.selectedGlActDetailCD = [];
                        this.addNewTransactionTypeForm.reset();
                        this.defaultStatus = 0;
                    }
                }
                , err => {
                    $('#pageloader').modal('hide');
                    this.errorMessageBlock(err.statusText.toString());
                    this.addNewTransactionType = true;
                    window.scroll(0, 0);
                    this.selectedGlActDetailIds = [];
                    this.selectedGlActDetailCD = [];
                });
        }
        else {
            this.addNewTransactionTypeForm.controls['type'].markAsTouched({ onlySelf: true });
            this.addNewTransactionTypeForm.controls['description'].markAsTouched({ onlySelf: true });
            this.addNewTransactionTypeForm.controls['categoryType'].markAsTouched({ onlySelf: true });
            this.addNewTransactionTypeForm.controls['adjustmentType'].markAsTouched({ onlySelf: true });
            this.addNewTransactionTypeForm.controls['specialJournalType'].markAsTouched({ onlySelf: true });
            if (this.selectedGlActDetails.length < 2) {
                this.addNewTransactionTypeForm.controls['glAccount'].markAsTouched({ onlySelf: true });
                this.addNewTransactionTypeForm.controls['debitCreditSelect'].markAsTouched({ onlySelf: true });
            }
        }
    }

    resetTransTypes() {
        this.status = "";
        this.txnType = "";
        this.txnTypeCategoryId = "";
        this.adjustmentCategoryId = "";
        this.specialJournalTypeId = "";
        this.searchClick = false;
        this.isPageChanged = false;
        this.p = 1;
        this.endItemNumber = 10;
        this.startItemNumber = 1;
        this.getTransactionTypes(1);
    }

    showAddNewTransactionType() {
        this.showDropdowns = true;
        this.showCancelButton = false;
        this.showLineItemButton = false;
        window.scroll(50, 300);
        this.addNewTransactionType = true;
        this.glAccountDetails = false;
        this.commonFunction();
        this.materialscriptService.material();
    }

    cancelNewTransType() {
        this.addNewTransactionType = false;
        this.selectedGlActDetails = [];
        this.defaultStatus = 0;
        this.showDropdowns = false;
        this.addNewTransactionTypeForm.reset();
    }

    showLineItemButtons() {
        this.showLineItemButton = false;
        this.showDropdowns = true;
        this.glAccountAlreadyExists = false;
    }

    editTransTypes(edit) {
        window.scroll(0, 0);
        let userEvents: IUserEvents = <IUserEvents>{};
        userEvents.ActionName = Actions[Actions.UPDATE];
        this.userEventsCalling(userEvents);
        this.showLineItemButton = true;
        this.showDropdowns = false;
        this.showCancelButton = true;
        this.test = edit;
        this.selectedDcValue = '';
        this.getLineItemsByTxnTypeIdDetails(edit.TxnTypeId);
        this.addNewTransactionTypeForm.controls['type'].setValue(edit.TxnType);
        this.addNewTransactionTypeForm.get('type').disable();
        this.addNewTransactionTypeForm.controls['description'].setValue(edit.TxnDescription);
        this.categoryType = edit.TxnTypeCategoryId;
        this.addNewTransactionTypeForm.get('categoryType').disable();
        if (edit.IsAutomatic == 1)
            this.isAutoChecked = true;
        else
            this.isAutoChecked = false;
        this.addNewTransactionTypeForm.get('automatic').disable();
        this.adjustmentType = edit.AdjustmentCategoryId;
        this.addNewTransactionTypeForm.get('adjustmentType').disable();
        this.addNewTransactionTypeForm.get('specialJournalType').disable();
        if (edit.Status.toString().toLowerCase() == 'active') {
            this.defaultStatus = 0;
        }
        else {
            this.defaultStatus = 1;
        }
        this.selectedGlActDetails = [];
        this.addNewTransactionType = true;
        this.submitAddNewTrans = false;
        this.updateAddNewTrans = true;
        this.cancelAddNewTrans = true;
        this.resetAddNewTrans = true;
        this.glAccountDetails = true;
        this.materialscriptService.material();
    }

    viewTransTypes(view) {
        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.TRANSACTIONTYPELINEITEMS];
        userEvents.ActionName = Actions[Actions.VIEW];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
        this.getLineItemsByTxnTypeIdDetails(view.TxnTypeId, userEvents);
        this.viewPopup = true;
        this.selectedGlActDetails = [];
        this.cancelNewTransType();
    }

    historyTransTypes(history) {
        this.getTransactionTypeHistory(history);
        this.historyPopup = true;
        this.cancelNewTransType();
    }

    updateAddNewTransType() {
        this.selectedGlActDetails.forEach(element => {
            this.selectedGlActDetailIds.push(element.id);
            this.selectedGlActDetailCD.push(element.creditDebit);
        });
        this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
        this.objManageTransactionTypesRequest.SystemActivities = <ISystemActivities>{};
        this.objManageTransactionTypesRequest.TxnTypeId = this.txnTypeId;
        this.objManageTransactionTypesRequest.TxnType = this.addNewTransactionTypeForm.controls['type'].value;
        this.objManageTransactionTypesRequest.TxnDescription = this.addNewTransactionTypeForm.controls['description'].value;
        this.objManageTransactionTypesRequest.TxnTypeCategoryId = this.addNewTransactionTypeForm.controls['categoryType'].value;
        if (this.isAutoChecked == true) {
            this.objManageTransactionTypesRequest.IsAutomatic = 1;
        }
        else {
            this.objManageTransactionTypesRequest.IsAutomatic = 0;
        }
        if (this.addNewTransactionTypeForm.controls['rdostatus'].value == 0) {
            this.objManageTransactionTypesRequest.Status = "Active";
        }
        else {
            this.objManageTransactionTypesRequest.Status = "Inactive";
        }
        this.objManageTransactionTypesRequest.LevelId = 1;
        this.objManageTransactionTypesRequest.AdjustmentCategoryId = this.addNewTransactionTypeForm.controls['adjustmentType'].value;
        this.objManageTransactionTypesRequest.SpecialJournalTypeId = this.addNewTransactionTypeForm.controls['specialJournalType'].value;
        this.objManageTransactionTypesRequest.User = this.sessionContext.customerContext.userName;
        this.objManageTransactionTypesRequest.ChartofAccountids = this.selectedGlActDetailIds.toString();
        this.objManageTransactionTypesRequest.DRCRFlags = this.selectedGlActDetailCD.toString();
        this.objManageTransactionTypesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
        this.objManageTransactionTypesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
        this.objManageTransactionTypesRequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.UPDATE];
        $('#pageloader').modal('show');
        this.configurationService.upadateTransactionTypesDetails(this.objManageTransactionTypesRequest, userEvents).subscribe(
            res => {
                if (res) {
                    this.successMessageBlock("Transaction type has been Updated successfully");
                    this.getTransactionTypes(this.p);
                    this.addNewTransactionTypeForm.reset();
                    window.scroll(0, 0);
                    this.selectedGlActDetails = [];
                    this.selectedGlActDetailIds = [];
                    this.selectedGlActDetailCD = [];
                }
                this.addNewTransactionType = false;
            }
            , err => {
                $('#pageloader').modal('hide');
                this.errorMessageBlock(err.statusText.toString());
                this.selectedGlActDetailIds = [];
                this.selectedGlActDetailCD = [];
                window.scroll(0, 0);
            });

    }

    editGlAccount(edit, i) {
        this.selectedItem = edit;
        this.addNewTransactionTypeForm.controls['debitCreditSelect'].setValue(edit.creditDebit);
        this.glAccountName = [edit.glAccount];
        this.updateGlAct = true;
        this.addGlAct = false;
    }

    resetAddNewTransType() {
        this.editTransTypes(this.test);
        this.showDropdowns = false;
        this.addNewTransactionTypeForm.controls['glAccount'].reset();
        this.addNewTransactionTypeForm.controls['debitCreditSelect'].reset();
        this.selectedDcValue = '';
    }

    getLineItemsByTxnTypeIdDetails(value: number, userEvents?: IUserEvents) {
        
        this.txnTypeId = value;
        this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
        this.objManageTransactionTypesRequest.SystemActivities = <ISystemActivities>{};
        this.objManageTransactionTypesRequest.User = this.sessionContext.customerContext.userName;
        this.objManageTransactionTypesRequest.TxnTypeId = this.txnTypeId;
        this.objManageTransactionTypesRequest.SystemActivities.FeaturesCode = Features.TRANSACTIONTYPELINEITEMS.toString();
        this.objManageTransactionTypesRequest.SystemActivities.ActionCode = Actions.VIEW.toString();

        this.configurationService.getLineItemsByTxnTypeIdDetails(this.objManageTransactionTypesRequest, userEvents).subscribe(
            res => {
                $('#pageloader').modal('hide');
                this.getLineItemsResponse = res;
                this.getLineItemsResponse.forEach(element => {
                    this.selectedGlActDetails.push({ "id": element.ChartofAccountids, "glAccount": element.ChartofAccountids + "-" + element.ChartAccountDesc, "creditDebit": element.DRCRFlags, "SpecialJournalTypeId": element.SpecialJournalTypeId })
                });
                this.selectedGlActDetails.forEach(element => {
                    this.specialJournalType = element.SpecialJournalTypeId;
                });
            },
            err => {
                $('#pageloader').modal('hide');
                this.errorMessageBlock(err.statusText.toString());
            });
    }

    getTransactionTypeHistory(value: any) {
        // $('#pageloader').modal('show');
        this.txnTypesId = value.TxnTypeId;
        this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
        this.objManageTransactionTypesRequest.PageNumber = 1;
        this.objManageTransactionTypesRequest.PageSize = 10;
        this.objManageTransactionTypesRequest.TxnTypeId = this.txnTypesId;
        this.systemActivities();
        this.objManageTransactionTypesRequest.SystemActivities = this.objSystemActivities;
        let userEvents: IUserEvents = <IUserEvents>{};
        this.userEventsCalling(userEvents);
        userEvents.ActionName = Actions[Actions.HISTORY];
        this.configurationService.getTransactionTypeHistory(this.objManageTransactionTypesRequest, userEvents).subscribe(
            res => {
                $('#pageloader').modal('hide');
                this.getTransactionTypeHistoryResponse = res;
                if (this.getTransactionTypeHistoryResponse.length > 0) {
                    this.hideHistory = true;
                }
                else {
                    this.hideHistory = false;
                }
            },
            err => {
                $('#pageloader').modal('hide');
                this.errorMessageBlock(err.statusText.toString());
            });
    }

    commonFunction() {
        this.addNewTransactionTypeForm.controls['type'].reset();
        this.addNewTransactionTypeForm.controls['description'].reset();
        this.categoryType = "";
        this.adjustmentType = "";
        this.specialJournalType = "";
        this.isAutoChecked = true;
        this.addNewTransactionTypeForm.controls['glAccount'].reset();
        this.selectedDcValue = '';
        this.defaultStatus = 0;
        this.addNewTransactionTypeForm.get('type').enable();
        this.addNewTransactionTypeForm.get('automatic').enable();
        this.addNewTransactionTypeForm.get('adjustmentType').enable();
        this.addNewTransactionTypeForm.get('specialJournalType').enable();
        this.addNewTransactionTypeForm.get('categoryType').enable();
        this.submitAddNewTrans = true;
        this.updateAddNewTrans = false;
        this.cancelAddNewTrans = true;
        this.resetAddNewTrans = false;
        this.glAccountAlreadyExists = false;
    }

    userEventsCalling(userEvents) {
        userEvents.FeatureName = Features[Features.TRANSACTIONTYPES];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    errorMessageBlock(errorMsg) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = errorMsg;
    }
    successMessageBlock(successMsg) {
        this.msgType = 'success';
        this.msgFlag = true;
        this.msgDesc = successMsg;
    }
    setOutputFlag(e) {
        this.msgFlag = e;
    }

    sortDirection(SortingColumn) {
        this.gridArrowAdjustmentcategory = false;
        this.gridArrowTXNTYPE = false;
        this.sortingColumn = SortingColumn;
        if (this.sortingColumn == "Adjustmentcategory") {
            this.gridArrowAdjustmentcategory = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        else if (this.sortingColumn == "TXNTYPE") {
            this.gridArrowTXNTYPE = true;
            if (this.sortingDirection == true) {
                this.sortingDirection = false;
            }
            else {
                this.sortingDirection = true;
            }
        }
        this.getTransactionTypes(this.p);
    }
}
