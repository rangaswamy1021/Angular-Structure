
import { CommonService } from './../../shared/services/common.service';
import { Component, OnInit,AfterViewInit, ViewChild } from '@angular/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { IContractResponse } from "./models/contractresponse";
import { IContractRequest } from "./models/contractrequest";
import { ContractService } from "./services/contract.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { LookupTypeCodes, ActivitySource, Actions, Features } from "../../shared/constants";
import { DocumentdetailsService } from "../../csc/documents/services/documents.details.service";
import { CustomDateTimeFormatPipe } from "../../shared/pipes/convert-datetime.pipe";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IUserEvents } from "../../shared/models/userevents";
import { SuccessFailureAlertsMessageComponent } from "../../shared/success-failure-alerts-message.component";
import { MaterialscriptService } from "../../shared/materialscript.service";

declare var $: any;
@Component({
  selector: 'app-add-contract',
  templateUrl: './add-contract.component.html',
  styleUrls: ['./add-contract.component.scss']
})
export class AddContractComponent implements OnInit {
  gridArrowContractNumber: boolean;
  gridArrowContractName: boolean;
  sortingDirection: boolean;
  gridArrowVendorName: boolean;
  sortingColumn: string;
  pdffDisableButton: boolean;
  viewPdfButton: boolean;
  cancelDisableButton: boolean;
  searchDisableButton: boolean;
  updateDisableButton: boolean;
  disableButton: boolean;
  sessionContextResponse: IUserresponse;
  isSearchClicked: boolean;
  oldFileUploadPath: any;
  errorMessageAttachmentFile: string;

  @ViewChild('upload') upload;
  checkContractNumber: boolean = true;
  addRequest: IContractRequest = <IContractRequest>{};
  isEdit = false;
  editVendorNames: any;
  contractId: number;
  purchaseStatus: boolean;
  editRequest: IContractRequest = <IContractRequest>{};
  operationSuccessStatus = false;
  contractUploadedFullPath: string;
  contractUploadedPath: string;
  isContractFileUploaded = false;
  fileMaxSize: number;
  fileSize = false;
  fileType = false;
  warrantyStatus = false;
  UserId: number;
  getContractRequest: IContractRequest = <IContractRequest>{};
  getContractResponse: IContractResponse[];
  contractSearchForm: FormGroup;

  // success and error block
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;


  newContractForm: FormGroup;
  validatePattern = "[a-zA-Z0-9]+";
  validateNamePattern = "[a-zA-Z][a-zA-Z0-9 ]*";
  documentLinked: any;
  vendorNames: IContractResponse[];
  contractHeading: string;
  editDivButtons: boolean;
  addDivButtons: boolean;
  userEvents = <IUserEvents>{};

  constructor(private contractService: ContractService,
    private commonService: CommonService,
    private documentdetailsService: DocumentdetailsService,
    private context: SessionService,
    private materialscriptService: MaterialscriptService,
    private router: Router) {
  }

