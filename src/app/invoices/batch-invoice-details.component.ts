import { ViolatordetailsService } from '../tvc/violatordetails/services/violatordetails.service';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { IInvoiceRequest } from './models/invoicesrequest';
import { ISystemActivities } from '../shared/models/systemactivitiesrequest';
import { IUserresponse } from '../shared/models/userresponse';
import { ICustomerContextResponse } from '../shared/models/customercontextresponse';
import { SessionService } from '../shared/services/session.service';
import { InvoiceService } from './services/invoices.service';
import { CustomerAccountsService } from '../csc/customeraccounts/services/customeraccounts.service';
import { CustomerContextService } from '../shared/services/customer.context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IInvoicesContextResponse } from '../shared/models/invoicescontextresponse';
import { InvoicesContextService } from '../shared/services/invoices.context.service';
import { IInvoiceResponse } from './models/invoicesresponse';
import { IViolatorContextResponse } from '../shared/models/violatorcontextresponse';
import { ViolatorContextService } from '../shared/services/violator.context.service';
import { IProfileResponse } from '../csc/search/models/ProfileResponse';
import { SubSystem, Features, Actions, defaultCulture } from '../shared/constants';
import { IUserEvents } from '../shared/models/userevents';
import { CommonService } from '../shared/services/common.service';
import { IMyInputFieldChanged } from 'mydatepicker';
import { ICalOptions } from '../shared/models/datepickeroptions';
import { TripsContextService } from '../shared/services/trips.context.service';
import { MaterialscriptService } from "../shared/materialscript.service";

@Component({
  selector: 'app-batch-invoice-details',
  templateUrl: './batch-invoice-details.component.html',
  styleUrls: ['./batch-invoice-details.component.scss']
})
export class BatchInvoiceDetailsComponent implements OnInit {
  newDueDateValue: any;
  invalidDate: boolean = false;


  @Input() invoiceStatus: string; // = 'MostRecent';
  invoiceRequest: IInvoiceRequest = <IInvoiceRequest>{};
  invoiceRequestForFee: IInvoiceRequest = <IInvoiceRequest>{};
  accountId: number;
  invoiceId: number;
  isPayLinkVisible: boolean;
  isViewInvoice: boolean;
  documentPath: string;
  virtualPath: string;
  outStandingAmount: number;
  invoiceResponse: IInvoiceResponse = <IInvoiceResponse>{};
  profileResponse: IProfileResponse = <IProfileResponse>{};
  currentInvoiceResponse: IInvoiceResponse[] = <IInvoiceResponse[]>{};
  systemActivites: ISystemActivities;
  sessionConstextResponse: IUserresponse;
  customerContextResponse: ICustomerContextResponse;
  invoiceContextResponse: IInvoicesContextResponse;

  invoiceIdForHistory: number;
  isFlagForBatchInv: boolean;
  isBeforeSearch: boolean;
  private sub: any;
  violatorContextResponse: IViolatorContextResponse;
  searchInvStatus: string;
  isExtension: boolean;
  invoiceDuedateResponse: IInvoiceResponse = <IInvoiceResponse>{};
  gracePerioddays: number = 0;
  disableButton: boolean;
  violatorId: number = 0;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  manualholddays: number;
  isInvocieHoldExist: boolean = false;
    dueDateModel: object = {};

  myDatePickerOptions: ICalOptions;

  //for date picker
  minDate = new Date();
  maxDate = new Date(2070, 9, 15);
  _bsValue: Date;
  get bsValue(): Date {
    return this._bsValue;
  }
  set bsValue(v: Date) {
    console.log(v);
    this._bsValue = v;
  }
  constructor( private materialscriptService:MaterialscriptService,private invoiceService: InvoiceService, private customerService: CustomerAccountsService,
    private customerContext: CustomerContextService, private violatorDetailsService: ViolatordetailsService, private sessionContext: SessionService, private router: Router,
    private invoiceContextService: InvoicesContextService, private violatorContext: ViolatorContextService, private commonService: CommonService, private cdr: ChangeDetectorRef,private tripContextService: TripsContextService) { }


