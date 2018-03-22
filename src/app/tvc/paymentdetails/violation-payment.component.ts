import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule, FormGroup, FormControl, Validators, FormArray, NgForm } from '@angular/forms';
import { MakePaymentComponent } from "../../payment/make-payment.component";
import { PaymentDetailService } from "./services/paymentdetails.service";
import { IVioAmounts } from "./models/vioamountsresponse";
import { IInvoiceResponse } from "../../invoices/models/invoicesresponse";
import { IViolationPaymentrequest } from "../../payment/models/violationpaymentrequest";
import { ITripsRequest } from "./models/tripsrequest";
import { IUserresponse } from "../../shared/models/userresponse";
import { SessionService } from "../../shared/services/session.service";
import { Router } from '@angular/router';
import { IInvoiceRequest } from "../../invoices/models/invoicesrequest";
import { PaymentContextService } from "./services/payment.context.service";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { InvoicesContextService } from "../../shared/services/invoices.context.service";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
//declare var $: any;
@Component({
  selector: 'app-violation-payment',
  templateUrl: './violation-payment.component.html',
  styleUrls: ['./violation-payment.component.scss']
})
export class ViolationPaymentComponent implements OnInit, AfterViewInit {
  payMethod: string = "InvoicePayment";
  vioAmounts: IVioAmounts[];
  invoiceResponse: IInvoiceResponse[];
  isCCTaxShow: boolean = true;
  objPaymentRequest: IViolationPaymentrequest = <IViolationPaymentrequest>{};
  amount: number = 0;
  totalAmounttobePaid: number = 0;
  validStatus: boolean = false;
  @ViewChild(MakePaymentComponent) makePaymentComp;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  cancelConfirm: boolean = false;
  sessionContextResponse: IUserresponse;
  isCheckallTrips: boolean = false;
  isCheckallInvoices: boolean = false;
  strCitationIds: string = "";
  strInvoiceIds: string;
  accountId: number;
  isBeforeSearch: boolean;
  feature: string = Features[Features.TVCPAYMENT];
  redirectURL: string = "/tvc/violatordetails/violator-summary";
  violatorContextResponse: IViolatorContextResponse;
  disableMakePayment: boolean = false;
  ccDisable: boolean = false;
  achDisable: boolean = false;
  cashDisable: boolean = false;
  checkDisable: boolean = false;
  moDisable: boolean = false;
  isCourtTrip: boolean = false;
  constructor(private commonService: CommonService, private invoicesContextService: InvoicesContextService, private tripContextService: TripsContextService, private paymentDetailService: PaymentDetailService, private router: Router, private sessionService: SessionService, private paymentContextService: PaymentContextService, private violatorContext: ViolatorContextService) { }
  @ViewChild('vioForm') public vioForm: NgForm;
  @ViewChild('invoiceForm') public invoiceForm: NgForm;
  @ViewChild('amountForm') public amountForm: NgForm;
  ngOnInit() {

    this.sessionContextResponse = this.sessionService.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    if (this.router.url.endsWith('/violation-makepayment')) {
      this.tripContextService.changeResponse(null);
      this.invoicesContextService.changeResponse(null);
      this.paymentContextService.changeResponse(null);
    }

    this.violatorContext.currentContext.subscribe(vioContext => {
      this.violatorContextResponse = vioContext
      if (this.violatorContextResponse == null || this.violatorContextResponse == undefined) {
        this.violatorContextResponse = <IViolatorContextResponse>{};
        this.invoicesContextService.currentContext.subscribe(res => {
          if (res != null && res && res.AccountId != 0) {
            this.violatorContextResponse.accountId = res.AccountId;
          }
          else
            this.accountId = 0;
        });
      }
    });
    if (this.violatorContextResponse != null) {
      this.accountId = this.violatorContextResponse.accountId;

      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.TVCPAYMENT];
      userEvents.ActionName = Actions[Actions.VIEW];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = this.accountId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();

      this.paymentContextService.currentContext.subscribe(res => {
        if (res == null || res.CustomerId == 0) {
          this.objPaymentRequest = res;
          this.makePaymentComp.InitialiZeObject(this.accountId);
          this.ccDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CC], "");
          this.achDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.BANK], "");
          this.cashDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CASH], "");
          this.checkDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.CHEQUE], "");
          this.moDisable = !this.commonService.isAllowed(this.feature, Actions[Actions.MO], "");
          if (this.ccDisable && this.achDisable && this.cashDisable && this.checkDisable && this.moDisable) {
            this.disableMakePayment = true;
          }
          if (this.accountId > 0)
            this.bindInvoiceTripDetails();
        } else {
          this.objPaymentRequest = res;
        }
      });
      if (this.objPaymentRequest != null && this.objPaymentRequest != undefined) {
        this.makePaymentComp.setCustomerId(this.accountId, "");
        this.totalAmounttobePaid = this.objPaymentRequest.TxnAmount;
        if (this.objPaymentRequest.PaymentFor == "Violation")
          this.payMethod = "OutstandingBalance";
        else if (this.objPaymentRequest.PaymentFor == "Invoice") {
          this.payMethod = "InvoicePayment";
        }
        else
          this.payMethod = "AdministrativeHearingDeposit";
        if (this.payMethod != "AdministrativeHearingDeposit")
          this.bindInvoiceTripDetails();
        //this.makePaymentComp.bindDetailsOnBack(this.objPaymentRequest);
      }
    }
    else
      this.accountId = 0;
  }

  ngAfterViewInit() {
    if (this.objPaymentRequest != null && this.objPaymentRequest != undefined)
      this.makePaymentComp.bindDetailsOnBack(this.objPaymentRequest);
  }

  bindInvoiceTripDetails() {
    //    $('#pageloader').modal('show');
    this.tripContextService.currentContext.subscribe(res => {
      if (res != null && res && res.referenceURL.length > 0 && res.tripIDs != undefined) {
        this.strCitationIds = res.tripIDs.toString();
        this.redirectURL = res.referenceURL;
        this.payMethod = "OutstandingBalance";
        this.isBeforeSearch = res.isBeforeSearch;
        this.paymentDetailService.GetChargesTrackerDetailsByCitationCSV(this.accountId, this.strCitationIds).subscribe(
          res => {
            if (res) {
              this.vioAmounts = res;
              if (this.objPaymentRequest != null && this.objPaymentRequest != undefined && this.objPaymentRequest.objListTrips != undefined && this.objPaymentRequest.objListTrips.length > 0) {
                for (var temp = 0; temp < this.objPaymentRequest.objListTrips.length; temp++) {
                  for (var i = 0; i < this.vioAmounts.length; i++) {
                    if (this.objPaymentRequest.objListTrips[temp].CitationId == this.vioAmounts[i].CitationId) {
                      this.vioAmounts[i].checkedStatus = true;
                      this.vioAmounts[i].AdjTotalFee = this.objPaymentRequest.objListTrips[temp].TripPaymentAmt;
                      //this.totalAmounttobePaid += this.vioAmounts[i].AdjTotalFee;
                      this.vioAmounts[i].BackHoldStatus = true;
                      //Court trip validation
                      if (this.vioAmounts[i].CitationStage.toUpperCase() == 'CRT')
                        this.isCourtTrip = true;
                      break;
                    }                    
                  }
                }
                this.isCheckallTrips = this.objPaymentRequest.objListTrips.length == this.vioAmounts.filter(x => x.TotalFee > 0).length;
              }
              else {
                for (var i = 0; i < this.vioAmounts.length; i++) {
                  if (this.strCitationIds != "" && this.vioAmounts[i].TotalFee > 0) {
                    this.vioAmounts[i].checkedStatus = true;
                    this.totalAmounttobePaid += this.vioAmounts[i].TotalFee;
                  }
                  if (this.vioAmounts[i].CitationStage.toUpperCase() == 'CRT')
                    this.isCourtTrip = true;
                }
                this.isCheckallTrips = true;
              }
            }
            //$('#pageloader').modal('hide');
          });
      }
      else {
        this.payMethod = "InvoicePayment";
        this.invoicesContextService.currentContext.subscribe(res => {
          if (res != null && res && res.AccountId != 0 && res.invoiceIDs != undefined) {
            this.strInvoiceIds = res.invoiceIDs.toString();
            this.redirectURL = res.referenceURL;
            this.isBeforeSearch = res.isBeforeSearch;
          }
          else
            this.strInvoiceIds = "";

          this.paymentDetailService.GetOutstandingInvoices(this.accountId).subscribe(
            res => {
              if (res) {
                let invoiceResponseList: IInvoiceResponse[];
                invoiceResponseList = res;
                if (this.strInvoiceIds != "") {
                  let items = this.strInvoiceIds.split(',');
                  this.invoiceResponse = [];
                  for (var i = 0; i < invoiceResponseList.length; i++) {
                    if (items.indexOf(invoiceResponseList[i].InvoiceId.toString()) > -1) {
                      this.invoiceResponse.push(invoiceResponseList[i]);
                    }
                  }
                }
                else
                  this.invoiceResponse = invoiceResponseList;

                if (this.objPaymentRequest != null && this.objPaymentRequest != undefined && this.objPaymentRequest.objListInvoices != undefined && this.objPaymentRequest.objListInvoices.length > 0) {
                  for (var temp = 0; temp < this.objPaymentRequest.objListInvoices.length; temp++) {
                    for (var i = 0; i < this.invoiceResponse.length; i++) {
                      if (this.objPaymentRequest.objListInvoices[temp].InvoiceId == this.invoiceResponse[i].InvoiceId) {
                        this.invoiceResponse[i].IsChecked = true;
                        this.invoiceResponse[i].AdjTotalAmount = this.objPaymentRequest.objListInvoices[temp].InvoicePaymentAmount;
                        //this.totalAmounttobePaid += this.invoiceResponse[i].AdjTotalAmount;
                        this.invoiceResponse[i].SearchActivityIndicator = true;
                        break;
                      }
                      else if (this.invoiceResponse[i].AdjTotalAmount == undefined || this.invoiceResponse[i].AdjTotalAmount == null)
                        this.invoiceResponse[i].AdjTotalAmount = this.invoiceResponse[i].OutstandingDue;
                    }
                  }
                  this.isCheckallInvoices = this.objPaymentRequest.objListInvoices.length == this.invoiceResponse.filter(x => x.OutstandingDue > 0 && (x.AgingHoldType != 'Payment Plan' && x.HoldStatus != 'Hold')).length;
                }
                else {
                  for (var i = 0; i < this.invoiceResponse.length; i++) {
                    if (this.strInvoiceIds != "" && this.invoiceResponse[i].OutstandingDue > 0 && (this.invoiceResponse[i].AgingHoldType != 'Payment Plan' && this.invoiceResponse[i].HoldStatus != 'Hold')) {
                      this.invoiceResponse[i].IsChecked = true;
                      this.invoiceResponse[i].AdjTotalAmount = this.invoiceResponse[i].OutstandingDue;
                      this.totalAmounttobePaid += this.invoiceResponse[i].OutstandingDue;
                    }
                    else {
                      this.invoiceResponse[i].AdjTotalAmount = this.invoiceResponse[i].OutstandingDue;
                      this.totalAmounttobePaid = 0;
                    }
                  }
                  this.isCheckallInvoices = this.strInvoiceIds != "" ? true : false;
                }
              }
              // $('#pageloader').modal('hide');
            });
        });
      }
    });
  }

  resetClick() {
    this.makePaymentComp.resetclick(this.accountId);
    this.totalAmounttobePaid = 0.00;
    this.paymentContextService.changeResponse(null);
  }

  cancelClick(val) {
    if (val == 0) {
      this.showMsg("alert", "Your Information no longer exists, if you cancel your application.<br/>Are you sure you want to Cancel?");
      this.cancelConfirm = true;
    }
    else {
      this.tripContextService.changeResponse(null);
      this.invoicesContextService.changeResponse(null);
      this.paymentContextService.changeResponse(null);
      if (this.isBeforeSearch)
        this.router.navigate(["/tvc/search/invoice-search"]);
      else
        this.router.navigate(["/tvc/violatordetails/violator-summary"]);
    }
  }

  exitClick() {
    this.tripContextService.changeResponse(null);
    this.invoicesContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    this.paymentContextService.changeResponse(null);
    this.router.navigate(["/tvc/search/violation-search"]);
  }

  backClick() {
    let tripContext: any;
    this.paymentContextService.changeResponse(null);
    this.tripContextService.currentContext.subscribe(res => {
      tripContext = res;
    });
    if (this.isBeforeSearch) {
      if (tripContext != null && tripContext && tripContext.referenceURL.length > 0) {
        this.router.navigate(["/tvc/search/invoice-search"]);
        this.tripContextService.changeResponse(null);
        this.invoicesContextService.changeResponse(null);
        this.paymentContextService.changeResponse(null);
      }
      else
        this.router.navigate([this.redirectURL]);
    }
    else
      this.router.navigate([this.redirectURL]);
  }

  changeOption() {
    this.totalAmounttobePaid = 0.00;
    if (this.payMethod == "OutstandingBalance" && this.vioAmounts != null && this.vioAmounts != undefined && this.vioAmounts.length > 0) {
      for (var i = 0; i < this.vioAmounts.length; i++) {
        if (this.vioAmounts[i].TotalFee > 0) {
          this.vioAmounts[i].checkedStatus = false;
          this.vioAmounts[i].AdjTotalFee = this.vioAmounts[i].TotalFee;
        }
      }
    }
    else if (this.payMethod == "InvoicePayment" && this.invoiceResponse != null && this.invoiceResponse != undefined && this.invoiceResponse.length > 0) {
      for (var i = 0; i < this.invoiceResponse.length; i++) {
        if (this.invoiceResponse[i].OutstandingDue > 0) {
          this.invoiceResponse[i].IsChecked = false;
          this.invoiceResponse[i].AdjTotalAmount = this.invoiceResponse[i].OutstandingDue;
        }
      }
    }
  }

  updateAmount(event) {
    if (this.amountForm.valid)
      this.totalAmounttobePaid = (Number)(event.target.value);
  }

  checkChange(event, vioAmounts: IVioAmounts) {
    if (isNaN(this.totalAmounttobePaid))
      this.totalAmounttobePaid = 0;
    let isChecked: boolean = event.target.checked;
    if (isChecked) {
      this.totalAmounttobePaid = this.totalAmounttobePaid + vioAmounts.AdjTotalFee;
      if (this.vioAmounts != null && this.vioAmounts != undefined && this.vioAmounts.length > 0) {
        const result = this.vioAmounts.filter(x => x.checkedStatus === true || x.TotalFee == 0).length;
        if (result === this.vioAmounts.length) {
          this.isCheckallTrips = true;
        }
      }
    }
    else {
      this.totalAmounttobePaid = this.totalAmounttobePaid - vioAmounts.AdjTotalFee;
      this.isCheckallTrips = false;
    }
    vioAmounts.AdjTotalFee = vioAmounts.TotalFee;
  }

  checkAmountChange(event, vioAmounts: IVioAmounts) {
    let preamount: number = vioAmounts.AdjTotalFee;
    if (!isNaN(event) && this.validdigits(event)) {
      vioAmounts.AdjTotalFee = (Number)(event);
      this.totalAmounttobePaid = (Number)((this.totalAmounttobePaid + (vioAmounts.AdjTotalFee - preamount)).toFixed(2));
    }
    else {
      vioAmounts.AdjTotalFee = 0;
      this.totalAmounttobePaid = this.totalAmounttobePaid - preamount;
    }
  }

  checkandUncheckAllRows(event: any) {
    this.totalAmounttobePaid = 0;
    let isChecked: boolean = event.target.checked;
    for (var i = 0; i < this.vioAmounts.length; i++) {
      if (isChecked)
        this.vioAmounts[i].checkedStatus = this.vioAmounts[i].TotalFee > 0 ? true : false;
      else
        this.vioAmounts[i].checkedStatus = false;
      this.vioAmounts[i].AdjTotalFee = this.vioAmounts[i].TotalFee;
      if (this.vioAmounts[i].TotalFee > 0)
        this.totalAmounttobePaid += this.vioAmounts[i].AdjTotalFee;
    }
    if (!isChecked)
      this.totalAmounttobePaid = 0;
  }

  checkandUncheckInvoices(event: any) {
    this.totalAmounttobePaid = 0;
    let isChecked: boolean = event.target.checked;
    for (var i = 0; i < this.invoiceResponse.length; i++) {
      if (isChecked)
        this.invoiceResponse[i].IsChecked = this.invoiceResponse[i].OutstandingDue > 0 && (this.invoiceResponse[i].AgingHoldType != 'Payment Plan' && this.invoiceResponse[i].HoldStatus != 'Hold') ? true : false;
      else
        this.invoiceResponse[i].IsChecked = false;
      this.invoiceResponse[i].AdjTotalAmount = this.invoiceResponse[i].OutstandingDue;
      if (this.invoiceResponse[i].OutstandingDue > 0 && this.invoiceResponse[i].IsChecked)
        this.totalAmounttobePaid += this.invoiceResponse[i].AdjTotalAmount;
    }
    if (!isChecked)
      this.totalAmounttobePaid = 0;
  }

  checkChangeInvoices(event, invoiceResp: IInvoiceResponse) {
    if (isNaN(this.totalAmounttobePaid))
      this.totalAmounttobePaid = 0;
    let isChecked: boolean = event.target.checked;
    if (isChecked) {
      this.totalAmounttobePaid = this.totalAmounttobePaid + invoiceResp.AdjTotalAmount;

      if (this.invoiceResponse != null && this.invoiceResponse != undefined && this.invoiceResponse.length > 0) {
        const result = this.invoiceResponse.filter(x => x.IsChecked === true || x.OutstandingDue == 0 || (x.AgingHoldType == 'Payment Plan' && x.HoldStatus == 'Hold')).length;
        if (result === this.invoiceResponse.length) {
          this.isCheckallInvoices = true;
        }
      }
    }
    else {
      this.isCheckallInvoices = false;
      this.totalAmounttobePaid = this.totalAmounttobePaid - invoiceResp.AdjTotalAmount;
    }
    invoiceResp.AdjTotalAmount = invoiceResp.OutstandingDue;
  }

  checkAmountChangeInvoices(event, invoiceResp: IInvoiceResponse) {
    let preamount: number = invoiceResp.AdjTotalAmount;
    if (!isNaN(event) && this.validdigits(event)) {
      invoiceResp.AdjTotalAmount = (Number)(event);
      this.totalAmounttobePaid = (Number)((this.totalAmounttobePaid + (invoiceResp.AdjTotalAmount - preamount)).toFixed(2));
    }
    else {
      invoiceResp.AdjTotalAmount = 0;
      this.totalAmounttobePaid = this.totalAmounttobePaid - preamount;
    }
  }

  validdigits(amountValue: string): boolean {
    if (amountValue.startsWith('.'))
      return false
    else
      return (amountValue.split(".").length > 1 ? amountValue.split(".")[1].length <= 2 : true);
  }

  doPayment() {
    let formValid: boolean = false
    if (this.payMethod == "OutstandingBalance") {
      formValid = this.vioForm.valid;
      if (this.isCourtTrip) {
        formValid = true;
      }
    }
    else if (this.payMethod == "InvoicePayment") {
      if (this.invoiceResponse.length > 0)
        formValid = this.invoiceForm.valid;
      else
        formValid = true;
    }
    else
      formValid = this.amountForm.valid;
    if (!formValid)
      return;
    if (this.sessionContextResponse.icnId == 0) {
      this.showMsg("error", "ICN is not assigned to do transactions.");
      return;
    }
    if (this.totalAmounttobePaid <= 0) {
      this.showMsg("error", "Amount to be paid should be  greater than zero.");
      return;
    }
    this.msgFlag = false;
    let totallistAmount: number = 0;
    let objPaymentRequest: IViolationPaymentrequest = <IViolationPaymentrequest>{};
    if (this.payMethod == "OutstandingBalance") {
      let objLstITripsRequest: ITripsRequest[] = [];
      for (let i = 0; i < this.vioAmounts.length; i++) {
        if (this.vioAmounts[i].checkedStatus) {
          let tripRequest: ITripsRequest = <ITripsRequest>{};

          tripRequest.CitationId = this.vioAmounts[i].CitationId;
          tripRequest.TripTotalOutstandingAmt = this.vioAmounts[i].TotalFee;
          tripRequest.TotalTripFeesAmts = this.vioAmounts[i].FineFee;
          tripRequest.TripPaymentAmt = this.vioAmounts[i].AdjTotalFee;
          totallistAmount += tripRequest.TripTotalOutstandingAmt;
          objLstITripsRequest.push(tripRequest);
        }
      }
      objPaymentRequest.PaymentFor = "Violation";
      objPaymentRequest.objListTrips = objLstITripsRequest;
    }
    else if (this.payMethod == "InvoicePayment") {

      let objLstInvoiceRequest: IInvoiceRequest[] = [];
      for (let i = 0; i < this.invoiceResponse.length; i++) {
        if (this.invoiceResponse[i].IsChecked) {
          let invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};

          invoiceRequest.InvoicePaymentAmount = this.invoiceResponse[i].AdjTotalAmount;
          invoiceRequest.InvoiceId = this.invoiceResponse[i].InvoiceId;
          invoiceRequest.InvoiceNumber = this.invoiceResponse[i].InvoiceNumber;
          invoiceRequest.PlateNumber = this.invoiceResponse[i].PlateNumber;
          invoiceRequest.BalanceDue = this.invoiceResponse[i].BalanceDue;
          invoiceRequest.InvBatchId = this.invoiceResponse[i].InvoiceBatchId;
          invoiceRequest.VehicleId = this.invoiceResponse[i].VehicleId;
          invoiceRequest.InvOutstading = this.invoiceResponse[i].OutstandingDue;
          totallistAmount += this.invoiceResponse[i].OutstandingDue;
          objLstInvoiceRequest.push(invoiceRequest);
        }
      }
      objPaymentRequest.PaymentFor = "Invoice";
      objPaymentRequest.objListInvoices = objLstInvoiceRequest;
    }
    else if (this.payMethod == "AdministrativeHearingDeposit") {
      objPaymentRequest.PaymentFor = "Admin Hearing";

    }
    if (!this.validStatus) {
      if ((this.payMethod == "OutstandingBalance" || this.payMethod == "InvoicePayment") && this.totalAmounttobePaid != totallistAmount) {
        this.showMsg("alert", "Payment amount is not matching with the outstanding amount for the selected " + (this.payMethod == "InvoicePayment" ? "invoice" : "trip") + "(s). Are you sure you want to proceed?");
        return;
      }
    }
    objPaymentRequest.CustomerId = this.accountId;
    objPaymentRequest.TxnAmount = (Number)(this.totalAmounttobePaid);

    objPaymentRequest.UserName = this.sessionContextResponse.userName;
    objPaymentRequest.LoginId = this.sessionContextResponse.loginId;
    objPaymentRequest.UserId = this.sessionContextResponse.userId;
    objPaymentRequest.ICNId = this.sessionContextResponse.icnId;
    objPaymentRequest.TripIds = this.strCitationIds;
    objPaymentRequest.ViolationProcess = "MakePayment";
    objPaymentRequest = this.makePaymentComp.DoViolationPayment(objPaymentRequest);
  }

  userAction(event) {
    if (event) {
      if (this.cancelConfirm)
        this.cancelClick(1);
      else {
        this.validStatus = true;
        this.doPayment();
      }
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showMsg(alertType: string, msg: string): void {
    this.msgFlag = true;
    this.msgType = alertType;
    this.msgDesc = msg;
  }
}
