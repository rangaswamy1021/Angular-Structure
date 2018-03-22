import { read } from 'fs';
import { IinvoiceResponse } from '../../sac/plans/models/invoicecycleresponse';
import { InvoicesContextService } from '../../shared/services/invoices.context.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ICommonResponse } from "../../shared/models/commonresponse";
import { CommonService } from "../../shared/services/common.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IAffidavitRequest } from "./models/affidavitrequest";
import { DisputesService } from "./services/disputes.service";
import { IAttachmentRequest } from "../../shared/models/attachmentrequest";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { Actions, ActivitySource, Features, LookupTypeCodes, defaultCulture } from '../../shared/constants';
import { ViolatorContextService } from "../../shared/services/violator.context.service";
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from "../../shared/services/session.service";
import { IUserresponse } from "../../shared/models/userresponse";
import { IViolatorContextResponse } from "../../shared/models/violatorcontextresponse";
import { TripsContextService } from "../../shared/services/trips.context.service";
import { ITripsContextResponse } from "../../shared/models/tripscontextresponse";
import { IUserEvents } from "../../shared/models/userevents";

import { DisputeContextService } from "./services/dispute.context.service";
import { IAffidavitResponse } from "./models/affidavitresponse";

import { IMyDpOptions, IMyInputFieldChanged } from "mydatepicker";
import { DatePickerFormatService } from '../../shared/services/datepickerformat.service';
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-non-liability',
  templateUrl: './non-liability.component.html',
  styleUrls: ['./non-liability.component.scss']
})
export class NonLiabilityComponent implements OnInit {
  endTime: any;
  startTime: any;
  invalidDate: boolean;

  route: any;

