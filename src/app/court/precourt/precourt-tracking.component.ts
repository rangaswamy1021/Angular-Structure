
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../../shared/services/common.service';
import { CourtService } from "../services/court.service";
import { SessionService } from '../../shared/services/session.service';
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydatepicker";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { ModalDirective } from "ngx-bootstrap";
declare var $: any;

@Component({
  selector: 'app-precourt-tracking',
  templateUrl: './precourt-tracking.component.html',
  styleUrls: ['./precourt-tracking.component.scss']
})
export class PrecourtTrackingComponent implements OnInit {
  storedCustomerId: number = 0;
  groupStatus: string = '';
  searchClick: any = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  objProfile: any;
  collectionCustId: number;
  isProceedToPay: any;
  dateForm: FormGroup;
  invalidDate: boolean;
  customerId: number;
  responseBlock: boolean = false;
  viewResponse: any[];

  //User log in details
  sessionContextResponse: IUserresponse
  groupStatuses = [];

  //Pagination
  p: number;
  pResp: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  pageItemNumberResponse: number = 10;
  startItemNumberResponse: number = 1;
  endItemNumberResponse: number = this.pageItemNumberResponse;
  totalRecordCountOfResponse: number;
  preCourtSelectionRequest: any;
  objReqActiveCollection: any;
  objPreCourtCustomerReq: any;
  preCourtSelectionResponse: any[] = <any>[];
  SystemActivity: any;
  preCourtSearchForm: FormGroup;
  defaultResponse = 'PaymentPlan';
  response = [
    {
      id: 'PaymentPlan',
      Value: 'Payment Plan'
    },

    {
      id: 'PromiseToPay',
      Value: 'Promise To Pay'
    }
  ];
  @ViewChild('responseModel') public responseModel: ModalDirective;
  tillDay = new Date();
  myDatePickerOptions: ICalOptions = {
    disableUntil: { year: this.tillDay.getFullYear(), month: this.tillDay.getMonth() + 1, day: this.tillDay.getDate() - 1 },
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDate: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false
  };

  constructor(private datePickerFormatService: DatePickerFormatService, private courtService: CourtService, private commonService: CommonService, private router: Router, private sessionContext: SessionService,
    private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.dateForm = new FormGroup({
      'date': new FormControl('', [Validators.required]),
      'days': new FormControl('')
    })
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;

    this.preCourtSearchForm = new FormGroup({
      'AccountId': new FormControl(''),
      'groupStatusSelected': new FormControl('')
    });

    this.sessionContextResponse = this.sessionContext.customerContext;
    this.bindGroupStatusDropdown();
    this.preCourtSearchForm.controls['groupStatusSelected'].setValue('');
    this.bindPreCourtCustomers(this.p, false);
  }

  bindGroupStatusDropdown() {
    // Bind Group Status
    this.commonService.getCourtGroupStatus().subscribe(res => { this.groupStatuses = res; });
  }

  responseChanged() {
    this.isProceedToPay = (this.isProceedToPay == true) ? false : true;
  }

