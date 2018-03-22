import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { IWarrantRequest } from "./models/warrantyrequest";
import { IWarrantyResponse } from "./models/warrantyresponse";
import { WarrantyService } from "./services/warranty.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions } from "../../shared/constants";
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ICommonResponse } from "../../shared/models/commonresponse";
import { List } from "linqts/dist/linq";
import { AddAddressComponent } from "../../shared/address/add-address.component";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-search-warranty',
  templateUrl: './search-warranty.component.html',
  styleUrls: ['./search-warranty.component.scss']
})
export class SearchWarrantyComponent implements OnInit {
  gridArrowWARRANTYDESC: boolean;
  gridArrowContractName: boolean;
  gridArrowWARRANTYINMONTHS: boolean;
  gridArrowWARRANTYTYPENAME: boolean;
  sortingDirection: boolean;
  sortingColumn: string;
  gridArrowWARRANTYNAME: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  msgTitle: string;
  Action: string;
  disableDeleteButton: boolean;
  warrantyUserEvent: IUserEvents;
  disableUpdateButton: boolean;
  disableAddButton: boolean;
  disableSearchButton: boolean;
  WarrantyForm: FormGroup;
  newWarrantyForm: FormGroup;

  editContract: any;
  contractCount: number = 0;
  warrantyHeading: any;
  addDivButtons: boolean;
  editDivButtons: boolean;
  modalShow: boolean = false;
  AddWarrantyButtonShow: boolean = true;
  ManageWarrantyDiv: boolean = false;
  searchCheck: boolean = false;


  searchGrid: boolean;
  getPageSize: number;

  userId: number;
  loginId: number;
  poCount: number;
  warrantyId: number;
  descLength: number = 128;

  userName: string;
  warrantyAvailable: string;

  warrantyNameMessage: string;

  warrantyRequest: IWarrantRequest = <IWarrantRequest>{};
  warrantyResponse: IWarrantyResponse[];
  warrantyResponseRecordCount: IWarrantyResponse[];
  checkResponse: IWarrantyResponse[];
  sessionContextResponse: IUserresponse;
  warrantyTypeDropdownValues: ICommonResponse[];
  warrantyResponseEdit: IWarrantyResponse[];
  warrantyRequestEdit: IWarrantRequest = <IWarrantRequest>{};

  // sortDirection: boolean;
  sortColumn: any;
  addResetButton: boolean;

  pageItemNumber: number = 10;
  currentPage: number = 1;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;
  validatePattern = "[^< ][^<]*";
  validateDurationPattern = "^((?:[1-9][0-9]*)(?:\.[0-9]+)?)$";
  alphanumericSpace = "[a-zA-Z0-9][a-zA-Z0-9 ]*";

  userEventRequest: IUserEvents = <IUserEvents>{};

