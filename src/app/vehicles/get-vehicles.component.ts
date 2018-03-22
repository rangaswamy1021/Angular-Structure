import { Component, OnInit, Renderer, Input, ElementRef, ViewChild } from '@angular/core';
import { IVehicleResponse } from './models/vehicleresponse';
import { ISearchVehicle } from './models/vehiclecrequest';
import { VehicleService } from './services/vehicle.services';
import { Router } from '@angular/router';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { IUserresponse } from '../shared/models/userresponse';
import { SessionService } from '../shared/services/session.service';
import { ICustomerResponse } from '../shared/models/customerresponse';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { UserType } from './constants';
import { IUserEvents } from '../shared/models/userevents';
import { Features, Actions } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';
import { MaterialscriptService } from "../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-get-vehicles',
  templateUrl: './get-vehicles.component.html',
  styleUrls: ['./get-vehicles.component.css']
})

export class GetVehiclesComponent implements OnInit {
  vContractType: any;
  vNumber: any;
  vStatus: any;
  searchClick: boolean;
  vehicles: IVehicleResponse[];
  searchVehicle: ISearchVehicle;
  isAddVehicle: boolean = false;
  isUpdateVehicle: boolean = false;
  isDeleteVehicle: boolean = false;
  vehicleHistory: IVehicleResponse[]
  accountIdContext: number;
  objConfirm: any;
  //statusMessage: string;
  //successHeading: string;
  //errorHeading: string;
  // errorMessage: string;
  //successBlock: boolean = false;
  //errorBlock: boolean = false;

  msgFlag: boolean = false;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  // Customer Context
  objICustomerContextResponse: ICustomerContextResponse;

  //set this value to true if business customer 
  isBusinessCustomer: boolean = false;

  //Set this valaue to false if componenet is using in create account
  isManageVehicle: boolean = true;

  // Seetings for create account
  isCreateAccount: boolean = false;

  isUpdateCustomerAccount: boolean = false;

  //User log in details 
  sessionContextResponse: IUserresponse

  @Input() accountID;
  @Input() isBusinessCust;
  @Input() isManageVeh;
  @Input() isCreateAcc;
  @Input() isTagRequired;

  // Paging start
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = 10;
  totalRecordCount: number;

