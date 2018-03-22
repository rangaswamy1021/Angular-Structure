import { Action } from './../../sac/usermanagement/models/privilegesresponse';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ShipmentService } from "./services/shipment.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { IShipmentSearchRequest } from "./models/shipmentsearchrequest";
import { IShipmentSearchResponse } from "./models/shipmentsearchresponse";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IMyInputFieldChanged, IMyDateRangeModel } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-shipment-search',
  templateUrl: './shipment-search.component.html',
  styleUrls: ['./shipment-search.component.scss']
})


export class ShipmentSearchComponent implements OnInit {
  gridArrowSHIPSTATUS: boolean;
  gridArrowSHIPDATE: boolean;
  gridArrowORDERDATE: boolean;
  gridArrowORDERNUMBER: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  invalidDateRange: boolean;
  invalid: boolean = false;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px', width: '260px',
    inline: false, alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false
  };
  disableEditbtn: boolean = false;
  disableSearchButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  AfterSearch: boolean;
  searchCheck: boolean = false;
  shipmentForm: FormGroup;
  ShipmentSearchRequest: IShipmentSearchRequest = <IShipmentSearchRequest>{};
  shipmentResponse: IShipmentSearchResponse[];
  ShipmentID: any;
  sessionContextResponse: IUserresponse;
  timePeriod: any;
  todayDateRange = new Date();
  startDateRange = (this.todayDateRange.setFullYear(this.todayDateRange.getFullYear() - 3)).toLocaleString(defaultCulture).replace(/\u200E/g, "");

  todayDate: Date = new Date();
  startDate = new Date(this.todayDateRange.getFullYear(), this.todayDateRange.getMonth(), this.todayDateRange.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
  endDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");


  constructor(private shipmentService: ShipmentService,
    private router: Router,
    private context: SessionService,
    private sessionContext: SessionService,
    private commonService: CommonService,
    private routerParameter: ActivatedRoute, private materialscriptService: MaterialscriptService) { }

  pageItemNumber: number = 10;
  totalRecordCount: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number;

  alphaNumericSpaceHypenSlash = "^[-\s\/a-zA-Z0-9 ]+$";


  pageChanged(event) {
    debugger;
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.searchCheck == true) {
      this.searchShipment("", this.p, null);
    }
    else {
      this.getShipmentInformation("VIEW", this.p, null);
    }
  }

  ngOnInit() {
    this.gridArrowORDERNUMBER = true;
    this.sortingColumn = "ORDERNUMBER";
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = 10;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.shipmentForm = new FormGroup({
      'purchaseOrder': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.alphaNumericSpaceHypenSlash)])),
      'shipStatus': new FormControl(''),
      'timePeriod': new FormControl('')
    });
    this.getShipmentStatuses();
    if (this.shipmentService.viewItemsFromService != undefined) {
      this.viewItems();
    } else {
      let userevents = this.userEvents();
      this.getShipmentInformation("VIEW", this.p, userevents);
    }

    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.SHIPMENT], Actions[Actions.SEARCH], "");
    this.disableButton = !this.commonService.isAllowed(Features[Features.SHIPMENT], Actions[Actions.RECEIVE], "");
    this.disableEditbtn = !this.commonService.isAllowed(Features[Features.SHIPMENT], Actions[Actions.VIEWDETAILS], "");


    var Message = this.routerParameter.snapshot.params["Message"];
    if (Message) {
      if (Message == "Created") {
        this.shipmentForm.controls['shipStatus'].setValue("");
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgDesc = "Shipment has been done successfully";
      }
      if (Message == "Ignored") {
        this.shipmentForm.controls['shipStatus'].setValue("");
        this.msgFlag = true;
        this.msgType = 'success';
        this.msgDesc = "Shipment has been Ignored successfully";

      }
    }

  }

  receiveBatchInformation() {
    this.materialscriptService.material();
    this.shipmentService.batchDataFromService = null;
    this.shipmentService.viewItemsFromService = null;
    this.router.navigateByUrl("imc/shipment/shipment-batch-information");
  }

  getItemDetailsByShipmentId(ShipmentID) {
    this.shipmentService.viewItemsFromService = this.ShipmentSearchRequest;
    this.shipmentService.dataFromService = ShipmentID;
    this.router.navigate(['/imc/shipment/shipment-details']);


  }
  searchReset() {
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.shipmentService.viewItemsFromService = null;
    this.ShipmentSearchRequest.timePeriod = null;
    this.ShipmentSearchRequest.StartDate = this.startDate;
    this.ShipmentSearchRequest.EndDate = this.todayDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
    this.endDate = this.todayDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
    this.getShipmentInformation("VIEW", 1, null);
    this.p = 1;
    this.searchCheck = false;
  }

  shipStatuses: any[];
  getShipmentStatuses() {
    this.shipmentService.getShipmentStatuses().subscribe(res => {
      this.shipStatuses = res;
    }, (err) => {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText.toString();
      return;
    }
    )
  }

  getShipmentInformation(strSearchFlag: string, pageNumber: number, userevents) {
    this.ShipmentSearchRequest.OrderNumber = '';
    this.ShipmentSearchRequest.ShipmentStatus = '';
    this.ShipmentSearchRequest.PageNumber = pageNumber;
    this.ShipmentSearchRequest.PageSize = 10;
    this.ShipmentSearchRequest.SortColumn = this.sortingColumn;;
    this.ShipmentSearchRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    this.ShipmentSearchRequest.User = this.context.customerContext.userName;
    this.ShipmentSearchRequest.UserId = this.context.customerContext.userId;
    this.ShipmentSearchRequest.LoginId = this.context.customerContext.loginId;
    this.ShipmentSearchRequest.ActivitySource = ActivitySource[ActivitySource.Internal];//ActivitySource.Internal.toString();
    this.ShipmentSearchRequest.OnPageLoad = true;
    this.ShipmentSearchRequest.StartDate = this.startDate;
    this.ShipmentSearchRequest.EndDate = this.endDate;
    this.shipmentService.getShipmentInformation(this.ShipmentSearchRequest, userevents).subscribe(
      shipRes => {
        this.shipmentResponse = shipRes;
        this.searchCheck = false;
        this.totalRecordCount = this.shipmentResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      });
  }

  viewItems() {
    this.shipmentForm.controls['purchaseOrder'].setValue(this.shipmentService.viewItemsFromService.OrderNumber);
    if (this.shipmentService.viewItemsFromService.ShipmentStatus == null) {
      this.shipmentForm.controls['shipStatus'].setValue("");
    }
    else {
      this.shipmentForm.controls['shipStatus'].setValue(this.shipmentService.viewItemsFromService.ShipmentStatus);
    }
    this.shipmentForm.controls['timePeriod'].setValue(this.shipmentService.viewItemsFromService.timePeriod);
    let userevents = this.userEvents();
    this.searchShipment("SEARCH", this.p, userevents);
  }

  shipmentSearch(event) {
    if (!this.invalid) {

      if ((this.shipmentForm.controls['purchaseOrder'].value == "" || this.shipmentForm.controls['purchaseOrder'].value == null) &&
        (this.shipmentForm.controls['shipStatus'].value == "" || this.shipmentForm.controls['shipStatus'].value == null) &&
        (this.shipmentForm.controls['timePeriod'].value == "" || this.shipmentForm.controls['timePeriod'].value == null)) {
        this.shipmentForm.controls["purchaseOrder"].setValidators([Validators.required, Validators.pattern(this.alphaNumericSpaceHypenSlash)]);
        this.shipmentForm.controls["purchaseOrder"].updateValueAndValidity();
        this.validateAllFormFields(this.shipmentForm);
      }

      else {
        if (this.shipmentForm.controls['purchaseOrder'].value == "" ||
          this.shipmentForm.controls['purchaseOrder'].value == null)
          this.shipmentForm.controls.purchaseOrder.reset();
        let userevents = this.userEvents();
        userevents.ActionName = Actions[Actions.SEARCH];
        this.p = 1;
        this.endItemNumber = 10;
        this.startItemNumber = 1;
        this.searchShipment("SEARCH", this.p, userevents);
      }
    }
  }

  searchShipment(strSearchFlag: string, p: number, userevents) {

    this.shipmentForm.controls["purchaseOrder"].clearValidators();
    this.shipmentForm.controls['purchaseOrder'].setValidators([Validators.pattern(this.alphaNumericSpaceHypenSlash)]);
    this.shipmentForm.controls['purchaseOrder'].updateValueAndValidity();
    let fromDate = new Date();
    let toDate = new Date();
    if (this.shipmentForm.valid) {
      if (strSearchFlag == "SEARCH") {
        let strDate = this.shipmentForm.controls['timePeriod'].value;
        if (strDate != "" && strDate != null) {
          fromDate = new Date(strDate.beginDate.month + '/' + strDate.beginDate.day + '/' + strDate.beginDate.year);
          toDate = new Date(strDate.endDate.month + '/' + strDate.endDate.day + '/' + strDate.endDate.year);
          // let startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
          this.ShipmentSearchRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
          let endDate = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 59);
          this.ShipmentSearchRequest.EndDate = endDate.toLocaleString(defaultCulture).replace(/\u200E/g, "");
          this.ShipmentSearchRequest.timePeriod = strDate;
        }
        // if (strDate != "" && strDate != null) {
        //   const strDateRange = strDate.slice(',');
        //   let firstDate = new Date(strDateRange[0]);
        //   let lastDate = new Date(strDateRange[1]);
        //   let startDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        //   let endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g,"");
        //   this.ShipmentSearchRequest.StartDate = startDate;
        //   this.ShipmentSearchRequest.EndDate = endDate;
        //   this.ShipmentSearchRequest.timePeriod = strDate;
        // }
        else {
          this.shipmentForm.controls['timePeriod'].setValue("");
          this.ShipmentSearchRequest.timePeriod = null;
          this.ShipmentSearchRequest.StartDate = this.startDate;
          this.ShipmentSearchRequest.EndDate = this.endDate;
        }

        this.timePeriod = this.shipmentForm.controls['timePeriod'].value;
        var orderNumber = this.shipmentForm.controls['purchaseOrder'].value;
        if (orderNumber != null && orderNumber != "") {
          var orderNumber = (this.shipmentForm.controls['purchaseOrder'].value).trim();
        }
        this.ShipmentSearchRequest.OrderNumber = orderNumber;
        this.ShipmentSearchRequest.ShipmentStatus = this.shipmentForm.controls['shipStatus'].value;

      }
      this.ShipmentSearchRequest.PageNumber = this.p;
      this.ShipmentSearchRequest.PageSize = 10;
      this.ShipmentSearchRequest.SortColumn = this.sortingColumn;;
      this.ShipmentSearchRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
      this.ShipmentSearchRequest.User = this.context.customerContext.userName;
      this.ShipmentSearchRequest.UserId = this.context.customerContext.userId;
      this.ShipmentSearchRequest.LoginId = this.context.customerContext.loginId;
      this.ShipmentSearchRequest.ActivitySource = ActivitySource.Internal.toString();
      this.ShipmentSearchRequest.OnSearchClick = true;
      this.ShipmentSearchRequest.OnPageLoad = true;
      this.shipmentService.getShipmentInformation(this.ShipmentSearchRequest, userevents).subscribe(
        shipRes => {
          if (shipRes) {
            this.shipmentResponse = shipRes;
            this.searchCheck = true;
            if (shipRes.length > 0) {
              this.totalRecordCount = this.shipmentResponse[0].RecordCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount;
              }
            }
          }
          else {
            this.searchCheck = false;
          }
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          return;
        });
    }
    else {
      this.validateAllFormFields(this.shipmentForm);
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

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.SHIPMENT];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  //Date range changed event
  onDateRangeChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalid = true;
    }
    else
      this.invalid = false;
  }

  sortDirection(SortingColumn) {
    this.gridArrowORDERNUMBER = false;
    this.gridArrowORDERDATE = false;
    this.gridArrowSHIPDATE = false;
    this.gridArrowSHIPSTATUS = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "ORDERNUMBER") {
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

    else if (this.sortingColumn == "SHIPDATE") {
      this.gridArrowSHIPDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "SHIPSTATUS") {
      this.gridArrowSHIPSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    //this.getShipmentInformation("VIEW", this.p, null);
    if (this.searchCheck) {
      this.searchShipment("SEARCH", this.p, null);
    }
    else {
      this.getShipmentInformation("VIEW", this.p, null);

    }
  }


}
