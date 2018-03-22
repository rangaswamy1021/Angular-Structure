import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { HelpDeskService } from "./services/helpdesk.service";
import { ICommonResponse } from "../shared/models/commonresponse";
import { ICreatecomplaintrequest } from "../shared/models/createcomplaintrequest";
import { ComplaintStatus, SubSystem, ActivitySource, LookupTypeCodes, Features, Actions, defaultCulture } from "../shared/constants";
import { SessionService } from "../shared/services/session.service";
import { ApplicationParameterkey } from "../shared/applicationparameter";
import { IAttachmentRequest } from "../shared/models/attachmentrequest";
import { AdvanceSearchComponent } from '../shared/search/advance-search.component';
import { IProfileResponse } from "../csc/search/models/ProfileResponse";
import { ISearchCustomerRequest } from "../csc/search/models/searchcustomerRequest";
import { IPaging } from "../shared/models/paging";
import { Router, ActivatedRoute } from "@angular/router";
import { PmAttachmentComponent } from "./pm-attachment.component";
import { ITripsContextResponse } from "../shared/models/tripscontextresponse";
import { TripsContextService } from "../shared/services/trips.context.service";
import { CustomerContextService } from "../shared/services/customer.context.service";
import { ICustomerContextResponse } from "../shared/models/customercontextresponse";
import { IViolatorsearchRequest } from "./models/violatorsearchrequest";
import { IViolatorSearchResponse } from "../tvc/search/models/violatorsearchresponse";
import { ViolatorContextService } from "../shared/services/violator.context.service";
import { CommonService } from "../shared/services/common.service";
import { IUserEvents } from "../shared/models/userevents";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../shared/models/datepickeroptions";
import { MaterialscriptService } from "../shared/materialscript.service";

declare var $: any;

@Component({
  selector: 'app-create-complaint',
  templateUrl: './create-complaint.component.html',
  styleUrls: ['./create-complaint.component.scss']
})

export class CreateComplaintComponent implements OnInit {
  invalidDate: boolean;

  minutes: string[] = ['00', '15', '30', '45'];
  hours: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  problemTypes: any = [];
  lookuptype: ICommonResponse;
  pmSource: ICommonResponse[];
  pmPriority: ICommonResponse[];
  pmSeverity: ICommonResponse[];
  createForm: FormGroup;
  isEnable: boolean = false;
  customerId: number;
  contextAccountId: number;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  errorBlockSrch: boolean = false;
  errorHeadingSrch: string;
  errorMessageSrch: string;
  advancedSearchCustomer: ISearchCustomerRequest;
  profileResponse: IProfileResponse[] = [];
  pageItemNumber: number = 10;
  dataLength: number = this.profileResponse.length;
  startItemNumber: number = 1;
  endItemNumber: number;
  p: number = 1;
  searchCustomer: boolean = false;
  searchViolator: boolean = false
  vioSearch: FormGroup;
  vioSearchResponse: IViolatorSearchResponse[] = [];

  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  @ViewChild(PmAttachmentComponent) attachmentChild;

  tripId: number[] = [];
  invoiceId: number[] = [];
  referrenceURL: string;
  tripContext: ITripsContextResponse;
  currentSubSystem: string;
  isAfterSearch: boolean;
  isCustomerAfterSearch: boolean;
  isExistDependency: boolean = false;
  searchCustomerHeading: string;
  previousUrl: string;
  isInvoiceSearch: boolean;
  disableButton: boolean = false;
  accountStatus: string;
  featureName: string;
  toDayDate = new Date();
  myDatePickerOptions: ICalOptions = {
    // other options...
    dateFormat: 'mm/dd/yyyy',
    disableSince: { year: this.toDayDate.getFullYear(), month: this.toDayDate.getMonth() + 1, day: this.toDayDate.getDate() + 1 },
    inline: false,
    indicateInvalidDate: true,
    showClearBtn: false, showApplyBtn: false, showClearDateBtn: false
  };



