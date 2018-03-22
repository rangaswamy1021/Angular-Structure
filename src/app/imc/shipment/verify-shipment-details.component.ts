import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-verify-shipment-details',
  templateUrl: './verify-shipment-details.component.html',
  styleUrls: ['./verify-shipment-details.component.scss']
})
export class VerifyShipmentDetailsComponent implements OnInit {

  constructor(private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
  }

}
