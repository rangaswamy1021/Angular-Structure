import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions, LookupTypeCodes, ActivitySource, SubSystem, TollType, AdjustmentCategory } from "../../shared/constants";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../../shared/services/common.service";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { SessionService } from "../../shared/services/session.service";
import { ICommonResponse } from "../../shared/models/commonresponse";
import { CustomerContextService } from "../../shared/services/customer.context.service";
import { ITripsContextResponse } from "../../shared/models/tripscontextresponse";
import { IUserresponse } from "../../shared/models/userresponse";
import { ICustomerContextResponse } from "../../shared/models/customercontextresponse";
import { DisputesService } from "../../tvc/disputes/services/disputes.service";
import { IAttachmentRequest } from "../../shared/models/attachmentrequest";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { IAccountAdjustmentRequest } from "./models/accountadjustmentrequest";
import { CustomerDetailsService } from "./services/customerdetails.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-dispute-transaction',
  templateUrl: './dispute-transaction.component.html',
  styleUrls: ['./dispute-transaction.component.scss']
})
export class DisputeTransactionComponent implements OnInit {
  nonLiabilityReasons: ICommonResponse[];
  // nonLiabilityReasons: {
  //   Key: string;
  //   Value: string;
  // }[];
  disputeTransactionType: string;
  disableDisputeButton: boolean = false;
  resp: any;
  reasonCode: any;
  invalidDate: boolean;
  viewPath: string;
  uploadMandatory: boolean;
  isUpload: boolean;
  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  fileMaxSize: number;
  disableButton: boolean;
  customerTripIds: string = "";
  transactionactivitieslink = ['/csc/customerdetails/transaction-activities/'];
  tripContextResponse: ITripsContextResponse;
  accountStatus: string;
  accountId: number;
  // nonLiabilityReasons: ICommonResponse[];
  lookupType: ICommonResponse;
  sessionContextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  disputeTransaction: FormGroup;
  statusValue: number = 0;
  radioStatus = [
    {
      id: 0,
      Value: 'Valid'
    },
    {
      id: 1,
      Value: 'Invalid'
    }
  ];
  @ViewChild('cmpFile') cmpFile;

  iAccountAdjustment: IAccountAdjustmentRequest = <IAccountAdjustmentRequest>{};

  constructor(private commonService: CommonService, private router: Router, private activatedroute: ActivatedRoute,
    private sessionContext: SessionService, private tripContextService: TripsContextService, private customerContextService: CustomerContextService, private disputesService: DisputesService, private customerDetailsService: CustomerDetailsService,
    private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.msgFlag;
    this.msgType;
    this.msgTitle;
    this.msgDesc;
    this.disputeTransaction = new FormGroup({
      'disputeTransactionType': new FormControl('', [Validators.required]),
      'comments': new FormControl('', [Validators.required]),
      'cmpFile': new FormControl('')
    });
    this.isUpload = true;
    // this.nonLiabilityReasons = [{
    //   Key: "Stolen",
    //   Value: "Stolen Vehicle"
    // }, {
    //   Key: "Duplicate",
    //   Value: "Trip Duplicate"
    // }, {
    //   Key: "Wrongplate",
    //   Value: "Wrong Plate Affidavit"
    // }];

    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }

    this.customerContextService.currentContext
      .subscribe(customerContext => {
        if (customerContext) {
          this.customerContextResponse = customerContext;
          this.accountId = this.customerContextResponse.AccountId;
          this.accountStatus = this.customerContextResponse.AccountStatus
        } else {
          let link = ['/csc/search/advance-csc-search/'];
          this.router.navigate(link);
        }

      });
    this.getLookUpByParentLookupTypeCode();
    this.disableDisputeButton = !this.commonService.isAllowed(Features[Features.DISPUTETRANSACTION], Actions[Actions.CREATE], "");

    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
      .subscribe(res => { this.viewPath = res; });
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
      .subscribe(res => { this.fileMaxSize = res; });


