import { IViolatorContextResponse } from './../../shared/models/violatorcontextresponse';
import { ViolatorContextService } from './../../shared/services/violator.context.service';
import { debug } from 'util';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { ViolatordetailsService } from './services/violatordetails.service';
import { IVioAmountsResponse } from './models/vioamountsresponse';
import { SubSystem, Features, Actions, defaultCulture } from '../../shared/constants';
import { SessionService } from '../../shared/services/session.service';
import { TripsContextService } from '../../shared/services/trips.context.service';
import { CustomerContextService } from '../../shared/services/customer.context.service';
import { Router } from '@angular/router';
import { ICustomerContextResponse } from '../../shared/models/customercontextresponse';
import { ITripsContextResponse } from '../../shared/models/tripscontextresponse';
import { IUserresponse } from '../../shared/models/userresponse';
import { InvoicesContextService } from '../../shared/services/invoices.context.service';
import { IInvoicesContextResponse } from "../../shared/models/invoicescontextresponse";
import { IUserEvents } from '../../shared/models/userevents';
import { CommonService } from '../../shared/services/common.service';
import { MaterialscriptService } from "../../shared/materialscript.service";
declare var $: any;
@Component({
  selector: 'app-trip-adjustments',
  templateUrl: './trip-adjustments.component.html',
  styleUrls: ['./trip-adjustments.component.scss']
})


export class TripAdjustmentsComponent implements OnInit {
  disableAdjustmentbtn: boolean = false;
  constructor(private violatordetailsService: ViolatordetailsService,
    private violatorContext: ViolatorContextService,
    private router: Router,
    private tripContextService: TripsContextService,
    private invoiceContextService: InvoicesContextService,
    private sessionContext: SessionService,
    private commonService: CommonService,
     private materialscriptService: MaterialscriptService) {
  }

  violatorContextResponse: IViolatorContextResponse;
  vioAmountsList: IVioAmountsResponse[];
  violationDetails: any;
  violationFeesList: any[] = [];
  violationFee: any;
  isAllowCreditToggle: boolean = true;
  tripAdjustmentForm: FormGroup;
  tempTotalAdjustedPenaltyAmount: number;
  isDiscountBlockVisible: boolean = false;
  vioAdjustmentObject: any;
  vioAmountRequest: any;
  vioAmountRequestList: any[];
  violationFeesRequest: any;
  violationFeesListRequest: any[];
  UserInputs: IAddUserInputs = <IAddUserInputs>{};
  violatorId: number = 0;
  strCitationIdCSV: string;
  restrictNSFFeeDiscountExist: boolean;
  applyDiscountFields: boolean = true;
  totalTripsCount: number = 0;
  totalPenaultyCount: number = 0;
  tripsContext: ITripsContextResponse;
  redirectURL: string;
  tripIdCSV: string = '';
  sessionContextResponse: IUserresponse;
  tripContext: ITripsContextResponse;
  invoiceContextResponse: IInvoicesContextResponse;
  defaultAdjustment: string = 'C';
  isParentSelected: boolean;

  msgFlag: boolean;
  msgType: string;
  msgDesc: string;

  adjustmentType = [
    {
      id: 'C',
      Value: 'Credit Adjustment'
    },
    {
      id: 'D',
      Value: 'Debit Adjustment'
    }
  ];

