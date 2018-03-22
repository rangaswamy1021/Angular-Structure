import { Router } from '@angular/router';
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { IBlocklistresponse } from '../../shared/models/blocklistmessageresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { Actions, ActivitySource, Features, SubSystem, defaultCulture } from '../../shared/constants';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { CustomerserviceService } from './services/customerservice.service';
import { CustomerDetailsService } from '../customerdetails/services/customerdetails.service';
import { ICustomerAttributeRequest } from '../../shared/models/customerattributerequest';
import { ICustomerAttributeResponse } from '../../shared/models/customerattributeresponse';
import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialscriptService } from "../../shared/materialscript.service";


declare var $: any;

@Component({
  selector: 'app-referral-program',
  templateUrl: './referral-program.component.html',
  styleUrls: ['./referral-program.component.scss']
})
export class ReferralprogramComponent implements OnInit {

  constructor(private customerService: CustomerserviceService, private customerDetailsService: CustomerDetailsService, private router: Router,
    private customerContext: CustomerContextService, private sessionContext: SessionService, private commonService: CommonService, private materialscriptService:MaterialscriptService) { }

  referralProgramForm: FormGroup;
  longCustomerid: number;
  customerAttributesResponse: ICustomerAttributeResponse;
  isShowAddBlock: boolean = false;
  isShowAddLink: boolean = false;
  checkReferralCust: boolean;
  customerAttributesRequest: ICustomerAttributeRequest;
  tollBalance: number = 0;
  referralAccountId: number;
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  ischeckBlockList: boolean = true;
  blockListDetails: IBlocklistresponse[] = [];
  disableButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    console.log(this.sessionContextResponse);

    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    if (this.customerContextResponse.AccountId > 0) {
      this.longCustomerid = this.customerContextResponse.AccountId;
    }

    this.referralProgramForm = new FormGroup({
      'referredAccountId': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(10)])
    });
    this.isShowAddLink = true;

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.REFERRAL];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longCustomerid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.showReferralDetails(userEvents);
    !this.commonService.isAllowed(Features[Features.REFERRAL], Actions[Actions.VIEW], "");
    this.disableButton = !this.commonService.isAllowed(Features[Features.REFERRAL], Actions[Actions.REQUEST], "");
  }

  showReferralDetails(userEvents?) {
    this.customerService.getReferralAccounts(this.longCustomerid, userEvents)
      .subscribe(res => {
        this.customerAttributesResponse = res
        if (this.customerAttributesResponse == null)
          this.isShowAddLink = true;
        else
          this.isShowAddLink = false;
      });
  }

  addlinkclick() {
    this.isShowAddBlock = true;
    this.isShowAddLink = false;
     this.referralProgramForm.reset();
  }

  cancelClick() {
    this.isShowAddBlock = false;
    this.isShowAddLink = true;
    this.referralProgramForm.reset();
    this.materialscriptService.material();
  }

  resetClick() {
    this.referralProgramForm.reset();
    this.materialscriptService.material();
  }

  addRefAccClick() {
    this.referralProgramForm.controls["referredAccountId"].markAsTouched({ onlySelf: true });
    if (this.referralProgramForm.valid) {
      if (this.referralProgramForm.controls['referredAccountId'].value == "") {
        this.showErrorMsg("Please enter Account#");
      }
      else {
        this.referralAccountId = this.referralProgramForm.controls['referredAccountId'].value;
        this.customerService.checkReferralCustomer(this.referralAccountId, 1)
          .subscribe(res => {
            this.checkReferralCust = res;
          }, (err) => { }
          , () => {
            if (this.checkReferralCust) {
              this.customerDetailsService.getCustomerAllTypesOfBalances(this.referralAccountId).subscribe(
                res => {
                  if (res != null)
                    this.tollBalance = res.TollBalance;
                }, (err) => { }
                , () => {
                  this.submitClick(this.referralAccountId);
                }
              )
            }
            else {
              this.showErrorMsg("Enter a valid Account #");
            }
          });
      }
    }
  }

  submitClick(referralAccountId: number) {
    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.REFERRAL];
    userEvents.ActionName = Actions[Actions.REQUEST];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longCustomerid;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.customerAttributesRequest = <ICustomerAttributeRequest>{};
    this.customerAttributesRequest.AccountId = this.longCustomerid;
    this.customerAttributesRequest.ReferralCustomerId = referralAccountId;
    this.customerAttributesRequest.RefIndicator = 1;
    this.customerAttributesRequest.ReferalBalance = this.customerAttributesRequest.ReferralCustomerId != 0 ? this.tollBalance : 0;
    this.customerAttributesRequest.RequestDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.customerAttributesRequest.RequestStatus = "Pending";
    this.customerAttributesRequest.UpdatedUser = this.sessionContextResponse.userName;
    this.customerAttributesRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.customerAttributesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.customerAttributesRequest.CheckBlockList = this.ischeckBlockList;
    this.customerService.insertReferalCustomer(this.customerAttributesRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.showReferralDetails();
          this.isShowAddBlock = false;
          this.isShowAddLink = false;
          this.showSucsMsg("Referred account details added successfully");
        }
      }, (err) => {
        if (err._body) {
          this.blockListDetails = err.json();
          $('#blocklist-dialog').modal('show');
        }
        else {
         this.showErrorMsg(err.statusText);
        }
      }
    );
  }

  blocklistYesClick() {
    this.ischeckBlockList = false;
    this.addRefAccClick();
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

}
