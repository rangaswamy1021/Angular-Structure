import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features } from '../../shared/constants';
import { IPaging } from '../../shared/models/paging';
import { ILaneRequest } from './models/lanerequest';
import { CommonService } from '../../shared/services/common.service';
import { ICommonResponse } from '../../shared/models/commonresponse';
import { AgencySetupService } from './services/agencysetup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-lanes',
  templateUrl: './manage-lanes.component.html',
  styleUrls: ['./manage-lanes.component.scss']
})
export class ManageLanesComponent implements OnInit {
  constructor(private agencySetupService: AgencySetupService, private commonService: CommonService, private sessionContext: SessionService, private router: Router, private materialscriptService: MaterialscriptService) { }

  sessionContextResponse: IUserresponse;
  lanesSearchForm: FormGroup;
  lanesAddBlockForm: FormGroup;
  descriptionMaxLength: number = 255;
  descriptionLength: number = this.descriptionMaxLength;
  isVisibleAddLane: boolean = false;
  isVisibleEditLink: boolean = true;
  addButtonText: string = "Add";
  bindCommand: string = "Add";
  addBlockHeaderText: string = "Lane Details";
  laneIdPrevious: number = 0;
  laneCodePrevious: string = "";
  pageNumber: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  locations = [];
  plazas = [];
  plazasAddBlock = [];
  laneTypes = [];
  laneDirections = [];
  lanesResponseArray: any[] = [];
  laneSearchRequest: ILaneRequest = <ILaneRequest>{};
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateAlphNemericsandSpacePattern = "[a-zA-Z0-9]+([ ][a-zA-Z0-9]+)*";
  disableSearchButton: boolean;
  disableCreateButton: boolean;
  disableUpdateButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.lanesSearchForm = new FormGroup({
      locationSelected: new FormControl('', Validators.required),
      plazaSelected: new FormControl('')
    });