  ngOnInit() {
     this.materialscriptService.material();
    this.sessionContextResponse = this.sessionContext.customerContext;
    this.UserInputs.loginId = this.sessionContextResponse.loginId;
    this.UserInputs.userId = this.sessionContextResponse.userId;
    this.UserInputs.userName = this.sessionContextResponse.userName;
    this.UserInputs.icnId = this.sessionContextResponse.icnId;

    this.tripAdjustmentForm = new FormGroup({
      discountAmount: new FormControl('', []),
      checkdiscount: new FormControl('', []),
    });

    this.violatorContext.currentContext
      .subscribe(customerContext => {
        if (customerContext && customerContext.accountId > 0) {
          this.violatorContextResponse = customerContext;
          this.violatorId = this.violatorContextResponse.accountId;
          this.tripContextService.currentContext.subscribe(res => {
            if (res && res.referenceURL.length > 0) {
              this.tripContext = res;
              this.tripIdCSV = res.tripIDs.toString();
              this.redirectURL = res.referenceURL;
              if(res.successMessage != '' && res.successMessage !=undefined){
              this.showSucsMsg(res.successMessage);
              }
            }
          });
        } else {
          this.tripContextService.currentContext.subscribe(res => {
            if (res && res.referenceURL.length > 0) {
              this.tripContext = res;
              this.tripIdCSV = res.tripIDs.toString();
              this.redirectURL = res.referenceURL;
              this.violatorId = res.accountId;
              if(res.successMessage != '' && res.successMessage !=undefined){
                this.showSucsMsg(res.successMessage);
                }
            } else {
              // let link = ['tvc/search/violation-search'];
              // this.tripContextService.changeResponse(null);
              // this.router.navigate(link);
              // TODO: If no trips context
              // navigate to
            }
          });
          // TO DO if no customer context
        }
        // console.log('Recvd trips:' + this.tripIdCSV);
        // console.log('Recvd URL:' + this.redirectURL);

      });

    //prepare audit log for view.
    let userEvents: IUserEvents;
    userEvents = <IUserEvents>{};
    userEvents.FeatureName = Features[Features.VIOLATIONADJUSTMENT];
    userEvents.ActionName = Actions[Actions.VIEW];
    userEvents.PageName = this.router.url;
    userEvents.CustomerId = this.violatorId;
    userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
    userEvents.UserName = this.sessionContextResponse.userName;
    userEvents.LoginId = this.sessionContextResponse.loginId;
    this.bindTripDetails(userEvents);
    this.checkRolesandPrivileges();
  }

  checkRolesandPrivileges() {
    this.disableAdjustmentbtn = !this.commonService.isAllowed(Features[Features.VIOLATIONADJUSTMENT], Actions[Actions.UPDATE], "");
  }

  //Bind trip details
  bindTripDetails(userEvents?: IUserEvents) {
    this.vioAmountsList = [];
    this.violationFeesList = [];
    this.totalTripsCount = this.vioAmountsList.length;
    this.isParentSelected = false;

    this.violationDetails = <any>{};
    this.violationDetails.longViolatorId = this.violatorId;
    this.strCitationIdCSV = this.violationDetails.strCitationIdCSV = this.tripIdCSV;
    this.violatordetailsService.getChargesTrackerDetailsByCitationCSV(this.violationDetails, userEvents)
      .subscribe(res => {
        if (res) {
          this.vioAmountsList = res;
          if (this.vioAmountsList && this.vioAmountsList.length > 0) {
            this.totalTripsCount = this.vioAmountsList.length;
            this.tempTotalAdjustedPenaltyAmount = this.vioAmountsList[0].TotalAdjustedTripsPenaltyAmount;
            this.vioAmountsList.forEach(element => {
              if (element.objViolationFees && element.objViolationFees.length > 0) {
                this.violationFeesList.push(element.objViolationFees);
              }
            });
            if (this.violationFeesList.length > 0) {
              this.totalPenaultyCount = 0;
              this.totalPenaultyCount = this.violationFeesList.length;
              this.isDiscountBlockVisible = true;
            }
          }
        }
      }, () => { }
      , () => {
        // this.totalPenaultyCount = this.violationFeesList.length;
        // var result = this.vioAmountsList.filter(x => x.checkedStatus == true).length;
        // if (result == this.vioAmountsList.length)
        //   this.isParentSelected = true;
        // else{
        //   this.isParentSelected = false;
        // }
      })
  }

  //show fees button event
  showFees = function (viotrips) {
    viotrips.boolShowFee = !viotrips.boolShowFee;
  };

  //radio button change event.
  onSelectionChange(entry) {
    this.tripAdjustmentForm.reset();
    if (entry == 'D') {
      this.isAllowCreditToggle = !this.isAllowCreditToggle;
      this.tripAdjustmentForm.controls['discountAmount'].clearValidators();
    }
    else {
      this.tripAdjustmentForm.controls['discountAmount'].setValidators([Validators.required]);
      this.isAllowCreditToggle = !this.isAllowCreditToggle;
    }
    this.defaultAdjustment = entry;
    this.vioAmountsList = [];
    this.violationFeesList = [];
    this.bindTripDetails();
  }

