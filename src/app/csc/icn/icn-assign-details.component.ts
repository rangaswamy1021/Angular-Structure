import { Component, OnInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { ICNService } from "./services/icn.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { Router } from "@angular/router";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { ICNStatus, ICNItemActionGroup, CashType } from "./constants";
import { ICNItemsRequest } from "./models/icnitemsrequest";
import { ICashDenomination } from "./models/cashdenominationrequest";
import { ICNDetails } from "./models/icndetails";
import { ICNDetailsRequest } from "./models/icndetailsrequest";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-icn-assign-details',
  templateUrl: './icn-assign-details.component.html',
  styleUrls: ['./icn-assign-details.component.scss']
})
export class IcnAssignDetailsComponent implements OnInit {
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  showAfterSelection: boolean = false;
  sessionContext: IUserresponse;
  roles = []
  isAssignBlock: boolean = false;
  icnDetails = [];
  tagItems = [];
  userName: string;
  userId: number;
  roleName: string;

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
  allotedItems: number = 0;
  floatAmount: number = 0;
  popupMessage: string;
  isAssign: boolean;


  constructor(private icnService: ICNService, private renderer: Renderer, private commonService: CommonService,
    private router: Router, private sessionService: SessionService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContext = this.sessionService.customerContext;
    if (this.sessionContext == null || this.sessionContext == undefined) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.getRoles();
    this.icnService.getBeginAmount().subscribe(res => this.userBalance = res);
    this.isAssign = !this.commonService.isAllowed(Features[Features.ICNASSIGN], Actions[Actions.ASSIGN], "")
  }
  getRoles() {
    var systemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContext.userId;
    systemActivities.LoginId = this.sessionContext.loginId;
    systemActivities.User = this.sessionContext.userName;
    systemActivities.ActionCode = "VIEW";
    systemActivities.FeaturesCode = "ICN";
    systemActivities.IsViewed = false;
    systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];

    // Checking Previleges 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ICNASSIGN];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContext.roleID);
    userEvents.UserName = this.sessionContext.userName;
    userEvents.LoginId = this.sessionContext.loginId;

