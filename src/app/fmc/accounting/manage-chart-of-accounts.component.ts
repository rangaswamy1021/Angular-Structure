import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ConfigurationService } from "../configuration/services/configuration.service";
import { IAccountGroupsresponse } from "../configuration/models/accountgroupsresponse";
import { IAccountsubgroupsrequest } from "../configuration/models/accountsubgrouprequest";
import { IAccountsubgroupsresponse } from "../configuration/models/accountsubgroupresponse";
import { AccountingService } from "./services/accounting.service";
import { IchartofAccountRequest } from "./models/chartofaccountrequest";
import { Router } from '@angular/router';
import { IUserEvents } from "../../shared/models/userevents";
import { Actions, LookupTypeCodes, ActivitySource, Features } from '../../shared/constants';
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-manage-chart-of-accounts',
  templateUrl: './manage-chart-of-accounts.component.html',
  styleUrls: ['./manage-chart-of-accounts.component.scss']
})
export class ManageChartOfAccountsComponent implements OnInit {
  sortingDirection: boolean = true;
  gridArrowAccountSubGroup: boolean;
  gridArrowAccountGroup: boolean;
  gridArrowExternalCOAId: boolean;
  gridArrowChartOfAccountId: boolean = true;
  sortingColumn: any = 'CHARTOFACCOUNTID';
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;

  chartOfAccountStatus: number;
  getChartofAccountsLength: number;
  editParentCOA: boolean = true;
  validateLowerBound: boolean = false;
  searchClick: boolean;
  groupCode: any;
  accountGroupCode: string;

  addChartOfAccountName: boolean;
  updateChartOfAccountName: boolean;
  parentChartOfAccountResponse: any[];


