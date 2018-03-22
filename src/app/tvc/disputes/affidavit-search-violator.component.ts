import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { DisputesService } from "./services/disputes.service";
import { IViolatorSearchRequest } from "../search/models/violatorsearchrequest";
import { SessionService } from "../../shared/services/session.service";
import { IViolatorSearchResponse } from "../search/models/violatorsearchresponse";
import { IAffidavitRequest } from "./models/affidavitrequest";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IAffidavitResponse } from "./models/affidavitresponse";
import { Location } from '@angular/common';
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { DisputeContextService } from "./services/dispute.context.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-affidavit-search-violator',
  templateUrl: './affidavit-search-violator.component.html',
  styleUrls: ['./affidavit-search-violator.component.scss']
})
export class AffidavitSearchViolatorComponent implements OnInit {
  gridArrowOUTSTANDINGINVOICECOUNT: boolean;
  gridArrowLASTNAME: boolean;
  gridArrowFullAddress: boolean;
  gridArrowFIRSTNAME: boolean;
  gridArrowVEHICLECSV: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowCUSTOMERID: boolean;

  isExistAccount: boolean;
  searchForm: FormGroup;
  transferredViolator: IViolatorSearchResponse;
  violatorID: number;
  msgNewAccount = 'Are you sure want to transfer the trip(s)';
  resAffidavit: IAffidavitResponse;
  isAccountTypeShow: boolean = true;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  disableTrsfrBtn: boolean = false;
  disableSearchBtn: boolean = false;

  violators: IViolatorSearchResponse[] = [];
  pageItemNumber: number = 10;
  dataLength: number = this.violators.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number = 1;
  showGrid: boolean;
  rdoAccType;

  // Query params
  afterCitationIDs = '';
  beforeCitationIDs = '';
  fileName = '';
  affidavitType = '';
  comments = '';
  startEffDate = new Date();
  endEffDate = new Date();
  vehicleNumber = '';
  affdavitRequestId: number;
  affidavitRequest: IAffidavitRequest;

  constructor(private disputesService: DisputesService, private sessionService: SessionService,
    private violatorContext: ViolatorContextService, private route: ActivatedRoute, private router: Router,
    private _location: Location, private commonService: CommonService, private materialscriptService: MaterialscriptService, private disputecontext: DisputeContextService) { }

