import { Component, OnInit } from '@angular/core';
import { CustomerDetailsService } from './services/customerdetails.service';
import { IUnbilledTransactionsRequest } from './models/unbilledtransactionsrequest';
import { SessionService } from '../../shared/services/session.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerContextService } from '../../shared/services/customer.context.service';

@Component({
  selector: 'app-unbilled-transactions',
  templateUrl: './unbilled-transactions.component.html',
  styleUrls: ['./unbilled-transactions.component.scss']
})
export class UnbilledTransactionsComponent implements OnInit {
  unbilledresponse: IUnbilledTransactionsRequest[];
  customerId: number;
  accountId: number;
  customerContextResponse: ICustomerContextResponse;
  plantype: any;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private customerDetailsService: CustomerDetailsService, private context: SessionService, private customerContext: CustomerContextService) { }

  //paging
  pageItemNumber: number = 10;
  dataLength: number;
  currentPage: number = 1;
  endItemNumber: number;
  startItemNumber: number = 1;
  //

  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }

  ngOnInit() {
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    this.plantype = this.customerContextResponse.AccountType;
    this.getUnbilledTransactions();

    if (this.plantype == "PREPAID") {
      this.showErrorMsg('You have selected Prepaid Account');
    }
  }

  getUnbilledTransactions() {
    this.customerId = this.customerContextResponse.AccountId;
    this.customerDetailsService.GetUnbilledTransactions().subscribe(
      res => {
        this.unbilledresponse = res;
        this.unbilledresponse = this.unbilledresponse.filter(x => x.CustomerId == this.customerId);
        this.dataLength = this.unbilledresponse.length;
        if (this.dataLength < this.pageItemNumber) {
          this.endItemNumber = this.dataLength
        }
        else {
          this.endItemNumber = this.pageItemNumber;
        }
      }
    );
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
