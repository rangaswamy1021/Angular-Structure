import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup,FormControl,Validators,ReactiveFormsModule  } from "@angular/forms";
import { MaterialscriptService } from "../../shared/materialscript.service";

@Component({
  selector: 'app-contract-search',
  templateUrl: './contract-search.component.html',
  styleUrls: ['./contract-search.component.scss']
})
export class ContractSearchComponent implements OnInit {
 contractSearchForm: FormGroup;
  constructor(private router:Router, private materialscriptService:MaterialscriptService) { }

  ngOnInit() {
    this.materialscriptService.material();
     this.contractSearchForm = new FormGroup({
      'ContractId': new FormControl('', [Validators.required]),
      'ContractName': new FormControl('', [Validators.required]),
      'ContractStatus': new FormControl('', ),
    });
  }
  searchContract():void{

  }
  addContract():void{
    this.router.navigateByUrl('imc/contract/add-contract');
  }
   resetclick() {
    this.contractSearchForm.reset();
  }

}
