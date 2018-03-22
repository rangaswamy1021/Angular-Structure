import { ICalOptions } from './../../shared/models/datepickeroptions';
import { IAttachmentCourtResponse } from './../model/attachmentresponse';
import { CourtService } from './../services/court.service';
import { Subsystem } from './../../sac/constants';
import { ActivitySource, CourtDocuments } from './../../shared/constants';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IMyInputFieldChanged } from "mydatepicker";
import { AttachmentContextService } from '../services/attachment.context.service';
declare var $: any;

@Component({
  selector: 'app-summarycomplaint',
  templateUrl: './summarycomplaint.component.html',
  styleUrls: ['./summarycomplaint.component.scss']
})
export class SummarycomplaintComponent implements OnInit {
  updatedComplaintSummary: IAttachmentCourtResponse[];
  attachment: any;
  attachmentCourtResponse: IAttachmentCourtResponse;
  updateEvidenceFlag: any;
  SelectedImagePath: any;
  tripId: number;
  summaryComplaintForm: any;

  constructor(private loginContext: SessionService,
    private courtService: CourtService,
    private router: Router,
    private route: ActivatedRoute,
    private AttachmentContextService: AttachmentContextService) { }

  longAccountId: number = 0;
  longCollectionId: number = 0;
  longCourtCustId: number = 0;
  IsUpdateEvidence: boolean;
  tripSelectionRequest: any;
  systemActivity: any;

  //paging properties
  p: number;
  totalRecordCount: number;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  imagePaths: any;
  tripsResponse: any[];
  selectedTripDetails: any;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  objCourtCustomersRequest: any;
  objTripSelection: any;
  precourtDOBResponse: any;
  invalidDate: boolean;

  updatedCourtContextResponse: IAttachmentCourtResponse[] = [];

  tillDay = new Date();
  myDatePickerOptions: ICalOptions = {
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

  ngOnInit() {
  
    this.longAccountId = +this.route.snapshot.paramMap.get('customerid');
    this.longCollectionId = +this.route.snapshot.paramMap.get('collectionid');
    this.longCourtCustId = +this.route.snapshot.paramMap.get('courtid');
    this.updateEvidenceFlag = this.route.snapshot.paramMap.get('isupdated');

    this.summaryComplaintForm = new FormGroup({
      'DOB': new FormControl('', [Validators.required]),
    });
    this.bindSSNDOB();
    this.bingTripDetails(1);
    this.ngxGallerySlider();
  }

  bingTripDetails(pageNumber: number) {
    this.systemActivity = <any>{};
    this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
    this.systemActivity.UserId = this.loginContext.customerContext.userId;
    this.systemActivity.User = this.loginContext.customerContext.userName;
    this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
    this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];

    this.tripSelectionRequest = <any>{};
    this.tripSelectionRequest.CustomerId = this.longAccountId;
    this.tripSelectionRequest.PageNumber = pageNumber;
    this.tripSelectionRequest.PageSize = 10;
    this.tripSelectionRequest.SortColumn = "CITATIONID";
    this.tripSelectionRequest.SortDir = 1;
    this.tripSelectionRequest.SystemActivity = this.systemActivity;
    this.courtService.getTripDetails(this.tripSelectionRequest).subscribe(
      res => {
        this.tripsResponse = res
        if (this.tripsResponse && this.tripsResponse.length > 0) {
          this.totalRecordCount = this.tripsResponse[0].ReCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      });
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.bingTripDetails(this.p);
  }

  //get trip details based on citationid.
  getTripImage(selectedTripRequest: any) {
   
    this.imagePaths = [];
    if (selectedTripRequest.CitationId > 0) {
      this.tripId = selectedTripRequest.CitationId;
      this.courtService.getImagePath(selectedTripRequest.TripId).subscribe(
        res => {
          this.imagePaths = res;
          if (this.imagePaths && this.imagePaths.length > 0) {
            this.imagePaths.forEach(item => {
              this.galleryImages.push({
                small: item.ImagePath, medium: item.ImagePath, big: item.ImagePath
              });
              this.SelectedImagePath = item.ImagePath;
            });
          }
        });
      this.selectedTripDetails = selectedTripRequest;
    }
  }

  ngxGallerySlider() {
    this.galleryOptions = [
      {
        "layout": "thumbnails-top",
        width: '100%',
        height: '524px',
        thumbnailsColumns: 8,
        preview: false,
        previewZoom: true,
        imageSwipe: true,
        imageSize: "contain",
        imageArrows: false,
      }
    ];
    this.galleryImages = []
  }

  onDateChanged(event: IMyInputFieldChanged) {
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }


  //bind DOB details
  bindSSNDOB() {
    this.courtService.getSSNandDOB(this.longAccountId).subscribe(
      res => {
        this.precourtDOBResponse = res;

        var date = new Date(this.precourtDOBResponse.DOB);
        this.summaryComplaintForm.patchValue({
          DOB: date <= new Date(1, 0, 1) ? "" : {
            date: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate() + 1
            }
          }
        });
      });
  }

  

