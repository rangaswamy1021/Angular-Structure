import { Router } from '@angular/router';
import { IUserEvents } from './../../shared/models/userevents';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonService } from './../../shared/services/common.service';
import { ICommonResponse, ICommon } from './../../shared/models/commonresponse';
import { IExceptionListResponse } from './models/exceptionlistresponse';
import { IPaging } from './../../shared/models/paging';
import { IExceptionListRequest } from './models/exceptionlistrequest';
import { IUserresponse } from './../../shared/models/userresponse';
import { ICustomerContextResponse } from './../../shared/models/customercontextresponse';
import { SessionService } from './../../shared/services/session.service';
import { CustomerContextService } from './../../shared/services/customer.context.service';
import { ExceptionListService } from './services/exceptionlists.service';
import { Component, OnInit } from '@angular/core';
import { Actions, Features } from "../../shared/constants";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-manage-exception-list',
  templateUrl: './manage-exception-list.component.html',
  styleUrls: ['./manage-exception-list.component.css']
})
export class ManageExceptionListComponent implements OnInit {
  constructor(private exceptionListService: ExceptionListService, private customerContext: CustomerContextService,
    private sessionContext: SessionService, private commonService: CommonService, private router: Router, private materialscriptService: MaterialscriptService) { }
  validateNumberPattern = "[0-9]*";
  validateAlphaNumericsPattern = "[a-zA-Z0-9]*";
  validateExceptAnglePattern = "[^<>]*";
  customerContextResponse: ICustomerContextResponse;
  sessionContextResponse: IUserresponse;
  exceptionListResponse: IExceptionListResponse[];
  addressStates: ICommonResponse[];
  addressCountries: ICommonResponse[];
  common: ICommon = <ICommon>{};
  exceptionForm: FormGroup;
  paging: IPaging;
  isSuccess: number = 0;
  active: boolean;
  isUpdate: boolean;
  watchListId: number = 0;
  startDate: Date;
  hideColumns: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  disabledCreate: boolean = false;
  disabledUpdate: boolean = false;

