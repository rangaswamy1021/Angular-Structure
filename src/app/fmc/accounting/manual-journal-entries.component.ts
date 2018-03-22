import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { AccountingService } from "./services/accounting.service";
import { Router } from "@angular/router";
import { IManualJournalEntriesRequest } from "./models/manualjournalentriesrequest";
import { IManualGLTxnLineItems } from "./models/manualgltxnlineitems";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { SessionService } from "../../shared/services/session.service";
import { ActivitySource, Features, Actions, defaultCulture } from "../../shared/constants";
import { IUserEvents } from "../../shared/models/userevents";
import { IUserresponse } from "../../shared/models/userresponse";
import { CommonService } from "../../shared/services/common.service";
import { DatePickerFormatService } from "../../shared/services/datepickerformat.service";
import { IMyInputFieldChanged } from "mydatepicker";
import { ICalOptions } from "../../shared/models/datepickeroptions";
import { MaterialscriptService } from "../../shared/materialscript.service";


@Component({
  selector: 'app-manual-journal-entries',
  templateUrl: './manual-journal-entries.component.html',
  styleUrls: ['./manual-journal-entries.component.scss']
})
export class ManualJournalEntriesComponent implements OnInit {
  invalidDate: boolean;
  disableCreateButton: boolean;
  sessionContextResponse: IUserresponse;
  isZeroAmount: boolean = false;
  editableGlAcntd: any;
  glAcntChanged: boolean;
  editableGlAccount: any;
  varianceAmount: number;
  chartOfAcntId: number;
  debitAmount: number;
  creditAmount: number;
  objSystemActivities: ISystemActivities;
  objManualJournalEntriesRequest: IManualJournalEntriesRequest;
  objManualGLTxnLineItems: IManualGLTxnLineItems;
  editableDebitOrCredit: any;
  genAccountName: Array<string> = [];
  tableRowCount: number;
  deletableAmount: number;
  deleteClick: boolean;
  updateClick: any;
  editableAmount: number;
  variance: boolean;
  totCreditAmount: number = 0;
  totDebitAmount: number = 0;
  addGl: boolean = true;
  journalLineItems: Array<any> = [];
  glTxnItemsArray: Array<IManualGLTxnLineItems> = [];
  glTxnItem: IManualGLTxnLineItems;
  updatedPurposeData: any;
  selectedValue: string;
  addData: boolean;
  maxDate = new Date();
  getChartOfActs: Array<string> = [];
  public value: any = {};
  public items: any[];
  genAccountsDropdown: any[];
  // journalEntryDatePlace: Date;
  createManualJournalEntryForm: FormGroup;
  addJournalLineItemsForm: FormGroup;
  validateAmountPattern = "^[0-9]*(\.)?[0-9]{1,2}$";
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  fromDay = new Date();
  myDatePickerOptions: ICalOptions = {
    disableSince: { year: this.fromDay.getFullYear(), month: this.fromDay.getMonth() + 1, day: this.fromDay.getDate() + 1 },
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


  constructor(private materialscriptService: MaterialscriptService, private datePickerFormatService: DatePickerFormatService, private sessionContext: SessionService, private objAccountingService: AccountingService, private router: Router, private _fb: FormBuilder, private commonService: CommonService) { }

  ngOnInit() {
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.createManualJournalEntryForm = new FormGroup({
      'journalEntryDate': new FormControl('', [Validators.required]),
      'description': new FormControl('')
    })
    this.addJournalLineItemsForm = new FormGroup({
      'glAccountId': new FormControl('', [Validators.required]),
      'debitOrCreditSelect': new FormControl('', [Validators.required]),
      'amountOfDebitOrCredit': new FormControl('', [Validators.required, Validators.pattern(this.validateAmountPattern)])
    });
    let date = new Date();
    this.createManualJournalEntryForm.patchValue({
      journalEntryDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    this.materialscriptService.material();
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MANUALJOURNALENTRIES];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe(res => res);
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.MANUALJOURNALENTRIES], Actions[Actions.CREATE], "");
    // this.journalEntryDatePlace = new Date(Date.now());
    this.getChartofAccountsDropDown();
    this.addData = true;
    this.variance = true;
    this.updateClick = false;
    this.deleteClick = false;
    this.tableRowCount = 0;
    this.glAcntChanged = false;
    this.ifZeroAmount();
  }