  createSummaryComplaint() {
   
    if (!this.summaryComplaintForm.valid) {
      if (this.selectedTripDetails == null) {
        this.showErrorMsg("Select at least one Trip");
        return false;
      }
      this.validateAllFormFields(this.summaryComplaintForm);
    }
    else {
      if (this.selectedTripDetails != null && this.selectedTripDetails.CitationId > 0) {
        $('#pageloader').modal('show');
        this.objCourtCustomersRequest = <any>{};
        this.objTripSelection = <any>{};
        this.objCourtCustomersRequest.CustomerId = this.longAccountId;
        this.objCourtCustomersRequest.TripId = this.selectedTripDetails.CitationId;
        this.objCourtCustomersRequest.TollAmount = this.selectedTripDetails.OutstandingAmount;
        this.objCourtCustomersRequest.CollectionCustId = this.longCollectionId;
        this.objCourtCustomersRequest.CourtCustId = this.longCourtCustId;
        this.objCourtCustomersRequest.UserName = this.loginContext.customerContext.userName;

        let dobValue = this.summaryComplaintForm.value.DOB;
        if (this.summaryComplaintForm.value.DOB) {
          let dob = new Date(dobValue.date.year, dobValue.date.month - 1, dobValue.date.day);
          this.objCourtCustomersRequest.DOB = dob;
        }

        this.systemActivity = <any>{};
        this.systemActivity.LoginId = this.loginContext.customerContext.loginId;
        this.systemActivity.UserId = this.loginContext.customerContext.userId;
        this.systemActivity.User = this.loginContext.customerContext.userName;
        this.systemActivity.IsViewed = true;
        this.systemActivity.ActivitySource = ActivitySource[ActivitySource.Internal.toString()];
        this.systemActivity.SubSystem = Subsystem[Subsystem.COURT.toString()];
        this.systemActivity.ActivityTypeDescription = "Summary of Complaint document created for the Account # " + this.longAccountId;
        this.objCourtCustomersRequest.SystemActivity = this.systemActivity;

        //prepare trip selection request object
        this.objTripSelection.CustomerId = this.longAccountId;
        this.objTripSelection.VehicleNumber = this.selectedTripDetails.VehicleNumber;
        this.objTripSelection.ExitTripDateTime = this.selectedTripDetails.ExitTripDatetime;
        this.objTripSelection.InvoiceGroupNumber = this.selectedTripDetails.InvoiceGroupNumber;
        this.objTripSelection.TripId = this.selectedTripDetails.CitationId;
        this.objTripSelection.TollAmount = this.selectedTripDetails.OutstandingAmount;
        this.objTripSelection.ImagePath = this.SelectedImagePath;
        this.objCourtCustomersRequest.objTripSelection = this.objTripSelection;
        this.objCourtCustomersRequest.IsEvidenceUpdate = this.updateEvidenceFlag == "true" ? true : false;
        this.attachment = <any>{};
        this.courtService.createCourtDocket(this.objCourtCustomersRequest).subscribe(
          res => {
            this.attachment = res;
            if (this.attachment != null && this.attachment != undefined && this.attachment.CourtCustId > 0) {
             
              if (this.objCourtCustomersRequest.IsEvidenceUpdate) {
                this.attachmentCourtResponse = <IAttachmentCourtResponse>{};
                this.attachmentCourtResponse = this.attachment;

                this.AttachmentContextService.currentContext.subscribe(attachCourtContext => this.updatedComplaintSummary = attachCourtContext);
                if (this.updatedComplaintSummary != null && this.updatedComplaintSummary.length > 0) {
                  this.updatedComplaintSummary.push(this.attachmentCourtResponse);
                  this.updatedCourtContextResponse = this.updatedComplaintSummary;
                  this.AttachmentContextService.changeResponse(this.updatedCourtContextResponse);
                }
                else {
                  this.updatedCourtContextResponse.push(this.attachment);
                  this.AttachmentContextService.changeResponse(this.updatedCourtContextResponse);
                }
               $('#pageloader').modal('hide');
                this.router.navigate(['/court/court/courtselection', this.longAccountId, this.attachment.CourtCustId, this.longCollectionId]);
              }
              else {
                $('#pageloader').modal('hide');
                this.router.navigate(['/court/court/courtselection', this.longAccountId, this.attachment.CourtCustId, this.longCollectionId]);
              }
            }
            else{
              $('#pageloader').modal('hide');
              this.showErrorMsg("Error while generating the summary complaint");
            }
          }, (err) => {
            $('#pageloader').modal('hide');
            this.showErrorMsg(err.statusText.toString());
          });
      }
      else {
        this.showErrorMsg("Select at least one Trip");
        return false;
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {

        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  backNavigation() {
    this.router.navigate(['/court/court/courtselection']);
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

}