  ngOnInit() {
 this.materialscriptService.material();
    this.isExtension = false;
    this.isFlagForBatchInv = true;
    this.violatorContext.currentContext.subscribe(vioContext => this.violatorContextResponse = vioContext);
    if (this.violatorContextResponse) {
      this.violatorId = this.violatorContextResponse.accountId;
    }
    this.invoiceContextService.currentContext.subscribe(invoicesContext => this.invoiceContextResponse = invoicesContext);
    this.isPayLinkVisible = false;


    this.sessionConstextResponse = this.sessionContext.customerContext;
    this.customerContextResponse = this.customerContext.customerContext;
    this.accountId = this.invoiceContextResponse.CustomerId;
    this.invoiceId = this.invoiceContextResponse.InvoiceId;
    this.isBeforeSearch = this.invoiceContextResponse.isBeforeSearch;
    this.searchInvStatus = this.invoiceContextResponse.invoiceStatus;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorId;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.getCustomerDetails(this.accountId, userEvents);
    this.disableButton = !this.commonService.isAllowed(Features[Features.VIOLATORINVOICE], Actions[Actions.EDITDUEDATE], '');
    this.getBatchInvoiceDetails(this.invoiceId);
    this.getVituralPath();
    this.getManualHoldDays();
    this.checkInvoiceHoldExist();
  }

  checkInvoiceHoldExist() {
    let boolInvoiceHold = false;
    this.invoiceService.checkInvoiceHoldExists(this.invoiceContextResponse.InvoiceId).subscribe(
      res => {
        if (res != null) {
          boolInvoiceHold = res;
        }
      }, (err) => {
      }
      , () => {
        this.isInvocieHoldExist = boolInvoiceHold;
      });
  }

  getBatchInvoiceDetails(invoiceId: number) {
    this.invoiceIdForHistory = this.invoiceContextResponse.InvoiceId;
    this.isViewInvoice = true;
    this.invoiceRequest.PageSize = 10;
    this.invoiceRequest.PageNumber = 1;
    this.invoiceRequest.SortColumn = '';
    this.invoiceRequest.SortDirection = 1;
    this.invoiceRequest.InvoiceOption = this.invoiceStatus;

    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.AccountId = this.accountId;
    this.invoiceRequest.SystemUserActivityInd = false;
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;
    this.invoiceRequest.SystemActivity = this.systemActivites;
    this.invoiceService.getInvoiceBatchDetails(this.invoiceRequest).subscribe(
      res => {
        this.invoiceResponse = res;
        let newDate=new Date(this.invoiceResponse.DueDate);

         this.dueDateModel = {
          date: {
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
          }
        };
        this.invoiceResponse.OutstandingDue = (this.invoiceResponse.BalanceDue - this.invoiceResponse.UnbilledAmount) <= 0 ? 0 : (this.invoiceResponse.BalanceDue - this.invoiceResponse.UnbilledAmount);
        this.isPayLinkVisible = this.invoiceResponse.OutstandingDue > 0 ? true : false;
        console.log(res);
      }
    );

  }

  getCustomerDetails(accountId: number, userEvents: any) {
    this.invoiceService.getCustomerDefaultDetails(this.accountId, userEvents).subscribe(
      res => {
        this.profileResponse = res;
        console.log(res);
      }
    );

  }



  goToPayment(object: any) {

    this.tripContextService.changeResponse(null);
    this.savingData();
    const link = ['tvc/paymentdetails/violation-payment'];
    this.router.navigate(link);

  }
  savingData() {
    this.invoiceContextResponse = <IInvoicesContextResponse>{};
    this.invoiceContextResponse.invoiceIDs = [];
    this.invoiceContextResponse.invoiceIDs.push(this.invoiceId);
    this.invoiceContextResponse.CustomerId = this.accountId;
    this.invoiceContextResponse.InvoiceId = this.invoiceId;
    this.invoiceContextResponse.AccountId = this.accountId;
    this.invoiceContextResponse.isBeforeSearch = this.isBeforeSearch;
    this.invoiceContextResponse.invoiceStatus = this.searchInvStatus;


    if (this.invoiceContextResponse.isBeforeSearch) {
      this.invoiceContextResponse.referenceURL = 'tvc/invoices/batch-invoice-details';
    } else {
      this.invoiceContextResponse.referenceURL = 'tvc/customerdetails/invoices/batch-invoice-details';
    }
    this.invoiceContextService.changeResponse(this.invoiceContextResponse);
  }

