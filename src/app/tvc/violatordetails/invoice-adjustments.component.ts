import { IUserEvents } from '../../shared/models/userevents';
import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/services/common.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { element } from 'protractor';
import { CurrencyPipe } from '@angular/common';
import { Actions, ActivitySource, Features, SubSystem } from '../../shared/constants';
import { InvoicesContextService } from '../../shared/services/invoices.context.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-invoice-adjustments',
  templateUrl: './invoice-adjustments.component.html',
  styleUrls: ['./invoice-adjustments.component.scss']
})
export class InvoiceAdjustmentsComponent implements OnInit {
  accountId: number;
  redirectURL: string;
  vioAmountRequest: any;
  feeAmount: string = "0.00";
  strInvoiceIds: string;
  errorMessage: string = "";
  vioAmountsList: any[] = <any[]>[];
  adjustTollAmount: number;
  defaultAdjustment: string = 'C';
  feeAdjustment: any;
  invFeeAdjustments: any;
  invoiceNumber: string;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disableUpdateButton: boolean= false;
  adjustmentType = [
    {
      id: 'C',
      Value: 'Credit Adjustment'
    },
    {
      id: 'D',
      Value: 'Debit Adjustment'
    }
  ];
  violatorContextResponse: IViolatorContextResponse;

  constructor(private sessionContext: SessionService,
    private violatordetailsService: ViolatordetailsService,
    private invoicesContextService: InvoicesContextService,
    private violatorContext: ViolatorContextService,
    private _location: Location,
    private router: Router,
    private commonService: CommonService,
     private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
 this.materialscriptService.material();
    this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
    if (this.violatorContextResponse != null) {
      this.accountId = this.violatorContextResponse.accountId;
    }
    this.invoicesContextService.currentContext.subscribe(res => {
      if (res && res.CustomerId != 0) {
        this.accountId = res.CustomerId;
        this.strInvoiceIds = res.invoiceIDs.toString();
        this.redirectURL = res.referenceURL
      }
    });

    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICEADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;
     this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.INVOICEADJUSTMENTS], Actions[Actions.UPDATE], "");
    this.bindInvoiceDetails(userEvents);
  }

  bindInvoiceDetails(userEvents?: IUserEvents) {
    this.adjustTollAmount = 0;
    this.violatordetailsService.getFeeDetailsBasedOnInvoiceId(parseInt(this.strInvoiceIds), userEvents)
      .subscribe(res => {
        if (res) {
          this.vioAmountsList = res;
          this.vioAmountsList.forEach(element => {
            this.invoiceNumber = element.InvoiceNumber;
            this.adjustTollAmount += element.OustandingAmount;
            element.InvoiceAmount = element.OustandingAmount;
            element.FeeAmount = "0.00"
          });
        }
      });
  }

  onChange(amount, object) {
    this.adjustTollAmount = 0;
    if (amount == 0 || amount == "") {
      this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].FeeAmount = "0.00";
      this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].OustandingAmount = parseFloat(this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].InvoiceAmount)
    }
    else {
      if (this.defaultAdjustment == "D") {
        this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].OustandingAmount = parseFloat(this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].InvoiceAmount) + parseFloat(amount);
      }
      else {
        if (amount <= object.InvoiceAmount) {
          this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].OustandingAmount = parseFloat(this.vioAmountsList.filter(x => x.InvoiceChargeId == object.InvoiceChargeId)[0].InvoiceAmount) - parseFloat(amount);
        }
        else {
          this.showErrorMsg(object.FeeDesc + "adjustment Amount should be less than or equal to " + object.InvoiceAmount);
        }
      }
    }
    this.vioAmountsList.forEach(element => {
      this.adjustTollAmount += element.OustandingAmount;
    });
  }

  applyAdjustment() {
    this.errorMessage = '';
    let items = [];
    for (let i = 0; i < this.vioAmountsList.length; i++) {
      this.feeAdjustment = <any>{};
      if (this.defaultAdjustment == "D") {
        this.vioAmountsList.filter(x => x.InvoiceChargeId == this.vioAmountsList[i].InvoiceChargeId)[0].OustandingAmount = parseFloat(this.vioAmountsList.filter(x => x.InvoiceChargeId == this.vioAmountsList[i].InvoiceChargeId)[0].InvoiceAmount) + parseFloat(this.vioAmountsList[i].FeeAmount);
      }
      else {
        if (this.vioAmountsList[i].FeeAmount <= this.vioAmountsList[i].InvoiceAmount) {
          this.vioAmountsList.filter(x => x.InvoiceChargeId == this.vioAmountsList[i].InvoiceChargeId)[0].OustandingAmount = parseFloat(this.vioAmountsList.filter(x => x.InvoiceChargeId == this.vioAmountsList[i].InvoiceChargeId)[0].InvoiceAmount) - parseFloat(this.vioAmountsList[i].FeeAmount);
        }
        else {
          if (this.errorMessage != "")
            this.errorMessage += "</br>";
          this.errorMessage += this.vioAmountsList[i].FeeDesc + "adjustment Amount should be less than or equal to " + this.vioAmountsList[i].InvoiceAmount;
          this.showErrorMsg(this.errorMessage);
          continue;
        }
      }
      if (this.vioAmountsList[i].FeeAmount > 0 && this.vioAmountsList[i].FeeAmount != "") {
        this.feeAdjustment.Amount = this.vioAmountsList[i].InvoiceAmount;
        this.feeAdjustment.InvChargeId = this.vioAmountsList[i].InvoiceChargeId;
        this.feeAdjustment.Adjamount = this.vioAmountsList[i].FeeAmount;
        this.feeAdjustment.FeeCode = this.vioAmountsList[i].FeeCode;
        this.feeAdjustment.FeeDesc = this.vioAmountsList[i].FeeDesc;
        this.feeAdjustment.InvoiceNumber = this.vioAmountsList[i].InvoiceNumber;
        this.feeAdjustment.InvoiceId = this.vioAmountsList[i].InvoiceId;
        this.feeAdjustment.InvoiceBatchId = this.vioAmountsList[i].InvoiceBatchId;
        this.feeAdjustment.InvoiceLineItemId = this.vioAmountsList[i].InvoiceLineItemId;
        this.feeAdjustment.VehicleId = this.vioAmountsList[i].VehicleId;
        this.feeAdjustment.ActualAmount = this.vioAmountsList[i].Amount;
        items.push(this.feeAdjustment);
      }
    }

    if (items.length == 0) {
      this.showErrorMsg("Provide at least one value to do adjustment");
      return;
    }
    //User Events 
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICEADJUSTMENTS];
    userEvents.ActionName = Actions[Actions.UPDATE];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;

    this.invFeeAdjustments = <any>{};
    this.invFeeAdjustments.FeesToAdjust = items.map(x => Object.assign({}, x));
    this.invFeeAdjustments.UserId = this.sessionContext.customerContext.userId
    this.invFeeAdjustments.loginId = this.sessionContext.customerContext.loginId;
    this.invFeeAdjustments.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.invFeeAdjustments.UserName = this.sessionContext.customerContext.userName;
    this.invFeeAdjustments.ViolatorId = this.accountId;
    this.invFeeAdjustments.SubSystem = SubSystem[SubSystem.TVC];
    this.invFeeAdjustments.CreditOrDebitAdjustment = this.defaultAdjustment;
    this.invFeeAdjustments.ICNId = this.sessionContext.customerContext.icnId;
    this.invFeeAdjustments.InvoiceId = this.strInvoiceIds;
    this.violatordetailsService.invoiceFeeAdjustments(this.invFeeAdjustments, userEvents)
      .subscribe(res => {
        if (this.defaultAdjustment == "C") {
          this.showSucsMsg("Credit adjustment applied successfully.");
        }
        else {
          this.showSucsMsg("Debit adjustment applied successfully.")
        }
      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      },
      () => {
        this.bindInvoiceDetails();
      }
      );
  }

  onSelectionChange(entry) {
    this.defaultAdjustment = entry;
    this.bindInvoiceDetails();
  }

  resetAdjustmnet() {
    this.defaultAdjustment = "C";
    this.bindInvoiceDetails();
  }

  exit() {
    this.invoicesContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    let link = ['tvc/search/violation-search'];
    this.router.navigate(link);

  }
  backClick() {
    this._location.back();
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