  validateEmailPattern = "^[A-Za-z0-9]([_\\.\\-\\+]?[a-zA-Z0-9])*@([A-Za-z0-9]+)([\\.\\-]?[a-zA-Z0-9])*\\.([A-Za-z]{2,6})$";
  validatePhonePattern = "\\(([0-9]{3})\\)[ ]([0-9]{3})[-]([0-9]{4})";

  constructor(private helpDeskService: HelpDeskService, private customerContext: CustomerContextService,
    private sessionService: SessionService, private router: Router, private tripContextService: TripsContextService,
    private violatorContext: ViolatorContextService, private route: ActivatedRoute, private commonService: CommonService, private materialscriptService: MaterialscriptService) {

    this.loadForm();
    this.loadVioSearchForm();
  }

  DateOccur = new Date();
  maxDate: Date;

  ngOnInit() {

    this.materialscriptService.material();
    $('#pageloader').modal('show');
    this.route.queryParams.subscribe(params => {
      this.previousUrl = params['url'];
    });

    if (this.router.url.indexOf('csc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.searchCustomerHeading = 'Existing Customer';
    } else if (this.router.url.indexOf('tvc') > 0) {
      this.currentSubSystem = SubSystem[SubSystem.TVC];
      this.searchCustomerHeading = 'Unregistered Customer';
    } else {
      this.currentSubSystem = SubSystem[SubSystem.CSC];
      this.searchCustomerHeading = 'Existing Customer';
    }

    console.log('currentSubSystem:' + this.currentSubSystem);
    if (this.currentSubSystem === SubSystem[SubSystem.CSC]) {
      this.customerContext.currentContext
        .subscribe(customerContext => {
          if (customerContext && customerContext.AccountId > 0) {
            this.isAfterSearch = true;
            this.isCustomerAfterSearch = true;
            this.contextAccountId = customerContext.ParentId > 0 ? customerContext.ParentId : customerContext.AccountId;
            this.accountStatus = customerContext.AccountStatus;
            this.featureName = Features[Features.CSCCREATECOMPLAINT];
          } else {
            this.contextAccountId = 0;
            this.isAfterSearch = false;
            this.featureName = Features[Features.CSCMANAGECOMPLAINTS];
          }
        });
    } else if (this.currentSubSystem === SubSystem[SubSystem.TVC]) {
      this.violatorContext.currentContext.subscribe(cntxt => {
        if (cntxt && cntxt.accountId > 0) {
          this.contextAccountId = cntxt.accountId;
          this.isAfterSearch = true;
          this.isCustomerAfterSearch = false;
          this.featureName = Features[Features.TVCCREATECOMPLAINT];
        } else {
          this.contextAccountId = 0;
          this.isAfterSearch = false;
          this.featureName = Features[Features.TVCMANAGECOMPLAINTS];
        }
      });
    }

    this.tripContextService.currentContext.subscribe(res => {
      if (res) {
        if (res.referenceURL) {
          this.tripContext = res;
          this.isExistDependency = true;
          this.tripId = res.tripIDs;
          this.invoiceId = res.invoiceIDs;
          this.referrenceURL = res.referenceURL;
          console.log("tripContextService", res);
        } else {
          this.isExistDependency = false;
        }
      }
    });

    if (this.invoiceId && this.invoiceId.length > 0 && !(this.contextAccountId > 0)) {
      this.isInvoiceSearch = true;
      this.contextAccountId = this.tripContext.accountId;
    } else {
      this.isInvoiceSearch = false;
    }


    this.DateOccur = new Date();
    this.maxDate = new Date();
    this.disablePersonalDetails(false);
    this.bindDropDowns();
    this.resetFormValues();
    console.log(this.sessionService._customerContext.userName);
    console.log(this.featureName, Actions[Actions.CREATE], this.accountStatus ? this.accountStatus : '');
    this.disableButton = !this.commonService.isAllowed(this.featureName, Actions[Actions.CREATE], this.accountStatus ? this.accountStatus : '');
    if (this.tripContext) {
      this.tripContextService.changeResponse(null);
    }
    $('#pageloader').modal('hide');
  }


  loadForm() {
    this.createForm = new FormGroup({
      'FirstName': new FormControl('', [Validators.required]),
      'LastName': new FormControl('', [Validators.required]),
      'Phone': new FormControl('', Validators.compose([Validators.required, Validators.maxLength(14), Validators.pattern(this.validatePhonePattern)])),
      'Email': new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.validateEmailPattern), Validators.minLength(6), Validators.maxLength(100)])),
      'CmpType': new FormControl('', [Validators.required]),
      'CmpPriority': new FormControl('', [Validators.required]),
      'CmpSource': new FormControl('', Validators.required),
      'CmpSeverity': new FormControl('', Validators.required),
      'DateOccur': new FormControl('', Validators.required),
      'Hours': new FormControl(''),
      'Mints': new FormControl(''),
      'AmPm': new FormControl(''),
      'Title': new FormControl('', [Validators.required]),
      'Descr': new FormControl('', [Validators.required]),
      'rdoAccExist': new FormControl()
    });
    this.resetFormValues();
  }

  loadVioSearchForm() {
    this.vioSearch = new FormGroup({
      'trip': new FormControl('', []),
      'AccountNo': new FormControl('', []),
      'Fname': new FormControl('', []),
      'Lastname': new FormControl('', []),
      'PlateNo': new FormControl('', []),
      'Address': new FormControl('', [])
    });
  }

  bindDropDowns() {
    const userEvents = <IUserEvents>{};
    userEvents.FeatureName = this.featureName;
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url.split('?')[0];
    userEvents.CustomerId = this.contextAccountId;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.helpDeskService.getProblemTypeLookups().subscribe(
      res => { this.problemTypes = res; }
    );

    this.lookuptype = <ICommonResponse>{};
    this.lookuptype.LookUpTypeCode = "PM_Source";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype, userEvents).subscribe(
      res => {
        res = res.filter((c: ICommonResponse) => c.LookUpTypeCode !== 'Facebook' && c.LookUpTypeCode !== 'Twitter');
        this.pmSource = res;
      });

    this.lookuptype.LookUpTypeCode = "PM_Severity";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => {
        this.pmSeverity = res;
      });

    this.lookuptype.LookUpTypeCode = "PM_Priority";
    this.helpDeskService.getLookUpByParentLookupTypeCode(this.lookuptype).subscribe(
      res => { this.pmPriority = res; });
  }

  formatPhone(event) {
    var phone = event.target.value;
    var target = event.target || event.srcElement || event.currentTarget;
    var objId = target.attributes.id.value;
    if (phone.match(/^\d{3}$/)) {
      phone = phone.replace(/^(\d{3})/, '($1) ');
      this.createForm.controls[objId].setValue(phone);
    }
    else if (phone.match(/^\(\d{3}\)\s?(\d{3,})$/)) {
      phone = phone.replace(/(\d{3})\s?(\d)$/, '$1-$2');
      this.createForm.controls[objId].setValue(phone);
    }
  }



  createCompliant() {
    if (this.createForm.valid) {

      if (!this.isAfterSearch && !this.isInvoiceSearch) {
        if (this.createForm.controls["FirstName"].disabled && this.createForm.controls["FirstName"].value === '') {
          this.showErrorMsg('Select the account for creating complaint');
          window.scrollTo(0, 0);
          return;
        }
      }

      const dt: Date = this.prepareDateTime(this.createForm.value.DateOccur,
        this.createForm.value.Hours, this.createForm.value.Mints, this.createForm.value.AmPm);
      if (dt.getTime() > new Date().getTime()) {
        this.showErrorMsg('Date Occurred and time should not exceed current date and time.');
        window.scrollTo(0, 0);
        return;
      }

      if (!this.isAfterSearch && !this.isInvoiceSearch) {
        if (this.createForm.controls["rdoAccExist"].value == "Exist" && !(this.customerId > 0)) {
          this.createForm.controls["FirstName"].setValue("");
          this.createForm.controls["LastName"].setValue("");
          this.createForm.controls["Phone"].setValue("");
          this.createForm.controls["Email"].setValue("");
          this.showErrorMsg('Select the account for creating complaint');
          return;
        }
      }

      const createcomplaintrequest: ICreatecomplaintrequest = this.createComplaintDTO();
      const userEvents = <IUserEvents>{};
      userEvents.FeatureName = this.featureName;
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url.split('?')[0];
      userEvents.CustomerId = this.contextAccountId;
      userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
      userEvents.UserName = this.sessionService.customerContext.userName;
      userEvents.LoginId = this.sessionService.customerContext.loginId;

      console.log(createcomplaintrequest);
      $('#pageloader').modal('show');
      this.helpDeskService.create(createcomplaintrequest, userEvents).subscribe(
        res => {
          if (res) {
            this.resetCompliant();
            const msg = 'Complaint has been taken successfully. Your Problem reference # is ' + res;
            if (this.referrenceURL) {
              this.prepareContext(msg);
              this.router.navigateByUrl(this.referrenceURL);
            } else {
              this.showSucsMsg(msg);
              window.scrollTo(0, 0);
            }
          } else {
            this.showErrorMsg('Error while creating complaint');
            window.scrollTo(0, 0);
          }
          $('#pageloader').modal('hide');
        },
        (err) => {
          this.showErrorMsg('Error while creating complaint');
          window.scrollTo(0, 0);
          $('#pageloader').modal('hide');
          console.log(err);
        });

    } else {
      this.validateAllFormFields(this.createForm);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(controlName => {  //{2}
      const control = formGroup.get(controlName);             //{3}
      if (control instanceof FormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

  createComplaintDTO(): ICreatecomplaintrequest {
    let createcomplaintrequest: ICreatecomplaintrequest = <ICreatecomplaintrequest>{};

    if ((this.isAfterSearch || this.isInvoiceSearch) && this.contextAccountId > 0) {
      createcomplaintrequest.CustomerId = this.contextAccountId;
    } else {
      createcomplaintrequest.FirstName = this.createForm.controls["FirstName"].value;
      createcomplaintrequest.LastName = this.createForm.controls["LastName"].value;
      createcomplaintrequest.Phone = this.createForm.controls["Phone"].value;
      createcomplaintrequest.Email = this.createForm.controls["Email"].value;
      createcomplaintrequest.CustomerId = this.customerId > 0 ? this.customerId : -1;
    }

    createcomplaintrequest.ProblemType = this.createForm.value.CmpType;
    createcomplaintrequest.ProblemSource = this.createForm.value.CmpSource;
    createcomplaintrequest.Priority = this.createForm.value.CmpPriority;
    createcomplaintrequest.Severity = this.createForm.value.CmpSeverity;
    createcomplaintrequest.DateOccurred = this.prepareDateTime(this.createForm.value.DateOccur,
      this.createForm.value.Hours, this.createForm.value.Mints, this.createForm.value.AmPm).toLocaleString(defaultCulture).replace(/\u200E/g, "");
    createcomplaintrequest.ProblemTitle = this.createForm.value.Title;
    createcomplaintrequest.ProblemAbstract = this.createForm.value.Descr;

    createcomplaintrequest.Status = ComplaintStatus[ComplaintStatus.OPENED];
    createcomplaintrequest.SubSystem = this.currentSubSystem;
    createcomplaintrequest.UserName = this.sessionService._customerContext.userName;
    createcomplaintrequest.RecordedBy = this.sessionService._customerContext.userId;
    createcomplaintrequest.LoginId = this.sessionService._customerContext.loginId;
    createcomplaintrequest.UserId = this.sessionService._customerContext.userId;
    createcomplaintrequest.IsInternal = true;
    createcomplaintrequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    createcomplaintrequest.objILAttachment = this.attachmentChild.attachmentsList;

    if (this.tripId && this.tripId.length > 0) {
      createcomplaintrequest.CitationIdCSV = this.tripId.toString();
    }

    if (this.invoiceId && this.invoiceId.length > 0) {
      createcomplaintrequest.InvoiceIdCSV = this.invoiceId.toString();
    }

    return createcomplaintrequest;

  }

  advancedSearch(pageNo: number) {
    this.advancedSearchCustomer = <ISearchCustomerRequest>{};
    if (this.advanceSearchchild.createForm.valid) {

      if (!this.advanceSearchchild.createForm.controls['AccountNo'].value &&
        !this.advanceSearchchild.createForm.controls['SerialNo'].value &&
        !this.advanceSearchchild.createForm.controls['PlateNo'].value &&
        !this.advanceSearchchild.createForm.controls['Fname'].value &&
        !this.advanceSearchchild.createForm.controls['Lastname'].value &&
        !this.advanceSearchchild.createForm.controls['PhoneNo'].value &&
        !this.advanceSearchchild.createForm.controls['EmailAdd'].value &&
        !this.advanceSearchchild.createForm.controls['Address'].value &&
        !this.advanceSearchchild.createForm.controls['CCSuffix'].value) {

        // this.errorBlockSrch = true;
        // this.errorHeadingSrch = "Invalid search";
        // this.errorMessageSrch = "At least 1 field is required";
        this.showErrorMsg("At least 1 field is required");
        this.profileResponse = <IProfileResponse[]>[];
        return;
      }
      else {
        if (!this.advanceSearchchild.createForm.controls['AccountNo'].value) {
          this.advancedSearchCustomer.AccountId = 0;
        }
        else {
          this.advancedSearchCustomer.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value;
        }

        this.advancedSearchCustomer.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
        this.advancedSearchCustomer.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
        this.advancedSearchCustomer.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
        this.advancedSearchCustomer.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
        this.advancedSearchCustomer.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
        this.advancedSearchCustomer.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;
        this.advancedSearchCustomer.Address = this.advanceSearchchild.createForm.controls['Address'].value;
        if (this.getValue(this.advanceSearchchild.createForm.controls['CCSuffix'].value) == "") {
          this.advancedSearchCustomer.CCSuffix = -1;
        }
        else {
          this.advancedSearchCustomer.CCSuffix = this.getValue(this.advanceSearchchild.createForm.controls['CCSuffix'].value);
        }

        this.advancedSearchCustomer.PreferredLanguage = '';
        this.advancedSearchCustomer.HearingImpairment = '';
        this.advancedSearchCustomer.FrequentCaller = '';
        this.advancedSearchCustomer.Supervisor = '';

        this.advancedSearchCustomer.LoginId = this.sessionService.customerContext.loginId;
        this.advancedSearchCustomer.LoggedUserID = this.sessionService.customerContext.userId;
        this.advancedSearchCustomer.LoggedUserName = this.sessionService.customerContext.userName;
        this.advancedSearchCustomer.IsSearchEventFired = true;
        this.advancedSearchCustomer.ActivitySource = ActivitySource[ActivitySource.Internal];

        this.advancedSearchCustomer.PageIndex = <IPaging>{};
        this.advancedSearchCustomer.PageIndex.PageNumber = pageNo;
        this.advancedSearchCustomer.PageIndex.PageSize = 10;
        this.advancedSearchCustomer.PageIndex.SortColumn = "";
        this.advancedSearchCustomer.PageIndex.SortDir = 1;
        this.p = pageNo;

        console.log(this.advancedSearchCustomer);
        this.helpDeskService.advancedSearchCustomer(this.advancedSearchCustomer).subscribe(res => {
          this.profileResponse = res;

          if (this.profileResponse && this.profileResponse.length > 0) {
            this.dataLength = this.profileResponse[0].RecordCount;
            if (this.dataLength < this.pageItemNumber) {
              this.endItemNumber = this.dataLength;
            }
            else {
              this.endItemNumber = this.pageItemNumber;
            }
            this.errorBlockSrch = false;
          }
        });
      }
    }
  }

  getValue(str) {
    if (str == null) {
      return '';
    } else {
      return str;
    }
  }

  viewButton(selectedRowData) {
    this.createForm.patchValue({
      FirstName: selectedRowData.FirstName,
      LastName: selectedRowData.LastName,
      Phone: selectedRowData.Phone,
      Email: selectedRowData.Email
    });
    this.customerId = selectedRowData.AccountId;
    this.searchCustomer = false;
    this.profileResponse = [];
    this.advanceSearchchild.createForm.reset();
    $('#myModalC').modal('hide');
    this.materialscriptService.material();
  }

  vioViewClick(selectedRowData: IViolatorSearchResponse) {
    this.createForm.patchValue({
      FirstName: selectedRowData.ViolatorFirstName,
      LastName: selectedRowData.ViolatorSecondName,
      Phone: selectedRowData.Phone,
      Email: selectedRowData.EmailAddress
    });
    this.customerId = selectedRowData.ViolatorID;
    this.searchViolator = false;
    this.vioSearchResponse = [];
    this.vioSearch.reset();
    $('#myModalV').modal('hide');
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
    { this.endItemNumber = this.dataLength; }
    this.advancedSearch(this.p);
  }

  vioSearchPageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.dataLength)
    { this.endItemNumber = this.dataLength; }
    this.vioSearchClick(this.p);
  }

  rdoChange(selectedVal: string) {
    if (selectedVal === 'NotExist') {
      this.isEnable = true;
      this.disablePersonalDetails(true);
    } else {
      this.isEnable = false;
      this.disablePersonalDetails(false);
    }
    // this.loadForm();
  }

  disablePersonalDetails(flag: boolean) {
    if (flag) {
      this.createForm.controls["FirstName"].enable();
      this.createForm.controls["LastName"].enable();
      this.createForm.controls["Phone"].enable();
      this.createForm.controls["Email"].enable();
    } else {
      this.createForm.controls["FirstName"].disable();
      this.createForm.controls["LastName"].disable();
      this.createForm.controls["Phone"].disable();
      this.createForm.controls["Email"].disable();
    }
  }

  resetCompliant() {
    this.createForm.reset();
    this.attachmentChild.attachmentsList = [];
    this.attachmentChild.errorMessageAttachment = '';
    this.msgFlag = false;
    this.customerId = 0;
    this.resetFormValues();
    this.rdoChange('Exist');
    this.attachmentChild.cmpFile.nativeElement.value = '';
    this.materialscriptService.material();
  }

  backClick() {
    if (this.referrenceURL) {
      this.router.navigateByUrl(this.referrenceURL);
    } else if (this.previousUrl) {
      this.router.navigateByUrl(this.previousUrl);
    } else {
      this.router.navigateByUrl(this.currentSubSystem.toLowerCase() + '/manage-complaints');
    }
  }

  resetFormValues() {
    this.createForm.patchValue({
      Hours: '1',
      Mints: '00',
      AmPm: 'AM',
      CmpType: ((this.isAfterSearch || this.isInvoiceSearch) && this.isExistDependency) ? 'TollTransactions' : '',
      CmpPriority: '',
      CmpSource: 'WEB',
      CmpSeverity: '',
      rdoAccExist: 'Exist'
    });
    this.materialscriptService.material();
  }

  searchCloseClick() {
    this.searchCustomer = false;
    this.searchViolator = false;
  }

  searchOpenClick() {
    // this.searchCustomer = true;
    this.profileResponse = [];
    this.advanceSearchchild.createForm.reset();
    this.errorBlockSrch = false;
    this.vioSearch.reset();
    this.vioSearchResponse = [];

    if (this.currentSubSystem === SubSystem[SubSystem.CSC]) {
      this.searchCustomer = true;
      this.searchViolator = false;
    } else if (this.currentSubSystem === SubSystem[SubSystem.TVC]) {
      this.searchViolator = true;
      this.searchCustomer = false;
    }
  }

  resetAdvancedSearch() {
    this.advanceSearchchild.createForm.reset();
    this.profileResponse = [];
    this.errorBlockSrch = false;
    this.materialscriptService.material();
  }

  prepareContext(msg: string) {
    if (!this.tripContext) {
      this.tripContext = <ITripsContextResponse>{};
    }
    this.tripContext.successMessage = msg;
    this.tripContextService.changeResponse(this.tripContext);
  }

  vioSearchClick(pageNo: number) {
    const objReqVioSearch: IViolatorsearchRequest = <IViolatorsearchRequest>{};
    if (this.vioSearch.valid) {

      if (!this.vioSearch.controls['trip'].value &&
        !this.vioSearch.controls['AccountNo'].value &&
        !this.vioSearch.controls['Fname'].value &&
        !this.vioSearch.controls['Lastname'].value &&
        !this.vioSearch.controls['PlateNo'].value &&
        !this.vioSearch.controls['Address'].value) {

        // this.errorBlockSrch = true;
        // this.errorHeadingSrch = "Invalid search";
        // this.errorMessageSrch = "At least 1 field is required";
        this.showErrorMsg("At least 1 field is required");
        this.vioSearchResponse = <IViolatorSearchResponse[]>[];
        return;
      }
      else {
        objReqVioSearch.ViolatorID = this.vioSearch.controls['AccountNo'].value;
        objReqVioSearch.TripId = this.vioSearch.controls['trip'].value;
        objReqVioSearch.Soundex = 0;
        objReqVioSearch.ViolatorFirstName = this.vioSearch.controls['Fname'].value;
        objReqVioSearch.ViolatorSecondName = this.vioSearch.controls['Lastname'].value;
        objReqVioSearch.LicensePlate = this.vioSearch.controls['PlateNo'].value;
        objReqVioSearch.Address = this.vioSearch.controls['Address'].value;

        objReqVioSearch.IsViolation = true;
        objReqVioSearch.PageSize = 10;
        objReqVioSearch.PageNumber = pageNo;
        objReqVioSearch.SortDir = true;
        objReqVioSearch.SortColumn = 'CUSTOMERID';
        objReqVioSearch.UserName = this.sessionService.customerContext.userName;
        objReqVioSearch.LoginId = this.sessionService.customerContext.loginId;
        objReqVioSearch.LoggedUserId = this.sessionService.customerContext.userId;
        objReqVioSearch.UserName = this.sessionService.customerContext.userName;
        objReqVioSearch.IsSearch = true;
        this.p = pageNo;

        console.log(objReqVioSearch);
        this.helpDeskService.searchViolator(objReqVioSearch).subscribe(res => {
          this.vioSearchResponse = res;

          if (this.vioSearchResponse && this.vioSearchResponse.length > 0) {
            this.dataLength = this.vioSearchResponse[0].ReCount;
            if (this.dataLength < this.pageItemNumber) {
              this.endItemNumber = this.dataLength;
            } else {
              this.endItemNumber = this.pageItemNumber;
            }
            this.errorBlockSrch = false;
          }
        });
      }
    }
  }

  resetVioSearchClick() {
    this.vioSearch.reset();
    this.vioSearchResponse = [];
    this.errorBlockSrch = false;
    this.materialscriptService.material();
  }

  prepareDateTime(cmpDate: any, hrs: string, mins: string, amPm: string): Date {
    let _hrs: number;

    if (amPm === 'PM') {
      if (hrs !== "12") {
        _hrs = parseInt(hrs) + 12
      } else {
        _hrs = parseInt(hrs);
      }
    } else {
      if (hrs !== "12") {
        _hrs = parseInt(hrs);
      } else {
        _hrs = 0;
      }
    }
    const d: Date = new Date(cmpDate.jsdate.getFullYear(), cmpDate.jsdate.getMonth(), cmpDate.jsdate.getDate(), _hrs, parseInt(mins));
    return d;
  }

  closeAlert(): void {
    this.msgFlag = false;
  }

  closeAlertC(): void {
    this.errorBlockSrch = false;
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

  onDateChanged(event: IMyInputFieldChanged) {
    let date = this.createForm.controls["DateOccur"].value;
    if (event.value != "" && !event.valid) {
      this.invalidDate = true;
      return;
    }
    else
      this.invalidDate = false;
  }
}

