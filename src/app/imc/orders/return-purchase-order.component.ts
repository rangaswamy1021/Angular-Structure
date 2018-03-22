import { VendorCompanyComponent } from './../vendor/vendor-company.component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrdersService } from "./services/orders.service";
import { Router } from '@angular/router';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { IPurchaseOrderSearchRequest } from "./models/purchaseorderseacrhrequest";
import { IPurchaseOrderSearchResponse } from "./models/purchaseorderseacrhresponse";
import { PurchaseOrderStatus } from "../constants";
import { ContractService } from "../contract/services/contract.service";
import { IContractResponse } from "../contract/models/contractresponse";
import { IContractRequest } from "../contract/models/contractrequest";
import { WarrantyService } from "../warranty/services/warranty.service";
import { IWarrantRequest } from "../warranty/models/warrantyrequest";
import { IWarrantyResponse } from "../warranty/models/warrantyresponse";
import { IPurchaseOrderDetailResponse } from "./models/purchaseorderdetailsresponse";
import { IPurchaseOrderDetailRequest } from "./models/purchaseorderdetailsrequest";
import { IPurchaseOrderLineItemRequest } from "./models/purchaseorderlineitemsrequest";
import { VendorService } from "../vendor/services/vendor.service";
import { IPurchaseOrderItemResponse } from "./models/purchaseorderitemresponse";
import { CommonService } from "../../shared/services/common.service";
import { DocumentdetailsService } from "../../csc/documents/services/documents.details.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IUserEvents } from "../../shared/models/userevents";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";

import { isDate } from "util";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDpOptions, IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-return-purchase-order',
  templateUrl: './return-purchase-order.component.html',
  styleUrls: ['./return-purchase-order.component.scss']
})
export class ReturnPurchaseOrderComponent implements OnInit {
  gridArrowORDERSTATUS: boolean;
  gridArrowORDERDATE: boolean;
  gridArrowOLD_PONUMBER: boolean;
  gridArrowNEW_PONUMBER: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowCOMPANYNAME: boolean;
  invalidDate: boolean;
  invalidDateRange: boolean;
  cancelPurchaseOrderId: any;
  tagAgency: any;
  itemsGride: boolean;
  vendorIdStatus: any;
  warrantyItemNames: any;
  oldNumberStatus: boolean;
  returnPurchaseOrderRequest: IPurchaseOrderDetailRequest = <IPurchaseOrderDetailRequest>{}
  returnPurchaseOrderResponse: IPurchaseOrderDetailResponse;
  getContractResponse: IContractResponse[];
  getContractRequest: IContractRequest = <IContractRequest>{};
  purchaseOrderLineItem: IPurchaseOrderLineItemRequest;
  isSubmitted: boolean;
  poNumberStatus = true;
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  //userEvents
  searchButton: boolean;
  addPurchaseOrderButton: boolean;
  disableViewLink: boolean;
  disableCancelLink: boolean;

