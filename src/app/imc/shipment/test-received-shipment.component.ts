import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ShipmentService } from './services/shipment.service';
import { CommonService } from "../../shared/services/common.service";
import { Router } from '@angular/router';
import { IShipmentDetailsrequest } from "./models/shipmentdetailsrequest";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { TagReaderStatus, PurchaseOrderStatus, ShipmentStatus } from "../constants";
import { IInventoryItemRequest } from "./models/inventoryitemsrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, SubFeatures, defaultCulture } from "../../shared/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-test-received-shipment',
  templateUrl: './test-received-shipment.component.html',
  styleUrls: ['./test-received-shipment.component.scss']
})
export class TestReceivedShipmentComponent implements OnInit {
  receiveDisableButton: boolean;
  statusDefective: number;
  statusDamaged: number;
  statusGood: number;
  statusIgnore: number;
  serialNumbersList: any[];
  sessionContextResponse: IUserresponse;
  objShipmentDetails: IShipmentDetailsrequest;
  userEvents = <IUserEvents>{};
  tagReaderStatus: any;
  isTagAgency: any;
  selectedAll4: any;
  selectedAll3: any;
  selectedAll2: any;
  selectedAll1: any;
  status: string;
  searchItemInformationForm: FormGroup;
  checkBoxArray: any[] = [];
  serialNumbers = [];
  selctedSerialNumber = [];
  receiveShipmentButton: boolean = false;
  selectedShipmentSerialNumbers = [];

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  constructor(private router: Router,
    private testRecievedService: ShipmentService,
    private common: CommonService, private myElement: ElementRef,
    private sessionContext: SessionService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.searchItemInformationForm = new FormGroup({
      'serialNumber': new FormControl('', []),
    });
    this.testRecievedService.currentContext.subscribe(response => {
      this.objShipmentDetails = response;
    });
    this.getUserEvents();
    this.getApplicationParameterValue(this.userEvents);
    this.gettagReaderStatusValues(TagReaderStatus);
    if (this.testRecievedService.rangeSerialNum.length > 0)
      this.serialNumbers = this.testRecievedService.rangeSerialNum;
    else if (this.testRecievedService.receivedQty.length > 0)
      this.serialNumbers = this.testRecievedService.receivedQty;
    this.serialNumbersList = this.serialNumbers;
    this.initlizeData();
    this.receiveDisableButton = !this.common.isAllowed(Features[Features.SHIPMENT], Actions[Actions.RECEIVE], "");
  }

  _keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
  //search Button Click
  searchItemInformation() {
    let serNumber = this.searchItemInformationForm.controls['serialNumber'].value;
    let status = false;
    if (serNumber != "" && serNumber != null) {
      for (var num = 0; num < this.selctedSerialNumber.length; num++) {
        if (this.selctedSerialNumber[num].SerialNumber == serNumber) {
          this.onSelectionChange(this.selctedSerialNumber[num], 'GOOD')
          status = true;
        }
      }
      if (!status) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Invalid Serial #";
        this.msgTitle = '';

        return;
      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = " Specify the Serial #";
      this.msgTitle = '';

      return;
    }
  }
  resetSearchForm() {

    this.searchItemInformationForm.controls['serialNumber'].setValue("");
  }


  //get config values
  gettagReaderStatusValues(TagReaderStatus) {
    this.testRecievedService.getConfigKeyValue(TagReaderStatus)
      .subscribe(res => {
        this.tagReaderStatus = res;
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      })
  }

