import { IUserEvents } from './../shared/models/userevents';
import { ICSRRelationsRequest } from './../shared/models/csrrelationsrequest';
import { IUserresponse } from './../shared/models/userresponse';
import { SessionService } from './../shared/services/session.service';
import { environment } from './../../environments/environment';
import { Router } from '@angular/router';
import { TagStatus, TagLocations, ActivityType } from './constants';
import { CustomerContextService } from './../shared/services/customer.context.service';
import { ICustomerContextResponse } from './../shared/models/customercontextresponse';
import { ApplicationParameterkey } from '../shared/applicationparameter';
import { CommonService } from '../shared/services/common.service';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { TagService } from './services/tags.service';
import { ICustomerResponse } from '../shared/models/customerresponse';
import { ITagResponse } from '../shared/models/tagresponse';
import { ITagRequest, IAssignTagRequest } from './models/tagrequest';
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from '../shared/constants';
import { IOperationalLocationsResponse } from "../sac/usermanagement/models/operationallocationsresponse";
import { IOperationalLocationsRequest } from "../sac/usermanagement/models/operationallocationsrequest";
import { IPaging } from "../shared/models/paging";
import { FormGroup, FormControl } from "@angular/forms";

declare var $: any;

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.css']
})
export class AddTagComponent implements OnChanges {
  selectedItem: string='';
  dropdownResponse: IOperationalLocationsResponse[];
  tagsbtn: boolean = true;
  selecteddata: any;
  selectedtgsForm: FormGroup;
  paging: any;
  items1: any;
  @Input() childTagResponse: ITagResponse;
  @Input() customerId: number;
  @Input() fulfillVisible: boolean;

  @Output() createClicked: EventEmitter<string> =
  new EventEmitter<string>();

  @Output() cancelClicked: EventEmitter<string> =
  new EventEmitter<string>();
  getLocationRequest: ITagRequest = <ITagRequest>{};
  multiselectlist: Array<any> = [];
  itemsList = [];
  getSerialIds: Array<string> = [];
  selectedItems = [];
  dropdownSettings = {};
  serialNumberDropdown: any;
  customerResponse: ICustomerResponse = <ICustomerResponse>{};
  tagAssignArray: ITagAssign[];
  tagReplaceAssign: ITagAssign = <ITagAssign>{};
  isReplaceTag: boolean;
    locationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  locationId: number = 0;
  tagCode: string;
  expiryYears: number = 0;
  isTagReturned: boolean = false;
  alertFulfill: boolean = false;
  alertLowInventory: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  tagItems = [];
  isFulfillVisible: boolean;
  deniedSerialNumbers: string[] = [];
  deniedReplaceSerialNumber: string;
  locationName: any = '';
  status: boolean;
  tags: boolean = false;
  icnID: number = 0;
  sessionContextResponse: IUserresponse;
  constructor(private tagService: TagService, private commonService: CommonService, private router: Router, private sessionContext: SessionService) { }

