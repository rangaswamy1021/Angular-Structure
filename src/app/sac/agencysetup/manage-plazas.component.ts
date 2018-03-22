import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from "../../shared/services/session.service";
import { Router, ActivatedRoute } from '@angular/router';
import { IUserresponse } from "../../shared/models/userresponse";
import { AgencySetupService } from "./services/agencysetup.service";
import { IPlazaRequest } from "./models/plazasrequest";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Actions, ActivitySource, Features } from "../../shared/constants";
import { IPaging } from "../../shared/models/paging";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-plazas',
  templateUrl: './manage-plazas.component.html',
  styleUrls: ['./manage-plazas.component.scss']
})
export class ManagePlazasComponent implements OnInit {
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowPRICEMODE: boolean;
  gridArrowLOCATIONNAME: boolean;
  gridArrowAGENCYNAME: boolean;
  gridArrowPLAZANAME: boolean;
  gridArrowPLAZACODE: boolean;
  sessionContextResponse: IUserresponse;
  pageItemNumber: number = 10;
  plazaResponse: IPlazaRequest[] = [];
  agencys: any[];
  locations: any[];
  dataLength: number = this.plazaResponse.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number = 1;
  isDisabledSearch: boolean = false;
  isDisabledAdd: boolean = false;
  isDisabledUpdate: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  plazaForm: FormGroup;
  constructor(private commonService: CommonService, private route: ActivatedRoute, private sessionService: SessionService, private router: Router, private agencySetupService: AgencySetupService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.gridArrowPLAZACODE = true;
    this.sortingColumn = "PLAZACODE";
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.BindDropDowns();
    this.loadVioSearchForm();
    this.getPlazaDeatils(1, Actions[Actions.VIEW]);
    this.route.queryParams.subscribe(param => {
      if (param["flag"] == "1")
        this.showMsg("success", "Plaza details has been added successfully");
      else if (param["flag"] == "2")
        this.showMsg("success", "Plaza details has been updated successfully");
    });
    this.isDisabledSearch = !this.commonService.isAllowed(Features[Features.PLAZAS], Actions[Actions.SEARCH], "");
    this.isDisabledAdd = !this.commonService.isAllowed(Features[Features.PLAZAS], Actions[Actions.CREATE], "");
    this.isDisabledUpdate = !this.commonService.isAllowed(Features[Features.PLAZAS], Actions[Actions.UPDATE], "");
  }

  BindDropDowns() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.PLAZAS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.agencySetupService.GetAgencies(userEvents).subscribe(res => {
      this.agencys = res;
    });
    this.agencySetupService.GetLocations().subscribe(res => {
      this.locations = res;
    });
  };

  loadVioSearchForm() {
    this.plazaForm = new FormGroup({
      'agency': new FormControl('', []),
      'location': new FormControl('', []),
      'plazaCode': new FormControl('', []),
      'plazaName': new FormControl('', [])
    });
  }

  plazaDetailsPageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
    { this.endItemNumber = this.dataLength; }
    this.getPlazaDeatils(this.p, "");
  }

  serachPlazas() {
    this.getPlazaDeatils(1, Actions[Actions.SEARCH]);
  }

  resetClick() {
    this.loadVioSearchForm();
    this.getPlazaDeatils(this.p, "");
  }

  createPlazas() {
    this.router.navigate(["sac/agencysetup/plaza-registration"]);
  }

  getPlazaDeatils(pageNo: number, strViewFlag: string) {
    if (strViewFlag == Actions[Actions.SEARCH]) {
      if (this.plazaForm.valid) {
        if (!this.plazaForm.controls['agency'].value &&
          !this.plazaForm.controls['location'].value &&
          !this.plazaForm.controls['plazaCode'].value &&
          !this.plazaForm.controls['plazaName'].value) {
          this.showMsg("error", "At least 1 field is required");
          return;
        }
        else {
          this.getPlazaDetails(pageNo, strViewFlag);
        }
      }
    }
    else {
      this.getPlazaDetails(pageNo, strViewFlag);
    }
    this.msgFlag = false;
  }

  getPlazaDetails(pageNo: number, strViewFlag: string) {
    const objIPlazaRequest: IPlazaRequest = <IPlazaRequest>{};
    let paging: IPaging = <IPaging>{};
    if (strViewFlag == Actions[Actions.SEARCH]) {
      objIPlazaRequest.AgencyCode = this.plazaForm.controls['agency'].value;
      objIPlazaRequest.LocationCode = this.plazaForm.controls['location'].value;
      objIPlazaRequest.PlazaCode = this.plazaForm.controls['plazaCode'].value;
      objIPlazaRequest.PlazaName = this.plazaForm.controls['plazaName'].value;
    }
    objIPlazaRequest.viewFlag = strViewFlag;
    objIPlazaRequest.UserId = this.sessionContextResponse.userId;
    objIPlazaRequest.LoginId = this.sessionContextResponse.loginId;
    objIPlazaRequest.ActivitySource = ActivitySource.Internal;
    objIPlazaRequest.PerformedBy = this.sessionContextResponse.userName;

    paging.PageSize = 10;
    paging.PageNumber = pageNo;
    paging.SortDir = this.sortingDirection == false ? 1 : 0;
    paging.SortColumn = this.sortingColumn;
    objIPlazaRequest.Paging = paging;
    this.p = pageNo;

    console.log(objIPlazaRequest);
    this.agencySetupService.GetPlaza(objIPlazaRequest).subscribe(res => {
      this.plazaResponse = res;

      if (this.plazaResponse && this.plazaResponse.length > 0) {
        this.dataLength = this.plazaResponse[0].RecordCount;
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength;
        } else {
          this.endItemNumber = this.pageItemNumber;
        }
      }
    });
  }

  editClick(plazaId) {
    this.router.navigate(["sac/agencysetup/plaza-registration"], { queryParams: { plazaId: plazaId } });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }

  sortDirection(SortingColumn) {
    this.gridArrowPLAZACODE = false;
    this.gridArrowPLAZANAME = false;
    this.gridArrowPRICEMODE = false;
    this.gridArrowLOCATIONNAME = false;
    this.gridArrowAGENCYNAME = false;



    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "PLAZACODE") {
      this.gridArrowPLAZACODE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "PLAZANAME") {
      this.gridArrowPLAZANAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "PRICEMODE") {
      this.gridArrowPRICEMODE = true;
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
    else if (this.sortingColumn == "AGENCYNAME") {
      this.gridArrowAGENCYNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    this.getPlazaDeatils(this.p, "");
  }
}
