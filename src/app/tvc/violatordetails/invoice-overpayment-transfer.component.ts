import { Component, OnInit } from '@angular/core';
import { IBalancesResponse } from '../../shared/models/balanceresponse';
import { ViolatordetailsService } from './services/violatordetails.service';
import { SessionService } from '../../shared/services/session.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { Router } from '@angular/router';
import { IViolatorTransaction } from "./models/violationsrequest";
import { FormGroup } from "@angular/forms";
import { IInvoiceRequest } from "../../invoices/models/invoicesrequest";
import { SubSystem, Features, Actions } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from '../../shared/services/common.service';

@Component({
  selector: 'app-invoice-overpayment-transfer',
  templateUrl: './invoice-overpayment-transfer.component.html',
  styleUrls: ['./invoice-overpayment-transfer.component.scss']
})
export class InvoiceOverpaymentTransferComponent implements OnInit {

  accountId: number = 0;
  overPayAmount;
  invoiceResponse: any[];
  selectedInvoiceList: any[] = <any>[];
  isParentSelected: boolean;
  totalOverPayAmount;
  decAdjustmentAmt: number = 0;
  payReceipt: string;
  createForm: FormGroup;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;



  balanceRes: IBalancesResponse;
  constructor(private vioService: ViolatordetailsService, private session: SessionService, private violatorContext: ViolatorContextService, private router: Router, private commonService: CommonService) { }