  daysChanged() {
    let date = new Date();
    date.setDate(date.getDate() + (this.dateForm.controls['days'].value == 15 ? 15 : 30));
    this.dateForm.patchValue({
      date: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

  resetclick() {
    this.responseBlock = false;
    this.preCourtSearchForm.reset();
    this.preCourtSearchForm.value.groupStatusSelected = '';
    this.bindGroupStatusDropdown();
    this.storedCustomerId = 0;
    this.groupStatus = '';
    this.searchClick = false;
    this.pageChanged(1);
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  responseSubmit() {
    if (this.defaultResponse == "ProceedToPay") {
      if (!this.dateForm.valid) {
        this.validateAllFormFields(this.dateForm);
        return;
      }
      else {
        this.insertPrecourtResponse();
      }
    }
    else {
      this.insertPrecourtResponse();
    }
  }


  insertPrecourtResponse() {

    this.courtService.getPaymentPlan(this.customerId).subscribe(
      res => {
        this.objProfile = res;
      }, (err) => { }
      , () => {
        if (this.objProfile.PaymentPlan == 1) {
          this.errorMessageBlock("Payment Plan already exists for this customer.");
          return;
        } else {

          this.objPreCourtCustomerReq = <any>{};
          this.objPreCourtCustomerReq.CollectionCustId = this.collectionCustId;
          this.objPreCourtCustomerReq.CustomerId = this.customerId;
          this.courtService.getPomisetoPayStatus(this.objPreCourtCustomerReq).subscribe(
            res => {
              if (res) {
                this.errorMessageBlock("Promise to pay already exists for this customer.");
                return;
              } else {
                this.objReqActiveCollection = <any>{};
                this.objReqActiveCollection.CollectionCustId = this.collectionCustId;
                this.objReqActiveCollection.CustomerId = this.customerId;
                this.objReqActiveCollection.Response = this.defaultResponse;
                this.objReqActiveCollection.CreatedUser = this.sessionContextResponse.userName;
                this.objReqActiveCollection.ContactDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
                this.objReqActiveCollection.HoldStartDate = new Date().toLocaleDateString();
                let date = this.datePickerFormatService.getFormattedDate((this.dateForm.controls['date'].value).date);
                this.objReqActiveCollection.HoldEndDate = new Date(new Date(date).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();
                this.courtService.insertCustomerResponse(this.objReqActiveCollection).subscribe(
                  res => {
                    if (res) {
                      $("#responseModel").modal("hide");
                      this.successMessageBlock('Customer Response has been added successfully for Account # : ' + this.customerId);
                      this.bindPreCourtCustomers(this.p, false);
                    }
                  });
              }
            });
        }
      }
    );


  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  goToView(collectionCustId: number, isPaging: boolean) {
    this.responseBlock = true;
    this.preCourtSelectionRequest = <any>{};
    this.preCourtSelectionRequest.CollectionCustId = collectionCustId;
    this.collectionCustId = this.preCourtSelectionRequest.CollectionCustId;
    this.preCourtSelectionRequest.GroupStatus = this.preCourtSearchForm.value.groupStatusSelected == '' ? '' : this.preCourtSearchForm.value.groupStatusSelected;
    this.preCourtSelectionRequest.PageNumber = isPaging ? this.pResp : 1;//pageNumber;
    this.preCourtSelectionRequest.PageSize = 10;
    this.preCourtSelectionRequest.SortDir = 1;
    this.preCourtSelectionRequest.SortColumn = "";
    this.preCourtSelectionRequest.IsSearch = false;

    this.SystemActivity = <any>{};
    this.SystemActivity.UserId = this.sessionContextResponse.userId;
    this.SystemActivity.LoginId = this.sessionContextResponse.loginId;
    this.SystemActivity.ActivitySource = "Internal";
    this.SystemActivity.User = this.sessionContextResponse.userName;
    this.SystemActivity.SubSystem = "COURT";
    this.preCourtSelectionRequest.SystemActivity = this.SystemActivity;
    this.courtService.getPreCourtCustRespHistory(this.preCourtSelectionRequest).subscribe(
      res => {
        this.viewResponse = res;
        if (this.viewResponse && this.viewResponse.length > 0) {
          this.totalRecordCountOfResponse = this.viewResponse[0].Recount;
          if (this.totalRecordCountOfResponse < this.pageItemNumberResponse) {
            this.endItemNumberResponse = this.totalRecordCountOfResponse;
          }
        }
      });
  }

  getPopUp(id: number, CollectionCustId: number) {
    this.customerId = id;
    this.collectionCustId = CollectionCustId;
    this.dateForm.controls['days'].setValue(15);
    this.daysChanged();
    this.isProceedToPay = false;
    this.defaultResponse = 'PaymentPlan';
  }

  searchPreCourtCustomers() {
    this.searchClick = true;
    this.pageChanged(1);
  }

  bindPreCourtCustomers(pageNumber: number, isSearchEvent: boolean) {
    //Assign Values to Request Object
    this.preCourtSelectionResponse = [];
    this.preCourtSelectionRequest = <any>{};
    if (this.searchClick) {
      this.preCourtSelectionRequest.CustomerId = this.preCourtSearchForm.controls['AccountId'].value == '' ? 0 : this.preCourtSearchForm.controls['AccountId'].value;
      this.preCourtSelectionRequest.GroupStatus = this.preCourtSearchForm.value.groupStatusSelected == '' || this.preCourtSearchForm.value.groupStatusSelected == null ? '' : this.preCourtSearchForm.value.groupStatusSelected;
      this.storedCustomerId = this.preCourtSelectionRequest.CustomerId;
      this.groupStatus = this.preCourtSelectionRequest.GroupStatus;
      this.searchClick = false;
    } else {
      this.preCourtSelectionRequest.CustomerId = this.storedCustomerId;
      this.preCourtSelectionRequest.GroupStatus = this.groupStatus;
    }
    this.preCourtSelectionRequest.PageNumber = pageNumber;
    this.preCourtSelectionRequest.PageSize = 10;
    this.preCourtSelectionRequest.SortDir = 1;
    this.preCourtSelectionRequest.SortColumn = "";
    this.preCourtSelectionRequest.IsSearch = false;

    this.SystemActivity = <any>{};
    this.SystemActivity.UserId = this.sessionContextResponse.userId;
    this.SystemActivity.LoginId = this.sessionContextResponse.loginId;
    this.SystemActivity.ActivitySource = "Internal";
    this.SystemActivity.User = this.sessionContextResponse.userName;
    this.SystemActivity.SubSystem = "COURT";
    this.SystemActivity.IsViewed = isSearchEvent ? false : true;
    this.preCourtSelectionRequest.SystemActivity = this.SystemActivity;
    this.preCourtSelectionRequest.IsSearch = isSearchEvent;
    this.preCourtSelectionRequest.UserName = this.sessionContextResponse.userName;;
    this.courtService.getPreCourtCustomersDetails(this.preCourtSelectionRequest).subscribe(
      res => {
        this.preCourtSelectionResponse = res;
        if (this.preCourtSelectionResponse && this.preCourtSelectionResponse.length > 0) {
          this.totalRecordCount = this.preCourtSelectionResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          } else {
            this.endItemNumber = ((this.p) * this.pageItemNumber);
            if (this.endItemNumber > this.totalRecordCount) {
              this.endItemNumber = this.totalRecordCount
            }
          }
        }
      });
  }



  pageChangedOfResponse(event) {
    this.pResp = event;
    this.startItemNumberResponse = (((this.pResp) - 1) * this.pageItemNumberResponse) + 1;
    this.endItemNumberResponse = ((this.pResp) * this.pageItemNumberResponse);
    if (this.endItemNumberResponse > this.totalRecordCountOfResponse)
      this.endItemNumberResponse = this.totalRecordCountOfResponse;
    this.goToView(this.collectionCustId, true);
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.searchClick) {
      this.bindPreCourtCustomers(this.p, true);
    } else {
      this.bindPreCourtCustomers(this.p, false);
    }
  }

  errorMessageBlock(errorMsg) {
    this.msgType = 'error';
    this.msgFlag = true;
    this.msgDesc = errorMsg;
  }

  successMessageBlock(successMsg) {
    this.msgType = 'success';
    this.msgFlag = true;
    this.msgDesc = successMsg;
  }

  setOutputFlag(event) {
    this.msgFlag = event;
  }
}