import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountInfoComponent } from "../../shared/accountprimaryinfo/account-info.component";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-add-credit-card-details',
  templateUrl: './add-credit-card-details.component.html',
  styleUrls: ['./add-credit-card-details.component.scss']
})

export class AddCreditCardDetailsComponent implements OnInit {
  @ViewChild(AccountInfoComponent) accountInfoComponent;

  constructor(private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
      this.materialscriptService.material();
  }
  addCreditCard() {
    this.accountInfoComponent.refreshPaymentAmountDetails();
  }
}
