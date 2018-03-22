import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { IPlanResponse } from "../../sac/plans/models/plansresponse";
import { CustomerAccountsService } from "./services/customeraccounts.service";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";

@Component({
    selector: 'app-amounts-summary-details',
    templateUrl: './amounts-summary-details.component.html',
    styleUrls: ['./amounts-summary-details.component.scss']
})
export class AmountsSummaryDetailsComponent implements OnInit,OnChanges {
    @Input() tollBalance: number = 0
    @Input() totalTagDeposit: number = 0
    @Input() totalFee:number=0
    @Input() totalTagFee: number = 0
    @Input() totalShippingCharge: number = 0
    @Input() totalServiceTax: number = 0
    @Input() planId:number=0

    //totalFee: number = 0
    feesOfPlan = []
    isServiceTax: boolean
    serviceTax: number
    isCCServiceTax: boolean
    ccServiceTax: number
    constructor(private customerService: CustomerAccountsService, private commonService: CommonService) { }

    ngOnInit() {
        this.getApplicationParameterKeys();
    }
    
    ngOnChanges(){
      this.bindFees();
    }

    bindFees() {
        this.customerService.getFeesbasedonPlanId(this.planId).subscribe(res => this.feesOfPlan = res);
        //this.totalFee = parseInt(plan.TotalFee);
    }

    getApplicationParameterKeys() {
        var card = 0; var cash = 0; var bank = 0;

        this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsServiceTax).subscribe(res => this.isServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.ServiceTax).subscribe(res => this.serviceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTaxInd).subscribe(res => this.isCCServiceTax = res);
        this.commonService.getApplicationParameterValue(ApplicationParameterkey.CCServiceTax).subscribe(res => this.ccServiceTax = res);
    }
}