  constructor(private warrantyService: WarrantyService, private commonService: CommonService, private router: Router, private sessionContext: SessionService, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.gridArrowWARRANTYNAME = true;
    this.sortingColumn = "WARRANTYNAME";
    this.materialscriptService.material();
    this.WarrantyForm = new FormGroup({
      'warrantyNameSearch': new FormControl('', [Validators.required]),
      'warrantyTypeSearch': new FormControl('')
    });
    this.newWarrantyForm = new FormGroup({
      'warrantyName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.alphanumericSpace), Validators.minLength(1), Validators.maxLength(50)])),
      'warrantyType': new FormControl('', [Validators.required]),
      'warrantyDuration': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateDurationPattern)])),
      'contract': new FormControl('', [Validators.required]),
      'warrantyDescription': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern), Validators.minLength(1), Validators.maxLength(128)])),

    });
    this.endItemNumber = 10;
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.userName = this.sessionContextResponse.userName;
    this.userId = this.sessionContextResponse.userId;
    this.loginId = this.sessionContextResponse.loginId;

    // if (!this.commonService.isAllowed(Features[Features.WARRANTY], Actions[Actions.VIEW], "")) {
    //   this.router.navigate(["/404"]);
    // }
    this.disableSearchButton = !(this.commonService.isAllowed(Features[Features.WARRANTY], Actions[Actions.SEARCH], ""));
    this.disableAddButton = !(this.commonService.isAllowed(Features[Features.WARRANTY], Actions[Actions.CREATE], ""));
    this.disableUpdateButton = !(this.commonService.isAllowed(Features[Features.WARRANTY], Actions[Actions.UPDATE], ""));
    this.disableDeleteButton = !(this.commonService.isAllowed(Features[Features.WARRANTY], Actions[Actions.DELETE], ""));
    this.searchWarranty("onLoad");
    this.getWarrantyTypes();
    this.ContractDropdown();
  }

  pageChanged(event) {
   
    this.currentPage = event;
    this.startItemNumber = (((this.currentPage) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.currentPage) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
      this.Action = "PAGE";
    this.searchWarrantyDetails(this.currentPage, null);
  }

  getWarrantyTypes() {
    this.warrantyService.warrantyTypeDropdownsData().subscribe(
      res => {
        this.warrantyTypeDropdownValues = res;
      }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
  }

  ContractDropdown() {
    this.warrantyRequestEdit.ContractStatus = 1;
    this.warrantyRequestEdit.PageNumber = 0;
    this.warrantyService.contractDropdown(this.warrantyRequestEdit).subscribe(
      res => {
        this.warrantyResponseEdit = res;
        this.getPageSize = this.warrantyResponseEdit.length;
        this.getwarrantyDetails();
      }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
  }


  getwarrantyDetails() {
    this.warrantyRequest.WarrantyName = this.WarrantyForm.controls['warrantyNameSearch'].value;
    this.warrantyRequest.WarrantyTypeId = this.WarrantyForm.controls['warrantyTypeSearch'].value;
    this.warrantyRequest.OnSearchClick = "SEARCH";
    this.warrantyRequest.User = this.userName;
    this.warrantyRequest.UserId = this.userId;
    this.warrantyRequest.LoginId = this.loginId;
    this.warrantyRequest.ActivitySource = ActivitySource.Internal.toString();
    this.warrantyRequest.PageNumber = 1;
    this.warrantyRequest.PageSize = this.getPageSize;
    this.warrantyRequest.SortColumn = this.sortingColumn;
    this.warrantyRequest.SortDirection = this.sortingDirection == true ? true : false;
    this.warrantyService.getWarrantyDetails(this.warrantyRequest, null).subscribe(
      res => {
        if (res) {
          this.searchCheck = false;
          this.warrantyResponseRecordCount = res;
        }
      }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
  }

  searchWarranty(search: string) {
    this.currentPage = 1;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    if (search == "onSearch") {
      if ((this.WarrantyForm.controls['warrantyNameSearch'].value == "" || this.WarrantyForm.controls['warrantyNameSearch'].value == null) &&
        (this.WarrantyForm.controls['warrantyTypeSearch'].value == "" || this.WarrantyForm.controls['warrantyTypeSearch'].value == null)) {
     
        this.validateAllFormFields(this.WarrantyForm);
        return;
      }
      else {
        if (this.WarrantyForm.controls['warrantyNameSearch'].value == "" ||
          this.WarrantyForm.controls['warrantyNameSearch'].value == null)
          this.WarrantyForm.controls.warrantyNameSearch.reset();
        this.Action = "SEARCH";
        let userevents = this.userEvents();
        userevents.ActionName = Actions[Actions.SEARCH];
        this.searchWarrantyDetails(this.currentPage, userevents);
      
      }
    }
    else if (search == "onLoad") {
      let userevents = this.userEvents();
      this.searchWarrantyDetails(this.currentPage, userevents);
    }
    else {
      this.searchWarrantyDetails(this.currentPage, null);
    }
  }

  searchWarrantyDetails(currentPage: number, userevents: IUserEvents) {
   if (this.Action == "SEARCH") {
      this.warrantyRequest.WarrantyName = this.WarrantyForm.controls['warrantyNameSearch'].value;
      if (this.warrantyRequest.WarrantyName != null && this.warrantyRequest.WarrantyName != "")
      this.warrantyRequest.WarrantyName = this.WarrantyForm.controls['warrantyNameSearch'].value.trim();
      this.warrantyRequest.WarrantyTypeId = this.WarrantyForm.controls['warrantyTypeSearch'].value;
      this.warrantyRequest.OnSearchClick = "SEARCH"; 
    }
    let warrantyName = this.warrantyRequest.WarrantyName;
    let typeId = this.warrantyRequest.WarrantyTypeId;
    if (this.Action == "PAGE") {
      this.warrantyRequest.WarrantyName = warrantyName;
      this.warrantyRequest.WarrantyTypeId = typeId;
      this.warrantyRequest.OnSearchClick = "SEARCH";
    }
    this.warrantyRequest.User = this.userName;
    this.warrantyRequest.UserId = this.userId;
    this.warrantyRequest.LoginId = this.loginId;
    this.warrantyRequest.ActivitySource = ActivitySource.Internal.toString();
    this.warrantyRequest.PageNumber = this.currentPage;
    this.warrantyRequest.PageSize = 10;
    this.warrantyRequest.SortColumn = this.sortingColumn;;
    this.warrantyRequest.SortDirection =  this.sortingDirection == true ? true : false;
    this.warrantyService.getWarrantyDetails(this.warrantyRequest, userevents).subscribe(
      res => {
        if (res) {
          this.warrantyResponse = res;
          this.searchCheck = false;
          this.searchGrid = true;
          this.totalRecordCount = this.warrantyResponse[0].RecCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
        else {
          this.searchGrid = false;
          this.searchCheck = true;
          this.warrantyResponse = <IWarrantyResponse[]>[];
        }

      }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
  }

  descEvent(event) {
    this.descLength = 128 - (event.target.value.length);
  }

  addWarranty() {
    this.materialscriptService.material();
    this.warrantyAvailable = "";
    this.ManageWarrantyDiv = true;
    this.warrantyHeading = "Add";
    this.AddWarrantyButtonShow = false;
    this.editDivButtons = false;
    this.addDivButtons = true;  
    this.addResetButton = true;
    this.newWarrantyForm.reset();
    this.newWarrantyForm.controls["warrantyName"].enable();
    this.newWarrantyForm.controls["warrantyType"].setValue("");
    this.newWarrantyForm.controls["contract"].setValue("");
    this.newWarrantyForm.patchValue({
      warrantyName: null,
      warrantyDuration: null,
      warrantyDescription: null,
    });
    this.descLength = 128;
  }
  cancelUpdateWarranty() {
    this.addNewFormReset();
    this.ManageWarrantyDiv = false;
    this.AddWarrantyButtonShow = true;
    this.warrantyAvailable = "";
  }


  checkWarranty() {
    this.warrantyNameMessage = "";
    this.warrantyAvailable = "";
    if (this.newWarrantyForm.controls['warrantyName'].valid) {
      let WarrantyName = this.newWarrantyForm.controls['warrantyName'].value;

      this.warrantyService.checkWarrantyExists(WarrantyName).subscribe(
        res => {
          this.checkResponse = res;
          if (res) {
            this.warrantyAvailable = "Available";
          }
          else {
            this.warrantyNameMessage = "Not available";
            this.newWarrantyForm.controls['warrantyName'].reset();
            this.newWarrantyForm.controls["warrantyType"].setValue("");
            this.newWarrantyForm.controls["contract"].setValue("");
          }
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
  }

  focusWarranty() {
    this.warrantyAvailable = "";
    this.warrantyNameMessage = "";
  }

  addNewWarranty() {
    if (this.newWarrantyForm.valid) {
      this.contractCount = 0;
      this.warrantyRequest.WarrantyName = this.newWarrantyForm.controls['warrantyName'].value;
      this.warrantyRequest.WarrantyTypeId = this.newWarrantyForm.controls['warrantyType'].value;
      this.warrantyRequest.WarrantyInMonths = this.newWarrantyForm.controls['warrantyDuration'].value;
      this.warrantyRequest.WarrantyDesc = this.newWarrantyForm.controls['warrantyDescription'].value;

      for (let contract = 0; contract < this.warrantyResponseRecordCount.length; contract++) {
        if (this.warrantyResponseRecordCount[contract].ContractId == this.newWarrantyForm.controls['contract'].value) {
          this.contractCount = this.contractCount + 1;
          this.msgType = 'error';
          this.msgFlag = true;
            this.msgTitle='';
          this.msgDesc = "Contract already associated with another warranty";
        }
      }
      if (this.searchCheck == true) {
        this.contractCount = 0;
      }

      if (this.contractCount == 0) {
        this.warrantyRequest.ContractId = this.newWarrantyForm.controls['contract'].value;
        this.warrantyRequest.User = this.userName;
        this.warrantyRequest.CreatedUser = this.userName;
        this.warrantyRequest.UserId = this.userId;
        this.warrantyRequest.LoginId = this.loginId;
        let userevents = this.userEvents();
        userevents.ActionName = Actions[Actions.CREATE];

        this.warrantyRequest.ActivitySource = ActivitySource.Internal.toString();
        this.warrantyService.addWarrantyDetails(this.warrantyRequest, userevents).subscribe(
          res => {
            if (res) {
              this.msgType = 'success';
              this.msgFlag = true;
                this.msgTitle='';
              this.msgDesc = "Warranty details has been added successfully."
              this.ManageWarrantyDiv = false;
              this.AddWarrantyButtonShow = true;
              this.getwarrantyDetails();
                this.searchWarranty("onLoad");
            }
            else {
              this.msgType = 'error';
              this.msgFlag = true;
                this.msgTitle='';
              this.msgDesc = "Adding Warranty Error while adding warranty";
              this.AddWarrantyButtonShow = true;
            }
          }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
      }
    }
    else {
      this.validateAllFormFields(this.newWarrantyForm);
    }
  }

  editWarrantyDetails(warranty) {
    this.warrantyNameMessage = "";
    this.warrantyAvailable = "";
    this.poCount = warranty.PoCount;
    this.addResetButton = false;
    if (this.poCount != 0) {
      this.ManageWarrantyDiv = false;
      if (!this.ManageWarrantyDiv) {
        this.AddWarrantyButtonShow = true;
        this.msgType = 'error';
        this.msgFlag = true;
          this.msgTitle='';
        this.msgDesc = "Purchase order is associated with this warranty. You can not update this warranty";
      }
      else {
        this.msgType = 'error';
        this.msgFlag = true;
          this.msgTitle='';
        this.msgDesc = "Purchase order is associated with this warranty. You can not update this warranty";
      }

    }
    else {
      this.warrantyHeading = "Update";
      this.ManageWarrantyDiv = true;
      this.AddWarrantyButtonShow = false;
      this.editDivButtons = true;
      this.addDivButtons = false;
   
      this.newWarrantyForm.controls["warrantyName"].disable();
      let warrantyType = warranty.WarrantyTypeId;
      this.warrantyId = warranty.WarrantyId;
      let list = new List<ICommonResponse>(this.newFunction());
      this.editContract = warranty.ContractId;
      let WarrantyTypeId = list.Where(x => x.LookUpTypeCodeDesc == warranty.WarrantyTypeId).Select(y => y.LookUpTypeCode).FirstOrDefault();
      this.newWarrantyForm.patchValue({
        warrantyName: warranty.WarrantyName,
        warrantyDuration: warranty.WarrantyInMonths,
        warrantyDescription: warranty.WarrantyDesc,
        contract: warranty.ContractId,
        warrantyType: WarrantyTypeId //warranty.WarrantyTypeId,
      });
      let description = this.newWarrantyForm.get('warrantyDescription').value;
      this.descLength = 128 - description.length;
      this.materialscriptService.material();
    }
  }
  private newFunction(): any {
    return this.warrantyTypeDropdownValues;
  }





  updateWarrantyDetails() {
    if (this.newWarrantyForm.valid) {
      this.contractCount = 0;
      this.warrantyRequest.WarrantyName = this.newWarrantyForm.controls['warrantyName'].value;
      this.warrantyRequest.WarrantyTypeId = this.newWarrantyForm.controls['warrantyType'].value;
      this.warrantyRequest.WarrantyInMonths = this.newWarrantyForm.controls['warrantyDuration'].value;
      this.warrantyRequest.WarrantyDesc = this.newWarrantyForm.controls['warrantyDescription'].value;
      for (let contract = 0; contract < this.warrantyResponseRecordCount.length; contract++) {
        if (this.warrantyResponseRecordCount[contract].ContractId == this.editContract) {
          this.warrantyRequest.ContractId = this.editContract;
        }
        else if (this.warrantyResponseRecordCount[contract] != this.editContract && this.warrantyResponseRecordCount[contract].ContractId == this.newWarrantyForm.controls['contract'].value) {
          this.contractCount = this.contractCount + 1;
          this.msgType = 'error';
          this.msgFlag = true;
            this.msgTitle='';
          this.msgDesc = "Contract already associated with another warranty";
        }
      }
      if (this.contractCount == 0) {
        this.warrantyRequest.ContractId = this.newWarrantyForm.controls['contract'].value;
        this.warrantyRequest.WarrantyId = this.warrantyId;
        this.warrantyRequest.UpdatedUser = this.userName;
        this.warrantyRequest.User = this.userName;
        this.warrantyRequest.UserId = this.userId;
        this.warrantyRequest.LoginId = this.loginId;
        this.warrantyRequest.ActivitySource = ActivitySource.Internal.toString();

        let userevents = this.userEvents();
        userevents.ActionName = Actions[Actions.UPDATE];

        this.warrantyService.updateWarrantyDetails(this.warrantyRequest, userevents).subscribe(
          res => {
            if (res) {
                this.msgType = 'success';
              this.msgFlag = true;
                this.msgTitle='';
              this.msgDesc =  "Warranty details has been updated successfully."
              this.ManageWarrantyDiv = false;
              this.AddWarrantyButtonShow = true;
              this.newWarrantyForm.reset();
              this.newWarrantyForm.controls['warrantyType'].setValue("");
              this.newWarrantyForm.controls['contract'].setValue("");
               // this.searchWarranty("VIEW");
                this.warrantyResponse = res;
            this.getwarrantyDetails();
           this.searchWarranty("onLoad");
            }
            else {
              this.msgType = 'error';
              this.msgFlag = true;
                this.msgTitle='';
              this.msgDesc = " Update Warranty Error while updating warranty";
            }
          }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
      }
    }
    else {
      this.validateAllFormFields(this.newWarrantyForm);
    }
  }


  deleteClick(warranty) {
    this.modalShow = false;
    this.ManageWarrantyDiv = false;
    this.AddWarrantyButtonShow = true;
    this.poCount = warranty.PoCount;
    if (this.poCount != 0) {
      this.msgType = 'error';
      this.msgFlag = true;
        this.msgTitle='';
      this.msgDesc = "Purchase order is associated with this warranty. You can not delete this warranty.";
    } else {
      this.AddWarrantyButtonShow = true;
      this.msgType = 'alert';
      this.msgFlag = true;
        this.msgTitle='';
      this.msgDesc = "Are you sure you want to delete ?";
      this.warrantyId = warranty.WarrantyId;
    }
  }


  deleteWarrantyDetails(event) {
    if (event) {
      this.warrantyRequest.User = this.userName;
      this.warrantyRequest.UpdatedUser = this.userName;
      this.warrantyRequest.UserId = this.userId;
      this.warrantyRequest.LoginId = this.loginId;
      this.warrantyRequest.ActivitySource = ActivitySource.Internal.toString();
      this.warrantyRequest.PageNumber = 1;
      this.warrantyRequest.WarrantyId = this.warrantyId;
      let userevents = this.userEvents();
      userevents.ActionName = Actions[Actions.DELETE];
      this.warrantyService.deleteWarrantyDetails(this.warrantyRequest, userevents).subscribe(
        res => {
          if (res) {
            this.msgType = 'success';
            this.msgFlag = true;
              this.msgTitle='';
            this.msgDesc = "Warranty details has been deleted successfully."
            this.warrantyResponse = res;
           this.searchWarranty("VIEW");
           // this.searchWarrantyDetails(this.currentPage, null)
            this.getwarrantyDetails();
          }
          else {
            this.msgType = 'error';
            this.msgFlag = true;
              this.msgTitle='';
            this.msgDesc = "Delete Warranty Error while deleting warranty.";
          }
        }, (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';
          return;
        });
    }
    else {
      this.msgFlag = false;
    }
  }
  searchResetData() {
    this.currentPage = 1;
    this.endItemNumber = 10;
    this.WarrantyForm.reset();
    this.searchWarranty("VIEW");
    this.getwarrantyDetails();
  }

  addNewFormReset() {
    this.newWarrantyForm.reset();
    this.warrantyAvailable = "";
    this.warrantyNameMessage = "";
    this.descLength = 128;
    this.newWarrantyForm.reset();
    this.newWarrantyForm.controls['warrantyType'].setValue("");
    this.newWarrantyForm.controls['contract'].setValue("");
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

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.WARRANTY];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    this.userEventRequest.UserName = this.sessionContext.customerContext.userName;
    this.userEventRequest.LoginId = this.sessionContext.customerContext.loginId;
    return this.userEventRequest;
  }
  setOutputFlag(e) {
    this.msgFlag = e;
  }
  
  sortDirection(SortingColumn) {
    this.gridArrowWARRANTYNAME = false;
    this.gridArrowWARRANTYTYPENAME = false;
    this.gridArrowWARRANTYINMONTHS = false;
    this.gridArrowContractName = false;
    this.gridArrowWARRANTYDESC = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "WARRANTYNAME") {
      this.gridArrowWARRANTYNAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    else if (this.sortingColumn == "WARRANTYTYPENAME") {
      this.gridArrowWARRANTYTYPENAME = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }
    
    else if (this.sortingColumn == "WARRANTYINMONTHS") {
      this.gridArrowWARRANTYINMONTHS = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "ContractName") {
      this.gridArrowContractName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    else if (this.sortingColumn == "WARRANTYDESC") {
      this.gridArrowWARRANTYDESC = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    
    this.searchWarrantyDetails(this.currentPage, null);
  }


}
