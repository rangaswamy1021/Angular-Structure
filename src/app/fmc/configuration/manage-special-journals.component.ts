import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IManageSpecialJournalRequest } from "./models/managespecialjouralsrequest";
import { IManageSpecialJournalResponse } from "./models/managespecialjouralsresponse";
import { SessionService } from "../../shared/services/session.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ActivitySource, Actions, Features } from "../../shared/constants";
import { ConfigurationService } from "./services/configuration.service";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AccountingService } from "../accounting/services/accounting.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Router } from "@angular/router";
import { CommonService } from '../../shared/services/common.service';
import { IUserresponse } from "../../shared/models/userresponse";
import { MaterialscriptService } from "../../shared/materialscript.service";
@Component({
  selector: 'app-manage-special-journals',
  templateUrl: './manage-special-journals.component.html',
  styleUrls: ['./manage-special-journals.component.scss']
})
export class ManageSpecialJournalsComponent implements OnInit {
  hidden: boolean;
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  disableAssociationCreateButton: boolean;
  disableAssociationUpdateButton: boolean;
  sessionContextResponse: IUserresponse;
  disableUpdateButton: boolean;
  disableCreateButton: boolean;
  userEvents: any;
  specialJournalDropDownRes: IManageSpecialJournalResponse[];
  tempDropdownList: Array<any> = [];
  getChartOfActsId: Array<string> = [];
  associationJournal: boolean = false;
  addNewSpecialJournalAssociation: boolean = false;
  linkshide: boolean = true;
  linkshide1: boolean = true;
  addNewSpecialJournalGroupFrom: FormGroup;
  multiselectlist: Array<any> = [];
  chartOfActsDropdown: any;
  dropdownSettings = {};
  itemsList: Array<any> = [];
  selectedItems: Array<any> = []
  addNewSpecialJournalForm: boolean;
  getChartofAccountData: Array<any> = [];
  addButton: boolean = false;
  updateButton: boolean = false;
  objManageSpecialJournalResponseAssociations: any[];
  addNewSpecialJournalDetail: boolean = false;
  specialJournalAssociationTable: boolean = false;
  specialJournalTable: boolean = true;
  journalLinks: boolean = true;
  journal: boolean = false;
  specialJournalId: number;
  updatedescription: string;
  codePattern: any = "[A-Za-z]*";
  status: string;
  defaultStatus: number = 0;
  statuses = [
    {
      id: 0,
      Value: 'Active'
    },

    {
      id: 1,
      Value: 'Inactive'
    }
  ];
  addDetails: boolean;
  updateDetails: boolean;
  addNewSpecialJournalAssociationForm: FormGroup;
  enterNewSpecialJournalDetails: boolean = true;
  association: boolean;
  p: number;
  startItemNumber: number = 1;
  endItemNumber: number;
  pageItemNumber: number = 10;
  totalRecordCount: number;
  p1: number;
  pageItemNumber1: number = 10;
  startItemNumber1: number = 1;
  endItemNumber1: number;
  totalRecordCount1: number;
  objsystemActivitiesRequest: ISystemActivities;
  objManageSpecialJournalRequest: IManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
  objManageSpecialJournalResponse: IManageSpecialJournalResponse[];

