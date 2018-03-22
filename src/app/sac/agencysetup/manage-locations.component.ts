import { Component, OnInit } from '@angular/core';
import { ILocationRequest } from './models/locationrequest';
import { AgencySetupService } from './services/agencysetup.service';
import { SessionService } from '../../shared/services/session.service';
import { ILocationResponse } from './models/locationresponse';
import { IPaging } from '../../shared/models/paging';
import { ActivitySource, Features, Actions } from '../../shared/constants';
import { debug } from 'util';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from '../../shared/models/userevents';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-locations',
  templateUrl: './manage-locations.component.html',
  styleUrls: ['./manage-locations.component.scss']
})
export class ManageLocationsComponent implements OnInit {
  paging: IPaging;
  p: number;
  locations: ILocationResponse[];
  pageNumber: number = 1;
  getLocationRequest: ILocationRequest = <ILocationRequest>{};
  createLocation: ILocationRequest = <ILocationRequest>{};
  createLocationList: ILocationRequest[] = [];
  manageLocations: FormGroup;
  isaddLocation: boolean = false;
  isAddClicked: boolean;
  isDisablelocationcode: boolean;
  descriptionMaxLength: number = 255;
  descriptionLength: number = this.descriptionMaxLength;
  isEditClicked: boolean;
  editLocationId: number;
  disableCButton: boolean = false;
  disableUButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  active: boolean;
  activer: boolean;
  constructor(private agencysetupService: AgencySetupService, private commonService: CommonService, private context: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }

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
    this.materialscriptService.material();
    this.getLocations(true, false);
    this.isAddClicked = true;
    this.isEditClicked = false;
    this.manageLocations = new FormGroup({
      'locationname': new FormControl('', [Validators.required]),
      'locationcode': new FormControl('', [Validators.required]),
      'location-name': new FormControl(''),
      'location-code': new FormControl(''),
      'description': new FormControl('', [Validators.required]),
      'active': new FormControl(''),
      'activer': new FormControl('')
    });
    this.disableCButton = !this.commonService.isAllowed(Features[Features.LOCATIONS], Actions[Actions.CREATE], "");
    this.disableUButton = !this.commonService.isAllowed(Features[Features.LOCATIONS], Actions[Actions.UPDATE], "");
  }

  calculateLength(event: any) {
    this.descriptionLength = 255 - event.target.value.length
  }

  checkActive(checked: boolean) {
    this.active = checked;
  }

  checkActive1(checked: boolean) {
    this.activer = checked;
  }

  addLocation() {
    this.locationadd();
  }

  locationadd() {
    if (this.manageLocations.valid) {
      this.createLocation = <ILocationRequest>{};
      this.createLocation.LocationName = this.manageLocations.controls['locationname'].value;
      this.createLocation.LocationCode = this.manageLocations.controls['locationcode'].value;
      this.createLocation.Description = this.manageLocations.controls['description'].value;
      this.createLocation.PerformedBy = this.context._customerContext.userName;
      this.createLocation.isOwned = this.manageLocations.controls['active'].value;
      this.createLocation.isNonRevenue = this.manageLocations.controls['activer'].value;
      this.createLocationList = []
      this.createLocationList.push(this.createLocation);
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.LOCATIONS];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.agencysetupService.CreateLocation(this.createLocationList, userEvents).subscribe(res => {
        if (res) {
          this.getLocations(true, false);
          const msg = 'Location has been added successfully';
          this.showSucsMsg(msg);
          this.manageLocations.reset();
          this.descriptionLength = this.descriptionMaxLength;
          this.isaddLocation = false;
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());

      });
    } else {
      this.validateAllFormFields(this.manageLocations);
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

  getLocations(isPageLoad: boolean, isSearch: boolean) {
    if (isPageLoad) {
      this.getLocationRequest.LocationCode = '';
      this.getLocationRequest.LocationName = '';
    }
    else if (isSearch) {
      this.getLocationRequest.LocationCode = this.manageLocations.controls['location-code'].value;
      this.getLocationRequest.LocationName = this.manageLocations.controls['location-name'].value;
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
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.LOCATIONS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;
    this.agencysetupService.GetLocation(this.getLocationRequest, userEvents).subscribe(
      res => {
        this.locations = res;
        console.log(this.locations);
        this.dataLength = this.locations.length;
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength
        }
        else {
          this.endItemNumber = this.pageItemNumber;
        }
      });
  }

  resetClick() {
    this.manageLocations.reset();
    this.descriptionLength = this.descriptionMaxLength;
  }

  searchresetClick() {
    this.manageLocations.reset();
    this.getLocations(true, false);
  }

  addloc() {
    this.materialscriptService.material();
    this.isaddLocation = true;
    this.isEditClicked = false;
  }

  cancel() {
    this.isaddLocation = false;
    this.isAddClicked = true;
    this.manageLocations.reset();
    this.manageLocations.controls['locationcode'].enable(true);
    this.descriptionLength = this.descriptionMaxLength;
  }
  searchClick() {
    if ((this.manageLocations.controls['location-name'].value != '' && this.manageLocations.controls['location-name'].value != null) ||
      (this.manageLocations.controls['location-code'].value != '' && this.manageLocations.controls['location-code'].value != null)) {

      let strLocationName: string;
      let strLocationCode: string;

      if (this.manageLocations.controls['location-name'].value == null)
        strLocationName = "";
      else
        strLocationName = this.manageLocations.controls['location-name'].value;

      if (this.manageLocations.controls['location-code'].value == null)
        strLocationCode = "";
      else
        strLocationCode = this.manageLocations.controls['location-code'].value;

      this.getLocations(false, true);
    }
    else {
      this.showErrorMsg('At least 1 field is required');
    }
  }

  onEditClick(locations: ILocationResponse) {
    this.isEditClicked = true;
    this.isaddLocation = true;
    this.isAddClicked = false;
    this.isDisablelocationcode = true;
    if (locations.Description)
      this.descriptionLength = this.descriptionMaxLength - locations.Description.length;
    this.editLocationId = locations.LocationId;
    this.manageLocations.controls['locationname'].setValue(locations.LocationName);
    this.manageLocations.controls['locationcode'].setValue(locations.LocationCode);
    this.manageLocations.controls['description'].setValue(locations.Description);
    this.manageLocations.controls['locationcode'].disable(true);
    this.manageLocations.controls['active'].setValue(locations.isOwned);
    this.manageLocations.controls['activer'].setValue(locations.isNonRevenue);
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }

  onUpdateClick() {
    if (this.manageLocations.controls['locationname'].value != "" || this.manageLocations.controls['description'].value != "") {
      this.createLocation = <ILocationRequest>{};
      this.createLocation.LocationId = this.editLocationId;
      this.createLocation.LocationCode = this.manageLocations.controls['locationcode'].value;
      this.createLocation.LocationName = this.manageLocations.controls['locationname'].value;
      this.createLocation.Description = this.manageLocations.controls['description'].value;
      this.createLocation.isOwned = this.manageLocations.controls['active'].value;
      this.createLocation.isNonRevenue = this.manageLocations.controls['activer'].value;
      this.createLocation.PerformedBy = this.context._customerContext.userName;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.LOCATIONS];
      userEvents.ActionName = Actions[Actions.UPDATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.agencysetupService.UpdateLocation(this.createLocation, userEvents).subscribe(res => {
        if (res) {
          this.getLocations(true, false);
          this.editLocationId = 0;
          this.manageLocations.reset();
          this.descriptionLength = this.descriptionMaxLength;
          this.isAddClicked = true;
          this.manageLocations.controls['locationcode'].enable(true);
          this.isaddLocation = false;
          const msg = 'Location has been updated successfully';
          this.showSucsMsg(msg);
        } else {
          this.showErrorMsg('Unable to update location');
        }
      });
    } else {
      this.validateAllFormFields(this.manageLocations);
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
}
