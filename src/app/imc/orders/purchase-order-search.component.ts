import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { OrdersService } from './services/orders.service';
import { CommonService } from "../../shared/services/common.service";
import { DocumentdetailsService } from "../../csc/documents/services/documents.details.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { LookupTypeCodes, ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IPurchaseOrderSearchResponse } from "./models/purchaseorderseacrhresponse";
import { IPurchaseOrderSearchRequest } from "./models/purchaseorderseacrhrequest";
import { IWarrantRequest } from "../warranty/models/warrantyrequest";
import { IWarrantyResponse } from "../warranty/models/warrantyresponse";
import { WarrantyService } from "../warranty/services/warranty.service";
import { ContractService } from "../contract/services/contract.service";
import { IPurchaseOrderDetailRequest } from "./models/purchaseorderdetailsrequest";
import { IPurchaseOrderLineItemRequest } from "./models/purchaseorderlineitemsrequest";
import { PurchaseOrderStatus } from "../constants";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { customDateFormatPipe } from "../../shared/pipes/convert-date.pipe";
import { IPurchaseOrderItemResponse } from "./models/purchaseorderitemresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged, IMyInputFocusBlur } from "mydaterangepicker";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
    selector: 'app-purchase-order-search',
    templateUrl: './purchase-order-search.component.html',
    styleUrls: ['./purchase-order-search.component.scss']
})
export class PurchaseOrderSearchComponent implements OnInit {
    gridArrowORDERSTATUS: boolean;
    gridArrowORDERDATE: boolean;
    gridArrowORDERNUMBER: boolean;
    sortingDirection: boolean;
    sortingColumn: string;
    gridArrowCOMPANYNAME: boolean;
    invalidDateRange: boolean;
    invalidDate: boolean = false;
    isSearchClicked: boolean;
    pdfDisableButton: boolean;
    viewDisableButton: boolean;
    searchDisableButton: boolean;
    cancelDisableButton: boolean;
    updateDisableButton: boolean;

    myDatePickerOptions: ICalOptions;

    myDateRangePickerOptions: ICalOptions = {
        dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true,
        showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
    };

