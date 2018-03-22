import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../../shared/services/common.service';
import { CourtService } from "../services/court.service";
import { SessionService } from '../../shared/services/session.service';
import { Router } from "@angular/router";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-precourt',
  templateUrl: './precourt-selection.component.html',
  styleUrls: ['./precourt-selection.component.scss']
})
export class PrecourtComponent implements OnInit {
  groupStatus: any = '';
  customerId: any = 0;
  searchClick: boolean = false;
  preCourtSelectionForm: FormGroup;
  preCourtCreateForm: FormGroup;
  preCourtSelectionRequest: any;
  groupStatuses = [];
  preCourtSelectionResponse: any[] = <any>[];
  SystemActivity: any;
  //Pagination
  p: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  isParentSelected: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  selectedCustomersList: any[] = <any>[];
  //User log in details
  sessionContextResponse: IUserresponse

  constructor(private courtService: CourtService, private commonService: CommonService, private router: Router, private sessionContext: SessionService,
    private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.preCourtSelectionForm = new FormGroup({
      'AccountId': new FormControl(''),
      'groupStatusSelected': new FormControl('')
    });
    this.preCourtCreateForm = new FormGroup({
      'checkAll': new FormControl(''),
      'indCheckBox': new FormControl(''),
    });
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.bindGroupStatusDropdown();
    this.preCourtSelectionForm.controls['groupStatusSelected'].setValue("");
    this.bindPreCourtEligibleCustomers(this.p, false);
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    if (this.searchClick) {
      this.bindPreCourtEligibleCustomers(this.p, true);
    } else {
      this.bindPreCourtEligibleCustomers(this.p, false);
    }
  }

  searchPreCourtEligibleCustomers() {
    this.searchClick = true;
    this.pageChanged(1);
  }

  bindGroupStatusDropdown() {
    // Bind Group Status
    this.commonService.getCourtGroupStatus().subscribe(res => { this.groupStatuses = res; });
  }

