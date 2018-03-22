import { ActivitySource, Features, Actions } from './../../shared/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from './../../shared/services/session.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AgencySetupService } from './services/agencysetup.service';
import { IAgencyResponse } from './models/agencyresponse';
import { IAgencyRequest } from './models/agencyrequest';
import { IPaging } from './../../shared/models/paging';
import { Component, OnInit } from '@angular/core';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-manage-agency',
  templateUrl: './manage-agency.component.html',
  styleUrls: ['./manage-agency.component.scss']
})
export class ManageAgencyComponent implements OnInit {
  msg: string;
  showAction: boolean;
  errorBlock: boolean;
  errorMessage: string;
  successBlock: boolean;
  successMessage: string;
  agencyId: number;
  startDate: Date;
  endDate: Date;
  manageAgencyReq: IAgencyRequest;
  manageAgencyResp: IAgencyResponse[];
  Paging: IPaging;
  isParentCheck: boolean = false;
  pageNumber: number = 1;
  // pageItemNumber: number = 10;
  // startItemNumber: number = 1;
  // endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  manageAgency: FormGroup;
  isSearch: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  constructor(private agencySetupService: AgencySetupService, private context: SessionService, private router: Router, private route: ActivatedRoute, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.manageAgency = new FormGroup({
      'agencycode': new FormControl(''),
      'agencyname': new FormControl('')
    });
    this.getManageAgencyDetails();


    this.route.queryParams.subscribe(param => {
      if (param["flag"] == "1" || param["flag"] == "3")
        this.showMsg("success", "Agency details has been added successfully");
      else if (param["flag"] == "2" || param["flag"] == "4")
        this.showMsg("success", "Agency details has been updated successfully");
    });

  }
  //paging
  p: number;
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
  getManageAgencyDetails() {
    this.manageAgencyReq = <IAgencyRequest>{};
    this.manageAgencyReq.AgencyCode = this.manageAgency.controls['agencycode'].value;
    this.manageAgencyReq.AgencyName = this.manageAgency.controls['agencyname'].value;
    this.manageAgencyReq.Paging = <IPaging>{};

    this.manageAgencyReq.Paging.PageNumber = this.pageNumber;
    this.manageAgencyReq.Paging.PageSize = 100;
    this.manageAgencyReq.Paging.SortDir = 1;
    this.manageAgencyReq.LoginId = this.context._customerContext.loginId;

    this.manageAgencyReq.UserId = this.context._customerContext.userId;
    if (this.isSearch) {
      this.manageAgencyReq.viewFlag = "SEARCH";
      this.manageAgencyReq.Paging.SortColumn = "AgencyId";
    } else {
      this.manageAgencyReq.viewFlag = "";
      this.manageAgencyReq.Paging.SortColumn = "";
    }

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGENCY];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    this.agencySetupService.getAgencies(this.manageAgencyReq, userEvents).subscribe(
      res => {
        this.manageAgencyResp = res;
        if (this.manageAgencyResp) {
          this.dataLength = this.manageAgencyResp[0].RecordCount;
          if (this.dataLength < this.pageItemNumber) {
            this.endItemNumber = this.dataLength
          }
          else {
            this.endItemNumber = this.pageItemNumber;
          }
          console.log("CSR Relation has been updated successfully" + this.manageAgencyResp);
        } else {
          console.log("error");
        }
      });
  }


  searchClick() {
    this.isSearch = true;
    this.manageAgencyReq.AgencyCode = this.manageAgency.controls['agencycode'].value;
    this.manageAgencyReq.AgencyName = this.manageAgency.controls['agencyname'].value;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGENCY];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;
    if (this.manageAgencyReq.AgencyCode == '' && this.manageAgencyReq.AgencyName == '' || this.manageAgencyReq.AgencyCode == null && this.manageAgencyReq.AgencyName == null) {
      // this.errorBlock = true;
      // this.errorMessage = "Agency Code or Angecy Name is required";
      this.showErrorMsg('Agency Code or Angecy Name is required');
    } else {
      this.getManageAgencyDetails();
    }
  }
  addNewAgency() {
    this.router.navigateByUrl('/sac/agencysetup/agency-registration');
  }

  onEditClick(agencyId) {
    this.router.navigate(['/sac/agencysetup/agency-registration'], { queryParams: { id: agencyId } });
   
}

  deleteClick(agency) {
    $('#confirm-dialog').modal('show');
    this.agencyId = agency.AgencyId;
    this.startDate = agency.StartEffectiveDate;
    this.endDate = agency.EndEffectiveDate;
    this.showAction = agency.IsActive;
    console.log("SHOW ACTION" + this.showAction);
  }

  confirmClick() {
    this.manageAgencyReq = <IAgencyRequest>{};
    this.manageAgencyReq.AgencyId = this.agencyId;

    this.manageAgencyReq.UpdatedUser = this.context._customerContext.userName;

    this.manageAgencyReq.LoginId = this.context._customerContext.loginId;
    this.manageAgencyReq.UserId = this.context._customerContext.userId;
    this.manageAgencyReq.PerformedBy = this.context._customerContext.userName;
    this.manageAgencyReq.ActivitySource = ActivitySource.Internal;
    if (this.showAction == true) {
      this.manageAgencyReq.IsActive = false;
      this.manageAgencyReq.StartEffectiveDate = this.startDate;
      this.manageAgencyReq.EndEffectiveDate = new Date();
    } else {
      this.manageAgencyReq.IsActive = true;
      this.manageAgencyReq.StartEffectiveDate = new Date();
      this.manageAgencyReq.EndEffectiveDate = new Date();
      this.manageAgencyReq.EndEffectiveDate.setFullYear(parseInt(this.manageAgencyReq.StartEffectiveDate.getUTCFullYear().toString()) + 50);

    }
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.AGENCY];
    userEvents.ActionName = Actions[Actions.DEACTIVATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.context._customerContext.roleID);
    userEvents.UserName = this.context._customerContext.userName;
    userEvents.LoginId = this.context._customerContext.loginId;

    $('#confirm-dialog').modal('hide');
    this.agencySetupService.activateAgency(this.manageAgencyReq, userEvents).subscribe(res => {
      if (res) {
        if (this.manageAgencyReq.IsActive) {
          this.msg = 'Agency has been Activated successfully';
        }
        else {
          this.msg = 'Agency has been Deactivated successfully';
        }
        this.showSucsMsg(this.msg);
        this.getManageAgencyDetails();
      }
    });
  }

  resetClick() {
    this.manageAgency.reset();
    this.successBlock = false;
    this.errorBlock = false;
    this.getManageAgencyDetails();
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

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }
}
