import { MaterialscriptService } from './../../shared/materialscript.service';
import { ISystemActivities } from './../../shared/models/systemactivitiesrequest';
import { IPaging } from './../../shared/models/paging';
import { CommonService } from './../../shared/services/common.service';
import { Features, Actions } from './../../shared/constants';
import { IUserEvents } from './../../shared/models/userevents';
import { FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { debug } from 'util';
import { ICNTxns } from './models/icntxnsresponse';
import { ICNSysTxns } from './models/icnsystxns';
import { Router } from '@angular/router';
import { ICNItemsRequest } from './models/icnitemsrequest';
import { CashType, ICNItemActionGroup, ICNStatus } from './constants';
import { ICNDetailsRequest } from './models/icndetailsrequest';
import { ICashDenomination } from './models/cashdenominationrequest';
import { ICNDetailsResponse } from './models/icndetailsresponse';
import { IUserresponse } from './../../shared/models/userresponse';
import { SessionService } from './../../shared/services/session.service';
import { ICNDetails } from './models/icndetails';
import { IItemtDetailsResponse } from './../../imc/shipment/models/itemdetailsresponse';
import { ICNService } from './services/icn.service';
import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-icn-count-out',
  templateUrl: './icn-count-out.component.html',
  styleUrls: ['./icn-count-out.component.scss']
})
export class IcnCountOutComponent implements OnInit {
  itemType: string;
  itemResp: IItemtDetailsResponse[];
  icnDetails: ICNDetails = <ICNDetails>{};
  icnBankTxns: ICNSysTxns[];
  icnMoTxn: ICNSysTxns[];
  icnChequeTxns: ICNSysTxns[];
  icnCCTxns: ICNSysTxns[];
  icnCashTxns: ICNSysTxns[];
  icnTagTxn: ICNTxns[]
  sessionContextResponse: IUserresponse;
  totalAmount: number = 0;
  denom100: number = 0;
  denom50: number = 0;
  denom20: number = 0;
  denom10: number = 0;
  denom5: number = 0;
  denom2: number = 0;
  denom1: number = 0;
  denomHalf: number = 0;
  denomQuater: number = 0;
  denomDime: number = 0;
  denomNickel: number = 0;
  denomPenny: number = 0;
  userBalance: number = 0;
  assignedItems: number = 0;
  returnItems: number = 0;
  cashAmount: number = 0;
  bankTotAmount = 0;
  ccTotAmount = 0;
  cashTotAmount = 0;
  moTotAmount = 0;
  checkTotAmount = 0;
  totAssignCount = 0;
  totReturnCount = 0;
  checkAmnt = 0;
  moAmnt = 0;
  popupMessage: string;
  icnResponse: ICNDetailsResponse;
  tagAssignItems = [];
  tagReturnItems = [];
  isDisableCountOut: boolean = false;
  isCountOut: boolean = false;
  validateNumberPattern = "[0-9]*";
  @ViewChild('FailureMessage') public FailureMessage: ElementRef;
  @ViewChild('SuccessMessage') public SuccessMessage: ElementRef;
  failureMessage: string;
  successMessage: string;
  isCountOutView: boolean;
  disableCountOutBtn: boolean;
  msgFlag: boolean = false;
  msgType: string = "";
  msgDesc: string = "";
  msgTitle: string = "";
  @ViewChild('countOutForm') public countOutForm: NgForm;
  constructor(private icnService: ICNService, private sessionContext: SessionService,
    private router: Router, private renderer: Renderer, private location: Location, private commonService: CommonService,
    private materialscriptService: MaterialscriptService) {
    // this.sessionContextResponse = this.sessionContext.customerContext;
  }