  removeAmount(event: any) {
    //Cross Browser issue with back space
    if (event.charCode !== 0 && event.keyCode !== 8) {
      const pattern = /[0-9.][0-9.]*/;
      let inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  }

  onDateRangeFieldChanged(event: IMyInputFieldChanged) {
    if (!event.valid && event.value != "") {
      this.invalidDate = true;
    }
    else {
      this.invalidDate = false;
    }
  }

  getChartofAccountsDropDown(): void {
    this.objAccountingService.getChartOfAccountsDropDown().subscribe(
      res => {
        this.genAccountsDropdown = res;
        this.genAccountsDropdown.forEach(element => {
          this.getChartOfActs.push(element.AccountDescription);
          this.items = this.getChartOfActs;
        });
      });
  }
  ifZeroAmount() {
    if (this.addJournalLineItemsForm.controls['amountOfDebitOrCredit'].value == null
      || this.addJournalLineItemsForm.controls['amountOfDebitOrCredit'].value == '' ||
      this.addJournalLineItemsForm.controls['amountOfDebitOrCredit'].value != 0) {
      this.isZeroAmount = false;
    }
    else {
      this.isZeroAmount = true;
    }
  }

  addJournalLineItems() {
    if (this.addJournalLineItemsForm.valid) {
      this.ifZeroAmount();
      if (this.isZeroAmount == false) {
        let lineItemRow = <any>{};
        lineItemRow.glAccountName = this.selectedValue;
        lineItemRow.debitOrCredit = this.addJournalLineItemsForm.controls['debitOrCreditSelect'].value;
        lineItemRow.amount = this.addJournalLineItemsForm.get('amountOfDebitOrCredit').value;
        lineItemRow.chartOfAcntId = this.chartOfAcntId;
        if (lineItemRow.debitOrCredit == "Credit") {
          this.creditAmount = lineItemRow.amount;
          this.debitAmount = 0;
        }
        else {
          this.debitAmount = lineItemRow.amount;
          this.creditAmount = 0;
        }
        this.journalLineItems.push(lineItemRow);
        this.enableSave(lineItemRow);
        this.tableRowCount += 1;
        this.resetAddRowTable();
        this.glAcntChanged = false;
      }
    } else {
      this.validateAllFormFields(this.addJournalLineItemsForm);
    }
    this.materialscriptService.material();
  }

  edit(lineItemRow) {
    this.addGl = true;
    this.addData = false;
    this.updatedPurposeData = lineItemRow;
    this.addJournalLineItemsForm.controls['debitOrCreditSelect'].setValue(lineItemRow.debitOrCredit);
    this.editableDebitOrCredit = lineItemRow.debitOrCredit;
    this.addJournalLineItemsForm.controls['amountOfDebitOrCredit'].setValue(lineItemRow.amount);
    this.editableAmount = lineItemRow.amount;
    this.editableGlAcntd = lineItemRow.chartOfAcntId;
    this.genAccountName = [lineItemRow.glAccountName];
    this.editableGlAccount = lineItemRow.glAccountName;
    this.materialscriptService.material();
  }

  updateDetails(updatedPurposeData) {
    if (this.addJournalLineItemsForm.valid) {
      this.ifZeroAmount();
      if (this.isZeroAmount == false) {
        this.addData = true;
        this.addGl = false;
        this.updateClick = true;
        updatedPurposeData.amount = this.addJournalLineItemsForm.get("amountOfDebitOrCredit").value;
        updatedPurposeData.debitOrCredit = this.addJournalLineItemsForm.get("debitOrCreditSelect").value;
        if (this.glAcntChanged) {
          updatedPurposeData.glAccountName = this.selectedValue;
          updatedPurposeData.chartOfAcntId = this.chartOfAcntId;
        } else {
          updatedPurposeData.glAccountName = this.editableGlAccount;
          updatedPurposeData.chartOfAcntId = this.editableGlAcntd;
        }
        this.resetAddRowTable();
        this.enableSave(updatedPurposeData);
        this.glAcntChanged = false;
      }
    }
    else {
      this.validateAllFormFields(this.addJournalLineItemsForm);
    }
  }

  removeRow(lineItemRow) {
    this.deletableAmount = lineItemRow.amount;
    this.deleteClick = true;
    let index = this.journalLineItems.indexOf(lineItemRow);
    this.journalLineItems.splice(index, 1);
    let index1 = this.glTxnItemsArray.indexOf(lineItemRow);
    this.glTxnItemsArray.splice(index, 1);
    this.tableRowCount -= 1;
    this.resetAddRowTable();
    this.addData = true;
    this.addGl = false;
    this.enableSave(lineItemRow);
    this.glAcntChanged = false;
    if (this.tableRowCount == 0) {
      this.addGl = true;
    }
  }

  enableSave(lineItemRow) {
    if (lineItemRow.debitOrCredit == "Debit") {
      if (this.updateClick) {
        if (this.editableDebitOrCredit == "Debit") {
          this.totDebitAmount = (this.totDebitAmount - this.editableAmount);
        }
        else {
          this.totCreditAmount = (this.totCreditAmount - this.editableAmount);
        }
        this.totDebitAmount += parseFloat(lineItemRow.amount);
      } else {
        if (this.deleteClick) {
          this.totDebitAmount = (this.totDebitAmount - this.deletableAmount);
        }
        else {
          this.totDebitAmount += parseFloat(lineItemRow.amount);
        }
      }
    }
    else {
      if (this.updateClick) {
        if (this.editableDebitOrCredit == "Debit") {
          this.totDebitAmount = (this.totDebitAmount - this.editableAmount);
        }
        else {
          this.totCreditAmount = (this.totCreditAmount - this.editableAmount);
        }
        this.totCreditAmount += parseFloat(lineItemRow.amount);
      }
      else {
        if (this.deleteClick) {
          this.totCreditAmount = (this.totCreditAmount - this.deletableAmount);
        }
        else {
          this.totCreditAmount += parseFloat(lineItemRow.amount);
        }
      }
    }
    this.varianceAmount = (this.totCreditAmount - this.totDebitAmount);
    if ((this.varianceAmount == 0) && ((this.totCreditAmount + this.totDebitAmount) != 0)) {
      this.variance = false;
    }
    else {
      this.variance = true;
    }
    this.updateClick = false;
    this.deleteClick = false;
  }

  systemActivity() {
    this.objSystemActivities = <ISystemActivities>{};
    this.objSystemActivities.LoginId = this.sessionContext.customerContext.loginId;
    this.objSystemActivities.UserId = this.sessionContext.customerContext.userId;
    this.objSystemActivities.IsViewed = true;
    this.objSystemActivities.User = this.sessionContext.customerContext.userName;
    this.objSystemActivities.ActivitySource = ActivitySource[ActivitySource.Internal];
  }

  createJournalEntries() {
    this.createManualJournalEntryForm.controls['description'].setValidators([Validators.required]);
    this.createManualJournalEntryForm.controls['description'].updateValueAndValidity();
    if (this.createManualJournalEntryForm.valid && this.invalidDate == false) {
      this.objManualJournalEntriesRequest = <IManualJournalEntriesRequest>{};
      let date = this.datePickerFormatService.getFormattedDate((this.createManualJournalEntryForm.controls['journalEntryDate'].value).date);
      this.objManualJournalEntriesRequest.PostingDate = new Date(new Date(date).toLocaleDateString(defaultCulture).replace(/\u200E/g, "")).toDateString();// new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).toLocaleString(defaultCulture).replace(/\u200E/g,"");
      // this.objManualJournalEntriesRequest.PostingDate = this.createManualJournalEntryForm.get('journalEntryDate').value;
      this.objManualJournalEntriesRequest.ManualGLTxnDesc = this.createManualJournalEntryForm.get('description').value;
      // this.objManualJournalEntriesRequest.PostingDate_YYYYMM = this.objManualJournalEntriesRequest.PostingDate.getFullYear() + this.objManualJournalEntriesRequest.PostingDate.getMonth();
      this.objManualJournalEntriesRequest.PostingDate_YYYYMM = (date.getFullYear()).toString() + (((date.getMonth() + 1) < 10) ? (+'0' + (date.getMonth() + 1).toString()) : (date.getMonth() + 1)).toString();//(date.getMonth() + 1).toString();
      this.objManualJournalEntriesRequest.IsApproved = false;
      this.objManualJournalEntriesRequest.TxnAmount = this.totDebitAmount;
      this.objManualJournalEntriesRequest.User = this.sessionContextResponse.userName;
      this.systemActivity();
      this.objManualJournalEntriesRequest.SystemActivity = this.objSystemActivities;
      for (let i = 0; i <= this.journalLineItems.length - 1; i++) {
        this.glTxnItem = <IManualGLTxnLineItems>{};
        this.glTxnItem.ChartOfAccountId = this.journalLineItems[i].chartOfAcntId;
        if (this.journalLineItems[i].debitOrCredit == "Debit") {
          this.glTxnItem.DebitAmount = this.journalLineItems[i].amount;
          this.glTxnItem.CreditAmount = 0;
        }
        else {
          this.glTxnItem.CreditAmount = this.journalLineItems[i].amount;
          this.glTxnItem.DebitAmount = 0;
        }
        this.glTxnItem.User = this.sessionContext.customerContext.userName;
        this.glTxnItemsArray.push(this.glTxnItem);
      }
      this.objManualJournalEntriesRequest.objManualGLTxnLineItems = this.glTxnItemsArray;
      this.objManualJournalEntriesRequest.User = this.sessionContext.customerContext.userName;
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.MANUALJOURNALENTRIES];
      userEvents.ActionName = Actions[Actions.CREATE];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;
      this.objAccountingService.createManualJournalEntries(this.objManualJournalEntriesRequest, userEvents).subscribe(
        res => {
          if (res) {
            this.successMessageBlock("Manual journal entry has been posted successfully .");
            this.tableRowCount = 0;
            this.glTxnItemsArray.splice(0, this.glTxnItemsArray.length);
            this.totalReset();
          }
        }
        , (err) => {
          this.errorMessageBlock(err.statusText.toString());
        })
    }
    else {
      this.validateAllFormFields(this.createManualJournalEntryForm);
    }
  }