    this.tripContextService.currentContext.subscribe(customerContext => this.tripContextResponse = customerContext);
    if (this.tripContextResponse) {
      if (!this.tripContextResponse.tripIDs || this.tripContextResponse.tripIDs.length <= 0) {
        this.router.navigate(this.transactionactivitieslink);
      }
      // //console.log"tripContextResponse: ", this.tripContextResponse);
    }
    else
      this.router.navigate(this.transactionactivitieslink);
    for (let i = 0; i < this.tripContextResponse.tripIDs.length; i++) {
      this.customerTripIds = this.customerTripIds.concat(this.tripContextResponse.tripIDs[i].toString());
      if (i < this.tripContextResponse.tripIDs.length - 1)
        this.customerTripIds = this.customerTripIds.concat(",");
    }
    //console.log"customerTripIds: ", this.customerTripIds);
  }

  onReasonCodeChange(event) {
    //console.log"nonLiabilityReason: ", event.target.value);
    this.reasonCode = event.target.value;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  submitDisputeRequest() {
    if (this.statusValue === 0) { // Valid 
      if (this.disputeTransaction.invalid) {
        this.validateAllFormFields(this.disputeTransaction);
      } else {
        this.validTripDisputes();
      }
    } else {
      if (this.disputeTransaction.invalid) {  // Invalid
        this.validateAllFormFields(this.disputeTransaction);
      } else {
        this.inValidTripDisputes();
      }
    }
  }

  inValidTripDisputes() {
    //console.log"test Data: ", this.resp);
    this.iAccountAdjustment.SystemActivity = <ISystemActivities>{};
    this.iAccountAdjustment.SystemActivity.LoginId = this.sessionContextResponse.loginId;
    this.iAccountAdjustment.SystemActivity.UserId = this.sessionContextResponse.userId;
    this.iAccountAdjustment.SystemActivity.User = this.sessionContextResponse.userName;
    this.iAccountAdjustment.SystemActivity.IsViewed = true;
    this.iAccountAdjustment.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.iAccountAdjustment.CustTripIdCSV = this.customerTripIds;
    if (this.resp)
      this.iAccountAdjustment.CSVRewardIds = this.resp.FilePath;
    else
      this.iAccountAdjustment.CSVRewardIds = "";
    this.iAccountAdjustment.User = "tpSuperUser";
    this.iAccountAdjustment.CustomerId = this.accountId;
    this.iAccountAdjustment.ReasonCode = this.reasonCode;
    this.iAccountAdjustment.SubSystem = SubSystem[SubSystem.CSC];
    this.iAccountAdjustment.AdjustmentDate = new Date(Date.now());
    this.iAccountAdjustment.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.iAccountAdjustment.Description = this.disputeTransaction.controls['comments'].value;
    //console.log"iAccountAdjustment: ", this.iAccountAdjustment);
    this.customerDetailsService.inValidTripDisputes(this.iAccountAdjustment).subscribe(res => {
      // this.msgType = "success";
      // this.msgDesc = "Success!!!" + res;
      // this.msgFlag = true;
      // this.msgTitle = "";
      // //console.log"response: ", res);
      this.tripContextResponse.successMessage = "Success!";
      this.tripContextResponse.tripIDs = [];
      this.tripContextService.changeResponse(this.tripContextResponse);
      this.router.navigate(this.transactionactivitieslink, { queryParams: { fromSearch: true } });
    },
      err => {
        this.msgType = "error";
        this.msgDesc = err.StatusText;
        this.msgFlag = true;
        this.msgTitle = "";
      }
    )
  }

  validTripDisputes() {
    //console.log"valid");
    //console.log"test Data: ", this.resp);
    this.iAccountAdjustment.SystemActivity = <ISystemActivities>{};
    this.iAccountAdjustment.SystemActivity.LoginId = this.sessionContextResponse.loginId;
    this.iAccountAdjustment.SystemActivity.UserId = this.sessionContextResponse.userId;
    this.iAccountAdjustment.SystemActivity.User = this.sessionContextResponse.userName;
    this.iAccountAdjustment.SystemActivity.IsViewed = true;
    this.iAccountAdjustment.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.iAccountAdjustment.CustTripIdCSV = this.customerTripIds;
    if (this.resp)
      this.iAccountAdjustment.CSVRewardIds = this.resp.FilePath;
    else
      this.iAccountAdjustment.CSVRewardIds = "";
    if (this.customerContextResponse.AccountType == TollType[TollType.PREPAID]) {
      this.iAccountAdjustment.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PrePaid];
      this.iAccountAdjustment.IsPostpaidCustomer = false;
      this.iAccountAdjustment.TxnTypeDesc = "Prepaid Customer Toll Transaction dismissed";
      this.iAccountAdjustment.TxnType = "PREPAIDTOLLDISMISS";
    }
    if (this.customerContextResponse.AccountType == TollType[TollType.POSTPAID]) {
      this.iAccountAdjustment.AdjustmentCategory = AdjustmentCategory[AdjustmentCategory.PostPaid];
      this.iAccountAdjustment.IsPostpaidCustomer = true;
      this.iAccountAdjustment.TxnTypeDesc = "Postpaid Customer Toll Transaction dismissed";
      this.iAccountAdjustment.TxnType = "POSTPAIDTOLLDISMISS";
    }
    this.iAccountAdjustment.IsTripTransfer = false;
    this.iAccountAdjustment.IsDismissed = true;

    this.iAccountAdjustment.DrCr_Flag = "C";
    this.iAccountAdjustment.AmountType = "Amount";
    this.iAccountAdjustment.TransferCustomerId = 0;
    this.iAccountAdjustment.User = this.sessionContextResponse.userName;
    this.iAccountAdjustment.AccStatusCode = this.accountStatus;
    this.iAccountAdjustment.ICNId = this.sessionContextResponse.icnId;
    this.iAccountAdjustment.AdjustmentDate = new Date(Date.now());
    this.iAccountAdjustment.CustomerId = this.accountId;
    this.iAccountAdjustment.ReasonCode = this.reasonCode;
    this.iAccountAdjustment.SubSystem = SubSystem[SubSystem.CSC];
    this.iAccountAdjustment.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.iAccountAdjustment.Description = this.disputeTransaction.controls['comments'].value;

    //console.log"iAccountAdjustment: ", this.iAccountAdjustment);
    this.customerDetailsService.validTripDisputes(this.iAccountAdjustment).subscribe(res => {
      // this.msgType = "success";
      // this.msgDesc = "Success!!!" + res;
      // this.msgFlag = true;
      // this.msgTitle = "";
      // //console.log"response: ", res);
      this.tripContextResponse.successMessage = "Success!";
      this.tripContextResponse.tripIDs = [];
      this.tripContextService.changeResponse(this.tripContextResponse);
      this.router.navigate(this.transactionactivitieslink, { queryParams: { fromSearch: true } });
    },
      err => {
        this.msgType = "error";
        this.msgDesc = err.StatusText;
        this.msgFlag = true;
        this.msgTitle = "";
      }
    )
  }

  resetDisputeRequest() {
    this.disputeTransaction.controls['disputeTransactionType'].setValue("");
    this.disputeTransaction.controls['comments'].reset();
    this.disputeTransaction.controls['cmpFile'].reset();
    this.statusValue = 0;
  }

  goToBackPrePage() {
    this.tripContextResponse = <ITripsContextResponse>{};
    this.tripContextService.changeResponse(this.tripContextResponse);
    this.router.navigate(this.transactionactivitieslink, { queryParams: { fromSearch: true } });
    let a = this;
    setTimeout(function () {
      a.materialscriptService.material();
    }, 1000);
  }

  //upload file
  uploadFile() {
    if (this.cmpFile.nativeElement.files[0]) {
      let file: File = this.cmpFile.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));

      if ([".gif", ".jpg", ".jpeg", ".txt", ".xls", ".docx", ".pdf", ".doc", ".png", ".xlsx"].indexOf(type.toLowerCase()) > 0) {
        if (file.size / 1048576 < this.fileMaxSize) {
          let formData = new FormData();
          formData.append('upload', file);
          this.disputesService.uploadFile(formData)
            .subscribe(
            data => {
              if (data != null && data !== '' && data.Result) {
                let pathParts: string[] = data.FilePath.split('/');
                this.attachment = <IAttachmentRequest>{};
                this.attachment.FileName = pathParts[pathParts.length - 1];
                this.attachment.Path = data.FilePath;
                this.attachment.Size = file.size;
                this.attachment.FileType = type;
                this.attachmentsList.push(this.attachment);
                this.isUpload = false;
                this.uploadMandatory = true;
                this.disputeTransaction.controls['cmpFile'].disable();

              } else {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = 'Error while uploading file';
                this.cmpFile.nativeElement.value = '';
              }
              this.resp = data
              //console.log"Data: ", data);
            });
        } else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'File size should not exceed more than ' + this.fileMaxSize + 'MB';
        }
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Attach files of type  jpg, jpeg, txt, gif, docx, pdf, doc, png, xlsx, xls only.';
      }
    } else {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'Select file to upload';
    }
  }

  deleteFile(fileName: string) {
    this.disputesService.deleteFile(fileName)
      .subscribe(
      data => {
        if (data) {
          this.attachmentsList = this.attachmentsList.filter((f: IAttachmentRequest) => f.Path !== fileName);
          this.cmpFile.nativeElement.value = '';
          this.isUpload = true;
          this.attachmentsList = [];
          this.uploadMandatory = false;
          this.disputeTransaction.controls['cmpFile'].enable();
          // this.disputeTransaction.controls['cmpFile'].setValidators();
        } else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Error while deleting file';
          this.uploadMandatory = false;
        }
      });
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

  getLookUpByParentLookupTypeCode() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISPUTETRANSACTION];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.lookupType = <ICommonResponse>{};
    this.lookupType.LookUpTypeCode = "TripDismissTypes";
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType, userEvents).subscribe(
      res => {
        //console.log"res: ", res);
        // res = res.filter((c: ICommonResponse) => c.LookUpTypeCode !== 'OutofCountry');
        this.nonLiabilityReasons = res;
        //console.log("nonLiabilityReason", this.nonLiabilityReasons);
      }
    );
  }


}
