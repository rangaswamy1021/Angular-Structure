import { IUserEvents } from './../../shared/models/userevents';
import { IPayAdvanceTollResponse } from './../../csc/search/models/payadvancetollsresponse';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, Features } from './../../shared/constants';
import { SessionService } from './../../shared/services/session.service';
import { IUserresponse } from './../../shared/models/userresponse';
import { TollScheduleService } from './services/tollschedule.service';
import { IPaging } from './../../shared/models/paging';
import { ITollScheduleRequest } from './models/tollschedulesrequest';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-manage-toll-schedules',
  templateUrl: './manage-toll-schedules.component.html',
  styleUrls: ['./manage-toll-schedules.component.scss']
})
export class ManageTollSchedulesComponent implements OnInit {
  gridArrowTRANSACTIONTYPE: boolean;
  gridArrowENTRYLANEDIRECTION: boolean;
  gridArrowENTRYLANETYPE: boolean;
  gridArrowENTRYPLAZACODE: boolean;
  gridArrowSCHEDULETYPE: boolean;
  gridArrowENDEFFECTIVEDATE: boolean;
  gridArrowSTARTEFFECTIVEDATE: boolean;
  gridArrowTOLLSCHEDULEHDRDESC: boolean;
  sortingColumn: string;
  sortingDirection: boolean;
  activeStatus: any;
  tollSchedules: IPayAdvanceTollResponse[];
  tollScheduleRequest: ITollScheduleRequest;
  sessionContextResponse: IUserresponse;
  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  isDisabled: boolean = false;
  previewVisible: boolean = false;

  constructor(private materialscriptService: MaterialscriptService, private tollService: TollScheduleService, private sessionContext: SessionService, private router: Router) { }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getAllTollSchedules(this.p);
  }
  ngOnInit() {
    this.p = 1;
    this.endItemNumber = 10;
    this.gridArrowSTARTEFFECTIVEDATE = true;
    this.sortingColumn = "STARTEFFECTIVEDATE";
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.getAllTollSchedules(this.p);
  }

  getAllTollSchedules(pageNumber: number) {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TOLLSCHEDULES];
    userEvents.SubFeatureName = "";
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.tollScheduleRequest = <ITollScheduleRequest>{};
    this.tollScheduleRequest.LoginId = this.sessionContextResponse.loginId;
    this.tollScheduleRequest.UserId = this.sessionContextResponse.userId;
    this.tollScheduleRequest.PerformedBy = this.sessionContextResponse.userName;
    this.tollScheduleRequest.ViewFlag = Actions[Actions.VIEW];
    this.tollScheduleRequest.Paging = <IPaging>{};
    this.tollScheduleRequest.Paging.PageNumber = pageNumber;
    this.tollScheduleRequest.Paging.PageSize = 10;
    // this.tollScheduleRequest.Paging.SortColumn = "STARTEFFECTIVEDATE";
    this.tollScheduleRequest.Paging.SortColumn = this.sortingColumn;
    this.tollScheduleRequest.Paging.SortDir = this.sortingDirection == true ? 1 : 0;;
    this.tollService.getTollSchedules(this.tollScheduleRequest, userEvents).subscribe(res => {
      this.tollSchedules = res;
      if (this.tollSchedules.length > 0) {
        this.totalRecordCount = this.tollSchedules[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
     }
      this.previewVisible = true;
      // alert(res);
      // this.dataLength = res.length;
      // if (this.endItemNumber < res.length)
      //   this.endItemNumber = res.length;
    })

  }

  getTollSchHdrIDbyDetails(objTollObj) {
    this.materialscriptService.material();
    this.tollService.getTollSchHdrIDbyDetails(objTollObj).subscribe(res => {
      console.log(res);
      this.isDisabled = true;
      this.router.navigate(['sac/tolls/add-toll-schedules', res, objTollObj.IsActive]);
    })
  }

  deactiveSchedule(tollSchedule) {
    // let rootSele = this;
    // setTimeout(function () {
    //   rootSele.materialscriptService.material();
    // }, 0)
    this.materialscriptService.material();
    this.isDisabled = true;
    this.getTollSchHdrIDbyDetails(tollSchedule)
  }

  sortDirection(SortingColumn) {
    this.gridArrowTOLLSCHEDULEHDRDESC = false;
    this.gridArrowSTARTEFFECTIVEDATE = false;
    this.gridArrowENDEFFECTIVEDATE = false;
    this.gridArrowSCHEDULETYPE = false;
    this.gridArrowENTRYPLAZACODE = false;
    this.gridArrowENTRYLANETYPE = false;
    this.gridArrowENTRYLANEDIRECTION = false;
    this.gridArrowTRANSACTIONTYPE = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "TOLLSCHEDULEHDRDESC") {
      this.gridArrowTOLLSCHEDULEHDRDESC = true;
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

    else if (this.sortingColumn == "SCHEDULETYPE") {
      this.gridArrowSCHEDULETYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ENTRYPLAZACODE") {
      this.gridArrowENTRYPLAZACODE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ENTRYLANETYPE") {
      this.gridArrowENTRYLANETYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ENTRYLANEDIRECTION") {
      this.gridArrowENTRYLANEDIRECTION = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "TRANSACTIONTYPE") {
      this.gridArrowTRANSACTIONTYPE = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }



    this.getAllTollSchedules(this.p);
  }



}
