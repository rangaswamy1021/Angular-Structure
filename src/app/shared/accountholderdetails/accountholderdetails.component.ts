import { Router } from '@angular/router';
import { Actions } from './../constants';

import { IUserEvents } from './../models/userevents';
import { CommonService } from './../services/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IProfileRequest } from './../../csc/customerdetails/models/profilerequest';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CustomerDetailsService } from "../../csc/customerdetails/services/customerdetails.service";
import { UserType } from "../constants";
import { IPaging } from "../models/paging";
import { ISystemActivities } from "../models/systemactivitiesrequest";
import { ActivitySource, SubSystem, Features } from '../../shared/constants';
import { CustomerContextService } from "../services/customer.context.service";
import { ICustomerContextResponse } from "../models/customercontextresponse";
import { SessionService } from "../services/session.service";
import { IUserresponse } from "../models/userresponse";
import { IBlocklistresponse } from "../../shared/models/blocklistmessageresponse";
import { IProfileResponse } from "../../csc/search/models/ProfileResponse";
import { MaterialscriptService } from "../materialscript.service";


declare var $: any;
@Component({
  selector: 'app-accountholderdetails',
  templateUrl: './accountholderdetails.component.html',
  styleUrls: ['./accountholderdetails.component.scss']
})
export class AccountholderdetailsComponent implements OnInit {
  disableHistoryButton: boolean = false;
  disableButton: boolean;

  showProfileHistoryFlag: boolean;

  accountId = 0;
  profileResponse: any;
  baseCustomerDetails: any;
  organizationName: string = "";
  paging: IPaging;
  profileRequest: IProfileRequest;
  profileResponseHistory: IProfileResponse[];

  p: number = 1;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;

  sysytemActivities: ISystemActivities;
  UserInputs: IAddUserInputs = <IAddUserInputs>{};
  createAccountForm: FormGroup;
  titles = [];

  userEvents = <IUserEvents>{};
  suffixes = [];
  genderTypes = [];
  isSuffixOther: boolean = false;
  validateNumberPattern = "[0-9]*";
  validateAlphabetsPattern = "[a-zA-Z]*";
  validateAlphabetsandSpacePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
  validateAlphabetsSpaceHypenPattern = "[a-zA-Z]+([ \'-][a-zA-Z]+)*";
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  blockListAccountDetails: IBlocklistresponse[] = [];

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  @Output() AccountblockListArray: EventEmitter<IBlocklistresponse[]> = new EventEmitter<IBlocklistresponse[]>();
  @Input() AccountblockListStatus;