    this.lanesAddBlockForm = new FormGroup({
      aLocationSelected: new FormControl('', Validators.required),
      aPlazaSelected: new FormControl('', Validators.required),
      laneCode: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern(this.validateAlphaNumericsPattern)]),
      laneName: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
      laneTypeSelected: new FormControl('', Validators.required),
      laneDirectionSelected: new FormControl('', Validators.required),
      laneDescription: new FormControl('', [Validators.required, Validators.maxLength(this.descriptionMaxLength), Validators.pattern(this.validateAlphNemericsandSpacePattern)]),
      laneStatusSelected: new FormControl('', Validators.required),
    });

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.LANES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    // bind locations
    this.commonService.getLocations(userEvents).subscribe(res => { this.locations = res });
    this.bindLaneTypes();
    this.bindLaneDirections();
    this.laneSearchRequest.LocationCode = "";
    this.laneSearchRequest.PlazaCode = "";
    this.bindLanes(0, Actions[Actions.VIEW], "");
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.LANES], Actions[Actions.SEARCH], "");
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.LANES], Actions[Actions.CREATE], "");
    console.log(this.disableCreateButton);
    console.log(this.commonService.isAllowed(Features[Features.LANES], Actions[Actions.CREATE], ""));
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.LANES], Actions[Actions.UPDATE], "");
  }

  showAddNewLane() {
    this.isVisibleAddLane = true;
    this.lanesAddBlockFormClear();
  }

  bindLaneTypes() {
    let lookuptype = <ICommonResponse>{};
    lookuptype.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.LaneTypes];
    this.commonService.getLookUpByParentLookupTypeCode(lookuptype).subscribe(
      res => {
        this.laneTypes = res;
      });
  }

  bindLaneDirections() {
    let lookuptype = <ICommonResponse>{};
    lookuptype.LookUpTypeCode = LookupTypeCodes[LookupTypeCodes.LaneDirections];
    this.commonService.getLookUpByParentLookupTypeCode(lookuptype).subscribe(
      res => {
        this.laneDirections = res;
      });
  }

  locationChanged() {
    if (this.lanesSearchForm.controls["locationSelected"].valid) {
      this.commonService.getPlazaDropDown(this.lanesSearchForm.value.locationSelected).subscribe(res => this.plazas = res);
    }
    else
      this.plazas = [];
    this.isVisibleAddLane = false;
    this.lanesSearchForm.controls["plazaSelected"].setValue('');
  }

  searchLanes() {
    if (this.lanesSearchForm.valid) {
      this.isVisibleAddLane = false;
      this.pageNumber = 1;
      this.startItemNumber = 1;
      this.endItemNumber = this.pageItemNumber;
      this.laneSearchRequest.LocationCode = this.lanesSearchForm.value.locationSelected;
      this.laneSearchRequest.PlazaCode = this.lanesSearchForm.value.plazaSelected;
      this.bindLanes(1, Actions[Actions.SEARCH], Actions[Actions.SEARCH]);
    }
    else {
      this.validateAllFormFields(this.lanesSearchForm);
    }
  }

  searchReset() {
    this.isVisibleAddLane = false;
    this.lanesSearchForm.reset();
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.laneSearchRequest.LocationCode = "";
    this.laneSearchRequest.PlazaCode = "";
    this.lanesSearchForm.controls["locationSelected"].setValue("");
    this.lanesSearchForm.controls["plazaSelected"].setValue("");
    this.plazas = [];
    this.bindLanes(0, "", "");
  }

  pageChanged(event) {
    this.isVisibleAddLane = false;
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bindLanes(0, "", "");
  }

  bindLanes(flag: number, viewFlag: string, action: string) {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.pageNumber;
    paging.PageSize = this.pageItemNumber;
    paging.SortColumn = "LANECODE";
    paging.SortDir = 1;
    this.laneSearchRequest.Paging = paging;
    this.laneSearchRequest.Flag = flag;
    this.laneSearchRequest.viewFlag = viewFlag;
    this.laneSearchRequest.UserId = this.sessionContextResponse.userId;
    this.laneSearchRequest.LoginId = this.sessionContextResponse.loginId;
    this.laneSearchRequest.PerformedBy = this.sessionContextResponse.userName;

    let userEvents: IUserEvents;
    if (action) {
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.LANES];
      userEvents.ActionName = action;
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
    }

    this.agencySetupService.getLanes(this.laneSearchRequest, userEvents).subscribe(res => {
      this.lanesResponseArray = res;
      console.log(this.lanesResponseArray);
      if (this.lanesResponseArray && this.lanesResponseArray.length > 0) {
        this.totalRecordCount = this.lanesResponseArray[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = err.statusText;
    });
  }

  locationChangedAddBlock() {
    this.lanesAddBlockForm.controls["aPlazaSelected"].setValue('');
    if (this.lanesAddBlockForm.controls["aLocationSelected"].valid) {
      this.getPlazasAddBlock(this.lanesAddBlockForm.value.aLocationSelected);
    }
    else
      this.plazasAddBlock = [];
  }

  getPlazasAddBlock(locationCode: string) {
    this.commonService.getPlazaDropDown(locationCode).subscribe(res => this.plazasAddBlock = res);
  }

  calculateLength(event: any) {
    this.descriptionLength = 255 - event.target.value.length
  }

  bindLaneDetails(laneId: number) {
    this.lanesAddBlockFormClear();
    this.addButtonText = "Update";
    this.bindCommand = "Update";
    this.addBlockHeaderText = "Update Lane Details";
    this.laneIdPrevious = laneId;
    this.enableDisableLaneCode(false);
    this.getLaneDetailsById();
    this.isVisibleAddLane = true;
    this.materialscriptService.material();
  }

  enableDisableLaneCode(isEnable: boolean) {
    const ctrl = this.lanesAddBlockForm.get('laneCode');
    if (isEnable)
      ctrl.enable();
    else
      ctrl.disable();
  }

  getLaneDetailsById() {
    this.agencySetupService.getLaneById(this.laneIdPrevious).subscribe(res => {
      console.log(res);
      if (res) {
        this.getPlazasAddBlock(res.LocationCode);
        this.lanesAddBlockForm.setValue({
          aLocationSelected: res.LocationCode,
          aPlazaSelected: res.PlazaCode,
          laneCode: res.LaneCode,
          laneName: res.LaneName,
          laneTypeSelected: res.LaneType,
          laneDirectionSelected: res.Direction,
          laneDescription: res.Description,
          laneStatusSelected: res.LaneStatus,
        });
        this.laneCodePrevious = res.LaneCode;
        if (this.lanesAddBlockForm.value.laneDescription)
          this.descriptionLength = this.descriptionMaxLength - this.lanesAddBlockForm.value.laneDescription.length;
      }
      this.materialscriptService.material();
    });
  }

  addLane() {
    if (this.lanesAddBlockForm.valid) {
      let laneRequest: ILaneRequest = <ILaneRequest>{};
      laneRequest.LocationCode = this.lanesAddBlockForm.value.aLocationSelected;
      laneRequest.PlazaCode = this.lanesAddBlockForm.value.aPlazaSelected;
      laneRequest.LaneName = this.lanesAddBlockForm.value.laneName.trim();
      laneRequest.LaneType = this.lanesAddBlockForm.value.laneTypeSelected;
      laneRequest.Direction = this.lanesAddBlockForm.value.laneDirectionSelected;
      laneRequest.Description = this.lanesAddBlockForm.value.laneDescription.trim();
      laneRequest.LaneStatus = this.lanesAddBlockForm.value.laneStatusSelected;
      laneRequest.UserId = this.sessionContextResponse.userId;
      laneRequest.LoginId = this.sessionContextResponse.loginId;
      laneRequest.PerformedBy = this.sessionContextResponse.userName;
      laneRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      console.log(laneRequest);

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.LANES];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      switch (this.bindCommand) {
        case "Add":
          laneRequest.LaneCode = this.lanesAddBlockForm.value.laneCode.trim();
          let lanesRequestArray: ILaneRequest[] = [];
          lanesRequestArray.push(laneRequest);

          userEvents.ActionName = Actions[Actions.CREATE];
          this.agencySetupService.createLane(lanesRequestArray, userEvents).subscribe(res => {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Lane has been added successfully";
            this.isVisibleAddLane = false;
            this.lanesSearchForm.reset();
            this.lanesSearchForm.controls["locationSelected"].setValue("");
            this.lanesSearchForm.controls["plazaSelected"].setValue("");
            this.pageNumber = 1;
            this.startItemNumber = 1;
            this.endItemNumber = this.pageItemNumber;
            this.laneSearchRequest.LocationCode = this.lanesSearchForm.value.locationSelected;
            this.laneSearchRequest.PlazaCode = this.lanesSearchForm.value.plazaSelected;
            this.bindLanes(0, "", "");
            this.lanesAddBlockFormClear();
          }, err => {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = err.statusText;
          });
          break;
        case "Update":
          laneRequest.LaneId = this.laneIdPrevious;
          laneRequest.LaneCode = this.laneCodePrevious;
          userEvents.ActionName = Actions[Actions.UPDATE];
          this.agencySetupService.updateLane(laneRequest, userEvents).subscribe(res => {
            this.msgFlag = true;
            this.msgType = 'success';
            this.msgDesc = "Lane has been updated successfully";
            this.isVisibleAddLane = false;
            this.bindLanes(0, "", "");
            this.lanesAddBlockFormClear();
          }, err => {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = err.statusText;
          });
          break;
        default:
          break;
      }
    }
    else
      this.validateAllFormFields(this.lanesAddBlockForm);
  }

  resetAddBlock() {
    if (this.bindCommand == "Update") {
      this.getLaneDetailsById();
    }
    else {
      this.lanesAddBlockFormClear();
    }
  }

  lanesAddBlockFormClear() {
    this.lanesAddBlockForm.reset();
    this.addButtonText = "Add";
    this.bindCommand = "Add";
    this.addBlockHeaderText = "Lane Details";
    this.enableDisableLaneCode(true);
    this.lanesAddBlockForm.controls["aLocationSelected"].setValue("");
    this.plazasAddBlock = [];
    this.lanesAddBlockForm.controls["aPlazaSelected"].setValue("");
    this.lanesAddBlockForm.controls["laneTypeSelected"].setValue("");
    this.lanesAddBlockForm.controls["laneDirectionSelected"].setValue("");
    this.lanesAddBlockForm.controls["laneStatusSelected"].setValue("");
    this.laneIdPrevious = 0;
    this.laneCodePrevious = "";
    this.descriptionLength = this.descriptionMaxLength;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }
}
