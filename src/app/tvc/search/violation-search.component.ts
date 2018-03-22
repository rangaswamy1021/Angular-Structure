import { LoginService } from './../../login/services/login.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ViolationSearchService } from "./services/violation-search.service";
import { IViolatorSearchRequest } from "./models/violatorsearchrequest";
import { IViolatorSearchResponse } from "./models/violatorsearchresponse";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { Router } from "@angular/router";
import { IViolatorSearchContextResponse } from "./models/violatorSearchContextresponse";
import { ViolatorSearchContextService } from "./services/violation-search-context.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { CommonService } from "../../shared/services/common.service";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-violation-search',
  templateUrl: './violation-search.component.html',
  styleUrls: ['./violation-search.component.scss']
})
export class ViolationSearchComponent implements OnInit {
  gridArrowOUTSTANDINGINVOICECOUNT: boolean;
  gridArrowFullAddress: boolean;
  gridArrowLASTNAME: boolean;
  gridArrowFIRSTNAME: boolean;
  gridArrowVEHICLECSV: boolean;
  sortingColumn: any;
  sortingDirection: boolean;
  gridArrowCUSTOMERID: boolean;
  msgTitle: string;
  msgDesc: string;
  msgFlag: boolean;
  msgType: string;
  disableButton: boolean;
  afterSearch: boolean;

  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = 10;
  totalRecordCount: number;

  sessionContextResponse: IUserresponse;
  violatorSearchForm: FormGroup;
  violatorSearchRequest: IViolatorSearchRequest = <IViolatorSearchRequest>{};
  violatorSearchResponse: IViolatorSearchResponse[];
  violatorContext: IViolatorContextResponse;
  violatorSearchContext: IViolatorSearchContextResponse;

