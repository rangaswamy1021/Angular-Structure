import { Component, OnInit } from '@angular/core';
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-add-bank-details',
  templateUrl: './add-bank-details.component.html',
  styleUrls: ['./add-bank-details.component.scss']
})
export class AddBankDetailsComponent implements OnInit {

  constructor(private materialscriptService: MaterialscriptService) { }

  ngOnInit() {
      this.materialscriptService.material();
  }

}
