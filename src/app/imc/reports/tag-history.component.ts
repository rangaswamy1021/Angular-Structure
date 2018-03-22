import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { DatePipe } from '@angular/common';
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { LookupTypeCodes, ActivitySource, Actions, Features } from "../../shared/constants";
import { ImcReportsService } from "./services/report.service";
import { ItagHistoryRequest } from "./models/taghistoryreportrequest";
import { ItagHistoryResponse } from "./models/taghistoryreportresponse";
import { CommonService } from "../../shared/services/common.service";

import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IOperationalLocationsRequest } from "../../sac/usermanagement/models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";
import { IPaging } from "../../shared/models/paging";
import { DistributionService } from "../distribution/services/distribution.service";
declare var $: any;
@Component({
  selector: 'app-tag-history',
  templateUrl: './tag-history.component.html',
  styleUrls: ['./tag-history.component.scss']
})
export class TagHistoryComponent implements OnInit {
  gridArrowSTATUSENDDATE: boolean;
  gridArrowSTATUSSTARTDATE: boolean;
  gridArrowNAME: boolean;
  gridArrowITEMSTATUS: boolean;
  gridArrowLOCATIONNAME: boolean;
  gridArrowHEXTAGID: boolean;
  gridArrowSERIALNO: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  paging: IPaging;
  tagHistoryRequest: ItagHistoryRequest = <ItagHistoryRequest>{};
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  dropdownResponse: IOperationalLocationsResponse[];
  tagHistoryResponse: ItagHistoryResponse[];
  sessionContextResponse: IUserresponse;
  userEventRequest: IUserEvents = <IUserEvents>{};
  // pattern
  validateHexaPattern = "^[A-Fa-f0-9]+$";
  validatePattern = "[0-9]+$";
  tagHistoryForm: FormGroup;
  searchResultGrid: boolean;
  //for disableing buttons
  btnSearchHistory: boolean;
  //For pagination
  pageItemNumber: number = 10;
  currentPage: number;
  AfterSearch: boolean = false;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  // for key press event
  onlyHexaKey(event) {
    return (event.charCode == 8 || event.charCode == 0) ? null : (event.charCode >= 48 && event.charCode <= 57) || (event.charCode >= 97 && event.charCode <= 102) || (event.charCode >= 65 && event.charCode <= 70);
  }
  constructor(private router: Router,
    private context: SessionService,
    private reportServices: ImcReportsService,
    private commonService: CommonService,
    private distributionServices: DistributionService, private materialscriptService: MaterialscriptService) { }
  //pageload
  ngOnInit() {
    this.gridArrowSTATUSSTARTDATE = true;
    this.sortingColumn = "STATUSSTARTDATE";
    this.materialscriptService.material();
    this.getLocations();
    this.currentPage = 1;
    this.endItemNumber = 10;
    this.tagHistoryForm = new FormGroup({
      'serialNumber': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),
      'hextagNumber': new FormControl('', Validators.compose([Validators.pattern(this.validateHexaPattern)])),
      // 'location': new FormControl(),
    });
    // this.tagHistoryForm.controls.location.setValue("");
    this.btnSearchHistory = !this.commonService.isAllowed(Features[Features.TAGHISTORY], Actions[Actions.SEARCH], "");
    let userevents = this.userEvents();
    userevents.ActionName = Actions[Actions.VIEW];
    this.commonService.checkPrivilegeswithAuditLog(userevents).subscribe(res => { });

    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
  }
  //For pagechange Event
  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.tagHistorySearchPaging(this.currentPage, null);

  }
  //For Search Tag History
  tagHistorySearch() {
    let serialNumber = this.tagHistoryForm.controls["serialNumber"].value;
    let hextagNumber = this.tagHistoryForm.controls["hextagNumber"].value;
    //let location = this.tagHistoryForm.controls["location"].value;
    this.tagHistoryForm.controls["serialNumber"].setValidators([Validators.required, Validators.pattern(this.validatePattern)]);
    if ((serialNumber == "" || serialNumber == null) && (hextagNumber == null || hextagNumber == "")) {
      this.validateAllFormFields(this.tagHistoryForm);
      return;
    }

    let userevents = this.userEvents();
    userevents.ActionName = Actions[Actions.SEARCH];
    this.tagHistorySearchPaging(this.currentPage, userevents);
  }

  tagHistorySearchPaging(currentPage: number, userevents) {
    let serialNumber = this.tagHistoryForm.controls["serialNumber"].value;
    if (serialNumber == null || serialNumber == "") {
      this.tagHistoryForm.controls["serialNumber"].clearValidators();
      this.tagHistoryForm.controls["serialNumber"].reset();
    }
    if (this.tagHistoryForm.valid) {
      this.currentPage = 1;
      this.startItemNumber = 1;
      this.endItemNumber = 10; 
      this.searchResultGrid = true;
      this.tagHistoryRequest.UserId = this.sessionContextResponse.userId;
      this.tagHistoryRequest.LoginId = this.sessionContextResponse.loginId;
      this.tagHistoryRequest.PageNumber = this.currentPage;
      this.tagHistoryRequest.PageSize = this.pageItemNumber;
      this.tagHistoryRequest.SortColumn = this.sortingColumn;
      this.tagHistoryRequest.SortDirection = this.sortingDirection;
      this.tagHistoryRequest.OnSearchClick = true;
      this.tagHistoryRequest.SerialNumber = this.tagHistoryForm.controls['serialNumber'].value;
      this.tagHistoryRequest.HexTagID = this.tagHistoryForm.controls['hextagNumber'].value;
      // this.tagHistoryRequest.LocationId = this.tagHistoryForm.controls['location'].value;
      this.tagHistoryRequest.User = this.sessionContextResponse.userName;
      this.tagHistoryRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      $('#pageloader').modal('show');
      this.searchResultGrid = true;
      this.reportServices.GetTagHistoryReport(this.tagHistoryRequest, userevents).subscribe(
        res => {
          if (res != null) {
            this.tagHistoryResponse = res;
            if (res.length > 0) {
              this.totalRecordCount = this.tagHistoryResponse[0].RecordCount;
              if (this.totalRecordCount < this.pageItemNumber) {
                this.endItemNumber = this.totalRecordCount;
              }
            }
            $('#pageloader').modal('hide');
          } else {
            this.tagHistoryResponse = res;
          }
        }
      );

    } else {
      this.validateAllFormFields(this.tagHistoryForm);
      return;
    }

  }
  // For reset
  tagHistoryReset() {

    this.tagHistoryResponse = null;
    this.searchResultGrid = false;
    this.tagHistoryForm.controls.serialNumber.reset();
    this.tagHistoryForm.controls.hextagNumber.reset();
    this.tagHistoryForm.controls["serialNumber"].setValidators([Validators.required, Validators.pattern(this.validatePattern)]);
    // this.tagHistoryForm.controls.location.reset();
    this.currentPage = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
  }
  //Events
  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.TAGHISTORY];
    this.userEventRequest.ActionName = Actions[Actions.SEARCH];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }
  //For validation
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
  getLocations(userEvents?: IUserEvents) {
    this.getLocationRequest.LocationCode = '';
    this.getLocationRequest.LocationName = '';
    this.paging = <IPaging>{};
    this.paging.PageNumber = 1;
    this.paging.PageSize = 100;
    this.paging.SortColumn = "LOCATIONCODE";
    this.paging.SortDir = 1;
    this.getLocationRequest.Paging = this.paging;
    this.getLocationRequest.viewFlag = "VIEW";
    this.getLocationRequest.UserId = this.context.customerContext.userId;
    this.getLocationRequest.LoginId = this.context.customerContext.loginId;
    this.getLocationRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getLocationRequest.PerformedBy = this.context.customerContext.userName;
    this.distributionServices.getOperationalLocations(this.getLocationRequest, userEvents).subscribe(
      res => {
        this.dropdownResponse = res;
      });
  }

  sortDirection(SortingColumn) {
    this.gridArrowSERIALNO = false;
    this.gridArrowHEXTAGID = false;
    this.gridArrowLOCATIONNAME = false;
    this.gridArrowITEMSTATUS = false;
    this.gridArrowNAME = false;
    this.gridArrowSTATUSSTARTDATE = false;
    this.gridArrowSTATUSENDDATE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "SERIALNO") {
      this.gridArrowSERIALNO = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "HEXTAGID") {
      this.gridArrowHEXTAGID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "LOCATIONNAME") {
      this.gridArrowLOCATIONNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }


    else if (this.sortingColumn == "ITEMSTATUS") {
      this.gridArrowITEMSTATUS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }


    else if (this.sortingColumn == "NAME") {
      this.gridArrowNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }


    else if (this.sortingColumn == "STATUSSTARTDATE") {
      this.gridArrowSTATUSSTARTDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "STATUSENDDATE") {
      this.gridArrowSTATUSENDDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.tagHistorySearchPaging(this.currentPage, null);
  }


}