  ngOnInit() {
     this.materialscriptService.material();
    this.gridArrowCUSTOMERID = true;
    this.sortingColumn = "CUSTOMERID";
    this.isExistAccount = true;
    this.rdoAccType = "Existing Account";
    this.violatorContext.currentContext.subscribe(cntxt => {
      if (cntxt) {
        this.violatorID = cntxt.accountId;
      }
    });

    this.route.queryParams.subscribe(params => {
        this.affdavitRequestId = params['affdavitRequestId'];
      this.vehicleNumber = params['vehicleNumber'];
    });

    this.loadForm();
    this.disableTrsfrBtn = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.TRANSFER], '');
    this.disableSearchBtn = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.SEARCH], '');
  }

  loadForm() {
    this.searchForm = new FormGroup({
      'invoice': new FormControl(''),
      'invoiceRef': new FormControl(''),
      'trip': new FormControl(''),
      'account': new FormControl(''),
      'firstName': new FormControl(''),
      'lastName': new FormControl(''),
      'plate': new FormControl(''),
      'address': new FormControl('')
    });
  }

  rdoAccountType(isExist: boolean) {
    if (isExist) {
      this.isExistAccount = true;
    } else {
      this.isExistAccount = false;
    }
    this.msgFlag = false;
  }

  searchClick(pageNum: number, isPaging: boolean) {
    if (!this.searchForm.valid) {
      return;
    }

    if (!this.searchForm.controls['invoice'].value &&
      !this.searchForm.controls['invoiceRef'].value &&
      !this.searchForm.controls['trip'].value &&
      !this.searchForm.controls['account'].value &&
      !this.searchForm.controls['firstName'].value &&
      !this.searchForm.controls['lastName'].value &&
      !this.searchForm.controls['plate'].value &&
      !this.searchForm.controls['address'].value) {
      this.showErrorMsg('At least 1 field is required');
      return;
    } else {

      let violatorSearchRequest: IViolatorSearchRequest = <IViolatorSearchRequest>{};

      violatorSearchRequest.InvoiceNumber = this.searchForm.controls['invoice'].value;
      violatorSearchRequest.InvoiceBatchId = this.searchForm.controls['invoiceRef'].value;
      violatorSearchRequest.TripId = this.searchForm.controls['trip'].value;
      violatorSearchRequest.ViolatorID = this.searchForm.controls['account'].value;
      violatorSearchRequest.Soundex = 0;
      violatorSearchRequest.ViolatorFirstName = this.searchForm.controls['firstName'].value;
      violatorSearchRequest.ViolatorSecondName = this.searchForm.controls['lastName'].value;
      violatorSearchRequest.LicensePlate = this.searchForm.controls['plate'].value;
      violatorSearchRequest.Address = this.searchForm.controls['address'].value;

      violatorSearchRequest.IsViolation = true;
      violatorSearchRequest.PageSize = 10;
      violatorSearchRequest.PageNumber = pageNum;
      violatorSearchRequest.SortDir = this.sortingDirection == true ? true : false;
      violatorSearchRequest.SortColumn = this.sortingColumn;
      violatorSearchRequest.UserName = this.sessionService.customerContext.userName;
      violatorSearchRequest.LoginId = this.sessionService.customerContext.loginId;
      violatorSearchRequest.LoggedUserId = this.sessionService.customerContext.userId;
      violatorSearchRequest.IsSearch = true;
      this.p = pageNum;
      if (this.p === 1) {
        this.startItemNumber = 1;
      }

      let userEvents;
      if (!isPaging) {
        userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.DISPUTE];
        userEvents.ActionName = Actions[Actions.SEARCH];
        userEvents.PageName = this.router.url.split('?')[0];
        userEvents.CustomerId = this.violatorID;
        userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
        userEvents.UserName = this.sessionService.customerContext.userName;
        userEvents.LoginId = this.sessionService.customerContext.loginId;
      }

      this.disputesService.getViolatorsBySearchRequest(violatorSearchRequest, userEvents).subscribe(
        res => {
          if (res && res.length > 0) {
            this.violators = res;
            this.dataLength = this.violators[0].ReCount;
            if (this.dataLength < this.pageItemNumber) {
              this.endItemNumber = this.dataLength;
            } else {
              this.endItemNumber = this.pageItemNumber;
            }
            this.eraseAlert();
            this.transferredViolator = null;
          } else {
            this.violators = [];
          }
          this.showGrid = true;
        },
        (err) => {
          this.showErrorMsg(err.statusText);
        }
      );
    }

  }

  vioSelectedClick(vio: IViolatorSearchResponse) {
    this.transferredViolator = vio;
  }

  transferClick() {
    if (this.sessionService.customerContext.icnId === 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.');
      return;
    }

    let violatorID: number;
    if (this.transferredViolator && this.transferredViolator.CustomerStatus === 'V') {
      violatorID = this.transferredViolator.ViolatorID;
    } else if (!this.transferredViolator) {
      this.showErrorMsg('Select Account# to transfer');
      return;
    } else {
      this.showErrorMsg('Selected trip(s) # cannot be transffered to Customer account.');
      return;
    }

    this.navigateToBack(violatorID);

  }


  navigateToBack(transferredViolatorId: number) {

     this.disputecontext.currentContext.subscribe(disputecontext => this.affidavitRequest = disputecontext);

      if(this.affidavitRequest != null) {
        this.affidavitRequest.ToCustomerId = transferredViolatorId;
     }
   this.router.navigate(['tvc/disputes/non-liability', this.affidavitRequest.AffidavitId]);

   let b=this;
   setTimeout(function() {
     b.materialscriptService.material();
   }, 1000);

  }
  resetClick() {
    this.searchForm.reset();
    this.violators = [];
    this.eraseAlert();
    this.transferredViolator = null;
    this.showGrid = false;
  }

  eraseAlert() {
    this.msgFlag = false;
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
    { this.endItemNumber = this.dataLength; }
    this.searchClick(this.p, true);
  }

  backClick() {
    this._location.back();
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;
  }
  yesClick() {

      this.router.navigate(['tvc/disputes/create-violator'],
        {
          queryParams: {
           affdavitRequestId: this.affdavitRequestId,
           VehicleNumber: this.vehicleNumber
          }
        });

  }

   noClick() {
    this.violators = [];
    this.searchForm.reset();
    this.isExistAccount = true;
    this.resAffidavit = null;
    this.msgNewAccount = 'Are you sure want to transfer the trip(s)';
    this.isAccountTypeShow = true;
    this.rdoAccType = 'Existing Account';
  }

  sortDirection(SortingColumn) {
    this.gridArrowCUSTOMERID = false;
    this.gridArrowVEHICLECSV = false;
    this.gridArrowFIRSTNAME = false;
    this.gridArrowFullAddress = false;
    this.gridArrowLASTNAME = false;
    this.gridArrowOUTSTANDINGINVOICECOUNT = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "CUSTOMERID") {
      this.gridArrowCUSTOMERID = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "VEHICLECSV") {
      this.gridArrowVEHICLECSV = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "FIRSTNAME") {
      this.gridArrowFIRSTNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 

    else if (this.sortingColumn == "LASTNAME") {
      this.gridArrowLASTNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 

    else if (this.sortingColumn == "FullAddress") {
      this.gridArrowFullAddress = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 

    else if (this.sortingColumn == "OUTSTANDINGINVOICECOUNT") {
      this.gridArrowOUTSTANDINGINVOICECOUNT = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.searchClick(this.p, true);
  }

}
