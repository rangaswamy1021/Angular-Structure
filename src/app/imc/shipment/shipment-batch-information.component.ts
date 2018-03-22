import { customDateFormatPipe } from './../../shared/pipes/convert-date.pipe';
import { ShipmentService } from './services/shipment.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { IShipmentSearchResponse } from "./models/shipmentsearchresponse";
import { IPurchaseOrderDetailResponse } from "../orders/models/purchaseorderdetailsresponse";
import { IShipmentDetailsrequest } from "./models/shipmentdetailsrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, SubFeatures, Actions } from "../../shared/constants";
import { IMyInputFieldChanged } from "mydaterangepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-shipment-batch-information',
  templateUrl: './shipment-batch-information.component.html',
  styleUrls: ['./shipment-batch-information.component.scss']
})
export class ShipmentBatchInformationComponent implements OnInit {
  invalidDate: boolean;
  invalid: boolean;
  myDatePickerOptions2: ICalOptions;
  myDatePickerOptions1: ICalOptions;
  receivedDate: any;
  shipDate: any;
  userEventRequest: IUserEvents = <IUserEvents>{};
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  VendorId: any;
  TagSupplierId: any;
  Protocol: string;
  purchaseOrderName: any;
  orderDateResponse: any;
  itemsRes: any;
  itemId: any;
  purchaseResponse: any[];
  descLength: number = 128;
  shipmentResponse: IPurchaseOrderDetailResponse[];
  shipmentMountingResponse: IPurchaseOrderDetailResponse[];
  batchInformationForm: FormGroup;
  alphanumericSpacePattern = "[a-zA-Z0-9][a-zA-Z0-9 ]*";
  notePattern = "[a-zA-Z0-9][a-zA-Z0-9 ]*";


  maxDate: Date = new Date();
  ShipmentRequest: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
  shipMinDate;
  receiveMinDate;
  PurchaseOrder: string;
  itemDetails: any;
  toDayDate = new Date();




  constructor(private router: Router,
    private shipmentService: ShipmentService,
    private formBuilder: FormBuilder,
    private context: SessionService,
    private sessionContext: SessionService,
    private customDateFormatPipe: customDateFormatPipe, private materialscriptService: MaterialscriptService) {
    this.maxDate.setDate(this.maxDate.getDate());
  }


  ngOnInit() {

    this.materialscriptService.material();
    this.batchInformationForm = new FormGroup({
      'purchaseOrder': new FormControl('', [Validators.required]),
      'purchaseOrderDate': new FormControl(''),
      'vendorName': new FormControl(''),
      'contract': new FormControl(''),
      'itemDescription': new FormControl(''),
      'product': new FormControl(''),
      'mounting': new FormControl(''),
      'items': new FormControl('', [Validators.required]),
      'packingList': new FormControl('', [Validators.pattern(this.alphanumericSpacePattern), Validators.minLength(1), Validators.maxLength(50)]),
      'shipDate': new FormControl('', [Validators.required]),
      'receivedDate': new FormControl('', [Validators.required]),
      'note': new FormControl('', [Validators.pattern(this.notePattern), Validators.minLength(1), Validators.maxLength(128)])
    });
    let userevents = this.userEvents();
    this.getPurchaseOrderByStatus(userevents);
    if (this.shipmentService.batchDataFromService != undefined) {
      this.viewItems();

      this.batchInformationForm.controls["shipDate"].enable();
      this.batchInformationForm.controls["receivedDate"].enable();
    } else {
      this.batchInformationForm.controls["shipDate"].disable();
      this.batchInformationForm.controls["receivedDate"].disable();
    }

  }

