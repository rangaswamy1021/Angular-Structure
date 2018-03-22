import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { IManageSpecialJournalRequest } from "./models/managespecialjouralsrequest";
import { IManageSpecialJournalResponse } from "./models/managespecialjouralsresponse";
import { SessionService } from "../../shared/services/session.service";
import { ISystemActivities } from "../../shared/models/systemactivitiesrequest";
import { ActivitySource } from "../../shared/constants";
import { ConfigurationService } from "./services/configuration.service";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { AccountingService } from "../accounting/services/accounting.service";
@Component({
  selector: 'app-manage-special-journals-associations',
  templateUrl: './manage-special-journals-associations.component.html',
  styleUrls: ['./manage-special-journals-associations.component.scss']
})
export class ManageSpecialJournalsAssociationsComponent implements OnInit {
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }
//   specialJournalTable: boolean;
//   specialJournalDropDownRes: any;
//   specialJournalAssociationTable: boolean;
//   addNewSpecialJournalDetail: boolean;
//   associationJournal: boolean = false;
//   tempDropdownList: any;
//   getChartOfActsId: Array<string> = [];
//   objReqSpecialJournalSetup: any;
//   AssociationJournal: boolean = false;
//   addNewSpecialJournalAssociation: boolean = false;
//   addNewSpecialJournalForm: boolean;
//   getChartofAccountData: any[];
//   addButton: boolean = false;
//   updateButton: boolean = false;
//   selectedJournalAssociation: any;
//   objManageSpecialJournalResponseAssociations: any[];
//   dropdownList = [];
//   dropdownList1: any;
//   dropdownSettings = {};
//   itemsList = [];
//   selectedItems = [];
//   JournalLinks: boolean = true;
//   Journal: boolean = false;
//   SpecialJournalId: any;
//   updatedescription: any;
//   systemActivities: any;
//   errorMessage: any;
//   successMessage: any;
//   addNewSpecialJournalAssociationForm: FormGroup;
//   codePattern: any = "[A-Za-z]*";
//   namePattern = "[a-zA-Z]+([ ][a-zA-Z]+)*";
//   Status: string;
//   journal: boolean;
//   p: number;
//   startItemNumber: number = 1;
//   endItemNumber: number;
//   pageItemNumber: number = 10;
//   totalRecordCount: number;
//   objsystemActivitiesRequest: ISystemActivities;
//   objManageSpecialJournalRequest: IManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
//   objManageSpecialJournalResponse: IManageSpecialJournalResponse[];

//   constructor(private configurationService: ConfigurationService, private context: SessionService, private accountingService: AccountingService) { }

//   ngOnInit() {
//     this.addNewSpecialJournalAssociationForm = new FormGroup({
//       'SpecialJournalAssociation': new FormControl('', [Validators.required]),
//       //'Accounts': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(this.namePattern)]),
//       'description': new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]),
//     });
//     this.getChartOfAccountsData();
//     this.getSpecialJournalAssociations();
//     this.getmanageSpecialJournals();
//     this.p = 1;
//     this.endItemNumber = this.pageItemNumber;
//     this.dropdownSettings = {
//       singleSelection: false,
//       text: "Select G/L Accounts",
//       selectAllText: 'Select All',
//       unSelectAllText: 'UnSelect All',
//       enableSearchFilter: true,
//       classes: "myclass custom-class"
//     };
//   }

//   getSpecialJournalAssociations() {
//     console.log("drop down response", this.specialJournalDropDownRes);
//     this.specialJournalAssociationTable = true;
//     this.specialJournalTable = false;
//     this.objManageSpecialJournalResponse = [];
//     this.objsystemActivitiesRequest = <ISystemActivities>{};
//     this.objsystemActivitiesRequest.LoginId = this.context.customerContext.loginId;
//     this.objsystemActivitiesRequest.UserId = this.context.customerContext.userId;
//     this.objsystemActivitiesRequest.User = this.context.customerContext.userName;
//     this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
//     this.addNewSpecialJournalAssociationForm.reset();
//     this.configurationService.getSpecialJournalAssociations(this.objsystemActivitiesRequest).subscribe(
//       res => {
//         this.objManageSpecialJournalResponseAssociations = res;
//         if (this.objManageSpecialJournalResponseAssociations) {
//           this.totalRecordCount = this.objManageSpecialJournalResponseAssociations.length;
//         }
//         if (this.totalRecordCount < this.pageItemNumber) {
//           this.endItemNumber = this.totalRecordCount;
//         } else {
//           this.endItemNumber = ((this.p) * this.pageItemNumber);
//         }
//       }
//     );
//   }

