import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { CustomerDetailsService } from './services/customerdetails.service';
import { IDocumentsRequest } from '../documents/models/documentsrequest';
import { ActivitySource, SubSystem, Features, Actions, defaultCulture } from '../../shared/constants';
import { IPaging } from '../../shared/models/paging';
import { IDocumentsResponse } from '../documents/models/documentsresponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ITransactionResponse } from '../../shared/models/transactionresponse';
import { ITransactionRequest } from '../../shared/models/transactionrequest';
import { IStatementRequest } from '../documents/models/statementrequest';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { IUserEvents } from '../../shared/models/userevents';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/services/common.service';
import { IMyDrpOptions,IMyInputFieldChanged } from 'mydaterangepicker';
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { ICalOptions } from "../../shared/models/datepickeroptions";

@Component({
  selector: 'app-request-statement',
  templateUrl: './request-statement.component.html',
  styleUrls: ['./request-statement.component.css']
})
export class RequestStatementComponent implements OnInit {
  invalidDate: boolean;
myDateRangePickerOptions: ICalOptions = {
    dateFormat: 'mm/dd/yyyy',
    firstDayOfWeek: 'mo',
    sunHighlight: false,
    height: '34px',
    width: '260px',
    inline: false,
    alignSelectorRight: false,
    indicateInvalidDateRange: true,
    showClearBtn: false,
    showApplyBtn: false,
    showClearDateRangeBtn: false

  };
  // myDateRangePickerOptions: IMyDrpOptions = { dateFormat: 'mm/dd/yyyy', firstDayOfWeek: 'mo', sunHighlight: true, height: '34px', width: '260px', inline: false, alignSelectorRight: false, indicateInvalidDateRange: true };
  documentRequest: IDocumentsRequest;
  getStatementResponse: IDocumentsResponse[] = <IDocumentsResponse[]>[];
  transactionRequest: ITransactionRequest;
  statementRequest: IStatementRequest;
  statementResponse: ITransactionResponse[] = <ITransactionResponse[]>[];
  paging: IPaging = <IPaging>{};
  createForm: FormGroup;
  strFilePath: string;
  isSave: boolean;
  isDownLoad: boolean;
  myDate: Date;
  bsRangeValue: any;
  viewPath: string;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  constructor(private cdr: ChangeDetectorRef,private datePickerFormatService: DatePickerFormatService,private customerDetailsService: CustomerDetailsService, private customerContext: CustomerContextService, private sessionContext: SessionService, private router: Router, private commonService: CommonService) {
    this.myDate = new Date();

  }
  customerContextResponse: ICustomerContextResponse;
  sessionConstextResponse: IUserresponse;