  pageNumber: number;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  AfterSearch: boolean = false;

  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getContractDetails("", this.pageNumber, null);
  }

  ngOnInit() {
    this.gridArrowContractNumber = true;
    this.sortingColumn = "ContractNumber";
    this.materialscriptService.material();
    this.sessionContextResponse = this.context.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.pageNumber = 1;
    this.endItemNumber = 10;
    this.documentdetailsService.currentDetails.subscribe(documentdetailsService => {
      this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
        .subscribe(res => { this.documentLinked = res; },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';

          return;
        });
      this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
        .subscribe(res => { this.fileMaxSize = res; },
        (err) => {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = err.statusText.toString();
          this.msgTitle = '';

          return;
        });
    });



    this.contractSearchForm = new FormGroup({
      'ContractNumber': new FormControl(''),
      'ContractName': new FormControl(''),
      'ContractStatus': new FormControl('2')
    });
    this.newContractForm = new FormGroup({
      'ContractNumber': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validatePattern), Validators.minLength(1), Validators.maxLength(20)])),
      'ContractName': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateNamePattern), Validators.minLength(1), Validators.maxLength(50)])),
      'ContractStatus': new FormControl(),
      'Vendor': new FormControl('', [Validators.required]),
      'UploadContract': new FormControl(''),
    });
    this.getUserEvents();
    this.getContractDetails("View", this.pageNumber, this.userEvents);
    this.getVendorNames();
    this.disableButton = !this.commonService.isAllowed(Features[Features.CONTRACT], Actions[Actions.CREATE], "");
    this.updateDisableButton = !this.commonService.isAllowed(Features[Features.CONTRACT], Actions[Actions.UPDATE], "");
    this.cancelDisableButton = !this.commonService.isAllowed(Features[Features.CONTRACT], Actions[Actions.DELETE], "");
    this.searchDisableButton = !this.commonService.isAllowed(Features[Features.CONTRACT], Actions[Actions.SEARCH], "");
    this.pdffDisableButton = !this.commonService.isAllowed(Features[Features.CONTRACT], Actions[Actions.VIEWPDF], "");
  }

  addNewContract() {
    // if (this.isSearchClicked)
    // this.searchFormReset();
    //  else{
    this.contractSearchForm.controls['ContractNumber'].setValue('');
    this.contractSearchForm.controls['ContractName'].setValue('');
    this.contractSearchForm.controls['ContractStatus'].setValue('2');
    this.contractSearchForm.controls["ContractNumber"].reset();
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);
    // } 
    this.newContractForm.controls.ContractStatus.clearValidators();
    this.isContractFileUploaded = false;
    this.addDivButtons = true;
    this.isEdit = true;
    this.contractHeading = "Add";
    this.editDivButtons = false;
    this.editVendorNames = this.vendorNames;
    this.newContractForm.reset();
    this.newContractForm.controls["ContractNumber"].setValue("");
    this.newContractForm.controls["ContractName"].setValue("");
    this.newContractForm.controls["Vendor"].setValue("");
    this.newContractForm.controls["UploadContract"].setValue("");