//   createSpecialJournalAssociation() {
//     if (this.addNewSpecialJournalAssociationForm.valid) {
//       this.addButton = true;
//       this.updateButton = false;
//       this.successMessage = "";
//       this.errorMessage = "";
//       this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
//       this.objsystemActivitiesRequest = <ISystemActivities>{};
//       this.objManageSpecialJournalRequest.SpecialJournalId = this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value;
//       this.objManageSpecialJournalRequest.IsDelete = true;
//       this.objManageSpecialJournalRequest.User = this.context.customerContext.userName;
//       this.objManageSpecialJournalRequest.ChartofAccounts = this.getChartOfActsId.toString();
//       this.objsystemActivitiesRequest.LoginId = this.context.customerContext.loginId;
//       this.objsystemActivitiesRequest.UserId = this.context.customerContext.userId;
//       this.objsystemActivitiesRequest.User = this.context.customerContext.userName;
//       this.objsystemActivitiesRequest.ActivitySource = 'Internal';
//       this.objManageSpecialJournalRequest.SystemActivity = this.objsystemActivitiesRequest;
//       this.configurationService.createSpecialJournalAssociation(this.objManageSpecialJournalRequest).subscribe(
//         res => {
//           if (res) {
//             this.successMessage = 'Special Journal has been added successfully';
//             this.getSpecialJournalAssociations();
//             this.associationJournal = false;
//           }
//           else {
//             this.errorMessage = 'Error occured while creating the Special Journal.';
//             this.getSpecialJournalAssociations();
//           }
//           // }, err => {
//           //   this.errorMessage = 'Enter all mandatory feilds';
//           //   this.validateAllFormFields(this.addNewSpecialJournalAssociationForm);
//         });
//       this.Journal = false;
//     }
//     else {
//       this.validateAllFormFields(this.addNewSpecialJournalAssociationForm);
//     }

//   }
//   editSpecialJournalAssociation(specialJournalAssociation) {
//     this.selectedItems = [];
//     console.log("special journal association", specialJournalAssociation);
//     this.addNewSpecialJournalAssociation = true;
//     this.AssociationJournal = true;
//     this.addButton = false;
//     this.updateButton = true;
//     this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].disable();
//     this.successMessage = "";
//     this.errorMessage = "";
//     this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue(specialJournalAssociation.SpecialJournalId);
//     let list: string[] = specialJournalAssociation.ChartofAccounts.split(',');

//     this.accountingService.getGeneralLedgerDropDownDetails().subscribe(
//       res => {
//         if (res) {
//           console.log(res);
//           this.tempDropdownList = [];
//           res.forEach(element => {
//             this.dropdownList1 = {};
//             this.dropdownList1 = element;
//             this.tempDropdownList.push(this.dropdownList1);
//           });
//           console.log(this.tempDropdownList);
//         }
//       }, (err) => { }
//       , () => {
//         let tempSelectedList = <any>[];
//         for (let i = 0; i < list.length; i++) {
//           var index1 = this.tempDropdownList.findIndex(element => element.ChartOfAccountId == list[i]);
//           if (index1 > -1) {
//             let selectedItem = this.tempDropdownList.filter(element => element.ChartOfAccountId == list[i]);
//             if (selectedItem != undefined) {
//               tempSelectedList.push(selectedItem);
//             }
//           }
//         }

//         tempSelectedList.forEach((element) => {
//           this.dropdownList1 = {};
//           this.dropdownList1.id = element[0].ChartOfAccountId;
//           this.dropdownList1.itemName = element[0].AccountDescription;
//           this.onItemSelect(this.dropdownList1);
//           this.selectedItems.push(this.dropdownList1);
//         });
//       });
//   }

//   getmanageSpecialJournals() {
//     this.objManageSpecialJournalResponse = [];
//     this.objsystemActivitiesRequest = <ISystemActivities>{};
//     this.objsystemActivitiesRequest.LoginId = this.context.customerContext.loginId;
//     this.objsystemActivitiesRequest.UserId = this.context.customerContext.userId;
//     this.objsystemActivitiesRequest.User = this.context.customerContext.userName;
//     this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
//     this.configurationService.getSpecialJournals(this.objsystemActivitiesRequest).subscribe(
//       res => {
//         this.objManageSpecialJournalResponse = res;
//       });
//   }

