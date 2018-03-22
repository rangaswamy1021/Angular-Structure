import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IUserresponse } from '../../shared/models/userresponse';
import { SessionService } from '../../shared/services/session.service';
import { Router } from '@angular/router';
import { IDMVDetails } from './models/DMVDetails';
import { ViolatorAccountsService } from './services/violatoraccounts.service';
import { MaterialscriptService } from "../../shared/materialscript.service";

declare let jsPDF;

@Component({
  selector: 'app-dmv-history',
  templateUrl: './dmv-history.component.html',
  styleUrls: ['./dmv-history.component.scss']
})
export class DmvHistoryComponent implements OnInit {

  dmvHistoryForm: FormGroup;
  sessionContextResponse: IUserresponse;
  iDMVDetails: IDMVDetails = <IDMVDetails>{};

  result: boolean = false;

  validatePlatePattern = "^[A-Za-z0-9]+$";

  errorMessage: string;
  errorBlock: boolean;

  @ViewChild('generate') el: ElementRef;

  constructor(
    private sessionContext: SessionService,
    private router: Router,
    private violatorAccountsService: ViolatorAccountsService,
     private materialscriptService: MaterialscriptService
  ) {
    this.sessionContextResponse = this.sessionContext.customerContext;
  }

  ngOnInit() {
 this.materialscriptService.material();
    this.dmvHistoryForm = new FormGroup({
      'PlateNo': new FormControl('', [Validators.required, Validators.pattern(this.validatePlatePattern)]),
    });

  }

  onSubmit() {
    if (this.dmvHistoryForm.valid) {

      // this.iDMVDetails.Address = "Address";
      // this.iDMVDetails.Name = "Suresh";
      // this.iDMVDetails.PlateNumber = "AP22AP4444";
      // this.iDMVDetails.PurchaseDate = new Date();
      // this.iDMVDetails.RegistrationExpiration = new Date();
      // this.iDMVDetails.ReqEmpID = 0;
      // this.iDMVDetails.VehicleIdentification = "VVRRSEW2343SSDDD";
      // this.iDMVDetails.VehicleMake = "AUDI";
      // this.iDMVDetails.VehicleModel = "Model";
      // this.iDMVDetails.VehicleType = "AUDI A2";
      // this.iDMVDetails.VehicleYear = "2017";

      this.iDMVDetails = <IDMVDetails>{};

      let plateNumber: string = this.dmvHistoryForm.controls['PlateNo'].value;

      this.violatorAccountsService.getDMVDetailsBaseOnVehicleNumber(plateNumber).subscribe(res => {

        if (res) {
          if(res !== null)
          {
            this.iDMVDetails = res;
            this.result = true;
          }
        }

      }, (err) => {
        this.result = false;
        this.errorBlock = true;
        this.errorMessage = "Internal Server Error";
        return;
      });

    }
    else {
      this.result = false;
      this.errorBlock = true;
      this.errorMessage = "Plate # is required";
      return;
    }
  }

  resetSearch() {
    this.result = false;
    this.dmvHistoryForm.reset();
    this.errorBlock = false;
  }

  public GeneratePdf() {
    let pdf = new jsPDF('l', 'pt', 'a4');
    let options = {
      pagesplit: true,
      format: "PNG",
      background: "#fff"
    };

    pdf.addHTML(this.el.nativeElement, 0, 0, options, () => {
      pdf.save("DMVDetails.pdf");
    });
  }

}
