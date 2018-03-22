import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/services/common.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { element } from 'protractor';
import { CurrencyPipe } from '@angular/common';
import { SubSystem, ActivitySource, BalanceType, Features, Actions, defaultCulture } from '../../shared/constants';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { IBalanceRequest } from './models/balancerequest';
import { IBalanceResponse } from './models/balancesresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-admin-hearing',
  templateUrl: './admin-hearing.component.html',
  styleUrls: ['./admin-hearing.component.scss']
})
export class AdminHearingComponent implements OnInit {
  DepositForm: FormGroup;
  tripIdCSV: string = '';
  redirectURL: string;
  longViolatorId: number;
  balanceRequest: IBalanceRequest;
  balanceResponse: IBalanceResponse;
  violatorContextResponse: IViolatorContextResponse;
  depositAmount: number;
  adminDepositAmount: number;
  vioAmountsList: any[];
  violatorTransaction: any;
  violationDetails: any;
  sessionContextResponse: IUserresponse;
  tripContextResponse: ITripsContextResponse;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private sessionContext: SessionService,
    private violatordetailsService: ViolatordetailsService,
    private tripContextService: TripsContextService,
    private violatorContext: ViolatorContextService,
    private _location: Location,
    private commonService: CommonService,
    private router: Router,
     private materialscriptService: MaterialscriptService) { }

  ngOnInit() {


 this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
    if (this.violatorContextResponse != null) {
      this.longViolatorId = this.violatorContextResponse.accountId;
    }

    this.tripContextService.currentContext.subscribe(res => {
      if (res && res.referenceURL.length > 0) {
        this.tripContextResponse = res;
        this.tripIdCSV = res.tripIDs.toString();
        this.redirectURL = res.referenceURL;
      } else {
        // TODO: If no trips context
      }
    });
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ADMINHEARINGTRANSFER];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longViolatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.getViolatorAdminHearAmount(userEvents);
    this.disableButton = !this.commonService.isAllowed(Features[Features.ADMINHEARINGTRANSFER], Actions[Actions.TRANSFER], '');

    this.tripAmountDetails();
  }

  getViolatorAdminHearAmount(userEvents: IUserEvents) {
    this.balanceRequest = <IBalanceRequest>{};
    this.balanceRequest.CustomerId = this.longViolatorId;
    this.balanceRequest.BalanceType = BalanceType[BalanceType.ADMHERIFEE];
    this.violatordetailsService.getBalances(this.balanceRequest, userEvents).subscribe(res => {
      this.balanceResponse = res;
    },
      err => {
      },
      () => {
        console.log(this.balanceResponse);
        this.depositAmount = this.adminDepositAmount = this.balanceResponse.AdminHearBalance;
      }
    );
  }

  tripAmountDetails() {
    this.violationDetails = <any>{};
    this.violationDetails.longViolatorId = this.longViolatorId;
    this.tripIdCSV = this.violationDetails.strCitationIdCSV = this.tripIdCSV;
    this.violatordetailsService.getChargesTrackerDetailsByCitationCSV(this.violationDetails)
      .subscribe(res => {
        if (res) {
          this.vioAmountsList = res;
          console.log(this.vioAmountsList);
        }
      },

      err => {
      },
      () => {
        console.log(this.vioAmountsList.length);
        if (this.vioAmountsList && this.vioAmountsList.length) {
          console.log(this.vioAmountsList.length);
        }
        console.log(this.vioAmountsList.length);
      });
  }

  showFees = function (viotrips) {
    viotrips.boolShowFee = !viotrips.boolShowFee;
  };

  adminHearLiable() {
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.');
    }
    else {
      if (this.adminDepositAmount <= 0 || this.adminDepositAmount == null) {
        this.showErrorMsg('Apply Deposit Amount should be greater than zero.');
        return;
      }
      this.violatorTransaction = <any>{};
      if (this.vioAmountsList[0].TotalTripsPenaltyAmount > 0) {
        if (this.depositAmount >= this.adminDepositAmount) {
          if (this.adminDepositAmount >= this.vioAmountsList[0].TotalTripsPenaltyAmount)
            this.violatorTransaction.OutstandingAmount = this.vioAmountsList[0].TotalTripsPenaltyAmount;
          else
            this.violatorTransaction.OutstandingAmount = this.adminDepositAmount;
          this.violatorTransaction.Amount = this.adminDepositAmount;
          this.violatorTransaction.CustomerId = this.violatorTransaction.ViolatorId = this.longViolatorId;
          this.violatorTransaction.UserName = this.sessionContextResponse.userName;
          this.violatorTransaction.ICNId = this.sessionContextResponse.icnId;
          this.violatorTransaction.UserId = this.sessionContextResponse.userId;
          this.violatorTransaction.LoginId = this.sessionContextResponse.loginId;
          this.violatorTransaction.TxnDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          this.violatorTransaction.CitationCSV = this.tripIdCSV;
          let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.ADMINHEARINGTRANSFER];
          userEvents.ActionName = Actions[Actions.TRANSFER];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.longViolatorId;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;
          this.violatordetailsService.adminHearingLiable(this.violatorTransaction, userEvents)
            .subscribe(res => {
              if (res) {
                this.tripContextResponse.successMessage = 'Adminhearing Amount Adjusted to Trip(s) successfully.';
                this.router.navigate(['tvc/violatordetails/trip-Search']);
              }
            },

            err => {
              this.showErrorMsg(err.statusText.toString());
            },
            () => {
              this.tripAmountDetails();
            });
        }
        else {

          this.showErrorMsg('Applied Deposit Amount should not be greater than Deposited Amount.');
        }
      }
      else {
        this.showErrorMsg('Deposit Amount cannot be applied to a zero balance Trip(s). Select another outstanding Trip(s).');
      }
    }
  }
  adminHearNotLiable() {
    if (this.sessionContextResponse.icnId == 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.');
    }
    else {
      console.log(this.adminDepositAmount);
      if (this.adminDepositAmount <= 0 || this.adminDepositAmount == null) {
        this.showErrorMsg('Apply Deposit Amount should be greater than zero.');
        return;
      }
      this.violatorTransaction = <any>{};
      if (this.vioAmountsList[0].TotalTripsPenaltyAmount > 0) {
        if (this.depositAmount >= this.adminDepositAmount) {
          this.violatorTransaction.OutstandingAmount = this.vioAmountsList[0].TotalTripsPenaltyAmount;
          this.violatorTransaction.Amount = this.depositAmount;
          this.violatorTransaction.CustomerId = this.violatorTransaction.ViolatorId = this.longViolatorId;
          this.violatorTransaction.UserName = this.sessionContextResponse.userName;
          this.violatorTransaction.ICNId = this.sessionContextResponse.icnId;
          this.violatorTransaction.UserId = this.sessionContextResponse.userId;
          this.violatorTransaction.LoginId = this.sessionContextResponse.loginId;
          this.violatorTransaction.TxnDate = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          this.violatorTransaction.CitationCSV = this.tripIdCSV;
           let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.ADMINHEARINGTRANSFER];
          userEvents.ActionName = Actions[Actions.TRANSFER];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.longViolatorId;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;
          this.violatordetailsService.adminHearingNotLiable(this.violatorTransaction, userEvents)
            .subscribe(res => {
              if (res) {
                this.tripContextResponse.successMessage = 'Trip(s) cancelled (Admin Hearing) successfully.';
                this.router.navigate(['tvc/violatordetails/trip-Search']);
              }
            },
            err => {
              this.showErrorMsg(err.statusText.toString());
            },
            () => {
              this.tripAmountDetails();
            });
        }
        else {

         this.showErrorMsg('Applied Deposit Amount should not be greater than Deposited Amount.');
        }
      }
      else {

        this.showErrorMsg('Deposit Amount cannot be applied to a zero balance Trip(s). Select another outstanding Trip(s).');
      }
    }
  }


  backClick() {
    if (this.redirectURL !== '') {
      this.router.navigateByUrl(this.redirectURL);
    }
    else {
      let link = ['tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
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
}