  constructor(private configurationService: ConfigurationService, private commonService: CommonService, private sessionContext: SessionService, private accountingService: AccountingService, private router: Router, private materialscriptService: MaterialscriptService) { }
  ngOnInit() {
    this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.addNewSpecialJournalGroupFrom = new FormGroup({
      'code': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(10), Validators.pattern(this.codePattern)]),
      'name': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
      'description': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]),
      'rdostatus': new FormControl(''),
    });
    this.addNewSpecialJournalAssociationForm = new FormGroup({
      'SpecialJournalAssociation': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]),
    });
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCalling(userEvents);
    userEvents.ActionName = Actions[Actions.VIEW];
    this.getmanageSpecialJournals(userEvents);
    this.getChartOfAccountsData();
    this.p = 1;
    this.p1 = 1;
    this.endItemNumber = this.pageItemNumber;
    this.endItemNumber1 = this.pageItemNumber1;
    this.dropdownSettings = {
      singleSelection: false,
      text: "Select G/L Accounts",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
      badgeShowLimit:3,
    };
  }

  manageSpecialJournals() {
    this.p = 1;
    this.linkshide = true;
    this.addNewSpecialJournalDetail = true;
    this.journal = false;
    this.linkshide1 = true;
    this.addNewSpecialJournalAssociation = false;
    this.associationJournal = false;
    this.getmanageSpecialJournals();
    this.specialJournalTable = true;
    this.specialJournalAssociationTable = false;
  }

  specialJournalButton() {
    this.materialscriptService.material();
    this.hidden = false;
    this.defaultStatus = 0;
    this.journal = true;
    this.linkshide = true;
    this.linkshide1 = true;
    this.addButton = true;
    this.updateButton = false;
    this.addNewSpecialJournalGroupFrom.controls["code"].enable();
    this.addNewSpecialJournalGroupFrom.controls["name"].enable();
    this.addNewSpecialJournalDetail = false;
  }

  manageSpecialJournalAssociations() {
    this.p1 = 1;
    this.linkshide = true;
    this.linkshide1 = true;
    this.addButton = true;
    this.getSpecialJournalAssociations();
    this.addNewSpecialJournalAssociation = true;
    this.addNewSpecialJournalDetail = false;
    this.associationJournal = false;
    this.journal = false;
    this.specialJournalTable = false;
    this.specialJournalAssociationTable = true;
  }

  specialJournalAssociationButton() {
    this.addButton = true;
    this.updateButton = false;
    this.journal = false;
    this.getChartOfActsId = [];
    this.addNewSpecialJournalDetail = false;
    this.associationJournal = true;
    this.addNewSpecialJournalAssociation = false;
    this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].enable();
    this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue('');
  }

  getmanageSpecialJournals(userEvents?: IUserEvents) {
    this.objManageSpecialJournalResponse = [];
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getSpecialJournals(this.objsystemActivitiesRequest, userEvents).subscribe(
      res => {
        this.objManageSpecialJournalResponse = res;
        this.specialJournalDropDownRes = this.objManageSpecialJournalResponse;
        if (this.objManageSpecialJournalResponse) {
          this.totalRecordCount = this.objManageSpecialJournalResponse.length;
        }
        if (this.totalRecordCount < this.pageItemNumber) {
          this.endItemNumber = this.totalRecordCount;
        }
      }
    )
    this.disableCreateButton = !this.commonService.isAllowed(Features[Features.SPECIALJOURNALSETUP], Actions[Actions.CREATE], "");
    this.disableUpdateButton = !this.commonService.isAllowed(Features[Features.SPECIALJOURNALSETUP], Actions[Actions.UPDATE], "");
    this.disableAssociationCreateButton = !this.commonService.isAllowed(Features[Features.SPECIALJOURNALASSOCIATIONS], Actions[Actions.CREATE], "");
    this.disableAssociationUpdateButton = !this.commonService.isAllowed(Features[Features.SPECIALJOURNALASSOCIATIONS], Actions[Actions.UPDATE], "");
    this.addNewSpecialJournalGroupFrom.reset();
  }

  setradio(a: string) {
    this.status = a;
  }

  createManageSpecialJournalsData() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCalling(userEvents);
    userEvents.ActionName = Actions[Actions.CREATE];
    if (this.addNewSpecialJournalGroupFrom.valid) {
      this.addButton = true;
      this.updateButton = false;
      this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
      this.objsystemActivitiesRequest = <ISystemActivities>{};
      this.objManageSpecialJournalRequest.code = this.addNewSpecialJournalGroupFrom.controls['code'].value;
      this.objManageSpecialJournalRequest.specialJournalName = this.addNewSpecialJournalGroupFrom.controls['name'].value;
      this.objManageSpecialJournalRequest.specialJournalDesc = this.addNewSpecialJournalGroupFrom.controls['description'].value;
      if (this.addNewSpecialJournalGroupFrom.controls['rdostatus'].value == 0) {
        this.objManageSpecialJournalRequest.status = true;
      }
      else {
        this.objManageSpecialJournalRequest.status = false;
      }
      this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
      this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
      this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
      this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
      this.objManageSpecialJournalRequest.systemActivity = this.objsystemActivitiesRequest;
      this.objManageSpecialJournalRequest.user = this.sessionContext.customerContext.userName;;
      this.configurationService.createSpecialJournals(this.objManageSpecialJournalRequest, userEvents).subscribe(
        res => {
          if (res) {
            this.getmanageSpecialJournals();
            this.msgFlag = true;
            this.msgType = 'success'
            this.msgDesc = 'Special Journal has been created successfully'
            this.addNewSpecialJournalGroupFrom.reset();
            this.journal = false;
          }
        }, err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
          this.journal = true;
        });
    }
    else {
      this.validateAllFormFields(this.addNewSpecialJournalGroupFrom);
    }
  }

  editSpecialJournalGroup(specialJournal) {
    this.addButton = false;
    this.journal = true;
    this.updateButton = true;
    this.addNewSpecialJournalDetail = false;
    this.addNewSpecialJournalAssociation = false;
    this.addNewSpecialJournalGroupFrom.controls["code"].disable();
    this.addNewSpecialJournalGroupFrom.controls["name"].disable();
    this.addNewSpecialJournalGroupFrom.reset();
    this.specialJournalId = specialJournal.SpecialJournalId;
    this.updatedescription = specialJournal.Description;
    this.addNewSpecialJournalGroupFrom.controls["code"].setValue(specialJournal.Code);
    this.addNewSpecialJournalGroupFrom.controls["name"].setValue(specialJournal.SpecialJournalName);
    this.addNewSpecialJournalGroupFrom.controls["description"].setValue(specialJournal.SpecialJournalDesc);
    this.addNewSpecialJournalGroupFrom.controls["rdostatus"].setValue(specialJournal.Status);
    this.statuses = [
      {
        id: 0,
        Value: 'Active'
      },
      {
        id: 1,
        Value: 'Inactive'
      }
    ];
    if (specialJournal.Status) {
      this.defaultStatus = 0;
    }
    else {
      this.defaultStatus = 1;
    }
    this.updateDetails = true;
    this.addDetails = false;
    this.enterNewSpecialJournalDetails = false;
    this.materialscriptService.material();

  }

  updateManageSpecialJournalsData() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCalling(userEvents);
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.addButton = false;
    this.journal = false;
    this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objManageSpecialJournalRequest.specialJournalId = this.specialJournalId;
    this.objManageSpecialJournalRequest.code = this.addNewSpecialJournalGroupFrom.controls['code'].value;
    this.objManageSpecialJournalRequest.specialJournalName = this.addNewSpecialJournalGroupFrom.controls['name'].value;
    this.objManageSpecialJournalRequest.specialJournalDesc = this.addNewSpecialJournalGroupFrom.controls['description'].value;
    this.objManageSpecialJournalRequest.user = this.sessionContext.customerContext.userName;
    if (this.addNewSpecialJournalGroupFrom.controls['rdostatus'].value == 0) {
      this.objManageSpecialJournalRequest.status = true;
      this.addNewSpecialJournalDetail = false;
    }
    else {
      this.objManageSpecialJournalRequest.status = false;
    }
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objManageSpecialJournalRequest.systemActivity = this.objsystemActivitiesRequest;
    this.configurationService.updateSpecialJournals(this.objManageSpecialJournalRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = 'Special Journal has been updated successfully';
          this.getmanageSpecialJournals();
          this.addNewSpecialJournalGroupFrom.reset();
        }
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
        }
      });
  }

  getSpecialJournalAssociations() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCallingAssociation(userEvents);
    userEvents.ActionName = Actions[Actions.VIEW];
    this.specialJournalAssociationTable = true;
    this.specialJournalTable = false;
    this.objManageSpecialJournalResponse = [];
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getSpecialJournalAssociations(this.objsystemActivitiesRequest, userEvents).subscribe(
      res => {
        this.objManageSpecialJournalResponseAssociations = res;
        if (this.objManageSpecialJournalResponseAssociations) {
          this.totalRecordCount1 = this.objManageSpecialJournalResponseAssociations.length;
        }
        if (this.totalRecordCount1 < this.pageItemNumber1) {
          this.endItemNumber1 = this.totalRecordCount1;
        }
      }
    );
  }

  createSpecialJournalAssociation() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCallingAssociation(userEvents);
    userEvents.ActionName = Actions[Actions.CREATE];
    this.addButton = true;
    this.updateButton = false;
    this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objManageSpecialJournalRequest.specialJournalId = this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value;
    let j = 0;
    for (let i = 0; i < this.objManageSpecialJournalResponseAssociations.length; i++) {
      console.log(this.objManageSpecialJournalResponseAssociations[i]);
      if (this.objManageSpecialJournalResponseAssociations[i].SpecialJournalId == this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value) {
        j++
      }
    }
    if (j > 0) {
      this.objManageSpecialJournalRequest.isDelete = true;
    } else {
      this.objManageSpecialJournalRequest.isDelete = false;
    }
    this.objManageSpecialJournalRequest.user = this.sessionContext.customerContext.userName;
    this.objManageSpecialJournalRequest.chartofAccounts = this.getChartOfActsId.toString();
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = 'Internal';
    this.objManageSpecialJournalRequest.systemActivity = this.objsystemActivitiesRequest;
    this.configurationService.createSpecialJournalAssociation(this.objManageSpecialJournalRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.getSpecialJournalAssociations();
          this.msgFlag = true;
          this.msgType = 'success';
          this.msgDesc = 'Special Journal Associations has been created successfully';
          this.addNewSpecialJournalAssociationForm.reset();
          this.associationJournal = false;
          this.getChartOfActsId.splice(0, this.getChartOfActsId.length);
        }
      }, err => {
        this.msgFlag = true;
        this.msgType = 'error';
        this.msgDesc = err.statusText.toString();
        this.getChartOfActsId.splice(0, this.getChartOfActsId.length);
      });
  }

  editSpecialJournalAssociation(specialJournalAssociation) {
    this.selectedItems = [];
    if (this.getChartOfActsId) {
      this.getChartOfActsId.splice(0, this.getChartOfActsId.length);
    }
    this.addNewSpecialJournalAssociation = false;
    this.associationJournal = true;
    this.addButton = false;
    this.updateButton = true;
    this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].disable();
    this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue('');
    this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue(specialJournalAssociation.SpecialJournalId);
    let list: string[] = specialJournalAssociation.ChartofAccounts.split(',');
    this.accountingService.getGeneralLedgerDropDownDetails().subscribe(
      res => {
        if (res) {
          this.tempDropdownList = [];
          res.forEach(element => {
            this.chartOfActsDropdown = {};
            this.chartOfActsDropdown = element;
            if (this.tempDropdownList) {
              this.tempDropdownList.push(this.chartOfActsDropdown);
            }
          });
        }
      }, (err) => { }
      , () => {
        let tempSelectedList = <any>[];
        for (let i = 0; i < list.length; i++) {
          let checkedIndex = this.tempDropdownList.findIndex(element => element.ChartOfAccountId == list[i]);
          if (checkedIndex > -1) {
            let selectedItem = this.tempDropdownList.filter(element => element.ChartOfAccountId == list[i]);
            if (selectedItem != undefined) {
              tempSelectedList.push(selectedItem);
            }
          }
        }
        tempSelectedList.forEach((element) => {
          this.chartOfActsDropdown = {};
          this.chartOfActsDropdown.id = element[0].ChartOfAccountId;
          this.chartOfActsDropdown.itemName = element[0].AccountDescription;
          this.onItemSelect(this.chartOfActsDropdown);
          this.selectedItems.push(this.chartOfActsDropdown);
        });
      });
  }

  updateSpecialJournalAssociaton() {
    let userEvents: IUserEvents = <IUserEvents>{};
    this.userEventsCallingAssociation(userEvents);
    userEvents.ActionName = Actions[Actions.UPDATE];
    this.addButton = false;
    this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objManageSpecialJournalRequest.status = true;
    this.objManageSpecialJournalRequest.specialJournalId = this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value;
    this.objManageSpecialJournalRequest.chartofAccounts = this.getChartOfActsId.toString();
    this.objManageSpecialJournalRequest.isDelete = true;
    this.objManageSpecialJournalRequest.user = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.objManageSpecialJournalRequest.systemActivity = this.objsystemActivitiesRequest;
    this.configurationService.updateSpecialJournalAssociaton(this.objManageSpecialJournalRequest, userEvents).subscribe(
      res => {
        if (res) {
          this.msgFlag = true;
          this.msgType = 'success'
          this.msgDesc = 'Special Journal Associations has been updated successfully';
          this.getChartOfActsId.splice(0, this.getChartOfActsId.length);
          this.addNewSpecialJournalAssociationForm.reset();
          this.getSpecialJournalAssociations();
          this.associationJournal = false;
          this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue('');
        }
        err => {
          this.msgFlag = true;
          this.msgType = 'error';
          this.msgDesc = err.statusText.toString();
        }
      },
    );
  }

  pageChanged(event) {
    this.p = event;
    this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.p) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    this.getmanageSpecialJournals();
  }

  pageChangedAssociation(event) {
    this.p1 = event;
    this.startItemNumber1 = (((this.p1) - 1) * this.pageItemNumber1) + 1;
    this.endItemNumber1 = ((this.p1) * this.pageItemNumber1);
    if (this.endItemNumber1 > this.totalRecordCount1)
      this.endItemNumber1 = this.totalRecordCount1;
    this.getSpecialJournalAssociations();
  }

  cancelNewSpecialJournal() {
    this.addNewSpecialJournalAssociation = false;
    this.journalLinks = true;
    this.journal = false;
    this.addNewSpecialJournalGroupFrom.reset();
    this.addNewSpecialJournalDetail = true;
  }

  cancelManageSpecialJournalsAssociation() {
    this.getChartOfActsId = [];
    this.associationJournal = false;
    this.journalLinks = true;
    this.addNewSpecialJournalDetail = false;
    this.addNewSpecialJournalAssociation = true;
    this.addNewSpecialJournalAssociationForm.reset();
    this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].enable();
  }

  addNewSpecialJournal() {
    this.associationJournal = false;
    this.journal = true;
    this.addNewSpecialJournalGroupFrom.reset();
    this.addButton = true;
    this.updateButton = false;
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

  onJournalAssociationSelected(selectedValue) {
    this.objManageSpecialJournalResponse = [];
    this.objsystemActivitiesRequest = <ISystemActivities>{};
    this.objsystemActivitiesRequest.LoginId = this.sessionContext.customerContext.loginId;
    this.objsystemActivitiesRequest.UserId = this.sessionContext.customerContext.userId;
    this.objsystemActivitiesRequest.User = this.sessionContext.customerContext.userName;
    this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    this.configurationService.getSpecialJournalAssociations(this.objsystemActivitiesRequest).subscribe(
      res => {
        this.objManageSpecialJournalResponseAssociations = res;
      }
    );
  }

  getChartOfAccountsData() {
    this.accountingService.getGeneralLedgerDropDownDetails().subscribe(
      res => {
        if (res) {
          this.multiselectlist = [];
          res.forEach(element => {
            this.chartOfActsDropdown = {};
            this.chartOfActsDropdown.id = element.ChartOfAccountId;
            this.chartOfActsDropdown.itemName = element.AccountDescription;
            this.multiselectlist.push(this.chartOfActsDropdown);
          });
        }
      });
  }

  onItemSelect(item: any) {
    let filteredItem = this.itemsList.filter(d => d.id == item.id);
    if (filteredItem) {
      this.itemsList.slice(item);
    }
    else {
      this.itemsList.push(item);
    }
    this.getChartOfActsId.push(item.id);
  }

  OnItemDeSelect(item: any) {
    let selectedIndex = this.itemsList.findIndex(x => x.id == item.id);
    if (selectedIndex > -1) {
      this.itemsList.slice(selectedIndex, 1);
    }
    let checkedIndex = this.getChartOfActsId.indexOf(item);
    this.getChartOfActsId.splice(checkedIndex, 1);
  }

  onSelectAll(items: any) {
    this.itemsList.push(items)
    this.getChartOfActsId.push(items.id);
  }

  onDeSelectAll(items: any) {
    this.itemsList = items;
    this.getChartOfActsId = items.id;
  }

  alertClick() {
    if (this.addNewSpecialJournalAssociationForm.valid) {
      let j = 0;
      for (let i = 0; i < this.objManageSpecialJournalResponseAssociations.length; i++) {
        if (this.objManageSpecialJournalResponseAssociations[i].SpecialJournalId == this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value) {
          j++
        }
      }
      if (j > 0) {
        this.msgType = "alert";
        this.msgFlag = true;
        this.msgDesc = 'Special Journal Associations already exists. Do you want to replace the existing one?';
        return false;
      } else {
        this.createSpecialJournalAssociation();
      }
    }
    else {
      this.validateAllFormFields(this.addNewSpecialJournalAssociationForm);
    }
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }

  btnOkClick(event) {
    if (event) {
      this.createSpecialJournalAssociation();
    }
  }

  userEventsCalling(userEvents) {
    userEvents.FeatureName = Features[Features.SPECIALJOURNALSETUP];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }

  userEventsCallingAssociation(userEvents) {
    userEvents.FeatureName = Features[Features.SPECIALJOURNALASSOCIATIONS];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
  }
}