  ngModelVehicleId: number;
  ngModelOperation: number;
  userEvents: IUserEvents;
  disableaddButton: boolean = false;
  disableupdateButton: boolean = false;
  disabledeleteButton: boolean = false;
  disableHistoryButton: boolean;
  //@ViewChild('SuccessMessage') public SuccessMessage: ElementRef
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.searchClick) {
      this.bindVehicleGridView(true, this.vStatus, this.vContractType, this.vNumber, this.p);
    }
    else {
      this.bindVehicleGridView(false, '', '', '', this.p);
    }


  }

  constructor(private vehicleService: VehicleService, public renderer: Renderer, private router: Router,
    private customerContextService: CustomerContextService
    , private sessionService: SessionService,
    private customerAccountsService: CustomerAccountsService,
    private commonService: CommonService,
    private materialscriptService: MaterialscriptService
  ) {
  }

  ngOnInit() {
    this.p = 1;

    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    if (this.isCreateAcc) {
      this.isManageVehicle = this.isManageVeh;
      this.isCreateAccount = this.isCreateAcc;
      this.accountIdContext = this.accountID;
      this.isUpdateCustomerAccount = true;
      this.isAddVehicle = true;
    }
    else {
      this.isManageVehicle = true;
      this.isCreateAccount = false;
      this.customerContextService.currentContext.subscribe(customerContext => { this.objICustomerContextResponse = customerContext; });
      if (this.objICustomerContextResponse == undefined) {
        // Go to advance search if no customer context
        let link = ['csc/search/advance-csc-search'];
        this.router.navigate(link);
        return;
      }
      else {

        // if (this.objICustomerContextResponse.ParentId > 0)
        //   this.accountIdContext = this.objICustomerContextResponse.ParentId;
        // else
        this.accountIdContext = this.objICustomerContextResponse.AccountId;
        //  console.log(this.objICustomerContextResponse.AccountId);
      }
      this.isAddVehicle = false;
      this.insertUserAction();
      this.disableaddButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.CREATE], this.objICustomerContextResponse.AccountStatus);
      this.disableupdateButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.UPDATE], this.objICustomerContextResponse.AccountStatus);
      this.disabledeleteButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.DELETE], this.objICustomerContextResponse.AccountStatus);
      this.disableHistoryButton = !this.commonService.isAllowed(Features[Features.VEHICLES], Actions[Actions.HISTORY], this.objICustomerContextResponse.AccountStatus);
    }
    this.bindVehicleGridView(false, '', '', '', this.p);
    this.populateCustomerDetails();
  }
  addButtonclick() {
    this.isAddVehicle = true;
  }

  // Edit Click
  displayoff(VehicleID: number) {
    this.isDeleteVehicle = false;
    this.isAddVehicle = false;
    this.isUpdateVehicle = true;
    this.ngModelVehicleId = VehicleID;
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 1000);
    // console.log("this.ngModelVehicleId-" + this.ngModelVehicleId);
  }

  deactivateVehicle() {
    this.isUpdateVehicle = false;
    this.isAddVehicle = false;
    this.isDeleteVehicle = true;
    this.ngModelVehicleId = this.objConfirm.VehicleId;
    this.ngModelOperation = 2;
  }

  deleteVehicle() {
    this.isAddVehicle = false;
    this.isUpdateVehicle = false;
    this.isDeleteVehicle = true;
    this.ngModelVehicleId = this.objConfirm.VehicleId;
    this.ngModelOperation = 1;
  }

  userAction(event) {
    if (event) {
      if (this.ngModelOperation == 1) {
        this.deleteVehicle();
      }
      else if (this.ngModelOperation == 2) {
        this.deactivateVehicle();
      }
    }
  }

  approveDiactivate(selectedRow) {
    this.materialscriptService.material();
    this.ngModelOperation = 2;
    this.objConfirm = selectedRow;
    this.msgFlag = true;
    this.msgType = 'alert'
    this.msgDesc = "Are you sure you want to deactivate this vehicle ?";
  }

  approveDelete(selectedRow) {
    this.ngModelOperation = 1;
    this.objConfirm = selectedRow;
    this.msgFlag = true;
    this.msgType = 'alert'
    this.msgDesc = "Are you sure you want to delete this vehicle ?";
  }

  viewHistory(VehicleID: number) {
    this.searchVehicle = <ISearchVehicle>{};
    this.searchVehicle.vehicleNumber = "";
    this.searchVehicle.SortColumn = "HISTID";
    this.searchVehicle.SortDirection = true;
    this.searchVehicle.PageNumber = 1;
    this.searchVehicle.PageSize = 10;
    this.searchVehicle.accountId = this.accountIdContext;
    this.searchVehicle.VehicleId = VehicleID;
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.HISTORY];
    this.vehicleService.getVehicleHistory(this.searchVehicle, ).subscribe(
      res => {
        this.vehicleHistory = res;
        console.log(res);
      });
  }

  onCreateClicked(message: string): void {
    this.searchClick = false;
    let temp = message.split(',');
    if (temp[0] == "1") {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgDesc = temp[1];
      this.isAddVehicle = false;
      this.bindVehicleGridView(false, '', '', '', this.p);
      // this.successBlock = true;
      // this.statusMessage = temp[1];

    }
    else if (temp[0] == "2") {
      // this.errorBlock = true;
      // this.errorMessage = temp[1];
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = temp[1];
      this.isAddVehicle = true;
    }
    else {
      // this.successBlock = this.errorBlock = false;
    }
  }

  onUploadClicked(message: string): void {
    this.searchClick = false;
    let temp = message.split(',');
    if (temp[0] == "1") {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgDesc = temp[1];
      this.p=1;
      this.startItemNumber=1;
      this.endItemNumber=10;
      this.bindVehicleGridView(false, '', '', '', this.p);
      //this.successBlock = true;
      //this.statusMessage = temp[1];
    }
    else {
      //this.errorBlock = true;
      //this.errorMessage = temp[1];
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = temp[1];
    }

  }
  onCancelClicked(status: boolean): void {
    this.searchClick = false;
    this.isAddVehicle = status;
    // this.successBlock = this.errorBlock = false;
  }
  onEditClicked(status: string) {
    this.searchClick = false;
    let temp = status.split(',');
    if (temp[0] == '1') {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgDesc = temp[1];
      this.bindVehicleGridView(false, '', '', '', this.p);
      this.isAddVehicle = false;
      this.isDeleteVehicle = false;
      this.isUpdateVehicle = false;
      //this.successBlock = true;
      //this.statusMessage = temp[1];
    }
    else if (temp[0] == '2') {
      this.isAddVehicle = true;
      this.isDeleteVehicle = false;
      this.isUpdateVehicle = true;
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = temp[1];
      // this.errorBlock = true;
      // this.errorMessage = temp[1];
    }
    else {
      // this.successBlock = this.errorBlock = false;
    }
  }

  onEditCancelClicked(status: boolean): void {
    this.isUpdateVehicle = status;
  }

  onDeactivateClicked(status: string) {
    let temp = status.split(',');
    this.searchClick = false;
    if (temp[0] == "1") {
      this.msgFlag = true;
      this.msgType = 'success'
      this.msgDesc = temp[1];

      this.bindVehicleGridView(false, '', '', '', this.p);
      this.isAddVehicle = false;
      this.isDeleteVehicle = false;
      this.isUpdateVehicle = false;
      // this.successBlock = true;
      // this.statusMessage = temp[1];
    }
    else {
      this.isDeleteVehicle = true;
      this.isAddVehicle = false;
      this.isUpdateVehicle = false;
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = temp[1];
      // this.errorBlock = true;
      //this.errorMessage = temp[1];
    }
  }

  onDeactivateCancelClicked(status: boolean): void {
    this.isDeleteVehicle = status;
  }
  onSearchClicked(searchObject: any): void {
    // this.successBlock = false;
    if (searchObject.isSearched) {
      this.searchClick = true;
      this.vStatus = searchObject.vehicleStatus;
      this.vNumber = searchObject.vehicleNumber;
      this.vContractType = searchObject.contractType;
      this.p=1;
      this.startItemNumber=1;
      this.endItemNumber=10;
      this.bindVehicleGridView(true, searchObject.vehicleStatus, searchObject.contractType, searchObject.vehicleNumber, this.p);
    }
    else {
      this.searchClick = false;
      this.bindVehicleGridView(false, searchObject.vehicleStatus, searchObject.contractType, searchObject.vehicleNumber, this.p);
    }
    this.viewHistory(0);
  }
  populateCustomerDetails() {
    var customerResponse: ICustomerResponse;
    this.customerAccountsService.getAccountDetailsById(this.accountIdContext).subscribe(res => {
      customerResponse = res;
      if (res) {
        //console.log("UserType.Business.toString()" + UserType.Business.toString())
        // console.log("customerResponse.UserType " + customerResponse.UserType)
        if (customerResponse.UserType.toString() == UserType[UserType.Business]) {
          this.isBusinessCustomer = true;
        }
        else {
          this.isBusinessCustomer = false;
        }
      }
    });
  }


  bindVehicleGridView(isSearch: boolean, vehicleStatus: string, contractualType: string, plateNumber: string, PageNumber: number) {
    this.searchVehicle = <ISearchVehicle>{};

    if (isSearch) {
      this.setUserActionObject();
    
      this.searchVehicle.VehicleStatus = vehicleStatus;
      this.searchVehicle.ContractType = contractualType;
      this.searchVehicle.vehicleNumber = plateNumber;
    }
    else {
      this.userEvents = null;
    }
   // this.searchVehicle.vehicleNumber = "";
    this.searchVehicle.SortColumn = "VEHICLENUMBER";
    this.searchVehicle.SortDirection = true;
    this.searchVehicle.PageNumber = PageNumber;
    this.searchVehicle.PageSize = 10;
    this.searchVehicle.accountId = this.accountIdContext;
    this.vehicleService.getVehicles(this.searchVehicle, this.userEvents).subscribe(
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
  // insert the user action 
  insertUserAction() {
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.commonService.checkPrivilegeswithAuditLog(this.userEvents).subscribe();
  }
  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.FeatureName = Features[Features.VEHICLES];
    this.userEvents.ActionName = Actions[Actions.SEARCH];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.accountIdContext;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}


