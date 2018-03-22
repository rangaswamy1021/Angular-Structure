import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { ITripsContextResponse } from './../../shared/models/tripscontextresponse';
import { ApplicationParameterkey } from './../../shared/applicationparameter';
import { CommonService } from './../../shared/services/common.service';
import { SubSystem, TollType, AccountStatus, ActivitySource, BalanceType, Features, SubFeatures, Actions, defaultCulture } from './../../shared/constants';
import { AdvanceSearchComponent } from '../../shared/search/advance-search.component';
import { ISearchCustomerRequest } from '../../csc/search/models/searchcustomerRequest';
import { IPaging } from '../../shared/models/paging';
import { IUserresponse } from '../../shared/models/userresponse';
import { Router } from '@angular/router';
import { SessionService } from '../../shared/services/session.service';
import { ViolatorContextService } from '../../shared/services/violator.context.service';
import { IViolatorContextResponse } from '../../shared/models/violatorcontextresponse';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { ViolatordetailsService } from './services/violatordetails.service';
import { ICustomerProfileResponse } from '../../shared/models/customerprofileresponse';
import { CustomerSearchService } from '../../csc/search/services/customer.search';
import { IUserEvents } from '../../shared/models/userevents';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;

@Component({
  selector: 'app-violation-transfer-to-customer',
  templateUrl: './violation-transfer-to-customer.component.html',
  styleUrls: ['./violation-transfer-to-customer.component.scss']
})

export class ViolationTransferToCustomerComponent implements OnInit {
  confirmFlag: boolean = false;
  disableTransferButton: boolean = false;
  disableSearchButton: boolean = false;

  @ViewChild(AdvanceSearchComponent) advanceSearchchild;
  constructor(private customerSearchService: CustomerSearchService,
    private router: Router,
    private sessionContext: SessionService,
    private violatorContext: ViolatorContextService,
    private violatorDetailsService: ViolatordetailsService,
    private tripContextService: TripsContextService,
    private commonService: CommonService,
    
 private materialscriptService: MaterialscriptService

  ) { }

  violatorContextResponse: IViolatorContextResponse;
  tripContextResponse: ITripsContextResponse;
  sessionContextResponse: IUserresponse;

  profileResponse: ICustomerProfileResponse[] = <ICustomerProfileResponse[]>[];
  customerProfileRequestArray: ICustomerProfileResponse[] = [];
  searchCustomerRequest: ISearchCustomerRequest;
  UserInputs: IAddUserInputs = <IAddUserInputs>{};

  isDisplaySearchDetails: boolean = false;
  parentAccountId: number = 0;
  isSameAccount: boolean = true;

  pageNumber: number = 1;
  pageItemNumber: number = 10;
  startItemNumber: number = 1;
  endItemNumber: number = this.pageItemNumber;
  totalRecordCount: number;

  balanceReqObject: any;
  balanceResObject: any;
  outStandingAmount: number;
  selectedTrips: string[];
  violatorTransaction: any;

  tripIdCSV: string = '';
  planRequest: any;
  strAccountStatus: string = '';
  boolOneTollCustomer: boolean;
  strVehicles: string;
  longFromViolator: number = 0;
  longToViolator: number = 0;

  bsRangeValue: any;
  isPostpaidCustomer: boolean;
  defalutSelection: number = 0;


  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  transferAccounts = [
    {
      id: 0,
      Value: 'Existing Account'
    },
    {
      id: 1,
      Value: 'Same Account'
    }
  ];

