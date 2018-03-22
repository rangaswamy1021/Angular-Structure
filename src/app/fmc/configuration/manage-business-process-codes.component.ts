import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { IPaging } from "../../shared/models/paging";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { SessionService } from "../../shared/services/session.service";
import { ConfigurationService } from "./services/configuration.service";
import { IBusinessesProcessesRequest } from "./models/managebusinessprocessesrequest";
import { IBusinessProcessesresponse } from "./models/managebusinessprocessresponse";
import { AccountingService } from "../accounting/services/accounting.service";
import { IManageTransactionTypeRequest } from "./models/managetransactiontypesrequest";
import { IManageTransactionTypeResponse } from "./models/managetransactiontypesresponse";
import { Router } from '@angular/router';
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-manage-business-process-codes',
  templateUrl: './manage-business-process-codes.component.html',
  styleUrls: ['./manage-business-process-codes.component.scss']
})
export class ManageBusinessProcessCodesComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  createButton: boolean;
  updateButton: boolean;
  searchButton: boolean;
  locations: Array<any> = [];
  sessionContextResponse: IUserresponse;
  selectedChartOfAccount: string;
  addMoreAssociationsButton: boolean;
  addMoreAssociationsForm: boolean = true;
  showLineItem: boolean = false;
  selectedChartIds: Array<any> = [];
  selectedTxnTypeAss: Array<any> = [];
  showPage: boolean = true;
  editBusProcess: any;
  businessProcessRes: IBusinessProcessesresponse[];
  isAvailable: boolean;
  selectedChartAccountName: Array<any> = [];
  chartText: Array<any> = [];
  selectedChartAccountDesc: Array<any> = [];
  businessProcessID: any;
  transactionTypeDetails: IManageTransactionTypeResponse[];
  transactionChartDetails: IBusinessProcessesresponse[];
  objManageTransactionTypesRequest: IManageTransactionTypeRequest;
  pagingShow: boolean;
  selectedTxnId: Array<any> = [];
  selectedTxnCode: Array<any> = [];
  selectedLineCode: Array<any> = [];
  selectedChartAccounts: Array<any> = [];
  ChartOfAccountNames: Array<any> = [];
  selectedGlActDetailCD: Array<any> = [];
  selectedGlActDetailIds: Array<any> = [];
  selectedTxnTypeDetails: Array<any> = [];
  accountGroupselected: string;
  getTxnChartType: Array<any> = [];
  itemsTxnChartType: any[];
  getTxnType: Array<any> = [];
  itemsT: any;
  selectedTxnTypeId: any;
  selectedTxnTypeValue: any;
  glAccountAlreadyExists: boolean;
  selectedchartAccValue: any;
  selectedchartAccId: any;
  items: any;
  businessProcessesLength: number;
  manageBusinessprocessesResponse: IBusinessProcessesresponse[] = [];
  businessesProcessesRequest: IBusinessesProcessesRequest;
  manageBusinessProcesses: any;
  systemActivities: ISystemActivities;
  searchClick: boolean;
  selectedTxnType: any;
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  showAdd: boolean;
  enterbusinessProcessesForm: any;
  addBusinessProcessesForm: FormGroup;
  codePattern: any = "[A-Za-z]*";
  businessProcessesForm: any;
  showUpdate: boolean;
  defaultStatus: string = "Active";
  statuses = [
    {
      id: 0,
      Value: 'Active'
    },

    {
      id: 1,
      Value: 'InActive'
    }
  ];
  constructor(private configurationService: ConfigurationService, private commonService: CommonService, private sessionContext: SessionService, private accountingService: AccountingService, private router: Router, private materialscriptService: MaterialscriptService) {
  }
  ngOnInit() {
    this.materialscriptService.material();
    this.selectedChartOfAccount = '';
    this.addMoreAssociationsButton = false;
    this.getTransactionTypes(this.p);
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.getBusinessProcesses(this.p);
    this.enterbusinessProcessesForm = false;
    this.showAdd = true;
    this.businessProcessesForm = new FormGroup({
      'businessProcessesCode': new FormControl('', [Validators.required, Validators.pattern(this.codePattern)])
    })
    this.addBusinessProcessesForm = new FormGroup({
      'code': new FormControl('', [Validators.required, Validators.maxLength(150), Validators.pattern(this.codePattern)]),
      'description': new FormControl('', [Validators.required, Validators.maxLength(200)]),
      'txnDropDown': new FormControl('', [Validators.required]),
      'chatOfAccountDropDown': new FormControl(''),
      'rdostatus': new FormControl(''),
      'automatic': new FormControl(''),
      'lineItemCode': new FormControl(''),
      'status': new FormControl(''),
      'txnCode': new FormControl(''),
    })
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.BUSINESSPROCESS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.createButton = !this.commonService.isAllowed(Features[Features.BUSINESSPROCESS], Actions[Actions.CREATE], "");
    this.updateButton = !this.commonService.isAllowed(Features[Features.BUSINESSPROCESS], Actions[Actions.UPDATE], "");
    this.searchButton = !this.commonService.isAllowed(Features[Features.BUSINESSPROCESS], Actions[Actions.SEARCH], "");
  }

  setOutputFlag(e) { this.msgFlag = e; }

  searchBusinessProcessClick() {
    if (this.businessProcessesForm.controls['businessProcessesCode'].valid) {
      this.showPage = false;
      this.getSearchDetails();
      this.showPage = false;
      this.enterbusinessProcessesForm = false;
    }
    else {
      this.businessProcessesForm.controls['businessProcessesCode'].markAsTouched({ onlySelf: true });
    }
  }

  getSearchDetails() {
    console.log("Business Process Value: ", this.businessProcessesForm.controls['businessProcessesCode'].value);
    this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
    this.businessesProcessesRequest.SystemActivities = <ISystemActivities>{};
    this.businessesProcessesRequest.PageNumber = 1;
    this.businessesProcessesRequest.PageSize = 10;
    this.businessesProcessesRequest.SortColumn = "BusinessProcessCode";
    this.businessesProcessesRequest.SortDir = 1;
    this.businessesProcessesRequest.SystemActivities.User = this.sessionContext.customerContext.userName;
    this.businessesProcessesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.businessesProcessesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.businessesProcessesRequest.SystemActivities.IsViewed = true;
    this.businessesProcessesRequest.SystemActivities.IsSearch = true;
    this.businessesProcessesRequest.SystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.businessesProcessesRequest.BusinessProcessCode = this.businessProcessesForm.controls['businessProcessesCode'].value;

    $('#pageloader').modal('show');
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.BUSINESSPROCESS];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.configurationService.searchBusinessProcessesCode(this.businessesProcessesRequest, userEvents).subscribe(
      res => {
        $('#pageloader').modal('hide');
        this.manageBusinessprocessesResponse = res;
      })
  }

  getBusinessProcesses(pageNumber: number): void {
      $('#pageloader').modal('show');
    this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
    this.businessesProcessesRequest.SystemActivities = <ISystemActivities>{};
    this.businessesProcessesRequest.PageNumber = this.p;
    this.businessesProcessesRequest.PageSize = 10;
    this.businessesProcessesRequest.SortColumn = "BusinessProcessCode";
    this.businessesProcessesRequest.SortDir = 1;
    this.businessesProcessesRequest.SystemActivities.User = this.sessionContext.customerContext.userName;
    this.businessesProcessesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.businessesProcessesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.businessesProcessesRequest.SystemActivities.IsViewed = true;
    this.businessesProcessesRequest.SystemActivities.IsSearch = false;
    this.businessesProcessesRequest.SystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getBusinessProcessesCode(this.businessesProcessesRequest).subscribe(
      res => {
          $('#pageloader').modal('hide');
        this.manageBusinessprocessesResponse = res;
        this.businessProcessesLength = this.manageBusinessprocessesResponse.length;
        this.totalRecordCount = this.manageBusinessprocessesResponse[0].ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      })
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getBusinessProcesses(this.p);
  }

  removeTxnType(selectedActDetail) {
    let index = this.selectedTxnTypeDetails.indexOf(selectedActDetail);
    this.selectedTxnTypeDetails.splice(index, 1);
    if (this.selectedTxnTypeDetails.length == 0) {
      this.showLineItem = false;
    }
  }

  addMoreAssociations() {
    this.addMoreAssociationsButton = false;
    this.addMoreAssociationsForm = true;
  }
  resetBusinessProcesses() {
    this.p = 1;
    this.pageChanged(this.p);
    this.getBusinessProcesses(this.p);
    this.businessProcessesForm.reset();
    this.enterbusinessProcessesForm = false;
    this.showPage = true;
    this.materialscriptService.material();
  }

  createBusinessProcess() {
    if (this.addBusinessProcessesForm.controls['code'].valid && this.addBusinessProcessesForm.controls['description'].valid) {
      this.selectedTxnTypeDetails.forEach(element => {
        this.selectedTxnId.push(element.txnTypeId);
        this.selectedTxnCode.push(element.txnCodeValue);
        this.selectedLineCode.push(element.lineCodeValue);
        this.selectedChartAccounts.push(element.id);
        this.selectedChartAccountName.push(element.bpChartOfAccNames)
      });
      this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
      this.businessesProcessesRequest.SystemActivities = <ISystemActivities>{};
      this.businessesProcessesRequest.BusinessProcessCode = this.addBusinessProcessesForm.controls["code"].value;
      this.businessesProcessesRequest.BusinessProcessDesc = this.addBusinessProcessesForm.controls["description"].value;
      this.businessesProcessesRequest.Status = this.defaultStatus;
      this.businessesProcessesRequest.IsAvailable = this.isAvailable;
      this.businessesProcessesRequest.User = this.sessionContext.customerContext.userName;;
      this.businessesProcessesRequest.TxnTypeAssociations = this.selectedTxnId.toString();
      this.businessesProcessesRequest.TxnCode = this.selectedTxnCode.toString();
      this.businessesProcessesRequest.LineItemCode = this.selectedLineCode.toString();
      this.businessesProcessesRequest.ChartOfAccountIDs = this.selectedChartAccounts.toString();
      this.businessesProcessesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
      this.businessesProcessesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
      this.businessesProcessesRequest.SystemActivities.User = this.sessionContext.customerContext.userName;
      this.businessesProcessesRequest.SystemActivities.IsViewed = true;
      this.businessesProcessesRequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
    
      this.sessionContextResponse = this.sessionContext.customerContext;
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.BUSINESSPROCESS];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      userEvents.ActionName = Actions[Actions.CREATE];
        $('#pageloader').modal('show');
      this.configurationService.createBusinessProcessesCode(this.businessesProcessesRequest, userEvents).subscribe(
        res => {
          if (res) {
            this.getBusinessProcesses(this.p);
            this.successMessageBlock("Business Process Code has been created successfully");
            this.showPage = true;
            this.addBusinessProcessesForm.reset();
            this.enterbusinessProcessesForm = false;
          }
        }, (err) => {
          $('#pageloader').modal('hide');
          this.errorMessageBlock(err.statusText.toString());
        });
      this.selectedTxnId = [];
      this.selectedTxnCode = [];
      this.selectedLineCode = [];
      this.selectedChartAccounts = [];
      this.selectedChartAccountName = [];
    }
    else {
      this.addBusinessProcessesForm.controls["code"].markAsTouched({ onlySelf: true });
      this.addBusinessProcessesForm.controls["description"].markAsTouched({ onlySelf: true });
    }
  }
  addTxnTypes() {
    if (this.addBusinessProcessesForm.controls['txnDropDown'].valid) {
      this.selectedTxnTypeDetails.push({ 'txnTypeId': this.selectedTxnTypeId, 'txnTypeValue': this.selectedTxnTypeValue, 'txnCodeValue': this.addBusinessProcessesForm.controls["txnCode"].value, 'lineCodeValue': this.addBusinessProcessesForm.controls["lineItemCode"].value, 'id': this.selectedchartAccId, 'bpChartOfAcc': this.selectedchartAccValue, 'bpChartOfAccNames': this.chartText[1] });
      this.addBusinessProcessesForm.controls['txnDropDown'].reset();
      this.addBusinessProcessesForm.controls['txnCode'].reset();
      this.addBusinessProcessesForm.controls['lineItemCode'].reset();
      this.selectedChartOfAccount = '';
      this.selectedTxnTypeValue = [];
      this.selectedchartAccValue = [];
      this.selectedchartAccId = [];
      this.selectedTxnTypeId = [];
      this.itemsTxnChartType = [];
      this.showLineItem = true;
    }
    else {
      this.addBusinessProcessesForm.controls['txnDropDown'].markAsTouched({ onlySelf: true });
    }
  }

  editBusinessProcess(edit) {
    this.selectedChartOfAccount = '';
    this.addMoreAssociationsButton = true;
    this.addMoreAssociationsForm = false;
    this.showLineItem = true;
    this.businessProcessesForm.reset();
    this.editBusProcess = edit;
    this.showUpdate = true;
    this.showAdd = false;
    this.enterbusinessProcessesForm = true;
    this.getBusinessProcessByBusinessProcessId(edit.BusinessProcessID);
    this.enterbusinessProcessesForm = true;
    this.addBusinessProcessesForm.controls['code'].setValue(edit.BusinessProcessCode);
    this.addBusinessProcessesForm.controls['code'].disable();
    this.addBusinessProcessesForm.controls['description'].setValue(edit.BusinessProcessDesc);
    this.defaultStatus = edit.Status;
    this.isAvailable = edit.IsAvailable;
    this.materialscriptService.material();
  }

  getBusinessProcessByBusinessProcessId(value) {
    this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
    this.businessesProcessesRequest.User = this.sessionContext.customerContext.userName;
    this.businessesProcessesRequest.SystemActivities = <ISystemActivities>{};
    this.businessesProcessesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.businessesProcessesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.businessesProcessesRequest.BusinessProcessID = value;
    this.configurationService.getBusinessProcessByBusinessProcessId(this.businessesProcessesRequest).subscribe(
      res => {
        this.businessProcessRes = res;
        this.businessProcessesLength = this.businessProcessRes.length;
        this.selectedTxnTypeDetails = [];
        this.businessProcessRes.forEach(element => {
          this.selectedTxnTypeDetails.push({
            'txnTypeId': element.TxnTypeIds,
            'txnTypeValue': element.TxnTypeAssociations,
            'txnCodeValue': element.TxnCode,
            'lineCodeValue': element.LineItemCode,
            'id': element.ChartOfAccountIDs.split("-")[0],
            'bpChartOfAcc': element.ChartOfAccountIDs,
            'bpChartOfAccNames': element.ChartOfAccountIDs.split("-")[1]
          })
        });
      }
    )
  }

  updateBusinessProcesses() {
    this.selectedTxnTypeDetails.forEach(element => {
      this.selectedTxnId.push(element.txnTypeId);
      this.selectedTxnTypeAss.push(element.txnTypeValue);
      this.selectedTxnCode.push(element.txnCodeValue);
      this.selectedLineCode.push(element.lineCodeValue);
      this.selectedChartAccounts.push(element.id);
      this.selectedChartIds.push(element.bpChartOfAcc);
      this.selectedChartAccountName.push(element.bpChartOfAccNames)
    });
    this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
    this.businessesProcessesRequest.SystemActivities = <ISystemActivities>{};
    this.businessesProcessesRequest.BusinessProcessID = this.editBusProcess.BusinessProcessID;
    this.businessesProcessesRequest.BusinessProcessCode = this.editBusProcess.BusinessProcessCode;
    this.businessesProcessesRequest.BusinessProcessDesc = this.addBusinessProcessesForm.controls['description'].value;
    this.businessesProcessesRequest.Status = this.defaultStatus;
    this.businessesProcessesRequest.IsAvailable = this.isAvailable;
    this.businessesProcessesRequest.TxnTypeAssociations = this.selectedTxnId.toString();
    this.businessesProcessesRequest.TxnCode = this.selectedTxnCode.toString();
    this.businessesProcessesRequest.LineItemCode = this.selectedLineCode.toString();
    this.businessesProcessesRequest.User = this.sessionContext.customerContext.userName;;
    this.businessesProcessesRequest.ChartOfAccountIDs = this.selectedChartAccounts.toString();
    this.businessesProcessesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.businessesProcessesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.businessesProcessesRequest.SystemActivities.User = this.sessionContext.customerContext.userName;
  
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.BUSINESSPROCESS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.ActionName = Actions[Actions.UPDATE];
      $('#pageloader').modal('show');
    this.configurationService.updateBusinessProcess(this.businessesProcessesRequest, userEvents).subscribe(
      res => {
        this.successMessageBlock("Business Process Code has been updated successfully");
        this.enterbusinessProcessesForm = false;
        this.getBusinessProcesses(this.p);
        this.showPage = true;
      },
      err => {
        $('#pageloader').modal('hide');
        this.errorMessageBlock(err.statusText.toString());
      }
    )
    this.selectedTxnId = [];
    this.selectedTxnCode = [];
    this.selectedLineCode = [];
    this.selectedTxnTypeAss = [];
    this.selectedChartIds = [];
    this.selectedChartAccounts = [];
    this.selectedChartAccountName = [];
    this.addBusinessProcessesForm.reset();
  }

  //get Transaction type  dropdown
  getTransactionTypes(pageNo: number) {
    this.objManageTransactionTypesRequest = <IManageTransactionTypeRequest>{};
    this.objManageTransactionTypesRequest.SystemActivities = <ISystemActivities>{};
    this.objManageTransactionTypesRequest.PageNumber = 1;
    this.objManageTransactionTypesRequest.Status = "ACTIVE";
    this.objManageTransactionTypesRequest.User = this.sessionContext.customerContext.userName;
    this.objManageTransactionTypesRequest.PageSize = 10;
    this.objManageTransactionTypesRequest.SystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.objManageTransactionTypesRequest.SystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.objManageTransactionTypesRequest.SystemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.configurationService.getTransactionTypesDetails(this.objManageTransactionTypesRequest).subscribe(res => {
      this.transactionTypeDetails = res;
      this.transactionTypeDetails.forEach(element => {
        this.getTxnType.push({ "id": element.TxnTypeId, "text": element.TxnType });
        this.itemsT = this.getTxnType;
      });
    });
  }

  //get Transaction chart  dropdown
  getTransactionChartDetails(value: number) {
    this.businessesProcessesRequest = <IBusinessesProcessesRequest>{};
    this.businessesProcessesRequest.intTxnTypeId = value;
    this.itemsTxnChartType = [];
    this.selectedchartAccValue = [];
    this.configurationService.getTxnTypeChartDeatails(this.businessesProcessesRequest).subscribe(res => {
      this.transactionChartDetails = res;
      if (this.transactionChartDetails.length > 2) {
        this.transactionChartDetails.forEach(element => {
          this.getTxnChartType.push({ "id": element.ChartofAccountids, "text": element.ChartAccountDesc, "name": element.ChartOfAccountNames });
          this.itemsTxnChartType = this.getTxnChartType;
        });
      }
    });
  }

  //Transaction selected dropdown
  bpTxnTypeSelected(value) {
    this.selectedTxnTypeId = value.id;
    this.getTransactionChartDetails(this.selectedTxnTypeId);
    this.selectedTxnTypeValue = value.text;

  }

  // chart selected dropdown
  chartOfAccSelect(object: any) {
    if (object.selectedOptions[0].value == '') {
      this.selectedchartAccValue = "";
    }
    else {
      this.selectedchartAccId = object.selectedOptions[0].value;
      this.selectedchartAccValue = object.selectedOptions[0].innerText;
      this.chartText = this.selectedchartAccValue.split('-', 2);
    }
  }

  cancel() {
    this.enterbusinessProcessesForm = false;
    this.addBusinessProcessesForm.controls['code'].enable();
    this.addBusinessProcessesForm.reset();
    this.businessProcessesForm.reset();
    this.getBusinessProcesses(this.p);
    this.showPage = true;
  }

  //cancel under table
  cancelAddLineItems() {
    this.addBusinessProcessesForm.controls['txnDropDown'].reset();
    this.addBusinessProcessesForm.controls['txnCode'].reset();
    this.addBusinessProcessesForm.controls['lineItemCode'].reset();
    this.itemsTxnChartType = [];
    this.selectedchartAccValue = [];
    this.addBusinessProcessesForm.controls['chatOfAccountDropDown'].setValue("");
    this.addMoreAssociationsButton = true;
    this.addMoreAssociationsForm = false;
    this.showLineItem = true;
  }

  addNewBusinessCode() {
    this.materialscriptService.material();
    this.selectedChartOfAccount = '';
    this.defaultStatus = "Active";
    this.addBusinessProcessesForm.controls['code'].enable();
    this.addMoreAssociationsButton = false;
    this.addMoreAssociationsForm = true;
    this.selectedTxnTypeDetails = [];
    this.getBusinessProcesses(this.p);
    this.showPage = true;
    this.enterbusinessProcessesForm = true;
    //this.addBusinessProcessesForm.reset();
    this.businessProcessesForm.reset();
    this.showUpdate = false;
    this.showAdd = true;
    if (this.selectedTxnTypeDetails.length == 0) {
      this.showLineItem = false;
    }
  }

  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }

  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }
}