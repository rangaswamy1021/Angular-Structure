import { IVehicleClass } from './../../vehicles/models/vehicleresponse';
import { IPlazas } from './../veppasses/models/plazas';
import { Component, OnInit } from '@angular/core';
import { CSCReportsService } from "./services/reports.service";
import { IPaging } from "../../shared/models/paging";
import { OutBoundTransactionsRequest } from "./models/outboundtransactionsrequest";
import { ICommon } from "../../shared/models/commonresponse";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { List } from "linqts";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-ez-pass-outbound-transactions-corrections',
  templateUrl: './ez-pass-outbound-transactions-corrections.component.html',
  styleUrls: ['./ez-pass-outbound-transactions-corrections.component.scss']
})
export class EzPassOutboundTransactionsCorrectionsComponent implements OnInit {
  
  updateDisableButton: boolean;
  sessionContextResponse: IUserresponse;
  transactionsCorrectionForm: FormGroup;
  entryLanesByPlazaCode: any;
  exitLanesByPlazaCode: any;
  plazasDetails: any;
  vehicleClasses: any;
  lanesByPlazaCode: any;
  correctionReasons: any;
  outboundTransactionsResponse: any;
  outboundIndividualResponse: any;
  userEvents = <IUserEvents>{};
  reason: string;
  reasonId: string;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;

  pageNumber: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  constructor(private materialscriptService: MaterialscriptService,private ezPassService: CSCReportsService, private sessionContext: SessionService, private router: Router,
    private commonService: CommonService, ) { }
  objPaging: IPaging;
  common: ICommon;
  outboundTransactionsRequest: OutBoundTransactionsRequest = <OutBoundTransactionsRequest>{};
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.pageNumber = 1;
    this.endItemNumber = 10;
    this.transactionsCorrectionForm = new FormGroup({
      'correctionType': new FormControl(''),
      'transactionId': new FormControl(''),
      'transactionType': new FormControl(''),
      'tagType': new FormControl(''),
      'entryPlaza': new FormControl(''),
      'exitPlaza': new FormControl(''),
      'entryLane': new FormControl(''),
      'exitLane': new FormControl(''),
      'vehicleClass': new FormControl(''),
      'tollAmount': new FormControl('')
    });