  goToComplaint() {

    const link = ['helpdesk/complaintmanagement/create/'];
    this.router.navigate(link);

  }
  downLoadFile(docPath: string) {
    let strViewPath: string;
    if (docPath !== '') {
      strViewPath = this.virtualPath + docPath;
      window.open(strViewPath);
    }
    else {
      this.showErrorMsg('File not found');
      return;
    }

  }
  getVituralPath() {
    this.invoiceService.getVirtualPath().subscribe(
      res => {
        this.virtualPath = res;
      }
    );

  }
  goToSearch() {
    this.router.navigate(['/csc/search/invoice'], { queryParams: { invoiceNo: this.invoiceId, accountNo: this.accountId } });
  }
 backToSearch() {
  
if (this.invoiceContextResponse.isBeforeSearch) {
this.router.navigate(['/tvc/search/invoice-search']);
} else {
this.router.navigate(['/tvc/customerdetails/search/invoice-search']);
}

 let a=this;
   setTimeout(function() {
     a.materialscriptService.material();
   }, 100);
}
  exit() {
    this.invoiceContextService.changeResponse(null);
    this.violatorContext.changeResponse(null);
    if (!this.isBeforeSearch) {
      this.router.navigate(['tvc/search/violation-search']);
    } else {
      this.router.navigate(['/tvc/search/invoice-search']);
    }


  }

