import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Rx";
import { VendorService } from "./services/vendor.service";
import { IvendorRequest } from "./models/vendorrequest";
import { ActivitySource, AddressTypes, Actions, VendorStatus, Features } from "../../shared/constants";
import { IVendorResponse } from "./models/venodrresponse";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-vendor-search',
  templateUrl: './vendor-search.component.html',
  styleUrls: ['./vendor-search.component.scss']
})
export class VendorSearchComponent implements OnInit {
  gridArrowCEONAME: boolean;
  gridArrowCompanyName: boolean;
  searchClicked: boolean;


  // vendorList: any;
  userEventRequest: IUserEvents = <IUserEvents>{};
  sessionContextResponse: IUserresponse;
  vendorRequest: IvendorRequest = <IvendorRequest>{};
  vendorResponse: IVendorResponse[];
  vendorSearchForm: FormGroup;

  vendorId: number;


  VendorDeleteStatus: string;
  sortingColumn: any;
  deleteVendorData: any;
  CompanyName: any;
  vendorStatus: string;

  sortingDirection: boolean;
  isSearch: boolean;

  // pagination
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  disableSearchbtn: boolean;
  disableAddNewVendorbtn: boolean;
  disableEditVendorbtn: boolean;
  disableDeleteVendorbtn: boolean;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  // gridArrowCompanyName: boolean = true;
  // gridArrowCEONAME: boolean;

  pageChanged(event) {

    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getVendoDetails(this.p, null);
  }
  // end

  constructor(private _vendorService: VendorService,
    private _routerParameter: ActivatedRoute,
    private _router: Router,
    private _context: SessionService,
    private commonService: CommonService,
    private materialscriptService: MaterialscriptService
  ) { }

  ngOnInit() {
    this.gridArrowCompanyName = true;
    this.sortingColumn = "CompanyName";
    this.materialscriptService.material();
    this.sessionContextResponse = this._context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this._router.navigate(link);
    }
    this.disableSearchbtn = !this.commonService.isAllowed(Features[Features.VENDOR], Actions[Actions.SEARCH], "")
    this.disableAddNewVendorbtn = !this.commonService.isAllowed(Features[Features.VENDOR], Actions[Actions.CREATE], "")
    this.disableEditVendorbtn = !this.commonService.isAllowed(Features[Features.VENDOR], Actions[Actions.UPDATE], "")
    this.disableDeleteVendorbtn = !this.commonService.isAllowed(Features[Features.VENDOR], Actions[Actions.DELETE], "")

    // this.sortingDirection = false;
    // this.sortingColumn = "CompanyName";

    this.p = 1;
    this.endItemNumber = 10;
    this.vendorSearchForm = new FormGroup({
      'CompanyName': new FormControl('', [Validators.required]),

    });
    let userEvent = this.userEvents();
    this.getVendoDetails(this.p, userEvent);