  generateOffCycle() {
    if (this.selectedCustomersList && this.selectedCustomersList.length) {
      $('#pageloader').modal('show');
      this.courtService.intiateOffCycleLetter(this.selectedCustomersList).subscribe(
        res => {
          if (res) {
            this.showSucsMsg("Off Cycle letter initiated successfully");
            this.isParentSelected = false;
            this.bindPreCourtEligibleCustomers(1, false);
            this.selectedCustomersList = [];
            $('#pageloader').modal('hide');
          }
          else {
            $('#pageloader').modal('hide');
            this.showErrorMsg("Unable to initiate Off cycle letter ");
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
          
        })
    }
    else {
      this.showErrorMsg("Select atleast one Customer account");
    }
  }

  preCourtInsert() {
    if (this.selectedCustomersList && this.selectedCustomersList.length) {
      $('#pageloader').modal('show');
      this.courtService.insertActiveCollectionDetails(this.selectedCustomersList).subscribe(
        res => {
          if (res) {
            this.showSucsMsg("Selected Customers have been moved to Precourt successfully");
            this.bindPreCourtEligibleCustomers(1, false);
            this.selectedCustomersList = [];
            $('#pageloader').modal('hide');
          }
          else {
            this.showErrorMsg("Unable to move Customers to Precourt");
            $('#pageloader').modal('hide');
          }
        }, (err) => {
          this.showErrorMsg(err.statusText.toString());
          $('#pageloader').modal('hide');
        });
    }
    else {
      this.showErrorMsg("Select atleast one Customer account");
    }
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
  }

  bindPreCourtEligibleCustomers(pageNumber: number, isSearchEvent: boolean) {
    debugger;
    if (this.preCourtSelectionForm.valid) {
      this.isParentSelected = false;
      //Assign Values to Request Object
      this.preCourtSelectionRequest = <any>{};
      if (this.searchClick) {
        this.preCourtSelectionRequest.CustomerId = this.preCourtSelectionForm.controls['AccountId'].value == '' ? 0 : this.preCourtSelectionForm.controls['AccountId'].value;
        this.preCourtSelectionRequest.GroupStatus = this.preCourtSelectionForm.controls['groupStatusSelected'].value == '' || this.preCourtSelectionForm.controls['groupStatusSelected'].value == null ? '' : this.preCourtSelectionForm.controls['groupStatusSelected'].value;
        this.customerId = this.preCourtSelectionRequest.CustomerId;
        this.groupStatus = this.preCourtSelectionRequest.GroupStatus;
        this.searchClick = false;
      } else {
        this.preCourtSelectionRequest.CustomerId = this.customerId;
        this.preCourtSelectionRequest.GroupStatus = this.groupStatus;
      }

      this.preCourtSelectionRequest.PageNumber = pageNumber;
      this.preCourtSelectionRequest.PageSize = 10;
      this.preCourtSelectionRequest.SortDir = 1;
      this.preCourtSelectionRequest.SortColumn = "";
      this.preCourtSelectionRequest.IsSearch = isSearchEvent;
      this.SystemActivity = <any>{};
      this.SystemActivity.UserId = this.sessionContextResponse.userId;
      this.SystemActivity.LoginId = this.sessionContextResponse.loginId;
      this.SystemActivity.ActivitySource = "Internal";
      this.SystemActivity.User = this.sessionContextResponse.userName;
      this.SystemActivity.SubSystem = "COURT";
      this.SystemActivity.IsViewed = isSearchEvent ? false : true;
      this.preCourtSelectionRequest.SystemActivity = this.SystemActivity;
      let userEvents = <IUserEvents>{};
      if (isSearchEvent) {
        userEvents.FeatureName = "";
        userEvents.SubFeatureName = "";
        userEvents.ActionName = "";
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
        userEvents.UserName = this.sessionContextResponse.userName;
        userEvents.LoginId = this.sessionContextResponse.loginId;
      }
      else {
        userEvents = null;
      }
      if (isSearchEvent) {
        this.preCourtSelectionRequest.IsSearch = true;
      }
      this.preCourtSelectionRequest.UserName = this.sessionContextResponse.userName;
      this.courtService.searchPreCourtCustomerDetails(this.preCourtSelectionRequest).subscribe(
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
    else {
      this.validateAllFormFields(this.preCourtSelectionForm);
    }
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

  checkboxCheckedEvent(object: any, event) {
    const index = this.selectedCustomersList.findIndex(x => x.CustomerId === object.CustomerId);
    if (event.target.checked) {
      if (index === -1) {
        object.isCustomerSelected = true;
        object.UserName = this.sessionContextResponse.userName;
        this.selectedCustomersList.push(object);
        const result = this.preCourtSelectionResponse.filter(x => x.isCustomerSelected == true).length;
        if (result == this.preCourtSelectionResponse.length) {
          this.isParentSelected = true;
        }
        else {
          this.isParentSelected = false;
        }
      }
    } else {

      this.isParentSelected = false;
      if (index > -1) {
        this.selectedCustomersList.splice(index, 1);
        object.isCustomerSelected = false;
      }
    }
  }

  checkAllClick(event) {
    for (let i = 0; i < this.preCourtSelectionResponse.length; i++) {
      const isChecked: boolean = event.target.checked;
      this.preCourtSelectionResponse[i].isCustomerSelected = isChecked;
      const index = this.selectedCustomersList.findIndex(x => x.CustomerId === this.preCourtSelectionResponse[i].CustomerId);
      if (index > -1 && !isChecked) {
        this.selectedCustomersList = this.selectedCustomersList.filter(item => item.CustomerId !== this.preCourtSelectionResponse[i].CustomerId);
        this.preCourtSelectionResponse[i].isCustomerSelected = false;
      }
      else if (isChecked) {
        const indexes = this.selectedCustomersList.findIndex(x => x.CustomerId === this.preCourtSelectionResponse[i].CustomerId);
        if (indexes === -1) {
          this.preCourtSelectionResponse[i].isCustomerSelected = true;
          this.preCourtSelectionResponse[i].UserName = this.sessionContextResponse.userName;
          this.selectedCustomersList.push(this.preCourtSelectionResponse[i]);
        }
      }
    }
  }

  resetclick() {
    this.isParentSelected = false;
    this.preCourtSelectionForm.reset();
    this.preCourtSelectionForm.value.groupStatusSelected = '';
    this.bindGroupStatusDropdown();
    this.customerId = 0;
    this.groupStatus = '';
    this.searchClick = false;
   this.bindPreCourtEligibleCustomers(this.p, false);
  }
}
