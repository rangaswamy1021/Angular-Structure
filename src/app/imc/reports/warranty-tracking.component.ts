import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { IInventoryRequest } from "./models/inventoryrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { ImcReportsService } from "./services/report.service";
import { customDateFormatPipe } from "../../shared/pipes/convert-date.pipe";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IOperationalLocationsRequest } from "../../sac/usermanagement/models/operationallocationsrequest";
import { IOperationalLocationsResponse } from "../../sac/usermanagement/models/operationallocationsresponse";
import { IPaging } from "../../shared/models/paging";
import { DistributionService } from "../distribution/services/distribution.service";

@Component({
  selector: 'app-warranty-tracking',
  templateUrl: './warranty-tracking.component.html',
  styleUrls: ['./warranty-tracking.component.scss']
})
export class WarrantyTrackingComponent implements OnInit {
  paging: IPaging;
  getLocationRequest: IOperationalLocationsRequest = <IOperationalLocationsRequest>{};
  dropdownResponse: IOperationalLocationsResponse[];
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  disableSearchButton: boolean = false;
  userEventRequest: IUserEvents = <IUserEvents>{};
  serialNumber: any;
  warrantyEndDate: string;
  WarrantyEndDate: Date;
  location:string;
  warrantyStatusValue: any;
  todayDate = new Date();
  warrantyReportResponse: any;
  warrantyTrackingForm: FormGroup;
  searchResults: boolean = false;
  validatePattern = "^[0-9]+$";

  constructor(private context: SessionService,
    private router: Router,
    private commonService: CommonService,
    private sessionContext: SessionService,
    private ImcReportsService: ImcReportsService,
    private customDateFormatPipe: customDateFormatPipe,
    private distributionServices: DistributionService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.getLocations();
    this.warrantyTrackingForm = new FormGroup({
      'serial': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern)])),
      'location': new FormControl('')
    });

    this.userEventRequest.FeatureName = Features[Features.WARRANTYTRACKINGREPORT];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.commonService.checkPrivilegeswithAuditLog(this.userEventRequest).subscribe(res => {
    });
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.WARRANTYTRACKINGREPORT], Actions[Actions.SEARCH], "");
  }


  getSearchResults() {
    if (!this.warrantyTrackingForm.valid) {
      this.validateAllFormFields(this.warrantyTrackingForm);
      return;
    }
    else {
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.SEARCH];

      this.getWarrantyEndDate(true, userevents);
    }
  }

  resetClick() {
    this.warrantyReportResponse = false;
    this.searchResults = false;
    this.warrantyTrackingForm.reset();
  }


  getWarrantyEndDate(strSearchFlag, userevents) {
    this.searchResults = false;
    let warrantyReportRequest: IInventoryRequest = <IInventoryRequest>{}
    warrantyReportRequest.SerialNumber = this.warrantyTrackingForm.controls['serial'].value;
    warrantyReportRequest.LocationId=this.warrantyTrackingForm.controls['location'].value;
    warrantyReportRequest.UserId = this.context.customerContext.loginId;
    warrantyReportRequest.LoginId = this.context.customerContext.userId;
    warrantyReportRequest.User = this.context.customerContext.userName;
    warrantyReportRequest.SearchFlag = strSearchFlag;
    warrantyReportRequest.ActivitySource = ActivitySource.Internal.toString();

    this.ImcReportsService.getWarrantyEndDate(warrantyReportRequest, userevents).subscribe(
      res => {
        if (res) {
          this.searchResults = true;
          this.warrantyReportResponse = res;
          this.serialNumber = this.warrantyReportResponse.SerialNumber;
          this.location=this.warrantyReportResponse.Location;
          this.warrantyEndDate = this.customDateFormatPipe.transform(this.warrantyReportResponse.WarrantyEndDate.toString());
          this.WarrantyEndDate = new Date(this.warrantyEndDate);
          if (this.WarrantyEndDate >= this.todayDate) {
            this.warrantyStatusValue = "Under warranty";
          }
          else {
            this.warrantyStatusValue = "Out of warranty";
          }
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = "Invalid Serial #";
          return;
        }
      }, (err) => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        return;
      }
    )
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
    this.userEventRequest.FeatureName = Features[Features.WARRANTYTRACKINGREPORT];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
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
        //   console.log("response get", res);
      });
  }



}