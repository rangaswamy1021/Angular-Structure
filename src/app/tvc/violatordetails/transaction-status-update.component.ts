import { Component, OnInit, Renderer } from '@angular/core';
import { ViolatordetailsService } from './services/violatordetails.service';
import { ICitationInfo } from './models/violationsresponse';
import { IViolatorTransaction } from './models/violationsrequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { List } from 'linqts';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { Features, Actions } from '../../shared/constants';

import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-transaction-status-update',
  templateUrl: './transaction-status-update.component.html',
  styleUrls: ['./transaction-status-update.component.scss']
})
export class TransactionStatusUpdateComponent implements OnInit {

  selectedStage: string;
  selectedStatus: string;
  selectedType: string;
  gridStatus: string;
  gridStage: string;
  gridType: string;


  stages: string[];
  status: string[];
  types: string[];

  iCitationInfoSST: ICitationInfo[];
  iViolatorTransaction: IViolatorTransaction = <IViolatorTransaction>{};
  inputCitaionId: string = "0";
  iCitationInfoTrxnList: ICitationInfo[];
  inputViolatorID: number = 0;
  iTripsContextResponse: ITripsContextResponse;


  // Customer Context
  objICustomerContextResponse: ICustomerContextResponse;
  //User log in details
  sessionContextResponse: IUserresponse;
  tripStatusupdateForm: FormGroup;
  iviolatorContextResponse: IViolatorContextResponse;
  isAllSameSST: boolean = true;
  userEvents: IUserEvents;
  isUpdateAllowed: boolean;

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  constructor(
    private violatordetailsService: ViolatordetailsService,
    public renderer: Renderer, private router: Router,
    private customerContextService: CustomerContextService,
    private sessionService: SessionService,
    private tripsContextService: TripsContextService,
    private violatorContextService: ViolatorContextService,
    private commonService: CommonService,
    private materialscriptService: MaterialscriptService,

  ) {
    this.tripStatusupdateForm = new FormGroup({
      'ddlStage': new FormControl('', [Validators.required]),
      'ddlStatus': new FormControl('', [Validators.required]),
      'ddlType': new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.violatorContextService.currentContext
      .subscribe(customerContext => { this.iviolatorContextResponse = customerContext; }
      );
    if (this.iviolatorContextResponse && this.iviolatorContextResponse.accountId > 0) {
      this.inputViolatorID = this.iviolatorContextResponse.accountId;
    }


    this.tripsContextService.currentContext.subscribe(tripContext => {
      this.iTripsContextResponse = tripContext
    });
    if (this.iTripsContextResponse == undefined) {
      let link = ['/tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
      return;
    }
    else {

      if (this.iTripsContextResponse.isFromInvoiceSearch) {
        this.inputViolatorID = this.iTripsContextResponse.accountId;
      }
      this.inputCitaionId = this.iTripsContextResponse.tripIDs[0].toString();
      for (var n = 1; n < this.iTripsContextResponse.tripIDs.length; n++) {
        this.inputCitaionId = this.inputCitaionId + "," + this.iTripsContextResponse.tripIDs[n].toString();
      }
    }

    this.setUserActionObject();
    this.bindStageStatusType(this.userEvents);
    this.bindGridView(this.inputCitaionId);
    this.isUpdateAllowed = !this.commonService.isAllowed(Features[Features.TRIPSTATUSUPDATE], Actions[Actions.UPDATE], "");
  }

  bindGridView(inputCitaionId: string) {
    this.violatordetailsService.getCitationDetails(this.inputCitaionId).
      subscribe(
      retResult => {
        //console.log("iCitationInfoTrxnList--" + this.iCitationInfoTrxnList);
        this.iCitationInfoTrxnList = retResult;
        let tempSST = this.iCitationInfoTrxnList[0].AuditStatus.split('/');
        this.gridStage = this.selectedStage = tempSST[0];
        this.gridStatus = this.selectedStatus = tempSST[1];
        this.gridType = this.selectedType = tempSST[2];
        let totalCount = new List<ICitationInfo>(this.iCitationInfoTrxnList).Count();
        let tempList = new List<ICitationInfo>(this.iCitationInfoTrxnList);
        let sstCount = tempList.Where(x => x.Citation_Stage == this.selectedStage && x.Citation_Status == this.selectedStatus && x.Citation_Type == this.selectedType).ToList().Count();
        if (sstCount == totalCount) {
          this.isAllSameSST = true;
        }
        else {
          this.isAllSameSST = false;
        }
      },
      retResult => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = retResult.statusText;
      }
      );
  }
  updateStageStatusType() {
    if (this.tripStatusupdateForm.valid) {
      if (!this.isAllSameSST) {
        this.goToTrips(true);
        return;
      }
      if (this.gridStage == this.selectedStage && this.gridStatus == this.selectedStatus && this.gridType == this.selectedType) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = "No modifications are done to update the Trip Stage/Status/Type.";
        return;
      }
      this.iViolatorTransaction.Citation_Stage = this.selectedStage;
      this.iViolatorTransaction.Citation_Status = this.selectedStatus;
      this.iViolatorTransaction.Citation_Type = this.selectedType;
      this.iViolatorTransaction.UserName = this.sessionContextResponse.userName;
      this.iViolatorTransaction.UserId = this.sessionContextResponse.userId;
      this.iViolatorTransaction.LoginId = this.sessionContextResponse.loginId;
      this.iViolatorTransaction.ViolatorId = this.inputViolatorID;
      this.iViolatorTransaction.UserName = this.sessionContextResponse.userName;
      this.iViolatorTransaction.CitationCSV = this.inputCitaionId;
      this.setUserActionObject();
      this.userEvents.ActionName = Actions[Actions.UPDATE];
      this.violatordetailsService.citationSSTUpdate(this.iViolatorTransaction, this.userEvents).
        subscribe(
        retResult => {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = "Stage/Status/Type has been updated successfully.";
          this.bindStageStatusType(null);
          this.bindGridView(this.inputCitaionId);
        },
        retResult => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = retResult.statusText;
        }
        );
    }
    else {
      //console.log('validation failed');
    }
  }

