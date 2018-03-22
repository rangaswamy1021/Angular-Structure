import { Component, OnInit } from '@angular/core';
import { ITransactionResponse } from "../shared/models/transactionresponse";
import { IAccountSummartRequest } from "../csc/customerdetails/models/accountsummaryrequest";
import { CustomerDetailsService } from "../csc/customerdetails/services/customerdetails.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { Router } from "@angular/router";

@Component({
  selector: 'app-get-transit-transactions',
  templateUrl: './get-transit-transactions.component.html',
  styleUrls: ['./get-transit-transactions.component.scss']
})
export class GetTransitTransactionsComponent implements OnInit {

  recordCount: number = 5;
  linkSourceName: string = 'internal';
  transitTripsRes: ITransactionResponse[];
  accountSummaryReq: IAccountSummartRequest;
  customerContextResponse: ICustomerContextResponse;

  constructor(private customerDetailsService: CustomerDetailsService, private customerContext: CustomerContextService, private router: Router) { }

  ngOnInit() {
    this.customerContext.currentContext
                        .subscribe(customerContext => { this.customerContextResponse = customerContext; }
                        );
                if (this.customerContextResponse.AccountId > 0) {
                        this.getTransitTransactions();
                }
    
  }

  getTransitTransactions() {
                this.accountSummaryReq = <IAccountSummartRequest>{};
                this.accountSummaryReq.AccountId = this.customerContextResponse.AccountId;;
                this.accountSummaryReq.ActivityCount = this.recordCount;
                this.accountSummaryReq.LinkSourceName = this.linkSourceName;
                this.customerDetailsService.getTransitTransactions(this.accountSummaryReq).subscribe(
                        res => {
                                this.transitTripsRes = res
                        });
        }

        goToTransactions(transactionType:string) {
         this.router.navigate(['../../../csc/customerdetails/transaction-activities'], { queryParams: { txnType: transactionType } });
 }

}
