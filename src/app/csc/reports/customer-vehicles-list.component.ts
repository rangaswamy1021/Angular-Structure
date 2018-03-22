import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { DatePipe } from '@angular/common';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { Router } from "@angular/router";
import { CSCReportsService } from "./services/reports.service";
import { LookupTypeCodes, ActivitySource, Actions, Features } from "../../shared/constants";
import { IVehicleRequest } from "../../vehicles/models/vehiclecrequest";
import { IVehicleResponse } from "../../vehicles/models/vehicleresponse";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-customer-vehicles-list',
  templateUrl: './customer-vehicles-list.component.html',
  styleUrls: ['./customer-vehicles-list.component.scss']
})
export class CustomerVehiclesListComponent implements OnInit {
  gridArrowENDEFFECTIVEDATE: boolean;
  gridArrowSTARTEFFECTIVEDATE: boolean;
  gridArrowCOUNTRYNAME: boolean;
  gridArrowSTATENAME: boolean;
  gridArrowCOLOR: boolean;
  gridArrowMODEL: boolean;
  gridArrowMAKE: boolean;
  gridArrowYEAR: boolean;
  gridArrowVEHICLENUMBER: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  customerVehiclesListRequest: IVehicleRequest = <IVehicleRequest>{};
  customerVehiclesListResponse: IVehicleResponse[];
  userEventRequest:IUserEvents=<IUserEvents>{};
  sessionContextResponse: IUserresponse;
  objSystemActivities: ISystemActivities;
  validatePattern = "[0-9]+$";
   vechicleListForm: FormGroup;
    activitySource: any;
    sessionContext: any;
    AccountId: number;
    userId: number;
    loginId: number;
    searchResultGrid: boolean;
    userName: string;
  //For pagination
  pageItemNumber: number = 10;
  currentPage: number;
  AfterSearch: boolean = false;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
   //for disableing buttons
 btnSearchHistory:boolean;


  constructor(private context: SessionService, 
  private router: Router, 
  private reportServices: CSCReportsService,
  private commonService:CommonService, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sortingColumn='VEHICLENUMBER';
    this.materialscriptService.material();
   this.currentPage = 1;
    this.endItemNumber = 10;
     this.sessionContextResponse = this.context.customerContext
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
     this.vechicleListForm = new FormGroup({
      'accountNumber': new FormControl('', Validators.compose([
        Validators.required, Validators.pattern(this.validatePattern)])),

    });
    this.btnSearchHistory=!this.commonService.isAllowed(Features[Features.VEHICLELIST], Actions[Actions.SEARCH],"");
    let userevents = this.userEvents();
    userevents.ActionName = Actions[Actions.VIEW];
    this.commonService.checkPrivilegeswithAuditLog(userevents).subscribe(res => { });
    

  }
  //For pagechange Event
  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
      this.vechiclesListSearchPagining(this.currentPage,null);
  }

  vechiclesListSearch(){
    this.currentPage = 1;
    this.startItemNumber=1;
    this.endItemNumber = 10;
    let userevents = this.userEvents();
  userevents.ActionName = Actions[Actions.SEARCH];
    this.vechiclesListSearchPagining(this.currentPage,userevents);
  }

//For vechicleListSearch
  vechiclesListSearchPagining(currentPage: number,userevents) {
    if (this.vechicleListForm.invalid) {
      this.validateAllFormFields(this.vechicleListForm);
    }
    else {
      this.customerVehiclesListRequest.ActivitySource = ActivitySource.Internal;
      this.AccountId = this.vechicleListForm.controls["accountNumber"].value;
      this.customerVehiclesListRequest.UserName = this.sessionContextResponse.userName;
      this.customerVehiclesListRequest.UserId = this.sessionContextResponse.userId;
      this.customerVehiclesListRequest.LoginId = this.sessionContextResponse.loginId;
      this.customerVehiclesListRequest.PageNumber =this.currentPage;
      this.customerVehiclesListRequest.PageSize = this.pageItemNumber;
      this.customerVehiclesListRequest.SortColumn = this.sortingColumn;
      this.customerVehiclesListRequest.SortDirection = this.sortingDirection ;
      this.customerVehiclesListRequest.VehicleSearchActivityInd = true;
      this.reportServices.GetVehiclesByAccountId(this.AccountId, this.customerVehiclesListRequest,userevents).subscribe(
        res => {
          this.customerVehiclesListResponse = res;
          this.searchResultGrid = true;
          if (res) {
            this.totalRecordCount = this.customerVehiclesListResponse[0].RecordCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }

        });

    }
  }
  //For Reset
  vechiclesListReset() {
    this.searchResultGrid = false;
    this.vechicleListForm.controls.accountNumber.reset();
    this.currentPage=1;
     this.startItemNumber = 1;
    this.endItemNumber = 10;
   
  }
  //Events
userEvents(): IUserEvents {
this.userEventRequest.FeatureName = Features[Features.VEHICLELIST];
this.userEventRequest.ActionName = Actions[Actions.SEARCH];
this.userEventRequest.PageName = this.router.url;
this.userEventRequest.CustomerId = 0;
this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
this.userEventRequest.UserName = this.context.customerContext.userName;
this.userEventRequest.LoginId = this.context.customerContext.loginId;
return this.userEventRequest;
}
  //Form checking
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




  sortDirection(SortingColumn) {
    this.gridArrowVEHICLENUMBER = false;
    this.gridArrowYEAR = false;
    this.gridArrowMAKE = false;
    this.gridArrowMODEL = false;
    this.gridArrowCOLOR = false;
    this.gridArrowSTATENAME = false;
    this.gridArrowCOUNTRYNAME = false;
    this.gridArrowSTARTEFFECTIVEDATE = false;
    this.gridArrowENDEFFECTIVEDATE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "VEHICLENUMBER") {
      this.gridArrowVEHICLENUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "YEAR") {
      this.gridArrowYEAR = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "MAKE") {
      this.gridArrowMAKE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "MODEL") {
      this.gridArrowMODEL = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "COLOR") {
      this.gridArrowCOLOR = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "STATENAME") {
      this.gridArrowSTATENAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "COUNTRYNAME") {
      this.gridArrowCOUNTRYNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "STARTEFFECTIVEDATE") {
      this.gridArrowSTARTEFFECTIVEDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ENDEFFECTIVEDATE") {
      this.gridArrowENDEFFECTIVEDATE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
this.vechiclesListSearch();
  }




}