  p: number;
  pageItemNumber: number = 10;
  dataLength: number = this.getStatementResponse.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getCustomerStatements(this.p, null);

  }
  ngOnInit() {
    this.p = 1;
    this.endItemNumber = 10;
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
    this.isSave = false;
    this.isDownLoad = false;
    this.customerContext.currentContext
      .subscribe(customerContext => { this.customerContextResponse = customerContext; }
      );

    this.sessionConstextResponse = this.sessionContext.customerContext;
    this.createForm = new FormGroup({
      'bsRangeValue': new FormControl('', [Validators.required])
    });
  
    this.patchValue();
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ADHOCSTATEMENT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.getCustomerStatements(this.p, userEvents);
    this.disableButton = !this.commonService.isAllowed(Features[Features.ADHOCSTATEMENT], Actions[Actions.REQUEST], '');
    this.getDocumentPath();

  }

  getCustomerStatements(pageNumber: number, userEvents: any): void {
    this.documentRequest = <IDocumentsRequest>{};
    this.documentRequest.BoundType = 'OutBound';
    this.documentRequest.DocumentType = 'AdHocStatements';
    this.documentRequest.CustomerId = this.customerContextResponse.AccountId;
    this.documentRequest.DocumentStatus = 'ALL';
    this.documentRequest.LoginId = this.sessionConstextResponse.loginId;
    this.documentRequest.UserId = this.sessionConstextResponse.userId;
    this.documentRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.documentRequest.PerformedBy = 'internaluser';
    this.paging.PageSize = 10;
    this.paging.PageNumber = pageNumber;
    this.paging.SortColumn = 'COMMUNICATIONID';
    this.paging.SortDir = 1;
    this.documentRequest.Paging = this.paging;

    this.customerDetailsService.getCustomerStatements(this.documentRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.getStatementResponse = res;
          console.log("response");
          console.log(res);
          this.totalRecordCount = this.getStatementResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }
    );


  }


  generateCustomerStatements(): void {

    if (this.createForm.valid) {
      let dateTime = new Date();
      const strDate = this.createForm.controls['bsRangeValue'].value;
       let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
      // const strDateRange = strDate.slice(',');
      const fromDate = new Date(parsedDate[0]);
     const toDate = new Date(parsedDate[1]);
      if (typeof toDate !== 'undefined' && toDate) {
        if (!this.isSave) {
          this.transactionRequest = <ITransactionRequest>{};
          this.statementRequest = <IStatementRequest>{};
          this.statementRequest.StartDate = fromDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          this.statementRequest.EndDate = toDate.toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
          this.transactionRequest.AccountId = this.customerContextResponse.AccountId; // 10258219
          this.transactionRequest.Exit_TripDateTime = new Date();
          this.transactionRequest.Entry_TripDateTime = dateTime;
          this.transactionRequest.Entry_TripDateTime.setFullYear(dateTime.getFullYear() - 5, 0, 1);
          this.transactionRequest.IsPageLoad = true;
          this.transactionRequest.PageSize = 5;
          this.transactionRequest.PageNumber = 1;
          this.transactionRequest.SortColumn = 'CITATIONID';
          this.transactionRequest.SortDir = 1;

          this.statementRequest.CustomerId = this.customerContextResponse.AccountId; // 10258219
          this.statementRequest.LoginId = this.sessionConstextResponse.loginId;
          this.statementRequest.UserId = this.sessionConstextResponse.userId;
          this.statementRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
          this.statementRequest.PerformedBy = this.sessionConstextResponse.userName;


          let userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.ADHOCSTATEMENT];
          userEvents.ActionName = Actions[Actions.REQUEST];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.customerContextResponse.AccountId;
          userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
          userEvents.UserName = this.sessionConstextResponse.userName;
          userEvents.LoginId = this.sessionConstextResponse.loginId;

if(!this.invalidDate)
          this.customerDetailsService.generateCustomerStatements(this.transactionRequest, this.statementRequest, userEvents).subscribe(
            res => {
              if (res) {
                this.strFilePath = res;
                console.log(res);
                this.isSave = true;
                this.isDownLoad = true;
                this.showSucsMsg('Requested Statement has been generated successfully');
              }
            },
            (err) => {

              this.showErrorMsg(err.statusText);
            }
          );
        }
      } else {
        this.showErrorMsg('select valid Time period');
      }
    }
  }

  saveStatement() {
    const strDate = this.createForm.controls['bsRangeValue'].value;
        let parsedDate = this.datePickerFormatService.getFormattedDateRange(strDate);
   // const strDateRange = strDate.slice(',');
    const fromDate = new Date(parsedDate[0]);
    const toDate = new Date(parsedDate[1]);
    this.documentRequest = <IDocumentsRequest>{};
    this.documentRequest.DocumentType = 'AdHocStatements';
    this.documentRequest.CustomerId = this.customerContextResponse.AccountId; //10258219;
    this.documentRequest.DocumentStatus = 'ALL';
    this.documentRequest.LoginId = this.sessionConstextResponse.loginId;
    this.documentRequest.UserId = this.sessionConstextResponse.userId;
    this.documentRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.documentRequest.PerformedBy = this.sessionConstextResponse.userName;
    this.documentRequest.GeneratedDate = new Date();
    this.documentRequest.QueueId = 0;
    this.documentRequest.SubSystem = SubSystem[SubSystem.CSC];
    this.documentRequest.description = 'Requested Statement from ' + new Date(fromDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"") + ' To ' + new Date(toDate).toLocaleDateString(defaultCulture).replace(/\u200E/g,"");
    this.documentRequest.DocumentPath = this.strFilePath;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.ADHOCSTATEMENT];
    userEvents.ActionName = Actions[Actions.STATEMENTLINK];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.customerContextResponse.AccountId;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;


    this.customerDetailsService.saveCustomerStatements(this.documentRequest , userEvents).subscribe(
      res => {
        if (res) {

          this.getCustomerStatements(this.p, null);
          this.isDownLoad = false;
          this.isSave = false;

        }

      },
      (err) => {
        this.showErrorMsg( err.statusText);
      }
    );

  }

  downLoadStatement() {

    let strFilePath: string;
    this.documentRequest = <IDocumentsRequest>{};
    this.documentRequest.DocumentType = 'ViewStatements';
    this.documentRequest.DocumentPath = this.strFilePath;
    this.customerDetailsService.saveCustomerStatements(this.documentRequest, null).subscribe(
      res => {
        if (res) {
          strFilePath = res;
          console.log(res);
          if (strFilePath !== '') {
            window.open(strFilePath);
          }
        }
      }
    );
  }

  reset() {
    this.isSave = false;
    this.isDownLoad = false;
    this.getCustomerStatements(this.p, null);

  }
  viewButton(documentPath) {

    let strViewPath: string;
    strViewPath = this.viewPath + '/' + documentPath;
    window.open(strViewPath);

  }

  getDocumentPath() {

    this.customerDetailsService.getDoumentPath().subscribe(
      res => {
        if (res) {
          this.viewPath = res;
        }
      }
    );

  }
  cancel() {
     //let parsedDate = this.datePickerFormatService.getFormattedDateRange( this.patchValue);
 
    // const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
    // this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
     this.bsRangeValue =this.patchValue();
    this.getCustomerStatements(this.p, null);

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
   patchValue():void
  {
     let date = new Date();
    this.createForm.patchValue({
      bsRangeValue: {
        beginDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        },
        endDate: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
  }

   ngAfterViewInit() {
this.cdr.detectChanges();
}

onDateRangeFieldChanged(event: IMyInputFieldChanged) {
let date = this.createForm.controls["bsRangeValue"].value;
if (!event.valid && event.value != "") {
this.invalidDate = true;

return;
}
else
this.invalidDate = false;

}
}
