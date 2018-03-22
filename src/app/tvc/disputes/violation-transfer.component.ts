import { Component, OnInit } from '@angular/core';
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-violation-transfer',
  templateUrl: './violation-transfer.component.html',
  styleUrls: ['./violation-transfer.component.scss']
})
export class ViolationTransferComponent implements OnInit {
  transferredViolator: number;
  violatorID: number;
  successMessage: string;
  errorMessage: string;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;


  constructor(private violatorContext: ViolatorContextService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.violatorContext.currentContext.subscribe(cntxt => {
      if (cntxt) {
        this.violatorID = cntxt.accountId;
      }
    });

    this.route.queryParams.subscribe(params => {
      this.transferredViolator = params['TransferredVioaltorId'];
    });

    this.displayMessage();
  }

  displayMessage() {
    if (this.transferredViolator > 0) {
      this.showSucsMsg('Transferred Trip(s) to the Account # ' + this.transferredViolator + ' successfully and cancelled  Trip(s) to the Account # ' + this.violatorID + ' successfully');
    } else {
      this.showSucsMsg('Trip(s) are transferred successfully');
    }
  }

  backClick() {
    this.router.navigateByUrl('tvc/violatordetails/trip-Search');
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showSucsMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'success';
    this.msgDesc = msg;
  }

}
