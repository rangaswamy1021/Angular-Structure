import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RefundContextService } from './services/RefundContextService';
import { IRefundProcess } from './models/RefundProcess';

declare let jsPDF; 

@Component({
  selector: 'app-customer-refund-form',
  templateUrl: './customer-refund-form.component.html',
  styleUrls: ['./customer-refund-form.component.scss']
})
export class CustomerRefundFormComponent implements OnInit {

  @ViewChild('generate') el: ElementRef; 

  constructor(private refundContextService: RefundContextService) { }

  iRefundProcess: IRefundProcess[] = <IRefundProcess[]>[];

  ngOnInit() {
    this.iRefundProcess = this.refundContextService.getRefund();
  }

  public GeneratePdf() {
    let pdf = new jsPDF('l', 'pt', 'a4');
    let options = {
      pagesplit: true,
      format:"PNG",
      background:"#fff"
    }; 
 
    pdf.addHTML(this.el.nativeElement, 0, 0, options, () => {
      pdf.save("CustomerRefundForm.pdf");
    });
  }

}
