import { Component, OnInit, ViewChild } from '@angular/core';
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { Router } from "@angular/router";
import { LoginService } from "../../login/services/login.service";
import { AccountPrimaryInformationComponent } from './account-primary-information.component';
import { CustomerDetailsService } from "../../csc/customerdetails/services/customerdetails.service";
import { SessionService } from "../services/session.service";

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
  customerContext: ICustomerContextResponse;  
  accountId: number;
  hideAccountSummarybtn:boolean=true;

  @ViewChild(AccountPrimaryInformationComponent) accountSummaryComp;
  
  constructor(private customerContextService: CustomerContextService, private loginService: LoginService,  private router:Router,
  private customerDetailsService: CustomerDetailsService,private sessionContext: SessionService,) { }

  ngOnInit() {
    this.customerContextService.currentContext.subscribe(response => { this.customerContext = response; });
    if (this.customerContext && this.customerContext.AccountId > 0) {
      this.accountId = this.customerContext.AccountId;      
    }
    else {
      let link = ['/csc/search/advance-csc-search/'];
      this.router.navigate(link);
    }    
  } 
  exitClick() {
                this.customerDetailsService.UpdateTimeSpentEvents(this.customerContext.TimeSpentId,this.sessionContext.customerContext.userName).subscribe();
                const context: ICustomerContextResponse = <ICustomerContextResponse>{};
                this.customerContextService.changeResponse(context);
                let link = ['/csc/search/advance-csc-search/'];

                // this.sessionContext.changeResponse(null);
                this.loginService.setCustomerContext(null);
                this.router.navigate(link,{ queryParams: { fromSearch: true } });
        }

        goToAccountSummary(){
          let link = ['/csc/customerdetails/account-summary/'];
          this.router.navigate(link);
        }

        refreshAccountInformation(){
          this.accountSummaryComp.getAccountInformation();
        }

        refreshPaymentAmountDetails(){
          this.accountSummaryComp.getPaymentAmountDetails();
        }

        refreshContactInfoBlock(){
          this.accountSummaryComp.bindContactInfoBlock();
        }

        refreshAllBlock(){
          this.accountSummaryComp.bindAccountSummaryInformation();
        }

        hideAccountSummary(){
          this.hideAccountSummarybtn=false;

        }

}