  ngOnInit() {
    this.violatorContext.currentContext
      .subscribe(context => {
        if (context && context.accountId > 0) {
          console.log(context);
          this.accountId = context.accountId;

        } else {
          // TO DO if no violator context
        }
      });
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.session.customerContext.roleID);
    userEvents.UserName = this.session.customerContext.userName;
    userEvents.LoginId = this.session.customerContext.loginId;
    this.loadOverPaymentBalances(userEvents);
     this.disableButton = !this.commonService.isAllowed(Features[Features.VIOLATORINVOICE], Actions[Actions.OVERPAYMENTTRANSFER], '');
    this.getOutstandingInvoices(this.accountId);
  }

  loadOverPaymentBalances(userEvents: any) {
    this.vioService.getOverPaymentBalances(this.accountId.toString(), userEvents).subscribe(
      res => {
        this.balanceRes = res;
        this.overPayAmount = this.balanceRes.EligibleOverPaymentAmount.toFixed(2);
        console.log(this.balanceRes);
      }, (err) => {
         this.showErrorMsg('Error while loading data');
        console.log(err);
      });
  }
  getOutstandingInvoices(accountId: number) {
    this.vioService.getOutstandingInvoices(accountId, 0).subscribe(
      res => {
        this.invoiceResponse = res;
        console.log(this.invoiceResponse);
        for (let i = 0; i < this.invoiceResponse.length; i++) {
          if (this.invoiceResponse[i].Status === 'TRANSFERRED' || this.invoiceResponse[i].Status === 'PAID' || this.invoiceResponse[i].Status === 'WRITEOFF' || this.invoiceResponse[i].IsAgingHold) {
            this.invoiceResponse[i].isDisableInvoice = true;
          } else {

            this.invoiceResponse[i].isDisableInvoice = this.invoiceResponse[i].OutstandingDue <= 0 ? true : false;

          }
          this.invoiceResponse[i].AgingHoldType = this.invoiceResponse[i].AgingHoldType !== '' ? this.invoiceResponse[i].AgingHoldType : 'N/A';
          this.invoiceResponse[i].HoldStatus = this.invoiceResponse[i].HoldStatus !== '' ? this.invoiceResponse[i].HoldStatus : 'N/A';
        }
        if (this.selectedInvoiceList && this.selectedInvoiceList.length > 0) {

          let count: number = 0;
          for (let i = 0; i < this.invoiceResponse.length; i++) {
            const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.invoiceResponse[i].InvoiceId);
            if (index > -1) {
              this.invoiceResponse[i].isInvoiceSelected = true;
              count++;
            } else {
              this.invoiceResponse[i].isInvoiceSelected = false;
            }
          }
          if (this.invoiceResponse.length === count) {
            this.isParentSelected = true;
          } else {
            this.isParentSelected = false;
          }
        }
      }, (err) => {
         this.showErrorMsg('Error while loading data');
        console.log(err);
      });
  }
  backClick() {
    let link = ['tvc/violatordetails/violator-summary'];
    this.router.navigate(link);
  }
  invoiceOverPaymentTransfer() {
     let objLstInvoiceRequest: IInvoiceRequest[] = [];
    if (this.session.customerContext.icnId <= 0) {
       this.showErrorMsg('ICN is not assigned to do transactions.');
      return;

    }
    if (!this.atleaseone()) {
       this.showErrorMsg('Select atleast one invoice');
      return;
    }
    if (this.overPayAmount === '' || isNaN(this.overPayAmount)) {
       this.showErrorMsg('Apply Overpayment Amount is required and it should be valid money format.');
      return;
    }
    this.vioService.getOverPaymentBalances(this.accountId.toString()).subscribe(
      res => {
        this.balanceRes = res;
        this.totalOverPayAmount = this.balanceRes.ViolationDepositBalance;
        console.log(this.balanceRes);
      }, (err) => {
         this.showErrorMsg('Error while loading data');
        console.log(err);
      },
      () => {
        if (this.totalOverPayAmount > 0) {
          let vioTrxn: IViolatorTransaction = <IViolatorTransaction>{};
          if (this.overPayAmount > 0) {
            if (this.balanceRes.EligibleOverPaymentAmount >= this.overPayAmount) {
              if (this.overPayAmount > 0) {

                if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
                  for (let i = 0; i < this.selectedInvoiceList.length; i++) {
                    if (this.selectedInvoiceList[i].isInvoiceSelected) {
                      this.decAdjustmentAmt = this.decAdjustmentAmt + this.selectedInvoiceList[i].OutstandingDue;
                      let invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
                      invoiceRequest.InvoicePaymentAmount = this.selectedInvoiceList[i].OutstandingDue;
                      invoiceRequest.InvOutstading = this.selectedInvoiceList[i].OutstandingDue;
                      invoiceRequest.InvoiceId = this.selectedInvoiceList[i].InvoiceId;
                      invoiceRequest.InvoiceNumber = this.selectedInvoiceList[i].InvoiceNumber;
                      invoiceRequest.PlateNumber = this.selectedInvoiceList[i].PlateNumber;
                      invoiceRequest.BalanceDue = this.selectedInvoiceList[i].BalanceDue;
                      invoiceRequest.InvBatchId = this.selectedInvoiceList[i].InvoiceBatchId;
                      invoiceRequest.VehicleId = this.selectedInvoiceList[i].VehicleId;
                      invoiceRequest.AccountId = this.accountId;
                      objLstInvoiceRequest.push(invoiceRequest);
                    }
                  }
                  if (this.overPayAmount > 0 && this.decAdjustmentAmt > 0) {
                    if (this.decAdjustmentAmt >= this.overPayAmount) {
                      vioTrxn.OutstandingAmount = this.overPayAmount;
                    } else {
                      vioTrxn.OutstandingAmount = this.decAdjustmentAmt;
                    }

                  }

                  vioTrxn.CustomerId = this.accountId;
                  vioTrxn.ViolatorId = this.accountId;
                  vioTrxn.TxnDate = new Date();
                  vioTrxn.PaymentTxnDate = new Date();
                  vioTrxn.UserName = this.session.customerContext.userName;
                  vioTrxn.ICNId = this.session.customerContext.icnId;
                  vioTrxn.LoginId = this.session.customerContext.loginId;
                  vioTrxn.UserId = this.session.customerContext.userId;
                  vioTrxn.objListInvoices = objLstInvoiceRequest.filter(s => s.InvBatchId);
                  vioTrxn.SubSystem = SubSystem[SubSystem.TVC];

                  this.vioService.invoiceOverpaymentTransfer(vioTrxn).subscribe(
                    res => {
                      this.payReceipt = res;
                       this.showSucsMsg('Amount transferred to outstanding Invoices successfully');
                      this.selectedInvoiceList = [];
                      this.isParentSelected = false;
                      this.loadOverPaymentBalances(null);
                      this.getOutstandingInvoices(this.accountId);
                    },
                    (err) => {
                      this.showErrorMsg('Error while transferring amount to outstanding Invoices');
                      console.log(err);
                    });
                } else {
                 this.showErrorMsg('Apply overpayment Amount should be greater than zero.');

                }

              } else {
                this.showErrorMsg('Applied Overpayment amount should not be greater than eligible Overpayment amount.');

              }
            } else {
              this.showErrorMsg('No Overpayment amount exist to transfer');

            }
          } else {
             this.showErrorMsg('No Overpayment amount exist to transfer.');

          }
        }
      }
    );
  }

  checkboxCheckedEvent(object: any, event) {
    const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === object.InvoiceId);
    if (event.target.checked) {
      if (index === -1) {
        if (object.Status === 'TRANSFERRED' || object.Status === 'PAID' || object.Status === 'WRITEOFF' || object.IsAgingHold) {
          object.isInvoiceSelected = false;
        }
        else {
          this.selectedInvoiceList.push(object);
          object.isInvoiceSelected = true;
        }
        const result = this.invoiceResponse.filter(x => x.isInvoiceSelected === true).length;
        if (result === this.invoiceResponse.length) {
          this.isParentSelected = true;
        }
      }
    } else {
      this.isParentSelected = false;
      if (index > -1) {
        this.selectedInvoiceList.splice(index, 1);
        object.isInvoiceSelected = false;
      }
    }
    console.log(this.selectedInvoiceList);
  }


  checkAllClick(event) {
    for (let i = 0; i < this.invoiceResponse.length; i++) {
      const isChecked: boolean = event.target.checked;
      this.invoiceResponse[i].isInvoiceSelected = isChecked;
      const index = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.invoiceResponse[i].InvoiceId);
      if (index > -1 && !isChecked) {
        this.selectedInvoiceList = this.selectedInvoiceList.filter(item => item.InvoiceId !== this.invoiceResponse[i].InvoiceId);
        this.invoiceResponse[i].isInvoiceSelected = false;
      }
      else if (isChecked) {
        const indexes = this.selectedInvoiceList.findIndex(x => x.InvoiceId === this.invoiceResponse[i].InvoiceId);
        if (indexes === -1) {

          if (this.invoiceResponse[i].Status === 'TRANSFERRED' || this.invoiceResponse[i].Status === 'PAID' || this.invoiceResponse[i].Status === 'WRITEOFF' || this.invoiceResponse[i].IsAgingHold) {
            this.invoiceResponse[i].isInvoiceSelected = false;
            this.invoiceResponse[i].isDisableInvoice = true;
          } else {
            if (this.invoiceResponse[i].OutstandingDue > 0) {
              this.invoiceResponse[i].isInvoiceSelected = true;
              this.invoiceResponse[i].isDisableInvoice = false;
              this.selectedInvoiceList.push(this.invoiceResponse[i]);
            }
            else {
              this.invoiceResponse[i].isInvoiceSelected = false;
            }
          }


        }
      }
      console.log(this.selectedInvoiceList);
    }
  }

  resetClick() {
    this.selectedInvoiceList = [];
    this.payReceipt = '';
    this.loadOverPaymentBalances(null);
    this.getOutstandingInvoices(this.accountId);
    this.isParentSelected = false;

  }
  paymentReceipt() {
    window.open(this.payReceipt);
  }
  atleaseone(): boolean {
    if (this.selectedInvoiceList && this.selectedInvoiceList.length) {
      return true;
    } else {
      return false;
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