  constructor(private customerDetailsService: CustomerDetailsService, private commonService: CommonService,
    private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router,
    private materialscriptService:MaterialscriptService) {
    this.initialFormValues();
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.accountId = this.customerContextResponse.AccountId;

      this.userEvents.FeatureName = Features[Features.ACCOUNTHOLDERDETAILS];
      this.userEvents.PageName = this.router.url;
      this.userEvents.CustomerId = this.accountId;
      this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      this.userEvents.UserName = this.sessionContextResponse.userName;
      this.userEvents.LoginId = this.sessionContextResponse.loginId;
      this.getCustomerProfileById();
      this.checkRolesandPrivileges();
    }
  }


  checkRolesandPrivileges() {
    this.disableHistoryButton = !this.commonService.isAllowed(Features[Features.ACCOUNTHOLDERDETAILS], Actions[Actions.HISTORY], "");
    this.disableButton = !this.commonService.isAllowed(Features[Features.ACCOUNTHOLDERDETAILS],Actions[Actions.UPDATE], "");
  }


  selectSuffix() {
    this.createAccountForm.value.suffixOther = "";
    if (this.createAccountForm.value.suffixSelected == 'Other') {
      this.createAccountForm.controls["suffixOther"].setValidators([Validators.compose([Validators.required, Validators.maxLength(5), Validators.pattern('[a-zA-Z]*')])]);
      this.isSuffixOther = true;
    }
    else {
      this.createAccountForm.controls["suffixOther"].setValidators([]);
      this.isSuffixOther = false;
    }
  }


  bindDropdowns() {
    // Bind Title
    this.commonService.getTitleLookups().subscribe(res => { this.titles = res; });
    // Bind Suffix
    this.commonService.getSuffixLookups().subscribe(res => { this.suffixes = res; });
    // Bind Gender
    this.commonService.getGenderLookups().subscribe(res => { this.genderTypes = res; });
  }

  getCustomerProfileById() {

    this.customerDetailsService.getProfileByCustomerId(this.accountId)
      .subscribe(res => {
        this.profileResponse = res;
              if (this.profileResponse && this.profileResponse.OrganisationName != '') {
                this.organizationName = this.profileResponse.OrganisationName;
              }
      }
      , (err) => { this.showErrorMsg(err.statusText.toString()); }
      , () => {
       
      });
  }

  initialFormValues() {
    this.createAccountForm = new FormGroup({
      businessName: new FormControl('', []),
      titleSelected: new FormControl('', []),
      suffixSelected: new FormControl('', []),
      suffixOther: new FormControl('', []),
      firstName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsandSpacePattern)])),
      middleName: new FormControl('', Validators.compose([Validators.pattern(this.validateAlphabetsPattern), Validators.maxLength(2)])),
      lastName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(this.validateAlphabetsSpaceHypenPattern)])),
      genderSelected: new FormControl('')
    });
  }


  editDetails(profileDetails) {
    $('#acchEdit').modal('show');
   
    this.populateToControls();
this.materialscriptService.material();
  }

  populateToControls() {
    this.initialFormValues();
    this.bindDropdowns();
    this.createAccountForm.patchValue({
      businessName: this.organizationName,
      titleSelected: this.profileResponse.Title,
      suffixSelected: this.profileResponse.Suffix,
      suffixOther: this.profileResponse.Suffix == "Other" ? "Other" : this.profileResponse.Suffix,
      firstName: this.profileResponse.FirstName.toString(),
      middleName: this.profileResponse.MiddleName.toString(),
      lastName: this.profileResponse.LastName.toString(),
      genderSelected: this.profileResponse.Gender
    })
    let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
  }

  ResetProfile() {
    this.createAccountForm.patchValue({
      businessName: this.organizationName,
      titleSelected: this.profileResponse.Title,
      suffixSelected: this.profileResponse.Suffix,
      suffixOther: this.profileResponse.Suffix == "Other" ? "Other" : this.profileResponse.Suffix,
      firstName: this.profileResponse.FirstName.toString(),
      middleName: this.profileResponse.MiddleName.toString(),
      lastName: this.profileResponse.LastName.toString(),
      genderSelected: this.profileResponse.Gender
    })
    
let rootSele=this;
setTimeout(function(){
rootSele.materialscriptService.material();
},0)
  }


  changeProfile(isBlockListCheck) {
    if (this.createAccountForm.valid) {
      this.profileRequest = <IProfileRequest>{};
      this.profileRequest.ContactId = this.profileResponse.ContactId;
      this.profileRequest.NameType = this.profileResponse.NameType;
      this.profileRequest.DOB = this.profileResponse.DOB;
      this.profileRequest.AccountId = this.accountId;
      this.profileRequest.OrganisationName = this.createAccountForm.value.businessName;
      this.profileRequest.Title = this.createAccountForm.value.titleSelected;
      this.profileRequest.Suffix = this.createAccountForm.value.suffixSelected;
      this.profileRequest.FirstName = this.createAccountForm.value.firstName;
      this.profileRequest.MiddleName = this.createAccountForm.value.middleName;
      this.profileRequest.LastName = this.createAccountForm.value.lastName;
      this.profileRequest.Gender = this.createAccountForm.value.genderSelected;
      this.profileRequest.PerformBy = this.UserInputs.userName;
      this.profileRequest.SubSystem = ActivitySource[SubSystem.CSC];
      this.profileRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.profileRequest.IsActivityRequired = true;
      this.sysytemActivities = <ISystemActivities>{};
      this.sysytemActivities.UserId = this.UserInputs.userId;
      this.sysytemActivities.LoginId = this.UserInputs.loginId;
      this.profileRequest.SystemActivities = this.sysytemActivities;
      this.profileRequest.CheckBlockList = isBlockListCheck;
      this.userEvents.ActionName = Actions[Actions.UPDATE];
      this.customerDetailsService.updateProfileByCustomerId(this.profileRequest, this.userEvents)
        .subscribe(res => {
          if (res) {
            this.showSucsMsg('Profile has been updated');
            $('#acchEdit').modal('hide');
            this.materialscriptService.material();
          }
        }, (err) => {
          if (err.error) {
            this.blockListAccountDetails = err.error;
            this.AccountblockListArray.emit(this.blockListAccountDetails);
          }
          else {
            this.showErrorMsg(err.statusText.toString());
          }
        }
        , () => {
          this.getCustomerProfileById();
        });
    }
  }


  ngOnChanges(): void {
    if (this.AccountblockListStatus) {
      this.changeProfile(false);
    }
  }

  showProfileHistory() {
    this.p = 1;
    this.getProfileHistory(this.p);
    this.showProfileHistoryFlag = true;
  }

  getProfileHistory(pageNumber: number) {
    this.profileRequest = <IProfileRequest>{};
    this.profileRequest.AccountId = this.accountId;
    this.profileRequest.SortColumn = "";
    this.profileRequest.SortDirection = true;
    this.profileRequest.PageSize = 10;
    this.profileRequest.PageNumber = pageNumber;
    this.sysytemActivities = <ISystemActivities>{};
    this.sysytemActivities.UserId = this.UserInputs.userId;
    this.sysytemActivities.LoginId = this.UserInputs.loginId;
    this.sysytemActivities.KeyValue = "0";
    this.sysytemActivities.CustomerId = this.accountId;
    this.sysytemActivities.User = this.UserInputs.userName;
    this.sysytemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.profileRequest.SystemActivities = this.sysytemActivities;
    this.userEvents.ActionName = Actions[Actions.HISTORY];
    this.customerDetailsService.getCustomerProfileHistoryByCustomerId(this.profileRequest, this.userEvents)
      .subscribe(res => {
        this.profileResponseHistory = res;

        if (this.profileResponseHistory.length > 0) {
          // console.log(res);
          this.totalRecordCount = this.profileResponseHistory[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          } else {
            this.endItemNumber = this.pageItemNumber;
          }
          // console.log(this.accountAdjustmentDetails);
          this.dataLength = this.profileResponseHistory.length
        }

      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      });
    $('#profileHistory').modal('show');
  }

  profileHistoryPageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.getProfileHistory(this.p);
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

  setOutputFlag(e) {
    this.msgFlag = e;
  }


}

export interface IAddUserInputs {
  userName: string
  loginId: number
  userId: number
  accountId: number
}