  constructor(
    private violationSearchService: ViolationSearchService,
    private sessionContext: SessionService,
    private violatorContextService: ViolatorContextService,
    private loginService: LoginService,
    private violatorSearchContextService: ViolatorSearchContextService,
    private commonService: CommonService,
    private materialscriptService: MaterialscriptService,
    private router: Router) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }

  ngOnInit() {
    this.gridArrowCUSTOMERID = true;
    this.sortingColumn = "CUSTOMERID";
    this.materialscriptService.material();
    this.violatorSearchForm = new FormGroup({
      'InvoiceNo': new FormControl(''),
      'InvoiceRefNo': new FormControl(''),
      'TripNo': new FormControl(''),
      'AccountNo': new FormControl(''),
      'Fname': new FormControl(''),
      'Lastname': new FormControl(''),
      'PlateNo': new FormControl(''),
      'Address': new FormControl(''),
    });

    this.violatorSearchContextService.currentContext.
      subscribe(res => {
        this.violatorSearchContext = res;
      });

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORSEARCH];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.CustomerId = 0;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => { });
    this.disableButton = !this.commonService.isAllowed(Features[Features.VIOLATORSEARCH], Actions[Actions.SEARCH], '');
    
    if (this.violatorSearchContext && this.violatorSearchContext.IsNavigatedFromAccountSummary) {
      this.violatorSearchForm.patchValue({
        Address: this.violatorSearchContext.Address,
        InvoiceRefNo: this.violatorSearchContext.InvoiceBatchId,
        TripNo: this.violatorSearchContext.TripId,
        AccountNo: this.violatorSearchContext.ViolatorID,
        Fname: this.violatorSearchContext.ViolatorFirstName,
        Lastname: this.violatorSearchContext.ViolatorSecondName,
        PlateNo: this.violatorSearchContext.LicensePlate,
        InvoiceNo: this.violatorSearchContext.InvoiceNumber
      });
      this.searchViolator(this.violatorSearchContext.pageIndex);
    }
  }

  onSubmit() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORSEARCH];
    userEvents.ActionName = Actions[Actions.SEARCH];
    userEvents.PageName = this.router.url;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    userEvents.CustomerId = 0;

    this.p = 1;
    this.pageItemNumber = 10;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    if (!this.noSearchParameter()) {
      if (this.violatorSearchForm.valid) {
        this.searchViolator(this.p, userEvents);
        this.loadSearchParameters();
        this.violatorSearchContextService.changeResponse(this.violatorSearchContext);
      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = "Please fill at-least one field";
      this.msgTitle = 'Invalid search';
      return;
    }
  }

  searchViolator(pageNumber: number, userEvents?: IUserEvents) {
    $('#pageloader').modal('show');
    this.violatorSearchRequest = <IViolatorSearchRequest>{};
    this.violatorSearchRequest.InvoiceNumber = this.violatorSearchForm.controls['InvoiceNo'].value;
    this.violatorSearchRequest.InvoiceBatchId = this.violatorSearchForm.controls['InvoiceRefNo'].value;
    this.violatorSearchRequest.TripId = this.violatorSearchForm.controls['TripNo'].value;
    this.violatorSearchRequest.ViolatorID = this.violatorSearchForm.controls['AccountNo'].value;
    this.violatorSearchRequest.ViolatorFirstName = this.violatorSearchForm.controls['Fname'].value;
    this.violatorSearchRequest.ViolatorSecondName = this.violatorSearchForm.controls['Lastname'].value;
    this.violatorSearchRequest.LicensePlate = this.violatorSearchForm.controls['PlateNo'].value;
    this.violatorSearchRequest.Address = this.violatorSearchForm.controls['Address'].value;
    this.violatorSearchRequest.Soundex = 0;
    this.violatorSearchRequest.IsViolation = true;
    this.violatorSearchRequest.PageSize = this.pageItemNumber;
    this.violatorSearchRequest.PageNumber = pageNumber;
    this.violatorSearchRequest.SortColumn = this.sortingColumn;
    this.violatorSearchRequest.SortDir = this.sortingDirection == true ? true : false;
    this.violatorSearchRequest.IsSearch = true;
    this.violatorSearchRequest.LoginId = this.sessionContextResponse.loginId;
    this.violatorSearchRequest.LoggedUserId = this.sessionContextResponse.userId;
    this.violatorSearchRequest.UserName = this.sessionContextResponse.userName;

    this.violationSearchService.getViolatorsBySearchRequest(this.violatorSearchRequest, userEvents)
      .subscribe(res => {
        this.violatorSearchResponse = res;
        this.afterSearch = true;
        setTimeout(function () { window.scrollTo(0, document.body.scrollHeight) }, 100);
        $('#pageloader').modal('hide');
      },
      (err) => {
        $('#pageloader').modal('hide');
      },
      () => {
        if (this.violatorSearchResponse && this.violatorSearchResponse.length > 0) {
          if (this.violatorSearchResponse.length == 1 && this.startItemNumber == 1 && !this.violatorSearchContext.IsNavigatedFromAccountSummary)
            this.viewAccount(this.violatorSearchResponse[0]);
          else if (this.violatorSearchContext.IsNavigatedFromAccountSummary) {
            this.p = this.violatorSearchContext.pageIndex;
            this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
            this.endItemNumber = ((this.p) * this.pageItemNumber);
          }
          this.totalRecordCount = this.violatorSearchResponse[0].ReCount;
          if (this.endItemNumber > this.totalRecordCount) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
        this.violatorSearchContext.IsNavigatedFromAccountSummary = false;
        this.msgFlag = false;
        $('#pageloader').modal('hide');
      });
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.searchViolator(this.p);
    // this.pageIndex=this.p;

  }

  resetSearch() {
    this.violatorSearchForm.reset();
    this.violatorSearchContextService.changeResponse(null);
    this.violatorSearchResponse = null;
    this.msgFlag = false;
    this.afterSearch = false;
  }

  viewAccount(violator: IViolatorSearchResponse) {
    this.violatorContext = <IViolatorContextResponse>{};
    this.violatorContext.accountId = violator.ViolatorID;
    this.violatorContext.pageIndex = this.p;
    this.violatorContextService.changeResponse(this.violatorContext);

    this.loginService.setViolatorContext(this.violatorContext.accountId);
    this.loginService.setCustomerContext(null);

    this.router.navigate(['/tvc/violatordetails/violator-summary']);
  }

  noSearchParameter(): boolean {
    return (this.violatorSearchForm.controls['InvoiceNo'].value === null || this.violatorSearchForm.controls['InvoiceNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['InvoiceRefNo'].value === null || this.violatorSearchForm.controls['InvoiceRefNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['TripNo'].value === null || this.violatorSearchForm.controls['TripNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['AccountNo'].value === null || this.violatorSearchForm.controls['AccountNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['Fname'].value === null || this.violatorSearchForm.controls['Fname'].value.trim() === '')
      && (this.violatorSearchForm.controls['Lastname'].value === null || this.violatorSearchForm.controls['Lastname'].value.trim() === '')
      && (this.violatorSearchForm.controls['PlateNo'].value === null || this.violatorSearchForm.controls['PlateNo'].value.trim() === '')
      && (this.violatorSearchForm.controls['Address'].value === null || this.violatorSearchForm.controls['Address'].value.trim() === '')
  }

  loadSearchParameters() {
    this.violatorSearchContext = <IViolatorSearchContextResponse>{};
    this.violatorSearchContext.ViolatorID = this.violatorSearchForm.controls['AccountNo'].value;
    this.violatorSearchContext.Address = this.violatorSearchForm.controls['Address'].value;
    this.violatorSearchContext.InvoiceBatchId = this.violatorSearchForm.controls['InvoiceRefNo'].value;
    this.violatorSearchContext.InvoiceNumber = this.violatorSearchForm.controls['InvoiceNo'].value;
    this.violatorSearchContext.LicensePlate = this.violatorSearchForm.controls['PlateNo'].value;
    this.violatorSearchContext.TripId = this.violatorSearchForm.controls['TripNo'].value;
    this.violatorSearchContext.ViolatorFirstName = this.violatorSearchForm.controls['Fname'].value;
    this.violatorSearchContext.ViolatorSecondName = this.violatorSearchForm.controls['Lastname'].value;
    this.violatorSearchContext.IsNavigatedFromAccountSummary = false;
    this.violatorSearchContext.pageIndex = this.p;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  sortDirection(SortingColumn) {
    this.gridArrowCUSTOMERID = false;
    this.gridArrowVEHICLECSV = false;
    this.gridArrowFIRSTNAME = false;
    this.gridArrowLASTNAME = false;
    this.gridArrowFullAddress = false;
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

    this.searchViolator(this.p);
  }


}
