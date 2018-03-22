import { IUserEvents } from './../../shared/models/userevents';
import { Subsystem } from './../../sac/constants';
import { CommonService } from './../../shared/services/common.service';
import { AccountStatus } from './../../payment/constants';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivitySource, Adjustments, AdjustmentCategory, TollType, SubSystem, ApplicationTransactionTypes, RevenueCategory, Features, Actions, defaultCulture } from '../../shared/constants';
import { CustomerDetailsService } from './services/customerdetails.service';
import { ApplicationParameterkey } from '../../shared/applicationparameter';
import { SessionService } from '../../shared/services/session.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { AccountInfoComponent } from "../../shared/accountprimaryinfo/account-info.component";
import { Router } from '@angular/router';
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;
@Component({
  selector: 'app-account-adjustments',
  templateUrl: './account-adjustments.component.html',
  styleUrls: ['./account-adjustments.component.css']
})
export class AccountAdjustmentsComponent implements OnInit {
  invalidDate: boolean;
  selectedEntry;
  customerId: number;
  accountAdjustments: any; //
  SystemActivity: any;
  accountAdjustmentDetails: any[];
  UserInputs: IAddUserInputs = <IAddUserInputs>{};
  lastAdjustmentDetails: any;
  adjustmentTypeDropdown: any[];
  adjustmentId: number;
  reasonCodes: any[];
  adjustmentMaxLimit: number = 0;
  searchForm: FormGroup;
  accountAdjustmentForm: FormGroup;
  bsRangeValue: any;

  sucessMessage: string;
  lastAdjustmentDate: Date;
  lastAdjustmentAmount: number;

  p: number;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;


