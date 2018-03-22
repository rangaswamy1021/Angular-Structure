import { Component, OnInit, ViewChild } from '@angular/core';
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, SubSystem, defaultCulture } from "../../shared/constants";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CourtService } from "../services/court.service";
import { IAttachmentRequest } from "../../shared/models/attachmentrequest";
import { HelpDeskService } from "../../helpdesk/services/helpdesk.service";
import { CommonService } from "../../shared/services/common.service";
import { ApplicationParameterkey } from "../../shared/applicationparameter";
import { ModalDirective } from "ngx-bootstrap";
import { PaymentMode, PaymentStatus } from "../../payment/constants";
import { AccountStatus } from "../../csc/search/constants";
declare var $: any;
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-courttracking',
  templateUrl: './courttracking.component.html',
  styleUrls: ['./courttracking.component.scss']
})
export class CourttrackingComponent implements OnInit {

  objCustomerTransaction: any;
  checkForm: FormGroup;
  dispositionCheckId: any;
  caseStatusReq: any;
  caseNoReq: any;
  dispositionReq: any;
  courtPaymentStatusReq: any;
  paymentReq: any;
  objListTrips1: any = [];
  chequePayments: any;
  fileMaxSize: number;
  dispositionGuilty: any = 'Guilty';
  dispositionForm: FormGroup;
  dispositionCheckDate: any;
  isDisposition: boolean;
  detailsOfDisposition: any = [];
  validateCaseStatus: boolean = false;
  validateCaseNo: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  editableCaseStatus: any = '';
  editableCaseNo: any = '';
  detailsOfCaseStatus: any = [];
  detailsOfCaseNo: any = [];
  storedTripId: any = 0;
  storedCaseNo: any = '';
  storedTrailStatus: any = '';
  storedCustomerId: any = 0;
  pageClicked: boolean = true;
  courtCustomerResLength: any;

  p: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  searchForm: FormGroup;
  courtCustomerReq: any;
  courtCustomerRes: any = [];
  systemActivity: any;
  validateNumberPattern = "[0-9]*";
  customerId: any = '';
  tripId: any = '';
  causeNo: any = '';
  courtStatus: any = '';
  attachmentsList: IAttachmentRequest[] = [];
  attachment: IAttachmentRequest;
  descriptionMaxLength: number = 255;
  descriptionLength: number = this.descriptionMaxLength;
  @ViewChild('cmpFile') cmpFile;
  @ViewChild('caseStatus') public caseStatusModal: ModalDirective;
  @ViewChild('caseDisposition') public caseDispositionModal: ModalDirective;
  @ViewChild('caseNo') public caseNoModal: ModalDirective;
  defaultStatus: number = 0;
  statuses = [
    {
      id: 0,
      Value: 'Guilty'
    },

    {
      id: 1,
      Value: 'Not Guilty'
    }
  ];
  toDayDate = new Date().toLocaleDateString();

  constructor(private commonService: CommonService, private helpDeskService: HelpDeskService, private loginContext: SessionService, private objCourtService: CourtService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.searchForm = new FormGroup({
      'customerId': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
      'tripId': new FormControl('', [Validators.pattern(this.validateNumberPattern)]),
      'causeNo': new FormControl(''),
      'courtStatus': new FormControl('')
    });
    this.dispositionForm = new FormGroup({
      'disposition': new FormControl(''),
      'uploadFile': new FormControl(''),
      'notes': new FormControl('')
    });
    this.checkForm = new FormGroup({
      'checkId': new FormControl('', [Validators.required, Validators.pattern(this.validateNumberPattern)])
    });
    this.bindCourtCustomers(false, 1);
    this.fileMaxSize = 1;

  }

  SearchCourtCustomers() {
    this.pageClicked = false;
    this.bindCourtCustomers(true, 1);
  }

  resetSearch() {
    this.searchForm.reset();
    this.storedTripId = 0;
    this.storedCaseNo = '';
    this.storedTrailStatus = '';
    this.storedCustomerId = 0;
    this.searchForm.controls['courtStatus'].setValue('');
    this.pageChanged(1);
  }

