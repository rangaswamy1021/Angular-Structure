import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from "./services/configuration.service";
import { CommonService } from "../../shared/services/common.service";
import { CustomerAccountsService } from "../../csc/customeraccounts/services/customeraccounts.service";
import { IStatementResponse } from "../plans/models/statementcycleresponse";
import { IinvoiceResponse } from "../plans/models/invoicecycleresponse";
import { ISubCycles } from "./models/SubCycles";
import { ILoadBalanceTypes } from "./models/LoadBalanceTypes";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MaterialscriptService } from "../../shared/materialscript.service";
import { SessionService } from "../../shared/services/session.service";
import { IUserEvents } from "../../shared/models/userevents";
import { Features, Actions } from "../../shared/constants";
import { Router } from "@angular/router";


@Component({
  selector: 'app-load-balancing-configurations-for-mbs',
  templateUrl: './load-balancing-configurations-for-mbs.component.html',
  styleUrls: ['./load-balancing-configurations-for-mbs.component.scss']
})
export class LoadBalancingConfigurationsForMbsComponent implements OnInit {
  btnEditAllowed: boolean;
  btnAddAllowed: boolean;
  msgDesc: string;
  msgType: string;
  msgFlag: boolean;
  loadBalTypeId: number = 0;
  loadBalTypes: ILoadBalanceTypes[] = [];
  loadBalForm: FormGroup;
  cycleTypes = [];
  accountTypes = [];
  loadCriteria = [];
  subCycles = [];
  accountType = "";
  isAdd: boolean = false;
  isEdit: boolean = false;
  constructor(private configurationService: ConfigurationService, private commonService: CommonService,
    private materialscriptService: MaterialscriptService, private sessionService: SessionService, private router: Router) { }