    this.commonService.getRoles(systemActivities, userEvents).subscribe(res => {
      this.roles = res;
    })
  }


  getICNsofRole(roleName) {
    if (roleName == "") {
      this.icnDetails = [];
      this.showAfterSelection = false;
      return;
    }
    this.showAfterSelection = true;
    this.roleName = roleName;
    var systemActivities = <ISystemActivities>{};
    systemActivities.UserId = this.sessionContext.userId;
    systemActivities.LoginId = this.sessionContext.loginId;
    systemActivities.User = this.sessionContext.userName;
    systemActivities.ActionCode = "VIEW";
    systemActivities.FeaturesCode = "ICN";
    systemActivities.IsViewed = false;
    systemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.icnService.getUsersbyRole(roleName, systemActivities).subscribe(
      res => {
        this.icnDetails = res;
      }
    );
  }

  // getStatus(id) {
  //   return ICNStatus[id];
  // }

  assignICN(icndetail) {
    this.isAssignBlock = true;
    this.userName = icndetail.UserName;
    this.userId = icndetail.UserId;
    this.icnService.getTagItems().subscribe(res => {
      this.tagItems = res;
      this.tagItems.forEach(x => x.ItemQuantity = 0)
    })
  }

  calculateTotal() {
    this.totalAmount = (this.denom100 * 100 + this.denom50 * 50 + this.denom20 * 20 + this.denom10 * 10 + this.denom5 * 5 + this.denom2 * 2 +
      this.denom1 * 1 + this.denomHalf * 0.5 + this.denomQuater * 0.25 + this.denomDime * 0.1 + this.denomNickel * 0.05 + this.denomPenny * 0.01)
  }

  amountReset() {
    this.totalAmount = 0; this.totalAmount = 0; this.denom100 = 0; this.denom50 = 0; this.denom20 = 0; this.denom10 = 0; this.denom5 = 0; this.denom2 = 0;
    this.denom1 = 0; this.denomHalf = 0; this.denomQuater = 0; this.denomDime = 0; this.denomNickel = 0; this.denomPenny = 0;
  }

  itemReset() {
    this.tagItems.forEach(x => x.ItemQuantity = 0);
  }

  tagItemChange(item, count) {
    this.tagItems.filter(x => x.ItemName == item.ItemName)[0].ItemQuantity = count;
  }

  userAction(event) {
    if (event) {
      this.onSubmit();
    }
  }

  validate() {
    if (this.floatAmount == 0 && this.allotedItems == 0) {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Are you sure you want to proceed to Assign ICN with '0' float amount and no alloted items?";
      return;
    }
    else if (this.floatAmount == 0) {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Are you sure you want to proceed to Assign ICN with '0' float amount?";
      return;
    }
    else if (this.allotedItems == 0) {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Are you sure you want to proceed to Assign ICN with no alloted items?";
      return;
    }
    this.onSubmit()
  }
  onSubmit() {
    var itemCount = 0;
    this.tagItems.forEach(x => { itemCount += parseInt(x.ItemQuantity) });
    if (parseFloat(this.totalAmount.toString()) != parseFloat(this.floatAmount.toFixed(2).toString())) {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = 'Float amount and total amount should match';
    }
    else if (parseInt(this.allotedItems.toString()) != parseInt(itemCount.toString())) {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = 'Item alloted count must match with the item details count';
    }
    else if (parseFloat(this.userBalance.toString()) - (parseFloat(this.floatAmount.toFixed(2).toString())) < 0) {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = 'Insufficient funds to assign ICN';
    }
    else {
      var icnItems = [];

      this.tagItems.forEach(x => {
        if (parseInt(x.ItemQuantity) > 0) {
          var icnItem = <ICNItemsRequest>{};
          icnItem.ItemCount = x.ItemQuantity;
          icnItem.ItemType = x.ItemCode;
          icnItem.ItemActionGroup = ICNItemActionGroup.Alloted;
          icnItem.CreatedUser = this.sessionContext.userName; //Logged UserName
          icnItems.push(icnItem);
        }
      })
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
      cashDenomination.CRDRFlag = "D";
      cashDenomination.FundDate = new Date();
      cashDenomination.CreatedUser = this.sessionContext.userName;
      cashDenomination.Type = CashType.Float;
      icnDetails.RevenueDate = new Date(cashDenomination.FundDate.getFullYear().toString() + '-' + (cashDenomination.FundDate.getMonth() + 1).toString() + '-' + cashDenomination.FundDate.getDate().toString());
      icnDetails.UserId = this.userId
      icnDetails.FloatAmount = parseFloat(this.floatAmount.toFixed(2));
      icnDetails.ItemAllotedCount = itemCount;
      icnDetails.CreatedUser = this.sessionContext.userName;
      icnDetails.ICNStatus = ICNStatus.Open;
      icnDetails.LoginId = this.sessionContext.loginId;
      icnDetails.CustomerID = this.sessionContext.userId;

      // Checking Previleges and auditing
      let userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.ICNASSIGN];
      userEvents.ActionName = Actions[Actions.ASSIGN];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContext.roleID);
      userEvents.UserName = this.sessionContext.userName;
      userEvents.LoginId = this.sessionContext.loginId;

      this.icnService.assignICN(icnDetails, icnItems, cashDenomination, userEvents).subscribe(res => {
        this.getICNsofRole(this.roleName);
        this.isAssignBlock = false;
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgDesc = 'ICN # has been assigned successfully to ' + this.userName;
        this.itemReset();
        this.amountReset();
        this.floatAmount=0;
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = err.statusText;
      })
    }

  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }

  onCancel() {
    this.floatAmount=0;
    this.itemReset();
    this.amountReset();
    this.isAssignBlock = false;
    this.setOutputFlag(false);
  }
}
