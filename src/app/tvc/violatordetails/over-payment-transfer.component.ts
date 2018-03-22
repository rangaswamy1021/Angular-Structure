import { Component, OnInit } from '@angular/core';
import { ViolatordetailsService } from "./services/violatordetails.service";
import { SessionService } from "../../shared/services/session.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { IBalancesResponse } from "../../shared/models/balanceresponse";
import { IVioAmountsResponse } from "./models/vioamountsresponse";
import { IViolatorTransaction } from "./models/violationsrequest";
import { Router } from "@angular/router";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { ITripsContextResponse } from "../../shared/models/tripscontextresponse";
import { IViolationFeesResponse } from "./models/violationfeeresponse";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { CommonService } from "../../shared/services/common.service";
import { Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";

@Component({
  selector: 'app-over-payment-transfer',
  templateUrl: './over-payment-transfer.component.html',
  styleUrls: ['./over-payment-transfer.component.scss']
})
export class OverPaymentTransferComponent implements OnInit {

  accountId: number = 0;
  tripIdCSV: string = '';
  payReceipt: string;
  overPayAmount;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  balanceRes: IBalancesResponse;
  vioAmountsRes: IVioAmountsResponse[];
  violationFees: IViolationFeesResponse[];
  showViolationFees: boolean = false;

  tollFeeSum: number;
  fineFeeSum: number;
  totalFeeSum: number;

  tripsContext: ITripsContextResponse;
  redirectURL: string;
  disableButton: boolean = false;

  constructor(private vioService: ViolatordetailsService, private session: SessionService,
    private violatorContext: ViolatorContextService, private router: Router,
    private tripContextService: TripsContextService, private commonService: CommonService) {

  }

  ngOnInit() {

    this.violatorContext.currentContext
      .subscribe(context => {
        if (context && context.accountId > 0) {
          this.accountId = context.accountId;

          this.tripContextService.currentContext.subscribe(res => {
            if (res && res.referenceURL.length > 0) {
              this.tripIdCSV = res.tripIDs.toString();
              this.redirectURL = res.referenceURL;
            } else {
              // TODO: If no trips context
            }
          });
        } else {
          // TO DO if no violator context
        }

        this.loadOverPaymentBalances();
        this.loadVioAmounts();
      });

    this.disableButton = !this.commonService.isAllowed(Features[Features.OVERPAYMENTTRANSFER], Actions[Actions.TRANSFER], '');
  }

  loadOverPaymentBalances() {

    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.OVERPAYMENTTRANSFER];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.session.customerContext.roleID);
    userEvents.UserName = this.session.customerContext.userName;
    userEvents.LoginId = this.session.customerContext.loginId;

    this.vioService.getOverPaymentBalances(this.accountId.toString(), userEvents).subscribe(
      res => {
        this.balanceRes = res;
        this.overPayAmount = this.balanceRes.EligibleOverPaymentAmount;
        console.log(this.balanceRes);
      }, (err) => {
        this.showErrorMsg('Error while loading data');
        console.log(err);
      });
  }

  loadVioAmounts() {
    this.vioService.getVioAmounts(this.tripIdCSV, this.accountId).subscribe(
      res => {
        this.vioAmountsRes = res;
        this.getFeeSum();
        console.log(this.vioAmountsRes);
      }, (err) => {
        this.showErrorMsg('Error while loading data');
        console.log(err);
      });
  }

  getFeeSum() {
    this.tollFeeSum = 0;
    this.fineFeeSum = 0;
    this.totalFeeSum = 0;
    this.vioAmountsRes.forEach((x: IVioAmountsResponse) => {
      this.tollFeeSum += x.Tollfee;
      this.fineFeeSum += x.FineFee;
      this.totalFeeSum += x.TotalFee;
    });
  }

  overPaymentTransfer() {
    if (this.session.customerContext.icnId === 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.');
      return;
    }

    if (this.overPayAmount === '' || isNaN(this.overPayAmount)) {
      this.showErrorMsg('Apply Overpayment Amount is required and it should be valid money format.');
      return;
    }

    if (this.totalFeeSum > 0) {
      if (this.overPayAmount > 0) {
        if (this.balanceRes.EligibleOverPaymentAmount >= this.overPayAmount) {

          const vioTrxn: IViolatorTransaction = <IViolatorTransaction>{};
          if (this.overPayAmount >= this.totalFeeSum) {
            vioTrxn.OutstandingAmount = this.totalFeeSum;
          } else {
            vioTrxn.OutstandingAmount = this.overPayAmount;
          }

          vioTrxn.CustomerId = this.accountId;
          vioTrxn.ViolatorId = this.accountId;
          vioTrxn.UserName = this.session.customerContext.userName;
          vioTrxn.ICNId = this.session.customerContext.icnId;
          vioTrxn.LoginId = this.session.customerContext.loginId;
          vioTrxn.UserId = this.session.customerContext.userId;
          vioTrxn.CitationCSV = this.tripIdCSV;

          const userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.OVERPAYMENTTRANSFER];
          userEvents.ActionName = Actions[Actions.TRANSFER];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.accountId;
          userEvents.RoleId = parseInt(this.session.customerContext.roleID);
          userEvents.UserName = this.session.customerContext.userName;
          userEvents.LoginId = this.session.customerContext.loginId;

          this.vioService.overpaymentTransfer(vioTrxn, userEvents).subscribe(
            res => {
              this.payReceipt = res;
              this.showSucsMsg('Amount transferred to outstanding Trips successfully');
              this.loadOverPaymentBalances();
              this.loadVioAmounts();
            },
            (err) => {
              this.showErrorMsg('Error while transferring amount to outstanding Trips');
              console.log(err);
            });
        } else {
          this.showErrorMsg('Applied Overpayment amount should not be greater than eligible Overpayment amount.');
        }
      } else {
        this.showErrorMsg('Apply Overpayment Amount should be greater than zero');
      }
    } else {
      this.showErrorMsg('Overpayment Amount cannot be applied to a zero balance Trip.  Select another outstanding Trip.');
    }
  }

  backClick() {
    if (this.redirectURL !== '') {
      this.router.navigateByUrl(this.redirectURL);
    }
  }

  showFees(obj: IVioAmountsResponse) {
    this.showViolationFees = true;
    this.violationFees = obj.objViolationFees;
  }

  resetClick() {
    if (this.balanceRes != null) {
      this.overPayAmount = this.balanceRes.EligibleOverPaymentAmount;
    }
  }

  paymentReceipt() {
    window.open(this.payReceipt);
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

}