  totalReset() {
    this.cancelAddLineItems();
    this.journalLineItems.splice(0, this.journalLineItems.length);
    this.totCreditAmount = 0;
    this.totDebitAmount = 0;
    this.variance = true;
    this.varianceAmount = 0;
    this.glAcntChanged = false;
    this.createManualJournalEntryForm.reset();
    let date = new Date();
    this.createManualJournalEntryForm.patchValue({
      journalEntryDate: {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      }
    });
    // this.journalEntryDatePlace = new Date(Date.now());
    this.tableRowCount = 0;
    this.addGl = true;
    this.createManualJournalEntryForm.controls['description'].setValidators([]);
    this.createManualJournalEntryForm.controls['description'].updateValueAndValidity();
    this.materialscriptService.material();
  }

  public selected(value: any) {
    this.glAcntChanged = true;
    this.selectedValue = value.text;
    this.objAccountingService.getChartOfAccountsDropDown().subscribe(
      res => {
        this.genAccountsDropdown = res;
        this.chartOfAcntId = this.genAccountsDropdown.filter(x => x.AccountDescription == value.text)[0].ChartOfAccountId;
      });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  cancelAddLineItems() {
    if (this.tableRowCount == 0) {
      this.addGl = true;
    } else {
      this.resetAddRowTable();
    }
  }

  resetAddRowTable() {
    this.addJournalLineItemsForm.reset();
    this.addJournalLineItemsForm.controls['debitOrCreditSelect'].setValue("");
    this.addData = true;
    this.glAcntChanged = false;
    this.isZeroAmount = false;
    this.materialscriptService.material();
  }

  backToGeneralJournalPage() {
    this.router.navigate(['/fmc/accounting/general-journal']);
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