  customerStatus: string = '';
  customerParentPlan: string = '';
  icnId: number = 0;
  boolVisible: boolean = false;
  customerInformationres: any;
  revenueCategory: string;
  adjustmentCategory: string = '';
  boolShowHide: boolean = false;
  commentTextLength: number = 255;
  sessionContextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  validateNumberPattern = "^[0-9]*(\.)?[0-9]{1,2}$";
  disableSearchButton: boolean = false;
  disableAdjustmentButton: boolean = false;

  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '330px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false

  };

  todayDate: Date = new Date();
  startDateRange = this.todayDate.setFullYear(this.todayDate.getFullYear());
  toDayDate: Date = new Date();
  start = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate());
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate());


  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  @ViewChild(AccountInfoComponent) accountSummaryComp;

  constructor(private customerDetailsService: CustomerDetailsService,
    private commonService: CommonService,
    private sessionContext: SessionService,
    private customerContext: CustomerContextService,
    private cdr: ChangeDetectorRef,
    private datePickerFormat: DatePickerFormatService,
    private router: Router, private materialscriptService: MaterialscriptService) {

    this.sessionContextResponse = this.sessionContext.customerContext;
    //login user inputs
    this.UserInputs.LoginId = this.sessionContextResponse.loginId;
    this.UserInputs.UserId = this.sessionContextResponse.userId;
    this.UserInputs.UserName = this.sessionContextResponse.userName;
    this.UserInputs.AccountId = this.sessionContextResponse.userId;
    this.icnId = this.sessionContextResponse.icnId;
  }

  ngOnInit() {
    this.materialscriptService.material();
    this.checkRolesandPrivileges();
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];


    this.searchForm = new FormGroup({
      'bsRangeValue': new FormControl('', [Validators.required])
    });

    let date = new Date();
    this.searchForm.patchValue({
      bsRangeValue: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });

    this.accountAdjustmentForm = new FormGroup({
      'customerId': new FormControl('', [Validators.required]),
      'amount': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateNumberPattern)])),
      'rdoAdjustmentType': new FormControl('', [Validators.required]),
      'ddlReasonCode': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
    });

    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.customerId = this.customerContextResponse.AccountId;
    }
    this.p = 1;
    this.bindCustomerInfo();
    this.bindAdjustmentsDetails(true, true, this.p);
    this.bindLastAdjustmentDetails();

  }

  checkRolesandPrivileges() {
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.ACCOUNTADJUSTMENTS], Actions[Actions.SEARCH], "");
    this.disableAdjustmentButton = !this.commonService.isAllowed(Features[Features.ACCOUNTADJUSTMENTS], Actions[Actions.CREATE], "");
  }

  Search: number = 0;
  adjustmentType = [
    {
      id: 0,
      Value: 'Debit'
    },
    {
      id: 1,
      Value: 'Credit'
    }
  ];

  accountStatusArray = [
    'CORR',
    'COWO',
    'COCL',
    'RR',
    'WO',
    'CL'
  ];

  resetSearch() {
    //debugger;
    //this.searchForm.reset();
    // this.searchForm.controls['bsRangeValue'].value == "";
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.searchForm.patchValue({
      bsRangeValue: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.accountAdjustmentDetails = [{}];
    this.dataLength = 0;
    this.p = 1;
    this.pageItemNumber = 10;
    this.totalRecordCount = 0;
    this.bindAdjustmentsDetails(true, true, this.p);
  }

  getAdjustmentDetails() {
    if (!this.invalidDate && this.searchForm.valid) {
      //prepare audit log for view.
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ACCOUNTADJUSTMENTS];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.customerId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.bindAdjustmentsDetails(true, true, this.p, userEvents);
    }
    else {

    }
  }

  bindAdjustmentsDetails(boolIsView, boolIsSearch, pageNumber: number, userEvents?: IUserEvents) {


    let fromDate;
    let toDate;
    if (this.searchForm.controls['bsRangeValue'].value == '') {
      fromDate = this.start;
      toDate = this.end;
    }
    else {
      let strDate = this.searchForm.controls['bsRangeValue'].value;
      if (strDate != "" && strDate != null) {
        let date = this.datePickerFormat.getFormattedDateRange(this.searchForm.controls['bsRangeValue'].value)
        let firstDate = date[0];
        let lastDate = date[1];
        fromDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
        toDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      }
      else {
        fromDate = this.start;
        toDate = this.end;
      }
    }
    //let strDateRange = strDate.slice(",");
    // fromDate = new Date(strDateRange[0]);
    // toDate = new Date(strDateRange[1]);
    this.accountAdjustments = <any>{};
    this.accountAdjustments.CustomerId = this.customerId;
    this.accountAdjustments.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.accountAdjustments.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g, "");
    this.accountAdjustments.PageNumber = pageNumber;
    this.accountAdjustments.PageSize = 10;
    this.accountAdjustments.SortColumn = "AdjustmentDate";
    this.accountAdjustments.SortDir = 1;
    this.SystemActivity = <any>{};
    this.SystemActivity.LoginId = this.UserInputs.LoginId;
    this.SystemActivity.UserId = this.UserInputs.UserId;
    this.SystemActivity.IsViewed = boolIsView;
    this.SystemActivity.IsSearch = boolIsSearch;
    this.SystemActivity.User = this.UserInputs.UserName;
    this.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];;
    this.accountAdjustments.SystemActivity = this.SystemActivity;
    this.customerDetailsService.getAdjustmentDetails(this.accountAdjustments, userEvents).subscribe(
      res => {
        this.accountAdjustmentDetails = res;
        if (this.accountAdjustmentDetails.length > 0) {
          // debugger;
          // console.log(this.accountAdjustmentDetails);
          this.totalRecordCount = this.accountAdjustmentDetails[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          } else {
            this.endItemNumber = this.pageItemNumber;
          }
          // console.log(this.accountAdjustmentDetails);
          this.dataLength = this.accountAdjustmentDetails.length
        }
      });
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
    this.bindAdjustmentsDetails(true, true, this.p);
  }

  //bind last adjustment details.
  bindLastAdjustmentDetails() {
    this.customerDetailsService.getLastAdjustmentWithDateTime(this.customerId).subscribe(
      res => {
        this.lastAdjustmentDetails = res;
        console.log(this.lastAdjustmentDetails);
        if (this.lastAdjustmentDetails) {
          this.lastAdjustmentDate = this.lastAdjustmentDetails.AdjustmentDate;
          this.lastAdjustmentAmount = this.lastAdjustmentDetails.Amount;
        }
      });
  }

  bindCustomerInfo() {

    //prepare audit log for view.
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.customerDetailsService.bindCustomerInfoDetails(this.customerId, userEvents).subscribe(
      res => {
        this.customerInformationres = res;
      }, (err) => { }
      , () => {
        if (this.customerInformationres) {
          this.customerStatus = this.customerInformationres.AccountStatus;
          this.customerParentPlan = this.customerInformationres.ParentPlanName;
          this.revenueCategory = this.customerInformationres.RevenueCategory;
        }

      }
    )
  }

  populateAdjustmentBlock() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 1000);
    if (this.revenueCategory.toUpperCase() == RevenueCategory[RevenueCategory.NonRevenue.toString()].toUpperCase()) {
      alert("You have no privileges to access");
      return false;
    }
    else if (this.accountStatusArray.indexOf(this.customerStatus) !== -1) {
      alert("The account status is not in Active. You are not allowed to do this operation");
      return false;
    }
    else {
      this.accountAdjustmentForm.reset();
      this.accountAdjustmentForm.patchValue({
        customerId: this.customerId
      });
      this.bindReasonCodes(0);
      this.boolShowHide = !this.boolShowHide;
      this.getAdjustmentMaxLimit();
      this.Search = 0;
    }
  }

  cancel() {

    this.boolShowHide = !this.boolShowHide;
  }

  resetForm() {
    this.Search = 0;
    this.commentTextLength = 255;
    this.accountAdjustmentForm.reset();
    this.accountAdjustmentForm.patchValue({
      customerId: this.customerId,
      amount: '',
      rdoAdjustmentType: 0,
      description: ''
    });

    this.bindReasonCodes(0);
  }

  bindReasonCodes(adjustmentType: number) {
    debugger;
    this.reasonCodes = [{}];
    this.accountAdjustments = <any>{};
    if (adjustmentType == 0)
      this.accountAdjustments.DrCr_Flag = Adjustments[Adjustments.D.toString()];
    else
      this.accountAdjustments.DrCr_Flag = Adjustments[Adjustments.C.toString()];

    if (this.customerStatus.toUpperCase() == AccountStatus[AccountStatus.CO.toString()] || this.customerStatus.toUpperCase() == AccountStatus[AccountStatus.COPD.toString()]) {
      this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.Collection];
    }
    else {
      if (this.customerParentPlan.toUpperCase() == TollType[TollType.POSTPAID.toString()].toUpperCase()) {
        this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PostPaid.toString()];
      }
      else {
        this.accountAdjustments.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PrePaid.toString()];
      }
    }
    this.adjustmentCategory = this.accountAdjustments.AdjustmentCategory;
    this.accountAdjustments.CustomerId = this.UserInputs.UserId;
    this.accountAdjustments.strSubSystem = Subsystem[SubSystem.CSC.toString()];
    this.accountAdjustments.ISTripLvel = false;

    this.customerDetailsService.getAdjustmentTypeDetails(this.accountAdjustments).subscribe(
      res => {
        this.reasonCodes = res;
      });
  }



  descEvent(event: any) {
    this.commentTextLength = 255 - event.target.value.length
  }

  onSelectionChange(entry) {
    this.selectedEntry = entry;
    this.bindReasonCodes(entry);
  }

  makeAdjustments() {
    this.insertAdjustmentDetails();

  }

  insertAdjustmentDetails() {
    if (this.accountAdjustmentForm.valid) {
      $('#confirm-dialog').modal('show');
    }
    else {
      this.validateAllFormFields(this.accountAdjustmentForm);
      return;
    }
  }


  doAdjustments() {
    $('#confirm-dialog').modal('hide');
    $('#pageloader').modal('show');
    let list: string[] = this.accountAdjustmentForm.controls['ddlReasonCode'].value.split('-');
    this.accountAdjustments = <any>{};
    this.accountAdjustments.CustomerId = this.customerId;
    this.accountAdjustments.AdjustmentCategory = this.adjustmentCategory; // need to bind adjustment cateriry
    this.accountAdjustments.TxnType = list[0].toString();
    this.accountAdjustments.TxnTypeDesc = list[1].toString();
    this.accountAdjustments.Stmt_Literal = "ADJUSTMENT";
    this.accountAdjustments.Description = this.accountAdjustmentForm.controls['description'].value;
    this.accountAdjustments.User = this.UserInputs.UserName;
    this.accountAdjustments.AccStatusCode = this.customerStatus;
    let boolIsCollectionCustomer = this.accountAdjustments.AccStatusCode.toString().toUpperCase() == AccountStatus[AccountStatus.CO.toString()] || this.accountAdjustments.AccStatusCode.toUpperCase() == AccountStatus[AccountStatus.COPD.toString()] ? true : false;
    if (this.accountAdjustmentForm.controls['rdoAdjustmentType'].value == 0) {
      this.accountAdjustments.Amount = -1 * this.accountAdjustmentForm.controls['amount'].value;
      this.accountAdjustments.DrCr_Flag = "D";
    }
    else {
      this.accountAdjustments.Amount = this.accountAdjustmentForm.controls['amount'].value;
      this.accountAdjustments.DrCr_Flag = "C";
    }
    this.accountAdjustments.AdjustmentDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");

    if (this.accountAdjustments.DrCr_Flag == Adjustments[Adjustments.D.toString()]) {

      this.accountAdjustments.AppTxnTypeCode = boolIsCollectionCustomer ? ApplicationTransactionTypes[ApplicationTransactionTypes.COLLACADJDR.toString()] : this.customerParentPlan.toUpperCase() == TollType[TollType.POSTPAID.toString()].toUpperCase() ? ApplicationTransactionTypes[ApplicationTransactionTypes.CSCACADJDRPOST.toString()] : ApplicationTransactionTypes[ApplicationTransactionTypes.CSCACADJDR.toString()];

    } else {
      this.accountAdjustments.AppTxnTypeCode = boolIsCollectionCustomer ? ApplicationTransactionTypes[ApplicationTransactionTypes.COLLACADJCR.toString()] : this.customerParentPlan.toUpperCase() == TollType[TollType.POSTPAID.toString()].toUpperCase() ? ApplicationTransactionTypes[ApplicationTransactionTypes.CSCACADJCRPOST.toString()] : ApplicationTransactionTypes[ApplicationTransactionTypes.CSCACADJCR.toString()];
    }
    this.accountAdjustments.ICNId = this.icnId;
    this.accountAdjustments.IsPostpaidCustomer = this.customerParentPlan.toUpperCase() == TollType[TollType.POSTPAID.toString()].toUpperCase() ? true : false;
    this.accountAdjustments.SubSystem = SubSystem[SubSystem.CSC.toString()];
    this.accountAdjustments.IsApprovedUser = false; // need to add method
    this.SystemActivity = <any>{};
    this.SystemActivity.LoginId = this.UserInputs.LoginId;
    this.SystemActivity.UserId = this.UserInputs.UserId;
    this.SystemActivity.ActionCode = "ADJUSTMENT";
    this.SystemActivity.User = this.UserInputs.UserName;
    this.SystemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];;
    this.accountAdjustments.SystemActivity = this.SystemActivity;

    //prepare audit log for view.
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ACCOUNTADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.CREATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.customerDetailsService.insertAdjustments(this.accountAdjustments, userEvents).subscribe(
      res => {
        this.adjustmentId = res;
        if (this.adjustmentId > 0) {
          if (this.accountAdjustments.DrCr_Flag == 'C' && !this.accountAdjustments.IsApprovedUser && parseInt(this.accountAdjustmentForm.controls['amount'].value) > parseInt(this.adjustmentMaxLimit.toString())) {
            this.showSucsMsg('Adjustment request has been initiated for approval');
          }
          else {
            this.showSucsMsg('Adjustment has been done successfully');
            //refresh customer info block.
            this.accountSummaryComp.refreshAccountInformation();
            this.accountSummaryComp.refreshPaymentAmountDetails();
          }
          this.cancel();
        }
        $('#pageloader').modal('hide');
        this.bindAdjustmentsDetails(true, true, this.p);
        this.bindLastAdjustmentDetails();
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
        $('#pageloader').modal('hide');
      }
      , () => {
      });

  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}

        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  getAdjustmentMaxLimit(): void {
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.AdjustmentMaxLimit).subscribe(res => { this.adjustmentMaxLimit = res });
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
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.searchForm.controls["bsRangeValue"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }


}

export interface IAddUserInputs {
  UserName: string
  LoginId: number
  UserId: number
  AccountId: number
}