  ngOnInit() {
    let rootSelector = this;
    setTimeout(function () {
      rootSelector.materialscriptService.material();
    }, 100);
    this.loadForm();

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MBSLOADBALANCE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;

    this.configurationService.getTollTypes().subscribe(res => {
      this.accountTypes = res;
      this.accountType = this.accountTypes[0].Key;
      this.bindData();
    });

    this.configurationService.getLoadBalanceCriteria(userEvents).subscribe(res => {
      this.loadCriteria = res;
    });
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MBSLOADBALANCE];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;
    this.btnAddAllowed = !this.commonService.isAllowed(Features[Features.MBSLOADBALANCE], Actions[Actions.ADD], "");
    this.btnEditAllowed = !this.commonService.isAllowed(Features[Features.MBSLOADBALANCE], Actions[Actions.UPDATE], "");
    this.getLoadDate();

  }

  loadForm() {
    this.loadBalForm = new FormGroup({
      'subcycles': new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(\.)?[0-9]{1,2}$")]),
      'period': new FormControl('', [Validators.required]),
      'category': new FormControl('', [Validators.required]),
    });
  }
  getLoadDate() {
    this.configurationService.getLoadBalanceTypes().subscribe(res => {
      this.loadBalTypes = res;
    })
  }

  bindData() {
    if (this.accountType == "PREPAID") {
      this.commonService.getStatementCycle().subscribe(result => {
        this.cycleTypes = result;
        this.cycleTypes = this.cycleTypes.filter(x => x.Key != "N");
        console.log(this.cycleTypes);
      });
    }
    else {
      this.commonService.getInvoiveCycleTypes().subscribe(res => {
        this.cycleTypes = res;
        this.cycleTypes = this.cycleTypes.filter(x => x.CycleID != 3);
        console.log(this.cycleTypes);
      });
    }
    this.bindSubCycles(0);
  }
  changeBinding(noofSubcycles) {
    if (!this.loadBalForm.value.category && noofSubcycles > 0) {
      this.loadBalForm.controls["subcycles"].setValue('');
      this.msgFlag = true;
      this.msgType = 'error';
      this.msgDesc = "Select the Category";
      return;
    }
    this.bindSubCycles(noofSubcycles);
  }

  bindSubCycles(noofSubcycles) {
    this.subCycles = [];
    if (noofSubcycles == 0) {
      return;
    }
    for (var i = 0; i < noofSubcycles; i++) {
      var subcycle: ISubCycles = <ISubCycles>{};
      subcycle.StartsWith = "";
      subcycle.EndsWith = "";
      subcycle.RunDay = 0;
      subcycle.CreatedUser = this.sessionService.customerContext.userName;
      this.subCycles.push(subcycle);
      let rootSelector = this;
      setTimeout(function () {
        rootSelector.materialscriptService.material();
      }, 100);
    }
  }
  addLoadBalance(subCycles) {
    if (this.isEdit || !(this.loadBalTypes.filter(x => x.StatementType == this.accountType && x.CycleType == this.loadBalForm.value.period).length > 0))
      this.createLoadBal(subCycles);
    else {
      this.msgFlag = true;
      this.msgType = 'alert';
      this.msgDesc = "Existing Criteria will be disabled, Are you sure you want to apply?";
    }
  }

  createLoadBal(subCycles) {
    if (!this.loadBalForm.valid) {
      return
    }
    var loadBalType = <ILoadBalanceTypes>{};
    loadBalType.LoadBalTypeId = this.loadBalTypeId;
    loadBalType.CycleType = this.loadBalForm.value.period;
    loadBalType.StatementType = this.accountType;
    loadBalType.CriteriaType = this.loadBalForm.value.category;
    loadBalType.SubCycles = this.loadBalForm.value.subcycles;
    loadBalType.SubCyclesList = subCycles;
    loadBalType.CreatedUser = this.sessionService.customerContext.userName;
    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MBSLOADBALANCE];
    userEvents.ActionName = this.isEdit ? Actions[Actions.UPDATE] : Actions[Actions.ADD];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = 0;
    userEvents.RoleId = parseInt(this.sessionService.customerContext.roleID);
    userEvents.UserName = this.sessionService.customerContext.userName;
    userEvents.LoginId = this.sessionService.customerContext.loginId;
    this.configurationService.createLoadBalanceTypes(loadBalType, userEvents).subscribe(res => {
      if (res > 0) {
        this.msgFlag = true;
        this.msgType = 'success'
        if (!this.isEdit)
          this.msgDesc = "Added Successfully";
        else
          this.msgDesc = "Updated Successfully";
        this.reset();
        this.getLoadDate();
        this.isAdd = false;
        this.isEdit = false;
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = err.statusText;
      return;
    })
  }

  accountTypeChange() {
    this.bindData();
    this.loadBalForm.reset();
    this.loadForm();
  }

  reset() {
    this.accountType = this.accountTypes[0].Key;
    this.bindSubCycles(0);
    this.loadBalForm.reset();
    this.loadForm();
  }

  viewAdd() {
    this.isAdd = true;
    let rootSelector = this;
    setTimeout(function () {
      rootSelector.materialscriptService.material();
    }, 100);
  }

  editLoadBal(id) {
    this.isAdd = true;
    this.isEdit = true;
    var loadbal = this.loadBalTypes.filter(x => x.LoadBalTypeId == id)[0];
    this.loadBalForm.patchValue({
      subcycles: loadbal.SubCycles,
      period: loadbal.CycleType,
      category: loadbal.CriteriaType
    })
    this.loadBalTypeId = loadbal.LoadBalTypeId;
    this.accountType = loadbal.StatementType;
    this.bindData();
    this.bindSubCycles(loadbal.SubCycles);
    for (var i = 0; i < loadbal.SubCycles; i++) {
      this.subCycles[i].StartsWith = loadbal.SubCyclesList[loadbal.SubCycles - 1 - i].StartsWith;
      this.subCycles[i].EndsWith = loadbal.SubCyclesList[loadbal.SubCycles - 1 - i].EndsWith;
      this.subCycles[i].RunDay = loadbal.SubCyclesList[loadbal.SubCycles - 1 - i].RunDay;
    }
  }

  deleteLoadBal(id) {
    this.configurationService.DeleteLoadBalanceTypes(id).subscribe(res => {
      if (res) {
        this.msgFlag = true;
        this.msgType = 'success'
        this.msgDesc = "Deleted Successfully";
        this.getLoadDate();
        this.reset();
        this.isAdd = false;
        this.isEdit = false;
      }
      else {
        this.msgFlag = true;
        this.msgType = 'error'
        this.msgDesc = "Error while deleting";
      }
    }, err => {
      this.msgFlag = true;
      this.msgType = 'error'
      this.msgDesc = err.statusText;
      return;
    })
  }

  cancel() {
    this.reset();
    this.isAdd = false;
  }

  setOutputFlag(e) {
    this.msgFlag = e;
  }


  userAction(e) {
    if (e) {
      this.msgFlag = false;
      this.loadBalTypeId = this.loadBalTypes.filter(x => x.StatementType == this.accountType && x.CycleType == this.loadBalForm.value.period)[0].LoadBalTypeId;
      this.createLoadBal(this.subCycles);
    }
  }
}