  dueDateExtension() {
    this.isExtension = true;
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceService.getInvoiceDuedateExtensionDetails(this.invoiceRequest).subscribe(
      res => {
        this.invoiceDuedateResponse = res;
        if (this.invoiceDuedateResponse !== null) {
          this.minDate = this.invoiceDuedateResponse.ActualDueDate;
          this.maxDate = this.invoiceDuedateResponse.MaxExtensionDate;
          let minimumDate: Date = new Date(this.invoiceDuedateResponse.ActualDueDate);
          minimumDate.setDate(minimumDate.getDate());
          this.minDate = minimumDate;
          let maximumDate: Date = new Date(this.invoiceDuedateResponse.MaxExtensionDate);
          maximumDate.setDate(maximumDate.getDate());
          this.maxDate = maximumDate;

          this.myDatePickerOptions = {
            dateFormat: 'mm/dd/yyyy',
            firstDayOfWeek: 'mo',
            disableUntil: { year: this.minDate.getFullYear(), month: this.minDate.getMonth() + 1, day: this.minDate.getDate() - 1 },
            disableSince: { year: this.maxDate.getFullYear(), month: this.maxDate.getMonth() + 1, day: this.maxDate.getDate() + 1 },
            sunHighlight: false,
            showClearBtn: false,
            showApplyBtn: false,
            showClearDateBtn: false, inline: false, alignSelectorRight: false, indicateInvalidDate: true
          };


          let currentDate: Date = new Date();
          let scheduleDate: Date = new Date(this.minDate);
          let days;
          days = this.invoiceDuedateResponse.GracePeriodDays;
          scheduleDate.setDate(scheduleDate.getDate() + parseInt(days.toString()));

          if (scheduleDate.toUTCString() < currentDate.toUTCString()) {
            this.isExtension = false;
            this.showErrorMsg('Due date extension available period has been crossed');
            return;
          } else if (this.invoiceDuedateResponse.IsAgingHold) {
            this.isExtension = false;
            this.showErrorMsg('Selected invoice in Payment plan');
            return;

          } else {
            this.invoiceService.checkManualHoldExists(this.accountId).subscribe(
              ress => {
                if (ress) {
                  this.isExtension = false;
                  this.showErrorMsg('Manual hold initiated for this account');
                  return;

                }

              }
            );
          }

        }
      }
    );

  }
  cancel() {
    this.invalidDate=false;
    this.isExtension = false;   
    this.getBatchInvoiceDetails(this.invoiceId);

  }
  submit() {
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATORINVOICE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorContextResponse.accountId > 0 ? this.violatorContextResponse.accountId : 0;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.invoiceRequest.AccountId = this.accountId;
    this.invoiceRequest.InvoiceId = this.invoiceContextResponse.InvoiceId;
    this.invoiceRequest.InvoiceDueDate =  this.newDueDateValue.toLocaleString(defaultCulture).replace(/\u200E/g, '');//this.invoiceResponse.DueDate.toLocaleString(defaultCulture).replace(/\u200E/g, '');
    this.invoiceRequest.OldInvoiceDueDate = this.invoiceDuedateResponse.DueDate.toLocaleString(defaultCulture).replace(/\u200E/g, '');
    let days;
    days = this.invoiceDuedateResponse.GracePeriodDays;
    let scheduleDate: Date =new Date( this.newDueDateValue); //new Date(this.invoiceResponse.DueDate);
    scheduleDate.setDate(scheduleDate.getDate() + parseInt(days.toString()));
    this.invoiceRequest.InvoiceScheduleDate = scheduleDate.toLocaleString(defaultCulture).replace(/\u200E/g, '');
    this.invoiceRequest.UserName = this.sessionConstextResponse.userName;
    this.invoiceRequest.SubSystem = SubSystem[SubSystem.TVC];
    if(!this.invalidDate)
    this.invoiceService.updateInvoiceDueDate(this.invoiceRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.getBatchInvoiceDetails(this.invoiceId);
          this.showSucsMsg('Due date extended sucessfully.');
          this.isExtension = false;
          return;

        } else {
          this.showErrorMsg('Error while doing due date extension');
          this.isExtension = false;
          return;
        }

      }, (err) => {
        this.showErrorMsg(err.statusText.toString());
      },
    );
  }

  setOutputFlag(e) {
    this.msgFlag = e;
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

  getManualHoldDays() {
    this.commonService.getApplicationParameterValueByParameterKey('InvoiceHoldDays').subscribe(
      res => {
        this.manualholddays = res;
      });
  }

  alertClick() {
    this.msgFlag = true;
    this.msgType = 'alert';
    if (this.isInvocieHoldExist)
      this.msgDesc = 'Are you sure, you want to remove the hold?';
    else
      this.msgDesc = 'Are you sure, you want to hold the invoice?';
  }


  userAction(event) {
    if (event) {
      if (this.isInvocieHoldExist) {
        this.RemoveInvoice();
        this.checkInvoiceHoldExist();

      } else {
        this.holdInvoice();
        this.checkInvoiceHoldExist();
      }
    }
  }

  holdInvoice() {
    let boolSucess = false;
    this.violatorDetailsService.isExistsPaymentplanPromisetopay(this.accountId)
      .subscribe(res => {
        if (res && res.PaymentPlan) {
          this.showErrorMsg('Payment plan exists for this customer');
          return;
        } else {
          this.invoiceService.checkManualHoldExists(this.accountId).subscribe(
            res => {
              if (res) {
                this.isExtension = false;
                this.showErrorMsg('Manual hold initiated for this account');
                return;
              }
              else {
                if (this.invoiceResponse) {
                  let holdRequestObject = <any>{};
                  holdRequestObject.InvoiceId = this.invoiceContextResponse.InvoiceId;
                  holdRequestObject.InvoiceNumber = this.invoiceResponse.InvoiceNumber;
                  holdRequestObject.AccountId = this.accountId;
                  var todayDate = new Date();
                  todayDate.setDate(todayDate.getDate() + parseInt(this.manualholddays.toString()));
                  //todayDate.setDate(todayDate.getDate() + 15);
                  holdRequestObject.InvoiceHoldEndDate = todayDate.toLocaleString(defaultCulture).replace(/\u200E/g, '');
                  holdRequestObject.UserName = this.sessionConstextResponse.userName;
                  this.invoiceService.createInvoiceHold(holdRequestObject).subscribe(
                    res => {
                      if (res != null) {
                        boolSucess = res;
                      }
                    }, (err) => {
                      this.showErrorMsg('Error while creating Hold for this invoice');
                    },
                    () => {
                      if (boolSucess) {
                        this.checkInvoiceHoldExist();
                        this.getBatchInvoiceDetails(this.invoiceId);
                        this.showSucsMsg('Hold successfully created for this invoice');
                      }

                    }

                  );
                }
              }
            });
        }
      });
  }

  RemoveInvoice() {
    let boolSucess = false;
    if (this.invoiceResponse) {
      let holdRequestObject = <any>{};
      holdRequestObject.InvoiceId = this.invoiceContextResponse.InvoiceId;
      holdRequestObject.InvoiceNumber = this.invoiceResponse.InvoiceNumber;
      holdRequestObject.AccountId = this.accountId;
      holdRequestObject.UserName = this.sessionConstextResponse.userName;
      this.invoiceService.removeInvoiceHold(holdRequestObject).subscribe(
        res => {
          if (res != null) {
            boolSucess = res;
          }
        }, (err) => {
          this.showErrorMsg('Error while releasing from Invoice Hold');
        },
        () => {
          if (boolSucess) {
            this.checkInvoiceHoldExist();
            this.getBatchInvoiceDetails(this.invoiceId);
            this.showSucsMsg('Successfully released from Invoice Hold');
          }


        }

      );
    }
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    this.newDueDateValue=event.value;
    if (!event.valid && event.value != '') {
      this.invalidDate = true;

      return;
    }
    else
      this.invalidDate = false;

  }


}