this.materialscriptService.material();
  }

  getContractDetails(search: string, pageNumber: number, userEvents: IUserEvents) {
    if (search == "View") {
      this.getContractRequest.ContractNumber = '';
      this.getContractRequest.ContractName = '';
      this.getContractRequest.ContractStatus = 2;
      this.getContractRequest.SearchFlag = "VIEW";

    }
    else if (search == "Search") {
      let contractNumber = this.contractSearchForm.controls['ContractNumber'].value;
      if (contractNumber != null && contractNumber != "")
        this.getContractRequest.ContractNumber = contractNumber.trim();
      else
        this.getContractRequest.ContractNumber = contractNumber;
      let contractName = this.contractSearchForm.controls['ContractName'].value;
      if (contractName != "" && contractName != null)
        this.getContractRequest.ContractName = contractName.trim();
      else
        this.getContractRequest.ContractName = contractName;
      this.getContractRequest.ContractStatus = parseInt(this.contractSearchForm.controls['ContractStatus'].value);
      this.getContractRequest.SearchFlag = "SEARCH";
    }
    this.getContractRequest.User = this.context.customerContext.userName;
    this.getContractRequest.UserId = this.context.customerContext.userId;
    this.getContractRequest.LoginId = this.context.customerContext.loginId;
    this.getContractRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.getContractRequest.PageNumber = pageNumber;
    this.getContractRequest.PageSize = 10;
    this.getContractRequest.SortColumn = this.sortingColumn;
    this.getContractRequest.SortDirection = this.sortingDirection == true ? true : false;

    this.contractService.getContractDetails(this.getContractRequest, userEvents).subscribe(
      res => {
        this.getContractResponse = res;
        this.AfterSearch = true;
        if (res.length > 0) {
          this.totalRecordCount = this.getContractResponse[0].RecCount;
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
      }
    );
  }
  searchContract() {
    this.isSearchClicked = true;
    this.endItemNumber = 10;
    this.isEdit = false;
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);
    this.contractSearchForm.controls["ContractNumber"].updateValueAndValidity();
    if ((this.contractSearchForm.controls['ContractNumber'].value == "" || this.contractSearchForm.controls['ContractNumber'].value == null) && (this.contractSearchForm.controls['ContractName'].value == "" || this.contractSearchForm.controls['ContractName'].value == null)
      && (this.contractSearchForm.controls['ContractStatus'].value == "2")) {

      this.validateAllFormFields(this.contractSearchForm);

    }
    else {
      let contractName = this.contractSearchForm.controls['ContractName'].value;
      let contractNumber = this.contractSearchForm.controls['ContractNumber'].value;
      let contractStatus = this.contractSearchForm.controls['ContractStatus'].value;
      this.contractSearchForm.reset();
      this.contractSearchForm.controls['ContractNumber'].setValue(contractNumber);
      this.contractSearchForm.controls['ContractName'].setValue(contractName);
      this.contractSearchForm.controls['ContractStatus'].setValue(contractStatus);
      this.userEvents.ActionName = Actions[Actions.SEARCH];
      this.getContractDetails("Search", 1, this.userEvents);
    }


  }
  searchFormReset() {

    this.isSearchClicked = false;
    this.isEdit = false;
    this.startItemNumber = 1;
    this.endItemNumber = 10;
    this.pageNumber = 1;
    this.contractSearchForm.controls['ContractNumber'].setValue('');
    this.contractSearchForm.controls['ContractName'].setValue('');
    this.contractSearchForm.controls['ContractStatus'].setValue('2');
    this.contractSearchForm.controls["ContractNumber"].reset();
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);
    this.endItemNumber = 10;
    this.getContractDetails("View", 1, null);
  }



  btnAddContract() {
    this.contractSearchForm.controls['ContractNumber'].setValue('');
    this.contractSearchForm.controls['ContractName'].setValue('');
    this.contractSearchForm.controls['ContractStatus'].setValue('2');
    this.contractSearchForm.controls["ContractNumber"].reset();
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);
    this.newContractForm.controls["ContractStatus"].clearValidators();
    this.addContract(this.contractUploadedPath);
  }
  addContract(filepath: any) {
    if (this.newContractForm.invalid) {
      this.validateAllFormFields(this.newContractForm);
    }
    else {
      this.addRequest.ContractNumber = this.newContractForm.controls['ContractNumber'].value;
      this.addRequest.ContractName = this.newContractForm.controls['ContractName'].value;
      this.addRequest.ContractStatus = 1;
      this.addRequest.VendorId = this.newContractForm.controls['Vendor'].value;
      this.addRequest.UploadContract = filepath;
      this.addRequest.User = this.context.customerContext.userName;
      this.addRequest.CreatedUser = this.context.customerContext.userName;
      this.addRequest.UserId = this.context.customerContext.userId;
      this.addRequest.LoginId = this.context.customerContext.loginId;
      this.addRequest.ActivitySource = ActivitySource[ActivitySource.Internal];

      if (this.newContractForm.valid && this.checkContractNumber == true) {
        if (this.fileSize == false && this.fileType == false) {
          this.userEvents.ActionName = Actions[Actions.CREATE];
          this.contractService.addContractDetails(this.addRequest, this.userEvents).subscribe(
            res => {
              this.getContractResponse = res;
              this.operationSuccessStatus = true;
              this.msgType = 'success';
              this.msgFlag = true;
              this.msgDesc = "Contract details has been added successfully.";
              this.msgTitle = '';
              this.getContractDetails("View", this.pageNumber, null);
              this.newContractForm.reset();
              this.checkContractNumber = true;
              this.newContractForm.controls['Vendor'].setValue("");
              this.isEdit = false;
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

          if (this.fileSize == true) {

            this.errorMessageAttachmentFile = 'File size exceeded more than ' + this.fileMaxSize + ' MB';
          }
          else if (this.fileType == true) {
            this.msgType = 'error';
            this.msgFlag = true;
            this.msgDesc = 'Upload pdf files only';
            this.msgTitle = '';
          }

        }

      }
      else {
        if (this.checkContractNumber) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Form Is Invalid";
          this.msgTitle = '';
          this.validateAllFormFields(this.newContractForm);
        }
        else {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Contract # is already Exists";
          this.msgTitle = '';
          this.checkContractNumber = true;

        }
      }
    }
  }
  btneditContract(User) {
    this.contractSearchForm.controls['ContractNumber'].setValue('');
    this.contractSearchForm.controls['ContractName'].setValue('');
    this.contractSearchForm.controls['ContractStatus'].setValue('2');
    this.contractSearchForm.controls["ContractNumber"].reset();
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);
    this.purchaseStatus = this.getActivePurchaseOrders(User.ContractId, User);
    
  }
  editContract(User) {
    if (this.purchaseStatus && this.warrantyStatus) {
      this.newContractForm.controls.ContractStatus.setValidators([Validators.required]);
      this.fileSize = false;
      this.fileType = false;
      this.isContractFileUploaded = false;
      this.contractHeading = "Edit";
      this.editDivButtons = true;
      this.addDivButtons = false;
      this.isEdit = true;
      this.editVendorNames = this.vendorNames;
      this.contractId = User.ContractId;
      this.oldFileUploadPath = User.UploadContract;
      this.newContractForm.controls['ContractNumber'].setValue(User.ContractNumber);
      this.newContractForm.controls['ContractName'].setValue(User.ContractName);
      this.newContractForm.controls['ContractStatus'].setValue(User.ContractStatus);
      this.newContractForm.controls['Vendor'].setValue(User.VendorId);
      this.newContractForm.controls['UploadContract'].setValue("");
      this.materialscriptService.material();
    }

  }
  cancelEditContract() {
    this.newContractForm.reset();
    this.fileSize = false;
    this.isEdit = false;
    this.isContractFileUploaded = false;
    this.checkContractNumber = true;
    this.contractUploadedPath = "";
  }
  editFormReset() {
    this.newContractForm.reset();
    this.fileSize = false;
    this.checkContractNumber = true;
    this.contractUploadedPath = "";
    this.newContractForm.controls['ContractName'].setValue("");
    this.newContractForm.controls['ContractStatus'].setValue("");
    this.newContractForm.controls['Vendor'].setValue("");
    this.isContractFileUploaded = false;
  }
  getVendorNames() {
    this.contractService.getVendorNames().subscribe(
      res => {
        this.vendorNames = res;
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
  uploadClickContract() {
    this.fileSize = false;
    this.fileType = false;
    if (this.upload.nativeElement.files[0]) {
      let file: File = this.upload.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));
      if (type == ".pdf") {
        if (file.size / 1048576 < this.fileMaxSize) {
          let formData = new FormData();
          formData.append('upload', file);
          this.contractService.uploadFile(formData)
            .subscribe(
            data => {
              this.contractUploadedPath = data;
              this.isContractFileUploaded = true;

              this.contractUploadedFullPath = this.documentLinked + this.contractUploadedPath;

            });
        } else {
          this.fileSize = true;

          this.errorMessageAttachmentFile = 'File size exceeded more than ' + this.fileMaxSize + ' MB';

        }
      }
      else {
        this.fileType = true;
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = 'Upload pdf files only';
        this.msgTitle = '';

      }
    }
    else {
      this.msgType = 'error';
      this.msgFlag = true;
      this.msgDesc = 'Select pdf file to upload';
      this.msgTitle = '';
    }
  }

  removePdfFile() {
    this.isContractFileUploaded = false;
    this.contractUploadedPath = "";
    this.newContractForm.controls['UploadContract'].setValue("");
  }

  DeleteClick(UserId) {

    this.contractSearchForm.controls['ContractNumber'].setValue('');
    this.contractSearchForm.controls['ContractName'].setValue('');
    this.contractSearchForm.controls['ContractStatus'].setValue('2');
    this.contractSearchForm.controls["ContractNumber"].reset();
    this.contractSearchForm.controls["ContractNumber"].setValidators(Validators.required);

    this.UserId = UserId;
    this.getActivePurchaseOrders(this.UserId, null);
  }
  btnYesClick(event) {
    if (event) {
      this.getContractRequest.ContractId = this.UserId;
      this.getContractRequest.FeaturesCode = '';
      this.getContractRequest.ActionCode = '';
      this.getContractRequest.LoginId = this.context.customerContext.loginId;
      this.getContractRequest.KeyValue = 'View';
      this.getContractRequest.User = this.context.customerContext.userName;
      this.getContractRequest.UpdatedUser = this.context.customerContext.userName;

      if (this.purchaseStatus) {
        if (this.warrantyStatus) {
          this.userEvents.ActionName = Actions[Actions.DELETE];
          this.contractService.deleteContractData(this.getContractRequest, this.userEvents).subscribe(
            data => {
              if (data) {
                this.operationSuccessStatus = true;
                this.msgType = 'success';
                this.msgFlag = true;
                this.msgDesc = "Contract details has been deleted successfully";
                this.msgTitle = '';
                this.getContractDetails("", this.pageNumber, null);
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

      }

    }
    else {
      this.msgFlag = false;
    }
  }




  btnUpdateContract() {
    if (this.warrantyStatus && this.purchaseStatus) {
      if (this.fileSize == true) {
        this.errorMessageAttachmentFile = "File size exceeded more than " + this.fileMaxSize + " MB";
      }
      else {
        if (this.fileType == true) {
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = 'Upload pdf files only';
          this.msgTitle = '';
          return;
        }
        else if (this.newContractForm.valid)
          this.updateContract(this.contractUploadedPath);
        else
          this.validateAllFormFields(this.newContractForm);
      }
    }

  }
  updateContract(filepath: any) {
    this.isEdit = false;
    this.editRequest.ContractNumber = this.newContractForm.controls['ContractNumber'].value;
    this.editRequest.ContractName = this.newContractForm.controls['ContractName'].value;
    this.editRequest.ContractStatus = this.newContractForm.controls['ContractStatus'].value;
    this.editRequest.VendorId = this.newContractForm.controls['Vendor'].value;
    if (filepath == "" || filepath == null) {
      this.editRequest.UploadContract = this.oldFileUploadPath;
    }
    else
      this.editRequest.UploadContract = filepath;
    this.editRequest.ContractId = this.contractId;
    this.editRequest.User = this.context.customerContext.userName;
    this.editRequest.UpdatedUser = this.context.customerContext.userName;
    this.editRequest.UserId = this.context.customerContext.userId;
    this.editRequest.LoginId = this.context.customerContext.loginId;
    this.editRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.userEvents.ActionName = Actions[Actions.UPDATE];
    this.contractService.updateContractData(this.editRequest, this.userEvents).subscribe(
      res => {
        if (res) {
          this.operationSuccessStatus = true;
          this.msgType = 'success';
          this.msgFlag = true;
          this.msgDesc = "Contract details has been updated successfully";
          this.msgTitle = '';
          this.getContractDetails("", this.pageNumber, null);
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

  checkContract(name: any) {
    this.contractService.checkContractName(name).subscribe(
      res => {
        this.checkContractNumber = res;
      },
      (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
  }


  getActivePurchaseOrders(contractId, User): boolean {
    let status;
    this.purchaseStatus = false;
    this.contractService.getActivePos(contractId).subscribe(
      res => {
        let type;
        if (User != "" && User != null)
          type = "update";
        else
          type = "delete";
        if (res == null || res == 0) {
          this.purchaseStatus = true;
          this.getWarrantyDetails(contractId, User);
        }
        else {
          this.purchaseStatus = false;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Purchase order is associated with this contract. You can not " + type + " this contract.";
          this.msgTitle = '';
          return;
        }
      }
      , (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';
        return;
      });
    return this.purchaseStatus;
  }


  getWarrantyDetails(contractId, User): boolean {
    this.warrantyStatus = false;
    this.contractService.getWarrantyDetails(contractId).subscribe(
      res => {
        let type;
        if (User != null)
          type = "update";
        else
          type = "delete";
        if (res.length == 0) {
          this.warrantyStatus = true;
          if (User != "" && User != null)
            this.editContract(User);
          else {
            this.msgType = 'alert';
            this.msgFlag = true;
            this.msgDesc = "Are you sure you want to Delete Contract ?";
            this.msgTitle = 'Alert';
          }
        }
        else {

          this.warrantyStatus = false;
          this.msgType = 'error';
          this.msgFlag = true;
          this.msgDesc = "Warranty is associated with this contract. You can not " + type + " this contract.";
          this.msgTitle = '';
          return;
        }
      }, (err) => {
        this.msgType = 'error';
        this.msgFlag = true;
        this.msgDesc = err.statusText.toString();
        this.msgTitle = '';

        return;
      });
    return this.warrantyStatus;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) { }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getUserEvents() {
    this.userEvents.FeatureName = Features[Features.CONTRACT];
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

  sortDirection(SortingColumn) {
    this.gridArrowContractNumber = false;
    this.gridArrowContractName = false;
    this.gridArrowVendorName = false;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "ContractNumber") {
      this.gridArrowContractNumber = true;
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
    
    else if (this.sortingColumn == "VendorName") {
      this.gridArrowVendorName = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    } 
    if(this.isSearchClicked){
       this.getContractDetails("Search", 1,null);
    }
    else
    this.getContractDetails("View", this.pageNumber, null);
  }
}