  ngOnInit() {
    
 this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    if (this.sessionContextResponse == null) {
      let link = ['/'];
      this.router.navigate(link);
    }
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.UserInputs.icnId = this.sessionContextResponse.icnId;
    this.violatorContext.currentContext
      .subscribe(customerContext => {
        if (customerContext && customerContext.accountId > 0) {
          this.violatorContextResponse = customerContext;
          this.longFromViolator = this.violatorContextResponse.accountId;
          this.tripContextService.currentContext.subscribe(res => {
            if (res) {
              this.tripContextResponse = res;
              this.tripIdCSV = res.tripIDs.toString();
              this.outStandingAmount = res.selectedTripsOutstandingAmount;
            } else {
              // let link = ['tvc/search/violation-search'];
              // this.tripContextService.changeResponse(null);
              // this.router.navigate(link);
              // TODO: If no trips context
              // navigate to
            }
          });
        } else {
          this.tripContextService.currentContext.subscribe(res => {
            if (res) {
              this.tripContextResponse = res;
              this.tripIdCSV = res.tripIDs.toString();
              this.longFromViolator = res.accountId;
              this.outStandingAmount = res.selectedTripsOutstandingAmount;
            } else {
              // let link = ['tvc/search/violation-search'];
              // this.tripContextService.changeResponse(null);
              // this.router.navigate(link);
              // TODO: If no trips context
              // navigate to
            }
          });
          // console.log('Recvd trips:' + this.tripIdCSV);
          // console.log('Recvd URL:' + this.redirectURL);
        }
      });

    let userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MOVETOCUSTOMER];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longFromViolator;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.commonService.checkPrivilegeswithAuditLog(userEvents).subscribe();
    this.checkRolesandPrivileges();

  }


  checkRolesandPrivileges() {
    this.disableSearchButton = !this.commonService.isAllowed(Features[Features.MOVETOCUSTOMER], Actions[Actions.SEARCH], "");
    this.disableTransferButton = !this.commonService.isAllowed(Features[Features.MOVETOCUSTOMER], Actions[Actions.TRANSFER], "");
  }


  //customer object prepare
  getCustomers(isSearch: boolean, pageNumber: number, isSameAccount: boolean): ISearchCustomerRequest {
    let searchCustomerRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
    if (!isSameAccount) {
      searchCustomerRequest.AccountId = this.advanceSearchchild.createForm.controls['AccountNo'].value;
      searchCustomerRequest.TransponderNumber = this.advanceSearchchild.createForm.controls['SerialNo'].value;
      searchCustomerRequest.VehicleNumber = this.advanceSearchchild.createForm.controls['PlateNo'].value;
      searchCustomerRequest.FirstName = this.advanceSearchchild.createForm.controls['Fname'].value;
      searchCustomerRequest.LastName = this.advanceSearchchild.createForm.controls['Lastname'].value;
      searchCustomerRequest.Phone = this.advanceSearchchild.createForm.controls['PhoneNo'].value;
      searchCustomerRequest.EmailAddress = this.advanceSearchchild.createForm.controls['EmailAdd'].value;
      searchCustomerRequest.Address = this.advanceSearchchild.createForm.controls['Address'].value;

      if (this.advanceSearchchild.createForm.controls['CCSuffix'].value) {
        searchCustomerRequest.CCSuffix = this.advanceSearchchild.createForm.controls['CCSuffix'].value;
      }
      else {
        searchCustomerRequest.CCSuffix = -1;
      }
    }
    else {
      searchCustomerRequest.AccountId = this.longFromViolator;
      searchCustomerRequest.TransponderNumber = '';
      searchCustomerRequest.VehicleNumber = '';
      searchCustomerRequest.FirstName = '';
      searchCustomerRequest.LastName = '';
      searchCustomerRequest.Phone = '';
      searchCustomerRequest.EmailAddress = '';
      searchCustomerRequest.Address = '';
      searchCustomerRequest.CCSuffix = -1;
    }

    searchCustomerRequest.IsTripTransfered = true;
    searchCustomerRequest.IsOneTimeTollCustomer = true;
    searchCustomerRequest.AccountStatus = AccountStatus[AccountStatus.AC.toString()].toString();
    searchCustomerRequest.PageIndex = <IPaging>{};
    searchCustomerRequest.PageIndex.PageNumber = this.pageNumber;
    searchCustomerRequest.PageIndex.PageSize = this.pageItemNumber;
    searchCustomerRequest.PageIndex.SortColumn = "CUSTOMERID";
    searchCustomerRequest.PageIndex.SortDir = 1;
    searchCustomerRequest.LoginId = this.sessionContextResponse.loginId;
    searchCustomerRequest.LoggedUserID = this.sessionContextResponse.userId;
    searchCustomerRequest.LoggedUserName = this.sessionContextResponse.userName;
    searchCustomerRequest.IsSearchEventFired = isSearch;
    searchCustomerRequest.ActivitySource = ActivitySource[ActivitySource.Internal];
    return searchCustomerRequest;
  }



  //search button
  searchCustomers() {
    if (this.advanceSearchchild.createForm.valid) {
      $('#pageloader').modal('show');
      if (!this.advanceSearchchild.createForm.controls['AccountNo'].value &&
        !this.advanceSearchchild.createForm.controls['SerialNo'].value &&
        !this.advanceSearchchild.createForm.controls['PlateNo'].value &&
        !this.advanceSearchchild.createForm.controls['Fname'].value &&
        !this.advanceSearchchild.createForm.controls['Lastname'].value &&
        !this.advanceSearchchild.createForm.controls['PhoneNo'].value &&
        !this.advanceSearchchild.createForm.controls['EmailAdd'].value &&
        !this.advanceSearchchild.createForm.controls['Address'].value &&
        !this.advanceSearchchild.createForm.controls['CCSuffix'].value
      ) {
        this.showErrorMsg('At least 1 field is required')
        this.isDisplaySearchDetails = false;
        $('#pageloader').modal('hide');
        return;
      }

      //prepare audit log for view.
      let userEvents: IUserEvents;
      userEvents = <IUserEvents>{};
      userEvents.FeatureName = Features[Features.MOVETOCUSTOMER];
      userEvents.ActionName = Actions[Actions.SEARCH];
      userEvents.PageName = this.router.url;
      userEvents.CustomerId = 0;
      userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
      userEvents.UserName = this.sessionContextResponse.userName;
      userEvents.LoginId = this.sessionContextResponse.loginId;

      this.isSameAccount = false;
      this.isDisplaySearchDetails = true;
      this.pageNumber = 1;
      this.startItemNumber = 1;
      this.endItemNumber = this.pageItemNumber;
      this.searchCustomerRequest = <ISearchCustomerRequest>{};
      this.searchCustomerRequest = this.getCustomers(true, 1, this.isSameAccount);
      if (this.searchCustomerRequest) {
        this.customerSearchService.getAdvancedSearch(this.searchCustomerRequest, userEvents).subscribe(res => {
          this.profileResponse = res;
          // console.log(this.profileResponse);
          $('#pageloader').modal('hide');
          if (this.profileResponse && this.profileResponse.length > 0) {
            this.totalRecordCount = this.profileResponse[0].RecordCount;
            if (this.totalRecordCount < this.pageItemNumber) {
              this.endItemNumber = this.totalRecordCount;
            }
          }
        }, err => {
          this.showErrorMsg('Error while fetching customer details');
          $('#pageloader').modal('hide');
          return;
        });
      }
      else {
        $('#pageloader').modal('hide');
      }
    }
  }


  //page change
  pageChanged(event) {
    this.pageNumber = event;
    this.startItemNumber = (((this.pageNumber) - 1) * this.pageItemNumber) + 1;
    this.endItemNumber = ((this.pageNumber) * this.pageItemNumber);
    if (this.endItemNumber > this.totalRecordCount)
      this.endItemNumber = this.totalRecordCount;
    //this.getCustomers(false, this.pageNumber, false);
    if (this.searchCustomerRequest) {
      this.searchCustomerRequest.PageIndex.PageNumber = this.pageNumber;
      this.customerSearchService.getAdvancedSearch(this.searchCustomerRequest).subscribe(res => {
        this.profileResponse = res;
        // console.log(this.profileResponse);
        if (this.profileResponse && this.profileResponse.length > 0) {
          this.totalRecordCount = this.profileResponse[0].RecordCount;
          if (this.totalRecordCount < this.pageItemNumber) {
            this.endItemNumber = this.totalRecordCount;
          }
        }
      }, err => {
        this.showErrorMsg('Error while fetching customer details');
        return;
      });
    }
  }

  //radio button change
  onSelectionChange(entry) {
    if (entry == 0) {
      $('#divNewAccount').show();
      this.isSameAccount = false;
    }
    else {
      $('#divNewAccount').hide();
      this.isSameAccount = true;
      let searchCustomerRequest: ISearchCustomerRequest = <ISearchCustomerRequest>{};
      searchCustomerRequest = this.getCustomers(false, 1, this.isSameAccount);
      if (searchCustomerRequest) {

        this.boolOneTollCustomer = false;
        this.customerSearchService.getAdvancedSearch(searchCustomerRequest).subscribe(res => {
          this.profileResponse = res;
          // console.log(this.profileResponse);

        }, (err) => {
          this.showErrorMsg('Error while fetching customer details');
          return;
        }, () => {
          // debugger;
          if (this.profileResponse && this.profileResponse.length > 0) {
            this.longToViolator = this.profileResponse[0].AccountId;
            this.strAccountStatus = this.profileResponse[0].AccountStatus;
            this.boolOneTollCustomer = this.profileResponse[0].IsOneTimeTollCustomer;
            //  let boolIsPostPaidCustomer = this.profileResponse[0].AccountType;
            this.balanceReqObject = <any>{};
            this.balanceReqObject.CustomerId = this.longToViolator;
            //one toll customer
            if (this.boolOneTollCustomer) {
              this.balanceReqObject.BalanceType = BalanceType[BalanceType.ADVANCEPAYMENT];
              this.violatorDetailsService.getVioDepBalance(this.balanceReqObject).subscribe(res => {
                if (res) {
                  this.balanceResObject = res;
                  // console.log(this.balanceResObject);
                }
              }, (err) => { this.showErrorMsg(err.statusText.toString()); }
                , () => {
                  if (this.balanceResObject && this.balanceResObject.AdvancePayment > 0) {
                    this.transferViolations(false, true);
                  }
                  else {
                    $('#pageloader').modal('hide');
                    this.showErrorMsg('Account Balance is less than Payment amount');
                    return;
                  }
                });
            }
            else {
              this.balanceReqObject.CustomerId = this.longFromViolator;
              this.violatorDetailsService.getVioDepBalance(this.balanceReqObject).subscribe(res => {
                if (res) {
                  this.balanceResObject = res;
                  if (this.balanceResObject) {
                    if (this.strAccountStatus == AccountStatus[AccountStatus.AC.toString()]) {
                      if (this.balanceResObject.TollBalance >= this.outStandingAmount) {
                        this.transferViolations(false, false);
                      }
                      else {
                        this.showErrorMsg('Account Balance is less than Payment amount');
                        return;
                      }
                    }
                    else {
                      this.showErrorMsg('The account was not in ACTIVE customer status');
                      return;
                    }
                  }
                }
              });
            }
          }
          else {
            this.showErrorMsg('Customer account does not exist for this violator account.')
            return;
          }
        })
      }
    }
  }

  //grid selection
  checkorUncheckCustomer(customerResponse: ICustomerProfileResponse, event: any) {
    let isChecked: boolean = event.target.checked;
    if (isChecked) {
      this.customerProfileRequestArray = [];
      this.customerProfileRequestArray.push(customerResponse);
    }
  }

  //Link trips button
  linkTrips() {
    //debugger;
    if (this.customerProfileRequestArray.length > 0) {
      $('#pageloader').modal('show');
      this.strAccountStatus = this.customerProfileRequestArray[0].AccountStatus;
      this.boolOneTollCustomer = this.customerProfileRequestArray[0].IsOneTimeTollCustomer;
      this.parentAccountId = this.customerProfileRequestArray[0].ParentId;
      this.longToViolator = this.customerProfileRequestArray[0].AccountId;
      let boolIsPostPaidCustomer = this.customerProfileRequestArray[0].AccountType;

      if (this.boolOneTollCustomer) {
        this.balanceReqObject = <any>{};
        this.balanceReqObject.CustomerId = this.longToViolator;
        this.balanceReqObject.BalanceType = BalanceType[BalanceType.ADVANCEPAYMENT];
        this.violatorDetailsService.getVioDepBalance(this.balanceReqObject).subscribe(res => {
          if (res) {
            this.balanceResObject = res;
          }
        }, (err) => { $('#pageloader').modal('hide'); this.showErrorMsg(err.statusText.toString()); }
          , () => {
            // debugger;
            if (this.balanceResObject && this.balanceResObject.AdvancePayment > 0) {
              this.transferViolations(false, true);
            }
            else {
              this.showErrorMsg('Account Balance is less than Payment amount')
              $('#pageloader').modal('hide');
              return;
            }
          });
      }
      else {
        let ParentOrChildAcc: number = 0;
        let capAmount: number;

        if (this.strAccountStatus == AccountStatus[AccountStatus.AC.toString()]) {
          if (this.parentAccountId > 0)
            ParentOrChildAcc = this.parentAccountId;
          else
            ParentOrChildAcc = this.longToViolator;

          this.balanceReqObject = <any>{};
          this.balanceReqObject.CustomerId = ParentOrChildAcc;
          this.violatorDetailsService.getVioDepBalance(this.balanceReqObject).subscribe(res => {
            if (res) {
              this.balanceResObject = res;
            }
          }, (err) => { $('#pageloader').modal('hide'); this.showErrorMsg(err.statusText.toString()); }
            , () => {
              let planResponse: any[];
              this.planRequest = <any>{};
              this.planRequest.AccountId = this.longToViolator;
              this.violatorDetailsService.getPlan(this.planRequest)
                .subscribe(res => {
                  if (res) {
                    planResponse = res; //ParentPlanName = res[0].ParentPlanName;
                  }
                }, (err) => {
                  $('#pageloader').modal('hide');
                  this.showErrorMsg(err.statusText.toString());
                }
                , () => {
                  // debugger;
                  if (planResponse[0].ParentPlanName != undefined) {
                    if (planResponse[0].ParentPlanName.toLocaleUpperCase() == TollType[TollType.POSTPAID.toString()])
                      this.isPostpaidCustomer = true;
                    else
                      this.isPostpaidCustomer = false;
                    if (this.isPostpaidCustomer) {
                      this.commonService.getApplicationParameterValue(ApplicationParameterkey.CapAmount).subscribe(
                        res => {
                          // debugger;
                          capAmount = res;
                        }, (err) => {
                          $('#pageloader').modal('hide');
                          this.showErrorMsg(err.statusText.toString())
                        }, () => {
                          //debugger;
                          if (parseInt(this.balanceResObject.PostpaidBalance) + this.outStandingAmount > capAmount) {
                            $('#pageloader').modal('hide');
                            this.showErrorMsg('Customer reached Cap Amount')
                            return;
                          }
                          if (capAmount >= this.balanceResObject.PostpaidBalance + this.outStandingAmount) {
                            this.validatePrepaidPostPaid();
                          }
                          else {
                            // debugger;
                            $('#pageloader').modal('hide');
                            this.showErrorMsg('Account Balance is less than Payment amount');
                            return;
                          }
                        });
                    }
                    else {
                      if ((!this.isPostpaidCustomer && this.balanceResObject.TollBalance > this.outStandingAmount)) {
                        this.validatePrepaidPostPaid();
                      }
                      else {
                        //debugger;
                        $('#pageloader').modal('hide');
                        this.showErrorMsg('Account Balance is less than Payment amount');
                        return;
                      }
                    }
                  }
                  else {
                    $('#pageloader').modal('hide');
                    this.showErrorMsg('The account does not have plan')
                    return;
                  }
                });

            });
        }
        else {
          $('#pageloader').modal('hide');
          this.showErrorMsg('The account is not in ACTIVE customer status');
          return;
        }
      }
    }
    else {
      this.showErrorMsg('Select atleast one account')
      $('#pageloader').modal('hide');
      return;
    }
  }


  validatePrepaidPostPaid() {
    let intTagAssociatedWithVehicle: number;
    this.commonService.getApplicationParameterValue(ApplicationParameterkey.IsVehicleTags).subscribe(
      res => {
        intTagAssociatedWithVehicle = res;
      }, (err) => {
        $('#pageloader').modal('hide');
      }, () => {
        if (intTagAssociatedWithVehicle == 0) {
          this.violatorDetailsService.getVehicleNumbersForLinking(this.longFromViolator, this.tripIdCSV).subscribe(
            res => {
              this.strVehicles = res;
            }, (err) => {
              $('#pageloader').modal('hide');
              this.showErrorMsg(err.statusText.toString())
            }, () => {
              if (this.strVehicles && this.strVehicles.length) {
                this.strVehicles = this.strVehicles.slice(0, -1);
                $('#pageloader').modal('hide');
                // $('#confirm-dialog').modal('show');
                this.confirmFlag = true;
              }
              else
                this.transferViolations(false, false);
            });
        }
        else {
          this.transferViolations(false, false);
        }
      });

  }

  //move vehicles to other account
  btnYesForExisting() {
    this.confirmFlag = false;
    //$('#confirm-dialog').modal('hide');
    $('#pageloader').modal('show');
    this.transferViolations(true, false);
  }

  // don't move vehicles to other account.
  btnNoForExisting() {
    this.confirmFlag = false;
    // $('#confirm-dialog').modal('hide');
    $('#pageloader').modal('show');
    this.transferViolations(false, false);
  }

  //link trips to account.
  transferViolations(IsAddVehicle: boolean, IsOneTimeTollCustomer: boolean) {

    //prepare audit log for view.
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.MOVETOCUSTOMER];
    userEvents.ActionName = Actions[Actions.TRANSFER];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.longFromViolator;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;

    this.violatorTransaction = <any>{};
    this.violatorTransaction.ViolatorId = this.longFromViolator;
    this.violatorTransaction.UserName = this.UserInputs.userName;
    this.violatorTransaction.SubSystem = SubSystem[SubSystem.TVC.toString()];
    this.violatorTransaction.CitationCSV = this.tripIdCSV;
    this.violatorTransaction.IsOneTimeTollCustomer = IsOneTimeTollCustomer;
    if (this.parentAccountId > 0)
      this.violatorTransaction.CustomerId = this.parentAccountId;
    else
      this.violatorTransaction.CustomerId = this.longToViolator;
    this.violatorTransaction.OutstandingAmount = this.outStandingAmount;
    this.violatorTransaction.ICNId = this.UserInputs.icnId;;
    this.violatorTransaction.UserId = this.UserInputs.userId;
    this.violatorTransaction.LoginId = this.UserInputs.loginId
    this.violatorTransaction.TxnDate = new Date();
    this.violatorTransaction.IsVehicleAdd = IsAddVehicle;
    if (this.violatorTransaction.IsOneTimeTollCustomer) {
      this.violatorTransaction.IsPostpaidCustomer = false;
    }
    else {
      this.violatorTransaction.IsPostpaidCustomer = this.isPostpaidCustomer;
    }

    this.violatorDetailsService.transferViolationsToCustomer(this.violatorTransaction, userEvents).subscribe(res => {
      if (res) {
        if (this.tripContextResponse.isBeforeSearch) {
          $('#pageloader').modal('hide');
          this.tripContextResponse.successMessage = 'Trip(s) are linked to the customer account successfully ';
          this.router.navigate(['tvc/violatordetails/trip-adjustments']);

        } else {
          if (this.tripContextResponse.isFromInvoiceSearch) {
            const strDateRange = new Date().toLocaleDateString(defaultCulture).replace(/\u200E/g,"").split('/');
            this.bsRangeValue = [new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1])), new Date(Number(strDateRange[2]), Number(strDateRange[0]) - 1, Number(strDateRange[1]))];
            this.tripContextResponse.dateRange = this.bsRangeValue;
          }
          $('#pageloader').modal('hide');
          this.tripContextResponse.successMessage = 'Trip(s) are linked to the customer account successfully ';
          this.router.navigate(['tvc/violatordetails/trip-Search']);
        }
      }
      else {
        $('#pageloader').modal('hide');
      }
    }, (err) => {
      $('#pageloader').modal('hide');
      this.showErrorMsg(err.statusText.toString())
    }
      , () => {

      });

  }

  //Reset button
  searchReset() {
    this.advanceSearchchild.createForm.reset();
    this.pageNumber = 1;
    this.startItemNumber = 1;
    this.endItemNumber = this.pageItemNumber;
    this.profileResponse = [];
  }


  //back button
  backClick() {
    let link = ['tvc/violatordetails/trip-adjustments'];
    this.router.navigate(link);
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

  emitFlag() {
    this.confirmFlag = false;
  }


}


export interface IAddUserInputs {
  userName: string
  loginId: number
  userId: number
  icnId: number;
}