//   updateSpecialJournalAssociaton() {
//     this.addButton = false;
//     this.associationJournal = false;
//     this.successMessage = "";
//     this.errorMessage = "";
//     this.objManageSpecialJournalRequest = <IManageSpecialJournalRequest>{};
//     this.objsystemActivitiesRequest = <ISystemActivities>{};
//     this.objManageSpecialJournalRequest.Status = true;
//     this.objManageSpecialJournalRequest.SpecialJournalId = this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].value;
//     this.objManageSpecialJournalRequest.ChartofAccounts = this.getChartOfActsId.toString();
//     this.objManageSpecialJournalRequest.IsDelete = true;
//     this.objManageSpecialJournalRequest.User = this.context.customerContext.userName;
//     this.objsystemActivitiesRequest.LoginId = this.context.customerContext.loginId;
//     this.objsystemActivitiesRequest.UserId = this.context.customerContext.userId;
//     this.objsystemActivitiesRequest.User = this.context.customerContext.userName;
//     this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
//     this.objManageSpecialJournalRequest.SystemActivity = this.objsystemActivitiesRequest;
//     this.configurationService.updateSpecialJournalAssociaton(this.objManageSpecialJournalRequest).subscribe(
//       res => {
//         if (res) {
//           this.successMessage = "Special Journal has been Updated successfully.";
//           this.getChartOfActsId.splice(0, this.getChartOfActsId.length);
//           this.addNewSpecialJournalAssociationForm.reset();
//           this.getSpecialJournalAssociations();
//           //this.onDeSelectAll(this.getChartOfActsId);
//           this.errorMessage = "";
//         }
//         // else {
//         //   this.errorMessage = 'Error occured while Updateing the  Special Journal.';
//         //   this.successMessage = "";
//         // }
//         err => { this.errorMessage = err.StatusText; }
//       },

//     );
//   }


//   pageChanged(event) {
//     this.p = event;
//     this.startItemNumber = (((this.p) - 1) * this.pageItemNumber) + 1;
//     this.endItemNumber = ((this.p) * this.pageItemNumber);
//     if (this.endItemNumber > this.totalRecordCount)
//       this.endItemNumber = this.totalRecordCount;
//     this.getSpecialJournalAssociations();
//   }


//   JournalButton() {
//     this.addButton = true;
//     this.updateButton = false;
//     this.Journal = false;
//     this.addNewSpecialJournalDetail = false;
//     this.associationJournal = true;
//     this.addNewSpecialJournalAssociation = false;
//     this.addNewSpecialJournalAssociationForm.controls['SpecialJournalAssociation'].enable();
//     this.addNewSpecialJournalAssociationForm.controls["SpecialJournalAssociation"].setValue('');
//   }


//   close() {
//     this.errorMessage = false;
//     this.successMessage = false;
//   }

//   cancelManageSpecialJournalsAssociation() {
//     this.associationJournal = false;
//     this.JournalLinks = true;
//     this.addNewSpecialJournalDetail = false;
//     this.addNewSpecialJournalAssociation = true;
//     this.addNewSpecialJournalAssociationForm.reset();
//   }

//   validateAllFormFields(formGroup: FormGroup) {
//     Object.keys(formGroup.controls).forEach(controlName => {
//       const control = formGroup.get(controlName);
//       if (control instanceof FormControl) {
//         if (control.invalid) {
//         }
//         control.markAsTouched({ onlySelf: true });
//       } else if (control instanceof FormGroup) {
//         this.validateAllFormFields(control);
//       }
//     });
//   }

//   onJournalAssociationSelected(selectedValue) {
//     this.objManageSpecialJournalResponse = [];
//     this.objsystemActivitiesRequest = <ISystemActivities>{};
//     this.objsystemActivitiesRequest.LoginId = this.context.customerContext.loginId;
//     this.objsystemActivitiesRequest.UserId = this.context.customerContext.userId;
//     this.objsystemActivitiesRequest.User = this.context.customerContext.userName;
//     this.objsystemActivitiesRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
//     this.configurationService.getSpecialJournalAssociations(this.objsystemActivitiesRequest).subscribe(
//       res => {
//         this.objManageSpecialJournalResponseAssociations = res;
//       }
//     );
//   }


//   getChartOfAccountsData() {
//     this.accountingService.getGeneralLedgerDropDownDetails().subscribe(
//       res => {
//         if (res) {
//           this.dropdownList = [];
//           res.forEach(element => {
//             this.dropdownList1 = {};
//             this.dropdownList1.id = element.ChartOfAccountId;
//             this.dropdownList1.itemName = element.AccountDescription;
//             this.dropdownList.push(this.dropdownList1);
//           });
//         }
//       });
//   }

//   onItemSelect(item: any) {
//     var filteredItem = this.itemsList.filter(d => d.id == item.id);
//     if (filteredItem) {
//       this.itemsList.slice(item);
//     }
//     else {
//       this.itemsList.push(item);
//     }
//     this.getChartOfActsId.push(item.id);
//   }

//   OnItemDeSelect(item: any) {
//     var index = this.itemsList.findIndex(x => x.id == item.id);
//     if (index > -1) {
//       this.itemsList.slice(index, 1);
//     }
//     let index1 = this.getChartOfActsId.indexOf(item);
//     this.getChartOfActsId.splice(index1, 1);
//   }

//   onSelectAll(items: any) {
//     this.itemsList.push(items)
//     this.getChartOfActsId.push(items.id);
//   }

//   onDeSelectAll(items: any) {
//     this.itemsList = items;
//     this.getChartOfActsId = items.id;
//   }
 }

