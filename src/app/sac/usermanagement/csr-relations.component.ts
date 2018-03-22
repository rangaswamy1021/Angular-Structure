import { ICSRRelationsRequest } from './../../shared/models/csrrelationsrequest';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ICSRRelationsResponse } from './../../shared/models/csrrelationsresponse';
import { UserManagementService } from './services/usermanagement.service';
import { Component, OnInit } from '@angular/core';
import { IPaging } from "../../shared/models/paging";
import { IUserEvents } from '../../shared/models/userevents';
import { ActivitySource, Features, Actions } from '../../shared/constants';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-csr-relations',
  templateUrl: './csr-relations.component.html',
  styleUrls: ['./csr-relations.component.scss']
})
export class CsrRelationsComponent implements OnInit {
  usersdropdown: any;
  csrResp: ICSRRelationsResponse[];
  csrReq: ICSRRelationsRequest;
  csrRelation: FormGroup;
  Paging: IPaging;
  isParentCheck: boolean = false;
  // pageNumber: number = 1;
  // pageItemNumber: number = 10;
  // startItemNumber: number = 1;
  // endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  isEditClicked: boolean;
  isAddClicked: boolean;
  isDeleteClicked: boolean;
  isDisableDropDown: boolean;
  validateNumberPattern = "[0-9]*"
  // errorMessage: string;
  // errorBlock: boolean = false;
  // successBlock: boolean = false;
  // successMessage: string;
  isCsrRelation: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disableCButton: boolean = false;
  disableUButton: boolean = false;
  disableDButton: boolean = false;
  constructor(private userManagementService: UserManagementService, private commonService: CommonService, private context: SessionService, private router: Router,private materialscriptService: MaterialscriptService) {

  }

  ngOnInit() {
    this.materialscriptService.material();
    
    this.getDropdownValues();
    this.getCsrRelation();
    this.isEditClicked = false;
    this.isDeleteClicked = false;
    this.isAddClicked = true;

    this.csrRelation = new FormGroup({
      'usersdropdown': new FormControl('', [Validators.required]),
      'accountno': new FormControl('', Validators.compose([Validators.pattern(this.validateNumberPattern), Validators.maxLength(500)])),
      'serialno': new FormControl('', Validators.compose([Validators.pattern(this.validateNumberPattern), Validators.maxLength(500)])),
      'vehicleplate': new FormControl('', [Validators.required, Validators.maxLength(500)]),
    });

    
    this.disableCButton = !this.commonService.isAllowed(Features[Features.CSRRELATIONS], Actions[Actions.CREATE], "");
    this.disableUButton = !this.commonService.isAllowed(Features[Features.CSRRELATIONS], Actions[Actions.UPDATE], "");
    this.disableDButton = !this.commonService.isAllowed(Features[Features.CSRRELATIONS], Actions[Actions.UPDATE], "");
    
  }

  addcsr() {
    this.isCsrRelation = true;
    this.isEditClicked = false;
    this.isDeleteClicked = false;
    this.isAddClicked = true;
    this.isDisableDropDown = false;
    // this.successBlock = false;
    // this.errorBlock = false;

    this.csrRelation.controls['usersdropdown'].setValue("");
    this.csrRelation.controls['accountno'].setValue("");
    this.csrRelation.controls['serialno'].setValue("");
    this.csrRelation.controls['vehicleplate'].setValue("");

  }

  cancelcsr() {
    this.csrRelation.reset();
    this.isCsrRelation = false;
    // this.successBlock = false;
    // this.errorBlock = false;
    this.isAddClicked = true;
    this.materialscriptService.material();
  }



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
  getDropdownValues() {

    console.log("dropdown----");

    this.userManagementService.getInternalUsers().subscribe(
      res => {
        this.usersdropdown = res;
        console.log("dropdown----" + this.usersdropdown);
      }
    );
  }


  addCsrRelation() {
    this.csrReq = <ICSRRelationsRequest>{};
    if (this.csrRelation.controls['accountno'].value != "" || this.csrRelation.controls['serialno'].value != "" || this.csrRelation.controls['vehicleplate'].value != "") {
      this.csrReq.InternalUserId = this.csrRelation.controls['usersdropdown'].value;
      this.csrReq.CustomerIds = this.csrRelation.controls['accountno'].value;
      this.csrReq.TagIds = this.csrRelation.controls['serialno'].value;
      this.csrReq.VehicleNumbers = this.csrRelation.controls['vehicleplate'].value;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.CSRRELATIONS];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.context._customerContext.roleID);
      userEvents.UserName = this.context._customerContext.userName;
      userEvents.LoginId = this.context._customerContext.loginId;

