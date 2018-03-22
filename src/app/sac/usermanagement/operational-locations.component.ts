import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IPaging } from "../../shared/models/paging";
import { UserManagementService } from "./services/usermanagement.service";
import { CommonService } from "../../shared/services/common.service";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { Features, Actions, ActivitySource } from "../../shared/constants";
import { IOperationalLocationsResponse } from "./models/operationallocationsresponse";
import { IOperationalLocationsRequest } from "./models/operationallocationsrequest";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-operational-locations',
  templateUrl: './operational-locations.component.html',
  styleUrls: ['./operational-locations.component.scss']
})
export class OperationalLocationsComponent implements OnInit {
  addOperationalLocations: boolean = false;
  updateOperationalLocations: boolean = false;
  addLocationNew: boolean = true;
  storedData: IOperationalLocationsResponse;
  paging: IPaging;
  p: number;
  locations: IOperationalLocationsResponse[] = [];
  pageNumber: number = 1;
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  createLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  createLocationList: IOperationalLocationsRequest[] = [];
  operationalLocationsForm: FormGroup;
  isaddLocation: boolean = false;
  isAddClicked: boolean;
  isDisablelocationcode: boolean;
  descriptionMaxLength: number = 255;
  descriptionLength: number = this.descriptionMaxLength;
  isEditClicked: boolean;
  editLocationId: number;
  disableSearchButton: boolean = false;
  disableCreateButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sessionContextResponse: IUserresponse;
  constructor(private userManagementService: UserManagementService,
    private commonService: CommonService, private context: SessionService,
    private router: Router, private materialscriptService: MaterialscriptService) { }