  sessionContextResponse: IUserresponse;
  purchaseOrderRequest: IPurchaseOrderSearchRequest = <IPurchaseOrderSearchRequest>{};
  purchaseOrderResponse: IPurchaseOrderDetailResponse[];
  vendorNames: IPurchaseOrderSearchResponse[];
  warrantyRequest: IWarrantRequest = <IWarrantRequest>{};
  warrantyResponse: IWarrantyResponse[];
  userEventRequest: IUserEvents = <IUserEvents>{};
  userName: string;
  userId: number;
  loginId: number;
  timePeriod: any
  activitySource: string = ActivitySource[ActivitySource.Internal];
  warrantyInMonths: number = 0;
  returnOrdersSearchForm: FormGroup;
  returnOrdersAddForm: FormGroup;
  validateNamePattern = "[a-zA-Z][a-zA-Z0-9\s ]*";
  validateNumberPattern = "^[0-9]+$";
  validatOrderPattern = "^[A-Za-z0-9-/ ]+$"
  validateOrderPattern = "[a-zA-Z0-9-/][a-zA-Z0-9-/ ]*";
  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear() - 3);
  toDayDate: Date = new Date();
  startDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  endDate = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
  myDatePickerOptions: ICalOptions;
  //myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };

  //for date range;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false

  };
  selectedVendorItems: IPurchaseOrderLineItemRequest[] = [];
  purchaseOrderList: IPurchaseOrderSearchResponse;
  constructor(private ordersService: OrdersService,
    private router: Router,
    private sessionContext: SessionService,
    private contractService: ContractService,
    private warrantyService: WarrantyService,
    private vendorService: VendorService,
    private commonService: CommonService,
    private documentdetailsService: DocumentdetailsService,
    private datePickerFormat: DatePickerFormatService,
    private cdr: ChangeDetectorRef, private materialscriptService:MaterialscriptService) { }

  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  page: number;
  AfterSearch: boolean = false;

  pageChanged(event) {
    this.page = event;
    this.startItemNumber = (((this.page) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.page) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.returnPurchaseOrderSearch("", this.page, null);
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.endItemNumber = 10;
    this.page = 1;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.documentdetailsService.currentDetails.subscribe(documentdetailsService => {
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsTagByAgency)
        .subscribe(res => { this.tagAgency = res; });
    });
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;
    this.returnOrdersSearchForm = new FormGroup({
      'newOrderNumber': new FormControl('', Validators.compose([Validators.pattern(this.validatOrderPattern)])),
      'oldOrderNumber': new FormControl('', Validators.compose([Validators.pattern(this.validatOrderPattern)])),
      'orderStatus': new FormControl(''),
      'timePeriod': new FormControl('')
    });
    this.returnOrdersAddForm = new FormGroup({
      'newOrderNumber': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateOrderPattern),
      Validators.minLength(1), Validators.maxLength(20)])),
      'oldOrderNumber': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateOrderPattern),
      Validators.minLength(1), Validators.maxLength(20)])),
      'orderDate': new FormControl('', [Validators.required]),
      'vendor': new FormControl('', [Validators.required]),
      'contractNumber': new FormControl('', [Validators.required]),
      'warrantyName': new FormControl('', [Validators.required]),
      'warrantyDuration': new FormControl('')
    });
    this.getPurchaseOrderStatuses();
    if (this.ordersService.purchaseOrderReturnSerachDetails != undefined && this.ordersService.purchaseOrderReturnSerachDetails != null) {

      this.viewItems();
    }
    else {
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.VIEW];
      this.returnPurchaseOrderSearch("VIEW", this.page, userEvents);
    }

    this.searchButton = !this.commonService.isAllowed(Features[Features.RETURNPURCHASEORDER], Actions[Actions.SEARCH], "");

    this.addPurchaseOrderButton = !this.commonService.isAllowed(Features[Features.RETURNPURCHASEORDER], Actions[Actions.CREATE], "");

    this.disableViewLink = !this.commonService.isAllowed(Features[Features.PURCHASEORDERDETAILS], Actions[Actions.VIEW], "");

    this.disableCancelLink = !this.commonService.isAllowed(Features[Features.RETURNPURCHASEORDER], Actions[Actions.DELETE], "");

    this.getVendorNames();
    this.getContractName("View");
    this.getWarrantyDetails();

    this.myDatePickerOptions = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
      inline: false,
      alignSelectorRight: false,
      indicateInvalidDateRange: true,
      showClearBtn: false,
      showApplyBtn: false,
      showClearDateBtn: false
  };
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  // Set today date using the patchValue function
  setDate(): void {
    let date = new Date();
    this.returnOrdersAddForm.patchValue({
      orderDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

  addNewReturnPurchaseOrder() {
    this.returnPurchaseOrderSearchReset();
    this.isSubmitted = true;
    this.returnOrdersAddForm.controls["vendor"].disable();
    this.returnOrdersAddForm.controls["contractNumber"].disable();
    this.returnOrdersAddForm.controls["warrantyName"].disable();
    //this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
    this.setDate();

  }
  viewItems() {

    this.returnOrdersSearchForm.controls['newOrderNumber'].setValue(this.ordersService.purchaseOrderReturnSerachDetails.PurchaseOrderNumber);
    this.returnOrdersSearchForm.controls['oldOrderNumber'].setValue(this.ordersService.purchaseOrderReturnSerachDetails.OldPurchaseOrderNumber);
    if (this.ordersService.purchaseOrderReturnSerachDetails.PurchaseOrderStatus == PurchaseOrderStatus[PurchaseOrderStatus.All])
      this.returnOrdersSearchForm.controls['orderStatus'].setValue("");
    else
      this.returnOrdersSearchForm.controls['orderStatus'].setValue(this.ordersService.purchaseOrderReturnSerachDetails.PurchaseOrderStatus);
    this.returnOrdersSearchForm.controls['timePeriod'].setValue(this.ordersService.purchaseOrderReturnSerachDetails.timePeriod);
    this.timePeriod = this.ordersService.purchaseOrderReturnSerachDetails.timePeriod;
    if (this.ordersService.purchaseOrderReturnSerachDetails.timePeriod == "" || this.ordersService.purchaseOrderReturnSerachDetails.timePeriod == null) {
      this.purchaseOrderRequest.StartDate = this.startDate;
      this.purchaseOrderRequest.EndDate = this.endDate;
    }
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.VIEW];
    this.returnPurchaseOrderSearch(this.ordersService.purchaseOrderReturnSerachDetails.type, 1, userEvents)
    this.ordersService.purchaseOrderReturnSerachDetails = null;
  }

  returnPurchaseCancel() {
    this.isSubmitted = false;
    this.returnOrdersAddForm.reset();
    this.returnOrdersAddForm.controls["vendor"].setValue("");
    this.returnOrdersAddForm.controls["contractNumber"].setValue("");
    this.returnOrdersAddForm.controls["warrantyName"].setValue("");
    //this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
    this.setDate();
    this.warrantyInMonths = 0;
    this.poNumberStatus = true;
    this.oldNumberStatus = false;
    this.selectedVendorItems = [];
  }

  //get purchase order status
  purchaseStatuses: any[];
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

  returnPurchaseOrderSearchClick() {
    if (!this.invalidDateRange) {
      this.returnOrdersSearchForm.controls["newOrderNumber"].setValidators(Validators.compose([Validators.required, Validators.pattern(this.validatOrderPattern)]));
      this.returnOrdersSearchForm.controls["newOrderNumber"].updateValueAndValidity();

      if ((this.returnOrdersSearchForm.controls['newOrderNumber'].value == "" || this.returnOrdersSearchForm.controls['newOrderNumber'].value == null) && (this.returnOrdersSearchForm.controls['oldOrderNumber'].value == "" || this.returnOrdersSearchForm.controls['oldOrderNumber'].value == null) && (this.returnOrdersSearchForm.controls['orderStatus'].value == "" || this.returnOrdersSearchForm.controls['orderStatus'].value == null)
        && (this.returnOrdersSearchForm.controls['timePeriod'].value == "" || this.returnOrdersSearchForm.controls['timePeriod'].value == null)) {

        this.validateAllFormFields(this.returnOrdersSearchForm);

      }
      else {
        this.returnOrdersSearchForm.controls["newOrderNumber"].clearValidators();
        this.returnOrdersSearchForm.controls["newOrderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
        this.returnOrdersSearchForm.controls["newOrderNumber"].updateValueAndValidity();
        let orderStatus = this.returnOrdersSearchForm.controls['orderStatus'].value;
        let newOrderNumber = this.returnOrdersSearchForm.controls['newOrderNumber'].value;
        let orderNumber = this.returnOrdersSearchForm.controls['oldOrderNumber'].value;
        let timePeriod = this.returnOrdersSearchForm.controls['timePeriod'].value;
        this.returnOrdersSearchForm.reset();
        this.returnOrdersSearchForm.controls['newOrderNumber'].setValue(newOrderNumber);
        this.returnOrdersSearchForm.controls['oldOrderNumber'].setValue(orderNumber);
        this.returnOrdersSearchForm.controls['orderStatus'].setValue(orderStatus);
        this.returnOrdersSearchForm.controls['timePeriod'].setValue(timePeriod);
        let userEvents = this.userEvents();
        userEvents.ActionName = Actions[Actions.SEARCH];
        this.returnPurchaseOrderSearch('SEARCH', 1, userEvents);
      }
    }
    // else{
    //    this.msgType = 'error';
    //           this.msgFlag = true;
    //           this.msgDesc = "Invalid Data range";
    //           this.msgTitle = '';
    // }
  }
  returnPurchaseOrderSearch(type: any, page: number, userEvents: IUserEvents) {
    if (this.returnOrdersSearchForm.valid) {
      if (type == "VIEW") {
        this.purchaseOrderRequest.PurchaseOrderNumber = "";
        this.purchaseOrderRequest.OldPurchaseOrderNumber = "";
        this.purchaseOrderRequest.StartDate = this.startDate;
        this.purchaseOrderRequest.EndDate = this.endDate;
        if (type != "" && type != null)
          this.purchaseOrderRequest.type = type;
        this.purchaseOrderRequest.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.All];
      }
      else if (type == "SEARCH") {
        if (type != "" && type != null)
          this.purchaseOrderRequest.type = type;
        var newOrderNumber = this.returnOrdersSearchForm.controls['newOrderNumber'].value;
        var oldOrderNumber = this.returnOrdersSearchForm.controls['oldOrderNumber'].value;
        if (newOrderNumber != "" && newOrderNumber != null)
          var newOrderNumber = (this.returnOrdersSearchForm.controls['newOrderNumber'].value).trim();
        if (oldOrderNumber != "" && oldOrderNumber != null)
          var oldOrderNumber = (this.returnOrdersSearchForm.controls['oldOrderNumber'].value).trim();
        this.purchaseOrderRequest.PurchaseOrderNumber = newOrderNumber;
        this.purchaseOrderRequest.OldPurchaseOrderNumber = oldOrderNumber;
        const strDate = this.returnOrdersSearchForm.controls['timePeriod'].value;
        this.purchaseOrderRequest.timePeriod = strDate;
        const status = this.returnOrdersSearchForm.controls['orderStatus'].value;
        if (strDate != "" && strDate != null) {
          //const strDateRange = strDate.slice(',');
          //let firstDate = new Date(strDateRange[0]);
          // let lastDate = new Date(strDateRange[1]);
          let date = this.datePickerFormat.getFormattedDateRange(this.returnOrdersSearchForm.controls['timePeriod'].value);
          let firstDate = date[0];
          let lastDate = date[1];
          if (firstDate.getTime() > lastDate.getTime()) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Data range";
            this.msgTitle = '';
            // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
            // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
            this.returnOrdersSearchForm.controls['timePeriod'].setValue(null);
            return;
          }
          else if ((firstDate.getFullYear() <= 1970) || (lastDate.getFullYear() <= 1970)) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Date range";
            this.msgTitle = '';
            // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
            // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
            this.returnOrdersSearchForm.controls['timePeriod'].setValue(null);
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
      this.purchaseOrderRequest.PageNumber = page;
      this.purchaseOrderRequest.PageSize = 10;
      this.purchaseOrderRequest.SortColumn = this.sortingColumn;
      this.purchaseOrderRequest.SortDirection = this.sortingDirection;
      this.purchaseOrderRequest.User = this.userName;
      this.purchaseOrderRequest.UserId = this.userId;
      this.purchaseOrderRequest.OnSearchClick = true;
      this.purchaseOrderRequest.LoginId = this.loginId;
      this.purchaseOrderRequest.ActivitySource = this.activitySource;
      this.purchaseOrderRequest.OnPageLoad = true;
      $('#pageloader').modal('show');
      this.ordersService.getReturnPurchaseOrderDetailsView(this.purchaseOrderRequest, userEvents).subscribe(
        res => {
          $('#pageloader').modal('hide');
          if (res != null && res.length > 0) {
            this.purchaseOrderResponse = res;
            this.AfterSearch = true;
            this.dataLength = this.purchaseOrderResponse[0].RecCount;
            if (this.dataLength < this.pageItemNumber) {
              this.endItemNumber = this.dataLength
            }
          }
          else {
            this.purchaseOrderResponse = res;
          }
        },
        (err) => {
          $('#pageloader').modal('hide');
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.validateAllFormFields(this.returnOrdersSearchForm);
    }
  }
  returnPurchaseOrderSearchReset() {
    this.returnOrdersSearchForm.controls["newOrderNumber"].clearValidators();
    this.returnOrdersSearchForm.controls["newOrderNumber"].setValidators(Validators.pattern(this.validatOrderPattern));
    this.returnOrdersSearchForm.controls["newOrderNumber"].updateValueAndValidity();
    this.returnOrdersSearchForm.reset();
    this.returnOrdersSearchForm.controls['newOrderNumber'].setValue("");
    this.returnOrdersSearchForm.controls['oldOrderNumber'].setValue("");
    this.returnOrdersSearchForm.controls['orderStatus'].setValue("");
    this.returnOrdersSearchForm.controls['timePeriod'].setValue(null);
    this.endItemNumber = 10;
    this.page = 1;
    this.startItemNumber = 1;
    this.returnPurchaseOrderSearch("VIEW", this.page, null);
  }
  getStatus(id) {
    if (this.purchaseStatuses != undefined && this.purchaseStatuses != null) {
      let purchaseStatusCode = PurchaseOrderStatus[id];
      for (var i = 0; i < this.purchaseStatuses.length; i++) {
        if (purchaseStatusCode == this.purchaseStatuses[i].LookUpTypeCode)
          return this.purchaseStatuses[i].LookUpTypeCodeDesc;
      }
    }
  }
  POUniquenessCheck(poNumber: number) {
    if (this.returnOrdersAddForm.controls["newOrderNumber"].value != "" && this.returnOrdersAddForm.controls["newOrderNumber"].value != null) {
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
  getContractName(search: string) {
    this.getContractRequest.ContractNumber = '';
    this.getContractRequest.ContractName = '';
    this.getContractRequest.ContractStatus = 2;
    this.getContractRequest.SearchFlag = "VIEW";
    this.getContractRequest.User = this.sessionContext.customerContext.userName;
    this.getContractRequest.UserId = this.sessionContext.customerContext.userId;
    this.getContractRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.getContractRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getContractRequest.PageNumber = 0;
    this.getContractRequest.PageSize = 0;
    this.getContractRequest.SortColumn = "";
    this.getContractRequest.SortDirection = true;
    this.contractService.getContractDetails(this.getContractRequest).subscribe(
      res => {
        this.getContractResponse = res;
      });
  }
  getWarrantyDetails() {
    this.warrantyRequest.WarrantyName = "";
    this.warrantyRequest.WarrantyTypeId = "";
    this.warrantyRequest.OnSearchClick = "SEARCH";
    this.warrantyRequest.User = this.sessionContext.customerContext.userName;
    this.warrantyRequest.UserId = this.sessionContext.customerContext.userId;
    this.warrantyRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.warrantyRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.warrantyRequest.PageNumber = 0;
    this.warrantyRequest.PageSize = 0;
    this.warrantyRequest.SortColumn = "";
    this.warrantyRequest.SortDirection = true;
    this.warrantyService.getWarrantyDetails(this.warrantyRequest).subscribe(
      res => {
        if (res) {
          this.warrantyResponse = res;
        }
      });
  }
  getPOInfoByPONumberToReturn(event: any) {
    let poNumber = event.target.value;
    if (this.returnOrdersAddForm.controls["oldOrderNumber"].value != "") {
      this.ordersService.getPOInfoByPONumberToReturn(poNumber).subscribe(
        res => {
          this.returnPurchaseOrderResponse = res;
          this.returnOrdersAddForm.controls["vendor"].setValue(this.returnPurchaseOrderResponse['VendorId']);
          this.returnOrdersAddForm.controls["contractNumber"].setValue(this.returnPurchaseOrderResponse['ContractId']);
          this.returnOrdersAddForm.controls["warrantyName"].setValue(this.returnPurchaseOrderResponse['WarrantyId']);
          //this.returnOrdersAddForm.controls["orderDate"].setValue(this.returnPurchaseOrderResponse['PurchaseOrderDate']);
          let date = this.returnPurchaseOrderResponse['PurchaseOrderDate'].toString();
          let dateStr = new Date(date);
          this.returnOrdersAddForm.patchValue({
            orderDate: {
              date: {
                year: dateStr.getFullYear(),
                month: dateStr.getMonth() + 1,
                day: dateStr.getDate()
              }
            }
          });
          this.warrantyInMonths = this.returnPurchaseOrderResponse['WarrantyInMonths'];
          this.selectedVendorItems = [];
          this.vendorIdStatus = true;
          if ((this.tagAgency).toString() == '0')
            this.getVendorSupplierCode(this.returnPurchaseOrderResponse.VendorId);
          this.getWarrantyItemNames(this.returnPurchaseOrderResponse.PurchaseOrderLineItems);
        });
    }
    else {
      // this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
      this.setDate();
      this.returnOrdersAddForm.controls["vendor"].setValue("");
      this.returnOrdersAddForm.controls["contractNumber"].setValue("");
      this.returnOrdersAddForm.controls["warrantyName"].setValue("");
      this.warrantyInMonths = 0;
    }
  }
  generateReturnPurchaseOrder() {
    if (this.returnOrdersAddForm.valid) {
      if(!this.invalidDate){
      if (!this.poNumberStatus) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Purchase Order # already exists";
        this.msgTitle = '';
        return;
      }
      if (this.oldNumberStatus) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Purchase Order # Not exists";
        this.msgTitle = '';
        return;
      }
      if (this.selectedVendorItems.length) {
        if (this.vendorIdStatus) {
          if (this.tagAgency) {
            this.returnPurchaseOrderRequest.PurchaseOrderLineItemsList = this.selectedVendorItems.map(x => Object.assign({}, x));
            let date = this.returnOrdersAddForm.controls["orderDate"].value;
            //this.returnPurchaseOrderRequest.PurchaseOrderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.returnPurchaseOrderRequest.PurchaseOrderDate = new Date(date.date.year, date.date.month - 1, date.date.day, 0, 0, 0, 0).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
            this.returnPurchaseOrderRequest.PurchaseOrderNumber = this.returnOrdersAddForm.controls["newOrderNumber"].value;
            this.returnPurchaseOrderRequest.IsReturnPO = true;
            this.returnPurchaseOrderRequest.VendorId = this.returnOrdersAddForm.controls["vendor"].value;
            for (var item = 0; item < this.vendorNames.length; item++) {
              if (this.vendorNames[item].VendorId == this.returnPurchaseOrderRequest.VendorId) {
                this.returnPurchaseOrderRequest.VendorName = this.vendorNames[item].CompanyName;
              }
            }
            this.returnPurchaseOrderRequest.PurchaseOrderId = this.returnPurchaseOrderResponse['PurchaseOrderId'];
            this.returnPurchaseOrderRequest.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.PoCreated];
            this.returnPurchaseOrderRequest.ContractId = this.returnOrdersAddForm.controls["contractNumber"].value;
            for (var item = 0; item < this.getContractResponse.length; item++) {
              if (this.getContractResponse[item].ContractId == this.returnPurchaseOrderRequest.ContractId) {
                this.returnPurchaseOrderRequest.ContractName = this.getContractResponse[item].ContractName;
              }
            }
            this.returnPurchaseOrderRequest.WarrantyId = this.returnOrdersAddForm.controls["warrantyName"].value;
            for (var item = 0; item < this.warrantyResponse.length; item++) {
              if (this.warrantyResponse[item].WarrantyId == this.returnPurchaseOrderRequest.WarrantyId) {
                this.returnPurchaseOrderRequest.WarrantyName = this.warrantyResponse[item].WarrantyName;
              }
            }
            this.returnPurchaseOrderRequest.WarrantyInMonths = this.warrantyInMonths;
            this.returnPurchaseOrderRequest.UpdatedUser = this.userName;
            this.returnPurchaseOrderRequest.UpdatedDate = this.todayDate;
            this.returnPurchaseOrderRequest.LocationPath = "";
            this.returnPurchaseOrderRequest.User = this.userName;
            this.returnPurchaseOrderRequest.LoginId = this.loginId;
            this.returnPurchaseOrderRequest.UserId = this.userId;
            this.returnPurchaseOrderRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
            $('#pageloader').modal('show');
            let userEvents = this.userEvents();
            userEvents.ActionName = Actions[Actions.CREATE];
            this.ordersService.generateReturnPurchaseOrder(this.returnPurchaseOrderRequest, userEvents).subscribe(
              res => {
                this.returnPurchaseOrderResponse = res;
                this.returnPurchaseCancel();
                this.returnPurchaseOrderSearch("VIEW", this.page, null);
                $('#pageloader').modal('hide');
                this.msgType = 'success';
                this.msgFlag = true;
                this.msgDesc = "Purchase Order has been generated successfully";
                this.msgTitle = '';
              },
              err => {
                $('#pageloader').modal('hide');
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';
                return;
              }
            );
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Selected vendor doesn't have tagAgency.";
            this.msgTitle = '';
            return;
          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Selected vendor doesn't have Tag Supplier Code.";
          this.msgTitle = '';
          return;
        }
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Items required to generate purchase order.";
        this.msgTitle = '';
        return;
      }
      }
    }
   else {
      this.validateAllFormFields(this.returnOrdersAddForm);
    }
  }

  getWarrantyItemNames(response) {
    this.warrantyItemNames = response;
    if (this.warrantyItemNames != null && this.warrantyItemNames.length > 0) {
      for (let item = 0; item < this.warrantyItemNames.length; item++) {
        this.purchaseOrderLineItem = <IPurchaseOrderLineItemRequest>{};
        this.purchaseOrderLineItem.ItemId = this.warrantyItemNames[item].ItemId;
        this.purchaseOrderLineItem.ItemDesc = this.warrantyItemNames[item].ItemDesc;
        this.purchaseOrderLineItem.ItemName = this.warrantyItemNames[item].ItemName;
        this.purchaseOrderLineItem.ItemQuantity = this.warrantyItemNames[item].ItemQuantity;
        this.purchaseOrderLineItem.UpdatedUser = this.userName;
        this.selectedVendorItems.push(this.purchaseOrderLineItem);

      }
    }
    else {
      this.itemsGride = true;
    }
  }
  getPurchaseOrderDetailstoGrid(purchaseOrder) {
    this.ordersService.purchaseOrderReturnSerachDetails = this.purchaseOrderRequest;
    this.ordersService.saveReturnPurchaseOrderDetails(purchaseOrder);
    this.router.navigate(['imc/orders/return-purchase-order-details']);
  }
  getVendorSupplierCode(vendorId: any) {
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
  deletePurchaseOrderBtn(purchaseOrderId) {
    this.cancelPurchaseOrderId = purchaseOrderId;
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = "Are you sure you want to Cancel ?";
    this.msgTitle = '';
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
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.DELETE];
      this.ordersService.deletePurchaseOrder(cancelPORequest, userEvents).subscribe(
        res => {
          if (res) {
            this.returnPurchaseOrderSearch("VIEW", this.page, null);
            this.msgType = 'success';
            this.msgFlag = true;
            this.msgDesc = "Purchase Order has been Cancelled successfully.";
            this.msgTitle = '';
          }
        },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Error while Cancelling Purchase order! Try again.";
          this.msgTitle = '';
          return;
        });

    }
    else {
      this.msgFlag = false;
    }
  }
  oldPOUniquenessCheck(event: any) {
    if (this.returnOrdersAddForm.controls["oldOrderNumber"].value != "") {
      let poNumber = event.target.value;
      this.ordersService.POUniquenessCheck(poNumber).subscribe(
        res => {
          if (res) {
            this.oldNumberStatus = true;
            this.setDate();
            // this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
            this.returnOrdersAddForm.controls["vendor"].setValue("");
            this.returnOrdersAddForm.controls["contractNumber"].setValue("");
            this.returnOrdersAddForm.controls["warrantyName"].setValue("");
            this.warrantyInMonths = 0;
          }

          else {
            this.oldNumberStatus = false;
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
      this.oldNumberStatus = false;
    }
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

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.RETURNPURCHASEORDER];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }


  // bsValueChange(value) {
  //   //console.log(value);
  //   if (value == null || value[0] == null) {
  //     this.returnOrdersSearchForm.controls['timePeriod'].setValue(null);
  //   }
  // }
  // onDateChange(event) {
  //   let date = this.returnOrdersAddForm.controls["orderDate"].value;
  //   if (event.target.value == null || event.target.value == '') {
  //     this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
  //     return;
  //   }
  //   if (date.getFullYear() <= 1970 || (date.getTime() > new Date().getTime())) {
  //     this.msgType = 'error';
  //     this.msgFlag = true;
  //     this.msgDesc = "Invalid Date";
  //     this.msgTitle = '';
  //     this.returnOrdersAddForm.controls["orderDate"].setValue(new Date());
  //     return;
  //   }
  // }


  //single date changed event
  onDateChanged(event: IMyInputFieldChanged) {
    let date = this.returnOrdersAddForm.controls["orderDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
  //Date range changed event
  onDateRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

  }




  sortDirection(SortingColumn) {
    this.gridArrowCOMPANYNAME = false;
    this.gridArrowNEW_PONUMBER = false;
    this.gridArrowOLD_PONUMBER = false;
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

    else if (this.sortingColumn == "NEW_PONUMBER") {
      this.gridArrowNEW_PONUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "OLD_PONUMBER") {
      this.gridArrowOLD_PONUMBER = true;
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
    this.returnPurchaseOrderSearch("", this.page, null);
  }

}