  dateError: boolean;
  endDate: any;
  startDate: any;
  isTransfer: boolean = false;
  uploadMandatory: boolean;
  longStolenAccId: number;
  strCode: string;
  pnlNotTransferTrips: boolean;
  pnlTransferTrips: boolean;
  successBlock: boolean;
  stolenAccountResult: number;
  errorMessage: string;
  successMessage: string;
  vehicleNumbers: string[];
  afterCitationId: number[];
  beforeCitationId: number[];
  vioalatorId: number;
  isFile: boolean = false;
  isUpload: boolean = false;
  objWrongPlate: IAffidavitRequest;
  objDisputeRequest: IAffidavitRequest;
  docType: any;
  type: number;
  affidavitResponse: boolean;
  objAffidavitsContextRequest: IAffidavitRequest;
  objAffidavit: IAffidavitRequest;
  objAffidavitResponse: IAffidavitResponse;
  nonLiabilityType: string;
  nonLiability: FormGroup;
  lookupType: ICommonResponse;
  nonLiabilityResponse: ICommonResponse[];
  successMessageAttachment = '';
  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  sessionContextResponse: IUserresponse;
  viewPath: string = '';
  fileMaxSize: number;
  tripContext: ITripsContextResponse;
  invoiceContext: any;
  // invoiceContext: IinvoiceResponse;
  violatorContext: IViolatorContextResponse;
  maxFiles: number;
  @ViewChild('cmpFile') cmpFile;
  isStartDate: boolean = true;
  isEndDate: boolean = true;
  isAttach: boolean = true;
  wrongAffidavitresponse: boolean;
  validAffidavitResponse: boolean;
  tripIdCSV: string = '';
  invoiceIdCSV: string = '';
  invoiceNumbers: string;
  redirectURL: string;
  msgDesc: string;
  msgTitle: string;
  msgType: string;
  msgFlag: boolean;
  isDisputeReq: boolean = true;
  isSearchRequired: boolean = false;
  affidavitId: number;
  resDisputeExist: IAffidavitResponse;
  msgNewAccount: string;
  isSaleExist: boolean = false;
  toCustomerId: number = 0;
  isRequest: boolean = false;
  isApprove: boolean = false;
  isReject: boolean = false;
  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };
  myDatePickerOptionEndDate: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };


  constructor(private commonService: CommonService, private disputesService: DisputesService,
    private violatorContextService: ViolatorContextService, private router: Router, private activatedroute: ActivatedRoute,
    private sessionContext: SessionService, private tripContextService: TripsContextService,
    private disputecontext: DisputeContextService, private invoiceContextService: InvoicesContextService,
    private datePickerFormatService: DatePickerFormatService, private cdr: ChangeDetectorRef, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
     this.materialscriptService.material();
    this.nonLiabilityType = "--Select--";
    this.nonLiability = new FormGroup({
      'nonLiabilityType': new FormControl('', []),
      'information': new FormControl('', []),
      'cmpFile': new FormControl('', []),
      'startDate': new FormControl('', []),
      'startTime': new FormControl('', []),
      'endDate': new FormControl('', []),
      'endTime': new FormControl('', [])
    });
    this.violatorContextService.currentContext
      .subscribe(customerContext => {
        this.violatorContext = customerContext;
        if (this.violatorContext && this.violatorContext.accountId > 0) {
          this.vioalatorId = this.violatorContext.accountId;
        }
      }
      );
    this.tripContextService.currentContext
      .subscribe(customerContext => { this.tripContext = customerContext; }
      );

    this.sessionContextResponse = this.sessionContext.customerContext;
    this.affidavitId = +this.activatedroute.snapshot.paramMap.get('id');
    this.commonService.getDocumentPaths(ApplicationParameterkey.ViewPath, LookupTypeCodes.DocConfigs, LookupTypeCodes.DocumentsLinked)
      .subscribe(res => { this.viewPath = res; });
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.MaxFileSize)
      .subscribe(res => { this.fileMaxSize = res; });
    this.getLookUpByParentLookupTypeCode();
    this.selectType(1);
    if (this.affidavitId > 0) {
      this.nonLiability.controls['nonLiabilityType'].disable();
      this.redirectURL = 'tvc/disputes/view-disputes';
      this.isDisputeReq = false;
      this.disputecontext.currentContext.subscribe(
        disputecontext => {
          if (disputecontext != null) {
            this.objAffidavitsContextRequest = disputecontext;
          }
        });
      this.populateControlValues(this.affidavitId);
    } else {
      this.getCitationIds();
      this.getInvoiceIds();
    }
    !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.VIEW], "");
    this.isTransfer = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.TRANSFER], "");
    this.isRequest = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.REQUEST], "");
    this.isApprove = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.APPROVE], "");
    this.isReject = !this.commonService.isAllowed(Features[Features.DISPUTE], Actions[Actions.REJECT], "");
  }


  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  selectType(a: number) {
    this.type = a;
    if (this.type == 1) {
      this.isAttach = true;
      this.isStartDate = true;
      this.isEndDate = true;
      this.nonLiability.patchValue({
        information: "",
        cmpFile: ""
      })
      this.isUpload = false;
      this.attachmentsList = [];
      this.nonLiability.controls['nonLiabilityType'].reset();
      this.nonLiability.controls['nonLiabilityType'].setValue("");
      this.nonLiability.controls['nonLiabilityType'].setValidators(Validators.required);
      this.nonLiability.controls['nonLiabilityType'].updateValueAndValidity();
      if (!this.isDisputeReq) {
        this.nonLiability.controls['cmpFile'].enable();
        this.nonLiability.controls['startDate'].reset();
        this.nonLiability.controls['startDate'].setValue("");
        this.nonLiability.controls['endDate'].reset();
        this.nonLiability.controls['endDate'].setValue("");
        this.nonLiability.controls['cmpFile'].reset();
        this.nonLiability.controls['cmpFile'].setValidators(Validators.required);
        this.nonLiability.controls['cmpFile'].updateValueAndValidity();
        this.nonLiability.controls['startDate'].setValidators(Validators.required);
        this.nonLiability.controls['startDate'].updateValueAndValidity();
        this.nonLiability.controls['endDate'].setValidators(Validators.required);
        this.nonLiability.controls['endDate'].updateValueAndValidity();
      }
    }
  }

  getCitationIds() {
    this.tripContextService.currentContext.subscribe(res => {
      if (res) {
        this.tripContext = res;
        if (res.tripIDs && res.tripIDs.length)
          this.tripIdCSV = res.tripIDs.toString();
        this.beforeCitationId = res.beforeCitationIds;
        this.afterCitationId = res.aferCitationIds;
        this.vehicleNumbers = res.vehicleNumberForDispute;
        this.redirectURL = res.referenceURL;
        if (this.beforeCitationId && this.beforeCitationId.length > 0)
          this.pnlTransferTrips = true;
        else
          this.pnlTransferTrips = false;
        if (this.afterCitationId && this.afterCitationId.length > 0)
          this.pnlNotTransferTrips = true;
        else
          this.pnlNotTransferTrips = false;
        this.invoiceIdCSV = '';
      }
    });
  }

  getInvoiceIds() {
    this.vehicleNumbers = [];
    this.invoiceContextService.currentContext.subscribe(res => {
      if (res) {
        this.invoiceContext = res;
        if (res.invoiceIDs && res.invoiceIDs.length)
          this.invoiceIdCSV = res.invoiceIDs.toString();
        this.redirectURL = res.referenceURL;
        this.vehicleNumbers = res.PlateNumbersForDispute;
        this.invoiceNumbers = res.selectedInvoiceNumbers.toString();
        this.tripIdCSV = '';
      }
    });
  }

  chnageType() {
    if (this.type == 1) {
      this.docType = this.nonLiability.controls['nonLiabilityType'].value;
      if (this.docType == "PROTECTEDPLATE") {
        this.isAttach = true;
        this.isStartDate = true;
        this.isEndDate = true;
        this.isUpload = false;

        this.nonLiability.controls['nonLiabilityType'].setValidators(Validators.required);
        this.nonLiability.controls['nonLiabilityType'].updateValueAndValidity();
        if (!this.isDisputeReq) {
          this.nonLiability.controls['cmpFile'].setValidators(Validators.required);
          this.nonLiability.controls['cmpFile'].updateValueAndValidity();
          this.nonLiability.controls['startDate'].setValidators(Validators.required);
          this.nonLiability.controls['startDate'].updateValueAndValidity();
          this.nonLiability.controls['endDate'].setValidators(Validators.required);
          this.nonLiability.controls['endDate'].updateValueAndValidity();
        }

      }
      else if (this.docType == "WRONGPLATE") {
        this.isAttach = true;
        this.isStartDate = false;
        this.isEndDate = false;
        this.isUpload = false;
        this.nonLiability.controls['nonLiabilityType'].setValidators(Validators.required);
        this.nonLiability.controls['nonLiabilityType'].updateValueAndValidity();
        if (!this.isDisputeReq) {
          this.nonLiability.controls['cmpFile'].setValidators(Validators.required);
          this.nonLiability.controls['cmpFile'].updateValueAndValidity();
          this.nonLiability.controls['startDate'].setValidators([]);
          this.nonLiability.controls['startDate'].updateValueAndValidity();
          this.nonLiability.controls['endDate'].setValidators([]);
          this.nonLiability.controls['endDate'].updateValueAndValidity();
          this.isSearchRequired = false;
        }
      }
      else if (this.docType == "STOLEN" || this.docType == "SALESORTRANSFER") {
        this.isAttach = true;
        this.isStartDate = true;
        this.isEndDate = false;
        this.isUpload = false;
        if (!this.isDisputeReq) {
          this.nonLiability.controls['nonLiabilityType'].setValidators(Validators.required);
          this.nonLiability.controls['nonLiabilityType'].updateValueAndValidity();
          this.nonLiability.controls['cmpFile'].setValidators(Validators.required);
          this.nonLiability.controls['cmpFile'].updateValueAndValidity();
          this.nonLiability.controls['startDate'].setValidators(Validators.required);
          this.nonLiability.controls['startDate'].updateValueAndValidity();
          this.nonLiability.controls['endDate'].setValidators([]);
          this.nonLiability.controls['endDate'].updateValueAndValidity();
          if (this.docType === "Stolen") {
            this.isSearchRequired = false;
          }
        }
      }
      else {
        this.isAttach = true;
        this.isStartDate = true;
        this.isEndDate = true;
        this.isUpload = false;
        //this.nonLiability.controls['cmpFile'].enable();
        this.nonLiability.controls['nonLiabilityType'].setValidators(Validators.required);
        this.nonLiability.controls['nonLiabilityType'].updateValueAndValidity();
        if (!this.isDisputeReq) {
          this.nonLiability.controls['cmpFile'].setValidators(Validators.required);
          this.nonLiability.controls['cmpFile'].updateValueAndValidity();
          this.nonLiability.controls['startDate'].setValidators(Validators.required);
          this.nonLiability.controls['startDate'].updateValueAndValidity();
          this.nonLiability.controls['endDate'].setValidators(Validators.required);
          this.nonLiability.controls['endDate'].updateValueAndValidity();
        }
      }
    }
  }


  submitRequest() {
    this.nonLiability.controls["nonLiabilityType"].markAsTouched({ onlySelf: true });
    if (this.type == 1) {
      if (this.nonLiability.valid) {
        if (this.tripIdCSV != '')
          this.submitDisputeRequest();
        else if (this.invoiceIdCSV != '')
          this.submitReqForInvoice();
      }
    }
  }

  submitReqForInvoice() {

    this.objAffidavit = <IAffidavitRequest>{};
    this.objAffidavit.ViolatorId = this.violatorContext.accountId;
    this.objAffidavit.InvoiceIdCSV = this.invoiceIdCSV;
    this.objAffidavit.Comments = this.nonLiability.controls['information'].value;
    if (this.attachment)
      this.objAffidavit.DocumentPath = this.attachment.Path;
    this.objAffidavit.NonLiabilityReasonCode = this.nonLiability.controls['nonLiabilityType'].value.toUpperCase();
    this.objAffidavit.TxnDate = new Date();
    if (this.isStartDate) {
      let startdate = this.nonLiability.controls['startDate'].value;
      let startTime = this.nonLiability.controls['startTime'].value;
      if (startdate != '' && startdate != undefined) {
        if (startTime != '' && startTime != undefined) {
          startTime = new Date(startTime);
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), 0, 0);
        }
        else
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day);
      }
    }
    if (this.isEndDate) {
      let endDate = this.nonLiability.controls['endDate'].value;
      let endTime = this.nonLiability.controls['endTime'].value;
      if (endDate != '' && endDate != undefined) {
        if (endTime != '' && endTime != undefined) {
          endTime = new Date(endTime);
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), 0, 0);
        }
        else
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day);
      }
    }
    if (this.isStartDate && this.nonLiability.controls['startDate'].value && this.isEndDate && this.nonLiability.controls['endDate'].value) {
      if (this.startDate > this.endDate) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Start Date should be less than End Date';
        return;
      }
    }
    if (this.isStartDate && this.nonLiability.controls['startDate'].value)
      this.objAffidavit.StartEffectiveDate = this.startDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    if (this.isEndDate && this.nonLiability.controls['endDate'].value)
      this.objAffidavit.EndEffectiveDate = this.endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.objAffidavit.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objAffidavit.VehicleNumber = this.vehicleNumbers.toString();
    this.objAffidavit.CreatedUser = this.sessionContextResponse.userName;
    this.objAffidavit.UserName = this.sessionContextResponse.userName;
    this.objAffidavit.ICNId = this.sessionContextResponse.icnId;
    this.objAffidavit.UserId = this.sessionContextResponse.userId;
    this.objAffidavit.LoginId = this.sessionContextResponse.loginId;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.ActionName = Actions[Actions.REQUEST];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.disputesService.disputeRequestforInvoice(this.objAffidavit, userEvents).subscribe(res => {
      this.validAffidavitResponse = res;
      if (res) {
       
        this.successMessage = "Dispute request has been submitted successfully for the Invoice # (s) " + this.invoiceNumbers;
        this.prepareInvContextRequest(this.successMessage);
       this.router.navigate(["/tvc/customerdetails/search/invoices-search"]);
      }
    }, (err) => {
      this.errorMessage = err.statusText.toString();
      this.prepareInvContextRequest(this.errorMessage);
      this.router.navigate(["/tvc/customerdetails/search/invoices-search"]);
    });
  }

  submitDisputeRequest() {
    this.getCitationIds();
    this.objAffidavit = <IAffidavitRequest>{};
    this.objAffidavit.ViolatorId = this.violatorContext.accountId;
    this.objAffidavit.BeforeCitationIds = this.beforeCitationId.toString();
    this.objAffidavit.AfterCitationIds = this.afterCitationId.toString();
    this.objAffidavit.Comments = this.nonLiability.controls['information'].value;
    if (this.attachment)
      this.objAffidavit.DocumentPath = this.attachment.Path;
    this.objAffidavit.NonLiabilityReasonCode = this.nonLiability.controls['nonLiabilityType'].value.toUpperCase();
    this.objAffidavit.TxnDate = new Date();
    if (this.isStartDate) {
      let startdate = this.nonLiability.controls['startDate'].value;
      let startTime = this.nonLiability.controls['startTime'].value;
      if (startdate != '' && startdate != undefined) {
        if (startTime != '' && startTime != undefined) {
          startTime = new Date(startTime);
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), 0, 0);
        }
        else {
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day);
        }
      }
    }
    if (this.isEndDate) {
      let endDate = this.nonLiability.controls['endDate'].value;
      let endTime = this.nonLiability.controls['endTime'].value;
      if (endDate != '' && endDate != undefined) {
        if (endTime != '' && endTime != undefined) {
          endTime = new Date(endTime);
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), 0, 0);
        }
        else
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day);
      }
    }
    if (this.isStartDate && this.nonLiability.controls['startDate'].value && this.isEndDate && this.nonLiability.controls['endDate'].value) {
      if (this.startDate > this.endDate) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Start Date should be less than End Date';
        return;
      }
    }
    if (this.isStartDate && this.nonLiability.controls['startDate'].value)
      this.objAffidavit.StartEffectiveDate = this.startDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    if (this.isEndDate && this.nonLiability.controls['endDate'].value)
      this.objAffidavit.EndEffectiveDate = this.endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    this.objAffidavit.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objAffidavit.VehicleNumber = this.vehicleNumbers.toString();
    this.objAffidavit.CreatedUser = this.sessionContextResponse.userName;
    this.objAffidavit.UserName = this.sessionContextResponse.userName;
    this.objAffidavit.ICNId = this.sessionContextResponse.icnId;
    this.objAffidavit.UserId = this.sessionContextResponse.userId;
    this.objAffidavit.LoginId = this.sessionContextResponse.loginId;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.ActionName = Actions[Actions.REQUEST];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.disputesService.disputeRequest(this.objAffidavit, userEvents).subscribe(res => {
      this.validAffidavitResponse = res;
      if (res) {
        if (this.beforeCitationId.length && this.afterCitationId.length) {
          this.successMessage = "Trip # (s) " + this.afterCitationId.toString()
            + " cancelled successfully" + "Dispute request has been submitted successfully for the Trip # (s) "
            + this.beforeCitationId.toString();
        } else if (this.beforeCitationId.length) {
          this.successMessage = "Dispute request has been submitted successfully for the Trip # (s) " + this.tripIdCSV;
        } else if (this.afterCitationId.length) {
          this.successMessage = "Trip # (s) " + this.tripIdCSV + " cancelled successfully";
        }
        this.prepareContextRequest(this.successMessage);
        this.router.navigate(['/tvc/violatordetails/trip-Search']);
      }
    }, (err) => {
      this.errorMessage = err.statusText.toString();
      this.prepareContextRequest(this.errorMessage);
      this.router.navigate(['/tvc/violatordetails/trip-Search']);
    });
  }


  reset() {
    this.nonLiability.patchValue({
      information: ""
    })
    this.nonLiabilityType = "--Select--";
    this.cmpFile.nativeElement.value = '';
    this.isUpload = false;
    this.nonLiability.reset();
    this.nonLiability.controls['cmpFile'].enable();
    this.nonLiability.controls['cmpFile'].setValidators([Validators.required]);
    this.nonLiability.controls['nonLiabilityType'].setValue("");
    this.nonLiability.controls['startDate'].setValue("");
    this.nonLiability.controls['endDate'].setValue("");
    this.attachmentsList = [];
    this.errorMessage = '';
  }

  //binding non liability type
  getLookUpByParentLookupTypeCode() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContext.accountId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.lookupType = <ICommonResponse>{};
    this.lookupType.LookUpTypeCode = "NonLiability";
    this.commonService.getLookUpByParentLookupTypeCode(this.lookupType, userEvents).subscribe(
      res => {
        res = res.filter((c: ICommonResponse) => c.LookUpTypeCode !== 'OutofCountry');
        this.nonLiabilityResponse = res;

      }
    );
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
                this.isUpload = true;
                this.uploadMandatory = true;
                this.nonLiability.controls['cmpFile'].disable();

              } else {
                this.msgFlag = true;
                this.msgType = 'error';
                this.msgTitle = '';
                this.msgDesc = 'Error while uploading file';
                this.cmpFile.nativeElement.value = '';
              }
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
          this.isUpload = false;
          this.attachmentsList = [];
          this.uploadMandatory = false;
          this.nonLiability.controls['cmpFile'].enable();
          this.nonLiability.controls['cmpFile'].setValidators([Validators.required]);
        } else {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Error while deleting file';
          this.uploadMandatory = false;
        }
      });
  }


  back() {
    if (this.redirectURL !== '') {
      if (this.objAffidavitsContextRequest != null && this.objAffidavitsContextRequest !== undefined)
        this.disputecontext.changeResponse(null);
      this.router.navigateByUrl(this.redirectURL);

    }
    else {
      let link = ['tvc/violatordetails/trip-Search'];
      this.router.navigate(link);
    }
  }

  prepareContext(msg: string) {
    this.objAffidavitsContextRequest = <IAffidavitRequest>{};
    this.objAffidavitsContextRequest.successMessage = this.successMessage;
    this.objAffidavitsContextRequest.errorMessage = this.errorMessage;
    this.disputecontext.changeResponse(this.objAffidavitsContextRequest);

  }

  prepareContextRequest(msg: string) {
    if (this.tripContext != null) {
      this.tripContext.successMessage = this.successMessage;
      this.tripContext.errorMessage = this.errorMessage;
    }
  }

  prepareInvContextRequest(msg: string) {
   
    if (this.invoiceContext != null) {
      this.invoiceContext.successMessage = this.successMessage;
      this.invoiceContext.errorMessage = this.errorMessage;
    }
  }


  setOutputFlag(e) {
    this.msgFlag = e;
  }


  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (controlName == "cmpFile" && !this.uploadMandatory) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Please attach a file.';
        }
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  removeValidateFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        if (control.invalid) {
        }
        control.markAsTouched({ onlySelf: false });
      } else if (control instanceof FormGroup) {
        this.removeValidateFields(control);
      }
    });
  }



  searchCustomer() {
    let disputeReq = <IAffidavitRequest>{};
    disputeReq.Comments = this.nonLiability.controls['information'].value;
    disputeReq.NonLiabilityReasonCode = this.nonLiability.controls['nonLiabilityType'].value;
    let startdate = this.nonLiability.controls['startDate'].value;
    let startTime = this.nonLiability.controls['startTime'].value;
    if (startdate != '' && startdate != null && startdate != undefined) {
      if (startTime != '' && startTime != undefined) {
        startTime = new Date(startTime);
        disputeReq.isStartTimeAdded = true;
        this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), 0, 0);
      }
      else {
        disputeReq.isStartTimeAdded = false;
        this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day);
      }
    }
    else {
      startdate = '';
      disputeReq.isStartTimeAdded = false;
    }
    let endDate = this.nonLiability.controls['endDate'].value;
    let endTime = this.nonLiability.controls['endTime'].value;
    if (endDate != '' && endDate != null && endDate != undefined) {
      if (endTime != '' && endTime != undefined) {
        endTime = new Date(endTime);
        disputeReq.isEndTimeAdded = true;
        this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), 0, 0);
      }
      else {
        disputeReq.isEndTimeAdded = false;
        this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day);
      }
    }
    else {
      endDate = '';
      disputeReq.isEndTimeAdded = false;
    }

    if (startdate != '')
      disputeReq.StartEffectiveDate = this.startDate;
    else {
      disputeReq.StartEffectiveDate = '';
    }
    if (endDate != null)
      disputeReq.EndEffectiveDate = this.endDate;
    else {
      disputeReq.EndEffectiveDate = '';
    }

    disputeReq.AffidavitId = this.affidavitId;
    disputeReq.VehicleNumber = this.objAffidavitResponse.VehicleNumber;
    disputeReq.ToCustomerId = 0;
    disputeReq.DocumentPath = this.attachment.Path != '' ? this.attachment.Path : '';
    this.disputecontext.changeResponse(disputeReq);
    if (disputeReq.NonLiabilityReasonCode && disputeReq.NonLiabilityReasonCode.toUpperCase() === 'SALESORTRANSFER') {
      this.checkExistingAffidavit(disputeReq.NonLiabilityReasonCode, disputeReq.VehicleNumber);
    } else {
      this.router.navigate(['tvc/disputes/affidavit-search-violator']);
    }
  }

  populateControlValues(affidavitId: any) {
    this.msgNewAccount = '';
    this.isSaleExist = false;
    this.objAffidavit = <IAffidavitRequest>{};
    this.objAffidavit.AffidavitId = affidavitId;
    this.objAffidavit.DisputeStatus = 'DISPUTEREQUESTED';
    this.objAffidavit.FromCustomerId = this.vioalatorId;
    this.disputesService.getDisputeDetails(this.objAffidavit).subscribe(res => {
      if (res)
        this.objAffidavitResponse = res[0];
    }, (err) => {
      this.errorMessage = err.statusText.toString();
      this.prepareContext(this.errorMessage);
      this.router.navigate(['/tvc/violatordetails/trip-Search']);
    }, () => {
      if (this.objAffidavitResponse !== undefined) {
        this.docType = this.objAffidavitResponse.NonLiabilityReasonCode;
        if (this.docType === 'Stolen'.toUpperCase() || this.docType === 'Wrongplate'.toUpperCase()) {
          this.isSearchRequired = false;
        } else
          this.isSearchRequired = true;
        this.attachment = <IAttachmentRequest>{};
        this.objDisputeRequest = <IAffidavitRequest>{};
        this.objDisputeRequest.LinkSourceName = this.objAffidavitResponse.LinkSourceName;
        if (this.objDisputeRequest.LinkSourceName.indexOf('TP_VIOLATEDTRIPS') != -1) {
          this.tripIdCSV = this.objAffidavitResponse.LinkIds;
          this.objDisputeRequest.CitatioIdCSV = this.objAffidavitResponse.CitationCSV;
        } else {
          this.objDisputeRequest.InvoiceIdCSV = this.objAffidavitResponse.LinkIds;
          this.invoiceIdCSV = this.objAffidavitResponse.LinkIds;
          this.invoiceNumbers = this.objAffidavitResponse.CitationCSV;
        }
        if (this.objAffidavitsContextRequest != null && this.objAffidavitsContextRequest !== undefined) {
          if (this.objAffidavitsContextRequest.StartEffectiveDate != '' && this.objAffidavitsContextRequest.StartEffectiveDate != undefined) {
            this.nonLiability.patchValue({
              startDate: { date: { year: new Date(this.objAffidavitsContextRequest.StartEffectiveDate).getFullYear(), month: new Date(this.objAffidavitsContextRequest.StartEffectiveDate).getMonth() + 1, day: new Date(this.objAffidavitsContextRequest.StartEffectiveDate).getDate(), } },
            });
            if (this.objAffidavitsContextRequest.isStartTimeAdded)
              this.startTime = this.objAffidavitsContextRequest.StartEffectiveDate;
          }
          if (this.objAffidavitsContextRequest.EndEffectiveDate != '' && this.objAffidavitsContextRequest.EndEffectiveDate != undefined) {
            this.nonLiability.patchValue({
              endDate: { date: { year: new Date(this.objAffidavitsContextRequest.EndEffectiveDate).getFullYear(), month: new Date(this.objAffidavitsContextRequest.EndEffectiveDate).getMonth() + 1, day: new Date(this.objAffidavitsContextRequest.EndEffectiveDate).getDate(), } },
            });
            if (this.objAffidavitsContextRequest.isEndTimeAdded)
              this.endTime = this.objAffidavitsContextRequest.EndEffectiveDate;
          }
          this.nonLiability.patchValue({
            information: this.objAffidavitsContextRequest.Comments,
            CitatioIdCSV: this.objAffidavitsContextRequest.CitatioIdCSV,
            nonLiabilityType: this.objAffidavitsContextRequest.NonLiabilityReasonCode,
          });
          this.toCustomerId = this.objAffidavitsContextRequest.ToCustomerId;
          this.bindDocumentPath(this.objAffidavitsContextRequest.DocumentPath);
          this.attachment.Path = this.objAffidavitsContextRequest.DocumentPath;
        } else {
          this.objDisputeRequest.NonLiabilityReasonCode = this.objAffidavitResponse.NonLiabilityReasonCode;
          this.objDisputeRequest.VehicleNumber = this.objAffidavitResponse.VehicleNumber;
          this.objDisputeRequest.AffidavitId = affidavitId;
          this.objDisputeRequest.DocumentPath = this.objAffidavitResponse.DocumentPath;
          this.objDisputeRequest.Comments = this.objAffidavitResponse.Comments;
          this.objDisputeRequest.StartEffectiveDate = this.objAffidavitResponse.StartEffectiveDate;
          this.objDisputeRequest.EndEffectiveDate = this.objAffidavitResponse.EndEffectiveDate;
          this.bindDocumentPath(this.objAffidavitResponse.DocumentPath);
          //checking minimum date
          let startdate = new Date(this.objDisputeRequest.StartEffectiveDate);
          let startyear = (startdate.getFullYear());
          if (startyear > 1) {
            this.nonLiability.patchValue({
              startDate: { date: { year: new Date(this.objDisputeRequest.StartEffectiveDate).getFullYear(), month: new Date(this.objDisputeRequest.StartEffectiveDate).getMonth() + 1, day: new Date(this.objDisputeRequest.StartEffectiveDate).getDate(), } },
            });
            this.startTime = this.objDisputeRequest.StartEffectiveDate;
          }
          //checking minimum date
          let enddate = new Date(this.objDisputeRequest.EndEffectiveDate);
          let endyear = (enddate.getFullYear());
          if (endyear > 1) {
            this.nonLiability.patchValue({
              endDate: { date: { year: new Date(this.objDisputeRequest.EndEffectiveDate).getFullYear(), month: new Date(this.objDisputeRequest.EndEffectiveDate).getMonth() + 1, day: new Date(this.objDisputeRequest.EndEffectiveDate).getDate(), } },
            });
            this.endTime = this.objDisputeRequest.EndEffectiveDate;
          }
          this.nonLiability.patchValue({
            information: this.objDisputeRequest.Comments,
            nonLiabilityType: this.objDisputeRequest.NonLiabilityReasonCode,
          });
        }
        this.chnageType();
        //Disable Upload button if attachment is exist.
        if ((this.objAffidavitResponse !== undefined && this.objAffidavitResponse.DocumentPath != '' && this.objAffidavitResponse.DocumentPath != undefined && this.objAffidavitResponse.DocumentPath.length > 0)) {
          this.isUpload = true;
          this.uploadMandatory = true;
        }
        else if ((this.objAffidavitsContextRequest !== undefined && this.objAffidavitsContextRequest.DocumentPath != '' && this.objAffidavitsContextRequest.DocumentPath != undefined && this.objAffidavitsContextRequest.DocumentPath.length > 0)) {
          this.isUpload = true;
          this.uploadMandatory = true;
        }
        else {
          this.isUpload = false;
          this.uploadMandatory = false;
          this.attachmentsList = [];
          this.nonLiability.controls['cmpFile'].enable();
        }
      }
    });
  }

  bindDocumentPath(strDocumentPath: string) {
    if (strDocumentPath !== '' && strDocumentPath !== undefined) {
      let pathParts: string[] = strDocumentPath.split('/');
      this.attachment = <IAttachmentRequest>{};
      this.attachment.FileName = pathParts[pathParts.length - 1];
      this.attachment.Path = strDocumentPath;
      this.attachmentsList.push(this.attachment);

      this.nonLiability.controls['cmpFile'].disable();
    }
  }

  approveDispute() {
    if (this.isSearchRequired && this.toCustomerId == 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'Account is required to approve the dispute. click on <strong>Search Account</strong> link to get the account.';
      if (!this.nonLiability.valid) {
        this.validateAllFormFields(this.nonLiability);
      }
    }
    else if (this.nonLiability.valid) {
      if (this.sessionContextResponse.icnId === 0) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'ICN is not assigned to do transactions.';
      }

      //    this.getCitationIds();
      const reqAffidavit = this.createReqAffidavitDTO(true);
      if (this.isStartDate && this.nonLiability.controls['startDate'].value && this.isEndDate && this.nonLiability.controls['endDate'].value) {
        if (this.startDate > this.endDate) {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgTitle = '';
          this.msgDesc = 'Start Date should be less than End Date';
          return;
        }
      }
      const userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.DISPUTE];
      userEvents.ActionName = Actions[Actions.APPROVE];
      userEvents.PageName = this.router.url.split('?')[0];
      userEvents.CustomerId = this.vioalatorId;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.docType = this.nonLiability.controls['nonLiabilityType'].value;
      if (this.tripIdCSV != '') {
        if (this.docType === 'STOLEN' || this.docType === 'WRONGPLATE') {

          this.disputesService.affidavitForWrongPlate(reqAffidavit, userEvents).subscribe(res => {
            this.wrongAffidavitresponse = res;
            if (res) {
              if (reqAffidavit.NonLiabilityReasonCode === 'STOLEN') {
                this.disputesService.getStolenAccount().subscribe(resStolen => {
                  this.stolenAccountResult = resStolen;
                  if (resStolen) {
                    this.successMessage = 'Trip # (s) ' + this.tripIdCSV.toString() + ' transferred from the account # ' + this.violatorContext.accountId +
                      ' to account # ' + this.stolenAccountResult + ' successfully.';
                    this.prepareContext(this.successMessage);
                    this.router.navigate(['tvc/disputes/view-disputes']);

                  }
                });
              } else {
                this.successMessage = "Trip # (s) " + this.tripIdCSV + " cancelled successfully due to wrong plate Affidavit";
                this.prepareContext(this.successMessage);
                this.router.navigate(['tvc/disputes/view-disputes']);
              }
            } else {
              this.errorMessage = 'Error while transferring trip(s)';
              this.prepareContext(this.errorMessage);
              this.router.navigate(['tvc/disputes/view-disputes']);
            }
          },
            (err) => {
              this.errorMessage = err.statusText.toString();
              this.prepareContext(this.errorMessage);
              this.router.navigate(['tvc/disputes/view-disputes']);
            });
        } else {
          this.disputesService.nonLiabilityAffidavit(reqAffidavit, userEvents).subscribe(
            response => {
              if (response) {
                this.successMessage = 'Transferred Trip(s) to the Account # ' + reqAffidavit.TransferredViolatorId + ' successfully and cancelled  Trip(s) to the Account # ' + this.vioalatorId + ' successfully';
                this.prepareContext(this.successMessage);
                this.router.navigate(['tvc/disputes/view-disputes']);
              } else {
                this.errorMessage = 'Error while transferring trip(s)';
                this.prepareContext(this.errorMessage);
                this.router.navigate(['tvc/disputes/view-disputes']);
              }
            },
            (err) => {
              this.errorMessage = err.statusText.toString();
              this.prepareContext(this.errorMessage);
              this.router.navigate(['tvc/disputes/view-disputes']);
            }
          );
        }
      }
      else if (this.invoiceIdCSV != '') {
        this.disputesService.invoiceDisputeInprocess(reqAffidavit, userEvents).subscribe(
          response => {
            if (response) {
              this.successMessage = 'Invoice(s) # ' + this.invoiceNumbers + ' are disputed successfully';
              this.prepareContext(this.successMessage);
              this.router.navigate(['tvc/disputes/view-disputes']);
            } else {
              this.errorMessage = 'Error while disputing the invoice(s)';
              this.prepareContext(this.errorMessage);
              this.router.navigate(['tvc/disputes/view-disputes']);
            }
          },
          (err) => {
            this.errorMessage = err.statusText.toString();
            this.prepareContext(this.errorMessage);
            this.router.navigate(['tvc/disputes/view-disputes']);
          });
      }
    }
    else {
      this.validateAllFormFields(this.nonLiability);
    }
  }

  createReqAffidavitDTO(isAprrove: boolean): IAffidavitRequest {
    const reqAffidavit = <IAffidavitRequest>{};
    if (this.tripIdCSV != '') {
      reqAffidavit.BeforeCitationIds = this.tripIdCSV;
      reqAffidavit.CitatioIdCSV = this.tripIdCSV;
    }
    else if (this.invoiceIdCSV != '') {
      reqAffidavit.InvoiceIdCSV = this.invoiceIdCSV;
    }
    reqAffidavit.AffidavitId = this.affidavitId;
    reqAffidavit.CreatedUser = this.sessionContextResponse.userName;
    this.docType = this.nonLiability.controls['nonLiabilityType'].value;
    if (isAprrove) {
      if (this.docType === 'Stolen'.toUpperCase() || this.docType === 'Wrongplate'.toUpperCase()) {
        reqAffidavit.TransferredViolatorId = 0;
        reqAffidavit.VehicleNumber = this.objAffidavitResponse.VehicleNumber;
      } else {
        reqAffidavit.TransferredViolatorId = this.objAffidavitsContextRequest.ToCustomerId;
        //this.toCustomerId =this.objAffidavitsContextRequest.ToCustomerId;
        reqAffidavit.VehicleNumber = this.objAffidavitsContextRequest.VehicleNumber;
      }
      if (this.tripIdCSV != '') {
        reqAffidavit.DisputeStatus = 'DISPUTEACCEPTED';
      } else {
        reqAffidavit.DisputeStatus = 'DISPUTEINPROCESS';
      }
    }
    else {
      reqAffidavit.DisputeStatus = 'DISPUTEREJECTED';
      reqAffidavit.VehicleNumber = this.objAffidavitResponse.VehicleNumber;
    }
    reqAffidavit.NonLiabilityReasonCode = this.nonLiability.controls['nonLiabilityType'].value;
    reqAffidavit.UserName = this.sessionContextResponse.userName;
    reqAffidavit.ViolatorId = this.vioalatorId;
    reqAffidavit.ICNId = this.sessionContextResponse.icnId;
    if (this.attachment) {
      reqAffidavit.DocumentPath = this.attachment.Path;
    }
    reqAffidavit.LoginId = this.sessionContextResponse.loginId;
    reqAffidavit.UserId = this.sessionContextResponse.userId;
    reqAffidavit.ActivitySource = ActivitySource[ActivitySource.Internal];

    reqAffidavit.Comments = this.nonLiability.controls['information'].value;

    if (this.isStartDate) {
      let startdate = this.nonLiability.controls['startDate'].value;
      let startTime = this.nonLiability.controls['startTime'].value;

      if (startdate != '') {
        if (startTime != '' && startTime != undefined) {
          startTime = new Date(startTime);
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day, startTime.getHours(), startTime.getMinutes(), 0, 0);
        }
        else {
          this.startDate = new Date(startdate.date.year, startdate.date.month - 1, startdate.date.day);
        }
      }
    }
    if (this.isEndDate) {
      let endDate = this.nonLiability.controls['endDate'].value;
      let endTime = this.nonLiability.controls['endTime'].value;

      if (endDate != '') {
        if (endTime != '' && endTime != undefined) {
          endTime = new Date(endTime);
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day, endTime.getHours(), endTime.getMinutes(), 0, 0);
        }

        else {
          this.endDate = new Date(endDate.date.year, endDate.date.month - 1, endDate.date.day);
        }
      }
    }
    if (this.isStartDate && this.nonLiability.controls['startDate'].value)
      reqAffidavit.StartEffectiveDate = this.startDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    if (this.isEndDate && this.nonLiability.controls['endDate'].value)
      reqAffidavit.EndEffectiveDate = this.endDate.toLocaleString(defaultCulture).replace(/\u200E/g,"");
    return reqAffidavit;
  }

  rejectDispute() {
    this.nonLiability.controls['startDate'].setValidators([]);
    this.nonLiability.controls['startDate'].updateValueAndValidity();
    this.nonLiability.controls['endDate'].setValidators([]);
    this.nonLiability.controls['endDate'].updateValueAndValidity();
    this.nonLiability.controls['cmpFile'].setValidators([]);
    this.nonLiability.controls['cmpFile'].updateValueAndValidity();
    if (this.sessionContextResponse.icnId === 0) {
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgTitle = '';
      this.msgDesc = 'ICN is not assigned to do transactions.';
    }
    this.getCitationIds();
    const reqAffidavit = this.createReqAffidavitDTO(false);

    if (this.isStartDate && this.nonLiability.controls['startDate'].value && this.isEndDate && this.nonLiability.controls['endDate'].value) {
      if (this.startDate > this.endDate) {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgTitle = '';
        this.msgDesc = 'Start Date should be less than End Date';
        return;
      }
    }

    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.ActionName = Actions[Actions.REJECT];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.vioalatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    reqAffidavit.Citation_Status = 'AFDVBAD';
    reqAffidavit.Citation_Type = 'INVALID';
    if (this.tripIdCSV != '') {
      this.disputesService.invalidAffidavit(reqAffidavit, userEvents).subscribe(res => {
        this.affidavitResponse = res;
        if (res) {
          this.successMessage = 'Affidavit rejected successfully due to the Invalid Document';
          this.prepareContext(this.successMessage);
          this.router.navigate(['tvc/disputes/view-disputes']);
        }
      }, (err) => {
        this.errorMessage = err.statusText.toString();
        this.prepareContext(this.errorMessage);
        this.router.navigate(['tvc/disputes/view-disputes']);
      });
    } else if (this.invoiceIdCSV != '') {
      this.disputesService.invoiceDisputReject(reqAffidavit, userEvents).subscribe(res => {
        this.affidavitResponse = res;
        if (res) {
          this.successMessage = 'Affidavit rejected successfully due to the Invalid Document';
          this.prepareContext(this.successMessage);
          this.router.navigate(['tvc/disputes/view-disputes']);
        }
      }, (err) => {
        this.errorMessage = err.statusText.toString();
        this.prepareContext(this.errorMessage);
        this.router.navigate(['tvc/disputes/view-disputes']);
      });
    }
  }

  onInputFieldRangeChanged(event: IMyInputFieldChanged) {
    // console.log(event.value);
    if (event.value != null && event.valid) {
      let minDate = new Date(event.value);
      // console.log(minDate);
      this.myDatePickerOptionEndDate = {
        disableUntil: { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() - 1 },
      }
    }
    if (event.value != "" && !event.valid) {
      this.dateError = true;
    } else {
      this.dateError = false;
    }
  }

  checkExistingAffidavit(affidavitType: string, vehicleNumber: string) {
    const userEvents = <IUserEvents>{};
    this.resDisputeExist = <IAffidavitResponse>{};
    userEvents.FeatureName = Features[Features.DISPUTE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.vioalatorId;
    userEvents.RoleId = parseInt(this.sessionContext.customerContext.roleID);
    userEvents.UserName = this.sessionContext.customerContext.userName;
    userEvents.LoginId = this.sessionContext.customerContext.loginId;

    if (affidavitType && affidavitType.toUpperCase() === 'SALESORTRANSFER') {

      const reqAffidavit = <IAffidavitRequest>{};
      reqAffidavit.FromCustomerId = this.vioalatorId;
      reqAffidavit.VehicleNumber = vehicleNumber;

      this.disputesService.getExistingAffidavit(reqAffidavit, userEvents).subscribe(
        res => {
          if (res) {
            this.resDisputeExist = res;
          }
        },
        (err) => {
          this.errorMessage = err.statusText;
        },
        () => {
          this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {
            if (this.resDisputeExist.ViolatorId > 0) {
              this.isSaleExist = true;
              this.objAffidavitsContextRequest.ToCustomerId = this.resDisputeExist.ViolatorId;
              this.toCustomerId = this.resDisputeExist.ViolatorId;
              this.msgNewAccount = 'A Sale Affidavit has already been submitted to Account # ' + this.resDisputeExist.ViolatorId + ' with Vehicle #: ' + this.resDisputeExist.VehicleNumber + '.\n Do you want to transfer trip(s) to same account?';

            } else {
              this.router.navigate(['tvc/disputes/affidavit-search-violator']);

            }
          });

        });
    }
  }
  yesClick() {
    this.isSaleExist = false;
  }
  noClick() {
    this.router.navigate(['tvc/disputes/affidavit-search-violator']);

  }
  emitFlag() {
    this.isSaleExist = false;
  }

  onInputFieldEndDateChanged(event: IMyInputFieldChanged) {
    console.log(event);
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }

  }


  disputeReset() {


    this.nonLiability.reset();
    this.toCustomerId = 0;
    if (this.affidavitId > 0) {
      this.attachmentsList = [];
      if (this.objAffidavitsContextRequest != undefined && this.objAffidavitsContextRequest.ToCustomerId > 0) {
        this.objAffidavitsContextRequest.ToCustomerId = 0;
      }
      if (this.objAffidavitsContextRequest != null && this.objAffidavitsContextRequest !== undefined) {
        this.objAffidavitsContextRequest = null;
        this.disputecontext.changeResponse(null);
      }
      this.nonLiability.controls['nonLiabilityType'].disable();
      this.populateControlValues(this.affidavitId);
    }
  }

}


