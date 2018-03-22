import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { InvoiceService } from '../../invoices/services/invoices.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { SessionService } from '../../shared/services/session.service';
import { IPaging } from '../../shared/models/paging';
import { IUserresponse } from '../../shared/models/userresponse';
import { IInvoiceSearchRequest } from '../../invoices/models/invoicesearchrequest';
import { IInvoiceSearchResponse } from '../../invoices/models/invoicesearchresponse';
import { ActivitySource, SubSystem, Features, Actions } from '../../shared/constants';
import { ISystemActivities } from '../../shared/models/systemactivitiesrequest';
import { CommonService } from '../../shared/services/common.service';
import { IUserEvents } from "../../shared/models/userevents";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-invoices-search',
  templateUrl: './invoices-search.component.html',
  styleUrls: ['./invoices-search.component.css']
})
export class InvoicesSearchComponent implements OnInit, OnChanges  {
  sortingColumn: any;
  sortingDirection: boolean;
  gridArrowInvoiceNumber: boolean;

  p: number;
  createForm: FormGroup;
  constructor(private invoiceService: InvoiceService, private router: Router, private route: ActivatedRoute, private customerContext: CustomerContextService, private sessionContext: SessionService, private commonService: CommonService, private materialscriptService:MaterialscriptService) { }

  searchRequest: IInvoiceSearchRequest = <IInvoiceSearchRequest>{};
  searchResponse: IInvoiceSearchResponse[];
  systemActivites: ISystemActivities;
  paging: IPaging = <IPaging>{};
  sessionConstextResponse: IUserresponse;
  pageItemNumber: number = 10;
  dataLength: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  totalRecordCount: number;
  invoiceId: number;
  accountId: number;
  isVisible: boolean;
  customerId: number;
  invoiceNumber: string;
  bothSearch: number;
  disableButton: boolean;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  ngOnInit() {
    this.gridArrowInvoiceNumber = true;
    this.materialscriptService.material();
    this.bothSearch = 1;
    this.p = 1;
    this.createForm = new FormGroup({
      'AccountNo': new FormControl('', []),
      'InvoiceNo': new FormControl('', []),

    });





    this.sessionConstextResponse = this.sessionContext.customerContext;

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.INVOICESSEARCH];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
    userEvents.UserName = this.sessionConstextResponse.userName;
    userEvents.LoginId = this.sessionConstextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => {

    }

    );
    this.disableButton = !this.commonService.isAllowed(Features[Features.INVOICESSEARCH], Actions[Actions.SEARCH], '');


    this.route.queryParams.subscribe(params => {
      this.customerId = params['accountNo'];
      this.invoiceNumber = params['invoiceNum'];
      this.bothSearch = params['search'];
    });

    if (this.customerId > 0 || this.invoiceNumber !== '') {
      if (this.bothSearch <= 0) {
        this.createForm.patchValue({
          InvoiceNo: this.invoiceNumber,

        });
      }
      else {
        this.createForm.patchValue({
          InvoiceNo: this.invoiceNumber,
          AccountNo: this.customerId,


        });


      }

      if (this.customerId > 0) {
        this.invoiceSearch(this.p, null);
      }
    }
  }
  ngOnChanges(){
       this.materialscriptService.material();
  }
  

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
      this.endItemNumber = this.dataLength;
  }

  invoiceSearch(pageNumber: number, userEvents: any) {
    this.bothSearch = 1;

    if (this.createForm.controls['AccountNo'].value === null || this.createForm.controls['AccountNo'].value === '') {
      this.searchRequest.CustomerId = 0;
    } else {
      this.searchRequest.CustomerId = this.createForm.controls['AccountNo'].value; // 10258206;
    }
    if (this.createForm.controls['InvoiceNo'].value === null || this.createForm.controls['InvoiceNo'].value === '') {
      this.searchRequest.InvoiceNumber = '';
    } else {
      this.searchRequest.InvoiceNumber = this.createForm.controls['InvoiceNo'].value; // 1111;
    }

    if (this.searchRequest.CustomerId <= 0 && this.searchRequest.InvoiceNumber !== '') {
      this.bothSearch = 0;
    }

    this.searchRequest.PageSize = 10;
    this.searchRequest.PageNumber = pageNumber;
    this.searchRequest.SortColumn = this.sortingColumn;
    this.searchRequest.SortDir = this.sortingDirection == false ? 1 : 0;
    this.systemActivites = <ISystemActivities>{};
    this.systemActivites.LoginId = this.sessionConstextResponse.loginId;
    this.systemActivites.UserId = this.sessionConstextResponse.userId;
    this.systemActivites.User = this.sessionConstextResponse.userName;
    this.searchRequest.SystemActivity = this.systemActivites;
    this.searchRequest.IsCustomerInvoice = false;
    this.searchRequest.SearchActivityIndicator = true;

    this.invoiceService.invoiceSearch(this.searchRequest, userEvents).subscribe(res => {
      if (res) {
        this.searchResponse = res;
        this.isVisible = true;

      }
    },
      err => {
      },
      () => {
        if (this.searchResponse.length) {
          if (this.searchResponse[0].RecCount != null) {
            this.totalRecordCount = this.searchResponse[0].RecCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            } else {
              this.endItemNumber = this.pageItemNumber;
            }
          }
        }
      }
    );
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      if ((this.createForm.controls['AccountNo'].value !== '' && this.createForm.controls['AccountNo'].value != null &&
        this.createForm.controls['AccountNo'].value !== undefined) ||
        (this.createForm.controls['InvoiceNo'].value !== '' && this.createForm.controls['InvoiceNo'].value !== null &&
          this.createForm.controls['InvoiceNo'].value !== undefined)) {

        let userEvents = <IUserEvents>{};
        userEvents.FeatureName = Features[Features.INVOICESSEARCH];
        userEvents.ActionName = Actions[Actions.SEARCH];
        userEvents.PageName = this.router.url;
        userEvents.CustomerId = 0;
        userEvents.RoleId = parseInt(this.sessionConstextResponse.roleID);
        userEvents.UserName = this.sessionConstextResponse.userName;
        userEvents.LoginId = this.sessionConstextResponse.loginId;

        this.invoiceSearch(this.p, userEvents);
      } else {
        this.showErrorMsg('Please fill at-least one field');
        return;
      }
    }

  }

  reset(): void {
    this.createForm.reset();
    this.isVisible = false;
    this.searchResponse = null;
    this.customerId = 0;
    this.invoiceNumber = '';
    this.bothSearch = 1;
  }
  goToView(object: any) {
    this.router.navigate(['csc/invoices/invoice-details'], { queryParams: { invoiceNo: object.InvoiceId, customerId: object.CustomerId, invoiceNum: this.searchRequest.InvoiceNumber, search: this.bothSearch } });

  }

   setOutputFlag(e) {
    this.msgFlag = e.flag;
    this.msgType = e.type;
  }

  showErrorMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'error';
    this.msgDesc = msg;

  }

  sortDirection(SortingColumn) {
    this.gridArrowInvoiceNumber = true;


    this.sortingColumn = SortingColumn;
    if (this.sortingColumn == "TOLLRATENAME") {
      this.gridArrowInvoiceNumber = true;
      if (this.sortingDirection == true) {
        this.sortingDirection = false;
      }
      else {
        this.sortingDirection = true;
      }
    }

    this.invoiceSearch(this.p, null);
  }

}