  //paging
  pageItemNumber: number = 10;
  dataLength: number;
  currentPage: number = 1;
  endItemNumber: number;
  startItemNumber: number = 1;
  //

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }
  ngOnInit() {

    this.sessionContextResponse = this.context.customerContext;
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCalling(userEvents);
    userEvents.ActionName = Actions[Actions.VIEW];
    this.getLocations(true, false, userEvents);

    this.isAddClicked = true;
    this.isEditClicked = false;

    this.operationalLocationsForm = new FormGroup({
      'locationname': new FormControl('', [Validators.required]),
      'locationcode': new FormControl('', [Validators.required]),
      'location-name': new FormControl(''),
      'location-code': new FormControl(''),
      'description': new FormControl('', [Validators.required])
    });
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.OPERATIONALLOCATIONS], Actions[Actions.SEARCH], "");
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.OPERATIONALLOCATIONS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.OPERATIONALLOCATIONS], Actions[Actions.UPDATE], "");
    this.materialscriptService.material();
  }

  calculateLength(event: any) {
    this.descriptionLength = 255 - event.target.value.length
  }



  createlocations() {
    if (this.operationalLocationsForm.valid) {
      this.createLocationRequest = <IOperationalLocationsRequest>{};
      this.createLocationRequest.LocationName = this.operationalLocationsForm.controls['locationname'].value;
      this.createLocationRequest.LocationCode = this.operationalLocationsForm.controls['locationcode'].value;
      this.createLocationRequest.Description = this.operationalLocationsForm.controls['description'].value;
      this.createLocationRequest.PerformedBy = this.context._customerContext.userName;
      this.createLocationList = []
      this.createLocationList.push(this.createLocationRequest);

      let userEvents: IUserEvents = <IUserEvents>{};
      this.userEventsCalling(userEvents);
      userEvents.ActionName = Actions[Actions.CREATE];

      this.userManagementService.CreateOperationalLocation(this.createLocationRequest, userEvents).subscribe(res => {
        if (res) {
          this.getLocations(true, false);
          const msg = 'Location has been added successfully';
          this.showSucsMsg(msg);
          this.operationalLocationsForm.reset();
          this.descriptionLength = this.descriptionMaxLength;
          this.isaddLocation = false;
          this.addLocationNew = true;
        } else {
          this.showErrorMsg('Unable to add Location');
        }
      }
        , err => {
          this.showErrorMsg(err.statusText);
        });
    } else {
      this.validateAllFormFields(this.operationalLocationsForm);
    }

  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getLocations(isPageLoad: boolean, isSearch: boolean, userEvents?: IUserEvents) {
    if (isPageLoad) {
      this.getLocationRequest.LocationCode = '';
      this.getLocationRequest.LocationName = '';
    }
    else if (isSearch) {
      this.getLocationRequest.LocationCode = this.operationalLocationsForm.controls['location-code'].value;
      this.getLocationRequest.LocationName = this.operationalLocationsForm.controls['location-name'].value;
    }
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 100;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.getLocationRequest.Paging = this.paging;
    this.getLocationRequest.viewFlag = "VIEW";
    this.getLocationRequest.UserId = this.context._customerContext.userId;
    this.getLocationRequest.LoginId = this.context._customerContext.loginId;
    this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getLocationRequest.PerformedBy = this.context._customerContext.userName;
    this.userManagementService.GetOperationalLocations(this.getLocationRequest, userEvents).subscribe(
      res => {
        this.locations = res;
        if (res != null) {
          this.dataLength = this.locations.length;
        }
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength
        }
        else {
          this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
          if (this.endItemNumber > this.dataLength) {
            this.endItemNumber = this.dataLength;
          }
        }
      },
      err => {
        this.showErrorMsg(err.statusText);
      });
  }

  resetClick() {
    this.operationalLocationsForm.reset();
    this.materialscriptService.material();
    this.descriptionLength = this.descriptionMaxLength;
    if (this.isEditClicked) {
      this.onEditClick(this.storedData);
    }

  }

  searchresetClick() {
    this.operationalLocationsForm.reset();
    this.materialscriptService.material();
    this.pageChanged(1);
    this.getLocations(true, false);
  }

  addloc() {
    this.addOperationalLocations = true;
    this.updateOperationalLocations = false;
    this.addLocationNew = false;
    this.isaddLocation = true;
    this.isEditClicked = false;
    this.isAddClicked = true;
    this.operationalLocationsForm.controls['locationcode'].enable(true);
    this.descriptionLength = this.descriptionMaxLength;
    this.operationalLocationsForm.reset();
    this.materialscriptService.material();

  }

  cancel() {
    this.addLocationNew = true;
    this.isaddLocation = false;
    this.isAddClicked = true;
    this.operationalLocationsForm.reset();
    this.materialscriptService.material();
    this.operationalLocationsForm.controls['locationcode'].enable(true);
    this.descriptionLength = this.descriptionMaxLength;
    this.isEditClicked = false;
  }
  searchClick() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCalling(userEvents);
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.getLocations(false, true, userEvents);
    if ((this.operationalLocationsForm.controls['location-name'].value != '' && this.operationalLocationsForm.controls['location-name'].value != null) ||
      (this.operationalLocationsForm.controls['location-code'].value != '' && this.operationalLocationsForm.controls['location-code'].value != null)) {

      let strLocationName: string;
      let strLocationCode: string;

      if (this.operationalLocationsForm.controls['location-name'].value == null)
        strLocationName = "";
      else
        strLocationName = this.operationalLocationsForm.controls['location-name'].value;

      if (this.operationalLocationsForm.controls['location-code'].value == null)
        strLocationCode = "";
      else
        strLocationCode = this.operationalLocationsForm.controls['location-code'].value;

      this.getLocations(false, true, userEvents);
    }
    else {
      this.showErrorMsg('At least 1 field is required');
    }
  }

  onEditClick(locations: IOperationalLocationsResponse) {
    this.updateOperationalLocations = true;
    this.addOperationalLocations = false;
    this.storedData = locations;
    this.isEditClicked = true;
    this.isaddLocation = true;
    this.isAddClicked = false;
    this.addLocationNew = false;
    this.isDisablelocationcode = true;
    if (locations.Description)
      this.descriptionLength = this.descriptionMaxLength - locations.Description.length;
    this.editLocationId = locations.LocationId;
    this.operationalLocationsForm.controls['locationname'].setValue(locations.LocationName);
    this.operationalLocationsForm.controls['locationcode'].setValue(locations.LocationCode);
    this.operationalLocationsForm.controls['description'].setValue(locations.Description);
    this.operationalLocationsForm.controls['locationcode'].disable(true);
    this.materialscriptService.material();

  }

  onUpdateClick() {
    if (this.operationalLocationsForm.valid) {
      this.isEditClicked = false;
      this.createLocationRequest = <IOperationalLocationsRequest>{};
      this.createLocationRequest.LocationId = this.editLocationId;
      this.createLocationRequest.LocationCode = this.operationalLocationsForm.controls['locationcode'].value;
      this.createLocationRequest.LocationName = this.operationalLocationsForm.controls['locationname'].value;
      this.createLocationRequest.Description = this.operationalLocationsForm.controls['description'].value;
      this.createLocationRequest.PerformedBy = this.context._customerContext.userName;
      let userEvents: IUserEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.UPDATE];
      this.userEventsCalling(userEvents);

      this.userManagementService.UpdateOperationalLocation(this.createLocationRequest, userEvents).subscribe(res => {
        if (res) {
          this.getLocations(true, false);
          this.editLocationId = 0;
          this.operationalLocationsForm.reset();
          this.descriptionLength = this.descriptionMaxLength;
          this.isAddClicked = true;
          this.operationalLocationsForm.controls['locationcode'].enable(true);
          this.isaddLocation = false;
          this.addLocationNew = true;
          const msg = 'Location has been updated successfully';
          this.showSucsMsg(msg);
        } else {
          this.showErrorMsg('Unable to update location');
        }
      });
    } else {
      this.validateAllFormFields(this.operationalLocationsForm);
    }

  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }
  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.OPERATIONALLOCATIONS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
}
