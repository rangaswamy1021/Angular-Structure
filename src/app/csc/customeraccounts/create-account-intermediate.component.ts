import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CreateAccountService } from '../../shared/services/createaccount.service';
import { SessionService } from '../../shared/services/session.service';
import { IMakePaymentrequest } from '../../payment/models/makepaymentrequest';
import { IUserresponse } from '../../shared/models/userresponse';

@Component({
  selector: 'app-create-account-intermediate',
  templateUrl: './create-account-intermediate.component.html',
  styleUrls: ['./create-account-intermediate.component.scss']
})
export class CreateAccountIntermediateComponent implements OnInit {

  constructor(private router: Router, private createAccountService: CreateAccountService, private sessionContext: SessionService) { }

  makePaymentRequest: IMakePaymentrequest;
  sessionContextResponse: IUserresponse;

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.makePaymentRequest = null;
    this.createAccountService.changeResponse(this.makePaymentRequest);
    let link = ['/csc/customeraccounts/create-account-personal-information/'];
    console.log('redirect');
    this.router.navigate(link);
  }

}