    disableButton: boolean;
    isTagAgency: any;
    editItemForm: FormGroup;
    isEdit: boolean;
    cancelPurchaseOrderId: any;
    ordersSearchForm: FormGroup;
    ordersAddForm: FormGroup;
    ordersEditForm: FormGroup;
    addItemForm: FormGroup;
    validateOrderPattern = "[a-zA-Z0-9-/][a-zA-Z0-9-/ ]*";
    validateNumberPattern = "^[0-9]+$";
    validatOrderPattern = "^[A-Za-z0-9-/ ]+$"
    isSubmitted: boolean;
    warrantyInMonths: number = 0;
    vendorNames: IPurchaseOrderSearchResponse[];
    contractNames: IPurchaseOrderSearchResponse[];
    warrantyNames: IPurchaseOrderSearchResponse[];
    purchaseOrderRequest: IPurchaseOrderSearchRequest = <IPurchaseOrderSearchRequest>{};
    purchaseOrderResponse: IPurchaseOrderSearchResponse[];
    warrantyItemNames: IPurchaseOrderSearchResponse[];
    warrantyResponse: IWarrantyResponse[];
    itemQuantityResponse: IPurchaseOrderSearchResponse[];
    itemDetailsResponse: IPurchaseOrderSearchResponse[];
    itemDetailsResponseList: IPurchaseOrderItemResponse[] = [];
    purchaseOrderItemRequest: IPurchaseOrderLineItemRequest = <IPurchaseOrderLineItemRequest>{};
    itemMaxQuantityValue: number;
    itemMinQuantityValue: number;
    itemQuantity: number;
    itemId: string;
    timePeriod: any;
    poNumberStatus = true;
    vendorIdStatus: boolean;
    itemName: string;
    vendorName: string;
    warrantyName: string;
    contractName: string;
    sessionContextResponse: IUserresponse;
    userEvents = <IUserEvents>{};
    userName: string;
    userId: number;
    loginId: number;
    activitySource: string = ActivitySource[ActivitySource.Internal];
    editable = false;
    documentLinked: string;
    todayDate: Date = new Date();
    startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear() - 3);
    toDayDate: Date = new Date();
    startDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    endDate = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
    constructor(private ordersService: OrdersService,
        private warrantyService: WarrantyService, private commonService: CommonService,
        private documentdetailsService: DocumentdetailsService,
        private router: Router,
        private sessionContext: SessionService,
        private cdr: ChangeDetectorRef,
        private materialscriptService: MaterialscriptService
    ) { }

    // success and error block
    msgFlag: boolean;
    msgType: string;
    msgTitle: string;
    msgDesc: string;


    pageNumber: number;
    pageItemNumber: number = 10;
    startItemNumber: number = 1;
    endItemNumber: number;
    totalRecordCount: number;
    AfterSearch: boolean = false;
    pageChanged(event) {
        this.pageNumber = event;
        this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
        this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
        if (this.endItemNumber > this.totalRecordCount)
            this.endItemNumber = this.totalRecordCount;
        this.purchaseOrderSearch("", this.pageNumber, null);
    }

    ngOnInit() {
        this.materialscriptService.material();
        this.pageNumber = 1;
        this.endItemNumber = 10;
        this.sortingColumn="PurchaseOrderID";
        this.sessionContextResponse = this.sessionContext.customerContext;
        if (this.sessionContextResponse == null) {
            let link = ['/'];
            this.router.navigate(link);
        }

        this.documentdetailsService.currentDetails.subscribe(_documentdetailsService => {
            this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.POInvoice)
                .subscribe(res => { this.documentLinked = res; }, (err) => {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = err.statusText.toString();
                    this.msgTitle = '';

                    return;
                });
        });
        this.userName = this.sessionContextResponse.userName;
        this.userId = this.sessionContextResponse.userId;
        this.loginId = this.sessionContextResponse.loginId;
        this.ordersSearchForm = new FormGroup({
            'orderNumber': new FormControl('', Validators.compose([Validators.pattern(this.validatOrderPattern)])),
            'orderStatus': new FormControl(''),
            'timePeriod': new FormControl(null)
        });
        this.ordersAddForm = new FormGroup({
            'orderNumber': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateOrderPattern),
            Validators.minLength(1), Validators.maxLength(20)])),
            'orderDate': new FormControl(null, [Validators.required]),
            'vendor': new FormControl('', [Validators.required]),
            'contractNumber': new FormControl('', [Validators.required]),
            'warrantyName': new FormControl('', [Validators.required]),
            'warrantyDuration': new FormControl('')
        });
        this.addItemForm = new FormGroup({
            'itemName': new FormControl('', [Validators.required]),
            'itemQuantity': new FormControl('', Validators.compose([Validators.required,
            Validators.pattern(this.validateNumberPattern), Validators.minLength(1), Validators.maxLength(6)]))
        });
        this.editItemForm = new FormGroup({
            'editItemQuantity': new FormControl('', Validators.compose([Validators.required,
            Validators.pattern(this.validateNumberPattern), Validators.minLength(1), Validators.maxLength(6)]))
        });
        this.getPurchaseOrderStatuses();
        if (this.ordersService.purchaseOrderSearchDetails != undefined && this.ordersService.purchaseOrderSearchDetails != null) {
            this.viewItems();
        } else {
            this.getUserEvents();
            this.purchaseOrderSearch("VIEW", this.pageNumber, this.userEvents);

        }

        this.getVendorNames();
        this.getWarrantyMonths();
        this.getApplicationParameterValue();
        this.disableButton = !this.commonService.isAllowed(Features[Features.PURCHASEORDER], Actions[Actions.CREATE], "");
        this.cancelDisableButton = !this.commonService.isAllowed(Features[Features.PURCHASEORDER], Actions[Actions.DELETE], "");
        this.searchDisableButton = !this.commonService.isAllowed(Features[Features.PURCHASEORDER], Actions[Actions.SEARCH], "");
        this.viewDisableButton = !this.commonService.isAllowed(Features[Features.PURCHASEORDERDETAILS], Actions[Actions.VIEW], "");
        this.pdfDisableButton = !this.commonService.isAllowed(Features[Features.PURCHASEORDER], Actions[Actions.VIEWPDF], "");
        this.myDatePickerOptions = {
            // other options...
            dateFormat: 'mm/dd/yyyy',
            disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
            inline: false,
            indicateInvalidDate: true,
            showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
        };
    }
    ngAfterViewInit() {
        this.cdr.detectChanges();
    }
    setDate(): void {
        // Set today date using the patchValue function
        let date = new Date();
        this.ordersAddForm.patchValue({
            orderDate: {
                date: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate()
                }
            }
        });
    }
    purchaseStatuses: any[];
    getApplicationParameterValue() { // res 1
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsTagByAgency).subscribe(
            res => {
                this.isTagAgency = res
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    getPurchaseOrderStatuses() {
        this.ordersService.getPurchaseOrderStatuses().subscribe(
            res => {
                this.purchaseStatuses = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';
                return;
            });
    }
    viewItems() {

        this.ordersSearchForm.controls['orderNumber'].setValue(this.ordersService.purchaseOrderSearchDetails.PurchaseOrderNumber);
        if (this.ordersService.purchaseOrderSearchDetails.PurchaseOrderStatus == PurchaseOrderStatus[PurchaseOrderStatus.All])
            this.ordersSearchForm.controls['orderStatus'].setValue("");
        else
            this.ordersSearchForm.controls['orderStatus'].setValue(this.ordersService.purchaseOrderSearchDetails.PurchaseOrderStatus);
        this.ordersSearchForm.controls['timePeriod'].setValue(this.ordersService.purchaseOrderSearchDetails.timePeriod);
        this.timePeriod = this.ordersService.purchaseOrderSearchDetails.timePeriod;
        if (this.ordersService.purchaseOrderSearchDetails.timePeriod == "" || this.ordersService.purchaseOrderSearchDetails.timePeriod == null) {
            this.purchaseOrderRequest.StartDate = this.startDate;
            this.purchaseOrderRequest.EndDate = this.endDate;
        }
        this.getUserEvents();
        this.purchaseOrderSearch(this.ordersService.purchaseOrderSearchDetails.type, 1, this.userEvents);
        this.ordersService.purchaseOrderSearchDetails = null;
    }
    purchaseOrderSearchButton() {
        if (!this.invalidDateRange) {
            this.isSearchClicked = true;
            this.ordersSearchForm.controls["orderNumber"].setValidators(Validators.compose([Validators.required, Validators.pattern(this.validatOrderPattern)]));
            this.ordersSearchForm.controls["orderNumber"].updateValueAndValidity();
            if ((this.ordersSearchForm.controls['orderNumber'].value == "" || this.ordersSearchForm.controls['orderNumber'].value == null) && (this.ordersSearchForm.controls['orderStatus'].value == "" || this.ordersSearchForm.controls['orderStatus'].value == null)
                && (this.ordersSearchForm.controls['timePeriod'].value == "" || this.ordersSearchForm.controls['timePeriod'].value == null)) {

                this.validateAllFormFields(this.ordersSearchForm);

            }
            else {
                this.ordersSearchForm.controls["orderNumber"].clearValidators();
                this.ordersSearchForm.controls["orderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
                this.ordersSearchForm.controls["orderNumber"].updateValueAndValidity();
                let orderStatus = this.ordersSearchForm.controls['orderStatus'].value;
                let orderNumber = this.ordersSearchForm.controls['orderNumber'].value;
                let timePeriod = this.ordersSearchForm.controls['timePeriod'].value;
                this.ordersSearchForm.reset();
                this.ordersSearchForm.controls['orderNumber'].setValue(orderNumber);
                this.ordersSearchForm.controls['orderStatus'].setValue(orderStatus);
                this.ordersSearchForm.controls['timePeriod'].setValue(timePeriod);
                this.getUserEvents();
                this.userEvents.ActionName = Actions[Actions.SEARCH];
                this.purchaseOrderSearch('SEARCH', 1, this.userEvents);
            }
        }

    }
    purchaseOrderSearch(type: any, pageNumber: number, userEvents) {
        if (type == "VIEW") {
            this.purchaseOrderRequest.PurchaseOrderNumber = "";
            this.purchaseOrderRequest.StartDate = this.startDate;
            this.purchaseOrderRequest.EndDate = this.endDate;
            if (type != "" && type != null)
                this.purchaseOrderRequest.type = type;
            this.purchaseOrderRequest.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.All];
        }
        else if (type == "SEARCH") {
            if (type != "" && type != null)
                this.purchaseOrderRequest.type = type;
            var orderNumber = this.ordersSearchForm.controls['orderNumber'].value;
            if (orderNumber != null && orderNumber != "")
                var orderNumber = (this.ordersSearchForm.controls['orderNumber'].value).trim();
            this.purchaseOrderRequest.PurchaseOrderNumber = orderNumber;
            const strDate = this.ordersSearchForm.controls['timePeriod'].value;
            this.purchaseOrderRequest.timePeriod = strDate;
            const status = this.ordersSearchForm.controls['orderStatus'].value;
            if (strDate != "" && strDate != null) {
                // const strDateRange = strDate.slice(',');
                let firstDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);     //new Date(strDateRange[0]);
                let lastDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);  // new Date(strDateRange[1]);
                if (firstDate.getTime() > lastDate.getTime()) {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Invalid Date range";
                    this.msgTitle = '';
                    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
                    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
                    this.ordersSearchForm.controls['timePeriod'].setValue(null);
                    return;
                }
                else if ((firstDate.getFullYear() <= 1970) || (lastDate.getFullYear() <= 1970)) {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Invalid Date range";
                    this.msgTitle = '';
                    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
                    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
                    this.ordersSearchForm.controls['timePeriod'].setValue(null);
                    return;

                }

                let startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
                let endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
                this.purchaseOrderRequest.StartDate = startDate;
                this.purchaseOrderRequest.EndDate = endDate;
            }
            else {
                this.purchaseOrderRequest.StartDate = this.startDate;
                this.purchaseOrderRequest.EndDate = this.endDate;
            }

            if ((status != "") && (status != null)) {
                this.purchaseOrderRequest.PurchaseOrderStatus = status;
            }
            else
                this.purchaseOrderRequest.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.All];

        }
        if (this.ordersSearchForm.valid) {
            this.purchaseOrderRequest.PageNumber = pageNumber;
            this.purchaseOrderRequest.PageSize = 10;
            this.purchaseOrderRequest.SortColumn = this.sortingColumn;
            this.purchaseOrderRequest.SortDirection = this.sortingDirection;
            this.purchaseOrderRequest.User = this.userName;
            this.purchaseOrderRequest.UserId = this.userId;
            this.purchaseOrderRequest.OnSearchClick = true
            this.purchaseOrderRequest.LoginId = this.loginId;
            this.purchaseOrderRequest.ActivitySource = this.activitySource;
            this.purchaseOrderRequest.OnPageLoad = true;
            this.ordersService.getPurchaseOrderDetails(this.purchaseOrderRequest, userEvents).subscribe(
                res => {
                    if (res != null && res.length > 0) {
                        this.purchaseOrderResponse = res;
                        this.AfterSearch = true;

                        this.totalRecordCount = this.purchaseOrderResponse[0].RecCount;
                        if (this.totalRecordCount < this.pageItemNumber) {
                            this.endItemNumber = this.totalRecordCount;
                        }
                    }
                    else {
                        this.purchaseOrderResponse = res;
                    }
                },
                (err) => {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = err.statusText.toString();
                    this.msgTitle = '';
                    return;
                });
        }
        else {
            this.validateAllFormFields(this.ordersSearchForm);
        }
    }
    purchaseOrderSearchReset() {
        this.isSearchClicked = false;
        this.invalidDateRange = false;
        this.ordersSearchForm.controls["orderNumber"].clearValidators();
        this.ordersSearchForm.controls["orderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
        this.ordersSearchForm.controls["orderNumber"].updateValueAndValidity();
        this.ordersSearchForm.reset();
        this.ordersSearchForm.controls['orderNumber'].setValue("");
        this.ordersSearchForm.controls['orderStatus'].setValue("");
        this.ordersSearchForm.controls['timePeriod'].setValue(null);
        this.endItemNumber = 10;
        this.pageNumber = 1;
        this.startItemNumber = 1;
        this.purchaseOrderSearch("VIEW", this.pageNumber, null);

    }
    getStatus(id) {
        let purchaseStatusCode = PurchaseOrderStatus[id];
        if (this.purchaseStatuses != undefined && this.purchaseStatuses != null) {
            for (var item = 0; item < this.purchaseStatuses.length; item++) {
                if (purchaseStatusCode == this.purchaseStatuses[item].LookUpTypeCode)
                    return this.purchaseStatuses[item].LookUpTypeCodeDesc;
            }
        }
    }
    addNewPurchaseOrder() {
        this.materialscriptService.material();
        this.invalidDateRange=false;
        this.ordersSearchForm.controls["orderNumber"].clearValidators();
        this.ordersSearchForm.controls["orderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
        this.ordersSearchForm.controls["orderNumber"].updateValueAndValidity();
        this.ordersSearchForm.reset();
        this.ordersSearchForm.controls['orderNumber'].setValue("");
        this.ordersSearchForm.controls['orderStatus'].setValue("");
        this.ordersSearchForm.controls['timePeriod'].setValue(null);
        this.isSubmitted = true;
        this.poNumberStatus = true;
        this.contractNames = null;
        this.warrantyNames = null;
        this.warrantyItemNames = null;
        //this.ordersAddForm.controls["orderDate"].setValue(new Date());
        this.setDate();
    }
    purchaseOrderCancel() {
        this.isSubmitted = false;
        this.isEdit = false;
        this.warrantyInMonths = 0;
        this.ordersAddForm.controls['vendor'].enable();
        this.ordersAddForm.reset();
        this.ordersAddForm.controls['vendor'].setValue("");
        this.ordersAddForm.controls['contractNumber'].setValue("");
        this.ordersAddForm.controls['warrantyName'].setValue("");
        this.addItemForm.reset();
        this.addItemForm.controls['itemName'].setValue("");
        for (var item = 0; item < this.itemDetailsResponseList.length; item++) {
            let purchaseItem = this.itemDetailsResponseList[item];
            this.deleteItem(purchaseItem);
            item = 0;
        }
        this.ordersSearchForm.reset();
        this.ordersSearchForm.controls['orderNumber'].setValue("");
        this.ordersSearchForm.controls['orderStatus'].setValue("");
        this.ordersSearchForm.controls['timePeriod'].setValue(null);
    }
    getVendorNames() {
        this.ordersService.getVendorNames().subscribe(
            res => {
                this.vendorNames = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });

    }
    getContract(event: Event) {
        this.contractNames = null;
        this.warrantyNames = null;
        this.warrantyItemNames = null;
        this.ordersAddForm.controls['contractNumber'].setValue("");
        this.ordersAddForm.controls['warrantyName'].setValue("");
        this.addItemForm.controls['itemName'].setValue("");
        this.warrantyInMonths = 0;
        this.vendorName = event.target['options']
        [event.target['options'].selectedIndex].text;
        let vendorId = event.target['options']
        [event.target['options'].selectedIndex].value;
        this.ordersService.getContractName(vendorId).subscribe(
            res => {
                this.contractNames = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
        this.vendorIdStatus = true;
        if ((this.isTagAgency).toString() == '0')
            this.getVendorSupplierCode(vendorId);
        this.getWarrantyItemNames(vendorId);
    }
    getWarranty(event: Event) {
        this.warrantyNames = null;
        this.ordersAddForm.controls['warrantyName'].setValue("");
        this.warrantyInMonths = 0;
        this.contractName = event.target['options']
        [event.target['options'].selectedIndex].text;
        let contractId = event.target['options']
        [event.target['options'].selectedIndex].value;
        this.ordersService.getWarrantyName(contractId).subscribe(
            res => {
                this.warrantyNames = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    getWarrantyInMonths(event: Event) {
        this.warrantyName = event.target['options']
        [event.target['options'].selectedIndex].text;
        let warrantyId = event.target['options']
        [event.target['options'].selectedIndex].value;
        if (warrantyId) {
            for (var item = 0; item < this.warrantyResponse.length; item++) {
                if (warrantyId == this.warrantyResponse[item].WarrantyId)
                    this.warrantyInMonths = this.warrantyResponse[item].WarrantyInMonths;
            }
        }
        else
            this.warrantyInMonths = 0;
    }
    getWarrantyMonths() {
        let warrantyRequest: IWarrantRequest = <IWarrantRequest>{};
        warrantyRequest.WarrantyName = "";
        warrantyRequest.WarrantyTypeId = "";
        warrantyRequest.OnSearchClick = "SEARCH";
        warrantyRequest.User = this.userName;
        warrantyRequest.UserId = this.userId;
        warrantyRequest.LoginId = this.loginId;
        warrantyRequest.ActivitySource = this.activitySource;
        warrantyRequest.PageNumber = 0;
        warrantyRequest.PageSize = 0;
        warrantyRequest.SortColumn = "WARRANTYNAME";
        warrantyRequest.SortDirection = true;
        this.warrantyService.getWarrantyDetails(warrantyRequest).subscribe(
            res => {
                if (res) {
                    this.warrantyResponse = res;
                }
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    getWarrantyItemNames(vendorId: any) {
        this.ordersService.getWarrantyItems(vendorId).subscribe(
            res => {
                this.warrantyItemNames = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    getItemQuantity(event: Event) {
        this.itemName = event.target['options']
        [event.target['options'].selectedIndex].text;

        let itemId = event.target['options']
        [event.target['options'].selectedIndex].value;
        this.ordersService.checkItemQuantity(itemId).subscribe(
            res => {
                this.itemQuantityResponse = res;
                this.itemMaxQuantityValue = this.itemQuantityResponse[0].MaxOrderLevel;
                this.itemMinQuantityValue = this.itemQuantityResponse[0].MinOrderLevel;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    checkItemQuantity(items: any) {
        if (this.itemQuantity <= 0) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Quantity should be more than 0";
            this.msgTitle = '';
            return false;
        }
        if (this.itemQuantity > items.MaxOrderLevel) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Quantity should be less than or equal to " + items.MaxOrderLevel;
            this.msgTitle = '';
            return false;
        }
        else if (this.itemQuantity < items.MinOrderLevel) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Quantity should be more than or equal to " + items.MinOrderLevel;
            this.msgTitle = '';
            return false;
        }
        return true;
    }


    addPurchaseOrderItems(name: string) {
        if (this.addItemForm.valid) {
            let ItemId = this.addItemForm.controls['itemName'].value;
            if (this.itemDetailsResponseList) {
                for (var item = 0; item < this.itemDetailsResponseList.length; item++) {
                    if (this.itemDetailsResponseList[item].ItemId == ItemId) {
                        this.msgType = 'error';
                        this.msgFlag = true;
                        this.msgDesc = "This Item Type is already added";
                        this.msgTitle = '';

                        return;
                    }
                }
            }

            let itemQuantity;
            if (name == "ADD")
                itemQuantity = this.addItemForm.controls['itemQuantity'].value;

            if (name == "UPDATE") {
                ItemId = this.itemId;
                itemQuantity = this.itemQuantity;
            }
            if (itemQuantity <= 0) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Quantity should be more than 0";
                this.msgTitle = '';

                return;
            }
            if (itemQuantity > this.itemMaxQuantityValue) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Quantity should be less than or equal to " + this.itemMaxQuantityValue;
                this.msgTitle = '';

                return;
            }
            else if (itemQuantity < this.itemMinQuantityValue) {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Quantity should be more than or equal to " + this.itemMinQuantityValue;
                this.msgTitle = '';

                return;
            }
            if (name == "ADD") {
                this.ordersAddForm.controls['vendor'].disable();
                this.ordersService.getPurchaseItemDetails(ItemId).subscribe(
                    res => {
                        this.itemDetailsResponse = res;
                        this.itemDetailsResponse[0].ItemQuantity = itemQuantity;
                        this.itemDetailsResponse[0].UpdatedUser = this.userName;
                        this.itemDetailsResponse[0].MaxOrderLevel = this.itemMaxQuantityValue;
                        this.itemDetailsResponse[0].MinOrderLevel = this.itemMinQuantityValue;
                        res = this.itemDetailsResponse;
                        this.itemDetailsResponseList.push(...res);
                    },
                    (err) => {
                        this.msgType = 'error';
                        this.msgFlag = true;
                        this.msgDesc = err.statusText.toString();
                        this.msgTitle = '';

                        return;
                    });
                this.addItemForm.reset();
                this.addItemForm.controls['itemName'].setValue("");
            }
            else if (name == "UPDATE") {
                this.ordersAddForm.controls['vendor'].disable();
                for (var item = 0; item < this.itemDetailsResponseList.length; item++) {
                    if (this.itemDetailsResponseList[item].ItemId == ItemId) {
                        this.itemDetailsResponseList[item].ItemQuantity = itemQuantity;

                    }
                }
                this.addItemForm.reset();
                this.addItemForm.controls['itemName'].setValue("");
            }
        }
        else {
            this.validateAllFormFields(this.addItemForm);
        }
    }

    resetPurchaseOrderItems() {
        this.invalidDate = false;
        let orderNumber = this.ordersAddForm.controls['orderNumber'].value;
        let vendor = this.ordersAddForm.controls['vendor'].value;
        let contract = this.ordersAddForm.controls['contractNumber'].value;
        let warranty = this.ordersAddForm.controls['warrantyName'].value;
        let date = this.ordersAddForm.controls['orderDate'].value
        this.addItemForm.reset();
        this.ordersAddForm.reset();
        this.addItemForm.controls['itemName'].setValue("");
        this.ordersAddForm.controls['orderNumber'].setValue(orderNumber);
        this.ordersAddForm.controls['vendor'].setValue(vendor);
        this.ordersAddForm.controls['contractNumber'].setValue(contract);
        this.ordersAddForm.controls['warrantyName'].setValue(warranty);
        this.ordersAddForm.controls['orderDate'].setValue(date);
        if (!this.itemDetailsResponseList.length) {
            this.ordersAddForm.controls['vendor'].enable();
        }
        else
            this.ordersAddForm.controls['vendor'].disable();
    }

    editPurchaseOrderItems(items: any) {
        if (this.isEdit) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "edit is not allowed for multiple tags";
            this.msgTitle = '';

            return true;
        }
        this.itemId = items.ItemId;
        this.editItemForm.controls['editItemQuantity'].setValue(items.ItemQuantity);
        items.editable = true;
        this.isEdit = true;
    }
    updatePurchaseOrderItems(items: any) {
        if (this.editItemForm.valid) {
            items.editable = false;
            this.isEdit = false;
            if (this.itemQuantity) {
                let access = this.checkItemQuantity(items);

                if (access)
                    items.ItemQuantity = this.itemQuantity;
            }
        }
        else
            this.validateAllFormFields(this.editItemForm);
    }
    deleteItem(item: any) {
        const index: number = this.itemDetailsResponseList.indexOf(item);
        if (index !== -1) {
            this.itemDetailsResponseList.splice(index, 1);
        }
        if (!this.itemDetailsResponseList.length) {
            this.ordersAddForm.controls['vendor'].enable();
        }
    }
    generatePurchaseOrder() {
        if (this.ordersAddForm.valid) {
            if (this.itemDetailsResponseList.length > 0) {
                let poNumber = this.ordersAddForm.controls['orderNumber'].value;
                let vendorId = this.ordersAddForm.controls['vendor'].value
                if (this.poNumberStatus) {
                    if (this.vendorIdStatus) {
                        this.createPurchaseOrder();
                    }
                    else {
                        this.msgType = 'error';
                        this.msgFlag = true;
                        this.msgDesc = "Selected vendor doesn't have Tag Supplier Code";
                        this.msgTitle = '';

                        return;
                    }
                }
                else {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Purchase Order # already exists";
                    this.msgTitle = '';

                    return;
                }
            }
            else {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = "Items required to generate purchase order";
                this.msgTitle = '';

                return;
            }
        }
        else {
            this.validateAllFormFields(this.ordersAddForm);
        }
    }
    getVendorSupplierCode(vendorId: number) {
        this.ordersService.getVendorSupplierDetails(vendorId).subscribe(
            res => {

                this.vendorIdStatus = res;
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }
    POUniquenessCheck(poNumber: number) {
        if (this.ordersAddForm.controls["orderNumber"].value != "") {
            this.ordersService.POUniquenessCheck(poNumber).subscribe(
                res => {
                    this.poNumberStatus = res;
                },
                (err) => {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = err.statusText.toString();
                    this.msgTitle = '';

                    return;
                });
        }
        else {
            this.poNumberStatus = true;
        }
    }
    createPurchaseOrder() {
        let purchaseOrderDetails: IPurchaseOrderDetailRequest = <IPurchaseOrderDetailRequest>{};
        let purchaseOrderLineItemRequest: IPurchaseOrderLineItemRequest[] = [];
        let date = this.ordersAddForm.controls['orderDate'].value;
        //let startDate = new Date(date.date.year, date.date.month-1, date.date.day, 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        purchaseOrderDetails.PurchaseOrderNumber = this.ordersAddForm.controls['orderNumber'].value;
        this.getInvoiceItemDetails(purchaseOrderDetails.PurchaseOrderNumber);
        purchaseOrderDetails.PurchaseOrderDate = new Date(date.date.year, date.date.month - 1, date.date.day, 0, 0, 0, 0).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
        purchaseOrderDetails.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.PoCreated]; //"PoCreated";
        purchaseOrderDetails.VendorId = this.ordersAddForm.controls['vendor'].value;
        purchaseOrderDetails.VendorName = this.vendorName;
        purchaseOrderDetails.ContractId = this.ordersAddForm.controls['contractNumber'].value;
        purchaseOrderDetails.ContractName = this.contractName;
        purchaseOrderDetails.WarrantyId = this.ordersAddForm.controls['warrantyName'].value;
        purchaseOrderDetails.WarrantyName = this.warrantyName;
        purchaseOrderDetails.IsReturnPO = false;
        purchaseOrderDetails.UpdatedUser = this.userName;
        purchaseOrderDetails.User = this.userName;
        purchaseOrderDetails.UserId = this.userId;
        purchaseOrderDetails.LoginId = this.loginId;
        purchaseOrderDetails.ActivitySource = this.activitySource;
        for (var i = 0; i < this.itemDetailsResponseList.length; i++) {
            this.purchaseOrderItemRequest = <IPurchaseOrderLineItemRequest>{};
            this.purchaseOrderItemRequest.ItemId = this.itemDetailsResponseList[i].ItemId;
            this.purchaseOrderItemRequest.ItemQuantity = this.itemDetailsResponseList[i].ItemQuantity;
            this.purchaseOrderItemRequest.ItemName = this.itemDetailsResponseList[i].ItemName;
            this.purchaseOrderItemRequest.UpdatedUser = this.userName;
            purchaseOrderLineItemRequest.push(this.purchaseOrderItemRequest);
        }
        purchaseOrderDetails.PurchaseOrderLineItemsList = purchaseOrderLineItemRequest.map(x => Object.assign({}, x));
        this.getUserEvents();
        this.userEvents.ActionName = Actions[Actions.CREATE];
        $('#pageloader').modal('show');
        this.ordersService.createPurchaseOrder(purchaseOrderDetails, this.userEvents).subscribe(
            res => {

                if (res) {
                    $('#pageloader').modal('hide');
                    this.purchaseOrderCancel();

                    this.msgType = 'success';
                    this.msgFlag = true;
                    this.msgDesc = "Purchase Order has been generated successfully";
                    this.msgTitle = '';
                    this.purchaseOrderSearch("VIEW", this.pageNumber, null);
                }
            },
            (err) => {
                $('#pageloader').modal('hide');
                this.purchaseOrderCancel();
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';


            });
    }
    getInvoiceItemDetails(poNumber: any) {
        this.ordersService.getInvoiceItemDetails(poNumber).subscribe(
            res => {
            },
            (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
            });
    }

    deletePurchaseOrderBtn(purchaseOrderId) {
        this.ordersSearchForm.controls["orderNumber"].clearValidators();
        this.ordersSearchForm.controls["orderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
        this.ordersSearchForm.controls["orderNumber"].updateValueAndValidity();
        this.ordersSearchForm.reset();
        this.ordersSearchForm.controls['orderNumber'].setValue("");
        this.ordersSearchForm.controls['orderStatus'].setValue("");
        this.ordersSearchForm.controls['timePeriod'].setValue(null);
        this.cancelPurchaseOrderId = purchaseOrderId;
        this.msgType = 'alert';
        this.msgFlag = true;
        this.msgDesc = "Are you sure you want to Cancel ?";
        this.msgTitle = 'Alert';
    }
    deletePurchaseOrder(event) {
        if (event) {
            let cancelPORequest: IPurchaseOrderDetailRequest = <IPurchaseOrderDetailRequest>{};
            cancelPORequest.PurchaseOrderId = this.cancelPurchaseOrderId;
            cancelPORequest.ActivitySource = this.activitySource;
            cancelPORequest.UserId = this.userId;
            cancelPORequest.LoginId = this.loginId;
            cancelPORequest.User = this.userName;
            cancelPORequest.UpdatedUser = this.userName;
            this.getUserEvents();
            this.userEvents.ActionName = Actions[Actions.DELETE];
            this.ordersService.cancelPurchaseOrder(cancelPORequest, this.userEvents).subscribe(
                res => {
                    if (res) {
                        this.msgType = 'success';
                        this.msgFlag = true;
                        this.msgDesc = "Purchase Order has been Cancelled successfully";
                        this.msgTitle = '';
                        this.purchaseOrderSearch("", this.pageNumber, null);
                    }
                },
                (err) => {
                    this.msgType = 'error';
                    this.msgFlag = true;
                    this.msgDesc = "Error while Cancelling Purchase order! Try again";
                    this.msgTitle = '';
                    return;
                });
        }
        else {
            this.msgFlag = false;
        }
    }
    getPurchaseOrderDetailsView(purchaseOrder) {

        this.ordersService.purchaseOrderSearchDetails = this.purchaseOrderRequest;
        this.ordersService.savePurchaseOrderDetails(purchaseOrder);
        this.router.navigate(['imc/orders/purchase-order-details']);
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
            const control = formGroup.get(controlName);
            if (control instanceof FormControl) {
                if (control.invalid) {
                }
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });

    }

    getValue(event: any) {
        this.itemQuantity = event.target.value;
    }
    getUserEvents() {
        this.userEvents.FeatureName = Features[Features.PURCHASEORDER];
        this.userEvents.ActionName = Actions[Actions.VIEW];
        this.userEvents.PageName = this.router.url;
        this.userEvents.CustomerId = 0;
        this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        this.userEvents.UserName = this.sessionContextResponse.userName;
        this.userEvents.LoginId = this.sessionContextResponse.loginId;
    }
    setOutputFlag(e) {
        this.msgFlag = e;
    }




    onInputFieldRangeChanged(event: IMyInputFieldChanged) {
    
               if (event.value != "" && !event.valid) {
            this.invalidDateRange = true;
        }
        else
            this.invalidDateRange = false;
 
    }

    onInputFieldChanged(event: IMyInputFieldChanged) {
    
        if (event.value != "" && !event.valid) {
            this.invalidDate = true;
        }
        else
            this.invalidDate = false;

    }


  sortDirection(SortingColumn) {
    this.gridArrowCOMPANYNAME = false;
    this.gridArrowORDERNUMBER = false;
    this.gridArrowORDERDATE = false;
    this.gridArrowORDERSTATUS = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "COMPANYNAME") {
      this.gridArrowCOMPANYNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ORDERNUMBER") {
      this.gridArrowORDERNUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "ORDERDATE") {
      this.gridArrowORDERDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ORDERSTATUS") {
      this.gridArrowORDERSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    this.purchaseOrderSearch('SEARCH', 1, this.userEvents);
  }



}