  createChartOfAccountRequest: IchartofAccountRequest;
  Status: string;
  addSubChartOfAccountButton: boolean = true;;
  getChartofAccountData: any[];
  GetChartOfAccounts: any;
  addChartofAccount: boolean;
  updateChartofAccount: boolean;
  subgroupresponseForForm: IAccountsubgroupsresponse[];
  subgroupresponseForSearch: IAccountsubgroupsresponse[];
  subgrouprequest: IAccountsubgroupsrequest;
  accountGroupRes: IAccountGroupsresponse[];
  systemActivities: ISystemActivities;
  addNewSubChartofAccount: boolean = false;
  addSubChartofAccountForm: FormGroup;
  chartofAccountsForm: FormGroup;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  validateNumericPattern = "^[1-9][0-9]*";
  accountNamePattern = "^[A-Za-z –!@#$&%()\/{}_-]*";
  validateUpperBound: boolean = false;
  radioStatus = [
    {
      id: 0,
      Value: 'Active'
    },

    {
      id: 1,
      Value: 'Inactive'
    }
  ];
  sessionContextResponse: IUserresponse;
  locations = [];
  disableSearchButton: boolean;
  disableCreateButton: boolean;
  disableUpdateButton: boolean;
  constructor(private context: SessionService, private configurationService: ConfigurationService, private accountingService: AccountingService, private router: Router, private commonService: CommonService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.chartofAccountsForm = new FormGroup({
      accountGroupDropDown: new FormControl('', [Validators.required]),
      accountSubGroupDropDown: new FormControl('')
    });
    this.addSubChartofAccountForm = new FormGroup({
      rdostatus: new FormControl(''),
      groupDropDown: new FormControl('', [Validators.required]),
      subGroupDropDown: new FormControl('', [Validators.required]),
      parentChartofAccountDropDown: new FormControl(''),
      chartOfAccount: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(this.validateNumericPattern)]),
      accountName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(250), Validators.pattern(this.accountNamePattern)]),
      lowerBound: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(this.validateNumericPattern)]),
      upperBound: new FormControl('', [Validators.required, Validators.minLength(6), Validators.pattern(this.validateNumericPattern)]),
      isControlAccountDropdown: new FormControl('', [Validators.required]),
      normalBalanceDropdown: new FormControl('', [Validators.required]),
      externalChartofAccount: new FormControl('', )
    });
    this.searchClick = false;
    this.sessionContextResponse = this.context.customerContext;
    this.getAccountGroupsDetails();
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.searchChartOfAccount(1);
    this.chartofAccountsForm.controls['accountSubGroupDropDown'].disable();
    this.disableAccountandAccountSG();

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CHARTOFACCOUNTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.CHARTOFACCOUNTS], Actions[Actions.SEARCH], "");
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.CHARTOFACCOUNTS], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.CHARTOFACCOUNTS], Actions[Actions.UPDATE], "");
  }

  blurLowerBound() {
    if ((this.addSubChartofAccountForm.controls['lowerBound'].value != null && this.addSubChartofAccountForm.controls['lowerBound'].value != '') && (this.addSubChartofAccountForm.controls['chartOfAccount'].value != null && this.addSubChartofAccountForm.controls['chartOfAccount'].value != '')) {
      if (this.addSubChartofAccountForm.controls['lowerBound'].value < this.addSubChartofAccountForm.controls['chartOfAccount'].value) {
        this.validateLowerBound = true;
      } else {
        this.validateLowerBound = false;
      }
    }
    else {
      this.validateLowerBound = false;
    }
  }
  blurUpperBound() {
    if ((this.addSubChartofAccountForm.controls['upperBound'].value != null &&
      this.addSubChartofAccountForm.controls['upperBound'].value != '') &&
      (this.addSubChartofAccountForm.controls['lowerBound'].value != null &&
        this.addSubChartofAccountForm.controls['lowerBound'].value != '')) {
      if (this.addSubChartofAccountForm.controls['lowerBound'].value >= this.addSubChartofAccountForm.controls['upperBound'].value) {
        this.validateUpperBound = true;
      } else {
        this.validateUpperBound = false;
      }
    }
    else {
      this.validateUpperBound = false;
    }
  }

  addSubChartOfAccountBtn() {
    this.materialscriptService.material();
    // this.resetForm();
    this.updateChartOfAccountName = false;
    this.addChartOfAccountName = true;
    this.updateChartofAccount = false;
    this.addChartofAccount = true;
    this.editParentCOA = true;
    this.addSubChartofAccountForm.controls['groupDropDown'].enable();
    this.addSubChartofAccountForm.controls["chartOfAccount"].enable();
    this.addSubChartofAccountForm.reset();
    this.addSubChartofAccountForm.controls['groupDropDown'].setValue("");
    this.addSubChartofAccountForm.controls['subGroupDropDown'].setValue("");
    this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].setValue("");
    this.addSubChartofAccountForm.controls['isControlAccountDropdown'].setValue("");
    this.addSubChartofAccountForm.controls['normalBalanceDropdown'].setValue("");
    this.validateLowerBound = false;
    this.validateUpperBound = false;
    this.addNewSubChartofAccount = true;
    this.addSubChartOfAccountButton = false;
    this.chartOfAccountStatus = 0;
    this.addSubChartofAccountForm.controls['rdostatus'].setValue(0);
  }
  cancelAddNewSubChartofAccount() {
    this.addNewSubChartofAccount = false;
    this.addSubChartOfAccountButton = true;
    this.disableAccountandAccountSG();
    this.addSubChartofAccountForm.controls['groupDropDown'].setValue("");
    this.addSubChartofAccountForm.controls['subGroupDropDown'].setValue("");
    this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].setValue("");
    this.chartOfAccountStatus = 0;
  }

  resetForm() {
    this.searchClick = false;
    this.chartofAccountsForm.reset();
    this.chartofAccountsForm.controls['accountGroupDropDown'].setValue("");
    this.chartofAccountsForm.controls['accountSubGroupDropDown'].setValue("");
    this.chartofAccountsForm.controls['accountSubGroupDropDown'].disable();
    this.sortingColumn = 'CHARTOFACCOUNTID';
    this.sortingDirection = true;
    this.gridArrowChartOfAccountId = true;
    this.gridArrowExternalCOAId = false;
    this.gridArrowAccountGroup = false;
    this.gridArrowAccountSubGroup = false;
    this.pageChanged(1);
    this.endItemNumber = 10;
  }

  searchCOA() {
    if (this.chartofAccountsForm.valid) {
      this.searchClick = true;
      this.pageChanged(1);
      this.endItemNumber = 10;
    } else {
      this.validateAllFormFields(this.chartofAccountsForm);
    }
  }

  sortDirection(SortingColumn) {
    this.gridArrowChartOfAccountId = false;
    this.gridArrowExternalCOAId = false;
    this.gridArrowAccountGroup = false;
    this.gridArrowAccountSubGroup = false;
    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "CHARTOFACCOUNTID") {
      this.gridArrowChartOfAccountId = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "LEGALACCOUNTID") {
      this.gridArrowExternalCOAId = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "AGCODE") {
      this.gridArrowAccountGroup = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "ASGCODE") {
      this.gridArrowAccountSubGroup = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    this.searchChartOfAccount(this.p);
  }

  searchChartOfAccount(pageNo) {
    // this.cancelAddNewSubChartofAccount();
    // if (this.chartofAccountsForm.valid) {
    this.addNewSubChartofAccount = false;
    this.addSubChartOfAccountButton = true;
    this.createChartOfAccountRequest = <IchartofAccountRequest>{};
    this.systemActivitiesMethod();
    this.createChartOfAccountRequest.SystemActivities = this.systemActivities;
    this.createChartOfAccountRequest.SortColumn = this.sortingColumn;
    this.createChartOfAccountRequest.SortDir = this.sortingDirection == false ? 1 : 0;
    this.createChartOfAccountRequest.PageNumber = pageNo;
    this.createChartOfAccountRequest.PageSize = 10;
    if (this.searchClick) {
      this.createChartOfAccountRequest.AccountGroupCode = this.chartofAccountsForm.controls['accountGroupDropDown'].value;
      this.createChartOfAccountRequest.AccountSubGroupCode = this.chartofAccountsForm.controls['accountSubGroupDropDown'].value;
    } else {
      this.createChartOfAccountRequest.AccountGroupCode = '';
      this.createChartOfAccountRequest.AccountSubGroupCode = '';
    }
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CHARTOFACCOUNTS];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.accountingService.searchChartOfAccountDetails(this.createChartOfAccountRequest, userEvents).subscribe(
      res => {
        this.getChartofAccountData = res;
        this.getChartofAccountsLength = this.getChartofAccountData.length;
        if (this.getChartofAccountData && this.getChartofAccountData.length > 0) {
          this.totalRecordCount = this.getChartofAccountData[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText;

      });
    // } else {
    //   this.validateAllFormFields(this.chartofAccountsForm);
    // }
  }
  // getChartOfAccountsData() {
  //   this.accountingService.getChartOfAccountsDropDown().subscribe(
  //     res => {
  //       this.getChartofAccountData = res;
  //       this.totalRecordCount = this.getChartofAccountData.length;
  //       this.getChartofAccountsLength = this.totalRecordCount;
  //       if (this.totalRecordCount < this.pageItemNumber) {
  //         this.endItemNumber = this.totalRecordCount;
  //       }
  //     }
  //   );
  // }
  disableAccountandAccountSG() {
    this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].disable();
    this.addSubChartofAccountForm.controls['subGroupDropDown'].disable();
  }
  systemActivitiesMethod() {
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.User = this.context.customerContext.userName;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
  }
  populateChartofAccounts(data) {
    this.validateUpperBound = false;
    this.validateLowerBound = false;
    this.updateChartOfAccountName = true;
    this.addChartOfAccountName = false;
    this.addSubChartOfAccountButton = false;
    this.updateChartofAccount = true;
    this.addNewSubChartofAccount = true;
    this.addChartofAccount = false;
    this.accountGroupCode = data.AccountGroupCode;
    if (data.Status == 'Active') {
      this.chartOfAccountStatus = 0;
    }
    else {
      this.chartOfAccountStatus = 1;
    }
    this.addSubChartofAccountForm.controls["groupDropDown"].setValue(data.AccountGroupCode);
    this.getAccountSubGroupsDetailsInForm(data.AccountGroupCode);
    this.addSubChartofAccountForm.controls["subGroupDropDown"].setValue(data.AccountSubGroupCode);
    this.getParentChartOfAccount(data.AccountSubGroupCode);
    if (data.ParentChartOfAccountId != 0) {
      this.editParentCOA = true;
      this.addSubChartofAccountForm.controls["parentChartofAccountDropDown"].setValue(data.ParentChartOfAccountId);
    } else {
      this.editParentCOA = false;
    }
    this.addSubChartofAccountForm.controls["chartOfAccount"].setValue(data.ChartOfAccountId);
    this.addSubChartofAccountForm.controls["chartOfAccount"].disable();
    this.addSubChartofAccountForm.controls["accountName"].setValue(data.AccountName);
    this.addSubChartofAccountForm.controls["lowerBound"].setValue(data.LowerBound);
    this.addSubChartofAccountForm.controls["upperBound"].setValue(data.UpperBound);
    this.addSubChartofAccountForm.controls['isControlAccountDropdown'].setValue(data.IsControlAccount);
    this.addSubChartofAccountForm.controls['normalBalanceDropdown'].setValue(data.NormalBalanceType);
    this.addSubChartofAccountForm.controls["externalChartofAccount"].setValue(data.LegalAccountID);
    this.addSubChartofAccountForm.controls['groupDropDown'].disable();
    this.disableAccountandAccountSG();
    this.materialscriptService.material();
  }
  createChartofAccounts() {
    if (this.addSubChartofAccountForm.valid) {
      this.blurLowerBound();
      this.blurUpperBound();
      if ((this.validateLowerBound == false) && (this.validateUpperBound == false)) {
        this.createChartOfAccountRequest = <IchartofAccountRequest>{};
        this.systemActivitiesMethod();
        this.createChartOfAccountRequest.AccountGroupCode = this.addSubChartofAccountForm.controls['groupDropDown'].value;
        this.createChartOfAccountRequest.AccountSubGroupCode = this.addSubChartofAccountForm.controls['subGroupDropDown'].value;
        this.createChartOfAccountRequest.ChartOfAccountId = this.addSubChartofAccountForm.get('chartOfAccount').value;
        this.createChartOfAccountRequest.AccountName = this.addSubChartofAccountForm.get('accountName').value;
        this.createChartOfAccountRequest.ParentChartOfAccountId = this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].value;
        this.createChartOfAccountRequest.LowerBound = this.addSubChartofAccountForm.get('lowerBound').value;
        this.createChartOfAccountRequest.UpperBound = this.addSubChartofAccountForm.get('upperBound').value;
        if (this.addSubChartofAccountForm.controls['rdostatus'].value == 0) {
          this.createChartOfAccountRequest.Status = "Active";
        }
        else {
          this.createChartOfAccountRequest.Status = "Inactive";
        }
        this.createChartOfAccountRequest.IsControlAccount = this.addSubChartofAccountForm.controls['isControlAccountDropdown'].value;
        this.createChartOfAccountRequest.NormalBalanceType = this.addSubChartofAccountForm.controls['normalBalanceDropdown'].value;
        this.createChartOfAccountRequest.LegalAccountID = this.addSubChartofAccountForm.get('externalChartofAccount').value;
        this.createChartOfAccountRequest.User = this.context.customerContext.userName;
        this.createChartOfAccountRequest.SystemActivities = this.systemActivities;

        let userEvents: IUserEvents;
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.CHARTOFACCOUNTS];
        userEvents.ActionName = Actions[Actions.CREATE];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;

        this.accountingService.createChartofAccounts(this.createChartOfAccountRequest, userEvents).subscribe(
          res => {
            if (res) {
              this.cancelAddNewSubChartofAccount();
              this.searchChartOfAccount(1);
              this.msgFlag = true;
              this.msgType = 'success'
              this.msgDesc = 'Chart of Account has been created successfully.'
            }
          }
          , err => {
            this.msgFlag = true;
            this.msgType = 'error'
            this.msgDesc = err.statusText;
          });
      }
    }
    else {
      this.validateAllFormFields(this.addSubChartofAccountForm);
    }
  }
  updateChartofAccounts() {
    this.addSubChartOfAccountButton = false;
    this.createChartOfAccountRequest = <IchartofAccountRequest>{},
      this.systemActivitiesMethod();
    this.createChartOfAccountRequest.AccountGroupCode = this.addSubChartofAccountForm.controls['groupDropDown'].value;
    this.createChartOfAccountRequest.AccountSubGroupCode = this.addSubChartofAccountForm.controls['subGroupDropDown'].value;
    this.createChartOfAccountRequest.ChartOfAccountId = this.addSubChartofAccountForm.get('chartOfAccount').value;
    this.createChartOfAccountRequest.AccountName = this.addSubChartofAccountForm.get('accountName').value;
    this.createChartOfAccountRequest.ParentChartOfAccountId = this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].value;
    this.createChartOfAccountRequest.LowerBound = this.addSubChartofAccountForm.get('lowerBound').value;
    this.createChartOfAccountRequest.UpperBound = this.addSubChartofAccountForm.get('upperBound').value;
    if (this.addSubChartofAccountForm.controls['rdostatus'].value == 0) {
      this.createChartOfAccountRequest.Status = "Active";
    }
    else {
      this.createChartOfAccountRequest.Status = "Inactive";
    }
    this.createChartOfAccountRequest.IsControlAccount = this.addSubChartofAccountForm.controls['isControlAccountDropdown'].value;
    this.createChartOfAccountRequest.NormalBalanceType = this.addSubChartofAccountForm.controls['normalBalanceDropdown'].value;
    this.createChartOfAccountRequest.LegalAccountID = this.addSubChartofAccountForm.get('externalChartofAccount').value;
    this.createChartOfAccountRequest.User = this.context.customerContext.userName;
    this.createChartOfAccountRequest.SystemActivities = this.systemActivities;

    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.CHARTOFACCOUNTS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.accountingService.updateChartofAccounts(this.createChartOfAccountRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Chart of Account has been updated successfully.'
          this.searchChartOfAccount(1);
          this.addNewSubChartofAccount = false;
          this.addSubChartOfAccountButton = true;
          this.addSubChartofAccountForm.controls["chartOfAccount"].enable();
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText;
      });
  }
  sendDetailsToRequest() {
    this.subgrouprequest = <IAccountsubgroupsrequest>{};
    this.systemActivitiesMethod();
    this.subgrouprequest.PageNumber = 1;
    this.subgrouprequest.PageSize = 1000;
    this.subgrouprequest.IsPaging = 1;
    this.subgrouprequest.SortColumn = "AGCODE";
    this.subgrouprequest.SortDir = 0;
    this.subgrouprequest.SystemActivities = this.systemActivities;
  }
  getAccountGroupsDetails(): void {
    this.systemActivitiesMethod();
    this.configurationService.getAccountGroups(this.systemActivities).subscribe(
      res => {
        this.accountGroupRes = res;
      });
  }
  getAccountSubGroupsDetailsInForm(AccountGroupCode: string): void {
    this.accountGroupCode = AccountGroupCode;
    this.sendDetailsToRequest();
    this.configurationService.getSubGroups(this.subgrouprequest).subscribe(
      res => {
        this.subgroupresponseForForm = res.filter(x => x.AccountGroupCode == AccountGroupCode);
      });
    if (this.addSubChartofAccountForm.controls['groupDropDown'].value != "") {
      this.addSubChartofAccountForm.controls['subGroupDropDown'].enable();
    } else {
      this.disableAccountandAccountSG();
    }
  }
  getAccountSubGroupsDetailsInSearch(AccountGroupCode: string): void {
    this.sendDetailsToRequest();
    this.configurationService.getSubGroups(this.subgrouprequest).subscribe(
      res => {
        this.subgroupresponseForSearch = res.filter(x => x.AccountGroupCode == AccountGroupCode);
      });
    if (this.chartofAccountsForm.controls['accountGroupDropDown'].value == "") {
      this.chartofAccountsForm.controls['accountSubGroupDropDown'].disable();
    } else {
      this.chartofAccountsForm.controls['accountSubGroupDropDown'].enable();
    }
  }
  getParentChartOfAccount(subGroupCode) {
    this.createChartOfAccountRequest = <IchartofAccountRequest>{};
    this.createChartOfAccountRequest.AccountGroupCode = this.accountGroupCode;
    this.createChartOfAccountRequest.AccountSubGroupCode = subGroupCode;
    this.accountingService.getParentChartOfAccountDropDown(this.createChartOfAccountRequest).subscribe(
      res => {
        this.parentChartOfAccountResponse = res;
      });

    if (this.addSubChartofAccountForm.controls['subGroupDropDown'].value != "") {
      this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].enable();
    } else {
      this.addSubChartofAccountForm.controls['parentChartofAccountDropDown'].disable();
    }
  }
  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.searchChartOfAccount(this.p);
  }
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
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}