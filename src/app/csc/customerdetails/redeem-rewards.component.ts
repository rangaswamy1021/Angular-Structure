import { Component, OnInit } from '@angular/core';
import { IUserresponse } from '../../shared/models/userresponse';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { Router } from '@angular/router';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { CustomerDetailsService } from './services/customerdetails.service';
import { IBalanceResponse } from './models/balanceresponse';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { IAccountAdjustmentRequest } from './models/accountadjustmentrequest';
import { TollType, AdjustmentCategory, Features, Actions } from '../../shared/constants';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-redeem-rewards',
  templateUrl: './redeem-rewards.component.html',
  styleUrls: ['./redeem-rewards.component.css']
})
export class RedeemRewardsComponent implements OnInit {

  constructor(
    private customerContextService: CustomerContextService,
    private router: Router,
    private sessionContext: SessionService,
    private customerDetailsService: CustomerDetailsService,
    private commonService: CommonService,
    private materialscriptService:MaterialscriptService
  ) {

    this.redeemRewardForm = new FormGroup({
      txtRedeemReward: new FormControl('', [Validators.required])
    });
  }

  // form
  redeemRewardForm: FormGroup;

  // class object 
  sessionContextResponse: IUserresponse;
  objICustomerContextResponse: ICustomerContextResponse;

  rewardbalanceRes: IBalanceResponse;
  iAccountAdjustment: IAccountAdjustmentRequest = <IAccountAdjustmentRequest>{};

  // user  information
  accountId: number;
  userName: string;
  loginId: number;
  isPaymentDisabled: boolean;

  redeemPoints: number;
  redeemAmount: number;
  redeemPointsEntered: number;
  userEvents: IUserEvents;

  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    //console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.customerContextService.currentContext
      .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
      );
    if (this.objICustomerContextResponse == null) {
      //console.log('no context');
      let link = ['csc/search/advanced'];
      this.router.navigate(link);
      return;
    }
    else {
      this.accountId = this.objICustomerContextResponse.AccountId;
    }
    this.insertUserAction();
    this.getCustomerBalance(this.userEvents);
    this.isPaymentDisabled = !this.commonService.isAllowed(Features[Features.REDEEMREWARDS], Actions[Actions.REDEEMED], this.objICustomerContextResponse.AccountStatus);
    this.userEvents = null;
  }

  getCustomerBalance(userEvent: IUserEvents) {
    this.customerDetailsService.getEarnedRewardPoints(this.accountId, userEvent).subscribe(
      res => {
        if (res) {
          this.rewardbalanceRes = res;
          this.redeemAmount = this.rewardbalanceRes.RewardBalance;
          this.redeemPoints = this.rewardbalanceRes.RewardPoint;
          if (this.redeemPoints == 0) { this.isPaymentDisabled = true; }
          ////console.log(this.rewardbalanceRes);
        }
        else {
          if (this.rewardbalanceRes == null) {
            this.rewardbalanceRes = <IBalanceResponse>{};
          }
        }
      }
    );
  }

  insertUserAction() {
    this.setUserActionObject();
    this.userEvents.ActionName = Actions[Actions.VIEW];
  }
  setUserActionObject() {
    this.userEvents = <IUserEvents>{};
    this.userEvents.ActionName = Actions[Actions.REDEEMED];
    this.userEvents.FeatureName = Features[Features.REDEEMREWARDS];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = this.accountId;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  verifyVlaue(rewardValue) {
    if (rewardValue > this.redeemPoints) {
      this.isPaymentDisabled = true;
    }
    else if (rewardValue == 0) {
      this.isPaymentDisabled = true;
    }
    else
      this.isPaymentDisabled = false;
  }

  redeemReward() {
    if (this.redeemPointsEntered > 0) {
      this.iAccountAdjustment.AccStatusCode = this.objICustomerContextResponse.AccountStatus;
      this.iAccountAdjustment.CustomerId = this.objICustomerContextResponse.AccountId;
      if (this.objICustomerContextResponse.AccountType == TollType[TollType.PREPAID]) {
        this.iAccountAdjustment.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PrePaid];
        this.iAccountAdjustment.IsPostpaidCustomer = false;
      }
      if (this.objICustomerContextResponse.AccountType == TollType[TollType.POSTPAID]) {
        this.iAccountAdjustment.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PostPaid];
        this.iAccountAdjustment.IsPostpaidCustomer = true;
      }
      this.iAccountAdjustment.Amount = this.redeemAmount;// need to check 
      this.iAccountAdjustment.User = this.sessionContextResponse.userName;
      this.iAccountAdjustment.RewardBalances = this.redeemAmount; //  existing reward balance
      this.iAccountAdjustment.RedeemRewardPoints = this.redeemPointsEntered; // reward point entered by  CSR
      this.iAccountAdjustment.CSVRewardIds = this.rewardbalanceRes.CSVRewardIds; // need to check 
      this.iAccountAdjustment.RewardPoint = this.redeemPoints; ////  existing reward point
      this.iAccountAdjustment.LoginId = this.sessionContextResponse.loginId;
      this.iAccountAdjustment.UserId = this.sessionContextResponse.userId;
      this.setUserActionObject();
      this.customerDetailsService.adjustmentRewardBal(this.iAccountAdjustment, this.userEvents).subscribe(result => {
        if (result) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = 'Redeem points added to the account successfully.';
          this.redeemPointsEntered = 0;
          this.getCustomerBalance(null);
        }
        else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = 'Redeem points not added to your account. Please check with Administrator';
        }
      },
        result => {
          if (result._body) {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = result.json();
          }
          else {
            this.msgFlag = true;
            this.msgType = 'error';
            this.msgDesc = result.statusText;
          }
        }
      );
    }
    else {
      this.isPaymentDisabled = true;
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = 'Redeem points should be greater than zero.';
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

}
