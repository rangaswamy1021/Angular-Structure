import { Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SessionService } from '../../shared/services/session.service';
import { ConfigurationService } from './services/configuration.service';
import { ActivitySource, BulkEmail, SubSystem, Features, Actions, defaultCulture } from '../../shared/constants';
import { FormGroup, FormControl } from '@angular/forms';
import { Subsystem } from '../constants';
import { IUserEvents } from "../../shared/models/userevents";
import { CommonService } from "../../shared/services/common.service";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
//import { IMyDpOptions } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { IMyInputFieldChanged } from "mydatepicker";
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-bulk-emails',
  templateUrl: './bulk-emails.component.html',
  styleUrls: ['./bulk-emails.component.scss']
})
export class BulkEmailsComponent implements OnInit {
  invalidDate: boolean;
  setDate: any;
  bulkEmailform: FormGroup;
  p: number;
  responseAccountStatus: any[];
  responseCustomerPlans: any[];
  responseReplanishmentTypes: any[];
  bulkEmailResponse: any[];
  bulkEmailSelectedResponse: any;
  bulkEmailRequest: any;
  pageItemNumber: number = 10;
  totalRecordCount: number;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  strSourceId: string;
  strSource: string;
  isDeactivate: boolean;
  popupHeading: string;
  popupMessage: string;
  minDate = new Date();
  userEventRequest: IUserEvents = <IUserEvents>{};
  disableButton: boolean = false;
  disableUpdateButton: boolean = false;
  msgFlag: boolean;
  msgType: string;
  msgTitle: string;
  msgDesc: string;
  toDayDate=new Date();
myDatePickerOptions: ICalOptions = { dateFormat:'mm/dd/yyyy',
 firstDayOfWeek: 'mo',
   disableUntil: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate()-1 }, sunHighlight: false,
     showClearBtn: false,
    showApplyBtn: false,
    showClearDateBtn: false, inline: false, alignSelectorRight: false, indicateInvalidDate: true };
  constructor(private context: SessionService,private cdr: ChangeDetectorRef, private router: Router, private commonService: CommonService,private datePickerFormat: DatePickerFormatService,
    private configurationService: ConfigurationService, private materialscriptService: MaterialscriptService ) { }

  ngOnInit() {
         this.materialscriptService.material();
    if (!this.commonService.isAllowed(Features[Features.BULKEMAIL], Actions[Actions.VIEW], "")) {
    }
    this.disableButton = !this.commonService.isAllowed(Features[Features.BULKEMAIL], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.BULKEMAIL], Actions[Actions.UPDATE], "");
    this.p = 1;
    this.endItemNumber = this.pageItemNumber;
    this.bulkEmailform = new FormGroup({
      accountStatus: new FormControl(''),
      accountType: new FormControl(''),
      ReplenishmentType: new FormControl(''),
      zipCode: new FormControl('', []),
      emailAdd: new FormControl(''),
      scheduledDate: new FormControl(''),
      subject: new FormControl(''),
      message: new FormControl(''),
      isforSubscribedCustomer: new FormControl('')
    });
    this.bindDropDowns();
    let userEvent = this.userEvents();
    this.getBulkEmailDetails(this.p, userEvent);
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getBulkEmailDetails(this.p, null);
  }

  bindDropDowns(): void {
    this.getCustomerAccountStatus();
    this.getCustomerPlans();
    this.getReplanishmentTypes();
  }

  getCustomerAccountStatus() {
    this.configurationService.getCustomerAccountStatus().subscribe(
      res => {
        this.responseAccountStatus = res;
        console.log(this.responseAccountStatus);
      }
    );
  }

  getCustomerPlans() {
    this.configurationService.getCustomerPlans().subscribe(
      res => {
        this.responseCustomerPlans = res;
      }
    );
  }

  getReplanishmentTypes() {
    this.configurationService.getReplanishmentTypes().subscribe(
      res => {
        this.responseReplanishmentTypes = res;
        this.responseReplanishmentTypes = this.responseReplanishmentTypes.filter(f => f.LookUpTypeCode != "None");
      }
    );
  }

  getBulkEmailDetails(pageNumber, userEvent) {
    this.bulkEmailRequest = <any>{};
    this.bulkEmailSelectedResponse = [];
    this.bulkEmailRequest.PageNumber = pageNumber;
    this.bulkEmailRequest.PageSize = this.pageItemNumber;
    this.bulkEmailRequest.SortColumn = "";
    this.bulkEmailRequest.SortDir = 1;
    this.bulkEmailRequest.LoginId = this.context.customerContext.loginId;
    this.bulkEmailRequest.UserId = this.context.customerContext.userId;
    this.bulkEmailRequest.PerformedBy = this.context.customerContext.userName;
    this.bulkEmailRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getBulkEmailDetails(this.bulkEmailRequest, userEvent).subscribe(
      res => {
        this.bulkEmailResponse = res;
        if (this.bulkEmailResponse != null) {
          this.dataLength = this.bulkEmailResponse.length;
          if (this.bulkEmailResponse && this.bulkEmailResponse.length > 0) {
            this.totalRecordCount = this.bulkEmailResponse[0].ReCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
        }
      }
    );
  }

  insertBulkEmail() {
    if (this.bulkEmailform.valid) {
      // if ((this.bulkEmailform.controls['accountStatus'].value == "" ||
      //   this.bulkEmailform.controls['accountStatus'].value == null) &&
      //   (this.bulkEmailform.controls['accountType'].value == "" ||
      //     this.bulkEmailform.controls['accountType'].value == "") &&
      //   (this.bulkEmailform.controls['ReplenishmentType'].value == "" ||
      //     this.bulkEmailform.controls['ReplenishmentType'].value == null) &&
      //   (this.bulkEmailform.controls['zipCode'].value == "" ||
      //     this.bulkEmailform.controls['zipCode'].value == null) &&
      //   (this.bulkEmailform.controls['emailAdd'].value == "" ||
      //     this.bulkEmailform.controls['zipCode'].value == null)) {
      //   this.msgFlag = true;
      //   this.msgType = "error";
      //   this.msgTitle = "";
      //   this.msgDesc = "Account Status/Account Type/Replanishment Type/Zip code/Email Address Should be required";
      // }
      //else {
      this.p = 1;
      let sourceId = [];
      let source = [];
      this.bulkEmailRequest = <any>{};
      if (this.bulkEmailform.controls['accountStatus'].value != "") {
        this.strSourceId = this.bulkEmailform.controls['accountStatus'].value;
        this.strSource = BulkEmail[BulkEmail.AccountStatus].toString();
        sourceId.push(this.strSourceId);
        source.push(this.strSource);
      }
      if (this.bulkEmailform.controls['accountType'].value != "") {
        this.strSourceId = this.bulkEmailform.controls['accountType'].value;
        this.strSource = BulkEmail[BulkEmail.AccountType].toString();
        sourceId.push(this.strSourceId);
        source.push(this.strSource);
      }
      if (this.bulkEmailform.controls['ReplenishmentType'].value != "") {
        this.strSourceId = this.bulkEmailform.controls['ReplenishmentType'].value;
        this.strSource = BulkEmail[BulkEmail.ReplenishmentType].toString();
        sourceId.push(this.strSourceId);
        source.push(this.strSource);
      }
      if (this.bulkEmailform.controls['zipCode'].value != "") {
        this.strSourceId = this.bulkEmailform.controls['zipCode'].value;
        this.strSource = BulkEmail[BulkEmail.ZipCode].toString();
        sourceId.push(this.strSourceId);
        source.push(this.strSource);
      }
      if (this.bulkEmailform.controls['emailAdd'].value != "") {
        this.strSourceId = this.bulkEmailform.controls['emailAdd'].value;
        this.strSource = BulkEmail[BulkEmail.Email].toString();
        sourceId.push(this.strSourceId);
        source.push(this.strSource);
      }
      this.bulkEmailRequest.SubSystem = SubSystem[Subsystem.SAC].toString()
      this.bulkEmailRequest.CSVSourceId = sourceId.toString();
      this.bulkEmailRequest.CSVSource = source.toString();

      let startDate = this.bulkEmailform.controls['scheduledDate'].value;
      let date = this.datePickerFormat.getFormattedDate(startDate.date);
      this.setDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      this.bulkEmailRequest.ScheduledDate = this.setDate;

      this.bulkEmailRequest.Subject = this.bulkEmailform.controls['subject'].value;
      this.bulkEmailRequest.EmailBody = this.bulkEmailform.controls['message'].value;
      this.bulkEmailRequest.IsforSubscribedCustomer = this.bulkEmailform.controls['isforSubscribedCustomer'].value;
      this.bulkEmailRequest.CreatedUser = this.context.customerContext.userName;
      this.bulkEmailRequest.Status = BulkEmail[BulkEmail.Init].toString();
      let userEvent = this.userEvents();
      userEvent.ActionName = Actions[Actions.CREATE];
      this.configurationService.createBulkEmailDetails(this.bulkEmailRequest, userEvent).subscribe(
        res => {
          this.msgFlag = true;
          this.msgType = "success";
          this.msgTitle = "";
          this.msgDesc = "Successfully Inserted Bulk Emails";
          this.getBulkEmailDetails(this.p, null);
          this.bulkEmailform.controls['scheduledDate'].reset();
        }, (err) => {
          this.msgFlag = true;
          this.msgType = "error";
          this.msgTitle = "";
          this.msgDesc = err.statusText.toString();
        },
        () => {
          $('#accountStatus').val('');
          $('#accountType').val('');
          $('#ReplenishmentType').val('');
          $('#zipCode').val('');
          $('#emailAdd').val('');
          $('#scheduledDate').val('');
          $('#subject').val('');
          $('#isforSubscribedCustomer').val(false);
          this.bulkEmailform.controls["isforSubscribedCustomer"].reset();
          $('#message').val('');
        }
      );
      //}
    }
    else {
      this.validateAllFormFields(this.bulkEmailform);
      // if ((this.bulkEmailform.controls['accountStatus'].value == "" ||
      //   this.bulkEmailform.controls['accountStatus'].value == null) &&
      //   (this.bulkEmailform.controls['accountType'].value == "" ||
      //     this.bulkEmailform.controls['accountType'].value == "") &&
      //   (this.bulkEmailform.controls['ReplenishmentType'].value == "" ||
      //     this.bulkEmailform.controls['ReplenishmentType'].value == null) &&
      //   (this.bulkEmailform.controls['zipCode'].value == "" ||
      //     this.bulkEmailform.controls['zipCode'].value == null) &&
      //   (this.bulkEmailform.controls['emailAdd'].value == "" ||
      //     this.bulkEmailform.controls['emailAdd'].value == null)) {
      //   this.msgFlag = true;
      //   this.msgType = "error";
      //   this.msgTitle = "";
      //   this.msgDesc = "Account Status/Account Type/Replanishment Type/Zip code/Email Address Should be required";
      // }
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

  resetFrom() {
    this.p = 1;
    this.bulkEmailform.reset();
    this.getBulkEmailDetails(this.p, null);
    let a=this;
   setTimeout(function() {
     a.materialscriptService.material();
   }, 100);
  }

  deactivate(res) {
    this.bulkEmailSelectedResponse = res;
    this.msgFlag = true;
    this.msgType = "alert";
    this.msgTitle = "Alert";
    this.msgDesc = "Are you sure you want to deactivate the template? ";
  }

  deactivateEmail(event) {
    if (event) {
      this.bulkEmailRequest = <any>{};
      this.bulkEmailRequest.AutoId = this.bulkEmailSelectedResponse.AutoId;
      this.bulkEmailRequest.CreatedUser = this.context.customerContext.userName;
      this.bulkEmailRequest.Status = "Inactive";
      this.bulkEmailRequest.LoginId = this.context.customerContext.loginId;
      this.bulkEmailRequest.UserId = this.context.customerContext.userId;
      this.bulkEmailRequest.PerformedBy = this.context.customerContext.userName;
      this.bulkEmailRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      let userEvent = this.userEvents();
      userEvent.ActionName = Actions[Actions.UPDATE];
      this.configurationService.updateBulkEmailDetails(this.bulkEmailRequest, userEvent).subscribe(
        res => {
          this.getBulkEmailDetails(this.p, null);
          this.msgFlag = true;
          this.msgType = "success";
          this.msgTitle = "";
          this.msgDesc = "Bulk Emails Deactivated Successfully";
        }, (err) => {
          this.msgFlag = true;
          this.msgType = "error";
          this.msgTitle = "";
          this.msgDesc = err.statusText.toString();
        }, () => {
          this.bulkEmailform.reset;
        });
    }
    else {
      this.msgFlag = false;
    }
  }

  userEvents(): IUserEvents {
    this.userEventRequest.FeatureName = Features[Features.BULKEMAIL];
    this.userEventRequest.ActionName = Actions[Actions.VIEW];
    this.userEventRequest.PageName = this.router.url;
    this.userEventRequest.CustomerId = 0;
    this.userEventRequest.RoleId = parseInt(this.context.customerContext.roleID);
    this.userEventRequest.UserName = this.context.customerContext.userName;
    this.userEventRequest.LoginId = this.context.customerContext.loginId;
    return this.userEventRequest;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  ngAfterViewInit() {
this.cdr.detectChanges();
}

onDateRangeFieldChanged(event: IMyInputFieldChanged) {
let date = this.bulkEmailform.controls["scheduledDate"].value;
if (!event.valid && event.value != "") {
this.invalidDate = true;

return;
}
else
this.invalidDate = false;

}
}