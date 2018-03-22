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
import { TollType, AdjustmentCategory } from '../../shared/constants';

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
    private customerDetailsService: CustomerDetailsService
  ) {

    this.redeemRewardForm = new FormGroup({
      txtRedeemReward: new FormControl('', [Validators.required])
    });
  }

  // form
  redeemRewardForm: FormGroup;

  // Status message 
  statusMessage: string;

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

  ngOnInit() {
    alert('');
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.customerContextService.currentContext
      .subscribe(customerContext => { this.objICustomerContextResponse = customerContext; }
      );
    if (this.objICustomerContextResponse == null) {
      console.log('no context');
      let link = ['csc/search/advanced'];
      this.router.navigate(link);
      return;
    }
    else {
      this.accountId = this.objICustomerContextResponse.AccountId;
    }
    alert('jj44j');
    this.getCustomerBalance();
    
  }

  getCustomerBalance() {
    this.customerDetailsService.getEarnedRewardPoints(this.accountId).subscribe(
      res => {
        if (res) {
          this.rewardbalanceRes = res;
          this.redeemAmount = this.rewardbalanceRes.RewardBalance;
          this.redeemPoints = this.rewardbalanceRes.RewardPoint;
          if (this.redeemPoints == 0) { this.isPaymentDisabled = true; }
          console.log(this.rewardbalanceRes);
        }
        else {
          if (this.rewardbalanceRes == null) {
            this.rewardbalanceRes = <IBalanceResponse>{};
          }
        }
      }
    );

  }

  verifyVlaue(rewardValue) {
    alert("verifyVlaue");
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
    alert('');
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

      this.customerDetailsService.adjustmentRewardBal(this.iAccountAdjustment).subscribe(result => {
        if (result) {
          this.statusMessage = "Redeem points added to the account successfully.";
          this.redeemPointsEntered = 0;
          this.getCustomerBalance();
        }
        else { this.statusMessage = "Redeem points not added to your account. Please check with Administrator"; }
      },
        result => {
          if (result._body) {
            this.statusMessage = result.json();
          }
          else {
            this.statusMessage = result.statusText;
          }
        }
      );
    }
    else { this.isPaymentDisabled = true; this.statusMessage = "Redeem points should be greater than zero."; }
  }

}