  getApplicationParameterValue(userEvents) { // res 1
    this.common.getApplicationParameterValue(ApplicationParameterkey.IsTagByAgency, userEvents).subscribe(
      res => {
        this.isTagAgency = res
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }



  checkBoxChange(event, serialNumber) {
    let obj = {};
    obj['serialNUmber'] = serialNumber;
    obj['status'] = 'All';
    if (event.target.checked)
      this.checkBoxArray.push(obj);
    else {
      for (var j = 0; j < this.checkBoxArray.length; j++) {
        if (this.checkBoxArray[j].serialNUmber == serialNumber)
          this.checkBoxArray.splice(j, 1);
      }
    }
  }




  initlizeData() {
    for (let item = 0; item < this.serialNumbers.length; item++) {
      let selectedSerialNumbers = {
        "SerialNumber": "",
        "ItemStatus": '',
        "isChecked": ""
      }
      selectedSerialNumbers.SerialNumber = this.serialNumbers[item];
      selectedSerialNumbers.ItemStatus = "";
      selectedSerialNumbers.isChecked = "false";
      this.selctedSerialNumber.push(selectedSerialNumbers);

    }

  }
  backToReceiveShipment() {
    this.router.navigateByUrl('imc/shipment/receive-shipment-details');
  }

  onSelectionChange(serialnumber, status) {
    let found = false;
    this.selctedSerialNumber.forEach(function (item) {
      if (item.SerialNumber == serialnumber.SerialNumber) {
        item.isChecked = true;
        item.ItemStatus = status;
        $('input.chk').prop('checked', false);
      }
      if (item.isChecked == '' || item.isChecked == false) {
        found = false;
      }
    });

    let count = 0;
    this.statusGood = 0;
    this.statusDamaged = 0;
    this.statusDefective = 0;
    this.statusIgnore = 0;
    for (var num = 0; num < this.selctedSerialNumber.length; num++) {
      if (this.selctedSerialNumber[num].isChecked == true) {
        count++;
      }
      if (this.selctedSerialNumber[num].ItemStatus == 'GOOD')
        this.statusGood++;
      if (this.selctedSerialNumber[num].ItemStatus == 'DEFECTIVE')
        this.statusDefective++;
      if (this.selctedSerialNumber[num].ItemStatus == 'DAMAGED')
        this.statusDamaged++;
      if (this.selctedSerialNumber[num].ItemStatus == 'IGNORE')
        this.statusIgnore++;
    }
    if (this.statusGood == this.selctedSerialNumber.length)
      this.status = 'GOOD';
    if (this.statusDamaged == this.selctedSerialNumber.length)
      this.status = 'DAMAGED';
    if (this.statusDefective == this.selctedSerialNumber.length)
      this.status = 'DEFECTIVE';
    if (this.statusIgnore == this.selctedSerialNumber.length)
      this.status = 'IGNORE';

    if (count == this.selctedSerialNumber.length)
      this.receiveShipmentButton = true;
    else
      this.receiveShipmentButton = false;
  }
  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};
    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }
    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  selectAll(status, event, checboxName) {
    $('input.chk').on('change', function () {
      $('input.chk').not(this).prop('checked', false);
    });
    if (event.target.checked == true) {
      this.selctedSerialNumber.forEach(function (item) {
        item.ItemStatus = status;
        item.isChecked = true;
      });
      if (status == 'GOOD') {
        this.status = 'GOOD';
        this.statusGood = this.selctedSerialNumber.length;
        this.statusDamaged = 0;
        this.statusDefective = 0;
        this.statusIgnore = 0;
      }
      if (status == 'DEFECTIVE') {
        this.status = 'DEFECTIVE';
        this.statusDefective = this.selctedSerialNumber.length;
        this.statusGood = 0;
        this.statusDamaged = 0;
        this.statusIgnore = 0;
      }
      if (status == 'DAMAGED') {
        this.status = 'DAMAGED';
        this.statusDamaged = this.selctedSerialNumber.length;
        this.statusGood = 0;
        this.statusDefective = 0;
        this.statusIgnore = 0;
      }
      if (status == 'IGNORE') {
        this.status = 'IGNORE';
        this.statusIgnore = this.selctedSerialNumber.length;
        this.statusGood = 0;
        this.statusDamaged = 0;
        this.statusDefective = 0;
      }

      this.receiveShipmentButton = true;
    } else {
      this.selctedSerialNumber.forEach(function (item) {
        item.ItemStatus = "";
        item.isChecked = false;
      });
      this.statusGood = 0;
      this.statusDamaged = 0;
      this.statusDefective = 0;
      this.statusIgnore = 0;
      this.receiveShipmentButton = false;
    }
  }
  insertShipmentDetails() {
    if (this.statusIgnore != this.selctedSerialNumber.length) {
      let shipmentDetails: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
      let inventoryItem: IInventoryItemRequest = <IInventoryItemRequest>{};
      inventoryItem.ItemCode = this.testRecievedService.purchaseOrderDetails[0].ItemCode;
      inventoryItem.InvStatusDate = new Date();
      inventoryItem.ManufactureDate = new Date();
      inventoryItem.CreatedUser = this.sessionContextResponse.userName;
      let warrantyStartDate = this.objShipmentDetails.ShipDate;
      inventoryItem.WarrantyStartDate = new Date(warrantyStartDate.getFullYear(), warrantyStartDate.getMonth(), warrantyStartDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");//this.objShipmentDetails.ShipDate;
      let warrantyEndDate = (this.objShipmentDetails.ShipDate);
      let months = this.testRecievedService.purchaseOrderDetails[0].WarrantyInMonths;
      inventoryItem.WarrantyEndDate = new Date(warrantyEndDate.getFullYear(), warrantyEndDate.getMonth() + months, warrantyEndDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");//new Date(this.objShipmentDetails.ShipDate);
      // inventoryItem.WarrantyEndDate.setMonth(inventoryItem.WarrantyEndDate.getMonth() + this.testRecievedService.purchaseOrderDetails[0].WarrantyInMonths);
      inventoryItem.ItemType = this.objShipmentDetails.Mounting;
      shipmentDetails.InventoryItem = inventoryItem;
      shipmentDetails.User = this.sessionContextResponse.userName;
      shipmentDetails.UserId = this.sessionContextResponse.userId;
      shipmentDetails.LoginId = this.sessionContextResponse.loginId;
      let recievedDate = this.testRecievedService.batchDataFromService.ReceivedDate;
      shipmentDetails.ReceivedDate = new Date(recievedDate.getFullYear(), recievedDate.getMonth(), recievedDate.getDate(), 0, 0, 0, 0); //this.testRecievedService.batchDataFromService.ReceivedDate;
      shipmentDetails.PurchaseOrderID = this.testRecievedService.batchDataFromService.PurchaseOrderID;
      shipmentDetails.VendorID = this.testRecievedService.batchDataFromService.VendorID;
      shipmentDetails.OrderDate = this.testRecievedService.batchDataFromService.OrderDate;
      let shipdate = this.testRecievedService.batchDataFromService.ShipDate;
      shipmentDetails.ShipDate = shipdate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
      shipmentDetails.ProductNumber = this.testRecievedService.batchDataFromService.ProductNumber;
      shipmentDetails.Note = this.testRecievedService.batchDataFromService.Note;
      shipmentDetails.ReceivedEmployeeId = this.sessionContextResponse.userId;
      shipmentDetails.ItemID = this.testRecievedService.batchDataFromService.ItemID;
      shipmentDetails.PartDescription = this.testRecievedService.batchDataFromService.ItemTypeDescription;
      shipmentDetails.CreatedUser = this.sessionContextResponse.userName;
      shipmentDetails.Mounting = this.testRecievedService.batchDataFromService.Mounting;
      shipmentDetails.PackingListNumber = this.testRecievedService.batchDataFromService.Item;
      shipmentDetails.TagSupplierId = this.testRecievedService.batchDataFromService.TagSupplierId;
      shipmentDetails.Protocol = this.testRecievedService.batchDataFromService.Protocol;
      shipmentDetails.ActivitySource = ActivitySource[ActivitySource.Internal];
      shipmentDetails.ItemInventoryBatchDetails = this.testRecievedService.shipmentDetails().ItemInventoryBatchDetails;
      shipmentDetails.ShipmentStatus = this.testRecievedService.shipmentDetails().ShipmentStatus;
      shipmentDetails.WarrantyEndDate = inventoryItem.WarrantyEndDate;
      shipmentDetails.WarrantyStartDate = inventoryItem.WarrantyStartDate;
      if (this.testRecievedService.shipmentDetails().ShipmentStatus == "ShippedFull")
        shipmentDetails.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.ReceivedFull];
      else
        shipmentDetails.PurchaseOrderStatus = PurchaseOrderStatus[PurchaseOrderStatus.ReceivedPartial];
      this.getUserEvents();
      this.userEvents.ActionName = Actions[Actions.RECEIVE];
      $('#pageloader').modal('show');
      this.testRecievedService.insertShipmentDetails(this.selctedSerialNumber, shipmentDetails, this.userEvents)
        .subscribe(res => {
          $('#pageloader').modal('hide');
          if (res) {
            this.testRecievedService.receivedQty = [];
            this.testRecievedService.rangeSerialNum = [];
            this.testRecievedService.batchDataFromService = [];
            this.testRecievedService.shipmentContext = null;
            this.testRecievedService.dataFromService = "";
            this.testRecievedService.purchaseOrderDetails = "";
            this.testRecievedService.viewItemsFromService = "";
            this.testRecievedService.saveShipmentDetails(<IShipmentDetailsrequest>{});
            this.router.navigate(["imc/shipment/shipment-search", "Created"]);
          }
        },
        (err) => {
          $('#pageloader').modal('hide');
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
        });
    }
    else {
      this.testRecievedService.receivedQty = [];
      this.testRecievedService.rangeSerialNum = [];
      this.testRecievedService.batchDataFromService = [];
      this.testRecievedService.shipmentContext = null;
      this.testRecievedService.dataFromService = "";
      this.testRecievedService.purchaseOrderDetails = "";
      this.testRecievedService.viewItemsFromService = "";
      this.testRecievedService.saveShipmentDetails(<IShipmentDetailsrequest>{});
      this.router.navigate(["imc/shipment/shipment-search", "Ignored"]);
    }
  }

  cancelShipmentDetails() {
    this.testRecievedService.receivedQty = [];
    this.testRecievedService.rangeSerialNum = [];
    this.testRecievedService.batchDataFromService = [];
    this.testRecievedService.shipmentContext = null;
    this.testRecievedService.dataFromService = "";
    this.testRecievedService.purchaseOrderDetails = "";
    this.testRecievedService.viewItemsFromService = "";
    this.testRecievedService.saveShipmentDetails(<IShipmentDetailsrequest>{});
    this.router.navigate(["imc/shipment/shipment-search"]);
  }
  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.SHIPMENT];
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.SubFeatureName = SubFeatures[SubFeatures.ITEMINFORMATION]
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

}