import { Component, OnInit, ViewChild, ElementRef, Renderer, ChangeDetectorRef } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators, FormArray, NgForm, Validator } from '@angular/forms';
import { IRefundRequest } from './models/RefundRequest';
import { IRefundResponse } from './models/RefundResponse';
import { RefundService } from './services/refund.service';
import { IPaging } from '../shared/models/paging';
import { CommonService } from '../shared/services/common.service';
import { ICommon, ICommonResponse } from '../vehicles/models/vehicleresponse';
import { Data, RouterModule, Router } from '@angular/router';
import { DatePipe } from '@angular/common'
import { ActivitySource, BalanceTypes, SubSystem, BalanceType, Features, Actions, defaultCulture } from '../shared/constants';
import { PaymentMode } from '../payment/constants';
import { IBalanceRequest } from '../csc/customerdetails/models/balancerequest';
import { IBalanceResponse } from '../csc/customerdetails/models/balanceresponse';
import { IUserresponse } from '../shared/models/userresponse';
import { RefundStatus } from './constants';
import { SessionService } from '../shared/services/session.service';
import { IRefundProcess } from './models/RefundProcess';
import { RefundContextService } from './services/RefundContextService';
import { IUserEvents } from "../shared/models/userevents";
import { IMyDrpOptions, IMyInputFieldChanged, IMyInputFocusBlur } from 'mydaterangepicker';
import { DatePickerFormatService } from '../shared/services/datepickerformat.service';
import { IMyOptions, IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";



@Component({
  selector: 'app-refund-queue',
  templateUrl: './refund-queue.component.html',
  styleUrls: ['./refund-queue.component.css']
})


export class RefundQueueComponent implements OnInit {
  invalidDateRange: boolean;
  isError: boolean;
  refundQueueFrom: FormGroup
  refundRequest: IRefundRequest;
  balanceRequest: IBalanceRequest;
  balanceResponse: IBalanceResponse;
  refundResponse: IRefundResponse[];
  objrefundResponse: IRefundResponse[];
  refundResponseSelected: IRefundResponse[] = <IRefundResponse[]>[];
  paging: IPaging;
  bsRangeValue: any;
  selectedValue: string;
  commonRequest: ICommonResponse = <ICommonResponse>{};
  objCommonResponseRefundSates: ICommonResponse[];
  items = [];
  p: number;
  pageSize: number = 10;
  pageItemNumber: number = 10;
  totalRecordCount: number = 0;
  startItemNumber: number = 1;
  endItemNumber: number;
  checkall: boolean = false;
  check: boolean = false;
  amount: number;
  modeOfPayment: string;
  isSaveDisabled: boolean = false;
  isDisplay: boolean = false;
  subSystem: string;
  ischecked: boolean;
  menuHeading: string = "CSC";
  menuSubSystem: string = "CSC Refunds";
  disableButton: boolean;
  disableSaveButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  iRefundProcessResponse: IRefundProcess[] = <IRefundProcess[]>[];
  modeOfRefunds: any = [{
    Id: "0",
    Value: "Check"
  }, {
    Id: "1",
    Value: "CreditCard"
  }];

  calOptions: ICalOptions = <ICalOptions>{};
  isParentSelected: boolean = false;
  myDateRangePickerOptions: ICalOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: false, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true, showClearBtn: false, showApplyBtn: false, showClearDateRangeBtn: false };
  constructor(private refundService: RefundService,
    private common: CommonService, private router: Router,
    private sessionContex: SessionService,
    private refundContextService: RefundContextService, private datePickerFormatService: DatePickerFormatService,
    private cdr: ChangeDetectorRef,
    private materialscriptService: MaterialscriptService) { }
  sessionContextResponse: IUserresponse;
  @ViewChild('refundForm') public refundForm: NgForm;

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.sessionContextResponse = this.sessionContex.customerContext
    this.refundQueueFrom = new FormGroup({
      AccountId: new FormControl('', []),
      Status: new FormControl('', []),
      payType: new FormControl('', []),
      RRID: new FormControl('', []),
      bsRangeValue: new FormControl('', [Validators.required]),
    });

    let userEvents = <IUserEvents>{};

    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    if (this.router.url.indexOf('csc') > 0) {
      userEvents.FeatureName = Features[Features.REFUNDQUEUE];
      this.subSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = "CSC";
      this.menuSubSystem = "Refunds";
    } else if (this.router.url.indexOf('tvc') > 0) {
      userEvents.FeatureName = Features[Features.TVCREFUNDQUEUE];
      this.subSystem = SubSystem[SubSystem.TVC];
      this.menuHeading = "TVC";
      this.menuSubSystem = "Refunds";
    } else {

      userEvents.FeatureName = Features[Features.REFUNDQUEUE];
      this.subSystem = SubSystem[SubSystem.CSC];
      this.menuHeading = "CSC";
      this.menuSubSystem = "Refunds";
    }
    // Check Icn avaliability
    if (this.sessionContextResponse.icnId == 0) {

      this.showErrorMsg("ICN is not assigned to do transactions.");
      this.isSaveDisabled = true;
    }

    this.getRefundStates(userEvents);
    if (this.menuHeading === "TVC") {
      this.disableButton = !this.common.isAllowed(Features[Features.TVCREFUNDQUEUE], Actions[Actions.SEARCH], '');
      this.disableSaveButton = !this.common.isAllowed(Features[Features.TVCREFUNDQUEUE], Actions[Actions.UPDATE], '');


    } else {

      this.disableButton = !this.common.isAllowed(Features[Features.REFUNDQUEUE], Actions[Actions.SEARCH], '');
      this.disableSaveButton = !this.common.isAllowed(Features[Features.REFUNDQUEUE], Actions[Actions.UPDATE], '');

    }
    this.refundQueueFrom.patchValue({
      Status: "QUEUED",
    });
    let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.refundQueueFrom.patchValue({
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
    this.bindData(this.p, null);
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bindData(this.p, null);
  }

  getRefundStates(userEvents: any) {
    this.commonRequest.LookUpTypeCode = "mst_refundrequeststate";
    this.common.getLookUpByParentLookupTypeCode(this.commonRequest, userEvents).subscribe(
      resut => {
        this.objCommonResponseRefundSates = resut.filter(f => f.LookUpTypeCode != "FAILED" && f.LookUpTypeCode != "INCOMPLETE");
      });
  }

  resetData() {
    this.refundResponse = <IRefundResponse[]>[];
    this.bindData(1, null);
    this.check = false;
    this.checkall = false;
    this.materialscriptService.material();
  }

  searchReset() {
    this.materialscriptService.material();        
    // this.refundQueueFrom = new FormGroup({
    //     AccountId: new FormControl(''),
    //     Status: new FormControl(''),
    //     payType: new FormControl(''),
    //     RRID: new FormControl(''),
    //     bsRangeValue: new FormControl('')
    // });
    this.refundQueueFrom.patchValue({
      Status: "QUEUED",
      AccountId: '',
      payType: '',
      RRID: '',
      bsRangeValue: ''
    });
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    let date = new Date();
    this.refundQueueFrom.patchValue({
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

    this.p = 1;
    this.refundResponse = [];
    this.bindData(this.p, null);
  }

  bindData(pageNumber: number, userEvents: any) {
    this.refundResponseSelected = [];
    this.isParentSelected = false;
    this.refundResponse = [];
    let strDate;
    if (this.refundQueueFrom.controls['bsRangeValue'].value == '') {
      strDate = this.bsRangeValue;
    }
    else {
      strDate = this.refundQueueFrom.controls['bsRangeValue'].value;
    }
    //let strDateRange = strDate.slice(","); 
    let strDateRange = this.datePickerFormatService.getFormattedDateRange(strDate);
    let fromDate = new Date(strDateRange[0]);
    let toDate = new Date(strDateRange[1]);
    this.refundRequest = <IRefundRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = pageNumber;
    this.paging.PageSize = this.pageSize;
    this.paging.ReCount = 0;
    this.paging.SortColumn = "CustomerId";
    this.paging.SortDir = 1;
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.PageIndex = this.paging;
    this.refundRequest.SubSystem = this.subSystem;
    this.refundRequest.LoginId = this.sessionContextResponse.loginId;
    this.refundRequest.LoggedUserID = this.sessionContextResponse.userId;
    this.refundRequest.LoggedUserName = this.sessionContextResponse.userName;
    this.refundRequest.IsSearchEventFired = false;
    this.refundRequest.ActivitySource = ActivitySource[ActivitySource.Internal];

    let accountId: number;
    let rrId: number;
    if (this.refundQueueFrom.controls['AccountId'].value == null)
      accountId = 0;
    else
      accountId = this.refundQueueFrom.controls['AccountId'].value;
    this.refundRequest.AccountID = accountId;
    if (this.refundQueueFrom.controls['RRID'].value == null)
      rrId = 0;
    else
      rrId = this.refundQueueFrom.controls['RRID'].value;
    this.refundRequest.AccountID = accountId;
    this.refundRequest.RRID = rrId;
    this.refundRequest.RefundRequestState = this.refundQueueFrom.controls["Status"].value;
    var nextScheduleDate = toDate;
    nextScheduleDate.setDate(nextScheduleDate.getDate() + 1);
    this.refundRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    this.refundRequest.EndDate = nextScheduleDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    switch (this.refundQueueFrom.controls["payType"].value) {
      case "":
        this.refundRequest.ModeofPayment = "";
        break;
      case "CHEQUE":
        this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.Cheque];
        break;
      case "CREDITCARD":
        this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.CreditCard];
        break;
    }
    this.refundResponse = <IRefundResponse[]>[];
    this.refundService.getRefundQueue(this.refundRequest, userEvents).subscribe(
      res => {
        this.refundResponse = res;

        if (this.refundResponse.length > 0) {
          this.isDisplay = true;
          if (this.refundResponse[0] != undefined) {
            this.totalRecordCount = this.refundResponse[0].TotalCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
            for (let i = 0; i < this.refundResponse.length; i++) {
              this.refundResponse[i].OriginalAmount = this.refundResponse[i].Amount;
              if (this.refundResponse[i].RefundRequestState != "QUEUED") {
                this.refundResponse[i].isProcessRefund = false;
                this.refundResponse[i].istxtAmountEnable = true;
                this.refundResponse[i].isModeOfPaymentEnable = true;
                this.refundResponse[i].isSelectIndividual = false;
              }
              else {
                this.refundResponse[i].isProcessRefund = true;
                this.refundResponse[i].istxtAmountEnable = true;
                this.refundResponse[i].isModeOfPaymentEnable = false;
                this.refundResponse[i].isSelectIndividual = true;
              }

            }
          }
        }
        // else {
        //     this.refundResponse == null;
        //     this.isDisplay = false;
        // }

      });

    if (this.refundQueueFrom.controls["Status"].value.toString().toUpperCase() == RefundStatus[RefundStatus.CONVERTED].toString() ||
      this.refundQueueFrom.controls["Status"].value.toString().toUpperCase() == RefundStatus[RefundStatus.CANCELLED].toString() ||
      this.refundQueueFrom.controls["Status"].value.toString().toUpperCase() == RefundStatus[RefundStatus.PROCESSED].toString()) {
      this.isDisplay = false
    }
  }

  refundQueueSearch() {
    if (!this.invalidDateRange && this.refundQueueFrom.valid) {
      this.p = 1;
      this.isParentSelected = false;
      let userEvents = <IUserEvents>{};
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      if (this.subSystem === "CSC") {
        userEvents.FeatureName = Features[Features.REFUNDQUEUE];
      } else {
        userEvents.FeatureName = Features[Features.TVCREFUNDQUEUE];
      }

      this.bindData(this.p, userEvents);
    }
  }

  onCheckChange(event, value: IRefundResponse) {
    if (event == "on") {
      this.refundResponse.filter(x => x.RRID == value.RRID)[0].checked = true;
    }
    else {
      this.refundResponse.filter(x => x.RRID == value.RRID)[0].checked = false;
    }
  }

  refundQueueSave() {
    if (this.refundForm.valid) {
      this.items = [];
      let status = false;
      if (this.refundResponseSelected.length > 0) {
        for (let i = 0; i < this.refundResponseSelected.length; i++) {
          if (this.refundResponseSelected[i].Amount == 0) {

            this.showErrorMsg("Enter valid amount");
            return;
          }
          this.refundRequest = <IRefundRequest>{};
          if (this.refundResponseSelected[i].checked) {
            this.balanceRequest = <IBalanceRequest>{};
            this.balanceResponse = <IBalanceResponse>{};
            this.balanceRequest.CustomerId = this.refundResponseSelected[i].AccountID;
            switch (this.refundResponseSelected[i].RefundType) {
              case "CORR":
                this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.CollBal]
                break;
              case "RR":
                this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.RefundBal];
                break;
              case "OVERPAYMENT":
                this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.VioDepBal];
                break;
              case "ADMINHEARING":
                this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.ADMHERIFEE];
                break;
            }
            let accountId; let rrId;
            if (this.refundResponseSelected[i].AccountID == null)
              accountId = 0;
            else
              accountId = this.refundResponseSelected[i].AccountID;
            this.refundRequest.AccountID = accountId;
            if (this.refundResponseSelected[i].RRID == null)
              rrId = 0;
            else
              rrId = this.refundResponseSelected[i].RRID;
            this.refundRequest.AccountID = accountId;
            this.refundRequest.RRID = rrId;
            this.refundRequest.Amount = this.refundResponseSelected[i].Amount.toString();
            this.refundRequest.RefundType = this.refundResponseSelected[i].RefundType;
            this.refundRequest.BalanceType = this.balanceRequest.BalanceType;
            this.refundRequest.RefundRequestState = this.refundQueueFrom.controls["Status"].value;
            switch (this.refundResponseSelected[i].ModeofPayment.toUpperCase()) {
              case "CHEQUE":
                this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.Cheque];
                break;
              case "CREDITCARD":
                this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.CreditCard];
                break;
            }
            this.items.push(this.refundRequest);
            status = true;
          } else {

            this.showErrorMsg("Error while getting balance");
          }

        }

        //Check Icn avaliability
        if (this.sessionContextResponse.icnId == 0) {

          this.showErrorMsg("ICN is not assigned to do transactions.");
          this.isSaveDisabled = true;
          return;
        }
        else {
          // if (!Error) {
          let userEvents = <IUserEvents>{};
          userEvents.ActionName = Actions[Actions.UPDATE];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = 0;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;
          if (this.subSystem === "CSC") {
            userEvents.FeatureName = Features[Features.REFUNDQUEUE];
          } else {
            userEvents.FeatureName = Features[Features.TVCREFUNDQUEUE];
          }
          this.refundRequest.SubSystem = this.subSystem;
          this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
          this.refundRequest.CreatedDate = new Date();
          this.refundRequest.objIlRefundQueue = this.items.map(x => Object.assign({}, x));
          this.refundService.updateBulkRefundQueue(this.refundRequest, userEvents).subscribe(
            response => {
              if (response) {
                this.showSucsMsg("Successfully saved the refund queue details");
                this.bindData(this.p, null);

              } else {
                this.showErrorMsg("Error while updating refund details.");
              }
            },
            (err) => {

              this.showErrorMsg(err.statusText);
            });

        }
      }
      else {

        this.showErrorMsg("Select at least one account");
      }
    }
  }

  onChnage(amount, value: IRefundResponse) {

    if (amount == 0 || amount == '') {
      this.showErrorMsg("Refund Amount should not be empty or zero");
    }
    //if(amount.Validator[new ])
    this.refundResponse.filter(x => x.RRID == value.RRID)[0].Amount = amount;
  }



  onChangeModeofPayment(modeOfPayment, value: IRefundResponse) {
    if (modeOfPayment == "0") {
      if (this.refundResponseSelected.length > 0) {
        this.refundResponseSelected.filter(x => x.RRID == value.RRID)[0].ModeofPayment = PaymentMode[PaymentMode.Cheque];
      }
      else {
        this.refundResponse.filter(x => x.RRID == value.RRID)[0].ModeofPayment = PaymentMode[PaymentMode.Cheque];
      }

    } else {
      if (this.refundResponseSelected.length > 0) {
        this.refundResponseSelected.filter(x => x.RRID == value.RRID)[0].ModeofPayment = PaymentMode[PaymentMode.CreditCard];
      }
      else {
        this.refundResponse.filter(x => x.RRID == value.RRID)[0].ModeofPayment = PaymentMode[PaymentMode.CreditCard];
      }
    }
  }


  refundProcess(value: IRefundResponse) {
    if (value.Amount == 0) {
      this.showErrorMsg("Refund Amount should not be empty or zero");
      return;
    }
    else {
      this.balanceRequest = <IBalanceRequest>{};
      this.balanceResponse = <IBalanceResponse>{};
      this.balanceRequest.CustomerId = value.AccountID;
      switch (value.RefundType) {
        case "CORR":
          this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.CollBal]
          break;
        case "RR":
          this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.RefundBal];
          break;
        case "OVERPAYMENT":
          this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.VioDepBal];
          break;
        case "ADMINHEARING":
          this.balanceRequest.BalanceType = BalanceTypes[BalanceTypes.ADMHERIFEE];
          break;
      }
      this.refundService.getBalanceByBalanceType(value.AccountID, this.balanceRequest.BalanceType).subscribe(
        res => {
          if (res) {
            this.balanceResponse = res;
            if (this.balanceResponse) {
              if (this.subSystem.toString().toUpperCase() == SubSystem[SubSystem.TVC].toString()) {
                if ((this.balanceResponse.BalanceAmount + this.balanceResponse.RequestedAmount) < value.Amount) {
                  this.showErrorMsg("Refund Amount should not exceed account balance.");
                  return;
                }
                else {
                  this.router.navigate(['/tvc/issue-refund'], { queryParams: { rrId: value.RRID } });
                }
              }
              else {
                if (value.Amount > this.balanceResponse.RefundBalance) {
                  this.showErrorMsg("Refund Amount should not exceed account balance.");
                  return;
                }
                else {
                  this.router.navigate(['/csc/issue-refund'], { queryParams: { rrId: value.RRID } });
                }
              }

            }
          } else {
            this.showErrorMsg("Error while getting balance");
          }
        },
        (err) => {
          this.showErrorMsg(err.statusText);
        },
      );
    }
  }

  checkAllClick(event) {
    for (var i = 0; i < this.refundResponse.length; i++) {
      if (this.refundResponse[i].RefundRequestState == "QUEUED") {
        let isChecked: boolean = event.target.checked;
        this.refundResponse[i].checked = isChecked;
        var index = this.refundResponseSelected.findIndex(x => x.RRID == this.refundResponse[i].RRID);
        if (index > -1 && !isChecked) {
          this.refundResponse[i].istxtAmountEnable = true;
          this.refundResponseSelected = this.refundResponseSelected.filter(item => item.RRID != this.refundResponse[i].RRID);
          this.refundResponse[i].checked = false;

        }
        else if (isChecked) {
          this.refundResponse[i].istxtAmountEnable = false;
          var index = this.refundResponseSelected.findIndex(x => x.RRID == this.refundResponse[i].RRID);
          if (index === -1) {
            this.refundResponseSelected.push(this.refundResponse[i]);
            this.refundResponse[i].checked = true;
          }
        }
      }
    }
  }

  checkboxCheckedEvent(object: IRefundResponse, event, rowindex) {
    var index = this.refundResponseSelected.findIndex(x => x.RRID == object.RRID);
    this.refundResponse[rowindex].Amount = object.Amount;
    this.refundResponse[rowindex].ModeofPayment = object.ModeofPayment;
    if (event.target.checked) {
      object.istxtAmountEnable = false;
      if (index == -1) {
        this.refundResponseSelected.push(object);
        object.checked = true;
        var result = this.refundResponse.filter(x => x.checked == true).length;
        if (result == this.refundResponse.length)
          this.isParentSelected = true;
      }
    } else {
      object.istxtAmountEnable = true;
      object = this.refundResponse[rowindex];
      //object.ModeofPayment = this.refundResponse[rowindex].ModeofPayment;
      this.isParentSelected = false;
      if (index > -1) {
        this.refundResponseSelected.splice(index, 1);
        object.checked = false;
      }
    }
  }

  printFrom() {
    this.items = [];
    this.refundContextService.setRefund(null);
    let status = false;
    if (this.refundResponseSelected.length > 0) {
      for (let i = 0; i < this.refundResponseSelected.length; i++) {
        this.refundRequest = <IRefundRequest>{};
        if (this.refundResponseSelected[i].Amount == 0) {

          this.showErrorMsg("Enter valid amount");
          return;
        }
        if (this.refundResponseSelected[i].checked) {
          let accountId; let rrId;
          if (this.refundResponseSelected[i].AccountID == null)
            accountId = 0;
          else
            accountId = this.refundResponseSelected[i].AccountID;
          this.refundRequest.AccountID = accountId;
          if (this.refundResponseSelected[i].RRID == null)
            rrId = 0;
          else
            rrId = this.refundResponseSelected[i].RRID;
          this.refundRequest.AccountID = accountId;
          this.refundRequest.RRID = rrId;
          this.refundRequest.Amount = this.refundResponseSelected[i].Amount.toString();
          this.refundRequest.RefundType = this.refundResponseSelected[i].RefundType;
          this.refundRequest.RefundRequestState = this.refundQueueFrom.controls["Status"].value;
          switch (this.refundResponseSelected[i].ModeofPayment.toUpperCase()) {
            case "CHEQUE":
              this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.Cheque];
              break;
            case "CREDITCARD":
              this.refundRequest.ModeofPayment = PaymentMode[PaymentMode.CreditCard];
              break;
          }
          this.items.push(this.refundRequest);
          status = true;
        } else {
          this.showErrorMsg("Error while getting balance");
        }

      }
      this.refundRequest.SubSystem = this.subSystem;
      this.refundRequest.UpdatedUser = this.sessionContextResponse.userName;
      this.refundRequest.CreatedDate = new Date();
      this.refundRequest.objIlRefundQueue = this.items.map(x => Object.assign({}, x));
      this.refundService.refundRequestCustomers_PrintFormDetails_Get(this.refundRequest).subscribe(
        response => {
          if (response) {
            this.iRefundProcessResponse = response;
            this.refundContextService.setRefund(this.iRefundProcessResponse);

            var strSplitPath = window.location.href.split("#");
            let navigatePath: string = "";

            if (this.subSystem == "TVC") {
              navigatePath = (strSplitPath[0] + "#/tvc/violator-refund-form").toString();
            }
            else {
              navigatePath = (strSplitPath[0] + "#/csc/customer-refund-form").toString();
            }

            if (navigatePath) {
              var newWindow = window.open(navigatePath);
            }
            this.bindData(this.p, null);

          } else {
            this.showErrorMsg("Error while printing refund details.");
          }
        },
        (err) => {
          this.showErrorMsg(err.statusText);
        });
    }
    else {
      this.showErrorMsg("Select at least one account");
    }
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
  onInputFieldRangeChanged(event: IMyInputFieldChanged) {

    if (event.value != "" && !event.valid) {
      this.invalidDateRange = true;
    }
    else
      this.invalidDateRange = false;

  }
  onInputFocusBlur(event: IMyInputFocusBlur): void {
    if (event.value == "")
      this.invalidDateRange = false;
  }
}
