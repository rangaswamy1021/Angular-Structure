import { Component, OnInit } from '@angular/core';
import { ICustomerResponse } from "../../shared/models/customerresponse";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { Router } from "@angular/router";
import { CustomerDetailsService } from "../../csc/customerdetails/services/customerdetails.service";

@Component({
  selector: 'app-account-info-header',
  templateUrl: './account-info-header.component.html',
  styleUrls: ['./account-info-header.component.scss']
})
export class AccountInfoHeaderComponent implements OnInit {
  customerContext: ICustomerContextResponse;
  customerInfoResponse: ICustomerResponse;
  customerCreatedYear: number;
  accountId: number;

  constructor(private customerDetailsService: CustomerDetailsService, private customerContextService: CustomerContextService,private router:Router) { }

  ngOnInit() {
    this.customerContextService.currentContext.subscribe(response => { this.customerContext = response; });
    if (this.customerContext && this.customerContext.AccountId > 0) {
      this.accountId = this.customerContext.ParentId > 0 ? this.customerContext.ChildCustomerId : this.customerContext.AccountId;
      this.bindCustomerInfoDetails();
    }
    else {
      let link = ['/csc/search/advance-csc-search/'];
      this.router.navigate(link);
    }
  }

  bindCustomerInfoDetails() {
    this.customerDetailsService.bindCustomerInfoDetails(this.customerContext.AccountId)
      .subscribe(response => { this.customerInfoResponse = response; },
      (err) => { },
      () => {
        this.customerCreatedYear = new Date(this.customerInfoResponse.CreatedDate).getFullYear();
      });
  }

}