    this.getOutboundTransactions(this.pageNumber);
    this.getCorrectionReasons();
    this.getAllVehicleClasses();
    this.getPlazasDetails();
    this.updateDisableButton = !this.commonService.isAllowed(Features[Features.MANAGEEZPASSOUTBOUNDTRANSACTION], Actions[Actions.UPDATE], "");
  }
  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getOutboundTransactions(this.pageNumber);
  }
  getOutboundTransactions(pageNumber) {
    this.outboundTransactionsRequest = <OutBoundTransactionsRequest>{};
    this.outboundTransactionsRequest.Paging = <IPaging>{};
    this.outboundTransactionsRequest.Paging.PageNumber = pageNumber;
    this.outboundTransactionsRequest.Paging.PageSize = 10;
    this.outboundTransactionsRequest.Paging.SortColumn = "TransactionId";
    this.outboundTransactionsRequest.Paging.SortDir = 1;
    this.getUserEvents();
    this.ezPassService.getOutboundTransactions(this.outboundTransactionsRequest,this.userEvents).subscribe(res => {
      this.outboundTransactionsResponse = res;
      if (res != null && res.length > 0) {
        this.totalRecordCount = this.outboundTransactionsResponse[0].RecordCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });


  }

  getCorrectionReasons() {
    this.ezPassService.getCorrectionReasons().subscribe(res => {
      this.correctionReasons = res;
    },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });
  }

  getLanesByPlazaCode(event: Event, type, isEditable) {
    let plazaName;
    if (!isEditable) {
      plazaName = event.target['options'][event.target['options'].selectedIndex].text;
    }
    else {
      plazaName = event;
      let list = new List<IPlazas>(this.newFunctionPlaza());
      plazaName = list.Where(x => x.PlazaId == plazaName).Select(y => y.PlazaCode).FirstOrDefault();
    }
    if (plazaName != "" && plazaName != null) {
      this.ezPassService.getLanesByPlazaCode(plazaName).subscribe(res => {
        if (type == 'ENTRY')
          this.entryLanesByPlazaCode = res;
        else if (type == 'EXIT')
          this.exitLanesByPlazaCode = res;
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });
    }
  }

  getAllVehicleClasses() {
    this.ezPassService.getAllVehicleClasses().subscribe(res => {
      this.vehicleClasses = res;
    },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });
  }

  getPlazasDetails() {
    this.ezPassService.getPlazasDetails().subscribe(res => {
      this.plazasDetails = res;
    },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });
  }

  updateOutBoundTransactionsById() {

    let correctionReason = this.transactionsCorrectionForm.controls['correctionType'].value;
    if (correctionReason == null || correctionReason == "") {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Select Correction Type.";
      this.msgTitle = '';

      return;
    }
    var outBoundDetails = this.outboundIndividualResponse;
    this.outboundTransactionsRequest = <OutBoundTransactionsRequest>{};
    this.outboundTransactionsRequest.BosIopTransactionId = outBoundDetails.BosIopTransactionId;
    this.outboundTransactionsRequest.TransactionId = outBoundDetails.TransactionId;
    this.outboundTransactionsRequest.EntryPlaza = outBoundDetails.EntryPlaza;
    this.outboundTransactionsRequest.EntryLane = outBoundDetails.EntryLane;
    this.outboundTransactionsRequest.ExitPlaza = outBoundDetails.ExitPlaza;
    this.outboundTransactionsRequest.ExitLane = outBoundDetails.ExitLane;
    this.outboundTransactionsRequest.CorrectionAmount = outBoundDetails.TollAmount;
    this.outboundTransactionsRequest.CorrectionReason = outBoundDetails.CorrectionReason;
    this.outboundTransactionsRequest.EtcDebitCredit = "D";
    this.outboundTransactionsRequest.TollAmount = outBoundDetails.TollAmount;
    this.outboundTransactionsRequest.VehicleClass = outBoundDetails.VehicleClass;
    this.outboundTransactionsRequest.SourceAgency = outBoundDetails.SourceAgency;
    this.outboundTransactionsRequest.TransactionTypeId = outBoundDetails.TransactionTypeId;
    this.outboundTransactionsRequest.TripMethod = outBoundDetails.TripMethod;
    this.outboundTransactionsRequest.PerformedBy = this.sessionContextResponse.userName; // session
    this.outboundTransactionsRequest.CorrectionStatus = outBoundDetails.CorrectionStatus;

    this.outboundTransactionsRequest.CorrectionId = parseInt(this.reasonId);
    this.outboundTransactionsRequest.CorrectionReason = this.reasonId;
    if (this.transactionsCorrectionForm.valid) {
      if (this.outboundTransactionsRequest.CorrectionId == 1) {
        this.outboundTransactionsRequest.VehicleClass = this.transactionsCorrectionForm.controls['vehicleClass'].value; // need to change
        this.outboundTransactionsRequest.CorrectionAmount = parseFloat(this.transactionsCorrectionForm.controls['tollAmount'].value); // need to change
        let patternValue = this.checkToolAmountPattern(this.outboundTransactionsRequest.CorrectionAmount.toString());
        if (!patternValue) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Enter Valid Toll Amount(000.00)";
          this.msgTitle = '';

          return;
        }
        this.outboundTransactionsRequest.TollAmount = parseFloat(outBoundDetails.TollAmount);
        if (this.outboundTransactionsRequest.TollAmount > this.outboundTransactionsRequest.CorrectionAmount) {
          this.outboundTransactionsRequest.EtcDebitCredit = "C";
          let adjustedAmount = (this.outboundTransactionsRequest.TollAmount - this.outboundTransactionsRequest.CorrectionAmount).toString();
          this.outboundTransactionsRequest.AdjustedAmount = parseFloat(adjustedAmount);
        }
        else if (this.outboundTransactionsRequest.CorrectionAmount > this.outboundTransactionsRequest.TollAmount) {
          this.outboundTransactionsRequest.EtcDebitCredit = "D";
          let adjustedAmount = (this.outboundTransactionsRequest.CorrectionAmount - this.outboundTransactionsRequest.TollAmount).toString();
          this.outboundTransactionsRequest.AdjustedAmount = parseFloat(adjustedAmount);
        }
        if (this.outboundTransactionsRequest.VehicleClass != '' && this.outboundTransactionsRequest.CorrectionAmount.toString() != '') {
          if ((this.outboundTransactionsRequest.VehicleClass != outBoundDetails.VehicleClass) || (this.outboundTransactionsRequest.TollAmount != outBoundDetails.TollAmount)) {
            if ((this.outboundTransactionsRequest.CorrectionAmount != outBoundDetails.TollAmount)) {
              this.outboundTransactionsRequest.IstollUpdated = true;
            }
            else {
              this.outboundTransactionsRequest.IstollUpdated = false;
            }
            this.getUserEvents();
            this.userEvents.ActionName = Actions[Actions.UPDATE];
            this.ezPassService.updateOutBoundTransactionsById(this.outboundTransactionsRequest,this.userEvents).subscribe(res => {
              if (res) {
                this.getOutboundTransactions(this.pageNumber);
                this.msgType = 'success';
                this.msgFlag = true;
                this.msgDesc = "EZPass Outbound Correction Transaction has been corrected successfully";
                this.msgTitle = '';
                $('#ezpassoutModel').modal('hide');
              }
            },
              (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
              }
            );
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Update either Vehicle Class/Toll Amount to correct the transaction.";
            this.msgTitle = '';

          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Vehicle Class and Toll Amount are required.";
          this.msgTitle = '';

        }
      }
      else if (this.outboundTransactionsRequest.CorrectionId == 3) {
        if (outBoundDetails.TagSerialNumber != '') {
          this.getUserEvents();
          this.userEvents.ActionName = Actions[Actions.UPDATE];
          this.ezPassService.updateOutBoundTransactionsById(this.outboundTransactionsRequest, this.userEvents).subscribe(res => {

            if (res) {
              this.getOutboundTransactions(this.pageNumber);
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "EZPass Outbound Correction Transaction has been corrected successfully";
              this.msgTitle = '';
              $('#ezpassoutModel').modal('hide');
            }

          },
            (err) => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText.toString();
              this.msgTitle = '';

              return;
            });
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Transaction has no Tag Serial Number.";
          this.msgTitle = '';


        }
      }
      else if (this.outboundTransactionsRequest.CorrectionId == 2) {
        if (outBoundDetails.LicenseNumber != '' && outBoundDetails.LicenseState != '') {
          this.getUserEvents();
          this.userEvents.ActionName = Actions[Actions.UPDATE];
          this.ezPassService.updateOutBoundTransactionsById(this.outboundTransactionsRequest, this.userEvents).subscribe(res => {

            if (res) {

              this.getOutboundTransactions(this.pageNumber);
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "EZPass Outbound Correction Transaction has been corrected successfully";
              this.msgTitle = '';
              $('#ezpassoutModel').modal('hide');
            }

          },
            (err) => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText.toString();
              this.msgTitle = '';

              return;
            });
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Transaction has no License Number and License State.";
          this.msgTitle = '';


        }
      }
      else if (this.outboundTransactionsRequest.CorrectionId == 5) {
        if (this.transactionsCorrectionForm.controls['tollAmount'].value != '') {
          this.outboundTransactionsRequest.CorrectionAmount = parseFloat(this.transactionsCorrectionForm.controls['tollAmount'].value);
          let patternValue = this.checkToolAmountPattern(this.outboundTransactionsRequest.CorrectionAmount.toString());
          if (!patternValue) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Enter Valid Toll Amount(000.00)";
            this.msgTitle = '';

            return;
          }
          this.outboundTransactionsRequest.TollAmount = parseFloat(outBoundDetails.TollAmount);
          if (this.outboundTransactionsRequest.TollAmount > this.outboundTransactionsRequest.CorrectionAmount) {
            this.outboundTransactionsRequest.EtcDebitCredit = "C";
            let adjustedAmount = (this.outboundTransactionsRequest.TollAmount - this.outboundTransactionsRequest.CorrectionAmount).toString();
            this.outboundTransactionsRequest.AdjustedAmount = parseFloat(adjustedAmount);
          }
          else {
            this.outboundTransactionsRequest.EtcDebitCredit = "D";
            let adjustedAmount = (this.outboundTransactionsRequest.CorrectionAmount - this.outboundTransactionsRequest.TollAmount).toString();
            this.outboundTransactionsRequest.AdjustedAmount = parseFloat(adjustedAmount);
          }
          if (this.transactionsCorrectionForm.controls['tollAmount'].value != this.outboundTransactionsRequest.TollAmount) {
            this.getUserEvents();
            this.userEvents.ActionName = Actions[Actions.UPDATE];
            this.ezPassService.updateOutBoundTransactionsById(this.outboundTransactionsRequest,this.userEvents).subscribe(res => {

              if (res) {
                this.getOutboundTransactions(this.pageNumber);
                this.msgType = 'success';
                this.msgFlag = true;
                this.msgDesc = "EZPass Outbound Correction Transaction has been corrected successfully";
                this.msgTitle = '';
                $('#ezpassoutModel').modal('hide');
              }

            },
              (err) => {
                this.msgType = 'error';
                this.msgFlag = true;
                this.msgDesc = err.statusText.toString();
                this.msgTitle = '';

                return;
              });
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = "Toll amount and Corrected amount should not be same.";
            this.msgTitle = '';


          }
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Toll Amount is required.";
          this.msgTitle = '';

        }
      }
      else if (this.outboundTransactionsRequest.CorrectionId == 4) {
        if (this.transactionsCorrectionForm.controls['entryPlaza'].value != '' || this.transactionsCorrectionForm.controls['entryLane'].value != ''
          || this.transactionsCorrectionForm.controls['exitPlaza'].value != '' || this.transactionsCorrectionForm.controls['exitLane'].value != '') {
          this.outboundTransactionsRequest.EntryPlaza = this.transactionsCorrectionForm.controls['entryPlaza'].value;
          this.outboundTransactionsRequest.EntryLane = this.transactionsCorrectionForm.controls['entryLane'].value;
          this.outboundTransactionsRequest.ExitPlaza = this.transactionsCorrectionForm.controls['exitPlaza'].value;
          this.outboundTransactionsRequest.ExitLane = this.transactionsCorrectionForm.controls['exitLane'].value;
          this.getUserEvents();
          this.userEvents.ActionName = Actions[Actions.UPDATE];
          this.ezPassService.updateOutBoundTransactionsById(this.outboundTransactionsRequest, this.userEvents).subscribe(res => {

            if (res) {

              this.getOutboundTransactions(this.pageNumber);
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "EZPass Outbound Correction Transaction has been corrected successfully";
              this.msgTitle = '';
              $('#ezpassoutModel').modal('hide');
            }

          },
            (err) => {
              this.msgType = 'error';
              this.msgFlag = true;
              this.msgDesc = err.statusText.toString();
              this.msgTitle = '';

              return;
            });
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Select Plaza, Lane details to correct";
          this.msgTitle = '';


        }
      }
    }
  }

  checkToolAmountPattern(tollAmount: string) {
    return /^[0-9]\d{0,2}(\.\d{1,2})?%?$/.test(tollAmount);
  }

  checkToolAmountPattern1(event) {
    let tollAmount = event.target.value;
    if (!(/^[0-9]\d{0,2}(\.\d{1,2})?%?$/.test(tollAmount))) {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Enter Valid Toll Amount(000.00)";
      this.msgTitle = '';

      return;
    }
  }

  correctionResons(event: Event) {
    this.reason = event.target['options'][event.target['options'].selectedIndex].text;
    this.reasonId = event.target['options'][event.target['options'].selectedIndex].value;
    this.editOutBoundTransactionsById(this.outboundIndividualResponse);
    this.transactionsCorrectionForm.controls['correctionType'].setValue(this.reasonId);
    if (this.reasonId == '04') {
      this.transactionsCorrectionForm.controls['tollAmount'].disable();
      this.transactionsCorrectionForm.controls['vehicleClass'].disable();
      this.transactionsCorrectionForm.controls['exitPlaza'].enable();
      this.transactionsCorrectionForm.controls['entryPlaza'].enable();
      this.transactionsCorrectionForm.controls['entryLane'].enable();
      this.transactionsCorrectionForm.controls['exitLane'].enable();
      this.transactionsCorrectionForm.controls['entryPlaza'].setValue("");
      this.transactionsCorrectionForm.controls['exitPlaza'].setValue("");
      this.transactionsCorrectionForm.controls['exitLane'].setValue("");
      this.transactionsCorrectionForm.controls['entryLane'].setValue("");
    }
    else if (this.reasonId == '05') {
      this.transactionsCorrectionForm.controls['tollAmount'].enable();
      this.transactionsCorrectionForm.controls['vehicleClass'].disable();
      this.transactionsCorrectionForm.controls['exitPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryLane'].disable();
      this.transactionsCorrectionForm.controls['exitLane'].disable();
    }
    else if (this.reasonId == '01') {
      this.transactionsCorrectionForm.controls['tollAmount'].enable();
      this.transactionsCorrectionForm.controls['vehicleClass'].enable();
      this.transactionsCorrectionForm.controls['vehicleClass'].setValue("");
      this.transactionsCorrectionForm.controls['exitPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryLane'].disable();
      this.transactionsCorrectionForm.controls['exitLane'].disable();
    }
    else {
      this.transactionsCorrectionForm.controls['tollAmount'].disable();
      this.transactionsCorrectionForm.controls['vehicleClass'].disable();
      this.transactionsCorrectionForm.controls['exitPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryPlaza'].disable();
      this.transactionsCorrectionForm.controls['entryLane'].disable();
      this.transactionsCorrectionForm.controls['exitLane'].disable();
    }
  }

  editOutBoundTransactionsById(trnsactionDetails) {
    this.materialscriptService.material();
    this.outboundIndividualResponse = trnsactionDetails;
    this.transactionsCorrectionForm.controls['tollAmount'].reset();
    this.transactionsCorrectionForm.controls['transactionId'].setValue(trnsactionDetails.TransactionId);
    this.transactionsCorrectionForm.controls['transactionType'].setValue(trnsactionDetails.TransactionType);
    this.transactionsCorrectionForm.controls['tagType'].setValue(trnsactionDetails.TagType);
    this.transactionsCorrectionForm.controls['tollAmount'].setValue(trnsactionDetails.TollAmount);
    this.transactionsCorrectionForm.controls['entryPlaza'].setValue(trnsactionDetails.EntryPlaza);
    this.transactionsCorrectionForm.controls['exitPlaza'].setValue(trnsactionDetails.ExitPlaza);
    this.transactionsCorrectionForm.controls['correctionType'].setValue("");
    this.transactionsCorrectionForm.controls['tollAmount'].disable();
    this.transactionsCorrectionForm.controls['entryPlaza'].disable();
    this.transactionsCorrectionForm.controls['entryLane'].disable();
    this.transactionsCorrectionForm.controls['exitLane'].disable();
    this.transactionsCorrectionForm.controls['vehicleClass'].disable();
    this.transactionsCorrectionForm.controls['exitPlaza'].disable();
    this.entryLanesByPlazaCode = this.getLanesByPlazaCode(trnsactionDetails.EntryPlaza, 'ENTRY', true);
    this.exitLanesByPlazaCode = this.getLanesByPlazaCode(trnsactionDetails.ExitPlaza, 'EXIT', true);
    let list = new List<IVehicleClass>(this.newFunction());
    let vehicleClass = list.Where(x => x.Code == trnsactionDetails.VehicleClass).Select(y => y.Name).FirstOrDefault();
    this.transactionsCorrectionForm.controls['vehicleClass'].setValue(vehicleClass);
    this.transactionsCorrectionForm.controls['exitLane'].setValue(trnsactionDetails.EntryLane);
    this.transactionsCorrectionForm.controls['entryLane'].setValue(trnsactionDetails.ExitLane);
    $('#ezpassoutModel').modal('show');
    let a=this;
    setTimeout(function() {
      a.materialscriptService.material();
    }, 1000);
  }

  private newFunction(): IVehicleClass[] {
    return this.vehicleClasses;
  }

  private newFunctionPlaza(): IPlazas[] {
    return this.plazasDetails;
  }

  cancelupdateOutBoundTransactions() {
    $('#ezpassoutModel').modal('hide');
    this.transactionsCorrectionForm.controls['correctionType'].setValue("");
  }
  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.MANAGEEZPASSOUTBOUNDTRANSACTION];
    this.userEvents.ActionName = Actions[Actions.VIEW];
    this.userEvents.PageName = this.router.url;
    this.userEvents.CustomerId = 0;
    this.userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEvents.UserName = this.sessionContextResponse.userName;
    this.userEvents.LoginId = this.sessionContextResponse.loginId;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
}