  resetClick() {
    this.userEvents = null;
    this.bindStageStatusType(null);
    this.tripStatusupdateForm.controls["ddlStage"].setValue(this.gridStage);
    this.tripStatusupdateForm.controls["ddlStatus"].setValue(this.gridStatus);
    this.tripStatusupdateForm.controls["ddlType"].setValue(this.gridType);
  }


  goToTrips(isMessage) {
    if (this.iTripsContextResponse != undefined && this.iTripsContextResponse.referenceURL !== '') {
      if (isMessage) this.iTripsContextResponse.errorMessage = "Select same Stage/Status/Type";
      this.router.navigateByUrl(this.iTripsContextResponse.referenceURL);
    }
    else {
      let link = ['tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
    }
  }

  // bind the Stage
  bindStageStatusType(userEvents: IUserEvents) {
    this.violatordetailsService.getViolationWorkflowDetails(userEvents).subscribe(result => {
      //console.log(result);
      this.iCitationInfoSST = result;
      let templist = new List<ICitationInfo>(this.newFunction());
      this.stages = templist.Select(x => x.Citation_Stage).Distinct().ToArray();
      this.status = templist.Select(x => x.Citation_Status).Distinct().ToArray();
      this.types = templist.Select(x => x.Citation_Type).Distinct().ToArray();
    });
  }

  bindStatus(stage: string) {
    let templist = new List<ICitationInfo>(this.newFunction());
    this.selectedStatus = "";
    this.selectedType = "";
    this.status = templist.Where(x => x.Citation_Stage == this.selectedStage).Select(x => x.Citation_Status).Distinct().ToArray();
  }
  bindType(status: string) {
    let templist = new List<ICitationInfo>(this.newFunction());
    this.selectedType = "";
    this.types = templist.Where(x => x.Citation_Stage == this.selectedStage && x.Citation_Status == this.selectedStatus).Select(x => x.Citation_Type).Distinct().ToArray();
  }

  private newFunction(): ICitationInfo[] {
    return this.iCitationInfoSST;
  }

  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.FeatureName = Features[Features.TRIPSTATUSUPDATE];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.inputViolatorID;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}

