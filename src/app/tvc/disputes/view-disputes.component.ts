import { TripsContextService } from '../../shared/services/trips.context.service';
import { Component, OnInit } from '@angular/core';
import { DisputesService } from './services/disputes.service';
import { Router } from '@angular/router';
import { IAffidavitRequest } from './models/affidavitrequest';
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { DisputeContextService } from "./services/dispute.context.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-view-disputes',
  templateUrl: './view-disputes.component.html',
  styleUrls: ['./view-disputes.component.scss']
})
export class ViewDisputesComponent implements OnInit {
  disputedInvoicesList: any[];
  invoicesDisputeLst: any[];
  affidavitRequest: IAffidavitRequest;

  tripLevelDisputeLst: any[];
  disputedTripsList: any[];
  affidaVitID: number;
  objAffidavitsContextRequest: IAffidavitRequest;

  constructor(private disputeService: DisputesService,
    private router: Router,
    private violatorContext: ViolatorContextService,
    private disputecontext: DisputeContextService,
    private tripContextService: TripsContextService,
    private materialscriptService: MaterialscriptService) { }

  longAccountId: number = 0;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  sucessMsg: string;
  errorMsg: string;
  violatorContextResponse: IViolatorContextResponse;

  ngOnInit() {
       this.materialscriptService.material();

    this.violatorContext.currentContext
      .subscribe(customerContext => { this.violatorContextResponse = customerContext; }
      );

    if (this.violatorContextResponse && this.violatorContextResponse.accountId > 0) {
      this.longAccountId = this.violatorContextResponse.accountId;
    }

    this.tripContextService.changeResponse(null);

    this.disputecontext.currentContext
      .subscribe(disputeContext => {
        if (disputeContext) {
          this.objAffidavitsContextRequest = disputeContext;
          if (this.objAffidavitsContextRequest.successMessage && this.objAffidavitsContextRequest.successMessage.length > 0) {
            this.sucessMsg = this.objAffidavitsContextRequest.successMessage;
            this.showSucsMsg(this.sucessMsg);
          }
          if (this.objAffidavitsContextRequest.errorMessage && this.objAffidavitsContextRequest.errorMessage.length > 0) {
            this.errorMsg = this.objAffidavitsContextRequest.errorMessage;
            this.showErrorMsg(this.errorMsg);
          }
        }
      });
    this.getDisputeDetails();
  }


  getDisputeDetails() {
    this.affidavitRequest = <IAffidavitRequest>{};
    this.affidavitRequest.DisputeStatus = "DISPUTEREQUESTED";
    this.affidavitRequest.AffidavitId = 0;
    this.affidavitRequest.FromCustomerId = this.longAccountId;
    this.disputeService.getDisputeDetails(this.affidavitRequest).subscribe(res => {
      let disputeTotalDetails = res;
      if (disputeTotalDetails && disputeTotalDetails.length > 0) {
        //filter trip related disputes
        var resultTripDisputes = disputeTotalDetails.filter(x => x.LinkSourceName == 'TOLLPLUS.TP_VIOLATEDTRIPS');
        if (resultTripDisputes && resultTripDisputes.length > 0) {
          //filter invoice related disputes
          this.tripLevelDisputeLst = resultTripDisputes;
        }

        //filter invoice related disputes
        var resultInvoiceDisputes = disputeTotalDetails.filter(x => x.LinkSourceName == 'TOLLPLUS.INVOICE_HEADER');
        if (resultInvoiceDisputes && resultInvoiceDisputes.length > 0) {
          //filter invoice related disputes
          this.invoicesDisputeLst = resultInvoiceDisputes;
        }


      }
    });
  }

  //view trip level disputes
  viewTripDetailsClick(affidavitID: number) {
    if (affidavitID > 0) {
      this.disputeService.getDisputedTripsDetails(affidavitID).subscribe(res => {
        this.disputedTripsList = res;
        console.log(this.disputedTripsList);
      });
    }
  }


  selectDisputes(affidavitID: number) {
    this.affidaVitID = 0;
    if (affidavitID > 0) {
      this.affidaVitID = affidavitID;
    }
  }


  selectInvoiceDisputes(affidavitID: number) {
    this.affidaVitID = 0;
    if (affidavitID > 0) {
      this.affidaVitID = affidavitID;
    }
  }

  viewInvoiceDetailsClick(affidavitID: number) {
    if (affidavitID > 0) {
      this.disputeService.getDisputeInvoicesDetails(affidavitID).subscribe(res => {
        this.disputedInvoicesList = res;
        console.log(this.disputedInvoicesList);
      });
    }
  }


  processDisputes() {
    let b=this;
        setTimeout(function() {
            b.materialscriptService.material();
        }, 1000);

    this.disputecontext.changeResponse(null);
    if (this.affidaVitID > 0) {
      this.router.navigate(['tvc/disputes/non-liability', this.affidaVitID]);
    }
    else {
      this.showErrorMsg('select atleast one dispute to proceed');
    }
  }

  cancelDisputes() {
    this.disputecontext.changeResponse(null);
    this.router.navigate(['tvc/violatordetails/violator-summary']);
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

  setOutputFlag(e) {
    this.msgFlag = e;
    this.disputecontext.changeResponse(null);
  }

}
