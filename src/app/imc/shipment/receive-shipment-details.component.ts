import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ShipmentService } from './services/shipment.service';
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { IShipmentDetailsResponse } from './models/shipmentdetailsresponse';
import { IShipmentSearchRequest } from "./models/shipmentsearchrequest";
import { Router } from "@angular/router";
import { IShipmentDetailsrequest } from "./models/shipmentdetailsrequest";
import { POAndShipmentMAxValue } from "../constants";
import { applicationParam } from "../constants";
import { tagSupplierID, ShipmentStatus } from "../constants";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IItemBatchRequest } from "./models/itembatchrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions, SubFeatures } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-receive-shipment-details',
  templateUrl: './receive-shipment-details.component.html',
  styleUrls: ['./receive-shipment-details.component.scss']
})
export class ReceiveShipmentDetailsComponent implements OnInit {
  viewDisableButton: boolean;
  userEvents = <IUserEvents>{};
  alertType: boolean;
  sessionContextResponse: IUserresponse;
  serialNumberitem = "";
  isChecked: boolean;
  nextStep: boolean;
  expectedCount: number;
  quantityValue: any;
  isTagAgency: any;
  availableSerialNumbers: any;
  checkSerialNumberAvalable: any;
  endRangeCalcValue: any;
  itemFacilityCodeRanage: any;
  configValue: any;
  receivedGridItems: any;
  receivedAgencyCodes: any;
  tagTypeArray: any[];
  matchedValue: any;
  batchInformation: any[];
  tagType: any;
  receiveShipmentForm: FormGroup;
  validatePattern = "^(0|[1-9][0-9]*)$";
  validatePatternRange = "^\s*-?[0-9]{1,11}\s*$";
  shipmentTagDetails: any = [
    { agencyName: 'Home Agencies' }
  ]
  selectedEntry: { [key: string]: any } = {
    value: null,
    description: null
  };
  endRange: number;
  itemInformation = [];
  serial = true;
  range = false;
  commonRequest: ICommonResponse = <ICommonResponse>{};
  objCommonTagTypesResponse: ICommonResponse[];
  objShipmentSearchRequest: IShipmentSearchRequest;
  ObjIShipmentDetailsResponse: any = <IShipmentDetailsResponse>{};
  shipmentContext: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
  startRangeFacilty: any;
  seriesDiv: boolean;
  rangeDiv: boolean;
  serialNumbersList = [];

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  constructor(
    private receiveShipmentDetailsService: ShipmentService,
    private common: CommonService,
    private router: Router,
    private sessionContext: SessionService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.receiveShipmentForm = new FormGroup({
      'tagType': new FormControl(''),
      'agencies': new FormControl(''),
      'serialNumber': new FormControl(''),
      'serialNumbersList': new FormControl(''),
      'startRange': new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(11)])),
      'quantity': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(6)])),
      'endRange': new FormControl(''),
      'serial': new FormControl('')
    });

    this.receiveShipmentDetailsService.currentContext.subscribe(response => {
      this.shipmentContext = response;
      this.getPOItemsByOrderNumber(this.shipmentContext.purchaseOrderName, this.shipmentContext.ItemID);
      this.getTagTypes();
      if (this.shipmentContext.Protocol == "EZPASS-TDM") {
        this.getAgencyCodes(this.shipmentContext.Protocol);

      }
    });
    this.getConfigValues(POAndShipmentMAxValue);

    let rangeSerialNum = this.receiveShipmentDetailsService.rangeSerialNum;
    let serialNumbersList = this.receiveShipmentDetailsService.receivedQty;
    let SessionDetails = this.receiveShipmentDetailsService.shipmentDetails();
    if (rangeSerialNum.length > 0) {
      let lstReceivedSerialNumber = [];
      lstReceivedSerialNumber = rangeSerialNum;
      if (lstReceivedSerialNumber.length > 0) {
        if (SessionDetails != null) {
          this.receiveShipmentForm.controls["startRange"].setValue(SessionDetails.ItemInventoryBatchDetails.BegSerialNum);
          this.receiveShipmentForm.controls["endRange"].setValue(SessionDetails.ItemInventoryBatchDetails.EndSerialNum);
          this.receiveShipmentForm.controls["quantity"].setValue(SessionDetails.ItemQuantity.toString());
          this.divTypeChange("Range");
          this.quantityValue = SessionDetails.ItemQuantity.toString();
          this.getApplicationParameterValue(null);
        }
      }
      let rootSelector = this;
      setTimeout(function () {
        rootSelector.materialscriptService.material();
      }, 0);
    }
    else if (serialNumbersList != null) {
      this.serialNumbersList = serialNumbersList;
      this.divTypeChange("Series");
      this.quantityValue = serialNumbersList.length;
      this.getApplicationParameterValue(null);
    }
    else {
      this.getUserEvents();
      this.getApplicationParameterValue(this.userEvents);
      this.viewDisableButton = !this.common.isAllowed(Features[Features.SHIPMENT], Actions[Actions.VIEW], "");
      this.divTypeChange("Series");
    }

  }
  _keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && !(event.which === 8)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }
  divTypeChange(val) {
    if (val == "Series") {
      this.seriesDiv = true;
      this.rangeDiv = false;
      this.receiveShipmentForm.reset();
      this.receiveShipmentForm.patchValue({
        tagType: this.shipmentContext.Protocol
      });
      if (this.shipmentContext.Protocol == "EZPASS-TDM") {
        this.getAgencyCodes(this.shipmentContext.Protocol);

      }
      this.receiveShipmentDetailsService.rangeSerialNum = [];
      this.receiveShipmentForm.controls["quantity"].setValue('');
      this.quantityValue = "";

      this.receiveShipmentForm.controls["serialNumbersList"].setValidators(Validators.required);
      this.receiveShipmentForm.controls["serialNumbersList"].updateValueAndValidity();
    }
    else if (val == "Range") {
      this.isChecked = true;
      this.seriesDiv = false;
      this.rangeDiv = true;
      this.receiveShipmentForm.reset();
      this.receiveShipmentForm.patchValue({
        tagType: this.shipmentContext.Protocol
      });
      if (this.shipmentContext.Protocol == "EZPASS-TDM") {
        this.getAgencyCodes(this.shipmentContext.Protocol);

      }
      this.receiveShipmentForm.controls["quantity"].setValue('');
      this.receiveShipmentForm.controls.serialNumbersList.clearValidators();
      this.receiveShipmentDetailsService.receivedQty = [];
      this.serialNumbersList = [];
      this.quantityValue = "";
      this.serialNumberitem = "";
      let rangeSerialNum = this.receiveShipmentDetailsService.rangeSerialNum;
      let SessionDetails = this.receiveShipmentDetailsService.shipmentDetails();
      if (rangeSerialNum.length > 0) {
        if (SessionDetails != null) {
          this.receiveShipmentForm.controls["startRange"].setValue(SessionDetails.ItemInventoryBatchDetails.BegSerialNum);
          this.receiveShipmentForm.controls["endRange"].setValue(SessionDetails.ItemInventoryBatchDetails.EndSerialNum);
          this.receiveShipmentForm.controls["quantity"].setValue(SessionDetails.ItemQuantity.toString());
        }
      }

    }
  }

  getTagTypes() {
    this.receiveShipmentDetailsService.getTagtypes().subscribe(
      res => {
        this.tagType = res;
        this.receiveShipmentForm.patchValue({
          tagType: this.shipmentContext.Protocol
        });
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  // set AgencyCodes ==> and get Agency dropdown values
  getAgencyCodes(matchedValue) {
    this.receiveShipmentDetailsService.getAgencyByProtocolType(matchedValue).subscribe(
      res => {
        this.receivedAgencyCodes = res
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  //to bind the grid and need to pass some details fronm prevois page
  getPOItemsByOrderNumber(purchaseOrderName, ItemID) {
    this.receiveShipmentDetailsService.getPOItemsByOrderNumber(purchaseOrderName, ItemID).subscribe(
      res => {
        this.receivedGridItems = res;
        this.receiveShipmentDetailsService.purchaseOrderDetails = this.receivedGridItems;
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  //get config values
  getConfigValues(POAndShipmentMAxValue) {
    this.receiveShipmentDetailsService.getConfigKeyValue(POAndShipmentMAxValue)
      .subscribe(res => {
        this.configValue = res
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  // application paramers values
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

  // Check range ******************
  checkStartRange(event) { // event is start range
    let startRange = this.receiveShipmentForm.controls['startRange'].value;
    this.receiveShipmentForm.controls['endRange'].setValue("");
    this.quantityValue = "";
    if (startRange != "") {
      if (this.isTagAgency == 0) {
        this.checkSerialNumber(event, this.isTagAgency);
      }
      else {
        if (this.shipmentContext.Protocol == '6C' || this.shipmentContext.Protocol == 'Title 21') {
          if (event.length == 10) {
            this.checkSerialNumber(event, this.isTagAgency);
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Start Range length should be 10 digits"
            this.msgTitle = '';

            return;
          }
        }
        else if (this.shipmentContext.Protocol == 'EZPASS-TDM') {
          if (event.length == 11) {
            this.checkSerialNumber(event, this.isTagAgency);
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Start Range length should be 11 digits for EZPass between 06400000001 – 06416777215"
            this.msgTitle = '';
            return;
          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Please select a Tag Type to process."
          this.msgTitle = '';

          return;
        }


      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Invalid Start Range";
      this.msgTitle = '';

      return;
    }
  }


  setEndRange(quantity) {
    this.materialscriptService.material();
    let startRange = this.receiveShipmentForm.controls['startRange'].value;
    if (startRange != "" && quantity != "") {
      this.receiveShipmentForm.controls['endRange'].setValue("");
      let a = this;
      setTimeout(function () {
        a.materialscriptService.material();
      }, 100);
      this.quantityValue = 0;
      if (parseInt(quantity) > (this.receivedGridItems[0].ItemQuantity + this.receivedGridItems[0].ReceivedQty)) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Received Quantity should not be more than  " + (this.receivedGridItems[0].ItemQuantity - this.receivedGridItems[0].ReceivedQty);
        this.msgTitle = '';
        return;
      }
      if (this.isTagAgency == 1) {
        this.endRangeCalcuation(this.receiveShipmentForm.controls['startRange'].value, this.receiveShipmentForm.controls['tagType'].value, quantity);
      }
      else if (this.isTagAgency == 0) {
        this.receiveShipmentForm.controls['endRange']
          .setValue(parseInt(this.receiveShipmentForm.controls['startRange'].value) + parseInt(quantity) - 1);
        let endRangevalue = this.receiveShipmentForm.controls['endRange'].value.toString();
        if (this.shipmentContext.Protocol == 'EZPASS-TDM') {
          let endRange = endRangevalue.padStart(11, "0");
          this.receiveShipmentForm.controls['endRange'].setValue(endRangevalue);
        }
        else if (this.shipmentContext.Protocol == '6C' || this.shipmentContext.Protocol == 'Title 21') {
          let endRange = endRangevalue.padStart(10, "0");
          this.receiveShipmentForm.controls['endRange'].setValue(endRangevalue);
        }
        this.getAvailableSerialNumbersList(this.receiveShipmentForm.controls['startRange'].value, this.receiveShipmentForm.controls['endRange'].value);
      }
    }

    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "select start range";
      this.msgTitle = '';

      return;
    }

  }



  // Check serial number
  checkSerialNumber(event, istagAgency) {
    let startRange = this.receiveShipmentForm.controls['startRange'].value;
    let endRange = this.receiveShipmentForm.controls['endRange'].value;
    let TagSupplierId = this.shipmentContext.TagSupplierId;
    if (istagAgency == 0) {
      this.receiveShipmentDetailsService.checkSerialNumber(event, this.isTagAgency, TagSupplierId)
        .subscribe(res => {
          if (res == true) {
            let quantity = this.receiveShipmentForm.controls['quantity'].value;
            if (quantity != '' && quantity != 0 && quantity > 0) {
              this.setEndRange(quantity);
            }
            else if (this.receiveShipmentForm.controls['quantity'].touched) {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Specify Quantity";
              this.msgTitle = '';

              return;
            }
          }
          else if (res == false) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Start Range";
            this.msgTitle = '';

            return;
          }
        },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
        });
    }
    else {
      this.validateSerialNumber(event, "STARTRANGE");
    }

  }


  getAvailableSerialNumbersList(startRange, endRange) {
    let lstReceivedSerialNumber = [];
    let lstExistedSerialNumber = [];
    let quantityValue = this.receiveShipmentForm.controls['quantity'].value;
    let quantity = (quantityValue != "") ? parseInt(quantityValue) : 0;
    let tagType = this.receiveShipmentForm.controls['tagType'].value;
    this.receiveShipmentDetailsService.getAvailableSerialNumbersList(startRange, endRange)
      .subscribe(res => {
        this.availableSerialNumbers = res;
        let strserialnumberslist;
        if (res != null && res != "")
          strserialnumberslist = this.availableSerialNumbers.split(',')
        else
          strserialnumberslist = "";
        for (var serialNum = startRange; serialNum <= endRange;) {
          if (tagType == "6C" || tagType == "Title 21") {
            if (!strserialnumberslist.includes(serialNum.toString()))
              lstReceivedSerialNumber.push(serialNum.toString());
            else
              lstExistedSerialNumber.push(serialNum.toString());
          }
          else if (tagType == "EZPASS-TDM") {
            let tempSerialNumber = serialNum.toString();
            let serialNumber = tempSerialNumber.padStart(11, "0");
            serialNum = serialNumber;
            if (!strserialnumberslist.includes(serialNum.toString("00000000000")))
              lstReceivedSerialNumber.push(serialNum.toString("00000000000"));
            else
              lstExistedSerialNumber.push(serialNum.toString("00000000000"));
          }
          if (this.isTagAgency == 0)
            serialNum = parseInt(serialNum) + 1;
          else {
            serialNum = serialNum.toString();
            if (tagType == "6C" || tagType == "Title 21") {
              serialNum = parseInt(this.calculateStartRange(serialNum.padStart(10, "0")));
            }
            else if (tagType == "EZPASS-TDM") {
              serialNum = parseInt(this.calculateStartRangeForEZPass(serialNum.padStart(11, "0")));
            }
          }
        }

        if (lstReceivedSerialNumber != null && lstReceivedSerialNumber.length > parseInt(this.configValue)) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "max shipment quantity  " + this.configValue;
          this.msgTitle = '';

          return;
        }
        if (lstExistedSerialNumber != null && lstExistedSerialNumber.length > 0) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "The following Serial number's are already available  " + this.availableSerialNumbers;
          this.msgTitle = '';

        }
        let litReceivedQuantity = this.receivedGridItems[0].ReceivedQty;
        let lititemquantity = this.receivedGridItems[0].ItemQuantity;
        let RecievedQuantity = lstReceivedSerialNumber.length;
        if ((RecievedQuantity + litReceivedQuantity) > lititemquantity) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Received Quantity should not be more than " + (lititemquantity - litReceivedQuantity);
          this.msgTitle = '';

          return;
        }
        this.quantityValue = RecievedQuantity;
        this.expectedCount = parseInt(lititemquantity) - parseInt(litReceivedQuantity);

        let shipmentDetails: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
        let itemBatchRequest: IItemBatchRequest = <IItemBatchRequest>{};
        itemBatchRequest.ActualCount = shipmentDetails.BatchCount = parseInt(this.quantityValue);
        itemBatchRequest.BatchDate = new Date();
        itemBatchRequest.BegSerialNum = lstReceivedSerialNumber.length > 0 ? lstReceivedSerialNumber[0] : "";
        itemBatchRequest.EndSerialNum = lstReceivedSerialNumber.length > 0 ? lstReceivedSerialNumber[lstReceivedSerialNumber.length - 1] : "";
        itemBatchRequest.CreatedUser = this.sessionContextResponse.userName;
        itemBatchRequest.ExpectedCount = this.expectedCount;
        itemBatchRequest.BatchType = "NEW";
        shipmentDetails.ItemInventoryBatchDetails = itemBatchRequest;
        if (shipmentDetails.ItemInventoryBatchDetails.ExpectedCount == shipmentDetails.ItemInventoryBatchDetails.ActualCount)
          shipmentDetails.ShipmentStatus = ShipmentStatus[ShipmentStatus.ShippedFull];
        else
          shipmentDetails.ShipmentStatus = ShipmentStatus[ShipmentStatus.ShipPartial];
        shipmentDetails.ItemQuantity = lstReceivedSerialNumber.length;
        this.receiveShipmentDetailsService.saveShipmentDetails(shipmentDetails);
        this.receiveShipmentDetailsService.rangeSerialNum = lstReceivedSerialNumber.length > 0 ? lstReceivedSerialNumber : null;

      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  validateSerialNumber(event, type): boolean {
    let boolIsValid = false;
    let agencyCode: any;
    let SerailNum;
    let startRangeTagId;
    let endRangeFacilty;
    let tagType = this.receiveShipmentForm.controls['tagType'].value;
    if (tagType == 'EZPASS-TDM') {
      SerailNum = (event).padStart(11, "0")
      startRangeTagId = parseInt(SerailNum.substr(3, 8));
      this.startRangeFacilty = SerailNum.substr(0, 3);
      agencyCode = this.startRangeFacilty.padStart(3, "0");
    }
    else if (tagType == "6C" || tagType == "Title 21") {
      SerailNum = (event).padStart(10, "0");
      startRangeTagId = parseInt(SerailNum.substr(6, 4));
      this.startRangeFacilty = parseInt(SerailNum.substr(0, 6));
      agencyCode = "";
    }

    this.receiveShipmentDetailsService.getItemFacilityCodeRanagesBacedOnAgencies(agencyCode)
      .subscribe(res => {
        this.itemFacilityCodeRanage = res
        if (tagType == "6C" || tagType == "Title 21") {
          if (startRangeTagId > 1023) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Start Range";
            this.msgTitle = '';

            return;
          }
        }
        else if (tagType == 'EZPASS-TDM') {
          if (startRangeTagId > 16777215) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Start Range";
            this.msgTitle = '';

            return;
          }
        }
        if (this.itemFacilityCodeRanage && this.itemFacilityCodeRanage != null) {
          if (this.startRangeFacilty >= this.itemFacilityCodeRanage[0].StartFacilityCode && this.startRangeFacilty <= this.itemFacilityCodeRanage[0].EndFacilityCode) {
            endRangeFacilty = this.itemFacilityCodeRanage[0].EndFacilityCode;
            boolIsValid = true;
            if (this.seriesDiv) {
              this.checkSerialNumberAvilability(event);
            }
            else if (!this.nextStep) {
              let quantity = this.receiveShipmentForm.controls['quantity'].value;
              if (type == "ENDRANGE") {
                let startRange = this.receiveShipmentForm.controls['startRange'].value;
                this.getAvailableSerialNumbersList(startRange, this.endRangeCalcValue);
              }
              else if (quantity != "") {
                this.setEndRange(quantity);
              }
            }
            else
              this.navigateToNextStep();
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Invalid Start Range";
            this.msgTitle = '';

            return;
          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Invalid agency code";
          this.msgTitle = '';

          return false;
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
    return boolIsValid;
  }

  // to get the end range
  endRangeCalcuation(startRange, tagType, quantity) {
    let endRange;
    this.receiveShipmentDetailsService.endRangeCalcuation(startRange, tagType, quantity)
      .subscribe(res => {
        if (res) {
          this.endRangeCalcValue = res;
          this.receiveShipmentForm.controls["endRange"].
            setValue(res);
          this.validateSerialNumber(this.endRangeCalcValue, "ENDRANGE");
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }


  checkSerialNumberAvilability(startRange) {
    this.receiveShipmentDetailsService.checkSerialNumberAvilability(startRange)
      .subscribe(res => {
        this.checkSerialNumberAvalable = res
        if (!res) {
          let litReceivedQuantity = this.receivedGridItems[0].ReceivedQty;
          let lititemquantity = this.receivedGridItems[0].ItemQuantity;
          let RecievedQuantity = this.quantityValue;
          if (this.serialNumbersList.length > this.configValue) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Received Quantity should not be more than " + this.configValue;
            this.msgTitle = '';

            return;
          }
          if (this.serialNumbersList.length == (lititemquantity + litReceivedQuantity)) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Received Quantity should not be more than " + (lititemquantity + litReceivedQuantity);
            this.msgTitle = '';

            return;
          }
          else {
            if (!this.serialNumbersList.includes(startRange)) {
              this.serialNumbersList.push(startRange);
              this.receiveShipmentForm.controls['serialNumber'].setValue("");
              this.quantityValue = this.serialNumbersList.length;
            }
            else {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Serial # already exists in the List";
              this.msgTitle = '';

              return;
            }
          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Serial # already exists ";
          this.msgTitle = '';

          return;
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
      });
  }

  calculateStartRange(SerailNum) {
    let tagid = SerailNum.substr(6, 4);
    let facillitycode = SerailNum.substr(0, 6);
    let facilityCode = parseInt(facillitycode);
    let tagId = parseInt(tagid);
    tagId++;
    tagid = tagId.toString();
    if (tagId > 1023) {
      tagid = "0000";
      facilityCode++;
      facillitycode = facilityCode.toString();
    }
    return (facillitycode.toString() + tagid.padStart(4, "0"));
  }

  calculateStartRangeForEZPass(SerailNum) {
    let tagid = SerailNum.substr(3, 8);
    let facillitycode = SerailNum.substr(0, 3);
    let facilityCode = parseInt(facillitycode);
    let tagId = parseInt(tagid);
    tagId++;
    tagid = tagId.toString();
    if (tagId > 16777215) {
      tagid = "00000000";
      facilityCode++;
      facillitycode = facilityCode.toString();
    }

    return (facillitycode.padStart(3, "0") + tagid.padStart(8, "0"));
  }

  receivedShipmentItems() {
    if (this.rangeDiv) {
      let startRange = this.receiveShipmentForm.controls['startRange'].value;
      let textQuantity = this.receiveShipmentForm.controls['quantity'].value;
      if ((startRange == "" || startRange == null) && (textQuantity == "" || textQuantity == null)) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Enter start range and quantity";
        this.msgTitle = '';

        this.validateAllFormFields(this.receiveShipmentForm);
        return;
      }
      else if (startRange == "" || startRange == null) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Specify start range";
        this.msgTitle = '';

        this.validateAllFormFields(this.receiveShipmentForm);
        return;
      }
      else if (textQuantity == "" || textQuantity == null) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Specify Quantity";
        this.msgTitle = '';

        this.validateAllFormFields(this.receiveShipmentForm);
        return;
      }
    }
    else {
      let serilaNumbersListLength = this.serialNumbersList.length;
      if (this.serialNumbersList == null || serilaNumbersListLength == 0) {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = " Enter at least one serial number to receive";
        this.msgTitle = '';

        this.receiveShipmentForm.controls['serialNumbersList'].setValue('');
        this.validateAllFormFields(this.receiveShipmentForm);
        return;
      }
    }
    let litReceivedQuantity = this.receivedGridItems[0].ReceivedQty;
    let lititemquantity = this.receivedGridItems[0].ItemQuantity;
    let quantity = this.quantityValue;
    if (quantity != "") {
      if (quantity != 0) {
        if (parseInt(quantity) + parseInt(litReceivedQuantity) > parseInt(lititemquantity)) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Received Quantity should not be more than " + (parseInt(lititemquantity) - parseInt(litReceivedQuantity));
          this.msgTitle = '';

          return;
        }
        else {
          //$('#viewReceivedNumberOfItems').modal('show');
          this.msgType = 'alert';
          this.msgFlag = true;
          this.msgDesc = "Are you sure you have to received " + this.quantityValue + " items ?";
          this.msgTitle = 'Alert';
          this.alertType = true;
        }
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Received Quantity should be greater than Zero";
        this.msgTitle = '';

        return;
      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Received Quantity should be greater than Zero";
      this.msgTitle = '';

      return;
    }


  }
  cancelShipmentItems() {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = " Are you sure you want to cancel Received Shipments Details ? if you cancel now you will not save data";
    this.msgTitle = 'Alert';
    this.alertType = false;
  }
  goToTestReceivedShipment() {
    if (this.rangeDiv) {
      this.nextStep = true;
      let startRange = this.receiveShipmentForm.controls['startRange'].value;
      let endRange = this.receiveShipmentForm.controls['endRange'].value;
      let quantity = this.receiveShipmentForm.controls['quantity'].value;
      if (startRange != "") {
        if (endRange != "" && quantity != "" && quantity != 0) {
          this.checkSerialNumber(startRange, this.isTagAgency);
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Specify Quantity";
          this.msgTitle = '';

          return;
        }
      }
    }
    else {
      this.navigateToNextStep();
    }
  }

  backMethod() {
    let shipmentDetails: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
    shipmentDetails.ItemInventoryBatchDetails = null;
    shipmentDetails = null;
    this.receiveShipmentDetailsService.saveShipmentDetails(shipmentDetails);
    this.receiveShipmentDetailsService.receivedQty = null;
    this.receiveShipmentDetailsService.rangeSerialNum = [];
    this.router.navigateByUrl('imc/shipment/shipment-batch-information');

  }

  clearFields() {
    this.receiveShipmentForm.controls['quantity'].setValue("");
    this.receiveShipmentForm.controls['endRange'].setValue("");
    this.quantityValue = "";
  }

  onQuantityChange(quantity) {
    let startRange = this.receiveShipmentForm.controls['startRange'].value;
    if (startRange != "") {
      if (this.isTagAgency == 0) {
        if (quantity != "") {
          this.checkSerialNumber(startRange, this.isTagAgency);
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Specify Quantity";
          this.msgTitle = '';

          return;
        }
      }
      else {
        if (this.shipmentContext.Protocol == 'EZPASS-TDM') {
          if (startRange.length == 11) {
            this.checkSerialNumber(startRange, this.isTagAgency);
            if (parseInt(startRange) + parseInt(quantity) > parseInt(this.startRangeFacilty + "16777215")) {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Invalid End Range: " + (parseInt(this.startRangeFacilty + "16777215") - parseInt(startRange)) + " item (s) are available";
              this.msgTitle = '';

              return;
            }
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Start Range length should be 11 digits for EZPass between 06400000001 – 06416777215";
            this.msgTitle = '';

            return;
          }
        }
        else if (this.shipmentContext.Protocol == '6C' || this.shipmentContext.Protocol == 'Title 21') {
          if (startRange.length == 10) {
            this.checkSerialNumber(startRange, this.isTagAgency);
            if (parseInt(startRange) + parseInt(quantity) > parseInt(this.startRangeFacilty + "1024")) {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = "Invalid Start Range";
              this.msgTitle = '';

              return;
            }
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Start Range length should be 10 digits";
            this.msgTitle = '';

            return;
          }
        }
      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Invalid Start Range";
      this.msgTitle = '';

      return;
    }
  }

  navigateToNextStep() {
    if (this.seriesDiv) {
      this.receiveShipmentDetailsService.receivedQty = this.serialNumbersList;
      let litReceivedQuantity = this.receivedGridItems[0].ReceivedQty;
      let lititemquantity = this.receivedGridItems[0].ItemQuantity;
      let RecievedQuantity = this.quantityValue == "" ? "0" : this.quantityValue;
      this.expectedCount = parseInt(lititemquantity) - parseInt(litReceivedQuantity);
      this.serialNumbersList.sort();
      let shipmentDetails: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
      let itemBatchRequest: IItemBatchRequest = <IItemBatchRequest>{};
      itemBatchRequest.ActualCount = shipmentDetails.BatchCount = parseInt(this.quantityValue);
      itemBatchRequest.BatchDate = new Date();
      itemBatchRequest.BegSerialNum = this.serialNumbersList.length > 0 ? this.serialNumbersList[0] : "";
      itemBatchRequest.EndSerialNum = this.serialNumbersList.length > 0 ? this.serialNumbersList[this.serialNumbersList.length - 1] : "";
      itemBatchRequest.CreatedUser = this.sessionContextResponse.userName;
      itemBatchRequest.ExpectedCount = this.expectedCount;
      itemBatchRequest.BatchType = "NEW";
      shipmentDetails.ItemInventoryBatchDetails = itemBatchRequest;
      if (shipmentDetails.ItemInventoryBatchDetails.ExpectedCount == shipmentDetails.ItemInventoryBatchDetails.ActualCount)
        shipmentDetails.ShipmentStatus = ShipmentStatus[ShipmentStatus.ShippedFull];
      else
        shipmentDetails.ShipmentStatus = ShipmentStatus[ShipmentStatus.ShipPartial];
      shipmentDetails.ItemQuantity = this.serialNumbersList.length;
      this.receiveShipmentDetailsService.saveShipmentDetails(shipmentDetails);
    }
    this.router.navigateByUrl('imc/shipment/test-received-shipment');
  }

  cancelRecieveShipment() {
    this.receiveShipmentForm.reset();
    let shipmentDetails: IShipmentDetailsrequest = <IShipmentDetailsrequest>{};
    shipmentDetails.ItemInventoryBatchDetails = null;
    shipmentDetails = null;
    this.receiveShipmentDetailsService.receivedQty = null;
    this.receiveShipmentDetailsService.saveShipmentDetails(shipmentDetails);
    this.receiveShipmentDetailsService.rangeSerialNum = [];
    this.router.navigateByUrl("imc/shipment/shipment-search");
  }

  BtnAddClick() {
    this.serialNumberitem = "";
    let serialNumber = this.receiveShipmentForm.controls['serialNumber'].value;
    if (serialNumber != "" && serialNumber != null) {
      let serilaNumbersListLength = this.serialNumbersList.length;
      if (this.serialNumbersList == null || serilaNumbersListLength == 0) {
        this.receiveShipmentForm.controls['serialNumbersList'].reset();
      }
      if (this.shipmentContext.Protocol == '6C' || this.shipmentContext.Protocol == 'Title 21') {
        if (this.isTagAgency == 1 && serialNumber.length != 10) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Start Range length should be 10 digits";
          this.msgTitle = '';

          return;
        }
      }
      else if (this.shipmentContext.Protocol == 'EZPASS-TDM') {
        if (serialNumber.length != 11) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Start Range length should be 11 digits for EZPass between 06400000001 – 06416777215";
          this.msgTitle = '';

          return;
        }
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = "Select atleast a Tag Type to process.";
        this.msgTitle = '';

        return;
      }
      this.checkSerialNumber(serialNumber, this.isTagAgency);
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Enter Serial #";
      this.msgTitle = '';

      return;
    }
  }

  BtnRemoveClick() {
    let serialNumber = this.serialNumberitem;
    if (serialNumber == "" || serialNumber == null) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "select serialnumber";
      this.msgTitle = '';

      return;
    }
    for (var item = 0; item < this.serialNumbersList.length; item++) {
      if (this.serialNumbersList[item] == serialNumber) {
        this.receiveShipmentForm.controls['serialNumber'].setValue(serialNumber);
        this.serialNumbersList.splice(item, 1);
        this.quantityValue = this.serialNumbersList.length;
      }
      let rootSelector = this;
      setTimeout(function () {
        rootSelector.materialscriptService.material();
      }, 0);
    }

  }
  getSerialNumber(event) {
    this.serialNumberitem = event.target.value;

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
  btnYesClick(event) {
    if (event && this.alertType) {
      this.goToTestReceivedShipment();
    }
    else if (event && !this.alertType)
      this.cancelRecieveShipment();
    else
      this.msgFlag = false;
  }
  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.SHIPMENT];
    this.userEvents.SubFeatureName = SubFeatures[SubFeatures.RECEIVESHIPMENT]
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
}