      this.userManagementService.addCsrRelation(this.csrReq, userEvents)
        .subscribe(res => {
          if (res) {
            this.getCsrRelation();
            this.cancelcsr();
            // this.successBlock = true;
            // this.successMessage = "CSR Relation has been added successfully";
            const msg = 'CSR Relation has been added successfully';
            this.showSucsMsg(msg);
          } else {
            // this.errorBlock = true;
            // this.errorMessage = "Unable to add CSR relation";
            this.showErrorMsg('Unable to add CSR relation');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
  
        });
    } else {
      // this.errorBlock = true;
      // this.errorMessage = "One of them should be filled in Account(s) or Serials(s) or Vehicle Plate(s) ";
      this.showErrorMsg('One of them should be filled in Account(s) or Serials(s) or Vehicle Plate(s)');
    }
  }




  onEditClick(csrResp: ICSRRelationsResponse) {
    this.isEditClicked = true;
    this.isDeleteClicked = false;
    this.isDisableDropDown = true;
    this.isCsrRelation = true;


    this.isAddClicked = false;
    this.csrRelation.controls['usersdropdown'].setValue(csrResp.InternalUserId);
    this.csrRelation.controls['accountno'].setValue(csrResp.CustomerIds);
    this.csrRelation.controls['serialno'].setValue(csrResp.TagIds);
    this.csrRelation.controls['vehicleplate'].setValue(csrResp.VehicleNumbers);
  }

  onDeleteClick(csrResp: ICSRRelationsResponse) {
    this.isEditClicked = false;
    this.isDeleteClicked = true;
    this.isDisableDropDown = true;
    this.isCsrRelation = true;

    debugger
    this.isAddClicked = false;
    this.csrRelation.controls['usersdropdown'].setValue(csrResp.InternalUserId);
    this.csrRelation.controls['accountno'].setValue(csrResp.CustomerIds);
    this.csrRelation.controls['serialno'].setValue(csrResp.TagIds);
    this.csrRelation.controls['vehicleplate'].setValue(csrResp.VehicleNumbers);
  }

  onUpdateClick() {
    this.csrReq = <ICSRRelationsRequest>{};
    this.csrReq.InternalUserId = this.csrRelation.controls['usersdropdown'].value;
    this.csrReq.CustomerIds = this.csrRelation.controls['accountno'].value;
    this.csrReq.TagIds = this.csrRelation.controls['serialno'].value;
    this.csrReq.VehicleNumbers = this.csrRelation.controls['vehicleplate'].value;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CSRRELATIONS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;
    this.userManagementService.updateCsrRelation(this.csrReq, userEvents)
      .subscribe(res => {
        if (res) {
          this.getCsrRelation();
          this.cancelcsr();
          // this.successBlock = true;
          // this.successMessage = "CSR Relation has been updated successfully";
          const msg = 'CSR Relation has been updated successfully';
          this.showSucsMsg(msg);
        } else {
          // this.errorBlock = true;
          // this.errorMessage = "Unable to update CSR relation";
          this.showErrorMsg('Unable to update CSR relation');
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());

      });

  }

  OnDeleteCSR() {
    this.csrReq = <ICSRRelationsRequest>{};
    this.csrReq.InternalUserId = this.csrRelation.controls['usersdropdown'].value;
    this.csrReq.CustomerIds = this.csrRelation.controls['accountno'].value;
    this.csrReq.TagIds = this.csrRelation.controls['serialno'].value;
    this.csrReq.VehicleNumbers = this.csrRelation.controls['vehicleplate'].value;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CSRRELATIONS];
    userEvents.ActionName = Actions[Actions.DELETE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;
    this.userManagementService.deleteCsrRelation(this.csrReq, userEvents)
      .subscribe(res => {
        if (res) {
          this.cancelcsr();
          this.getCsrRelation();
          // this.successBlock = true;
          // this.successMessage = "CSR Relation has been Deleted successfully";
          const msg = 'CSR Relation has been Deleted successfully';
          this.showSucsMsg(msg);
        } else {
          // this.errorBlock = true;
          // this.errorMessage = "Unable to delete CSR relation";
          this.showErrorMsg('Unable to delete CSR relation');
        }
      });

  }

  getCsrRelation() {
    this.csrReq = <ICSRRelationsRequest>{};
    this.csrReq.Paging = <IPaging>{};
    this.csrReq.Paging.PageNumber = 1;
    this.csrReq.Paging.PageSize = 1000;
    this.csrReq.Paging.SortColumn = "CUSTOMERID";
    this.csrReq.Paging.SortDir = 1;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CSRRELATIONS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

      this.userManagementService.getCsrRelation(this.csrReq,userEvents).subscribe(
        res => {
          this.csrResp = res;
          this.dataLength = this.csrResp.length;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
        });

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