    var Message = this._routerParameter.snapshot.params["Message"];
    if (Message) {
      if (Message == "Created") {

        this.msgType = 'success';
        this.msgFlag = true;
        this.msgDesc = "Vendor details has been added successfully.";
        this.msgTitle = '';
      }
      else if (Message == "Updated") {
        this.msgType = 'success';
        this.msgFlag = true;
        this.msgDesc = "Vendor details has been updated successfully.";
        this.msgTitle = '';
      }
    }
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.VENDOR];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this._router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContextResponse.roleID);
    this.userEventRequest.UserName = this.sessionContextResponse.userName;
    this.userEventRequest.LoginId = this.sessionContextResponse.loginId;
    return this.userEventRequest;
  }
  //Add New Vendor Button Click
  addNewVendor() {

    this._router.navigate(['imc/vendor/vendor-company/']);
  }
  //Edit Button Click
  editVendorData(vendorId) {

    this._router.navigate(['imc/vendor/vendor-company/' + vendorId], { skipLocationChange: true });//to hide the url parameters..
  }


  //This is For Deleting Ofter Conforim Method..
  btnYesClick(event) {
    if (event) {
      this.vendorRequest.VendorId = this.vendorId;     //"Active";
      this.vendorRequest.Status = this.vendorStatus == VendorStatus[VendorStatus.InActive] ? VendorStatus[VendorStatus.Active] : VendorStatus[VendorStatus.InActive]; //e.CommandName.ToString().ToUpper() == "DEACTIVATE" ? TBOSEnums.InventoryActivity.VendorStatus.InActive.ToString() : TBOSEnums.InventoryActivity.VendorStatus.Active.ToString();
      this.vendorRequest.UpdatedUser = this._context.customerContext.userName;
      this.vendorRequest.User = this._context.customerContext.userName;
      this.vendorRequest.UserId = this._context.customerContext.userId;
      this.vendorRequest.LoginId = this._context.customerContext.loginId;                                                    // 1000001;
      this.vendorRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      let userEvents = this.userEvents();
      userEvents.ActionName = Actions[Actions.DELETE];
      this._vendorService.deleteVendorData(this.vendorRequest, userEvents).subscribe(
        data => {
          if (data) {
            if (this.searchClicked && this.vendorSearchForm.valid)
              this.getVendoSearchDetails();
            else {
              this.getVendoDetails(this.p, null);
              this.vendorSearchForm.reset();
            }
            if (this.vendorStatus == "Active") {
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Vendor has been deactivated successfully.";
              //this.msgTitle = 'Success';
            }
            else {
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Vendor has been activated successfully.";
              //this.msgTitle = 'Success';
            }
          }
        }, err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = ''
          return;
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  //This is Method is used to Binding Data To Grid.....
  getVendoDetails(pageNumber: number, userEvents: IUserEvents) {

    this.vendorRequest.VendorName = '';
    this.vendorRequest.AddressType = AddressTypes[AddressTypes.Business];
    this.vendorRequest.User = this._context.customerContext.userName;
    this.vendorRequest.UserId = this._context.customerContext.userId;
    this.vendorRequest.LoginId = this._context.customerContext.loginId;
    this.vendorRequest.SearchFlag = Actions[Actions.VIEW]
    this.vendorRequest.PageNumber = this.p;
    this.vendorRequest.PageSize = 10;
    this.vendorRequest.SortColumn = this.sortingColumn;
    this.vendorRequest.SortDirection = this.sortingDirection;
    this.vendorRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this._vendorService.getVendorDetails(this.vendorRequest, userEvents).subscribe(
      res => {
        this.vendorResponse = res;
        if (res.length > 0) {
          this.totalRecordCount = this.vendorResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }
      , err => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText;
        this.msgTitle = ''
        return;
      }
    );
  }

  getVendoSearchDetails() {
    let userEvents = this.userEvents();
    userEvents.ActionName = Actions[Actions.SEARCH];
    this.getVendoSearchDetail(userEvents)
  }
  // To Get Company Name Based Search (Search Text Box )
  getVendoSearchDetail(userEvents: IUserEvents) {
    this.searchClicked = true;
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    if (this.vendorSearchForm.valid) {

      this.isSearch = false;
      this.vendorRequest.PageNumber = this.p;
      this.vendorRequest.PageSize = 10;
      this.vendorRequest.SortColumn = this.sortingColumn;
      this.vendorRequest.SortDirection = this.sortingDirection;
      let companyName = this.vendorSearchForm.controls['CompanyName'].value.trim();
      this.vendorRequest.SearchFlag = Actions[Actions.SEARCH];
      this.vendorRequest.VendorName = companyName;
      this._vendorService.getVendoSearchDetails(this.vendorRequest, userEvents).subscribe(
        res => {
          this.vendorResponse = res;
          if (res.length == 1) {
            this.isSearch = true;
          }
        }
        , err => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText;
          this.msgTitle = '';
          return;
        }
      );
    }
    else {
      this.validateAllFormFields(this.vendorSearchForm);
    }
  }

  //Reset Search Page
  resetVendorSearchPage() {
    this.searchClicked = false;
    this.p = 1;
    this.endItemNumber = 10;
    this.startItemNumber = 1;
    this.isSearch = false;
    this.getVendoDetails(this.p, null);
  }

  //Passing VendorId Globally For Deleting 
  venodrDelete(vendorId, vendorStatus) {
    if (vendorStatus == "Active") {
      this.VendorDeleteStatus = "Deactivate";
    }
    else {
      this.VendorDeleteStatus = "Activate";
    }
    this._vendorService.getContractDetailsByVendorID(vendorId).subscribe(
      data => {
        if (data.length < 1) {
          this.vendorId = vendorId;
          this.vendorStatus = vendorStatus;
          this.msgType = 'alert';
          this.msgFlag = true;
          this.msgDesc = "Are you sure you want to " + this.VendorDeleteStatus + " Vendor ?";
          this.msgTitle = '';
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Items associated with this vendor, you can not de-activate this vendor.";
          this.msgTitle = '';
        }
      },
      (error) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = error.statusText.toString();
        this.msgTitle = '';
      });
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {

        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }


  sortDirection(SortingColumn) {
    this.gridArrowCompanyName = false;
    this.gridArrowCEONAME = false;

    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "CompanyName") {
      this.gridArrowCompanyName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    else if (this.sortingColumn == "CEONAME") {
      this.gridArrowCEONAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    if (!this.isSearch) {
      this.getVendoDetails(this.p, null);
    } else {
      this.getVendoSearchDetail(null);
    }
  }
}