  ngOnInit() {
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 1000);
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null || this.sessionContextResponse == undefined) {
      let link = ['/'];
      this.router.navigate(link);
    }
    if (this.sessionContextResponse.icnId > 0) {
      this.isCountOut = true;
    }
    this.icnDetails.ICNId = this.sessionContextResponse.icnId;
    this.icnDetails.UserName = this.sessionContextResponse.userName;
    this.icnDetails.CustomerID = this.sessionContextResponse.userId;
    this.icnDetails.CreatedUser = this.sessionContextResponse.userName;
    this.disableCountOutBtn = !this.commonService.isAllowed(Features[Features.ICNCOUNTOUT], Actions[Actions.COUNTOUT], "");
    this.bindIcnTxns(this.icnDetails);
    this.bindIcnAssignTagTypes();
    this.bindIcnReturnTagTypes();
    this.bindBankTxn(this.icnDetails);
    this.bindCashTxn(this.icnDetails);
    this.bindMO(this.icnDetails);
    this.bindCCTxns(this.icnDetails);
    this.bindChequeTxns(this.icnDetails);
  }

  onSubmit() {
    var assignItemCount = 0;
    var returnItemCount = 0;
    this.tagAssignItems.forEach(x => { assignItemCount += parseInt(x.ItemQuantity) });
    this.tagReturnItems.forEach(x => { returnItemCount += parseInt(x.ItemQuantity) });

    if (this.cashAmount == null)
      this.cashAmount = 0;
    if (this.assignedItems == null)
      this.assignedItems = 0;
    if (this.returnItems == null)
      this.returnItems = 0;
    if (parseFloat(this.totalAmount.toString()) != parseFloat(this.cashAmount.toString())) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'Cash amount and denominations total amount should match';
    }
    if (parseInt(this.assignedItems.toString()) != parseInt(assignItemCount.toString())) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'Item assigned count must match with the item assigned details count';
    }
    if (parseInt(this.returnItems.toString()) != parseInt(returnItemCount.toString())) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'Item Return count must match with the item return details count';
    }
    else if (!this.countOutForm.valid) {
      this.validateAllFormFields(this.countOutForm);
    }
    else {

      var icnAssignItems = [];
      var icnReturnItems = [];
      this.tagAssignItems.forEach(x => {
        if (parseInt(x.ItemQuantity) > 0) {
          var icnAssignItem = <ICNItemsRequest>{};
          icnAssignItem.ItemCount = x.ItemQuantity;
          icnAssignItem.ItemType = x.ItemCode;
          icnAssignItem.ItemActionGroup = ICNItemActionGroup.Assigned;
          icnAssignItem.CreatedUser = this.sessionContextResponse.userName;
          icnAssignItems.push(icnAssignItem);
        }
      })

      this.tagReturnItems.forEach(y => {
        if (parseInt(y.ItemQuantity) > 0) {
          var icnReturnItem = <ICNItemsRequest>{};
          icnReturnItem.ItemCount = y.ItemQuantity;
          icnReturnItem.ItemType = y.ItemCode;
          icnReturnItem.ItemActionGroup = ICNItemActionGroup.Returned;
          icnReturnItem.CreatedUser = this.sessionContextResponse.userName;
          icnReturnItems.push(icnReturnItem);
        }
      })
      this.isDisableCountOut = false;
      var cashDenomination = <ICashDenomination>{};
      var icnDetails = <ICNDetailsRequest>{}
      cashDenomination.Hundreds = this.denom100;
      cashDenomination.Fifties = this.denom50;
      cashDenomination.Twenties = this.denom20;
      cashDenomination.Tens = this.denom10;
      cashDenomination.Fives = this.denom5;
      cashDenomination.Twos = this.denom2;
      cashDenomination.Ones = this.denom1;
      cashDenomination.Halfs = this.denomHalf;
      cashDenomination.Quarters = this.denomQuater;
      cashDenomination.Dimes = this.denomDime;
      cashDenomination.Nickles = this.denomNickel;
      cashDenomination.Pennies = this.denomPenny;
      cashDenomination.CRDRFlag = "C";
      cashDenomination.FundDate = new Date();
      cashDenomination.CreatedUser = this.sessionContextResponse.userName;
      cashDenomination.Type = CashType.Float;

      icnDetails.RevenueDate = new Date(cashDenomination.FundDate.getFullYear().toString() + '-' + (cashDenomination.FundDate.getMonth() + 1).toString() + '-' + cashDenomination.FundDate.getDate().toString());
      icnDetails.UserId = this.sessionContextResponse.userId;
      icnDetails.ICNId = this.sessionContextResponse.icnId;
      icnDetails.FloatAmount = icnDetails.CashAmount = this.cashAmount;
      icnDetails.ItemAssignCount = assignItemCount;
      icnDetails.ItemReturnedCount = returnItemCount;
      icnDetails.UpdatedUser = this.sessionContextResponse.userName;
      icnDetails.MOAmount = this.moAmnt;
      icnDetails.CheckAmount = this.checkAmnt;
      icnDetails.ICNStatus = ICNStatus.Counted;
      if (icnDetails.MOAmount == null)
        icnDetails.MOAmount = 0;
      if (icnDetails.CheckAmount == null)
        icnDetails.CheckAmount = 0;

      this.icnService.getIcnDetails(icnDetails).subscribe(
        res => {
          if (res) {
            this.icnResponse = res;
            var itemAllotedCount = 0;
            if (this.icnResponse != undefined && this.icnResponse != null) {
              itemAllotedCount = (this.icnResponse.ItemAllotedCount > 0) ? this.icnResponse.ItemAllotedCount : 0;
            }
            icnDetails.ItemRemainingCount = (itemAllotedCount - icnDetails.ItemAssignCount) + icnDetails.ItemReturnedCount;
            icnDetails.RevenueDate = new Date(new Date().toLocaleString());
            let userEvents: IUserEvents;
            userEvents = <IUserEvents>{};
            userEvents.FeatureName = Features[Features.ICNCOUNTOUT];
            userEvents.ActionName = Actions[Actions.COUNTOUT];
            userEvents.PageName = this.router.url;
            userEvents.CustomerId = 0;
            userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
            userEvents.UserName = this.sessionContextResponse.userName;
            userEvents.LoginId = this.sessionContextResponse.loginId;

            this.icnService.countOutIcn(icnDetails, icnAssignItems, icnReturnItems, cashDenomination, userEvents).subscribe(
              res => {
                if (res) {
                  this.sessionContextResponse.icnId = 0;
                  this.sessionContext.changeResponse(this.sessionContextResponse);
                  console.log(this.sessionContextResponse);
                  this.isCountOut = false;
                  this.amountReset();
                  this.resetMo();
                  this.resetItems();
                  this.icnBankTxns = <ICNSysTxns[]>{};
                  this.icnMoTxn = <ICNSysTxns[]>{};
                  this.icnChequeTxns = <ICNSysTxns[]>{};
                  this.icnCCTxns = <ICNSysTxns[]>{};
                  this.icnCashTxns = <ICNSysTxns[]>{};
                  this.icnTagTxn = <ICNTxns[]>{};
                  this.msgFlag = true;
                  this.msgType = 'success';
                  this.msgTitle = '';
                  this.msgDesc = 'Details are successfully submitted for verification';
                }
              }, err => {
                console.log(err);
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = err.statusText;
              }
            );
          }
        });
    }
  }
  calculateTotal() {
    this.totalAmount = (this.denom100 * 100 + this.denom50 * 50 + this.denom20 * 20 + this.denom10 * 10 + this.denom5 * 5 + this.denom2 * 2 +
      this.denom1 * 1 + this.denomHalf * 0.5 + this.denomQuater * 0.25 + this.denomDime * 0.1 + this.denomNickel * 0.05 + this.denomPenny * 0.01)
  }

  amountReset() {
    this.totalAmount = 0; this.cashAmount = 0; this.denom100 = 0; this.denom50 = 0; this.denom20 = 0; this.denom10 = 0; this.denom5 = 0; this.denom2 = 0;
    this.denom1 = 0; this.denomHalf = 0; this.denomQuater = 0; this.denomDime = 0; this.denomNickel = 0; this.denomPenny = 0;
  }
  goBack() {
    this.location.back();
  }
  resetMo() {
    this.checkAmnt = 0;
    this.moAmnt = 0;
  }

  resetItems() {
    this.tagAssignItems.forEach(x => { x.ItemQuantity = 0 });
    this.tagReturnItems.forEach(x => { x.ItemQuantity = 0 });
    this.returnItems = 0;
    this.assignedItems = 0;
  }

  getIcnDetails(icnDetails: ICNDetails) {
    this.icnService.getIcnDetails(icnDetails).subscribe(
      res => {
        if (res) {
          this.icnResponse = res;
        }
      }
    );
  }

  bindIcnTxns(icnDetails: ICNDetails): void {
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ICNCOUNTOUT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    let systemActivities: ISystemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContextResponse.userId;
    systemActivities.User = this.sessionContextResponse.userName;
    systemActivities.LoginId = this.sessionContextResponse.loginId;
    systemActivities.CustomerId = this.sessionContextResponse.userId;
    systemActivities.IsViewed = true;
    systemActivities.ActionCode = Actions[Actions.REOPEN];
    systemActivities.FeaturesCode = Features[Features.ICNVERIFY];
    let iCNDetails = <ICNDetailsRequest>{}
    iCNDetails.UserName = this.sessionContextResponse.userName;
    let status = ICNStatus[ICNStatus.Reopened].toString();


    let paging: IPaging;
    paging = <IPaging>{};
    paging.PageNumber = this.tagPageNumber;
    paging.PageSize = this.tagPageItemNumber;
    paging.SortColumn = "SERIALNO";
    paging.SortDir = 1;
    this.icnService.bindItemSystransactions(icnDetails.ICNId, paging, systemActivities).subscribe(
      res => {
        if (res) {
          this.icnTagTxn = res;

          console.log(this.icnTagTxn.length);
          if (this.icnTagTxn.length > 0 && this.icnTagTxn != null) {
            this.totAssignCount = this.icnTagTxn[0].ItemAssignedCount;
            this.totReturnCount = this.icnTagTxn[0].ItemReturnedCount;
            this.tagTotalRecordCount = this.icnTagTxn[0].ItemAssignedCount + this.icnTagTxn[0].ItemReturnedCount;
          }
          if (this.tagTotalRecordCount < this.tagPageItemNumber) {
            this.tagEndItemNumber = this.tagTotalRecordCount
          }
          else {
            this.tagEndItemNumber = this.tagPageItemNumber;
          }
        }
      }
    );
  }

  bindBankTxn(icnDetails: ICNDetails): void {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.bankPageNumber;
    paging.PageSize = this.bankPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;
    this.icnService.bindBankTxns(icnDetails, paging).subscribe(
      res => {
        if (res) {
          this.icnBankTxns = res;
          if (this.icnBankTxns.length > 0 && this.icnBankTxns != null) {
            this.bankTotAmount = this.icnBankTxns[0].TotalTxnAmount;
            this.bankTotalRecordCount = this.icnBankTxns[0].ReCount;
          }
          if (this.bankTotalRecordCount < this.bankPageItemNumber) {
            this.bankEndItemNumber = this.bankTotalRecordCount
          }
          else {
            this.bankEndItemNumber = this.bankPageItemNumber;
          }
        }
      }
    );
  }

  bindMO(icnDetails: ICNDetails): void {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.moPageNumber;
    paging.PageSize = this.moPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;
    this.icnService.bindMOTxns(icnDetails, paging).subscribe(
      res => {
        if (res) {
          this.icnMoTxn = res;
          //
          console.log(this.icnMoTxn);
          if (this.icnMoTxn.length > 0 && this.icnMoTxn != null) {
            this.moTotalRecordCount = this.icnMoTxn[0].ReCount;
            this.moTotAmount = this.icnMoTxn[0].TotalTxnAmount;
          }
          if (this.moTotalRecordCount < this.moPageItemNumber) {
            this.moEndItemNumber = this.moTotalRecordCount
          }
        }
      }
    );
  }

  bindCashTxn(icnDetails: ICNDetails): void {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.cashPageNumber;
    paging.PageSize = this.cashPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;
    this.icnService.bindCashTxns(icnDetails, paging).subscribe(
      res => {
        if (res) {
          this.icnCashTxns = res;
          if (this.icnCashTxns.length > 0 && this.icnCashTxns != null) {
            this.cashTotAmount = this.icnCashTxns[0].TotalTxnAmount;
            this.cashTotalRecordCount = this.icnCashTxns[0].ReCount;
          }
          if (this.cashTotalRecordCount < this.cashPageItemNumber) {
            this.cashEndItemNumber = this.cashTotalRecordCount
          }
        }
      }
    );
  }
  bindCCTxns(icnDetails: ICNDetails): void {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.CCPageNumber;
    paging.PageSize = this.ccPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;
    this.icnService.bindCCTxns(icnDetails, paging).subscribe(
      res => {
        if (res) {
          this.icnCCTxns = res;
          console.log(this.icnCCTxns);
          if (this.icnCCTxns.length > 0 && this.icnCCTxns != null) {
            this.ccTotAmount = this.icnCCTxns[0].TotalTxnAmount;
            this.ccTotalRecordCount = this.icnCCTxns[0].ReCount;
          }
          if (this.ccTotalRecordCount < this.ccPageItemNumber) {
            this.ccEndItemNumber = this.ccTotalRecordCount
          }
        }
      }
    );
  }

  bindChequeTxns(icnDetails: ICNDetails): void {
    let paging: IPaging = <IPaging>{};
    paging.PageNumber = this.checkPageNumber;
    paging.PageSize = this.checkPageItemNumber;
    paging.SortColumn = "LINKID";
    paging.SortDir = 1;
    this.icnService.bindChequeTxns(icnDetails, paging).subscribe(
      res => {
        if (res) {
          this.icnChequeTxns = res;
          if (this.icnChequeTxns.length > 0 && this.icnChequeTxns != null) {
            this.checkTotAmount = this.icnChequeTxns[0].TotalTxnAmount;
            this.checkTotalRecCount = this.icnChequeTxns[0].ReCount;
          }
          if (this.checkTotalRecCount < this.checkPageItemNumber) {
            this.checkEndItemNumber = this.checkTotalRecCount
          }
        }
      }
    );
  }

  bindIcnAssignTagTypes(): void {
    this.icnService.getTagItems().subscribe(
      res => {
        if (res) {
          this.tagAssignItems = res;
          console.log(res);
        }
      }
    );

  }

  bindIcnReturnTagTypes(): void {
    this.icnService.getTagItems().subscribe(
      res => {
        if (res) {
          this.tagReturnItems = res;
        }
      }
    );

  }

  tagAssingItemChange(item, count) {
    this.tagAssignItems.filter(x => x.ItemName == item.ItemName)[0].ItemQuantity = count;
  }
  tagReturnItemChange(item, count) {
    this.tagReturnItems.filter(x => x.ItemName == item.ItemName)[0].ItemQuantity = count;
  }


  CCPageNumber: number = 1;
  ccPageItemNumber: number = 10;
  ccStartItemNumber: number = 1;
  ccEndItemNumber: number = this.ccPageItemNumber;
  ccTotalRecordCount: number;

  ccPageChanged(event) {
    this.CCPageNumber = event;
    this.ccStartItemNumber = (((this.CCPageNumber) - 1) * this.ccPageItemNumber) + 1;
    this.ccEndItemNumber = ((this.CCPageNumber) * this.ccPageItemNumber);
    if (this.ccEndItemNumber > this.ccTotalRecordCount)
      this.ccEndItemNumber = this.ccTotalRecordCount;
    this.bindCCTxns(this.icnDetails);
  }

  checkPageNumber: number = 1;
  checkPageItemNumber: number = 10;
  //checkDataLength: number = this.dataLength;
  checkStartItemNumber: number = 1;
  checkEndItemNumber: number = this.checkPageItemNumber;
  checkTotalRecCount: number
  checkPageChanged(event) {
    this.checkPageNumber = event;
    this.checkStartItemNumber = (((this.checkPageNumber) - 1) * this.checkPageItemNumber) + 1;
    this.checkEndItemNumber = ((this.checkPageNumber) * this.checkPageItemNumber);
    if (this.checkEndItemNumber > this.checkTotalRecCount)
      this.checkEndItemNumber = this.checkTotalRecCount;
    this.bindChequeTxns(this.icnDetails);
  }

  cashPageNumber: number = 1;
  cashPageItemNumber: number = 10;
  cashkStartItemNumber: number = 1;
  cashEndItemNumber: number = this.cashPageItemNumber;
  cashTotalRecordCount: number;
  cashPageChanged(event) {
    this.cashPageNumber = event;
    this.cashkStartItemNumber = (((this.cashPageNumber) - 1) * this.cashPageItemNumber) + 1;
    this.cashEndItemNumber = ((this.cashPageNumber) * this.cashPageItemNumber);
    if (this.cashEndItemNumber > this.cashTotalRecordCount)
      this.cashEndItemNumber = this.cashTotalRecordCount;
    this.bindCashTxn(this.icnDetails);
  }

  bankPageNumber: number = 1;
  bankPageItemNumber: number = 10;
  bankkStartItemNumber: number = 1;
  bankEndItemNumber: number = this.bankPageItemNumber;
  bankTotalRecordCount: number;
  bankPageChanged(event) {
    this.bankPageNumber = event;
    this.bankkStartItemNumber = (((this.bankPageNumber) - 1) * this.bankPageItemNumber) + 1;
    this.bankEndItemNumber = ((this.bankPageNumber) * this.bankPageItemNumber);
    if (this.bankEndItemNumber > this.bankTotalRecordCount)
      this.bankEndItemNumber = this.bankTotalRecordCount;
    this.bindBankTxn(this.icnDetails);
  }

  moPageNumber: number = 1;
  moPageItemNumber: number = 10;
  moStartItemNumber: number = 1;
  moEndItemNumber: number = this.moPageItemNumber;
  moTotalRecordCount: number;
  moPageChanged(event) {
    this.moPageNumber = event;
    this.moStartItemNumber = (((this.moPageNumber) - 1) * this.moPageItemNumber) + 1;
    this.moEndItemNumber = ((this.moPageNumber) * this.moPageItemNumber);
    if (this.moEndItemNumber > this.moTotalRecordCount)
      this.moEndItemNumber = this.moTotalRecordCount;
    this.bindMO(this.icnDetails);
  }

  tagPageNumber: number = 1;
  tagPageItemNumber: number = 10;
  tagStartItemNumber: number = 1;
  tagEndItemNumber: number = this.tagPageItemNumber;
  tagTotalRecordCount: number;
  tagPageChanged(event) {
    this.tagPageNumber = event;
    this.tagStartItemNumber = (((this.tagPageNumber) - 1) * this.tagPageItemNumber) + 1;
    this.tagEndItemNumber = ((this.tagPageNumber) * this.tagPageItemNumber);
    if (this.tagEndItemNumber > this.tagTotalRecordCount)
      this.tagEndItemNumber = this.tagTotalRecordCount;
    this.bindIcnTxns(this.icnDetails);
  }

  // pageChanged(event) {
  //   this.p = event;
  //   this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
  //   this.endItemNumber = ((this.p) * this.pageItemNumber);
  //   if (this.endItemNumber > this.dataLength)
  //     this.endItemNumber = this.dataLength;
  // }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  validateAllFormFields(formGroup: NgForm) { //{1}  
    Object.keys(formGroup.controls).forEach(controlName => { //{2}
      const control = formGroup.controls[controlName]; //{3}     
      control.markAsTouched({ onlySelf: true });
    });
  }
}