  ngOnInit() {
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );
    this.sessionContextResponse = this.sessionContext.customerContext;
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.VIEW];
    this.userEventsCalling(userEvents);
    this.initiateFormValues();
    this.getCountry();
    this.getExceptionListDetails(userEvents);

    this.disabledCreate = !this.commonService.isAllowed(Features[Features.MANAGEEXCEPTIONS], Actions[Actions.CREATE], "");
    this.disabledUpdate = !this.commonService.isAllowed(Features[Features.MANAGEEXCEPTIONS], Actions[Actions.UPDATE], "");
    this.materialscriptService.material();
  }

  initiateFormValues() {
    this.exceptionForm = new FormGroup({
      accountId: new FormControl('', Validators.compose([Validators.minLength(1), Validators.maxLength(17), Validators.pattern(this.validateNumberPattern)])),
      plateNo: new FormControl('', Validators.compose([Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateAlphaNumericsPattern)])),
      selectedState: new FormControl('', [Validators.required]),
      countrySelected: new FormControl('', [Validators.required]),
      serialNo: new FormControl('', Validators.compose([Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.validateNumberPattern)])),
      comments: new FormControl('', Validators.compose([Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.validateExceptAnglePattern)])),
      active: new FormControl({ value: '' })
    });
  }
  pageChanged(event) {
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getExceptionListDetails();
  }
  //Get all countries 
  getCountry() {
    this.commonService.getCountries().subscribe(res => this.addressCountries = res);
  }

  changeCountry(countryCode: string) {
    this.exceptionForm.controls["selectedState"].setValue("");
    this.getStatesByCountry(countryCode);
  }

  //Method to get states based on the Country code passed
  getStatesByCountry(countryCode: string) {
    this.common.CountryCode = countryCode.trim();
    this.commonService.getStatesByCountryCode(this.common).subscribe(res => {
      this.addressStates = res;
    });

  }
  getExceptionListDetails(userEvents?: IUserEvents) {
    var exceptionListReq = <IExceptionListRequest>{};
    this.paging = <IPaging>{};
    this.paging.PageNumber = this.currentPage;
    this.paging.PageSize = this.pageItemNumber;
    this.paging.ReCount = 0;
    this.paging.SortColumn = "VEHICLENUMBER";
    this.paging.SortDir = 1;
    exceptionListReq.Paging = this.paging;
    exceptionListReq.UserName = this.sessionContextResponse.userName;
    this.exceptionListService.getWatchList(exceptionListReq, userEvents).subscribe(res => {
      this.exceptionListResponse = res;
      if (this.exceptionListResponse != null && this.exceptionListResponse.length > 0) {
        this.totalRecordCount = this.exceptionListResponse[0].Paging.ReCount;
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount
        }
      }
    },
      (err) => {
        this.errorMessageBlock(err.statusText.toString());
      },
      () => {
      });
  }
  createWatchList() {
    this.clearSuccessandErrors();
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.CREATE];
    this.userEventsCalling(userEvents);
    this.validateAllFeilds();
    if (this.exceptionForm.valid) {
      if (this.exceptionForm.value.accountId != "" || this.exceptionForm.value.plateNo != "" || this.exceptionForm.value.serialNo != "") {
        var exceptionListRequest = <IExceptionListRequest>{};
        exceptionListRequest.IsCreate = true;
        this.assignCommonProperties(exceptionListRequest);
        $('#pageloader').modal('show');
        this.exceptionListService.createWatchList(exceptionListRequest, userEvents).subscribe(res => {
          this.isSuccess = res;
          if (this.isSuccess > 0) {
            this.successMessageBlock("Record has been added successfully.");
            this.clearDatafields();
            $('#pageloader').modal('hide');
          }
          else {
            this.errorMessageBlock("Error while adding record");
            $('#pageloader').modal('hide');
            return;
          }
        },
          (err) => {
            this.errorMessageBlock(err.statusText.toString());
            $('#pageloader').modal('hide');
            return;
          },
          () => {
          });
      }
      else {
        this.errorMessageBlock("At least one field is required from Account # OR Plate # OR Serial #.");
        return;
      }
    }
    else {
      this.errorMessageBlock("At least one field is required from Account # OR Plate #, State & Country OR Serial #.");
      return;
    }
  }
  populateExceptionDetails(exceptionListResponse: IExceptionListResponse): void {
    this.isUpdate = true;
    this.initiateFormValues();
    this.watchListId = exceptionListResponse.WatchListID;
    this.startDate = exceptionListResponse.StartEffectiveDate;
    this.exceptionForm.patchValue({
      accountId: exceptionListResponse.CustomerID > 0 ? exceptionListResponse.CustomerID : '',
      plateNo: exceptionListResponse.VehicleNumber,
      selectedState: exceptionListResponse.VehicleState,
      countrySelected: exceptionListResponse.VehicleCountry,
      serialNo: exceptionListResponse.TagID,
      comments: exceptionListResponse.Comments,
      active: exceptionListResponse.IsActive
    });
    this.getStatesByCountry(exceptionListResponse.VehicleCountry);
    let rootSele = this;
    setTimeout(function () {
      rootSele.materialscriptService.material();
    }, 0)
  }
  clearSuccessandErrors() {
    this.isSuccess = 0;
    this.successMessageBlock("")
    this.errorMessageBlock(" ");
  }

  checkActive(checked: boolean) {
    this.active = checked;
  }
  assignCommonProperties(exceptionListRequest: IExceptionListRequest) {
    if (this.exceptionForm.value.accountId != "") {
      exceptionListRequest.CustomerID = this.exceptionForm.value.accountId;
    }
    else {
      exceptionListRequest.CustomerID = 0;
    }
    exceptionListRequest.VehicleNumber = this.exceptionForm.value.plateNo;
    exceptionListRequest.VehicleState = this.exceptionForm.value.selectedState;
    exceptionListRequest.VehicleCountry = this.exceptionForm.value.countrySelected;
    exceptionListRequest.TagID = this.exceptionForm.value.serialNo;
    exceptionListRequest.Comments = this.exceptionForm.value.comments;
    exceptionListRequest.IsActive = this.active;
    exceptionListRequest.UserName = this.sessionContextResponse.userName;
    if (exceptionListRequest.IsCreate) {
      exceptionListRequest.StartEffectiveDate = new Date;
    }
    else {
      exceptionListRequest.WatchListID = this.watchListId;
      exceptionListRequest.StartEffectiveDate = this.startDate;
    }
    if (!this.active) {
      exceptionListRequest.EndEffectiveDate = new Date;
    }
    else {
      exceptionListRequest.EndEffectiveDate = new Date(9999, 1, 1);
    }
  }

  updateWatchList() {
    this.clearSuccessandErrors();
    let userEvents = <IUserEvents>{};
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.userEventsCalling(userEvents);
    if (this.exceptionForm.valid) {
      if (this.exceptionForm.value.accountId != "" || this.exceptionForm.value.plateNo != "" || this.exceptionForm.value.serialNo != "") {
        var exceptionListRequest = <IExceptionListRequest>{};
        exceptionListRequest.IsCreate = false;
        this.assignCommonProperties(exceptionListRequest);
        $('#pageloader').modal('show');
        this.exceptionListService.updateWatchList(exceptionListRequest, userEvents).subscribe(res => {
          this.isSuccess = res;
          if (this.isSuccess > 0) {
            this.successMessageBlock("Record has been updated successfully.");
            this.isUpdate = false;
            this.clearDatafields();
            $('#pageloader').modal('hide');
          }
          else {
            this.errorMessageBlock("Error while updating record");
            $('#pageloader').modal('hide');
            return;
          }
        },
          (err) => {
            this.errorMessageBlock(err.statusText.toString());
            $('#pageloader').modal('hide');
            return;
          },
          () => {
          });
      }
      else {
        this.errorMessageBlock("At least one field is required from Account # OR Plate # OR Serial #.");
        return;
      }
    }
    else {
      this.errorMessageBlock("At least one field is required from Account # OR Plate #, State & Country OR Serial #.");
      return;
    }
  }
  resetFields(): void {
    this.isUpdate = false;
    this.clearDatafields();
    this.materialscriptService.material();    
  }

  clearDatafields(): void {
    this.exceptionForm.reset();
    this.initiateFormValues();
    this.getCountry();
    this.addressStates = [];
    this.exceptionForm.controls["active"].setValue(false);
    this.currentPage = 1;
    this.getExceptionListDetails();
  }
  validateAllFeilds() {
    this.exceptionForm.controls["selectedState"].markAsTouched({ onlySelf: true });
    this.exceptionForm.controls["countrySelected"].markAsTouched({ onlySelf: true });
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.MANAGEEXCEPTIONS];
    userEvents.ActionName = userEvents.ActionName;
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
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
  setOutputFlag(event, duration) {
    this.msgFlag = event;
  }
}
