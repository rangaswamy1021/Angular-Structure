import { Component, OnInit, Renderer } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ISearchVehicle } from '../../vehicles/models/vehiclecrequest';
import { VehicleService } from '../../vehicles/services/vehicle.services';
import { IVehicleResponse } from '../../vehicles/models/vehicleresponse';
import { IUserEvents } from '../../shared/models/userevents';
import { Features, Actions } from '../../shared/constants';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-vehicles',
  templateUrl: './manage-vehicles.component.html',
  styleUrls: ['./manage-vehicles.component.scss']
})
export class ManageVehiclesComponent implements OnInit {
  gridArrowEndEffectiveDate: boolean;
  gridArrowStartEffectiveDate: boolean;
  gridArrowVehicleStatus: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowVEHICLENUMBER: boolean;

  sessionContextResponse: IUserresponse;
  iviolatorContextResponse: IViolatorContextResponse;
  violatorId: number = 0;
  isManageVehicle: boolean = true;
  isTagRequired: boolean = false;
  isBusinessCustomer: boolean = false;
  isCreateAccount: boolean = false;
  searchVehicleForm: FormGroup;

  searchVehicle: ISearchVehicle;
  vehicles: IVehicleResponse[];
  vehicleHistory: IVehicleResponse[];

  vehicleNumber: string;
  status: string;

  errorBlock = false;
  errorHeading: string;
  errorMessage: string;
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  isbothFeildEmpty: boolean = false;

  userEvents: IUserEvents;
  isHistoryAllowed: boolean;
  isSearchAllowed: boolean;

  // Paging start
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bindVehicleGridView(this.p, '', '', false);
  }


  constructor(public renderer: Renderer, private router: Router, private commonService: CommonService,
    private sessionService: SessionService,
    private materialscriptService: MaterialscriptService,
    private violatordetailsService: ViolatordetailsService,
    private violatorContextService: ViolatorContextService,
    private vehicleService: VehicleService,
  ) {


  }

  ngOnInit() {
     this.materialscriptService.material();
    this.gridArrowVEHICLENUMBER = true;
    this.sortingColumn = "VEHICLENUMBER";
    this.p = 1;
    this.endItemNumber=10;
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.violatorContextService.currentContext
      .subscribe(customerContext => { this.iviolatorContextResponse = customerContext; }
      );
    if (this.iviolatorContextResponse && this.iviolatorContextResponse.accountId > 0) {

      this.violatorId = this.iviolatorContextResponse.accountId;
      //alert(this.iviolatorContextResponse.accountId);
    }
    if (this.violatorId == 0) {
      let link = ['tvc/search/violation-search'];
      this.router.navigate(link);
    }
    this.bindFormControl();
    //  this.violatorId = 10258786;
    this.setUserActionObject();
    this.bindVehicleGridView(this.p, '', '', true,this.userEvents);
    this.isSearchAllowed = !this.commonService.isAllowed(Features[Features.TVCVEHICLES], Actions[Actions.SEARCH], "");
    this.isHistoryAllowed = !this.commonService.isAllowed(Features[Features.TVCVEHICLES], Actions[Actions.HISTORY], "");
  }

  seacrhClick() {
    let temp = this.anyOneValue();
    if (!temp) {
      this.isbothFeildEmpty = false;
      this.endItemNumber=10;
      this.setUserActionObject();
      this.userEvents.ActionName=Actions[Actions.SEARCH];
      this.bindVehicleGridView(this.p, this.searchVehicleForm.value.pltNumber, this.searchVehicleForm.value.pltStatus, false,this.userEvents);
      return false;
    }
    else {
      this.isbothFeildEmpty = true;
      // this.errorBlock = true;
      // this.errorHeading = "Invalid search";
      this.errorMessage = "At least 1 field is required";
      return;
    }

  }

  resetClick() {
    this.vehicleHistory = null;
    this.isbothFeildEmpty = false;
    this.bindVehicleGridView(this.p, this.searchVehicleForm.value.pltNumber, this.searchVehicleForm.value.pltStatus, true);
    this.searchVehicleForm.patchValue({
      pltNumber: "",
      pltStatus: "",
    });
    return false;
  }
  exit() {
    this.violatorContextService.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);
  }

  goToAccountSummary() {
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }
  viewHistory(VehicleID: number) {
    this.searchVehicle = <ISearchVehicle>{};
    this.searchVehicle.vehicleNumber = "";
    this.searchVehicle.SortColumn = "HISTID";
    this.searchVehicle.SortDirection = true;
    this.searchVehicle.PageNumber = 1;
    this.searchVehicle.PageSize = 10;
    this.searchVehicle.accountId = this.violatorId;
    this.searchVehicle.VehicleId = VehicleID;
    this.setUserActionObject();
    this.userEvents.ActionName=Actions[Actions.HISTORY];
    this.vehicleService.getVehicleHistory(this.searchVehicle,this.userEvents).subscribe(
      res => {
        this.vehicleHistory = res;
        console.log(res);
      });
  }

  bindVehicleGridView(PageNumber: number, vehicleNumber: string, vehicleStatus: string, isReset: boolean,userEvent?:IUserEvents) {
    this.searchVehicle = <ISearchVehicle>{};
    this.searchVehicle.vehicleNumber = "";
    this.searchVehicle.SortColumn =  this.sortingColumn;
    this.searchVehicle.SortDirection = this.sortingDirection == true ? true : false;
    this.searchVehicle.PageNumber = PageNumber;
    this.searchVehicle.PageSize = 10;
    this.searchVehicle.accountId = this.violatorId;
    if (!isReset) {
      this.searchVehicle.VehicleStatus = vehicleStatus;
      this.searchVehicle.vehicleNumber = vehicleNumber;
    }
    this.vehicleService.getVehicles(this.searchVehicle,userEvent).subscribe(
      res => {
        if (res) {
          this.vehicles = res;
          this.totalRecordCount = this.vehicles[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
        else {
          this.vehicles = null
        }
      });
  }
  anyOneValue(): boolean {
    return (this.searchVehicleForm.controls["pltNumber"].value.trim() == ''
      && this.searchVehicleForm.controls["pltStatus"].value.trim() == ''
    )
  }

  bindFormControl() {
    this.searchVehicleForm = new FormGroup({
      'pltNumber': new FormControl('', [Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateAlphaNumericsPattern)]),
      'pltStatus': new FormControl('')
    });
  }

  checkField() {
    if (this.searchVehicleForm.controls["pltNumber"].value.trim() == '' && this.searchVehicleForm.controls["pltStatus"].value.trim() == '')
      this.isbothFeildEmpty = true;
    else this.isbothFeildEmpty = false;
  }

  checkFieldOnchange() {
    if (this.searchVehicleForm.controls["pltNumber"].value.trim() != '' || this.searchVehicleForm.controls["pltStatus"].value.trim() != '')
      this.isbothFeildEmpty = false;
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.TVCVEHICLES];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.violatorId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  sortDirection(SortingColumn) {
    this.gridArrowVEHICLENUMBER = false;
    this.gridArrowVehicleStatus = false;
    this.gridArrowStartEffectiveDate = false;
    this.gridArrowEndEffectiveDate = false;



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

    else if (this.sortingColumn == "VehicleStatus") {
      this.gridArrowVehicleStatus = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "StartEffectiveDate") {
      this.gridArrowStartEffectiveDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "EndEffectiveDate") {
      this.gridArrowEndEffectiveDate = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
    this.bindVehicleGridView(this.p, '', '', false);
  }
}