  cancelBatchInformation() {
    this.batchInformationForm.reset();
    this.batchInformationForm.controls["purchaseOrder"].setValue("");
    this.router.navigateByUrl("imc/shipment/shipment-search");

  }
  goToReceiveShipment() {
    if (this.batchInformationForm.valid) {
      this.ShipmentRequest.User = this.context.customerContext.userName;
      this.ShipmentRequest.ReceivedEmployeeId = 0;
      this.ShipmentRequest.PurchaseOrderID = this.batchInformationForm.controls['purchaseOrder'].value;
      this.ShipmentRequest.OrderDate = this.batchInformationForm.controls['purchaseOrderDate'].value;
      this.ShipmentRequest.CompanyName = this.batchInformationForm.controls['vendorName'].value;
      this.ShipmentRequest.ContractNumber = this.batchInformationForm.controls['contract'].value;
      this.ShipmentRequest.ItemTypeDescription = this.batchInformationForm.controls['itemDescription'].value;
      this.ShipmentRequest.ProductNumber = this.batchInformationForm.controls['product'].value;
      this.ShipmentRequest.Mounting = this.batchInformationForm.controls['mounting'].value;
      this.ShipmentRequest.ItemID = this.batchInformationForm.controls['items'].value;
      this.ShipmentRequest.PackingListNumber = this.batchInformationForm.controls['packingList'].value;
      let shipdate = this.batchInformationForm.controls['shipDate'].value;
      let receiveDate = this.batchInformationForm.controls['receivedDate'].value;
      // const strDateRange = new Date(shipdate.date.month + '/' + shipdate.date.day + '/' + shipdate.date.year);
      this.ShipmentRequest.ShipDate = new Date(shipdate.date.month + '/' + shipdate.date.day + '/' + shipdate.date.year);
      this.ShipmentRequest.ReceivedDate = new Date(receiveDate.date.month + '/' + receiveDate.date.day + '/' + receiveDate.date.year);
      if (new Date(this.ShipmentRequest.ShipDate.toDateString()) > new Date(this.ShipmentRequest.ReceivedDate.toDateString())) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Received date should not be less than Ship date";
        this.msgTitle = '';
        return;
      }
      this.ShipmentRequest.Note = this.batchInformationForm.controls['note'].value;
      this.ShipmentRequest.Protocol = this.Protocol;
      this.ShipmentRequest.TagSupplierId = this.TagSupplierId;
      this.ShipmentRequest.VendorID = this.VendorId;
      this.ShipmentRequest.DescLength = this.descLength;
      this.ShipmentRequest.purchaseOrderName = this.PurchaseOrder;
      this.shipmentService.changeResponse(this.ShipmentRequest);
      this.shipmentService.batchDataFromService = this.ShipmentRequest;

      this.router.navigateByUrl("imc/shipment/receive-shipment-details");
    }
    else {

      this.validateAllFormFields(this.batchInformationForm);
    }
  }

  viewItems() {
    this.batchInformationForm.controls['purchaseOrder'].setValue(this.shipmentService.batchDataFromService.PurchaseOrderID);
    this.batchInformationForm.controls['purchaseOrderDate'].setValue(this.shipmentService.batchDataFromService.OrderDate);
    this.batchInformationForm.controls['vendorName'].setValue(this.shipmentService.batchDataFromService.CompanyName);
    this.batchInformationForm.controls['contract'].setValue(this.shipmentService.batchDataFromService.ContractNumber);
    this.batchInformationForm.controls['itemDescription'].setValue(this.shipmentService.batchDataFromService.ItemTypeDescription);
    this.batchInformationForm.controls['product'].setValue(this.shipmentService.batchDataFromService.ProductNumber);
    this.batchInformationForm.controls['mounting'].setValue(this.shipmentService.batchDataFromService.Mounting);

    this.batchInformationForm.controls['items'].setValue(this.shipmentService.batchDataFromService.ItemID);
    this.batchInformationForm.controls['packingList'].setValue(this.shipmentService.batchDataFromService.PackingListNumber);
    // this.batchInformationForm.controls['shipDate'].setValue(this.shipmentService.batchDataFromService.ShipDate);
    //  this.batchInformationForm.controls['receivedDate'].setValue(this.shipmentService.batchDataFromService.ReceivedDate);
    this.batchInformationForm.controls['note'].setValue(this.shipmentService.batchDataFromService.Note);
    this.descLength = this.shipmentService.batchDataFromService.DescLength;
    this.Protocol = this.shipmentService.batchDataFromService.Protocol;
    this.TagSupplierId = this.shipmentService.batchDataFromService.TagSupplierId;
    this.VendorId = this.shipmentService.batchDataFromService.VendorID;
    this.PurchaseOrder = this.shipmentService.batchDataFromService.purchaseOrderName;
    let shipedDate = this.shipmentService.batchDataFromService.ShipDate;
    let receivedDate = this.shipmentService.batchDataFromService.ReceivedDate;
    this.batchInformationForm.patchValue({
      shipDate: {
        date: {
          year: shipedDate.getFullYear(),
          month: shipedDate.getMonth() + 1,
          day: shipedDate.getDate()
        }
      }
    });

    this.batchInformationForm.patchValue({
      receivedDate: {
        date: {
          year: receivedDate.getFullYear(),
          month: receivedDate.getMonth() + 1,
          day: receivedDate.getDate()
        }
      }
    });
    let shipMinDt = new Date(this.shipmentService.batchDataFromService.OrderDate);
    this.myDatePickerOptions1 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: shipMinDt.getFullYear(), month: shipMinDt.getMonth() + 1, day: shipMinDt.getDate() - 1 },
      disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
    };


    this.myDatePickerOptions2 = {
      // other options...
      dateFormat: 'mm/dd/yyyy',
      disableUntil: { year: shipedDate.getFullYear(), month: shipedDate.getMonth() + 1, day: shipedDate.getDate() - 1 },
      disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
      inline: false,
      indicateInvalidDate: true,
      showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
    };
    console.log(this.batchInformationForm.value);
    let rootSelector=this;
    setTimeout(function(){
    rootSelector.materialscriptService.material();
    },0)
  }

  descEvent(event: any) {
    this.descLength = 128 - event.target.value.length
  }

  getPurchaseOrderByStatus(userevents) {
    this.shipmentService.purchaseOrderDropdownsData(userevents).subscribe(
      res => {
        this.purchaseResponse = res;
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      }, () => {
        if (this.shipmentService.batchDataFromService != undefined) {
          this.purchaseOrderName = this.shipmentService.batchDataFromService.PurchaseOrderID;
          this.getItemDetailsByOrderId();
        }
      });
  }

  // myDatePickerOptions = {
  //   todayBtnTxt: 'Today',
  //   dateFormat: 'yyyy-mm-dd',
  //   desableDays: [{ year: 2017, month: 8, day: 10 },{year: 2017, month: 9, day: 10}]
  // };

  getOrderDetailsBasedOnOrderNum(event: Event) {

    this.PurchaseOrder = event.target['options'][event.target['options'].selectedIndex].text;
    this.purchaseOrderName = event.target['options'][event.target['options'].selectedIndex].value;
    if (this.purchaseOrderName != "") {
      this.shipmentService.getOrderDetailsBasedOnPurchaseOrderNum(this.PurchaseOrder).subscribe(
        res => {
          this.shipmentResponse = res;
          this.orderDateResponse = res[0];
          this.TagSupplierId = this.orderDateResponse.TagSupplierId;
          this.VendorId = this.orderDateResponse.VendorId;
          let transformedOrderDate = this.customDateFormatPipe.transform(this.orderDateResponse.OrderDate.toString());
          this.shipMinDate = new Date(transformedOrderDate);
          this.shipMinDate.setDate(this.shipMinDate.getDate());
          this.batchInformationForm.controls["shipDate"].setValue("");
          this.batchInformationForm.controls["receivedDate"].setValue("");
          this.batchInformationForm.controls["shipDate"].enable();
          this.batchInformationForm.controls["receivedDate"].enable();
          this.myDatePickerOptions1 = {
            // other options...
            dateFormat: 'mm/dd/yyyy',
            disableUntil: { year: this.shipMinDate.getFullYear(), month: this.shipMinDate.getMonth() + 1, day: this.shipMinDate.getDate() - 1 },
            disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
            inline: false,
            indicateInvalidDate: true,
            showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
          };


          this.batchInformationForm.patchValue({
            purchaseOrderDate: transformedOrderDate,
            vendorName: this.orderDateResponse.CompanyName,
            contract: this.orderDateResponse.ContractNumber,
            items: this.getItemDetailsByOrderId(),
            itemDescription: "",
            product: "",
            mounting: "",

          });
          this.materialscriptService.material();
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          return;
        }
      );
    }
    else {
      this.batchInformationForm.reset();
      this.batchInformationForm.controls["purchaseOrder"].setValue("");
      this.batchInformationForm.controls["items"].setValue("");
      this.batchInformationForm.controls["shipDate"].disable();
      this.batchInformationForm.controls["receivedDate"].disable();
      this.shipmentResponse = null;
    }

  }





  //items Dropdown
  getItemDetailsByOrderId() {
    if (this.purchaseOrderName != "") {
      let PurchaseOrder = this.purchaseOrderName;
      this.shipmentService.getItemDetailsByOrderId(PurchaseOrder).subscribe(
        res => {
          this.shipmentResponse = res;
          this.itemDetails = res[0];
          this.itemId = this.itemDetails.ItemID;
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          return;
        }
      );
    }
    else {
      this.batchInformationForm.controls["items"].setValue("");
      this.getMountingByItemId(event);
    }
  }

  getMountingByItemId(event) {
    let itemId = this.itemId;
    let itemIdValue = event.target['options'][event.target['options'].selectedIndex].value;
    if (itemIdValue != "") {
      this.shipmentService.getMountingByItemId(itemId).subscribe(
        res => {
          this.shipmentMountingResponse = res;
          this.itemsRes = res[0];
          this.Protocol = this.itemsRes.Protocol;
          this.batchInformationForm.patchValue({
            itemDescription: this.itemsRes.ItemTypeDescription,
            product: this.itemsRes.ItemID,
            mounting: this.itemsRes.Mounting,
          });
          this.materialscriptService.material();
        }, (err) => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          return;
        }
      );
    }
    else {
      this.batchInformationForm.patchValue({
        itemDescription: "",
        product: "",
        mounting: "",
      });
    }



  }

  receiveShipDate() {
    this.receiveMinDate = this.batchInformationForm.controls['shipDate'].value;
    if (this.receiveMinDate) {
      this.myDatePickerOptions2 = {
        // other options...
        dateFormat: 'mm/dd/yyyy',
        disableUntil: { year: this.receiveMinDate.date.year, month: this.receiveMinDate.date.month, day: this.receiveMinDate.date.day - 1 },
        disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
        inline: false,
        indicateInvalidDate: true,
        showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
      };
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
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
    this.userEventRequest.FeatureName = Features[Features.SHIPMENT];
    this.userEventRequest.SubFeatureName = SubFeatures[SubFeatures.BATCHINFORMATION];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  onDateChanged1(event: IMyInputFieldChanged) {
    let date = this.batchInformationForm.controls["shipDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalid = true;
      return;
    }
    else {
      this.invalid = false;
      this.receiveShipDate();
    }
  }
  onDateChanged2(event: IMyInputFieldChanged) {
    let date = this.batchInformationForm.controls["receivedDate"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}