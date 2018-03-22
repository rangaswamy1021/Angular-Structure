import { IUserEvents } from './../../shared/models/userevents';
import { CSCReportsService } from './services/reports.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ICNReportsRequest } from "./models/icnreportsrequest";
import { ICNReportResponse } from "./models/icnreportsresponse";
import { PaymentMode } from "../../payment/constants";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { CommonService } from "../../shared/services/common.service";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged } from "mydaterangepicker";
import { IMyDateModel } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { IManageUserResponse } from '../../sac/usermanagement/models/manageuser.response';
import { IManageUserRequest } from '../../sac/usermanagement/models/manageuser.request';

@Component({
  selector: 'app-csc-payment-details',
  templateUrl: './csc-payment-details.component.html',
  styleUrls: ['./csc-payment-details.component.scss']
})
export class CscPaymentDetailsComponent implements OnInit {
  gridArrowLOCATIONNAME: boolean;
  gridArrowACOOUNTHOLDERNAME: boolean;
  gridArrowTRANSACTIONAMOUNT: boolean;
  gridArrowVOUCHERNUMBER: boolean;
  gridArrowCUSTOMERID: boolean;
  sortingDirection: boolean;
  sortingColumn: any;
  gridArrowTRANSACTIONID: boolean;
  invalidDate: boolean;
  toDate: any;
  fromDate: any;
  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  searchButton: boolean;
  isCscPaymentCreditCardDetails: boolean;
  isCscPaymentChequeDetails: boolean;
  isCscPaymentCashDetails: boolean;
  isCscPaymentMoDetails: boolean;
  isCscPaymentBankDetails: boolean;
  isCscPaymentGCDetails: boolean;
  isCscPaymentPromoDetails: boolean;
  dropDownDataResults: any;
  lookuptype: ICommonResponse;
  dropdownData: any[];
  cscPaymentDetailsForm: FormGroup;
  cscPaymentGridDataRequest: ICNReportsRequest = <ICNReportsRequest>{};
  cscPaymentGriddataResponse: ICNReportResponse[];
  cscPaymentCreditCardDetailsResponse: ICNReportResponse[];
  cscPaymentChequeDetailsResponse: ICNReportResponse[];
  cscPaymentCashDetailsResponse: ICNReportResponse[];
  cscPaymentMODetailsResponse: ICNReportResponse[];
  cscPaymentBankDetailsResponse: ICNReportResponse[];
  cscPaymentGCDetailsResponse: ICNReportResponse[];
  cscPaymentPromoDetailsResponse: ICNReportResponse[];
  userEventRequest: IUserEvents = <IUserEvents>{};
  creditPage: number;
  creditPageItemNumber: number = 10;
  creditStartItemNumber: number = 1;
  creditEndItemNumber: number;
  creditTotalRecordCount: number;
  cashPage: number;
  cashPageItemNumber: number = 10;
  cashStartItemNumber: number = 1;
  cashEndItemNumber: number;
  cashTotalRecordCount: number;
  chequePage: number;
  chequePageItemNumber: number = 10;
  chequeStartItemNumber: number = 1;
  chequeEndItemNumber: number;
  chequeTotalRecordCount: number;
  promoPage: number;
  promoPageItemNumber: number = 10;
  promoStartItemNumber: number = 1;
  promoEndItemNumber: number;
  promoTotalRecordCount: number;
  bankPage: number;
  bankPageItemNumber: number = 10;
  bankStartItemNumber: number = 1;
  bankEndItemNumber: number;
  bankTotalRecordCount: number;
  gcPage: number;
  gcPageItemNumber: number = 10;
  gcStartItemNumber: number = 1;
  gcEndItemNumber: number;
  gcTotalRecordCount: number;
  moPage: number;
  moPageItemNumber: number = 10;
  moStartItemNumber: number = 1;
  moEndItemNumber: number;
  moTotalRecordCount: number;
  sessionContextResponse: IUserresponse;
  errorBlock: boolean;
  successBlock: boolean;
  timePeriodValue: Date[];
  maxDate = new Date();
  minDate = new Date();
  incPattern = "[0-9]+$";
  userName: string;
  userId: number;
  loginId: number;
  locationResponse: IManageUserResponse[];
  locationsRequest: IManageUserRequest;
  activitySource: string = ActivitySource[ActivitySource.Internal];
  warrantyInMonths: number = 0;
  myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
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
  start = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
  end = new Date(this.toDayDate.getFullYear(), this.toDayDate.getMonth(), this.toDayDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");

  constructor(private CSCReportsService: CSCReportsService,
    private sessionContext: SessionService,
    private commonService: CommonService,
    private datePickerFormat: DatePickerFormatService,
    private cdr: ChangeDetectorRef,
    private router: Router, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.gridArrowTRANSACTIONID = true;
    this.sortingColumn = "TRANSACTIONID";
    this.materialscriptService.material();
    this.creditPage = 1;
    this.cashPage = 1;
    this.chequePage = 1;
    this.bankPage = 1;
    this.gcPage = 1;
    this.moPage = 1;
    this.promoPage = 1;
    this.creditEndItemNumber = 10;
    this.cashEndItemNumber = 10;
    this.bankEndItemNumber = 10;
    this.promoEndItemNumber = 10;
    this.moEndItemNumber = 10;
    this.gcEndItemNumber = 10;
    this.userName = this.sessionContext.customerContext.userName;
    this.userId = this.sessionContext.customerContext.userId;
    this.loginId = this.sessionContext.customerContext.loginId;
    //this.dateBind();

    this.cscPaymentDetailsForm = new FormGroup({
      'paymentType': new FormControl(''),
      'icn': new FormControl('', Validators.compose([Validators.pattern(this.incPattern)])),
      'timePeriod': new FormControl('', [Validators.required]),
      'location': new FormControl('')
    });
    let date = new Date();
    this.cscPaymentDetailsForm.patchValue({
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

    this.searchButton = !this.commonService.isAllowed(Features[Features.CSCPAYMENTDETAILS], Actions[Actions.SEARCH], "");
    this.bindPaymentTypes();
    this.cscPaymentGridBindDetails(false, null);
    this.isCscPaymentCreditCardDetails = false;
    this.isCscPaymentChequeDetails = false;
    this.isCscPaymentCashDetails = false;
    this.isCscPaymentMoDetails = false;
    this.isCscPaymentBankDetails = false;
    this.isCscPaymentGCDetails = false;
    this.isCscPaymentPromoDetails = false;

    this.getLocations();

  }

  //page change events
  creditCardDetailsPageChanged(event) {
    this.creditPage = event;
    this.creditStartItemNumber = (((this.creditPage) - 1) * this.creditPageItemNumber) + 1;
    this.creditEndItemNumber = ((this.creditPage) * this.creditPageItemNumber);
    if (this.creditEndItemNumber > this.creditTotalRecordCount)
      this.creditEndItemNumber = this.creditTotalRecordCount;
    this.cscPaymentCreditCardDetails(this.cscPaymentGridDataRequest, true, this.creditPage, null);
  }

  chequeDetailsPageChanged(event) {
    this.chequePage = event;
    this.chequeStartItemNumber = (((this.chequePage) - 1) * this.chequePageItemNumber) + 1;
    this.chequeEndItemNumber = ((this.chequePage) * this.chequePageItemNumber);
    if (this.chequeEndItemNumber > this.chequeTotalRecordCount)
      this.chequeEndItemNumber = this.chequeTotalRecordCount;
    this.cscPaymentChequeDetails(this.cscPaymentGridDataRequest, true, this.chequePage, null);
  }

  cashDetailsPageChanged(event) {
    this.cashPage = event;
    this.cashStartItemNumber = (((this.cashPage) - 1) * this.cashPageItemNumber) + 1;
    this.cashEndItemNumber = ((this.cashPage) * this.cashPageItemNumber);
    if (this.cashEndItemNumber > this.cashTotalRecordCount)
      this.cashEndItemNumber = this.cashTotalRecordCount;
    this.cscPaymentCashDetails(this.cscPaymentGridDataRequest, true, this.cashPage, null);

  }
  mODetailsPageChanged(event) {
    this.moPage = event;
    this.moStartItemNumber = (((this.moPage) - 1) * this.moPageItemNumber) + 1;
    this.moEndItemNumber = ((this.moPage) * this.moPageItemNumber);
    if (this.moEndItemNumber > this.moTotalRecordCount)
      this.moEndItemNumber = this.moTotalRecordCount;
    this.cscPaymentMODetails(this.cscPaymentGridDataRequest, true, this.moPage, null);

  }
  bankDetailsPageChanged(event) {
    this.bankPage = event;
    this.bankStartItemNumber = (((this.bankPage) - 1) * this.bankPageItemNumber) + 1;
    this.bankEndItemNumber = ((this.bankPage) * this.bankPageItemNumber);
    if (this.bankEndItemNumber > this.bankTotalRecordCount)
      this.bankEndItemNumber = this.bankTotalRecordCount;
    this.cscPaymentBankDetails(this.cscPaymentGridDataRequest, true, this.bankPage, null);

  }
  gCDetailsPageChanged(event) {
    this.gcPage = event;
    this.gcStartItemNumber = (((this.gcPage) - 1) * this.gcPageItemNumber) + 1;
    this.gcEndItemNumber = ((this.gcPage) * this.gcPageItemNumber);
    if (this.gcEndItemNumber > this.gcTotalRecordCount)
      this.gcEndItemNumber = this.gcTotalRecordCount;
    this.cscPaymentGCDetails(this.cscPaymentGridDataRequest, true, this.gcPage, null);
  }
  promoDetailsPageChanged(event) {
    this.promoPage = event;
    this.promoStartItemNumber = (((this.promoPage) - 1) * this.promoPageItemNumber) + 1;
    this.promoEndItemNumber = ((this.promoPage) * this.promoPageItemNumber);
    if (this.promoEndItemNumber > this.promoTotalRecordCount)
      this.promoEndItemNumber = this.promoTotalRecordCount;
    this.cscPaymentPromoDetails(this.cscPaymentGridDataRequest, true, this.promoPage, null);
  }

  //default date binding
  // dateBind(): void {
  //   let strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split("/");
  //   this.timePeriodValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
  // }




  //generate report click event
  generateReport() {
    //  if (this.cscPaymentDetailsForm.valid && !(this.invalidDate)) {
    if (this.cscPaymentDetailsForm.valid && !(this.invalidDate)) {
      this.creditPage = 1;
      this.cashPage = 1;
      this.chequePage = 1;
      this.bankPage = 1;
      this.gcPage = 1;
      this.moPage = 1;
      this.promoPage = 1;
      this.cashEndItemNumber = 10;
      this.moEndItemNumber = 10;
      this.gcEndItemNumber = 10;
      this.chequeEndItemNumber = 10;
      this.creditEndItemNumber = 10;
      this.promoEndItemNumber = 10;
      this.bankEndItemNumber = 10;
      this.cashStartItemNumber = 1;
      this.moStartItemNumber = 1;
      this.gcStartItemNumber = 1;
      this.chequeStartItemNumber = 1;
      this.creditStartItemNumber = 1;
      this.bankStartItemNumber = 1;
      this.promoStartItemNumber = 1;
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.SEARCH];
      this.cscPaymentGridBindDetails(true, userEvents);
    }
    else {
      this.validateAllFormFields(this.cscPaymentDetailsForm);
    }
  }
  //reset search details
  resetDetails() {
    this.cscPaymentGridBindDetails(false, null);
    this.isCscPaymentCreditCardDetails = false;
    this.isCscPaymentChequeDetails = false;
    this.isCscPaymentCashDetails = false;
    this.isCscPaymentMoDetails = false;
    this.isCscPaymentBankDetails = false;
    this.isCscPaymentGCDetails = false;
    this.isCscPaymentPromoDetails = false;
    this.cscPaymentDetailsForm.controls.icn.reset();
    this.cscPaymentDetailsForm.controls['paymentType'].setValue("");
    this.cscPaymentDetailsForm.patchValue({ location: "" });
    //this.dateBind();
    let date = new Date();
    this.cscPaymentDetailsForm.patchValue({
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

  //drop downbinding
  bindPaymentTypes() {
    this.dropdownData = [];
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.VIEW];
    this.CSCReportsService.getPaymentModetTypes(userEvents).subscribe(
      res => {
        var filterlist = res.filter(k => (k.Key == PaymentMode[PaymentMode.Cash]) || (k.Key == PaymentMode[PaymentMode.CreditCard]) || (k.Key == PaymentMode[PaymentMode.Bank]) || (k.Key == PaymentMode[PaymentMode.Cheque]) || (k.Key == PaymentMode[PaymentMode.GC]) || (k.Key == PaymentMode[PaymentMode.MoneyOrder]) || (k.Key == PaymentMode[PaymentMode.Promo]));
        this.dropdownData = filterlist;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  //All grid binding individual events
  cscPaymentCreditCardDetails(cscPaymentGridDataRequest, searchFlag: boolean, creditPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentCreditCardDetails = true;
    cscPaymentGridDataRequest.PageNumber = creditPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.CreditCard];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentCreditCardDetailsResponse = res;
        if (res != null && res.length > 0) {
          this.creditTotalRecordCount = this.cscPaymentCreditCardDetailsResponse[0].RecCount;
          if (this.creditTotalRecordCount < this.creditPageItemNumber) {
            this.creditEndItemNumber = this.creditTotalRecordCount;
          }

        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  cscPaymentChequeDetails(cscPaymentGridDataRequest, searchFlag: boolean, chequePageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentChequeDetails = true;
    cscPaymentGridDataRequest.PageNumber = chequePageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.Cheque];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentChequeDetailsResponse = res;
        if (res != null && res.length > 0) {
          this.chequeTotalRecordCount = this.cscPaymentChequeDetailsResponse[0].RecCount;
          if (this.chequeTotalRecordCount < this.chequePageItemNumber) {
            this.chequeEndItemNumber = this.chequeTotalRecordCount;
          }

        }

      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }

  cscPaymentCashDetails(cscPaymentGridDataRequest, searchFlag: boolean, cashPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentCashDetails = true;
    cscPaymentGridDataRequest.PageNumber = cashPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.Cash];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentCashDetailsResponse = res;

        console.log(this.cscPaymentCashDetailsResponse);
        if (res != null && res.length > 0) {

          this.cashTotalRecordCount = this.cscPaymentCashDetailsResponse[0].RecCount;
          if (this.cashTotalRecordCount < this.cashPageItemNumber) {
            this.cashEndItemNumber = this.cashTotalRecordCount;
          }
        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });

  }

  cscPaymentMODetails(cscPaymentGridDataRequest, searchFlag: boolean, moPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentMoDetails = true;
    cscPaymentGridDataRequest.PageNumber = moPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = "TRANSACTIONID"
    cscPaymentGridDataRequest.SortDirection = 1;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.MoneyOrder];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentMODetailsResponse = res;
        if (res != null && res.length > 0) {
          this.moTotalRecordCount = this.cscPaymentMODetailsResponse[0].RecCount;
          if (this.moTotalRecordCount < this.moPageItemNumber) {
            this.moEndItemNumber = this.moTotalRecordCount;
          }

        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });

  }

  cscPaymentBankDetails(cscPaymentGridDataRequest, searchFlag: boolean, bankPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentBankDetails = true;
    cscPaymentGridDataRequest.PageNumber = bankPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.Bank];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentBankDetailsResponse = res;
        if (res != null && res.length > 0) {
          this.bankTotalRecordCount = this.cscPaymentBankDetailsResponse[0].RecCount;
          if (this.bankTotalRecordCount < this.bankPageItemNumber) {
            this.bankEndItemNumber = this.bankTotalRecordCount;
          }

        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });

  }

  cscPaymentGCDetails(cscPaymentGridDataRequest, searchFlag: boolean, gcPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentGCDetails = true;
    cscPaymentGridDataRequest.PageNumber = gcPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.GC];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentGCDetailsResponse = res;
        if (res != null && res.length > 0) {
          this.gcTotalRecordCount = this.cscPaymentGCDetailsResponse[0].RecCount;
          if (this.gcTotalRecordCount < this.gcPageItemNumber) {
            this.gcEndItemNumber = this.gcTotalRecordCount;
          }

        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });

  }

  cscPaymentPromoDetails(cscPaymentGridDataRequest, searchFlag: boolean, promoPageNumber: number, userEvents: IUserEvents) {
    this.isCscPaymentPromoDetails = true;
    cscPaymentGridDataRequest.PageNumber = promoPageNumber;
    cscPaymentGridDataRequest.PageSize = 10;
    cscPaymentGridDataRequest.SortColumn = this.sortingColumn;
    cscPaymentGridDataRequest.SortDirection = this.sortingDirection == true ? 1 : 0;
    cscPaymentGridDataRequest.PaymentMode = PaymentMode[PaymentMode.Promo];
    cscPaymentGridDataRequest.LocationName = this.cscPaymentDetailsForm.controls['location'].value;
    this.CSCReportsService.GetICNPaymentDetails(cscPaymentGridDataRequest, userEvents).subscribe(
      res => {
        this.cscPaymentPromoDetailsResponse = res;
        if (res != null && res.length > 0) {
          this.promoTotalRecordCount = this.cscPaymentPromoDetailsResponse[0].RecCount;
          if (this.promoTotalRecordCount < this.promoPageItemNumber) {
            this.promoEndItemNumber = this.promoTotalRecordCount;
          }

        }
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });

  }

  //main search event

  cscPaymentGridBindDetails(searchFlag: boolean, userEvents: IUserEvents) {

    let strDate = this.cscPaymentDetailsForm.controls['timePeriod'].value;
    if (strDate != "" && strDate != null) {
      // let strDateRange = strDate.slice(",");
      let date = this.datePickerFormat.getFormattedDateRange(this.cscPaymentDetailsForm.controls['timePeriod'].value)
      let firstDate = date[0];
      let lastDate = date[1];
      this.fromDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.toDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate(), 23, 59, 59, 59).toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.cscPaymentGridDataRequest.TxnStartDate = this.fromDate;
      this.cscPaymentGridDataRequest.TxnEndDate = this.toDate;
    }
    else {
      this.fromDate = this.start;
      this.toDate = this.end;
      this.cscPaymentGridDataRequest.TxnStartDate = this.fromDate;
      this.cscPaymentGridDataRequest.TxnEndDate = this.toDate;
    }

    //let icnId = this.cscPaymentDetailsForm.controls['icn'].value;
    let paymentType = this.cscPaymentDetailsForm.controls['paymentType'].value;
    // if (icnId != null) {
    //   this.cscPaymentGridDataRequest.ICNId = icnId;
    // }
    if (this.cscPaymentDetailsForm.controls['icn'].value != "" && this.cscPaymentDetailsForm.controls['icn'].value != null) {
      this.cscPaymentGridDataRequest.ICNId = this.cscPaymentDetailsForm.controls['icn'].value;
    }
    else{
      this.cscPaymentGridDataRequest.ICNId=0;
    }
    this.cscPaymentGridDataRequest.User = this.userName;
    this.cscPaymentGridDataRequest.UserId = this.userId;
    this.cscPaymentGridDataRequest.LoginId = this.loginId;
    this.cscPaymentGridDataRequest.SearchFlag = true;
    this.cscPaymentGridDataRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    if (paymentType == PaymentMode[PaymentMode.CreditCard]) {
      this.cscPaymentCreditCardDetails(this.cscPaymentGridDataRequest, true, this.creditPage, userEvents);
      this.isCscPaymentCreditCardDetails = true;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = false;
    }
    else if (paymentType == PaymentMode[PaymentMode.Cash]) {
      this.cscPaymentCashDetails(this.cscPaymentGridDataRequest, true, this.cashPage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = true;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = false;
    }
    else if (paymentType == PaymentMode[PaymentMode.Cheque]) {
      this.cscPaymentChequeDetails(this.cscPaymentGridDataRequest, true, this.chequePage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = true;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = false;
    }
    else if (paymentType == PaymentMode[PaymentMode.Bank]) {
      this.cscPaymentBankDetails(this.cscPaymentGridDataRequest, true, this.bankPage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = true;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = false;
    }
    else if (paymentType == PaymentMode[PaymentMode.MoneyOrder]) {
      this.cscPaymentMODetails(this.cscPaymentGridDataRequest, true, this.moPage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = true;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = false;
    }
    else if (paymentType == PaymentMode[PaymentMode.Promo]) {
      this.cscPaymentPromoDetails(this.cscPaymentGridDataRequest, true, this.promoPage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = false;
      this.isCscPaymentPromoDetails = true;
    }
    else if (paymentType == PaymentMode[PaymentMode.GC]) {
      this.cscPaymentGCDetails(this.cscPaymentGridDataRequest, true, this.gcPage, userEvents);
      this.isCscPaymentCreditCardDetails = false;
      this.isCscPaymentChequeDetails = false;
      this.isCscPaymentCashDetails = false;
      this.isCscPaymentMoDetails = false;
      this.isCscPaymentBankDetails = false;
      this.isCscPaymentGCDetails = true;
      this.isCscPaymentPromoDetails = false;
    }
    else {

      this.creditPage = 1;
      this.creditStartItemNumber = 1;
      this.creditPageItemNumber = 10;
      this.creditEndItemNumber = 10;


      this.cscPaymentCreditCardDetails(this.cscPaymentGridDataRequest, true, this.creditPage, userEvents);
      this.cscPaymentCashDetails(this.cscPaymentGridDataRequest, true, this.cashPage, null);
      this.cscPaymentChequeDetails(this.cscPaymentGridDataRequest, true, this.chequePage, null);
      this.cscPaymentBankDetails(this.cscPaymentGridDataRequest, true, this.bankPage, null);
      this.cscPaymentMODetails(this.cscPaymentGridDataRequest, true, this.moPage, null);
      this.cscPaymentPromoDetails(this.cscPaymentGridDataRequest, true, this.promoPage, null);
      this.cscPaymentGCDetails(this.cscPaymentGridDataRequest, true, this.gcPage, null);
    }
  }




  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.CSCPAYMENTDETAILS];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    let date = this.cscPaymentDetailsForm.controls["timePeriod"].value;
    if (!event.valid && event.value != "") {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }

  getLocations() {
    this.locationsRequest = <IManageUserRequest>{};
    this.locationsRequest.LocationCode = '';
    this.locationsRequest.LocationName = '';
    this.locationsRequest.SortColumn = 'LOCATIONCODE';
    this.locationsRequest.SortDir = 1;
    this.locationsRequest.PageNumber = 1;
    this.locationsRequest.PageSize = 100;
    this.CSCReportsService.getLocations(this.locationsRequest).subscribe(res => {
      this.locationResponse = res;
      console.log(this.locationResponse)
    })
  }


  sortDirection(SortingColumn, tableName) {
    this.gridArrowTRANSACTIONID = false;
    this.gridArrowCUSTOMERID = false;
    this.gridArrowVOUCHERNUMBER = false;
    this.gridArrowTRANSACTIONAMOUNT = false;
    this.gridArrowACOOUNTHOLDERNAME = false;
    this.gridArrowLOCATIONNAME = false;

    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "TRANSACTIONID") {
      this.gridArrowTRANSACTIONID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "CUSTOMERID") {
      this.gridArrowCUSTOMERID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "VOUCHERNUMBER") {
      this.gridArrowVOUCHERNUMBER = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "TRANSACTIONAMOUNT") {
      this.gridArrowTRANSACTIONAMOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "ACOOUNTHOLDERNAME") {
      this.gridArrowACOOUNTHOLDERNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    
  else if (this.sortingColumn == "LOCATIONNAME") {
    this.gridArrowLOCATIONNAME = true;
    if (this.sortingDirection == true) {
      this.sortingDirection = false;
    }
    else {
      this.sortingDirection = true;
    }
  }
  
    if (tableName == 'creditCard') {
      this.cscPaymentCreditCardDetails(this.cscPaymentGridDataRequest, true, this.creditPage, null);
    } else if (tableName == 'checkEntries') {
      this.cscPaymentChequeDetails(this.cscPaymentGridDataRequest, true, this.chequePage, null);
    } else if (tableName == 'cashEntries') {
      this.cscPaymentCashDetails(this.cscPaymentGridDataRequest, true, this.cashPage, null);
    } else if (tableName == 'moneyOrder') {
      this.cscPaymentMODetails(this.cscPaymentGridDataRequest, true, this.moPage, null);
    }
    else if (tableName == 'bankEntries') {
      this.cscPaymentBankDetails(this.cscPaymentGridDataRequest, true, this.bankPage, null);
    }
    else if (tableName == 'Gift') {
      this.cscPaymentGCDetails(this.cscPaymentGridDataRequest, true, this.gcPage, null);
    }
    else if (tableName == 'Promo') {
      this.cscPaymentPromoDetails(this.cscPaymentGridDataRequest, true, this.promoPage, null);
    }
  }
}