  ngOnChanges() {
    this.selectedtgsForm = new FormGroup({
      "selecttagsList": new FormControl("")
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    let locationDetails = JSON.parse(sessionStorage.getItem('locationDetails'));
    this.locationName = locationDetails.locationName;
    this.locationId = locationDetails.locationId;
    this.getLocations(this.locationId);
    this.icnID = this.sessionContextResponse.icnId;
    $('#pageloader').modal('hide');
    this.tagReplaceAssign.SerialNumber='';
    this.isFulfillVisible = this.fulfillVisible;
    this.isReplaceTag = this.childTagResponse.TagTobeReplaced ? true : false;
    this.tagService.getAccountDetailsById(this.customerId.toString()).subscribe(res => {
      this.customerResponse = res;
    });
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxTagCountforNonRevenue).subscribe(res => this.expiryYears = res);
    this.tagAssignArray = new Array<ITagAssign>(this.childTagResponse.ReqCount);
    for (var i = 0; i < this.childTagResponse.ReqCount; i++) {
      this.tagAssignArray[i] = <ITagAssign>{}
    }
    this.selectedItems = [];
    if (!this.tags)
      this.settings();
  }

  resetBtn() {
    this.selectedtgsForm.reset();
  }
  cancelClick() {
    this.selectedtgsForm.reset();
  }
  validateTag(index) {
    this.tagAssignArray[index].ErrorMessage = "";
    this.tagAssignArray[index].HexTagNumber = "";
    if (this.tagAssignArray[index].SerialNumber) {
      var res = this.tagAssignArray[index].SerialNumber.match(/[0-9]/g);
      if (res == null) {
        this.tagAssignArray[index].ErrorMessage = "It should allows numbers only";
        return false;
      }
      var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
      csrRelationReq.CustomerIds = this.customerId.toString();
      csrRelationReq.VehicleNumbers = "";
      csrRelationReq.TagIds = this.tagAssignArray[index].SerialNumber;
      csrRelationReq.InternalUserId = this.sessionContextResponse.userId;
      let strSerialNumber: string = this.tagAssignArray[index].SerialNumber;
      this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
        if (res) {
          this.errorMessageBlock("Access Denied. You do not have privileges to access Serial Number " + csrRelationReq.TagIds);
          this.deniedSerialNumbers.push(csrRelationReq.TagIds);
        }
        else {
          this.deniedSerialNumbers = this.deniedSerialNumbers.filter(x => x != csrRelationReq.TagIds);
        }
      },
        (err) => {
          this.errorMessageBlock(err.statusText.toString());
        },
        () => {
        });
      //checking duplicate serial number
      var isduplicate: boolean = false;
      for (var i = 0; i < this.tagAssignArray.length; i++) {
        if (index != i && strSerialNumber == this.tagAssignArray[i].SerialNumber) {
          isduplicate = true;
        }
      }
      if (isduplicate) {
        this.tagAssignArray[index].ErrorMessage = "Duplicate tags are not allowed.";
        return;
      }
      //getting tag details for the serial number
      this.checkTagStatus(this.tagAssignArray[index]);
    }
  }

  checkTagStatus(tagRequestAssign: ITagAssign) {
    let tagStatusResponse: ITagResponse;
    //getting tag details for the serial number
    tagRequestAssign.ErrorMessage = '';
    this.tagService.getTagDetailsByserialNumber(tagRequestAssign.SerialNumber).subscribe(res => {
      tagStatusResponse = res;
      if (tagStatusResponse) {
        if (tagStatusResponse.TagStatus.toUpperCase() != "InventoryNew".toUpperCase()) {
          tagRequestAssign.ErrorMessage = "Should be in Inventory New status";
          return;
        }
        if (tagStatusResponse.Mounting != this.childTagResponse.Mounting || tagStatusResponse.Protocol != this.childTagResponse.Protocol) {
          tagRequestAssign.ErrorMessage = "Should be of " + this.childTagResponse.Protocol + "_" + this.childTagResponse.Mounting + " type";
          return;
        }
        console.log(this.locationId);
        if (tagStatusResponse.LocationId !== this.locationId) {
          tagRequestAssign.ErrorMessage = "Tag not available in this Location";
          //this.errorMessageBlock(tagRequestAssign.SerialNumber + "is related to " + tagStatusResponse.LocationName + "Location");
          this.errorMessageBlock("Tag not available in this Location");
          return;
        }
        this.tagCode = tagStatusResponse.ItemCode;
        tagRequestAssign.HexTagNumber = tagStatusResponse.HexTagNumber;
      }
      else {
        tagRequestAssign.ErrorMessage = "Tag not available";
      }
    });
  }

  validateReplaceTag() {
    this.tagReplaceAssign.ErrorMessage = "";
    this.tagReplaceAssign.HexTagNumber = "";
    let tagStatusResponse: ITagResponse;
    if (this.tagReplaceAssign.SerialNumber) {
      var csrRelationReq: ICSRRelationsRequest = <ICSRRelationsRequest>{};
      csrRelationReq.CustomerIds = this.customerId.toString();
      csrRelationReq.VehicleNumbers = "";
      csrRelationReq.TagIds = this.tagReplaceAssign.SerialNumber;
      csrRelationReq.InternalUserId = this.sessionContextResponse.userId;
      let strSerialNumber: string = this.tagReplaceAssign.SerialNumber;
      this.commonService.verifyInternalUserAcces(csrRelationReq).subscribe(res => {
        if (res) {
          this.errorMessageBlock("Access Denied. You do not have privileges to access Serial Number " + csrRelationReq.TagIds);
          this.deniedReplaceSerialNumber = csrRelationReq.TagIds;
        }
        else {
          this.deniedReplaceSerialNumber = "";
        }
      });
      this.checkTagStatus(this.tagReplaceAssign);
    }
  }

  assignTag() {
    if (this.isReplaceTag) {
      if (this.tagReplaceAssign.HexTagNumber != null && this.tagReplaceAssign.HexTagNumber != "") {
        this.tagService.checkInventoryforTagAssign(this.tagCode, "1").subscribe(res => {
          if (res) {
            this.fulfillTagRequest();
          }
          else {
            this.alertLowInventory = true;
            this.confirmMessage("Items in Inventory are Low. Do you want to continue");
          }
        });
      } else {
        this.errorMessageBlock("Provide atleast one valid Serial # to fulfill the request.");
        return;
      }
    }
    else {
      if (this.tagAssignArray) {
        var filteredList = this.tagAssignArray.filter(tag => tag.HexTagNumber != null && tag.HexTagNumber != "");
        if (filteredList != null && filteredList.length > 0) {
          this.tagService.checkInventoryforTagAssign(this.tagCode, filteredList.length.toString()).subscribe(res => {
            if (res) {
              this.fulfillTagRequest();
            }
            else {
              this.alertLowInventory = true;
              this.confirmMessage("Items in Inventory are Low. Do you want to continue");
            }
          });
        }
        else {
          this.errorMessageBlock("Provide atleast one valid Serial # to fulfill the request.");
          return;
        }
      }
      else {
        this.errorMessageBlock("Request fulfillment already completed.");
        return;
      }
    }
  }

  lowTagFulfill() {
    this.fulfillTagRequest();
  }

  fulfillTagRequest() {
    if (this.icnID > 0) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TAG];
      userEvents.ActionName = Actions[Actions.FULFILL];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.customerId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      if (this.isReplaceTag) {
        var tagRequestObject = <ITagRequest>{};
        if (this.deniedReplaceSerialNumber != this.tagReplaceAssign.SerialNumber) {
          tagRequestObject.SerialNumber = this.tagReplaceAssign.SerialNumber;
          tagRequestObject.HexTagNumber = this.tagReplaceAssign.HexTagNumber;
          tagRequestObject.IsReplacedTagReturned = this.isTagReturned;
          tagRequestObject.TagTobeReplaced = this.childTagResponse.TagTobeReplaced;
          this.assignCommonProperties(tagRequestObject);
          $('#pageloader').modal('show');
          this.tagService.replaceTag(tagRequestObject, userEvents).subscribe(res => {
            if (res) {
              $('#pageloader').modal('hide');
              this.isFulfillVisible = false;
              this.createClicked.emit("Tag(s) has been assigned successfully.");
            }
            else {
              this.errorMessageBlock("Error while assigning tags");
              $('#pageloader').modal('hide');
              this.isFulfillVisible = true;
            }
          },
            (err) => {
              this.errorMessageBlock(err.statusText.toString());
              $('#pageloader').modal('hide');
            },
            () => {
            });
        }
        else {
          this.errorMessageBlock("Provide atleast one valid Serial # to fulfill the request.");
          return;
        }
      }
      else {

        var filteredList = this.tagAssignArray.filter(tag => tag.HexTagNumber != null && tag.HexTagNumber != "");
        if (filteredList != null && filteredList.length > 0) {
          for (var i = 0; i < filteredList.length; i++) {
            let index = this.deniedSerialNumbers.indexOf(filteredList[i].SerialNumber);
            if (index < 0) {
              let tagRequest: ITagRequest = <ITagRequest>{};
              tagRequest.SerialNumber = filteredList[i].SerialNumber;
              tagRequest.HexTagNumber = filteredList[i].HexTagNumber;
              this.assignCommonProperties(tagRequest);
              this.tagItems.push(tagRequest);
            }
          }
          if (this.tagItems.length > 0) {
            $('#pageloader').modal('show');
            this.tagService.assignTag(this.tagItems, userEvents).subscribe(res => {
              if (res) {
                this.isFulfillVisible = false;
                this.tagItems.length = 0;
                this.createClicked.emit("Tag(s) has been assigned successfully.");
                $('#pageloader').modal('hide');
              }
              else {
                this.errorMessageBlock("Error while assigning tag(s)");
                $('#pageloader').modal('hide');
                this.isFulfillVisible = true;
                this.tagItems = [];
              }
            },
              (err) => {
                this.errorMessageBlock(err.statusText.toString());
                $('#pageloader').modal('hide');
                this.tagItems = [];
              },
              () => {
              });
          }
          else {
            this.errorMessageBlock("Provide atleast one valid Serial # to fulfill the request.");
            return;
          }
        }
        else {
          this.errorMessageBlock("Provide atleast one valid Serial # to fulfill the request.");
          return;
        }
      }
    }
    else {
      this.errorMessageBlock("ICN is not assigned to do transactions.");
      return;
    }
  }

  assignCommonProperties(tagRequest: ITagRequest) {
    tagRequest.CustomerId = this.customerId;
    tagRequest.TagStatus = TagStatus[TagStatus.Assigned].toUpperCase();
    tagRequest.TagType = this.tagCode;
    let tagAssignedDate = Date.now();
    tagRequest.StartEffectiveDate = new Date(tagAssignedDate).toLocaleString(defaultCulture).replace(/\u200E/g, "");
    tagRequest.StatusDate = new Date(tagAssignedDate);
    tagRequest.TagLocation = this.selectedItem;
    tagRequest.AdjustmentReason = "Adjustment for tag assign";
    tagRequest.FulfilledQty = 1;
    tagRequest.SubSystem = SubSystem[SubSystem.CSC];
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    tagRequest.ActivityType = ActivityType[ActivityType.TAGASGN];
    tagRequest.EndEffectiveDate = new Date(new Date(tagAssignedDate).getFullYear() + parseInt(this.expiryYears.toString()), new Date(tagAssignedDate).getMonth(), new Date(tagAssignedDate).getDate(), 23, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
    tagRequest.UserName = this.sessionContextResponse.userName;
    tagRequest.ICNId = this.sessionContextResponse.icnId;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.CustTagReqId = this.childTagResponse.CustTagReqId;
    tagRequest.TagReqType = this.childTagResponse.TagReqType;
    tagRequest.Mounting = this.childTagResponse.Mounting;
    tagRequest.Protocol = this.childTagResponse.Protocol;
    tagRequest.AssignedOrReturnedType = this.childTagResponse.TagReqType;
  }
  cancelFulfillRequest() {
    this.isFulfillVisible = false;
    this.status = false;
    this.cancelClicked.emit(status);
    return false;
  }

  fulFillRequest() {
    this.alertFulfill = true;
    this.confirmMessage("Are you sure you want to assign tag request ?");
  }

  onPrintCustomerAddress() {
    var strFilePath: string;
    var tagAssignReq = <IAssignTagRequest>{};
    let strFullAddress = this.customerResponse.FullAddress;
    let strFullName = this.customerResponse.FullName;
    let strCustomerId = this.customerId.toString();
    this.tagService.printCustomerAddress(strCustomerId, strFullAddress, strFullName).subscribe(
      res => {
        strFilePath = res;
        if (strFilePath !== "") {
          window.open(strFilePath);
        }
        else {
          this.errorMessageBlock("Cannot generate PDF");
        }
      },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }
  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
  confirmMessage(alertMsg) {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = alertMsg;
  }
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
  userAction(event) {
    if (event) {
      if (this.alertFulfill) {
        this.assignTag();
        this.alertFulfill = false;
      }
      else {
        if (this.alertLowInventory) {
          this.lowTagFulfill();
        }
      }
    }
  }

  getSerialNumbers() {
    this.itemsList = [];
    this.getLocationRequest.Protocol = this.childTagResponse.Protocol;
    this.getLocationRequest.Mounting = this.childTagResponse.Mounting;
    this.getLocationRequest.LocationId = this.locationId;
    this.tagService.getTagSerialNumbersbyLocationId(this.getLocationRequest).subscribe(
      res => {
        if (res) {
          this.multiselectlist = [];
          res.forEach(element => {
            this.serialNumberDropdown = {};
            this.serialNumberDropdown.id = element.SerialNumber;
            this.serialNumberDropdown.itemName = element.SerialNumber;
            this.multiselectlist.push(this.serialNumberDropdown);
          });
        }
      });
  }

  settings() {
    this.tags = true;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select SerialNo",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass custom-class",
    };
  }

  onItemSelect(item: any) {
    var filteredItem = this.itemsList.filter(d => d.id == item.id);
    if (filteredItem.length > 0) {
      this.itemsList.slice(item);
    }
    else {
      this.itemsList.push(item);
    }
  }

  OnItemDeSelect(item: any) {
    var index = this.itemsList.findIndex(x => x.id == item.id);
    if (index > -1) {
      this.itemsList.splice(index, 1);
    }
  }

  onSelectAll(items: any) {
    items.forEach(element => {
      this.items1 = {};
      this.items1.id = element.id;
      this.items1.itemName = element.itemName;
      this.itemsList.push(this.items1)
    });
  }

  onDeSelectAll(items: any) {
    this.itemsList = [];
  }

  selectedSerialNumbers() {
    this.selectedItems = [];
    this.getSerialIds = [];
    for (var i = 0; i < this.itemsList.length; i++) {
      this.getSerialIds.push(this.itemsList[i].id);
    }
    for (var i = 0; i < this.tagAssignArray.length; i++) {
      this.tagAssignArray[i].SerialNumber = this.getSerialIds[i];
      this.checkTagStatus(this.tagAssignArray[i]);
    }
  }
  getLocations(locationId) {
    this.locationRequest.LocationCode = '';
    this.locationRequest.LocationName = '';
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 100;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.locationRequest.Paging = this.paging;
    this.locationRequest.viewFlag = "VIEW";
    this.locationRequest.UserId = this.sessionContext.customerContext.userId;
    this.locationRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.locationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.locationRequest.PerformedBy = this.sessionContext.customerContext.userName;
    this.tagService.getOperationalLocations(this.locationRequest).subscribe(
      res => {
        this.dropdownResponse = res;
        for (let i = 0; i < this.dropdownResponse.length; i++) {
          this.dropdownResponse = this.dropdownResponse.filter(element => element.LocationId == locationId);
        }
        this.selectedItem = this.dropdownResponse[0].LocationCode;
        //alert(this.selectedItem);
      });
  }
}

export interface ITagAssign {
  HexTagNumber: string,
  SerialNumber: string,
  ErrorMessage: string
}