  //apply discount button event
  applyDiscountButton(adjustmentType: string) {
    if (adjustmentType == 'C' && (this.tripAdjustmentForm.controls['discountAmount'].value == '' || this.tripAdjustmentForm.controls['discountAmount'].value == null || this.tripAdjustmentForm.controls['discountAmount'].value > 100 || this.tripAdjustmentForm.controls['discountAmount'].value < 0)) {
      this.showErrorMsg('Enter valid Discount')
      return;
    }
    else {
      this.restrictNSFFeeDiscountExist = true;
      this.vioAmountsList.forEach(element => {
        element.boolDisableFeeAll = true;
      });
      this.applyDiscount(adjustmentType);
    }
  }

  //apply discount
  applyDiscount(adjustmentType: string) {
    if (this.vioAmountsList.length > 0 && this.tripAdjustmentForm.controls['discountAmount'].value != undefined && this.tripAdjustmentForm.controls['discountAmount'].value != '') {
      this.vioAmountsList.forEach(element => {
        if (!element.checkedStatus) {
          if (element.objViolationFees.length > 0) {
            element.objViolationFees.forEach(objFeeElement => {
              let citationId = objFeeElement.CitationId;
              let FeeAmount = objFeeElement.Amount;
              let discountAmount = FeeAmount * (parseFloat(this.tripAdjustmentForm.controls['discountAmount'].value) / 100)
              var index = this.vioAmountsList.findIndex(x => x.CitationId == citationId);
              element.AdjFineFee = parseFloat(parseFloat(discountAmount.toString()).toFixed(2));
              objFeeElement.AdjAmount = parseFloat(parseFloat(discountAmount.toString()).toFixed(2));
            })
          }
        }
      })
    }
    this.CalculateAdjustmentAmounts(adjustmentType);
  }

  //Calculate overall amounts
  CalculateAdjustmentAmounts(adjustmentType: string) {
    let temp_TotalAdjustedTollAmount = 0;
    let temp_TotalAdjustedFeeAmount = 0;
    let temp_TotalAdjustedAmount = 0;

    if (this.vioAmountsList.length > 0) {
      this.vioAmountsList.forEach(element => {
        if (adjustmentType == 'C')
          element.AdjTotalFee = element.TotalFee - (element.AdjTollfee + element.AdjFineFee);
        else
          element.AdjTotalFee = element.TotalFee + (element.AdjTollfee + element.AdjFineFee);

        temp_TotalAdjustedTollAmount += element.AdjTollfee;
        temp_TotalAdjustedFeeAmount += element.AdjFineFee;
        temp_TotalAdjustedAmount += element.AdjTotalFee;
      })
      this.vioAmountsList[0].TotalAdjustedTripsAmount = temp_TotalAdjustedTollAmount;
      this.vioAmountsList[0].TotalAdjustedPenaltyAmount = temp_TotalAdjustedFeeAmount;
      this.vioAmountsList[0].TotalAdjustedTripsPenaltyAmount = temp_TotalAdjustedAmount;
    }
  }

  //check box check all event
  checkAll(event) {
    if (this.vioAmountsList.length > 0) {
      this.vioAmountsList.forEach(element => {
        if (event.target.checked) {
          element.AdjTollfee = element.Tollfee;
          element.AdjFineFee = element.FineFee;
          element.checkedStatus = true;
          element.boolShowFee = false;
          element.boolDisableFeeAll = true;
          //appling penaulty 100% to the selected trip
          if (element.objViolationFees.length > 0) {
            element.objViolationFees.forEach(element1 => {
             element1.AdjAmount = element.FineFee;
            });
          }
        }
        else {
          element.AdjTollfee = 0;
          element.AdjFineFee = 0;
          element.checkedStatus = false;
          element.boolDisableFeeAll = false;
          //Fee Adjusted Amount updated.
          if (element.objViolationFees.length > 0) {
            element.objViolationFees.forEach(element1 => {
              element1.AdjAmount = 0;

            });
          }
        }
      })
      this.applyDiscount(this.defaultAdjustment);
    }
  }