  bindCourtCustomers(isSearched: boolean, pageNo: number) {
    this.systemActivity = <any>{};
    this.courtCustomerReq = <any>{};

    if (this.pageClicked) {
      this.courtCustomerReq.CustomerId = this.storedCustomerId;
      this.courtCustomerReq.TrailStatus = this.storedTrailStatus;
      this.courtCustomerReq.CaseNo = this.storedCaseNo;
      this.courtCustomerReq.TripId = this.storedTripId;
    } else {
      this.courtCustomerReq.CustomerId = !(this.customerId == '' || this.customerId == null) ? (this.customerId) : 0;
      this.courtCustomerReq.TrailStatus = this.courtStatus == '' ? '' : this.courtStatus;
      this.courtCustomerReq.CaseNo = !(this.causeNo == '' || this.causeNo == null) ? (this.causeNo) : '';
      this.courtCustomerReq.TripId = !(this.tripId == '' || this.tripId == null) ? (this.tripId) : 0;
      this.storedCustomerId = this.courtCustomerReq.CustomerId;
      this.storedTrailStatus = this.courtCustomerReq.TrailStatus;
      this.storedCaseNo = this.courtCustomerReq.CaseNo;
      this.storedTripId = this.courtCustomerReq.TripId;
    }
    this.courtCustomerReq.PageNumber = pageNo;
    this.courtCustomerReq.PageSize = 10;
    this.courtCustomerReq.SortDir = 1;
    this.courtCustomerReq.SortColumn = "COURTCUSTID";

    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.IsViewed = isSearched ? false : true;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivity.IsSearch = isSearched;
    this.systemActivity.SubSystem = SubSystem[SubSystem.COURT];
    this.courtCustomerReq.SystemActivity = this.systemActivity;
    this.objCourtService.searchCourtTracking(this.courtCustomerReq).subscribe(
      res => {
        this.courtCustomerRes = res;
        this.courtCustomerResLength = this.courtCustomerRes.length;
        if (this.courtCustomerRes && this.courtCustomerRes.length > 0) {
          this.totalRecordCount = this.courtCustomerRes[0].ReCount
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      });
  }

  updateCaseNo(details) {
    if (this.editableCaseNo.trim() != '' && this.editableCaseNo != null) {
      this.systemActivity = <any>{};
      this.caseNoReq = <any>{};
      this.caseNoReq.CourtCustId = !(details.CourtCustId == '' || details.CourtCustId == null) ? (details.CourtCustId) : 0;
      this.caseNoReq.CustomerId = !(details.CustomerId == '' || details.CustomerId == null) ? (details.CustomerId) : 0;
      this.caseNoReq.TripId = !(details.TripId == '' || details.TripId == null) ? (details.TripId) : 0;
      this.caseNoReq.UserName = this.loginContext.customerContext.userName;
      this.caseNoReq.CaseNo = this.editableCaseNo.trim();
      this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
      this.systemActivity.UserId = this.loginContext.customerContext.userId;
      this.systemActivity.User = this.loginContext.customerContext.userName;
      this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.systemActivity.SubSystem = SubSystem[SubSystem.COURT];
      this.caseNoReq.SystemActivity = this.systemActivity;
      this.objCourtService.updateCaseNo(this.caseNoReq).subscribe(
        res => {
          if (res) {
            $("#caseNo").modal("hide");
            this.successMessageBlock('Cause Number has been updated successfully for the Trip #: ' + details.TripId);
            this.bindCourtCustomers(false, this.p);
            this.searchForm.reset();
          }
        }, err => {
          this.errorMessageBlock(err.statusText);
        });
    }
    else {
      this.validateCaseNo = true;
    }
  }

  updateCaseStatus(details) {
    if (this.editableCaseStatus != '' && this.editableCaseStatus != null) {
      this.systemActivity = <any>{};
      this.caseStatusReq = <any>{};

      this.caseStatusReq.CourtCustId = !(details.CourtCustId == '' || details.CourtCustId == null) ? (details.CourtCustId) : 0;
      this.caseStatusReq.CustomerId = !(details.CustomerId == '' || details.CustomerId == null) ? (details.CustomerId) : 0;
      this.caseStatusReq.TripId = !(details.TripId == '' || details.TripId == null) ? (details.TripId) : 0;
      this.caseStatusReq.UserName = this.loginContext.customerContext.userName;
      this.caseStatusReq.TrailStatus = this.editableCaseStatus;
      this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
      this.systemActivity.UserId = this.loginContext.customerContext.userId;
      this.systemActivity.User = this.loginContext.customerContext.userName;
      this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.systemActivity.SubSystem = SubSystem[SubSystem.COURT];
      this.caseStatusReq.SystemActivity = this.systemActivity;
      this.objCourtService.updateCaseStatus(this.caseStatusReq).subscribe(
        res => {
          if (res) {
            $("#caseStatus").modal("hide");
            this.successMessageBlock('Case Status has been updated successfully for the Trip #: ' + details.TripId);
            this.searchForm.reset();
            this.editableCaseStatus = '';
            this.bindCourtCustomers(false, this.p);
          }
        }, err => {
          this.errorMessageBlock(err.statusText);
        });
    } else {
      this.validateCaseStatus = true;
    }
  }

  updateDisposition(details) {
    this.systemActivity = <any>{};
    this.dispositionReq = <any>{};
    this.dispositionReq.CourtCustId = !(details.CourtCustId == '' || details.CourtCustId == null) ? (details.CourtCustId) : 0;
    this.dispositionReq.CustomerId = !(details.CustomerId == '' || details.CustomerId == null) ? (details.CustomerId) : 0;
    this.dispositionReq.TripId = !(details.TripId == '' || details.TripId == null) ? (details.TripId) : 0;
    if (this.defaultStatus == 0) {
      this.dispositionReq.DispositionStatus = "Guilty";
    }
    else {
      this.dispositionReq.DispositionStatus = "NotGuilty";
    }
    this.dispositionReq.CaseNo = details.CaseNo;
    this.dispositionReq.EvidencePktCreatedDate = !(details.EvidencePktCreatedDate == '' || details.EvidencePktCreatedDate == null) ? (details.EvidencePktCreatedDate) : new Date();
    //once check the above one
    this.dispositionReq.Description = this.dispositionForm.controls['notes'].value;
    if (this.defaultStatus == 0) {
      this.dispositionReq.DocumentType = "Guilty";
    }
    else {
      this.dispositionReq.DocumentType = "NotGuilty";
    }
    this.dispositionReq.Date = new Date().toLocaleDateString();
    this.dispositionReq.UserName = this.loginContext.customerContext.userName;
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivity.SubSystem = SubSystem[SubSystem.COURT];
    this.dispositionReq.SystemActivity = this.systemActivity;
    this.descriptionLength = this.descriptionMaxLength;

    if (this.cmpFile.nativeElement.files[0]) {
      let file: File = this.cmpFile.nativeElement.files[0];
      let type = file.name.substring(file.name.lastIndexOf('.'));
      if ([".pdf"].indexOf(type.toLowerCase()) > -1) {
        if (file.size / 1048576 < this.fileMaxSize) {
          let formData = new FormData();
          formData.append('upload', file);
          this.objCourtService.uploadFile(formData)
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
                this.cmpFile.nativeElement.value = '';
                this.dispositionReq.DocumentPath = this.attachment.Path;
                this.guiltyAndNonGuiltyStatus(details, this.dispositionReq);
              } else {
                this.errorMessageBlock(data.Result);
                this.cmpFile.nativeElement.value = '';
              }
            });
        } else {
          this.errorMessageBlock('Attach only 1MB document.');
        }
      } else {
        this.errorMessageBlock('Attach PDF document only.');
      }
    }
    else {
      this.guiltyAndNonGuiltyStatus(details, this.dispositionReq);
    }
  }

  guiltyAndNonGuiltyStatus(details, dispositionReq) {
    if (this.defaultStatus == 0) {
      this.objCourtService.updateDispositionStatus(dispositionReq).subscribe(
        res => {
          if (res) {
            $("#caseDisposition").modal("hide");
            this.successMessageBlock("Disposition Status has been updated successfully for the Trip #: " + details.TripId);
            this.bindCourtCustomers(false, this.p);
            this.searchForm.reset();
          }
        }, err => {
          this.errorMessageBlock(err.statusText);
        });
    } else {
      this.objCourtService.updateNonGuiltyStatus(dispositionReq).subscribe(
        res => {
          if (res) {
            $("#caseDisposition").modal("hide");
            this.successMessageBlock("Disposition Status has been updated successfully for the Trip #: " + details.TripId);
            this.bindCourtCustomers(false, this.p);
            this.searchForm.reset();
          }
        }, err => {
          this.errorMessageBlock(err.statusText);
        });
    }
  }

  makePayment(details) {
    this.objListTrips1=[];
    if (this.checkForm.valid) {
      this.paymentReq = <any>{};
      this.chequePayments = <any>{};
      this.objCustomerTransaction = <any>{};
      let tripList = <any>{};
      tripList.CitationId = details.TripId;
      tripList.TripTotalOutstandingAmt = details.ComplaintAmount;
      tripList.TripPaymentAmt = details.ComplaintAmount;
      this.objListTrips1.push(tripList);

      this.paymentReq.objListTrips = this.objListTrips1;
      this.paymentReq.ActivityType = "PMTCHECK";
      this.paymentReq.PaymentMode = PaymentMode[PaymentMode.Cheque];
      this.chequePayments.ChequeDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
      this.chequePayments.ChequeNumber = this.checkForm.controls['checkId'].value;
      this.chequePayments.RoutingNumber = "0000000000";
      this.chequePayments.ChequeStatus = "true";
      this.paymentReq.ChequePayments = this.chequePayments;
      this.paymentReq.CustomerId = details.CustomerId;
      this.paymentReq.TxnAmount = details.ComplaintAmount;
      this.paymentReq.PaymentDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g, "");
      //Common fields for activity for payment
      this.paymentReq.LinkSourceName = "PAYMENTS";
      this.paymentReq.IntiatedBy = this.loginContext.customerContext.userName;
      this.paymentReq.LoggedUserId = details.CustomerId;
      this.paymentReq.LoginId = this.loginContext.customerContext.loginId;
      this.paymentReq.UserId = this.loginContext.customerContext.userId;
      this.paymentReq.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.paymentReq.ICNId = this.loginContext.customerContext.icnId;
      this.paymentReq.AccountIntegration = "MakePayment";
      this.paymentReq.AccountStatus = AccountStatus[AccountStatus.VIO];
      this.paymentReq.PaymentStatus = PaymentStatus[PaymentStatus.InProcess];
      this.paymentReq.SubSystem = SubSystem[SubSystem.COURT];
      this.paymentReq.UserName = this.loginContext.customerContext.userName;
      this.paymentReq.TxnCategory = "PAYMENT";
      this.paymentReq.TripIds = details.TripId;
      this.paymentReq.PaymentFor = "Violation";

      this.objCustomerTransaction.AppTxnTypeCode = "TVCCHKPMT";
      this.objCustomerTransaction.BusinessProcessCode = "VPCCHKPAYMENT";
      this.paymentReq.Description = "Court";
      this.paymentReq.CustomerTransaction = this.objCustomerTransaction;

      this.objCourtService.tripPayment(this.paymentReq).subscribe(
        res => {
          if (res) {
            this.updateCourtPaymentStatus(details);
          }
        }, err => {
          this.errorMessageBlock(err.statusText);
        });
    }
    else {
      this.validateAllFormFields(this.checkForm);
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

  updateCourtPaymentStatus(details) {
    this.systemActivity = <any>{};
    this.courtPaymentStatusReq = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.systemActivity.SubSystem = SubSystem[SubSystem.COURT];
    this.courtPaymentStatusReq.SystemActivity = this.systemActivity;
    this.courtPaymentStatusReq.PaymentAmt = details.ComplaintAmount;
    this.courtPaymentStatusReq.DispositionStatus = 'Guilty Paid';
    this.courtPaymentStatusReq.CourtCustId = !(details.CourtCustId == '' || details.CourtCustId == null) ? (details.CourtCustId) : 0;
    this.courtPaymentStatusReq.UserName = this.loginContext.customerContext.userName;
    this.objCourtService.updateCourtPaymentStatus(this.courtPaymentStatusReq).subscribe(
      res => {
        if (res) {
          this.successMessageBlock('Payment has been done successfully for the complaint Trip #: ' + details.TripId);
          this.bindCourtCustomers(false, this.p);
          $("#caseDisposition").modal("hide");
          this.searchForm.reset();
        }
      }, err => {
        this.errorMessageBlock(err.statusText);
      });

  }

  resetClickDisposition() {
    this.dispositionForm.controls['notes'].reset();
    this.dispositionForm.controls['uploadFile'].reset();
    this.defaultStatus = 0;
    this.descriptionLength = this.descriptionMaxLength;
  }

  resetClickGuilty() {
    this.checkForm.reset();
  }

  getDetailsOfCaseNo(details) {
    this.validateCaseNo = false;
    this.editableCaseNo = details.CaseNo.trim();
    this.detailsOfCaseNo = details;
  }

  getDetailsOfCaseStatus(details) {
    this.validateCaseStatus = false;
    this.detailsOfCaseStatus = details;
  }

  getDispositionDetails(details) {
    this.detailsOfDisposition = details;

    this.dispositionCheckDate = details.dispositionCheckDate;
    if (details.DispositionStatus == 'Guilty') {
      this.isDisposition = false;
    } else {
      if (details.Description != null || details.Description != undefined) {
        alert('Hi');
        this.descriptionLength = this.descriptionMaxLength - details.Description.length;
      }
      else
        this.descriptionLength = this.descriptionMaxLength - 0;
      this.isDisposition = true;
    }

  }

  calculateLength(event: any) {
    this.descriptionLength = 255 - event.target.value.length
  }

  pageChanged(event) {
    this.pageClicked = true;
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bindCourtCustomers(false, this.p);
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