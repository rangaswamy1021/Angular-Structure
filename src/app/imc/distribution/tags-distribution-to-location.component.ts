import { ITagResponse } from './../../shared/models/tagresponse';
import { IPaging } from './../../shared/models/paging';
import { IOperationalLocationsRequest } from './../../sac/usermanagement/models/operationallocationsrequest';
import { ActivitySource, Features, Actions } from './../../shared/constants';
import { IUserresponse } from './../../shared/models/userresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { DistributionService } from "./services/distribution.service";
import { SessionService } from "../../shared/services/session.service";
import { ITagsDistributionRequest } from "./models/tagdistributionrequest";
import { ITagsDistributionRespone } from "./models/tagdistributionresponse";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-tags-distribution-to-location',
  templateUrl: './tags-distribution-to-location.component.html',
  styleUrls: ['./tags-distribution-to-location.component.scss']
})
export class TagsDistributionToLocationComponent implements OnChanges {
  disableUpddateButton: boolean;
  tagspattern: any = "[0-9]*";
  locationResponse: boolean;
  mounting: string = "";
  protocol: string = "";
  distributionForm: FormGroup;
  @Input() childTagResponse: ITagsDistributionRespone;
  @Input() childFlag: boolean;
  @Output() cancelClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() createClicked: EventEmitter<string> = new EventEmitter<string>();
  constructor(private distributionServices: DistributionService, private sessionContext: SessionService, private router: Router, private commonService: CommonService,
    private materialscriptService: MaterialscriptService) { }
  sessionContextResponse: IUserresponse;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  isQuantityAllow: boolean = false;
  status: boolean;
  isDistribution: boolean;
  serialNoResponse: ITagsDistributionRespone[];
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  lstReceivedSerialNumber = [];
  dropdownResponse = [];
  selectedItem: any;
  paging: IPaging;
  ngOnChanges() {
    this.materialscriptService.material();
    this.distributionForm = new FormGroup({
      "startRange": new FormControl("", []),
      "quantity": new FormControl("", [Validators.required, Validators.maxLength(3), Validators.pattern(this.tagspattern)]),
      "endrange": new FormControl(""),
      "protocol": new FormControl("", [Validators.required]),
      "mounting": new FormControl("", [Validators.required]),
      "location": new FormControl("", [Validators.required]),
    });
    this.disableUpddateButton = !this.commonService.isAllowed(Features[Features.LOCATIONSDISTRIBUTION], Actions[Actions.UPDATE], "");

    this.distributionForm.controls['protocol'].disable();
    this.distributionForm.controls['mounting'].disable();
    this.distributionForm.controls['endrange'].disable();
    this.distributionForm.controls['location'].disable();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.isDistribution = this.childFlag;
    if (this.childTagResponse) {
      this.protocol = this.childTagResponse.Protocol;
      this.mounting = this.childTagResponse.Mounting;
    }
    this.distributionForm.controls['protocol'].setValue(this.protocol);
    this.distributionForm.controls['mounting'].setValue(this.mounting);
    this.getLocations();
  }
  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.LOCATIONSDISTRIBUTION];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  checkStartRange(event) {
    let startRange = this.distributionForm.controls['startRange'].value;
    let tagStatusResponse: ITagResponse;
    //getting tag details for the serial number   
    this.distributionServices.getTagDetailsByserialNumber(startRange).subscribe(res => {
      tagStatusResponse = res;
      if (tagStatusResponse != null) {
        if (tagStatusResponse.TagStatus.toUpperCase() != "InventoryNew".toUpperCase()) {
          this.errorMessageBlock("Should be in Inventory New status");
          return;
        }
        if (tagStatusResponse.Mounting != this.childTagResponse.Mounting || tagStatusResponse.Protocol != this.childTagResponse.Protocol) {
          this.errorMessageBlock("Should be of " + this.childTagResponse.Protocol + "_" + this.childTagResponse.Mounting + " type");
          return;
        }
      }
      else {
        this.errorMessageBlock("Tag not available");
      }
    });
  }

  onQuantityChange(event) {
    this.lstReceivedSerialNumber = [];
    let quantity = this.distributionForm.controls['quantity'].value;
    let reqCount = this.childTagResponse.ReqCount;
    let assignedCount = this.childTagResponse.AssignedCount;
    reqCount = reqCount - assignedCount;
    if (reqCount < quantity) {
      this.errorMessageBlock("Given No.of Tags should not exceed Requested count.");
      this.isQuantityAllow = true;
      return;
    }
    else {
      this.isQuantityAllow = false;
    }
    var tagRequest = <ITagsDistributionRequest>{};
    tagRequest.SerialNumber = this.distributionForm.controls['startRange'].value;
    tagRequest.ReqCount = this.distributionForm.controls['quantity'].value;
    tagRequest.Protocol = this.childTagResponse.Protocol;
    tagRequest.Mounting = this.childTagResponse.Mounting;
    this.distributionServices.getTagDistributionSerialNumbers(tagRequest).subscribe(res => {
      this.serialNoResponse = res;
      if (this.serialNoResponse != null) {
        if (quantity != '' && quantity != 0 && quantity > 0) {
          for (var i = 0; i < this.serialNoResponse.length; i++) {
            this.lstReceivedSerialNumber.push(this.serialNoResponse[i].SerialNumber);
            this.distributionForm.controls['endrange'].setValue(this.serialNoResponse[i].SerialNumber);
          let a=this;
           setTimeout(function(){
              a.materialscriptService.material()
           },100);
          }
          //this.confirmationBlock(this.lstReceivedSerialNumber+"serial numbers are available. Are you sure you want to fulfill tag request ? ")       
        }
        else if (this.distributionForm.controls['quantity'].touched) {
          this.errorMessageBlock("Specify Quantity");
          return;
        }
      }
      else {
        this.errorMessageBlock("Tag not available");
        return;
      }
    });
  }

  onDistributionClick() {
    if (!this.isQuantityAllow) {
      if (this.distributionForm.valid) {
        if (this.lstReceivedSerialNumber.length > 0) {
          this.confirmationBlock(this.lstReceivedSerialNumber + "  " + "serial numbers are available. Are you sure you want to fulfill tag request ? ")
        }
        else {
          this.errorMessageBlock("Tag Serial numbers are not avaliable");
          return;
        }
      }
      else {
        this.distributionForm.controls['startRange'].markAsTouched({ onlySelf: true });
        this.distributionForm.controls['quantity'].markAsTouched({ onlySelf: true });
      }
    }
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
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
  cancelDistribution() {
    this.isDistribution = false;
    this.status = false;
    this.cancelClicked.emit(this.isDistribution);
    return false;
  }
  confirmationBlock(alertMsg) {
    this.msgType = 'alert';
    this.msgFlag = true;
    this.msgDesc = alertMsg;
  }
  userAction(event) {
    if (event) {
      this.locationsDistribute();
    }
  }

  locationsDistribute() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    var tagRequest = <ITagsDistributionRequest>{};
    tagRequest.SerialNumber = this.lstReceivedSerialNumber.toString();
    tagRequest.LocationId = this.distributionForm.controls['location'].value;
    tagRequest.TagReqId = this.childTagResponse.TagReqId;
    tagRequest.CreatedUser = this.sessionContextResponse.userName;
    tagRequest.LoginId = this.sessionContextResponse.loginId;
    tagRequest.UserId = this.sessionContextResponse.userId;
    tagRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.distributionServices.updateLocationsDistribution(tagRequest, userEvents).subscribe(res => {
      this.locationResponse = res;
      if (res) {
        this.isDistribution = false;
        this.createClicked.emit("Tag(s) location has been distributed successfully.");
      }
      else {
        this.isDistribution = true;
        this.errorMessageBlock("Error while distributed tags location");
      }
    },
      (err) => {
        this.isDistribution = true;
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }

  getLocations() {
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.getLocationRequest.LocationCode = '';
    this.getLocationRequest.LocationName = '';
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 1000;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.getLocationRequest.Paging = this.paging;
    this.getLocationRequest.viewFlag = "VIEW";
    this.getLocationRequest.UserId = this.sessionContext.customerContext.userId;
    this.getLocationRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getLocationRequest.PerformedBy = this.sessionContext.customerContext.userName;
    this.distributionServices.getOperationalLocations(this.getLocationRequest, userEvents).subscribe(
      res => {
        this.dropdownResponse = res;
        for (let i = 0; i < this.dropdownResponse.length; i++) {
          this.dropdownResponse = this.dropdownResponse.filter(element => element.LocationId == this.childTagResponse.LocationId);
        }
        this.selectedItem = this.dropdownResponse[0].LocationId;
        console.log(this.dropdownResponse);
      });
  }
}
