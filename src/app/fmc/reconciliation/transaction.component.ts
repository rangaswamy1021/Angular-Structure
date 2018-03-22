import { Component, OnInit } from '@angular/core';
import { ReconciliationService } from "./services/reconciliation.service";
import { SessionService } from "../../shared/services/session.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ITransactionReq } from "./models/transactionreq";
import { ITransactionRes } from "./models/transactionres";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CommonService } from "../../shared/services/common.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { Actions, LookupTypeCodes, ActivitySource, Features, defaultCulture } from '../../shared/constants';
import { IMyInputFieldChanged } from "mydaterangepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";
//import { IMyDpOptions } from "mydatepicker";
declare var $: any;
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  invalidDate: boolean = false;
  grandTripReconTotal: any = 0;
  grandTripRecontCount: any = 0;
  grandTripCount: any;
  countTrxnPostedTotal1: any = 0;
  TripReconTotal1: any = 0;
  tripReconLinkedRes: any[];
  tripReconRes: any[];
  finalTrxnPostedTotal: any = 0;
  finalCount: any = 0;
  trxnPostedTotal1: any = 0;
  totalCount: any = 0;
  trxnPostedLinkedRes: any[];
  // selectedValue: any;
  countTrxnPostedTotal: any = 0;
  countTotal: any = 0;
  TrxnPostedTotal: any = 0;
  TripReconTotal: any = 0;
  todayDate: Date;
  dateValue: Date[];
  tollTransName: string;
  transType: number;
  tollName: string = "Transactions";
  TrxnPosted: Array<any> = [];
  trxnPostedRes: Array<any> = [];
  TripRecon: Array<any> = [];
  tollTypes: ICommonResponse[];
  transactionLength: any;
  selectTranactionDrop: any;
  selectedTransaction: any;
  timePeriod: any;
  transactionForm: FormGroup;
  startDate: any;
  endDate: any;
  systemActivities: ISystemActivities;
  transactionreq: ITransactionReq = <ITransactionReq>{};
  transactionres: ITransactionRes[] = [];
  disableSubmit: boolean;
  sessionContextResponse: IUserresponse;
  locations = [];
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: true,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false,
    showClearDateBtn: false
  };
  AckTransaction: any;
  cntReceivedTotal:number=0;
  cntAckTotal:number=0;
  cntErrorTotal:number=0;
  rowcount:number=0;
  dateFormatValidator = "^\\(([0]{2})\\-[ ]([0]{2})[-]([0]{4}))$";
  dateRange;
  constructor(private reconciliationService: ReconciliationService, private datePickerFormatService: DatePickerFormatService, private context: SessionService, private commonService: CommonService, private router: Router) { }
  ngOnInit() {
    this.transactionForm = new FormGroup({
      "TransactionType": new FormControl(''),
      "timePeriod": new FormControl('', [Validators.required]),
    })
    this.sessionContextResponse = this.context.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.TOLLRECONCILIATION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.sessionContextResponse = this.context.customerContext;
    this.commonService.getLocations(userEvents).subscribe(res => { });
    this.disableSubmit = !this.commonService.isAllowed(Features[Features.TOLLRECONCILIATION], Actions[Actions.SEARCH], "");
    this.dateBind();
    this.todayDate = new Date(Date.now());
    this.transType = 0;
    this.tollTransName = "Transactions";
    this.getTransaction();
    this.transactionForm.controls['TransactionType'].setValue(0);
    this.commonService.getTollTypesLookups().subscribe(res => {
      this.tollTypes = res;
    })
  }
  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }

  dateBind(): void {
    let date = new Date();
    this.transactionForm.patchValue({
      timePeriod: {
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
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionForm.controls['timePeriod'].value);
    // let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
    // this.timePeriod = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  }

  // resetbtn() {
  //   this.transType = 0;
  //   this.transactionForm.controls['TransactionType'].setValue(this.transType);
  //   this.tollTransType(this.selectedValue);
  //   this.dateBind();
  //   this.getTransaction();
  //   this.tollTransName = 'Transactions';
  // }

  resetbtn() {
    this.transactionForm.reset();
    this.dateBind();
    this.transType = 0;
    this.transactionForm.controls['TransactionType'].setValue(this.transType);
    this.getTransaction();
    // this.tollTransType(this.selectedValue);
    this.tollName = "Transactions";
    this.tollTransName = 'Transactions';
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  tranactionSearch() {
    if (this.transactionForm.valid) {
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TOLLRECONCILIATION];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.tollTransName = this.tollName;
      this.getTransaction();
    } else {
      this.validateAllFormFields(this.transactionForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  tollTransType(event) {
    // this.selectedValue = event;
    switch (event.target.value) {
      case "TOLL":
        this.transType = event.target[1].index;
        this.tollName = event.target.value;
        break;
      case "PARKING":
        this.transType = event.target[2].index;
        this.tollName = event.target.value;
        break;
      case "FERRY":
        this.transType = event.target[3].index;
        this.tollName = event.target.value;
        break;
      case "TRANSIT":
        this.transType = event.target[4].index;
        this.tollName = event.target.value;
        break;
      default:
        this.transType = event.target[0].index;
        this.tollName = "Transactions";
    }
  }

  getTransaction(userEvents?: IUserEvents): void {
    $('#pageloader').modal('show');
    let timePeriodArray = this.datePickerFormatService.getFormattedDateRange(this.transactionForm.controls['timePeriod'].value);
    this.transactionreq.StartDate = new Date(new Date(timePeriodArray[0].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    this.transactionreq.EndDate = new Date(new Date(timePeriodArray[1].toLocaleDateString(defaultCulture).replace(/\u200E/g, ""))).toDateString();
    this.TripReconTotal = 0;
    this.TrxnPostedTotal = 0;
    this.countTotal = 0;
    this.countTrxnPostedTotal = 0;
    this.totalCount = 0;
    this.trxnPostedTotal1 = 0;
    this.finalCount = 0;
    this.finalTrxnPostedTotal = 0;
    this.grandTripRecontCount = 0;
    this.grandTripReconTotal = 0;
    this.cntReceivedTotal=0;
    this.cntErrorTotal=0;
    this.cntAckTotal=0;
    this.rowcount=0;
    // this.transactionreq.StartDate = new Date(new Date(this.timePeriod[0]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
    // this.transactionreq.EndDate = new Date(new Date(this.timePeriod[1]).toLocaleDateString(defaultCulture).replace(/\u200E/g,"")).toDateString();
    this.transactionreq.User = this.context.customerContext.userName;
    this.transactionreq.DateType = this.transType;
    this.systemActivities = <ISystemActivities>{};
    this.systemActivities.LoginId = this.context.customerContext.loginId;
    this.systemActivities.UserId = this.context.customerContext.userId;
    this.systemActivities.IsViewed = true;
    this.systemActivities.ActivitySource = ActivitySource.Internal.toString();
    this.transactionreq.SystemActivity = this.systemActivities;
    this.reconciliationService.getTransactionService(this.transactionreq, userEvents).subscribe(res => {
      this.transactionres = res;
      console.log("Response",this.transactionres);
      $('#pageloader').modal('hide');
      this.transactionres.forEach(element => {
        this.TripRecon = element.TripRecon;
        this.TrxnPosted = element.TrxnPosted;
        this.AckTransaction=element.HostTrxns;
      });
      console.log('this.AckTransaction',this.AckTransaction);
     // this.cntErrorTotal=this.AckTransaction[0].HOSTTRXN_ERROR;
      this.AckTransaction.forEach(element => {
        this.cntReceivedTotal += element.HOSTTRXN_RECEIVED;
        this.cntAckTotal += element.HOSTTRXN_ACKNOWLEDGED;
        this.rowcount=this.rowcount+1;
      });
      this.cntErrorTotal=this.cntReceivedTotal-this.cntAckTotal;
      console.log("this.rowcount",this.rowcount);
      this.trxnPostedRes = this.TrxnPosted.filter(x => x.SerialNumber != 17 && x.SerialNumber != 20);
      this.trxnPostedLinkedRes = this.TrxnPosted.filter(x => x.SerialNumber >= 17);
      this.tripReconRes = this.TripRecon.filter(x => x.SerialNumber < 17);
      this.tripReconLinkedRes = this.TripRecon.filter(x => x.SerialNumber >= 17);
      this.trxnPostedRes.forEach(element => {
        this.countTotal += element.Count;
        this.TrxnPostedTotal += element.Amount;
      });
      this.trxnPostedLinkedRes.forEach(element => {
        this.totalCount += element.Count;
        this.trxnPostedTotal1 += element.Amount;
      });
      this.tripReconRes.forEach(element => {
        this.TripReconTotal += element.Amount;
        this.countTrxnPostedTotal += element.Count;
      });
      this.tripReconLinkedRes.forEach(element => {
        this.TripReconTotal1 += element.Amount;
        this.countTrxnPostedTotal1 += element.Count;
      });

      this.finalCount = this.countTotal - this.totalCount;
      this.finalTrxnPostedTotal = this.TrxnPostedTotal - this.trxnPostedTotal1;

      this.grandTripReconTotal = this.TripReconTotal - this.TripReconTotal1;
      this.grandTripRecontCount = this.countTrxnPostedTotal - this.countTrxnPostedTotal1;
    })
  }
}