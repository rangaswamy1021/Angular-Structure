import { CommonService } from './../../shared/services/common.service';
import { Actions, Features } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { IFeeTypesRequest } from './models/feetypes.request';
import { UpdateFeesComponent } from './update-fees.component';
import { IPaging } from './../../shared/models/paging';
import { Component, OnInit, ViewChild, ElementRef, Renderer, Pipe } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { FeeTypesService } from "./services/fees.service";
import { IFeeTypesResponse } from "./models/feetypes.response";
@Component({
  selector: 'app-manage-fees',
  templateUrl: './manage-fees.component.html',
  styleUrls: ['./manage-fees.component.css'],
})
export class ManageFeesComponent implements OnInit {
  getFeeRequest: IFeeTypesRequest;
  getFeeResponse: IFeeTypesResponse[];
  paging: IPaging;
  myModel: any;
  isUpdate: boolean;
  feeTypeId: number;
  successMessage: string;
  faileureMessge: string;
  isAdd: boolean = false;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  disableAddButton: boolean;
  disableUpdateButton: boolean;
  sessionContextResponse: IUserresponse;
  @ViewChild('AddFeediv') public AddFeediv: ElementRef
  @ViewChild('BtnAddFeediv') public BtnAddFeediv: ElementRef

  constructor(private feeService: FeeTypesService, public renderer: Renderer, private router: Router, private sessionContext: SessionService
    , private commonService: CommonService) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }
 

  PageNumber: number = 1;
  PageItemNumber: number = 10;
  StartItemNumber: number = 1;
  EndItemNumber: number = this.PageItemNumber;
  TotalRecordCount: number;
  pageChanged(event) {
    this.PageNumber = event;
    this.StartItemNumber = (((this.PageNumber) - 1) * this.PageItemNumber) + 1;
    this.EndItemNumber = ((this.PageNumber) * this.PageItemNumber);
    if (this.EndItemNumber > this.TotalRecordCount)
      this.EndItemNumber = this.TotalRecordCount;
    this.getFees();
  }

  getFees(): void {
    this.getFeeRequest = <IFeeTypesRequest>{};
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.PageNumber;
    paging.PageSize = this.PageItemNumber;
    paging.SortColumn = "FEETYPEID";
    paging.SortDir = 1;
   
    this.getFeeRequest.Paging = paging;
    this.getFeeRequest.Operation = "VIEW";
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.FEETYPES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.feeService.getFees(this.getFeeRequest, userEvents).subscribe(
      res => {
        this.getFeeResponse = res;
        if (this.getFeeResponse.length > 0 && this.getFeeResponse != null) {
          this.TotalRecordCount = this.getFeeResponse[0].RecordCount;      
        }
        if (this.TotalRecordCount < this.PageItemNumber) {
          this.EndItemNumber = this.TotalRecordCount
        }
      }
    );
  }

  editFeeType(feetypeid: any): void {
    this.isUpdate = true;
    this.isAdd = false;
    this.feeTypeId = feetypeid;
    console.log(this.isUpdate);
  }

  toggleFeeType(): void {
    this.isAdd = true;
    this.isUpdate = false;
  }
  ngOnInit() {
    this.disableAddButton = !this.commonService.isAllowed(Features[Features.FEETYPES], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.FEETYPES], Actions[Actions.UPDATE], "");
    this.getFees();
  }
  closeDiv(isupdate: boolean): void {
    this.isUpdate = isupdate;
    if (this.isUpdate) {
      this.msgFlag = true;
      this.msgType = 'success';
      this.msgDesc = 'Fee Updated SuccessFully';
      this.isUpdate = false;
      this.getFees();
    }
  }
  closeAddDiv(isAdd: boolean): void {
    this.isAdd = isAdd;
    if (this.isAdd) {
      this.msgFlag = true;
      this.msgType = 'success';
      this.msgDesc = 'Fee Created SuccessFully';
      this.getFees()
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}