  //each check box changed event.
  checkChangeCreditAdjustment(selectedTrip: any) {
    
    if (selectedTrip.checkedStatus) {
      var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTrip.CitationId);
      this.vioAmountsList[index].AdjTollfee = selectedTrip.Tollfee;
      this.vioAmountsList[index].AdjFineFee =  selectedTrip.FineFee;
      if (!this.restrictNSFFeeDiscountExist) {
        this.vioAmountsList[index].boolDisableFeeAll = true;
      }

      var result = this.vioAmountsList.filter(x => x.checkedStatus == true).length;
      if (result == this.vioAmountsList.length)
        this.isParentSelected = true;

      if (selectedTrip.objViolationFees.length > 0) {
        selectedTrip.objViolationFees.forEach(element => {
          element.AdjAmount = selectedTrip.FineFee;
        });
      }
    }
    else {
      this.isParentSelected = false;
      var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTrip.CitationId);
      this.vioAmountsList[index].AdjTollfee = 0;
      this.vioAmountsList[index].AdjFineFee = 0;
      if (!this.restrictNSFFeeDiscountExist) {
        this.vioAmountsList[index].boolDisableFeeAll = false;
      }
      if (selectedTrip.objViolationFees.length > 0) {
        selectedTrip.objViolationFees.forEach(element => {
          element.AdjAmount = 0;
        });
      }
    }

    //bug changes
    // if (selectedTrip.checkedStatus) {
    //   var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTrip.CitationId);
    //   // this.vioAmountsList[index].AdjTollfee =  selectedTrip.Tollfee;
    //   this.vioAmountsList[index].AdjFineFee = 0;
    // }
    this.applyDiscount(this.defaultAdjustment);
  }

  //Fee adjustment
  applyFeeAdjustment(selectedTripFee: any) {
    var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTripFee.CitationId);
    if (selectedTripFee.AdjAmount == null || selectedTripFee.AdjAmount < 0) {
      this.showErrorMsg('Invalid adjustment amount for the trip # : ' + selectedTripFee.CitationId)
      return;
    }
    else if (selectedTripFee.AdjAmount > selectedTripFee.Amount && this.defaultAdjustment == 'C') {
      this.showErrorMsg('You have entered adjusted amount more than penalty amount. Please check and re-enter for the trip # : ' + selectedTripFee.CitationId)
      return;
    }
    else {
      this.vioAmountsList[index].AdjFineFee = selectedTripFee.AdjAmount;
      this.applyDiscount(this.defaultAdjustment);
    }
  }

  //debit adjustment textbox changed event.
  applyDebitAdjustment(selectedTrip: any) {
    var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTrip.CitationId);
    if (selectedTrip.AdjTollfee < 0 || selectedTrip.AdjTollfee == null) {
      this.showErrorMsg('Invalid adjusted toll amount for the trip # : ' + selectedTrip.CitationId);
      return;
    }
    else {
      this.vioAmountsList[index].AdjTollfee = selectedTrip.AdjTollfee;
      this.CalculateAdjustmentAmounts('D');
    }
  }


  //debit adjustment textbox changed event.
  applyPartialAdjustment(selectedTrip: any) {

    var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTrip.CitationId);
    if (selectedTrip.AdjTollfee == null || selectedTrip.AdjTollfee < 0) {
      this.showErrorMsg('Invalid toll amount for the trip # :' + selectedTrip.CitationId)
      return;
    }
    else if(selectedTrip.AdjTollfee > selectedTrip.Tollfee){
      this.showErrorMsg('You have entered adjusted amount more than toll amount. Please check and re-enter for the trip # : ' + selectedTrip.CitationId);
      return;
    }
    else {
      this.vioAmountsList[index].AdjTollfee = selectedTrip.AdjTollfee;
      this.CalculateAdjustmentAmounts('C');
    }
  }



  //debit adjustment textbox changed event.
  applyDebitAdjustmentForFee(selectedTripFee: any) {
    var index = this.vioAmountsList.findIndex(x => x.CitationId == selectedTripFee.CitationId);
    if (selectedTripFee.AdjTollfee < 0 || selectedTripFee.AdjTollfee == null) {
      this.showErrorMsg('Invalid adjusted penalty amount for the trip # : ' + selectedTripFee.CitationId)
      return;
    }
    else {
      this.vioAmountsList[index].AdjFineFee = selectedTripFee.AdjFineFee;
      this.CalculateAdjustmentAmounts('D');
    }
  }

  applyAdjustment() {
    
    //ICN validation
    if (this.UserInputs.icnId == 0) {
      this.showErrorMsg('ICN is not assigned to do transactions.')
      $('#pageloader').modal('hide');
      return;
    }
    //Discount validation
    if (this.defaultAdjustment == 'C' && this.tripAdjustmentForm.controls['discountAmount'].value != '' && (parseFloat(this.tripAdjustmentForm.controls['discountAmount'].value) > 100)) {
      this.showErrorMsg('Enter valid Discount')
      $('#pageloader').modal('hide');
      return;
    }
    let boolResult = false;
    let citationIds: string = '';
    //validate the toll amount and fee amounts
    if (this.vioAmountsList && this.vioAmountsList.length > 0) {
      this.vioAmountsList.forEach(element => {
        //validate the toll adjusted fee and fine fee if credit type is C.
        if (element.AdjTollfee == null) {
          citationIds += element.CitationId.toString() + ', ';
          boolResult = true;
          return;
        }
        if (this.defaultAdjustment == 'C') {
          if (element.AdjTollfee > element.Tollfee) {
            citationIds += element.CitationId.toString() + ', ';
            boolResult = true;
            return;
          }
        }
        if (element.objViolationFees.length > 0) {
          element.objViolationFees.forEach(element1 => {
            if (element1.AdjAmount == null) {
              citationIds += element.CitationId.toString() + ', ';
              boolResult = true;
              return;
            }
            if (this.defaultAdjustment == 'C') {
              if (element1.AdjAmount > element.FineFee) {
                citationIds += element.CitationId.toString() + ', ';
                boolResult = true;
                return;
              }
            }
          })
        }
      });
      if (boolResult) {
        this.showErrorMsg('Invalid amount for the trip id(s) # : ' + citationIds.slice(0, -2))
        return;
      }
      else {
        //prepare adjustment object
        if (this.vioAmountsList && this.vioAmountsList.length > 0 && !boolResult) {

          //prepare audit log for view.
          let userEvents: IUserEvents;
          userEvents = <IUserEvents>{};
          userEvents.FeatureName = Features[Features.VIOLATIONADJUSTMENT];
          userEvents.ActionName = Actions[Actions.UPDATE];
          userEvents.PageName = this.router.url;
          userEvents.CustomerId = this.violatorId;
          userEvents.RoleId = parseInt(this.sessionContextResponse.roleID);
          userEvents.UserName = this.sessionContextResponse.userName;
          userEvents.LoginId = this.sessionContextResponse.loginId;

          $('#pageloader').modal('show');
          this.vioAmountRequestList = [] = [];
          let adjustTollAmount = 0;
          let adjustFeeAmount = 0;
          let totalOutstanding = 0;
          let violatorId: string;
          this.vioAmountsList.forEach(element => {
            this.vioAmountRequest = <any>{};
            this.vioAmountRequest.CitationId = element.CitationId;
            this.vioAmountRequest.AdjustedAmount = element.AdjFineFee + element.AdjTollfee;
            this.vioAmountRequest.AdjTollFee = element.AdjTollfee;
            adjustTollAmount += this.vioAmountRequest.AdjTollFee;
            this.vioAmountRequest.AdjFineFee = element.AdjFineFee;
            adjustFeeAmount += this.vioAmountRequest.AdjFineFee;
            this.vioAmountRequest.AdjTotalDue = element.AdjTotalFee;
            totalOutstanding += this.vioAmountRequest.AdjTotalDue;
            this.vioAmountRequest.ViolatorID = element.ViolatorID;
            this.vioAmountRequest.VehicleId = element.VehicleId;
            this.violationFeesListRequest = [] = [];
            if (element.objViolationFees.length > 0) {
              element.objViolationFees.forEach(element1 => {
                this.violationFeesRequest = <any>{};
                this.violationFeesRequest.Amount = element1.AdjAmount;
                this.violationFeesRequest.FeeCode = element1.FeeCode;
                this.violationFeesListRequest.push(this.violationFeesRequest);
                // element.AdjAmount=element1.FineFee;
              });
            }
            this.vioAmountRequest.objViolationFees = this.violationFeesListRequest;
            this.vioAmountRequestList.push(this.vioAmountRequest);
          });

          let TotolAdjustAmount = adjustTollAmount + adjustFeeAmount;
          if (TotolAdjustAmount > 0) {
            this.vioAdjustmentObject = <any>{};
            this.vioAdjustmentObject.CitationCSV = this.strCitationIdCSV;
            this.vioAdjustmentObject.UserName = this.UserInputs.userName;
            this.vioAdjustmentObject.OutstandingAmount = totalOutstanding;
            this.vioAdjustmentObject.ViolatorId = this.violatorId;
            this.vioAdjustmentObject.AdjustedAmount = TotolAdjustAmount;
            this.vioAdjustmentObject.CreatedDate = new Date().toLocaleString(defaultCulture).replace(/\u200E/g,"");
            this.vioAdjustmentObject.ViolationAmounts = this.vioAmountRequestList;
            this.vioAdjustmentObject.ICNId = this.UserInputs.icnId;
            this.vioAdjustmentObject.UserId = this.UserInputs.userId;
            this.vioAdjustmentObject.LoginId = this.UserInputs.loginId;
            this.vioAdjustmentObject.SubSystem = SubSystem[SubSystem.TVC.toString()];
            let boolResult = false;
            if (this.defaultAdjustment == 'C') {
              this.violatordetailsService.creditAdjustment(this.vioAdjustmentObject, userEvents)
                .subscribe(res => {
                  if (res) {
                    if (res) {
                      $('#pageloader').modal('hide');
                      this.showSucsMsg('Credit adjustment applied successfully.')
                      this.tripAdjustmentForm.reset();
                      this.applyDiscountFields = true;
                      this.restrictNSFFeeDiscountExist = false;
                      this.tripAdjustmentForm.patchValue({
                        discountAmount: 0
                      });
                    }
                  }
                }, (err) => {
                  $('#pageloader').modal('hide');
                  this.showErrorMsg(err.statusText.toString())
                }
                , () => {
                  this.totalTripsCount = 0;
                  this.totalPenaultyCount = 0;
                  this.bindTripDetails();
                });
            }
            else {
              this.violatordetailsService.debitAdjustment(this.vioAdjustmentObject, userEvents)
                .subscribe(res => {
                  if (res) {
                    if (res) {
                      $('#pageloader').modal('hide');
                      this.showSucsMsg('Debit adjustment applied successfully.')
                    }
                  }
                }, (err) => {
                  this.showErrorMsg(err.statusText.toString())
                  $('#pageloader').modal('hide');
                }
                , () => {
                  this.totalTripsCount = 0;
                  this.totalPenaultyCount = 0;
                  this.bindTripDetails();
                });
            }
          }
          else {
            if (this.defaultAdjustment == 'C') {
              $('#pageloader').modal('hide');
              this.showErrorMsg('Adjustment amount(Sum of Toll Fee and Fine Fee) should be greater than zero to apply adjustment')
            }
            else {
              $('#pageloader').modal('hide');
              this.showErrorMsg('Please specify the amount to be adjusted.')
            }
          }
        }

      }
    }
  }


  //Check box selection for credit discount
  checkDiscount(event) {
    if (event.target.checked) {
      this.applyDiscountFields = false;
      this.restrictNSFFeeDiscountExist = true;
      this.vioAmountsList.forEach(element => {
        element.boolShowFee = false;
        this.tripAdjustmentForm.patchValue({
          discountAmount: 0
        });
        if (!element.checkedStatus) {
          element.boolDisableFeeAll = true;
          element.AdjTollfee = 0;
          element.AdjFineFee = 0;
        }
        if (element.objViolationFees.length > 0) {
          element.objViolationFees.forEach(element1 => {
            element1.AdjAmount = 0;
          });
        }
      });
      this.CalculateAdjustmentAmounts('C');
    }
    else {
      this.applyDiscountFields = true;
      this.restrictNSFFeeDiscountExist = false;
      this.tripAdjustmentForm.patchValue({
        discountAmount: 0
      });

      this.vioAmountsList.forEach(element => {
        if (!element.checkedStatus) {
          element.boolDisableFeeAll = false;
          element.AdjTollfee = 0;
          element.AdjFineFee = 0;
        }
        if (element.objViolationFees.length > 0) {
          element.objViolationFees.forEach(element1 => {
            element1.AdjAmount = 0;
          });
        }
      });
      this.CalculateAdjustmentAmounts('C');
    }
  }

  // collapse(event) {
  //   $(event.target).toggleClass('glyphicon-chevron-down');
  // };

  makePayment() {
    let tripsInPaymentPlan = this.checkTripsInPaymentPlan();
    if (tripsInPaymentPlan != '') {
      this.showErrorMsg('Selected Trip # (s) ' + tripsInPaymentPlan + ' are in payment plan')
      return;
    }
    else {
      if (this.tripContext != null) {
        this.tripContext.referenceURL = 'tvc/violatordetails/trip-adjustments'
      }
      this.router.navigate(['tvc/paymentdetails/violation-payment']);
    }
  }

  moveTripsToCustomer() {
    this.checkTripsOutstadning();
  }

  checkTripsOutstadning() {
    let intAdjustPaidCount = 0;
    let loopBreak = 0;

    //check any trips are adjusted.
    var index = this.vioAmountsList.findIndex(x => x.CitationStatus.toUpperCase() == 'ADJUSTPAID');
    if (index != -1) {
      this.showErrorMsg('Selected trip(s) already in adjustpaid status.')
      return;
    }

    //check any trips are already paid.
    var indexforpaidAmount = this.vioAmountsList.findIndex(x => x.TotalFee <= 0);
    if (indexforpaidAmount != -1) {
      this.showErrorMsg('Select the  trip(s) for which balance due is greater than zero.')
      return;
    }

    //check any trips are in payment plan.
    let tripsInPaymentPlan = this.checkTripsInPaymentPlan();
    if (tripsInPaymentPlan != '') {
      this.showErrorMsg('Selected Trip # (s) ' + tripsInPaymentPlan + ' are in payment plan')
      return;
    }
    else {
      if (this.tripContext != null) {
        this.tripContext.selectedTripsOutstandingAmount = this.vioAmountsList[0].TotalTripsPenaltyAmount
      }
      if (this.tripContext != null) {
        this.tripContext.referenceURL = 'tvc/violatordetails/trip-adjustments'
      }
      this.showConfirmationMsg('Are you sure you want to move to customer?');
      
    }
  }


  userAction(event) {
    if (event) {
      this.router.navigate(['tvc/violatordetails/violation-transfer-to-customer']);
     
    }
  }

  

  checkTripsInPaymentPlan(): string {
    let tripsInPaymentPlan = '';
    //check if any payment plan trips are exist.
    this.vioAmountsList.forEach(element => {
      if (element.HoldType == 'Payment Plan' && element.HoldType) {
        tripsInPaymentPlan += element.CitationId + ',';
      }
    });
    return tripsInPaymentPlan;

  }

  updateTripStatus() {

    if (this.tripContext != null) {
      this.tripContext.referenceURL = 'tvc/violatordetails/trip-adjustments';
    }
    // if (this.invoiceContextResponse != null) {
    //   this.tripContext.referenceURL = 'tvc/violatordetails/trip-adjustments'
    // }
    this.router.navigate(['tvc/violatordetails/transaction-status-update']);
  }

  resetButton() {
    
    this.tripAdjustmentForm.reset();
    this.applyDiscountFields = true;
    this.restrictNSFFeeDiscountExist = false;
    this.tripAdjustmentForm.patchValue({
      discountAmount: 0
    });
    this.defaultAdjustment = 'C';
    this.tripAdjustmentForm.controls['discountAmount'].setValidators([Validators.required]);
    this.isAllowCreditToggle = true;
    this.vioAmountsList = [];
    this.violationFeesList = [];
    this.totalPenaultyCount = 0;
    this.isParentSelected = false;
    this.bindTripDetails();
  }

  exitClick() {
    let link = ['tvc/search/violation-search'];
    this.tripContextService.changeResponse(null);
    this.router.navigate(link);
  }


  backClick() {
    if (this.tripContext.isFromInvoiceSearch) {
      if (this.tripContext.isBeforeSearch) {
        this.router.navigate(['tvc/invoices/batch-invoice-details']);
      } else {
        this.router.navigate(['tvc/customerdetails/invoices/batch-invoice-details']);
      }
    }
    else if (this.redirectURL !== '' && !this.redirectURL.endsWith('trip-adjustments')) {
      this.router.navigateByUrl(this.redirectURL);
    } else {
      this.router.navigate(['tvc/violatordetails/trip-Search']);
    }
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

  showConfirmationMsg(msg: string): void {
    this.msgFlag = true;
    this.msgType = 'alert';
    this.msgDesc = msg;
  }


 setOutputFlag(e) {
    this.msgFlag = e;
  }
}


export interface IAddUserInputs {
  userName: string
  loginId: number
  userId: number
  icnId: number;
}
