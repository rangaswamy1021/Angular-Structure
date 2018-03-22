import { Component, OnInit } from '@angular/core';
import { IAccountSummartRequest } from "../csc/customerdetails/models/accountsummaryrequest";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { ITransactionResponse } from "../shared/models/transactionresponse";
import { ITransactionRequest } from "../shared/models/transactionrequest";
import { CustomerDetailsService } from "../csc/customerdetails/services/customerdetails.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-get-violation-transactions',
  templateUrl: './get-violation-transactions.component.html',
  styleUrls: ['./get-violation-transactions.component.scss']
})
export class GetViolationTransactionsComponent implements OnInit {

  recordCount: number = 5;
  linkSourceName: string = 'internal';
  violationResponse: ITransactionResponse[];
  accountSummaryReq: IAccountSummartRequest;  
  customerContextResponse: ICustomerContextResponse;
  transactionRequest: ITransactionRequest;

  constructor(private customerDetailsService: CustomerDetailsService, private customerContext: CustomerContextService, private router: Router) { }

  ngOnInit() {
    this.customerContext.currentContext
                        .subscribe(customerContext => { this.customerContextResponse = customerContext; }
                        );
                if (this.customerContextResponse.AccountId > 0) {
                        this.getCustomerViolations();
                }
  }

  getCustomerViolations() {
                this.transactionRequest = <ITransactionRequest>{};
                this.transactionRequest.AccountId = this.customerContextResponse.AccountId;
                var now = new Date();
                var currentDate = new Date();
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                this.transactionRequest.Entry_TripDateTime = currentDate;
                this.transactionRequest.Exit_TripDateTime = now;
                this.transactionRequest.TripId = 0;
                this.transactionRequest.VehicleNumber = "";
                this.transactionRequest.TollTransactionTypeCode = "";
                this.transactionRequest.PageNumber = 1;
                this.transactionRequest.PageSize = 5;
                this.transactionRequest.SortColumn = "CITATIONID";
                this.transactionRequest.SortDir = 1;
                this.customerDetailsService.getCustomerViolations(this.transactionRequest)
                        .subscribe(res => {
                                this.violationResponse = res
                        });
        }

        goToTransactions(transactionType:string) {
         this.router.navigate(['../../../csc/customerdetails/transaction-activities'], { queryParams: { txnType: transactionType } });
 }

}
