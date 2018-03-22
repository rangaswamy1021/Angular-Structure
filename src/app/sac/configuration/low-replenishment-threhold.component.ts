import { Component, OnInit } from '@angular/core';
import { ConfigurationService } from './services/configuration.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILowBalanceandThresholdAmountsRequest } from './models/lowbalanceandthresholdamountsrequest';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-low-replenishment-threhold',
  templateUrl: './low-replenishment-threhold.component.html',
  styleUrls: ['./low-replenishment-threhold.component.scss']
})
export class LowReplenishmentThreholdComponent implements OnInit {
  index: number;
  amount: number;
  ReplenishType: any;
  AmountType: any;
  response: ILowBalanceandThresholdAmountsRequest[];
  lowbalance: FormGroup;
  msgFlag: boolean;
  msgType: string;
  msgDesc: string;
  amtChangeResponseSelected: ILowBalanceandThresholdAmountsRequest[] = <ILowBalanceandThresholdAmountsRequest[]>[];
  isValid: boolean = true;
  constructor(private confService: ConfigurationService, private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
    this.lowbalance = new FormGroup({
      'amounttype': new FormControl('LOW', []),
      'replenishtype': new FormControl('CREDITCARD', [])
    });
    this.getLowBalanceandThresholdAmounts();
  }


  getLowBalanceandThresholdAmounts() {
    this.AmountType = this.lowbalance.controls['amounttype'].value;
    this.ReplenishType = this.lowbalance.controls['replenishtype'].value;
    this.confService.GetLowBalanceandThresholdAmounts().subscribe(
      res => {
        this.response = res;
        this.response = this.response.filter(x => x.AmountType.toUpperCase() == this.AmountType && x.ReplenishType.toUpperCase() == this.ReplenishType);
      }
    );
  }

  onAmountChange(event, obj: ILowBalanceandThresholdAmountsRequest, indx: number) {

    this.amount = obj.Amount;
    if (indx == this.response.length)
      indx = indx - 1;
    this.index = indx;

    // if (obj.Amount > this.response[indx - 1].Amount) {
    //   this.showErrorMsg('should be less than above slab');
    // }
    // else if (obj.Amount < this.response[indx + 1].Amount) {
    //   this.showErrorMsg('should be greater than below slab');
    // }
    // if (this.response.length > indx + 1) {
    //   if (!(this.response[indx + 1].Amount > obj.Amount)) {
    //     this.showErrorMsg('should be less than above slab');
    //     this.isValid = false;
    //     return;
    //   }
    // }

    // if (indx > 0)
    //   if (!(this.response[indx - 1].Amount < obj.Amount)) {
    //     this.showErrorMsg('should be greater than below slab');
    //     this.isValid = false;
    //     return;
    //   }
  }

  onUpdateClick() {
    let result = this.checkValidation();
    if (result) {
      this.confService.UpdateLowBalandThresholdAmount(this.response).subscribe(res => {
        if (res) {
          const msg = 'Amount has been updated successfully';
          this.showSucsMsg(msg);
        } else {
          this.showErrorMsg('Unable to update amount');
        }
      });
    }
  }

  checkValidation(): boolean {
    let indexValue = this.index;
    if (this.index == 0) {
      if (this.amount < this.response[this.index + 1].Amount) {
        this.showErrorMsg('should be greater than below slab');
        return;
      }
      else {
        return true;
      }
    }
    else if (this.amount > this.response[this.index - 1].Amount) {
      this.showErrorMsg('should be less than above slab');
      return;
    }
    else if (this.index != this.response.length - 1) {
      if (this.amount < this.response[this.index + 1].Amount) {
        this.showErrorMsg('should be greater than below slab');
        return;
      }
      else {
        return true;
      }
    }
    return true;
  }

  reset() {
    this.ngOnInit();
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

}
